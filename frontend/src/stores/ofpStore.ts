import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAOCStore } from './aocStore';

export type WaypointType = 'apt' | 'vor' | 'ndb' | 'fix' | 'ltlg' | 'unknown';

export interface Waypoint {
    ident: string;
    lat: number;
    lng: number;
    type: WaypointType;   // parsed from SimBrief <type> tag
    airway: string;       // parsed from SimBrief <via_airway> tag, e.g. "L9" | "DCT"
}

export interface OFPData {
    route: string;
    departure: string;
    arrival: string;
    alternate: string;
    fuel: number;
    aircraftType: string;
    textOFP: string;
    pax: number;
    zfw: number;
    tow: number;
    waypoints: Waypoint[];
}

const typeMap: Record<string, WaypointType> = {
    apt: 'apt', vor: 'vor', ndb: 'ndb',
    fix: 'fix', wpt: 'fix', ltlg: 'ltlg',
};

interface OFPStoreState {
    data: OFPData | null;
    isLoading: boolean;
    error: string | null;
    fetchOFP: (simbriefId: string) => Promise<void>;
}

export const useOFPStore = create<OFPStoreState>()(
    persist(
        (set) => ({
            data: null,
            isLoading: false,
            error: null,
            fetchOFP: async (simbriefId: string) => {
                if (!simbriefId) {
                    set({ error: 'No SimBrief ID configured', isLoading: false });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const response = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?userid=${encodeURIComponent(simbriefId)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const text = await response.text();
                    
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "text/xml");
                    
                    const fetchStatus = xmlDoc.getElementsByTagName("fetch_status")[0]?.textContent;
                    if (fetchStatus === 'Error') {
                        const fetchError = xmlDoc.getElementsByTagName("fetch_error")[0]?.textContent || 'Unknown SimBrief Error';
                        throw new Error(`SimBrief Error: ${fetchError}`);
                    }

                    const origin = xmlDoc.getElementsByTagName("origin")[0]?.getElementsByTagName("icao_code")[0]?.textContent || '';
                    const dest = xmlDoc.getElementsByTagName("destination")[0]?.getElementsByTagName("icao_code")[0]?.textContent || '';
                    const altn = xmlDoc.getElementsByTagName("alternate")[0]?.getElementsByTagName("icao_code")[0]?.textContent || '';
                    const route = xmlDoc.getElementsByTagName("general")[0]?.getElementsByTagName("route")[0]?.textContent || '';
                    const fuel = parseFloat(xmlDoc.getElementsByTagName("fuel")[0]?.getElementsByTagName("plan_ramp")[0]?.textContent || '0');
                    const aircraft = xmlDoc.getElementsByTagName("aircraft")[0]?.getElementsByTagName("icaocode")[0]?.textContent || '';
                    
                    // Extract Human-Readable Text OFP
                    let textOFP = xmlDoc.getElementsByTagName("plan_html")[0]?.textContent || '';
                    if (!textOFP) {
                        // Fallback
                        textOFP = xmlDoc.getElementsByTagName("plan_text")[0]?.textContent || 'No textual OFP available.';
                    }

                    // Extract Waypoints for Map Route
                    const waypoints: Waypoint[] = [];
                    const fixes = xmlDoc.getElementsByTagName("navlog")[0]?.getElementsByTagName("fix");
                    if (fixes) {
                        for (let i = 0; i < fixes.length; i++) {
                            const fix = fixes[i];
                            const ident = fix.getElementsByTagName("ident")[0]?.textContent || 'UKN';
                            const latStr = fix.getElementsByTagName("pos_lat")[0]?.textContent;
                            const lngStr = fix.getElementsByTagName("pos_long")[0]?.textContent;
                            const rawType  = fix.getElementsByTagName('type')[0]?.textContent?.toLowerCase() ?? '';
                            const wpType: WaypointType = typeMap[rawType] ?? 'unknown';
                            const airway = fix.getElementsByTagName('via_airway')[0]?.textContent?.trim() || 'DCT';

                            if (latStr && lngStr) {
                                waypoints.push({
                                    ident,
                                    lat: parseFloat(latStr),
                                    lng: parseFloat(lngStr),
                                    type: wpType,
                                    airway,
                                });
                            }
                        }
                    }

                    const weightsNode = xmlDoc.getElementsByTagName("weights")[0];
                    const paxStr = weightsNode?.getElementsByTagName("pax_count")[0]?.textContent || '0';
                    const zfwStr = weightsNode?.getElementsByTagName("est_zfw")[0]?.textContent || '0';
                    const towStr = weightsNode?.getElementsByTagName("est_tow")[0]?.textContent || '0';

                    // Dispatch Final Loadsheet to AOC
                    useAOCStore.getState().addEvent({
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                        title: 'Final Loadsheet',
                        message: `FLIGHT: ${origin}-${dest}\nAIRCRAFT: ${aircraft}\nPAX: ${paxStr}\n\nZFW: ${zfwStr} lbs/kgs\nBLOCK FUEL: ${fuel} lbs/kgs\nTOW: ${towStr} lbs/kgs\n\nSTATUS: FINAL\nCLEAR TO START, DISPATCH OUT.`,
                        type: 'info'
                    });

                    set({
                        data: {
                            departure: origin,
                            arrival: dest,
                            alternate: altn,
                            route: route,
                            fuel: fuel,
                            aircraftType: aircraft,
                            textOFP: textOFP,
                            pax: parseInt(paxStr, 10) || 0,
                            zfw: parseFloat(zfwStr) || 0,
                            tow: parseFloat(towStr) || 0,
                            waypoints: waypoints
                        },
                        isLoading: false,
                        error: null
                    });

                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch OFP';
                    set({ error: message, isLoading: false });
                }
            }
        }),
        {
            name: 'xpad-ofp-storage',
            partialize: (state) => ({ data: state.data })
        }
    )
);
