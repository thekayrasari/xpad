import React, { useState } from 'react';
import { ArrowRightLeft, Thermometer, Wind } from 'lucide-react';

export const CalculatorsModule: React.FC = () => {
    // TOD State
    const [currentAlt, setCurrentAlt] = useState('');
    const [targetAlt, setTargetAlt] = useState('');
    const [groundSpeed, setGroundSpeed] = useState('');

    // Wind State
    const [rwyHeading, setRwyHeading] = useState('');
    const [windDir, setWindDir] = useState('');
    const [windSpeed, setWindSpeed] = useState('');

    // Conversion State
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState<'lbs' | 'kgs'>('lbs');

    const [pressure, setPressure] = useState('');
    const [pressureUnit, setPressureUnit] = useState<'inhg' | 'hpa'>('inhg');

    const [temp, setTemp] = useState('');
    const [tempUnit, setTempUnit] = useState<'c' | 'f'>('c');

    // ISA State
    const [isaAlt, setIsaAlt] = useState('');
    const [isaOat, setIsaOat] = useState('');

    // Fuel State
    const [currentFuel, setCurrentFuel] = useState('');
    const [fuelFlow, setFuelFlow] = useState('');
    const [fuelUnit, setFuelUnit] = useState<'lbs' | 'kgs'>('lbs');

    // TAS / Mach State
    const [ias, setIas] = useState('');
    const [tasAlt, setTasAlt] = useState('');
    const [tasOat, setTasOat] = useState('');

    // TOD Calculations
    const cAlt = parseFloat(currentAlt) || 0;
    const tAlt = parseFloat(targetAlt) || 0;
    const gs   = parseFloat(groundSpeed) || 0;

    const altToLose   = Math.max(0, cAlt - tAlt);
    const todDistance = (altToLose / 1000) * 3;
    const requiredVS  = gs * 5;

    // Wind Calculations
    const rwyH = parseFloat(rwyHeading) || 0;
    const wDir = parseFloat(windDir) || 0;
    const wSpd = parseFloat(windSpeed) || 0;

    const angleDiff = (wDir - rwyH + 360) % 360;
    const angleDiffRad = (angleDiff * Math.PI) / 180;
    const rawHeadwind = wSpd * Math.cos(angleDiffRad);
    const rawCrosswind = wSpd * Math.sin(angleDiffRad);

    const headwindVal = Math.abs(rawHeadwind);
    const crosswindVal = Math.abs(rawCrosswind);
    const isTailwind = rawHeadwind < 0;
    
    let xwindDirection = '';
    if (crosswindVal > 0.5) {
        if (angleDiff > 0 && angleDiff < 180) {
            xwindDirection = 'From Right';
        } else if (angleDiff > 180 && angleDiff < 360) {
            xwindDirection = 'From Left';
        }
    }

    // Conversion Calculations
    const parsedWeight    = parseFloat(weight) || 0;
    const convWeight      = weightUnit === 'lbs' ? parsedWeight * 0.453592 : parsedWeight * 2.20462;
    const convWeightLabel = weightUnit === 'lbs' ? 'KGS' : 'LBS';

    const parsedPressure    = parseFloat(pressure) || 0;
    const convPressure      = pressureUnit === 'inhg' ? parsedPressure * 33.86389 : parsedPressure / 33.86389;
    const convPressureLabel = pressureUnit === 'inhg' ? 'HPA' : 'INHG';

    const parsedTemp    = parseFloat(temp) || 0;
    const convTemp      = tempUnit === 'c' ? (parsedTemp * 9/5) + 32 : (parsedTemp - 32) * 5/9;
    const convTempLabel = tempUnit === 'c' ? '°F' : '°C';

    // ISA Calculations
    const alt = parseFloat(isaAlt) || 0;
    const oat = parseFloat(isaOat) || 0;
    const standardTemp = 15 - 2 * (alt / 1000);
    const isaDeviation = oat - standardTemp;

    // Fuel Calculations
    const fuelRemaining = parseFloat(currentFuel) || 0;
    const flow = parseFloat(fuelFlow) || 0;
    let enduranceStr = '--:--';
    if (flow > 0 && fuelRemaining > 0) {
        const hours = fuelRemaining / flow;
        const hh = Math.floor(hours);
        const mm = Math.round((hours - hh) * 60);
        const finalHh = mm === 60 ? hh + 1 : hh;
        const finalMm = mm === 60 ? 0 : mm;
        enduranceStr = `${String(finalHh).padStart(2, '0')}:${String(finalMm).padStart(2, '0')}`;
    }

    // TAS / Mach Calculations
    const iasVal = parseFloat(ias) || 0;
    const tasAltitude = parseFloat(tasAlt) || 0;
    const tOat = parseFloat(tasOat) || 0;
    const kelvin = tOat + 273.15;
    
    const delta = Math.pow(1 - 0.0000068756 * tasAltitude, 5.25588);
    const sigma = delta * (288.15 / kelvin);
    const tasVal = sigma > 0 ? iasVal / Math.sqrt(sigma) : 0;
    
    const speedOfSound = 38.9678 * Math.sqrt(kelvin);
    const machVal = speedOfSound > 0 ? tasVal / speedOfSound : 0;

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-y-auto hide-scrollbar">
            <div className="flex-1 px-6 md:px-8 pt-6 pb-8 w-full">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Top of Descent (TOD) Calculator */}
                    <div className="xp-panel">
                        <div className="xp-panel-header">
                            <h2 className="xp-section-title">
                                Top of Descent
                            </h2>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="xp-label">Current Alt (FT)</label>
                                    <input
                                        type="number"
                                        value={currentAlt}
                                        onChange={(e) => setCurrentAlt(e.target.value)}
                                        placeholder="e.g. 36000"
                                        className="xp-input"
                                    />
                                </div>
                                <div>
                                    <label className="xp-label">Target Alt (FT)</label>
                                    <input
                                        type="number"
                                        value={targetAlt}
                                        onChange={(e) => setTargetAlt(e.target.value)}
                                        placeholder="e.g. 10000"
                                        className="xp-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="xp-label">Ground Speed (KTS)</label>
                                <input
                                    type="number"
                                    value={groundSpeed}
                                    onChange={(e) => setGroundSpeed(e.target.value)}
                                    placeholder="e.g. 420"
                                    className="xp-input"
                                />
                            </div>

                            <div className="pt-4 border-t border-border-dark grid grid-cols-2 gap-4">
                                <div className="bg-accent-blue/10 border border-accent-blue/25 p-4 text-center">
                                    <div className="xp-overline mb-1">Descent Distance</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        {todDistance > 0 ? Math.ceil(todDistance) : 0}
                                        <span className="text-sm ml-1">NM</span>
                                    </div>
                                </div>
                                <div className="xp-panel p-4 text-center">
                                    <div className="xp-overline mb-1">Required V/S (3°)</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        -{requiredVS > 0 ? Math.ceil(requiredVS) : 0}
                                        <span className="text-sm ml-1 text-text-secondary">FPM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wind Components Calculator */}
                    <div className="xp-panel">
                        <div className="xp-panel-header">
                            <h2 className="xp-section-title">
                                Wind Components
                            </h2>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="xp-label">Rwy Heading</label>
                                    <input
                                        type="number"
                                        value={rwyHeading}
                                        onChange={(e) => setRwyHeading(e.target.value)}
                                        placeholder="e.g. 09"
                                        className="xp-input"
                                    />
                                </div>
                                <div>
                                    <label className="xp-label">Wind Dir (°)</label>
                                    <input
                                        type="number"
                                        value={windDir}
                                        onChange={(e) => setWindDir(e.target.value)}
                                        placeholder="e.g. 130"
                                        className="xp-input"
                                    />
                                </div>
                                <div>
                                    <label className="xp-label">Wind Speed</label>
                                    <input
                                        type="number"
                                        value={windSpeed}
                                        onChange={(e) => setWindSpeed(e.target.value)}
                                        placeholder="e.g. 15"
                                        className="xp-input"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border-dark grid grid-cols-2 gap-4">
                                <div className="bg-accent-blue/10 border border-accent-blue/25 p-4 text-center">
                                    <div className="xp-overline mb-1">{isTailwind ? 'Tailwind' : 'Headwind'}</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        {windSpeed !== '' ? Math.round(headwindVal) : 0}
                                        <span className="text-sm ml-1">KTS</span>
                                    </div>
                                </div>
                                <div className="xp-panel p-4 text-center">
                                    <div className="xp-overline mb-1">Crosswind</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        {windSpeed !== '' ? Math.round(crosswindVal) : 0}
                                        <span className="text-sm ml-1 text-text-secondary">KTS</span>
                                    </div>
                                    {xwindDirection && (
                                        <div className="text-xs font-bold text-text-secondary mt-1">{xwindDirection}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unit Converters */}
                    <div className="xp-panel flex flex-col">
                        <div className="xp-panel-header">
                            <h2 className="xp-section-title">
                                Unit Converters
                            </h2>
                        </div>

                        <div className="p-5 flex flex-col gap-5 flex-1">
                            {/* Weight */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-nav-hover border border-border-dark flex items-center justify-center shrink-0">
                                    <span className="font-bold text-[10px] text-text-secondary">KG</span>
                                </div>
                                <div className="flex-1 flex gap-2 min-w-0">
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="xp-input flex-1 min-w-0"
                                        placeholder="Weight"
                                    />
                                    <button
                                        onClick={() => setWeightUnit(weightUnit === 'lbs' ? 'kgs' : 'lbs')}
                                        className="xp-btn w-16 shrink-0"
                                    >
                                        {weightUnit.toUpperCase()}
                                    </button>
                                </div>
                                <ArrowRightLeft className="w-4 h-4 text-text-secondary shrink-0" />
                                <div className="w-28 shrink-0 xp-panel px-3 py-2 flex justify-between items-center text-sm font-bold overflow-hidden">
                                    <span className="truncate">{convWeight > 0 ? convWeight.toFixed(1) : '0'}</span>
                                    <span className="text-xs text-text-secondary ml-1 shrink-0">{convWeightLabel}</span>
                                </div>
                            </div>

                            {/* Pressure */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-nav-hover border border-border-dark flex items-center justify-center shrink-0">
                                    <Wind className="w-4 h-4 text-text-secondary" />
                                </div>
                                <div className="flex-1 flex gap-2 min-w-0">
                                    <input
                                        type="number"
                                        value={pressure}
                                        onChange={(e) => setPressure(e.target.value)}
                                        className="xp-input flex-1 min-w-0"
                                        placeholder="Pressure"
                                    />
                                    <button
                                        onClick={() => setPressureUnit(pressureUnit === 'inhg' ? 'hpa' : 'inhg')}
                                        className="xp-btn w-16 shrink-0 text-[9px]"
                                    >
                                        {pressureUnit.toUpperCase()}
                                    </button>
                                </div>
                                <ArrowRightLeft className="w-4 h-4 text-text-secondary shrink-0" />
                                <div className="w-28 shrink-0 xp-panel px-3 py-2 flex justify-between items-center text-sm font-bold overflow-hidden">
                                    <span className="truncate">
                                        {convPressure > 0 ? (pressureUnit === 'inhg' ? convPressure.toFixed(0) : convPressure.toFixed(2)) : '0'}
                                    </span>
                                    <span className="text-xs text-text-secondary ml-1 shrink-0">{convPressureLabel}</span>
                                </div>
                            </div>

                            {/* Temperature */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-nav-hover border border-border-dark flex items-center justify-center shrink-0">
                                    <Thermometer className="w-4 h-4 text-text-secondary" />
                                </div>
                                <div className="flex-1 flex gap-2 min-w-0">
                                    <input
                                        type="number"
                                        value={temp}
                                        onChange={(e) => setTemp(e.target.value)}
                                        className="xp-input flex-1 min-w-0"
                                        placeholder="Temp"
                                    />
                                    <button
                                        onClick={() => setTempUnit(tempUnit === 'c' ? 'f' : 'c')}
                                        className="xp-btn w-16 shrink-0"
                                    >
                                        °{tempUnit.toUpperCase()}
                                    </button>
                                </div>
                                <ArrowRightLeft className="w-4 h-4 text-text-secondary shrink-0" />
                                <div className="w-28 shrink-0 xp-panel px-3 py-2 flex justify-between items-center text-sm font-bold overflow-hidden">
                                    <span className="truncate">{temp !== '' ? convTemp.toFixed(1) : '0'}</span>
                                    <span className="text-xs text-text-secondary ml-1 shrink-0">{convTempLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ISA Temperature Deviation Calculator */}
                    <div className="xp-panel flex flex-col">
                        <div className="xp-panel-header">
                            <h2 className="xp-section-title">
                                ISA Temperature Deviation
                            </h2>
                        </div>

                        <div className="p-5 space-y-4 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="xp-label">Pressure Alt (FT)</label>
                                    <input
                                        type="number"
                                        value={isaAlt}
                                        onChange={(e) => setIsaAlt(e.target.value)}
                                        placeholder="e.g. 34000"
                                        className="xp-input"
                                    />
                                </div>
                                <div>
                                    <label className="xp-label">OAT / TAT (°C)</label>
                                    <input
                                        type="number"
                                        value={isaOat}
                                        onChange={(e) => setIsaOat(e.target.value)}
                                        placeholder="e.g. -50"
                                        className="xp-input"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border-dark grid grid-cols-2 gap-4">
                                <div className="bg-accent-blue/10 border border-accent-blue/25 p-4 text-center">
                                    <div className="xp-overline mb-1">ISA Standard Temp</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        {isaAlt !== '' ? Math.round(standardTemp) : 15}
                                        <span className="text-sm ml-1">°C</span>
                                    </div>
                                </div>
                                <div className="xp-panel p-4 text-center">
                                    <div className="xp-overline mb-1">ISA Deviation</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        {isaAlt !== '' && isaOat !== '' ? (isaDeviation > 0 ? `+${Math.round(isaDeviation)}` : Math.round(isaDeviation)) : 0}
                                        <span className="text-sm ml-1 text-text-secondary">°C</span>
                                    </div>
                                    {isaAlt !== '' && isaOat !== '' && (
                                        <div className="text-xs font-bold text-text-secondary mt-1">
                                            {isaDeviation === 0 ? 'ISA Standard' : (isaDeviation > 0 ? `ISA +${Math.round(isaDeviation)}` : `ISA -${Math.abs(Math.round(isaDeviation))}`)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fuel Endurance */}
                    <div className="xp-panel flex flex-col">
                        <div className="xp-panel-header">
                            <h2 className="xp-section-title">
                                Fuel Endurance
                            </h2>
                        </div>

                        <div className="p-5 space-y-4 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="xp-label">Fuel Remaining</label>
                                    <div className="flex gap-2 min-w-0">
                                        <input
                                            type="number"
                                            value={currentFuel}
                                            onChange={(e) => setCurrentFuel(e.target.value)}
                                            placeholder="e.g. 12000"
                                            className="xp-input flex-1 min-w-0"
                                        />
                                        <button
                                            onClick={() => setFuelUnit(fuelUnit === 'lbs' ? 'kgs' : 'lbs')}
                                            className="xp-btn px-2 shrink-0"
                                        >
                                            {fuelUnit.toUpperCase()}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="xp-label">Fuel Flow (Per HR)</label>
                                    <input
                                        type="number"
                                        value={fuelFlow}
                                        onChange={(e) => setFuelFlow(e.target.value)}
                                        placeholder="e.g. 5400"
                                        className="xp-input"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border-dark grid grid-cols-1 gap-4">
                                <div className="bg-accent-blue/10 border border-accent-blue/25 p-4 text-center">
                                    <div className="xp-overline mb-1">Time Endurance</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        {enduranceStr}
                                        <span className="text-sm ml-1 text-text-secondary">HRS</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TAS & Mach Calculator */}
                    <div className="xp-panel flex flex-col">
                        <div className="xp-panel-header">
                            <h2 className="xp-section-title">
                                TAS & Mach Calculator
                            </h2>
                        </div>

                        <div className="p-5 space-y-4 flex-1">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="xp-label">IAS (KTS)</label>
                                    <input
                                        type="number"
                                        value={ias}
                                        onChange={(e) => setIas(e.target.value)}
                                        placeholder="e.g. 250"
                                        className="xp-input"
                                    />
                                </div>
                                <div>
                                    <label className="xp-label">Alt (FT)</label>
                                    <input
                                        type="number"
                                        value={tasAlt}
                                        onChange={(e) => setTasAlt(e.target.value)}
                                        placeholder="e.g. 35000"
                                        className="xp-input"
                                    />
                                </div>
                                <div>
                                    <label className="xp-label">OAT (°C)</label>
                                    <input
                                        type="number"
                                        value={tasOat}
                                        onChange={(e) => setTasOat(e.target.value)}
                                        placeholder="e.g. -54"
                                        className="xp-input"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border-dark grid grid-cols-2 gap-4">
                                <div className="bg-accent-blue/10 border border-accent-blue/25 p-4 text-center">
                                    <div className="xp-overline mb-1">True Airspeed (TAS)</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        {ias !== '' && tasAlt !== '' ? Math.round(tasVal) : 0}
                                        <span className="text-sm ml-1">KTS</span>
                                    </div>
                                </div>
                                <div className="xp-panel p-4 text-center">
                                    <div className="xp-overline mb-1">Mach Speed</div>
                                    <div className="text-3xl font-black text-text-primary">
                                        {ias !== '' && tasAlt !== '' ? machVal.toFixed(3) : '0.000'}
                                        <span className="text-sm ml-1 text-text-secondary">M</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
