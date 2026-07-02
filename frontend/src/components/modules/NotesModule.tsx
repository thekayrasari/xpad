import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, Type, RotateCcw, Trash2, Download } from 'lucide-react';
import { useNotesStore, type Stroke, type Point } from '../../stores/notesStore';
import { useOFPStore } from '../../stores/ofpStore';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);



// Reusable Input Component moved outside to prevent re-mounting and focus loss
const TextInput = ({ id, label, placeholder = '', className = '' }: { id: string, label?: string, placeholder?: string, className?: string }) => {
    const value = useNotesStore(state => state.textData[id] || '');
    const setText = useNotesStore(state => state.setText);
    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={(e) => setText(id, e.target.value)}
                placeholder={placeholder}
                className="bg-white/[0.03] border border-white/[0.05] rounded-md px-3 py-2 text-text-primary text-sm font-bold focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors w-full placeholder-ctp-overlay0"
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

export const NotesModule: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto relative hide-scrollbar px-6 md:px-8 pt-4 pb-6">
                {/* Form Container */}
                <div className="space-y-6 w-full z-10 relative select-none">
                    
                    {/* Header Info */}
                    <div className="grid grid-cols-6 gap-4 bg-white/[0.03] p-4 rounded-xl border border-white/[0.05]">
                        <TextInput id="hdr_callsign" label="Callsign" className="col-span-1" />
                        <TextInput id="hdr_equip" label="A/C Equip" className="col-span-1" />
                        <TextInput id="hdr_dep" label="Departure" className="col-span-1" />
                        <TextInput id="hdr_dep_atis" label="ATIS Freq" className="col-span-1" />
                        <TextInput id="hdr_arr" label="Arrival" className="col-span-1" />
                        <TextInput id="hdr_arr_atis" label="ATIS Freq" className="col-span-1" />
                    </div>

                    {/* Clearance Delivery */}
                    <div className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.05]">
                        <h2 className="text-base font-bold uppercase text-accent-blue mb-4">Clearance Delivery</h2>
                        <div className="grid grid-cols-8 gap-4">
                            <TextInput id="clr_freq" label="Freq" className="col-span-1" />
                            <TextInput id="clr_stand" label="Dep. Stand" className="col-span-1" />
                            <TextInput id="clr_info" label="Info" className="col-span-1" />
                            <TextInput id="clr_qnh" label="QNH" className="col-span-1" />
                            <TextInput id="clr_sid" label="SID" className="col-span-1" />
                            <TextInput id="clr_init_climb" label="Init Climb" className="col-span-1" />
                            <TextInput id="clr_squawk" label="Squawk" className="col-span-1" />
                            <TextInput id="clr_notes" label="Notes" className="col-span-1" />
                        </div>
                    </div>

                    {/* Taxi Out */}
                    <div className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.05]">
                        <h2 className="text-base font-bold uppercase text-accent-orange mb-4">Taxi Out</h2>
                        <div className="grid grid-cols-6 gap-4">
                            <TextInput id="tx_out_freq" label="Freq (Gnd/Twr)" className="col-span-1" />
                            <TextInput id="tx_out_instr" label="Taxi Instructions" className="col-span-3" />
                            <TextInput id="tx_out_hold" label="Hold Pt" className="col-span-1" />
                            <TextInput id="tx_out_rwy" label="Runway" className="col-span-1" />
                        </div>
                    </div>

                    {/* Cruise */}
                    <div className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.05] flex gap-6">
                        <div className="flex-1">
                            <h2 className="text-base font-bold uppercase text-accent-purple mb-4">Cruise Frequencies</h2>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <TextInput id="crz_fl" label="Cruise FL" className="col-span-1" />
                            </div>
                            <div className="space-y-2">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <TextInput id={`crz_name_${i}`} placeholder="Center Name" className="flex-1" />
                                        <TextInput id={`crz_freq_${i}`} placeholder="123.450" className="w-32" />
                                    </div>
                                ))}
                                <div className="flex gap-4">
                                    <TextInput id="crz_name_uni" placeholder="UNICOM" className="flex-1" />
                                    <TextInput id="crz_freq_uni" placeholder="122.800" className="w-32" />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <h2 className="text-base font-bold uppercase text-text-secondary mb-4">Cruise Notes</h2>
                            <TextAreaInput 
                                id="crz_notes"
                                className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-md p-3 text-text-primary text-sm font-bold focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue resize-none w-full placeholder-ctp-overlay0"
                            />
                        </div>
                    </div>

                    {/* Approach */}
                    <div className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.05]">
                        <h2 className="text-base font-bold uppercase text-accent-green mb-4">Approach</h2>
                        <div className="grid grid-cols-6 gap-4">
                            <TextInput id="app_freq" label="Freq" className="col-span-1" />
                            <TextInput id="app_star" label="STAR" className="col-span-1" />
                            <TextInput id="app_trans" label="Transition" className="col-span-1" />
                            <TextInput id="app_qnh" label="QNH" className="col-span-1" />
                            <TextInput id="app_rwy" label="Runway" className="col-span-1" />
                            <TextInput id="app_notes" label="Notes" className="col-span-1" />
                        </div>
                    </div>

                    {/* Taxi In */}
                    <div className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.05]">
                        <h2 className="text-base font-bold uppercase text-accent-orange mb-4">Taxi In</h2>
                        <div className="grid grid-cols-6 gap-4">
                            <TextInput id="tx_in_freq" label="Freq" className="col-span-1" />
                            <TextInput id="tx_in_instr" label="Taxi Instructions" className="col-span-4" />
                            <TextInput id="tx_in_stand" label="Arr. Stand" className="col-span-1" />
                        </div>
                    </div>

                    {/* Scratchpad */}
                    <div className="bg-white/[0.03]/10 border border-dashed border-white/[0.05] p-5 rounded-xl h-64 flex flex-col">
                        <h2 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-widest">Scratchpad</h2>
                        <TextAreaInput 
                            id="scratchpad"
                            placeholder="Freeform typing area..."
                            className="flex-1 bg-transparent border-none text-text-primary text-sm font-bold focus:outline-none resize-none w-full placeholder-ctp-overlay0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
