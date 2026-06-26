import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFlightStore } from '../../store';
import { useOFPStore, type Waypoint } from '../../stores/ofpStore';
import { Navigation, MapPin } from 'lucide-react';

// ── External data ─────────────────────────────────────────────────────────────
const VATSIM_DATA_URL = 'https://data.vatsim.net/v3/vatsim-data.json';
const BOUNDARIES_URL  = 'https://raw.githubusercontent.com/vatsimnetwork/vatspy-data-project/master/Boundaries.geojson';
const VATSPY_DAT_URL  = 'https://raw.githubusercontent.com/vatsimnetwork/vatspy-data-project/master/VATSpy.dat';
const VATSIM_POLL_MS  = 60_000;

// ── ATC facility constants ────────────────────────────────────────────────────
// Only facilities that have geographic airspace (skip OBS/DEL/GND)
const ATC_ZONE_FACILITIES = new Set([1, 4, 5, 6]); // FSS, TWR, APP, CTR

const FAC_COLOR: Record<number, string> = {
    6: '#3b82f6', // CTR → Accent Blue
    5: '#f97316', // APP → Accent Orange
    4: '#22c55e', // TWR → Accent Green
    1: '#a855f7', // FSS → Accent Purple
};
const FAC_LABEL: Record<number, string> = {
    6: 'CTR', 5: 'APP', 4: 'TWR', 1: 'FSS',
};

// ── Local types ───────────────────────────────────────────────────────────────
interface VatsimPilot {
    callsign: string;
    latitude: number;
    longitude: number;
    altitude: number;
    groundspeed: number;
    heading: number;
}

interface VatsimController {
    callsign: string;
    facility: number;
    frequency: string;
    name: string;
}

interface ActiveCtrl {
    facility: number;
    callsign: string;
    frequency: string;
    firId?: string;
    lat?: number;
    lon?: number;
}

// Minimal GeoJSON types (fully covered by @types/geojson → @types/leaflet)
interface BoundaryProps {
    id: string;
    label_lat: string;
    label_lon: string;
    [k: string]: unknown;
}
interface BoundaryFeature extends GeoJSON.Feature {
    properties: BoundaryProps;
}
interface BoundaryCollection {
    type: 'FeatureCollection';
    features: BoundaryFeature[];
}

// ── Aircraft SVG ──────────────────────────────────────────────────────────────
function aircraftIcon(heading: number, isOwn = false): L.DivIcon {
    const size   = isOwn ? 32 : 22;
    const color  = '#3b82f6';
    const stroke = isOwn ? '#000000' : '#111111';
    const sw     = isOwn ? 1.5 : 1;

    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <g transform="rotate(${heading},12,12)">
    <path d="M21,16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1 3.5,1v-1.5L13,19v-5.5L21,16z" fill="${color}" stroke="${stroke}" stroke-width="${sw}" />
  </g>
</svg>`,
        className: '',
        iconSize:   [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

// ── Per-type waypoint SVG icons ───────────────────────────────────────────────
function waypointIcon(type: Waypoint['type']): L.DivIcon {
    const configs: Record<Waypoint['type'], { size: number; html: string }> = {
        apt: {
            size: 16,
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <circle cx="8" cy="8" r="5.5" fill="none" stroke="#22c55e" stroke-width="1.5"/>
  <line x1="8" y1="2.5" x2="8" y2="13.5" stroke="#22c55e" stroke-width="1" opacity="0.7"/>
  <line x1="2.5" y1="8" x2="13.5" y2="8" stroke="#22c55e" stroke-width="1" opacity="0.7"/>
</svg>`,
        },
        vor: {
            size: 14,
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
  <polygon points="7,1.5 12,4.5 12,9.5 7,12.5 2,9.5 2,4.5" fill="none" stroke="#a855f7" stroke-width="1.5"/>
  <circle cx="7" cy="7" r="1.5" fill="#a855f7"/>
</svg>`,
        },
        ndb: {
            size: 12,
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
  <polygon points="6,1 11,6 6,11 1,6" fill="none" stroke="#ef4444" stroke-width="1.5"/>
  <circle cx="6" cy="6" r="1" fill="#ef4444"/>
</svg>`,
        },
        fix: {
            size: 10,
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
  <polygon points="5,1 9,9 1,9" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
</svg>`,
        },
        ltlg: {
            size: 10,
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
  <polygon points="5,1 9,9 1,9" fill="none" stroke="#0ea5e9" stroke-width="1.5"/>
</svg>`,
        },
        unknown: {
            size: 10,
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
  <polygon points="5,1 9,9 1,9" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
</svg>`,
        },
    };

    const { size, html } = configs[type] ?? configs.fix;
    return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

// ── ATC zone style helper ─────────────────────────────────────────────────────
function zoneStyle(
    feature: GeoJSON.Feature | undefined,
    active: Map<string, ActiveCtrl>,
): L.PathOptions {
    const fir  = feature?.properties?.id as string | undefined;
    // active is now keyed by callsign prefix. Find if any active CTR has firId matching this polygon
    let ctrl: ActiveCtrl | undefined;
    if (fir) {
        for (const c of active.values()) {
            if ((c.facility === 6 || c.facility === 5) && c.firId === fir) {
                ctrl = c;
                break;
            }
        }
    }
    
    if (!ctrl) {
        return { fillOpacity: 0, color: 'rgba(255,255,255,0.1)', weight: 0.4, opacity: 0.2 };
    }
    const color = FAC_COLOR[ctrl.facility] ?? '#3b82f6';
    return {
        color,
        weight:      ctrl.facility === 6 ? 1.5 : 1.2,
        opacity:     0.75,
        fillColor:   color,
        fillOpacity: ctrl.facility === 6 ? 0.09 : 0.12,
    };
}

// ── Tooltip HTML helpers ──────────────────────────────────────────────────────
const TOOLTIP_STYLE = 'font-family:monospace;font-size:11px;line-height:1.65';

function pilotTooltip(p: VatsimPilot): string {
    return `<div style="${TOOLTIP_STYLE}"><b>${p.callsign}</b><br/>
        ALT: ${p.altitude.toLocaleString()} ft<br/>
        HDG: ${p.heading}°&nbsp;&nbsp;GS: ${p.groundspeed} kt</div>`;
}

function waypointTooltip(wp: Waypoint): string {
    const via = wp.airway && wp.airway !== 'DCT' && wp.airway !== 'DIRECT'
        ? `<br/><span style="color:rgba(255,255,255,0.5);font-size:10px">via ${wp.airway}</span>` : '';
    return `<div style="${TOOLTIP_STYLE};text-align:center"><b>${wp.ident}</b>${via}</div>`;
}

function atcPopup(fir: string, ctrl: ActiveCtrl): string {
    const color = FAC_COLOR[ctrl.facility] ?? '#3b82f6';
    const label = FAC_LABEL[ctrl.facility] ?? '';
    return `<div style="${TOOLTIP_STYLE};min-width:150px">
        <b style="font-size:13px">${ctrl.callsign}</b><br/>
        <span style="color:rgba(255,255,255,0.5)">FIR: ${fir}&nbsp;&nbsp;${label}</span><br/>
        <span style="color:${color}">▶ ${ctrl.frequency} MHz</span>
    </div>`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const MapModule: React.FC = () => {

    // ── Leaflet object refs ─────────────────────────────────────────────────
    const mapRef             = useRef<L.Map | null>(null);
    const mapContainerRef    = useRef<HTMLDivElement>(null);
    const aircraftMarkerRef  = useRef<L.Marker | null>(null);
    const routePolylineRef   = useRef<L.Polyline | null>(null);
    const waypointMarkersRef = useRef<L.Marker[]>([]);
    const vatsimMarkersRef   = useRef<L.Marker[]>([]);
    const atcZoneLayerRef    = useRef<L.GeoJSON | null>(null);
    const atcLabelMarkersRef = useRef<L.Marker[]>([]);
    const vatsimTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
    const followModeRef      = useRef(true);
    const followBtnRef       = useRef<HTMLButtonElement | null>(null);

    // ── Cached data refs ────────────────────────────────────────────────────
    const boundaryDataRef = useRef<BoundaryCollection | null>(null);
    const vatspyDataRef   = useRef<{ firs: Map<string, string>, airports: Map<string, [number, number]> } | null>(null);
    const activeCtrlRef   = useRef<Map<string, ActiveCtrl>>(new Map());
    const flightDataRef   = useRef(useFlightStore.getState());
    const ofpDataRef      = useRef(useOFPStore.getState().data);

    // ── Layer visibility: state → UI, ref → Leaflet callbacks ───────────────
    const [layers, setLayers] = useState({ traffic: true, atcZones: true, route: true });
    const layersRef = useRef(layers);
    useEffect(() => { layersRef.current = layers; }, [layers]);

    // OFP data subscribed for React UI (airport zoom buttons)
    const ofpData = useOFPStore(s => s.data);

    // ── Toggle layer visibility ─────────────────────────────────────────────
    const toggleLayer = useCallback((key: keyof typeof layers) => {
        setLayers(prev => {
            const next = { ...prev, [key]: !prev[key] };
            const map  = mapRef.current;
            if (!map) return next;

            if (key === 'traffic') {
                vatsimMarkersRef.current.forEach(m => next.traffic ? m.addTo(map) : m.remove());
            }
            if (key === 'atcZones') {
                if (atcZoneLayerRef.current) {
                    next.atcZones ? atcZoneLayerRef.current.addTo(map) : atcZoneLayerRef.current.remove();
                }
                atcLabelMarkersRef.current.forEach(m => next.atcZones ? m.addTo(map) : m.remove());
            }
            if (key === 'route') {
                if (routePolylineRef.current) {
                    next.route ? routePolylineRef.current.addTo(map) : routePolylineRef.current.remove();
                }
                waypointMarkersRef.current.forEach(m => next.route ? m.addTo(map) : m.remove());
            }
            return next;
        });
    }, []);

    // ── Aircraft position ───────────────────────────────────────────────────
    const updateAircraftPosition = useCallback(() => {
        const { latitude, longitude, heading } = flightDataRef.current;
        if (!mapRef.current || (latitude === 0 && longitude === 0)) return;

        const pos: L.LatLngExpression = [latitude, longitude];

        if (!aircraftMarkerRef.current) {
            aircraftMarkerRef.current = L.marker(pos, {
                icon: aircraftIcon(heading, true),
                zIndexOffset: 1000,
            }).addTo(mapRef.current);
        } else {
            aircraftMarkerRef.current.setLatLng(pos);
            aircraftMarkerRef.current.setIcon(aircraftIcon(heading, true));
        }

        if (followModeRef.current) {
            mapRef.current.panTo(pos, { animate: true, duration: 0.5 });
        }
    }, []);

    // ── Draw OFP route with typed waypoint icons ────────────────────────────
    const drawRoute = useCallback((waypoints: Waypoint[]) => {
        if (!mapRef.current) return;

        // Clear previous route
        routePolylineRef.current?.remove();
        routePolylineRef.current = null;
        waypointMarkersRef.current.forEach(m => m.remove());
        waypointMarkersRef.current = [];

        if (waypoints.length < 2) return;

        const map    = mapRef.current;
        const latlngs = waypoints.map(w => [w.lat, w.lng] as L.LatLngExpression);

        routePolylineRef.current = L.polyline(latlngs, {
            color: '#3b82f6', weight: 1.5, opacity: 0.55, dashArray: '7 5',
        });

        for (const wp of waypoints) {
            const wpType = wp.type ?? 'fix';
            const m = L.marker([wp.lat, wp.lng], {
                icon: waypointIcon(wpType),
                zIndexOffset: 500,
            });
            m.bindTooltip(waypointTooltip(wp), {
                permanent: false,
                sticky: false,
                className: 'xpad-tooltip',
                direction: 'top',
                offset: [0, -8],
            });
            waypointMarkersRef.current.push(m);
        }

        // Respect current layer toggle state
        if (layersRef.current.route) {
            routePolylineRef.current.addTo(map);
            waypointMarkersRef.current.forEach(m => m.addTo(map));
        }
    }, []);

    // ── VATSIM fetch: pilots + controllers + ATC zones ──────────────────────
    const fetchAndRenderVatsim = useCallback(async () => {
        if (!mapRef.current) return;

        try {
            // Fetch VATSIM live data, and (once) boundary + VATSpy dat
            const [json, geoRaw, vatspyRaw] = await Promise.all([
                fetch(VATSIM_DATA_URL).then(r => r.json()),
                boundaryDataRef.current ? Promise.resolve(null) : fetch(BOUNDARIES_URL).then(r => r.json()),
                vatspyDataRef.current   ? Promise.resolve(null) : fetch(VATSPY_DAT_URL).then(r => r.text()),
            ]);

            if (!mapRef.current) return;

            if (geoRaw) boundaryDataRef.current = geoRaw as BoundaryCollection;
            if (vatspyRaw && !vatspyDataRef.current) {
                const lines = vatspyRaw.split(/\r?\n/);
                const firs = new Map<string, string>();
                const airports = new Map<string, [number, number]>();
                let section = '';
                for (const line of lines) {
                    if (line.startsWith('[')) section = line.trim();
                    else if (line && !line.startsWith(';')) {
                        const parts = line.split('|');
                        if (section === '[FIRs]' && parts.length >= 4) {
                            firs.set(parts[2], parts[3]);
                        } else if (section === '[Airports]' && parts.length >= 4) {
                            airports.set(parts[0], [parseFloat(parts[2]), parseFloat(parts[3])]);
                        }
                    }
                }
                vatspyDataRef.current = { firs, airports };
            }

            // ── 1. VATSIM Pilots (No Viewport Filtering) ─────────────────────
            const visible = (json.pilots ?? []) as VatsimPilot[];

            vatsimMarkersRef.current.forEach(m => m.remove());
            vatsimMarkersRef.current = [];

            if (layersRef.current.traffic) {
                for (const pilot of visible) {
                    const m = L.marker([pilot.latitude, pilot.longitude], {
                        icon: aircraftIcon(pilot.heading, false),
                        zIndexOffset: 100,
                    }).addTo(mapRef.current!);
                    m.bindTooltip(pilotTooltip(pilot), { sticky: true, className: 'xpad-tooltip' });
                    vatsimMarkersRef.current.push(m);
                }
            }

            // ── 2. Active ATC controllers → FIR map ──────────────────────────
            const controllers = (json.controllers ?? []) as VatsimController[];
            const newActive   = new Map<string, ActiveCtrl>();
            const vatspyData  = vatspyDataRef.current!;

            for (const ctrl of controllers) {
                if (!ATC_ZONE_FACILITIES.has(ctrl.facility)) continue;
                const prefix   = ctrl.callsign.split('_')[0];
                const existing = newActive.get(prefix);
                
                if (!existing || ctrl.facility > existing.facility) {
                    newActive.set(prefix, {
                        facility:  ctrl.facility,
                        callsign:  ctrl.callsign,
                        frequency: ctrl.frequency,
                        firId:     vatspyData.firs.get(prefix) || prefix,
                        lat:       vatspyData.airports.get(prefix)?.[0],
                        lon:       vatspyData.airports.get(prefix)?.[1],
                    });
                }
            }

            activeCtrlRef.current = newActive;

            // ── 3. ATC zone polygon layer ────────────────────────────────────
            const boundaries = boundaryDataRef.current;
            if (boundaries && mapRef.current) {
                if (!atcZoneLayerRef.current) {
                    // Create GeoJSON layer once; subsequent polls just restyle it
                    atcZoneLayerRef.current = L.geoJSON(
                        boundaries as unknown as GeoJSON.GeoJsonObject,
                        {
                            style: (feat) => zoneStyle(feat, activeCtrlRef.current),
                            onEachFeature: (feature, layer) => {
                                const fid = feature.properties?.id as string;

                                layer.on('mouseover', () => {
                                    // Check if this polygon is active
                                    const c = Array.from(activeCtrlRef.current.values()).find(x => (x.facility === 6 || x.facility === 5) && x.firId === fid);
                                    if (c) (layer as L.Path).setStyle({ fillOpacity: 0.18, weight: 2 });
                                });
                                layer.on('mouseout', () => {
                                    atcZoneLayerRef.current?.resetStyle(layer as L.Path);
                                });
                                layer.on('click', (e: L.LeafletMouseEvent) => {
                                    const ctrl = Array.from(activeCtrlRef.current.values()).find(x => (x.facility === 6 || x.facility === 5) && x.firId === fid);
                                    if (!ctrl || !mapRef.current) return;
                                    L.popup({ className: 'xpad-popup' })
                                        .setLatLng(e.latlng)
                                        .setContent(atcPopup(fid, ctrl))
                                        .openOn(mapRef.current);
                                });
                            },
                        }
                    );
                    if (layersRef.current.atcZones && mapRef.current) {
                        atcZoneLayerRef.current.addTo(mapRef.current);
                    }
                } else {
                    // Efficiently restyle existing layer — no DOM teardown
                    atcZoneLayerRef.current.setStyle((feat) =>
                        zoneStyle(feat, activeCtrlRef.current)
                    );
                }
            }

            // ── 4. ATC FIR label markers & APP/TWR ──────────────────────────────
            atcLabelMarkersRef.current.forEach(m => m.remove());
            atcLabelMarkersRef.current = [];

            if (layersRef.current.atcZones && mapRef.current) {
                for (const [prefix, ctrl] of newActive) {
                    let lat = ctrl.lat;
                    let lng = ctrl.lon;
                    
                    if (ctrl.facility === 6 && boundaries) {
                        const feat = boundaries.features.find(f => f.properties.id === ctrl.firId);
                        if (feat) {
                            lat = parseFloat(feat.properties.label_lat);
                            lng = parseFloat(feat.properties.label_lon);
                        }
                    }

                    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) continue;

                    const color = FAC_COLOR[ctrl.facility] ?? '#3b82f6';
                    const label = FAC_LABEL[ctrl.facility] ?? '';

                    const labelMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            html: `<div style="
                                font-family:monospace;font-size:9px;font-weight:700;letter-spacing:.06em;
                                color:${color};background:rgba(0,0,0,0.4);backdrop-filter:blur(10px);
                                border:1px solid ${color}55;border-radius:3px;
                                padding:2px 5px;white-space:nowrap;pointer-events:none;
                                text-transform:uppercase;line-height:1.2;text-align:center;
                            ">${prefix} <span style="opacity:.55">${label}</span><br/><span style="font-size:8px;opacity:0.8">${ctrl.frequency}</span></div>`,
                            className: '',
                            iconSize:   [64, 24],
                            iconAnchor: [32, 12],
                        }),
                        interactive: false,
                        zIndexOffset: 200,
                    }).addTo(mapRef.current!);

                    atcLabelMarkersRef.current.push(labelMarker);
                }
            }

        } catch {
            // Silently fail — network may be unavailable
        }
    }, []);

    // ── Airport zoom (snaps to dep/arr at zoom 14 → OSM shows taxiways) ─────
    const flyToAirport = useCallback((which: 'dep' | 'arr') => {
        if (!mapRef.current) return;
        const wps = useOFPStore.getState().data?.waypoints;
        if (!wps || wps.length === 0) return;

        const wp = which === 'dep' ? wps[0] : wps[wps.length - 1];
        followModeRef.current = false;
        if (followBtnRef.current) followBtnRef.current.dataset.active = 'false';
        mapRef.current.setView([wp.lat, wp.lng], 14, { animate: true, duration: 1.2 });
    }, []);

    // ── Follow aircraft toggle ───────────────────────────────────────────────
    const toggleFollow = useCallback(() => {
        followModeRef.current = !followModeRef.current;
        if (followBtnRef.current) followBtnRef.current.dataset.active = String(followModeRef.current);
        if (followModeRef.current && mapRef.current) {
            const { latitude, longitude } = flightDataRef.current;
            if (latitude !== 0) mapRef.current.panTo([latitude, longitude], { animate: true });
        }
    }, []);

    // ── Map init + Zustand subscriptions ────────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [47.45, -122.31],
            zoom: 8,
            zoomControl: true,
        });
        mapRef.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
        }).addTo(map);

        map.on('dragstart', () => {
            followModeRef.current = false;
            if (followBtnRef.current) followBtnRef.current.dataset.active = 'false';
        });

        const unsubFlight = useFlightStore.subscribe(state => {
            flightDataRef.current = state;
            updateAircraftPosition();
        });

        const unsubOFP = useOFPStore.subscribe(state => {
            ofpDataRef.current = state.data;
            if (state.data?.waypoints) drawRoute(state.data.waypoints);
        });

        // Render any pre-existing OFP route
        const existing = useOFPStore.getState().data?.waypoints;
        if (existing && existing.length >= 2) {
            drawRoute(existing);
            const bounds = L.latLngBounds(existing.map(w => [w.lat, w.lng] as L.LatLngExpression));
            map.fitBounds(bounds, { padding: [40, 40] });
        }

        updateAircraftPosition();
        void fetchAndRenderVatsim();
        vatsimTimerRef.current = setInterval(() => void fetchAndRenderVatsim(), VATSIM_POLL_MS);

        return () => {
            unsubFlight();
            unsubOFP();
            if (vatsimTimerRef.current) clearInterval(vatsimTimerRef.current);
            vatsimMarkersRef.current.forEach(m => m.remove());
            vatsimMarkersRef.current = [];
            atcLabelMarkersRef.current.forEach(m => m.remove());
            atcLabelMarkersRef.current = [];
            atcZoneLayerRef.current?.remove();
            atcZoneLayerRef.current = null;
            waypointMarkersRef.current.forEach(m => m.remove());
            waypointMarkersRef.current = [];
            routePolylineRef.current?.remove();
            routePolylineRef.current = null;
            aircraftMarkerRef.current?.remove();
            aircraftMarkerRef.current = null;
            map.off();
            map.remove();
            mapRef.current = null;
        };
    }, [updateAircraftPosition, fetchAndRenderVatsim, drawRoute]);

    // ── Layer toggle pill config ─────────────────────────────────────────────
    const layerPills = [
        { key: 'traffic'  as const, label: 'Traffic',   color: '#3b82f6' },
        { key: 'atcZones' as const, label: 'ATC Zones', color: '#3b82f6' },
        { key: 'route'    as const, label: 'Route',     color: '#3b82f6' },
    ];

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="relative w-full h-full bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] overflow-hidden shadow-2xl">

            {/* ── Map canvas ─────────────────────────────────────────────── */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* ── Top-right: Follow + Airport zoom ──────────────────────── */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                    ref={followBtnRef}
                    onClick={toggleFollow}
                    data-active="true"
                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.03]/90 backdrop-blur-sm border border-white/[0.05] text-text-primary text-xs font-bold uppercase rounded-md shadow-lg hover:bg-white/[0.05] transition-colors"
                >
                    <Navigation className="w-3.5 h-3.5 text-accent-blue" />
                    Follow
                </button>

                {ofpData && (
                    <>
                        <button
                            onClick={() => flyToAirport('dep')}
                            className="flex items-center gap-2 px-3 py-2 bg-white/[0.03]/90 backdrop-blur-sm border border-accent-green/40 text-accent-green text-xs font-bold rounded-md shadow-lg hover:bg-white/[0.05] transition-colors"
                            title={`Zoom to departure: ${ofpData.departure}`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            DEP {ofpData.departure}
                        </button>
                        <button
                            onClick={() => flyToAirport('arr')}
                            className="flex items-center gap-2 px-3 py-2 bg-white/[0.03]/90 backdrop-blur-sm border border-accent-blue/40 text-accent-blue text-xs font-bold rounded-md shadow-lg hover:bg-white/[0.05] transition-colors"
                            title={`Zoom to arrival: ${ofpData.arrival}`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            ARR {ofpData.arrival}
                        </button>
                    </>
                )}
            </div>

            {/* ── Bottom-left: Layer toggles ─────────────────────────────── */}
            <div className="absolute bottom-4 left-4 z-[9999] bg-white/[0.03]/90 backdrop-blur-sm border border-white/[0.05] rounded-md p-3 flex flex-col gap-2 min-w-[120px] shadow-xl">
                <p className="text-[9px] font-bold tracking-widest uppercase text-text-secondary/70 mb-0.5">Layers</p>
                {layerPills.map(({ key, label, color }) => (
                    <button
                        key={key}
                        onClick={() => toggleLayer(key)}
                        className="flex items-center gap-2.5 text-xs font-bold transition-all duration-200 text-left"
                        style={{ opacity: layers[key] ? 1 : 0.35 }}
                    >
                        <span
                            className="w-3 h-3 rounded-sm shrink-0 transition-all duration-200"
                            style={{
                                background: layers[key] ? color : 'transparent',
                                border: `1.5px solid ${color}`,
                                boxShadow: layers[key] ? `0 0 6px ${color}60` : 'none',
                            }}
                        />
                        <span className="text-text-primary">{label}</span>
                    </button>
                ))}
            </div>

            {/* ── Bottom-right: Legend ───────────────────────────────────── */}
            <div className="absolute bottom-4 right-4 z-[9999] bg-white/[0.03]/90 backdrop-blur-sm border border-white/[0.05] rounded-md p-3 flex flex-col gap-1.5 text-[11px] font-bold text-text-secondary shadow-xl">
                <p className="text-[9px] font-bold tracking-widest uppercase text-text-secondary/70 mb-0.5">Legend</p>

                {/* Aircraft */}
                <div className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21,16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1 3.5,1v-1.5L13,19v-5.5L21,16z" fill="#3b82f6"/>
                    </svg>
                    Own Aircraft
                </div>
                <div className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21,16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1 3.5,1v-1.5L13,19v-5.5L21,16z" fill="#3b82f6"/>
                    </svg>
                    VATSIM Traffic
                </div>

                {/* Route waypoints */}
                <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/[0.05]">
                    <div className="w-4 h-0.5" style={{ borderTop: '2px dashed #3b82f6' }} />
                    Route
                </div>
                <div className="flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="5,1 9,9 1,9" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
                    </svg>
                    Fix / WPT
                </div>
                <div className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="7,1.5 12,4.5 12,9.5 7,12.5 2,9.5 2,4.5" fill="none" stroke="#a855f7" strokeWidth="1.5"/>
                    </svg>
                    VOR
                </div>
                <div className="flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="6,1 11,6 6,11 1,6" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
                    </svg>
                    NDB
                </div>
                <div className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="5.5" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
                        <line x1="8" y1="2.5" x2="8" y2="13.5" stroke="#22c55e" strokeWidth="1" opacity="0.7"/>
                        <line x1="2.5" y1="8" x2="13.5" y2="8" stroke="#22c55e" strokeWidth="1" opacity="0.7"/>
                    </svg>
                    Airport
                </div>

                {/* ATC zones */}
                <div className="mt-1 pt-1 border-t border-white/[0.05] flex flex-col gap-1.5">
                    {([
                        { color: '#3b82f6', label: 'CTR Active' },
                        { color: '#f97316', label: 'APP Active' },
                        { color: '#22c55e', label: 'TWR Active' },
                    ] as const).map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-2">
                            <div
                                className="w-4 h-3 rounded-sm"
                                style={{ background: `${color}25`, border: `1.5px solid ${color}` }}
                            />
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Leaflet + tooltip styles ────────────────────────────────── */}
            <style>{`
                .efb-tooltip {
                    background: rgba(0, 0, 0, 0.4) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                    font-family: monospace;
                    font-size: 11px;
                    font-weight: 700;
                    border-radius: 6px;
                    padding: 4px 8px;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.45);
                }
                .efb-tooltip::before { display: none !important; }
                .efb-popup .leaflet-popup-content-wrapper {
                    background: rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                    border-radius: 8px;
                    box-shadow: 0 8px 28px rgba(0,0,0,0.55);
                }
                .efb-popup .leaflet-popup-content { margin: 10px 14px; }
                .efb-popup .leaflet-popup-tip-container { display: none; }
                .efb-popup .leaflet-popup-close-button { color: rgba(255, 255, 255, 0.5) !important; top:6px; right:8px; }
                .leaflet-container { background: #161c24; }
                .leaflet-control-attribution {
                    background: rgba(0,0,0,0.4) !important;
                    backdrop-filter: blur(4px) !important;
                    color: rgba(255, 255, 255, 0.5) !important;
                    font-family: monospace;
                    font-size: 10px;
                }
                .leaflet-control-attribution a { color: #3b82f6 !important; }
                .leaflet-control-zoom a {
                    background: rgba(0, 0, 0, 0.4) !important;
                    backdrop-filter: blur(4px) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                }
                .leaflet-control-zoom a:hover { background: rgba(0, 0, 0, 0.6) !important; }
            `}</style>
        </div>
    );
};
