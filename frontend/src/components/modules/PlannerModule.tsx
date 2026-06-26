import React, { useState } from 'react';
import { Plane, Navigation, Send, RotateCcw, ChevronDown, ChevronUp, Settings2, Layers, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { usePlannerStore } from '../../stores/plannerStore';

// ────────────────────────────────────────────────
// Reusable form primitives
// ────────────────────────────────────────────────

const Field = ({
    label, children, hint, className = ''
}: { label: string; children: React.ReactNode; hint?: string; className?: string }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
            {label}
        </label>
        {children}
        {hint && <span className="text-[10px] font-bold text-text-secondary/70">{hint}</span>}
    </div>
);

const TextInput = ({
    value, onChange, placeholder = '', uppercase = false, maxLength, className = ''
}: {
    value: string; onChange: (v: string) => void;
    placeholder?: string; uppercase?: boolean; maxLength?: number; className?: string;
}) => (
    <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
        placeholder={placeholder}
        className={`bg-white/[0.03] border border-white/[0.05] rounded-md px-3 py-2 text-text-primary text-sm font-bold placeholder:text-text-secondary/70
            focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 transition-all w-full ${className}`}
    />
);

const SelectInput = ({
    value, onChange, options, className = ''
}: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; className?: string;
}) => (
    <div className={`relative ${className}`}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none bg-white/[0.03] border border-white/[0.05] rounded-md px-3 py-2
                text-text-primary text-sm font-bold focus:outline-none focus:border-accent-blue transition-all pr-8 cursor-pointer"
        >
            {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
    </div>
);

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center justify-between gap-4 py-1">
        <span className="text-sm font-bold text-text-primary">{label}</span>
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none
                ${checked ? 'bg-accent-green' : 'bg-white/[0.05]'}`}
        >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
                ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
        </button>
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: string }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-accent-blue/10 rounded-md">
            <Icon className="w-4 h-4 text-accent-blue" />
        </div>
        <div>
            <h2 className="text-base font-bold uppercase tracking-widest text-text-primary">{title}</h2>
            {subtitle && <p className="text-xs font-bold text-text-secondary">{subtitle}</p>}
        </div>
    </div>
);



// ────────────────────────────────────────────────
// Main Module
// ────────────────────────────────────────────────

export const PlannerModule: React.FC = () => {
    const store = usePlannerStore();
    const [optionalOpen, setOptionalOpen] = useState(false);

    const set = (field: Parameters<typeof store.setField>[0]) =>
        (value: string) => store.setField(field, value);

    const handleGenerate = () => {
        const p = store;

        // Build the SimBrief parameter map
        const params: Record<string, string> = {};

        if (p.airline)        params.airline   = p.airline;
        if (p.flightNumber)   params.fltnum    = p.flightNumber;
        if (p.departure)      params.orig      = p.departure;
        if (p.arrival)        params.dest      = p.arrival;
        if (p.alternate)      params.altn      = p.alternate;
        if (p.departureTime)  params.deph      = p.departureTime;
        if (p.aircraftType)   params.type      = p.aircraftType;
        if (p.registration)   params.reg       = p.registration;
        if (p.selcal)         params.selcal    = p.selcal;
        if (p.atcCallsign)    params.callsign  = p.atcCallsign;

        // Profiles
        params.climbprofile   = p.climbProfile;
        params.cruiseprofile  = p.cruiseProfile;
        params.descentprofile = p.descentProfile;

        // Selections
        params.units          = p.units;
        params.flightrules    = p.flightRules === 'IFR' ? 'I' : p.flightRules === 'VFR' ? 'V' : 'D';
        params.flighttype     = p.typeOfFlight === 'Scheduled' ? 'S'
                                : p.typeOfFlight === 'Non-Scheduled' ? 'N'
                                : p.typeOfFlight === 'Private' ? 'G'
                                : 'F';
        params.maps           = p.flightMaps === 'Detailed' ? 'detail'
                                : p.flightMaps === 'Simple' ? 'simple' : 'none';
        params.altncount      = p.alternatesCount;
        params.taxiout        = p.taxiOut;
        params.taxiin         = p.taxiIn;
        if (p.ofpLayout)      params.planformat = p.ofpLayout;

        // Toggles
        params.navlog         = p.detailedNavlog ? '1' : '0';
        params.etops          = p.etops ? '1' : '0';
        params.stepclimbs     = p.stepclimbs ? '1' : '0';
        params.rnav           = p.runwayAnalysis ? '1' : '0';
        params.notams         = p.notams ? '1' : '0';
        params.firnot         = p.firNotams ? '1' : '0';

        // Optional entries
        if (p.altitude && p.altitude !== 'AUTO')         params.fl            = p.altitude;
        if (p.passengers)                                 params.pax           = p.passengers;
        if (p.freight)                                    params.freight       = p.freight;
        if (p.payload)                                    params.payload       = p.payload;
        if (p.zeroFuelWeight && p.zeroFuelWeight !== 'AUTO') params.zfw       = p.zeroFuelWeight;
        if (p.departureRunway !== 'AUTO')                 params.rwyorig       = p.departureRunway;
        if (p.arrivalRunway !== 'AUTO')                   params.rwydest       = p.arrivalRunway;
        if (p.blockTimeHH || p.blockTimeMM) {
            params.blocktime = `${p.blockTimeHH || '0'}:${p.blockTimeMM?.padStart(2, '0') || '00'}`;
        }

        const qs = new URLSearchParams(params).toString();
        window.open(`https://www.simbrief.com/system/dispatch.php?${qs}`, '_blank');
    };

    // ── Profile option lists ─────────────────────────────────────
    const climbOpts = [
        { value: 'AUTO', label: 'AUTO' },
        { value: 'CI0',  label: 'CI 0' },
        { value: 'CI10', label: 'CI 10' },
        { value: 'CI20', label: 'CI 20' },
        { value: 'CI50', label: 'CI 50' },
        { value: 'CI100',label: 'CI 100' },
        { value: 'ECON', label: 'ECON' },
    ];
    const cruiseOpts = [
        { value: 'AUTO', label: 'AUTO' },
        { value: 'LRC',  label: 'LRC' },
        { value: 'M78',  label: 'M .78' },
        { value: 'M80',  label: 'M .80' },
        { value: 'M82',  label: 'M .82' },
        { value: 'M84',  label: 'M .84' },
        { value: 'CI0',  label: 'CI 0' },
        { value: 'CI100',label: 'CI 100' },
        { value: 'ECON', label: 'ECON' },
    ];
    const descentOpts = [
        { value: 'AUTO', label: 'AUTO' },
        { value: 'CI0',  label: 'CI 0' },
        { value: 'CI10', label: 'CI 10' },
        { value: 'CI50', label: 'CI 50' },
        { value: 'ECON', label: 'ECON' },
    ];
    const ofpLayouts = [
        { value: 'LIDO',  label: 'LIDO' },
        { value: 'UAL',   label: 'UAL' },
        { value: 'AAL',   label: 'AAL' },
        { value: 'DAL',   label: 'DAL' },
        { value: 'BAW',   label: 'BAW' },
        { value: 'KLM',   label: 'KLM' },
        { value: 'EZY',   label: 'EZY' },
        { value: 'RYR',   label: 'RYR' },
        { value: 'PFPX',  label: 'PFPX' },
        { value: 'BASIC', label: 'BASIC' },
    ];

    return (
        <div className="w-full h-full font-sans text-text-primary bg-transparent flex flex-col overflow-hidden">
            {/* ── Scrollable body ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pb-8 pt-2 space-y-8">

                {/* ══════════════════════════════════════════════ */}
                {/* SECTION 1 — FLIGHT INFO                        */}
                {/* ══════════════════════════════════════════════ */}
                <section className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-6 relative">
                    <SectionHeader icon={Navigation} title="Flight Info" subtitle="Route, identity & departure time" />

                    {/* Row 1: Airline | Flight Number | Depart | Arrive | Alternate | Dep Time */}
                    <div className="grid grid-cols-6 gap-4">
                        <Field label="Airline (ICAO)">
                            <TextInput
                                value={store.airline}
                                onChange={set('airline')}
                                placeholder="BAW"
                                uppercase
                                maxLength={3}
                            />
                        </Field>
                        <Field label="Flight Number">
                            <TextInput
                                value={store.flightNumber}
                                onChange={set('flightNumber')}
                                placeholder="0001"
                                maxLength={6}
                            />
                        </Field>
                        <Field label="Depart ✈">
                            <TextInput
                                value={store.departure}
                                onChange={set('departure')}
                                placeholder="EGLL"
                                uppercase
                                maxLength={4}
                            />
                        </Field>
                        <Field label="Arrive ✈">
                            <TextInput
                                value={store.arrival}
                                onChange={set('arrival')}
                                placeholder="KJFK"
                                uppercase
                                maxLength={4}
                            />
                        </Field>
                        <Field label="Alternate">
                            <TextInput
                                value={store.alternate}
                                onChange={set('alternate')}
                                placeholder="KBOS"
                                uppercase
                                maxLength={4}
                            />
                        </Field>
                        <Field label="Departure Time (EOBT)" hint="HHMM or leave blank">
                            <TextInput
                                value={store.departureTime}
                                onChange={set('departureTime')}
                                placeholder="1415"
                                maxLength={4}
                            />
                        </Field>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════ */}
                {/* SECTION 2 — AIRCRAFT INFO                      */}
                {/* ══════════════════════════════════════════════ */}
                <section className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-6">
                    <SectionHeader icon={Settings2} title="Aircraft Info" subtitle="Type, registration, performance profiles & SELCAL" />

                    {/* Row 1: Type | ATC Callsign | Registration | SELCAL */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <Field label="Aircraft Type (ICAO)">
                            <TextInput
                                value={store.aircraftType}
                                onChange={set('aircraftType')}
                                placeholder="A320"
                                uppercase
                                maxLength={4}
                            />
                        </Field>
                        <Field label="ATC Callsign">
                            <TextInput
                                value={store.atcCallsign}
                                onChange={set('atcCallsign')}
                                placeholder="SPEEDBIRD1"
                                uppercase
                            />
                        </Field>
                        <Field label="Registration" hint="e.g. G-EUUU or N123AB">
                            <TextInput
                                value={store.registration}
                                onChange={set('registration')}
                                placeholder="G-EUUU"
                                uppercase
                            />
                        </Field>
                        <Field label="SELCAL" hint="e.g. AB-CD">
                            <TextInput
                                value={store.selcal}
                                onChange={set('selcal')}
                                placeholder="AB-CD"
                                uppercase
                                maxLength={5}
                            />
                        </Field>
                    </div>

                    {/* Row 2: Climb | Cruise | Descent */}
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Climb Profile">
                            <SelectInput value={store.climbProfile} onChange={set('climbProfile')} options={climbOpts} />
                        </Field>
                        <Field label="Cruise Profile">
                            <SelectInput value={store.cruiseProfile} onChange={set('cruiseProfile')} options={cruiseOpts} />
                        </Field>
                        <Field label="Descent Profile">
                            <SelectInput value={store.descentProfile} onChange={set('descentProfile')} options={descentOpts} />
                        </Field>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════ */}
                {/* SECTION 3 — SELECTIONS                         */}
                {/* ══════════════════════════════════════════════ */}
                <section className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-6">
                    <SectionHeader icon={Layers} title="Selections" subtitle="OFP options, units, and planning toggles" />

                    <div className="grid grid-cols-2 gap-x-10 gap-y-0">
                        {/* Left column — dropdowns */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="OFP Layout">
                                    <SelectInput value={store.ofpLayout} onChange={set('ofpLayout')} options={ofpLayouts} />
                                </Field>
                                <Field label="Units">
                                    <SelectInput value={store.units} onChange={set('units')} options={[
                                        { value: 'kgs', label: 'Kilograms' },
                                        { value: 'lbs', label: 'Pounds' },
                                    ]} />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Flight Rules">
                                    <SelectInput value={store.flightRules} onChange={set('flightRules')} options={[
                                        { value: 'IFR',  label: 'IFR' },
                                        { value: 'VFR',  label: 'VFR' },
                                        { value: 'DVFR', label: 'DVFR' },
                                    ]} />
                                </Field>
                                <Field label="Type of Flight">
                                    <SelectInput value={store.typeOfFlight} onChange={set('typeOfFlight')} options={[
                                        { value: 'Scheduled',     label: 'Scheduled' },
                                        { value: 'Non-Scheduled', label: 'Non-Scheduled' },
                                        { value: 'Private',       label: 'Private / GA' },
                                        { value: 'Ferry',         label: 'Ferry' },
                                    ]} />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Flight Maps">
                                    <SelectInput value={store.flightMaps} onChange={set('flightMaps')} options={[
                                        { value: 'Detailed', label: 'Detailed' },
                                        { value: 'Simple',   label: 'Simple' },
                                        { value: 'None',     label: 'None' },
                                    ]} />
                                </Field>
                                <Field label="Alternates Count">
                                    <SelectInput value={store.alternatesCount} onChange={set('alternatesCount')} options={[
                                        { value: '0', label: '0' },
                                        { value: '1', label: '1' },
                                        { value: '2', label: '2' },
                                        { value: '3', label: '3' },
                                    ]} />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Taxi Out (min)">
                                    <TextInput value={store.taxiOut} onChange={set('taxiOut')} placeholder="20" maxLength={3} />
                                </Field>
                                <Field label="Taxi In (min)">
                                    <TextInput value={store.taxiIn} onChange={set('taxiIn')} placeholder="8" maxLength={3} />
                                </Field>
                            </div>
                        </div>

                        {/* Right column — toggles */}
                        <div className="pl-6 border-l border-white/[0.05] space-y-1">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-3">Planning Options</p>
                            <Toggle label="Detailed Navlog"    checked={store.detailedNavlog}  onChange={() => store.toggleField('detailedNavlog')} />
                            <Toggle label="ETOPS Planning"     checked={store.etops}            onChange={() => store.toggleField('etops')} />
                            <Toggle label="Plan Stepclimbs"    checked={store.stepclimbs}       onChange={() => store.toggleField('stepclimbs')} />
                            <Toggle label="Runway Analysis"    checked={store.runwayAnalysis}   onChange={() => store.toggleField('runwayAnalysis')} />
                            <Toggle label="Include NOTAMs"     checked={store.notams}           onChange={() => store.toggleField('notams')} />
                            <Toggle label="FIR NOTAMs"         checked={store.firNotams}        onChange={() => store.toggleField('firNotams')} />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════ */}
                {/* SECTION 4 — OPTIONAL ENTRIES (collapsible)     */}
                {/* ══════════════════════════════════════════════ */}
                <section className="bg-white/[0.03] border border-white/[0.05] rounded-xl overflow-hidden">
                    <button
                        onClick={() => setOptionalOpen(o => !o)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-accent-purple/10 rounded-md">
                                <SlidersHorizontal className="w-4 h-4 text-accent-purple" />
                            </div>
                            <div className="text-left">
                                <p className="text-base font-bold uppercase tracking-widest text-text-primary">Optional Entries</p>
                                <p className="text-xs font-bold text-text-secondary">Automatically calculated — customise if needed</p>
                            </div>
                        </div>
                        {optionalOpen
                            ? <ChevronUp className="w-4 h-4 text-text-secondary" />
                            : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                    </button>

                    {optionalOpen && (
                        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-white/[0.05]">
                            {/* Row 1: Block time | Dep Rwy | Arr Rwy | Altitude | Pax */}
                            <div className="grid grid-cols-5 gap-4">
                                <Field label="Sched. Block Time" className="col-span-1">
                                    <div className="flex items-center gap-1">
                                        <TextInput value={store.blockTimeHH} onChange={set('blockTimeHH')} placeholder="0" maxLength={2} className="w-14 text-center" />
                                        <span className="text-text-secondary font-bold">:</span>
                                        <TextInput value={store.blockTimeMM} onChange={set('blockTimeMM')} placeholder="00" maxLength={2} className="w-14 text-center" />
                                    </div>
                                </Field>
                                <Field label="Departure Runway">
                                    <TextInput value={store.departureRunway} onChange={set('departureRunway')} placeholder="AUTO" uppercase />
                                </Field>
                                <Field label="Arrival Runway">
                                    <TextInput value={store.arrivalRunway} onChange={set('arrivalRunway')} placeholder="AUTO" uppercase />
                                </Field>
                                <Field label="Altitude (FL)" hint="e.g. 370 or blank for AUTO">
                                    <TextInput value={store.altitude} onChange={set('altitude')} placeholder="AUTO" maxLength={5} />
                                </Field>
                                <Field label="Passengers">
                                    <TextInput value={store.passengers} onChange={set('passengers')} placeholder="AUTO" maxLength={3} />
                                </Field>
                            </div>

                            {/* Row 2: Freight | Payload | ZFW */}
                            <div className="grid grid-cols-3 gap-4">
                                <Field label={`Freight (${store.units === 'kgs' ? 'KG' : 'LB'})`}>
                                    <TextInput value={store.freight} onChange={set('freight')} placeholder="NONE" />
                                </Field>
                                <Field label={`Payload (${store.units === 'kgs' ? 'KG' : 'LB'})`}>
                                    <TextInput value={store.payload} onChange={set('payload')} placeholder="AUTO" />
                                </Field>
                                <Field label={`Zero Fuel Weight (${store.units === 'kgs' ? 'KG' : 'LB'})`}>
                                    <TextInput value={store.zeroFuelWeight} onChange={set('zeroFuelWeight')} placeholder="AUTO" />
                                </Field>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── Action footer ──────────────────────────── */}
                <div className="mt-8 px-8 py-6 bg-white/[0.03] border border-white/[0.05] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs font-bold uppercase text-text-secondary">
                        {store.departure && store.arrival
                            ? <span className="text-text-primary font-bold tracking-widest">{store.departure} → {store.arrival}
                                {store.aircraftType && <span className="text-text-secondary"> · {store.aircraftType}</span>}
                                {store.registration && <span className="text-text-secondary"> · {store.registration}</span>}
                              </span>
                            : 'Fill in Departure & Arrival to get started'}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={store.resetForm}
                            className="glass-button flex items-center justify-center gap-2.5 px-6 py-3 text-xs font-bold uppercase text-accent-red hover:text-accent-red/80 transition-all active:scale-95"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={!store.departure || !store.arrival}
                            className="glass-button flex items-center justify-center w-full sm:w-auto gap-2.5 px-6 py-3 text-xs font-bold uppercase text-accent-blue hover:text-accent-blue/80 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            Generate on SimBrief
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
