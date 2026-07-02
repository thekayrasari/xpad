import React, { useState } from 'react';
import { Calculator, Plane, ArrowRightLeft, Thermometer, Wind } from 'lucide-react';

export const CalculatorsModule: React.FC = () => {
    // TOD State
    const [currentAlt, setCurrentAlt] = useState('');
    const [targetAlt, setTargetAlt] = useState('');
    const [groundSpeed, setGroundSpeed] = useState('');

    // Conversion State
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState<'lbs' | 'kgs'>('lbs');
    
    const [pressure, setPressure] = useState('');
    const [pressureUnit, setPressureUnit] = useState<'inhg' | 'hpa'>('inhg');
    
    const [temp, setTemp] = useState('');
    const [tempUnit, setTempUnit] = useState<'c' | 'f'>('c');

    // TOD Calculations
    const cAlt = parseFloat(currentAlt) || 0;
    const tAlt = parseFloat(targetAlt) || 0;
    const gs = parseFloat(groundSpeed) || 0;
    
    const altToLose = Math.max(0, cAlt - tAlt);
    const todDistance = (altToLose / 1000) * 3;
    const requiredVS = gs * 5;

    // Conversion Calculations
    const parsedWeight = parseFloat(weight) || 0;
    const convWeight = weightUnit === 'lbs' ? parsedWeight * 0.453592 : parsedWeight * 2.20462;
    const convWeightLabel = weightUnit === 'lbs' ? 'KGS' : 'LBS';

    const parsedPressure = parseFloat(pressure) || 0;
    const convPressure = pressureUnit === 'inhg' ? parsedPressure * 33.86389 : parsedPressure / 33.86389;
    const convPressureLabel = pressureUnit === 'inhg' ? 'HPA' : 'INHG';

    const parsedTemp = parseFloat(temp) || 0;
    const convTemp = tempUnit === 'c' ? (parsedTemp * 9/5) + 32 : (parsedTemp - 32) * 5/9;
    const convTempLabel = tempUnit === 'c' ? '°F' : '°C';

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-y-auto">
            <div className="flex-1 px-6 md:px-8 pt-6 pb-8 max-w-5xl mx-auto w-full space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Top of Descent (TOD) Calculator */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-white/[0.05] pb-4">
                            <h2 className="text-lg font-bold text-accent-blue uppercase tracking-widest flex items-center gap-2">
                                <Plane className="w-5 h-5" /> Top of Descent
                            </h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase text-text-secondary tracking-widest">Current Alt (FT)</label>
                                    <input 
                                        type="number" 
                                        value={currentAlt} 
                                        onChange={(e) => setCurrentAlt(e.target.value)}
                                        placeholder="e.g. 36000"
                                        className="w-full bg-black/20 border border-white/[0.05] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-accent-blue transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase text-text-secondary tracking-widest">Target Alt (FT)</label>
                                    <input 
                                        type="number" 
                                        value={targetAlt} 
                                        onChange={(e) => setTargetAlt(e.target.value)}
                                        placeholder="e.g. 10000"
                                        className="w-full bg-black/20 border border-white/[0.05] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-accent-blue transition-colors"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase text-text-secondary tracking-widest">Ground Speed (KTS)</label>
                                <input 
                                    type="number" 
                                    value={groundSpeed} 
                                    onChange={(e) => setGroundSpeed(e.target.value)}
                                    placeholder="e.g. 420"
                                    className="w-full bg-black/20 border border-white/[0.05] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-accent-blue transition-colors"
                                />
                            </div>

                            <div className="pt-6 mt-6 border-t border-white/[0.05]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-4 text-center">
                                        <div className="text-[10px] font-bold uppercase text-text-secondary tracking-widest mb-1">Descent Distance</div>
                                        <div className="text-3xl font-black text-accent-blue">{todDistance > 0 ? Math.ceil(todDistance) : 0} <span className="text-sm">NM</span></div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 text-center">
                                        <div className="text-[10px] font-bold uppercase text-text-secondary tracking-widest mb-1">Required V/S (3°)</div>
                                        <div className="text-3xl font-black text-text-primary">-{requiredVS > 0 ? Math.ceil(requiredVS) : 0} <span className="text-sm text-text-secondary">FPM</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unit Converters */}
                    <div className="glass-panel p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 shrink-0">
                            <h2 className="text-lg font-bold text-accent-green uppercase tracking-widest flex items-center gap-2">
                                <ArrowRightLeft className="w-5 h-5" /> Unit Converters
                            </h2>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between space-y-6">
                            {/* Weight */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
                                    <span className="font-bold text-xs text-text-secondary">KG</span>
                                </div>
                                <div className="flex-1 flex gap-2 min-w-0">
                                    <input 
                                        type="number" 
                                        value={weight} 
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full min-w-0 bg-black/20 border border-white/[0.05] rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-accent-green"
                                        placeholder="Weight"
                                    />
                                    <button 
                                        onClick={() => setWeightUnit(weightUnit === 'lbs' ? 'kgs' : 'lbs')}
                                        className="shrink-0 bg-white/[0.05] hover:bg-white/[0.1] px-4 rounded-xl text-xs font-bold w-16 transition-colors"
                                    >
                                        {weightUnit.toUpperCase()}
                                    </button>
                                </div>
                                <div className="w-6 shrink-0 flex justify-center text-text-secondary"><ArrowRightLeft className="w-4 h-4" /></div>
                                <div className="w-28 shrink-0 bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2 flex justify-between items-center text-sm font-bold overflow-hidden">
                                    <span className="truncate">{convWeight > 0 ? convWeight.toFixed(1) : '0'}</span> 
                                    <span className="text-xs text-text-secondary ml-1 shrink-0">{convWeightLabel}</span>
                                </div>
                            </div>

                            {/* Pressure */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
                                    <Wind className="w-4 h-4 text-text-secondary" />
                                </div>
                                <div className="flex-1 flex gap-2 min-w-0">
                                    <input 
                                        type="number" 
                                        value={pressure} 
                                        onChange={(e) => setPressure(e.target.value)}
                                        className="w-full min-w-0 bg-black/20 border border-white/[0.05] rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-accent-green"
                                        placeholder="Pressure"
                                    />
                                    <button 
                                        onClick={() => setPressureUnit(pressureUnit === 'inhg' ? 'hpa' : 'inhg')}
                                        className="shrink-0 bg-white/[0.05] hover:bg-white/[0.1] px-2 rounded-xl text-[10px] font-bold w-16 transition-colors"
                                    >
                                        {pressureUnit.toUpperCase()}
                                    </button>
                                </div>
                                <div className="w-6 shrink-0 flex justify-center text-text-secondary"><ArrowRightLeft className="w-4 h-4" /></div>
                                <div className="w-28 shrink-0 bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2 flex justify-between items-center text-sm font-bold overflow-hidden">
                                    <span className="truncate">{convPressure > 0 ? (pressureUnit === 'inhg' ? convPressure.toFixed(0) : convPressure.toFixed(2)) : '0'}</span> 
                                    <span className="text-xs text-text-secondary ml-1 shrink-0">{convPressureLabel}</span>
                                </div>
                            </div>

                            {/* Temperature */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
                                    <Thermometer className="w-4 h-4 text-text-secondary" />
                                </div>
                                <div className="flex-1 flex gap-2 min-w-0">
                                    <input 
                                        type="number" 
                                        value={temp} 
                                        onChange={(e) => setTemp(e.target.value)}
                                        className="w-full min-w-0 bg-black/20 border border-white/[0.05] rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-accent-green"
                                        placeholder="Temp"
                                    />
                                    <button 
                                        onClick={() => setTempUnit(tempUnit === 'c' ? 'f' : 'c')}
                                        className="shrink-0 bg-white/[0.05] hover:bg-white/[0.1] px-4 rounded-xl text-xs font-bold w-16 transition-colors"
                                    >
                                        °{tempUnit.toUpperCase()}
                                    </button>
                                </div>
                                <div className="w-6 shrink-0 flex justify-center text-text-secondary"><ArrowRightLeft className="w-4 h-4" /></div>
                                <div className="w-28 shrink-0 bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2 flex justify-between items-center text-sm font-bold overflow-hidden">
                                    <span className="truncate">{temp !== '' ? convTemp.toFixed(1) : '0'}</span> 
                                    <span className="text-xs text-text-secondary ml-1 shrink-0">{convTempLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
