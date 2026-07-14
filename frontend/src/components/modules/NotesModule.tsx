import React from 'react';
import { useNotesStore } from '../../stores/notesStore';

// Reusable Input Component moved outside to prevent re-mounting and focus loss
const TextInput = ({ id, label, placeholder = '', className = '' }: { id: string, label?: string, placeholder?: string, className?: string }) => {
    const value = useNotesStore(state => state.textData[id] || '');
    const setText = useNotesStore(state => state.setText);
    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className="xp-label">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={(e) => setText(id, e.target.value)}
                placeholder={placeholder}
                className="xp-input"
            />
        </div>
    );
};

const TextAreaInput = ({ id, className = '', placeholder = '' }: { id: string, className?: string, placeholder?: string }) => {
    const value = useNotesStore(state => state.textData[id] || '');
    const setText = useNotesStore(state => state.setText);
    return (
        <textarea
            value={value}
            onChange={(e) => setText(id, e.target.value)}
            placeholder={placeholder}
            className={className}
        />
    );
};

// ── Section wrapper helper ────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="xp-panel">
        <div className="xp-panel-header">
            <h2 className="xp-section-title">{title}</h2>
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

export const NotesModule: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden">
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pt-4 pb-6">
                <div className="space-y-4 w-full z-10 relative">

                    {/* Header Info */}
                    <div className="xp-panel p-4">
                        <div className="grid grid-cols-6 gap-3">
                            <TextInput id="hdr_callsign" label="Callsign"   className="col-span-1" />
                            <TextInput id="hdr_equip"    label="A/C Equip"  className="col-span-1" />
                            <TextInput id="hdr_dep"      label="Departure"  className="col-span-1" />
                            <TextInput id="hdr_dep_atis" label="ATIS Freq"  className="col-span-1" />
                            <TextInput id="hdr_arr"      label="Arrival"    className="col-span-1" />
                            <TextInput id="hdr_arr_atis" label="ATIS Freq"  className="col-span-1" />
                        </div>
                    </div>

                    {/* Flight Phase Panels Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                        {/* Left Column: Departure */}
                        <div className="space-y-4">
                            {/* Clearance Delivery */}
                            <Section title="Clearance Delivery">
                                <div className="grid grid-cols-4 gap-3">
                                    <TextInput id="clr_freq"       label="Freq"         className="col-span-1" />
                                    <TextInput id="clr_stand"      label="Dep. Stand"   className="col-span-1" />
                                    <TextInput id="clr_info"       label="Info"         className="col-span-1" />
                                    <TextInput id="clr_qnh"        label="QNH"          className="col-span-1" />
                                    <TextInput id="clr_sid"        label="SID"          className="col-span-1" />
                                    <TextInput id="clr_init_climb" label="Init Climb"   className="col-span-1" />
                                    <TextInput id="clr_squawk"     label="Squawk"       className="col-span-1" />
                                    <TextInput id="clr_notes"      label="Notes"        className="col-span-1" />
                                </div>
                            </Section>

                            {/* Taxi Out */}
                            <Section title="Taxi Out">
                                <div className="grid grid-cols-6 gap-3">
                                    <TextInput id="tx_out_freq"  label="Freq (Gnd/Twr)"    className="col-span-1" />
                                    <TextInput id="tx_out_instr" label="Taxi Instructions" className="col-span-3" />
                                    <TextInput id="tx_out_hold"  label="Hold Pt"           className="col-span-1" />
                                    <TextInput id="tx_out_rwy"   label="Runway"            className="col-span-1" />
                                </div>
                            </Section>
                        </div>

                        {/* Right Column: Arrival */}
                        <div className="space-y-4">
                            {/* Approach */}
                            <Section title="Approach">
                                <div className="grid grid-cols-3 gap-3">
                                    <TextInput id="app_freq"  label="Freq"       className="col-span-1" />
                                    <TextInput id="app_star"  label="STAR"       className="col-span-1" />
                                    <TextInput id="app_trans" label="Transition" className="col-span-1" />
                                    <TextInput id="app_qnh"   label="QNH"        className="col-span-1" />
                                    <TextInput id="app_rwy"   label="Runway"     className="col-span-1" />
                                    <TextInput id="app_notes" label="Notes"      className="col-span-1" />
                                </div>
                            </Section>

                            {/* Taxi In */}
                            <Section title="Taxi In">
                                <div className="grid grid-cols-6 gap-3">
                                    <TextInput id="tx_in_freq"  label="Freq"               className="col-span-1" />
                                    <TextInput id="tx_in_instr" label="Taxi Instructions"  className="col-span-4" />
                                    <TextInput id="tx_in_stand" label="Arr. Stand"         className="col-span-1" />
                                </div>
                            </Section>
                        </div>
                    </div>
                    {/* Cruise */}
                    <div className="xp-panel">
                        <div className="xp-panel-header">
                            <h2 className="xp-section-title">Cruise</h2>
                        </div>
                        <div className="p-4 flex gap-6">
                            <div className="flex-1">
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <TextInput id="crz_fl" label="Cruise FL" className="col-span-1" />
                                </div>
                                <div className="space-y-2">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <TextInput id={`crz_name_${i}`} placeholder="Center Name" className="flex-1" />
                                            <TextInput id={`crz_freq_${i}`} placeholder="123.450"     className="w-32" />
                                        </div>
                                    ))}
                                    <div className="flex gap-3">
                                        <TextInput id="crz_name_uni" placeholder="UNICOM"  className="flex-1" />
                                        <TextInput id="crz_freq_uni" placeholder="122.800" className="w-32" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label className="xp-label">Cruise Notes</label>
                                <TextAreaInput
                                    id="crz_notes"
                                    className="flex-1 xp-input resize-none min-h-[120px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scratchpad */}
                    <div className="xp-panel h-52 flex flex-col">
                        <div className="xp-panel-header">
                            <h2 className="xp-section-title">Scratchpad</h2>
                        </div>
                        <div className="flex-1 p-3">
                            <TextAreaInput
                                id="scratchpad"
                                placeholder="Freeform typing area..."
                                className="w-full h-full bg-transparent border-none text-text-primary text-sm font-medium focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
