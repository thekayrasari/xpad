import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, Type, RotateCcw, FileEdit, Trash2 } from 'lucide-react';
import { useNotesStore, type Stroke, type Point } from '../../stores/notesStore';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);



// Reusable Input Component moved outside to prevent re-mounting and focus loss
const TextInput = ({ id, label, placeholder = '', className = '' }: { id: string, label?: string, placeholder?: string, className?: string }) => {
    const { textData, setText, mode } = useNotesStore();
    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">{label}</label>}
            <input
                type="text"
                value={textData[id] || ''}
                onChange={(e) => setText(id, e.target.value)}
                placeholder={placeholder}
                className="bg-white/[0.03] border border-white/[0.05] rounded-md px-3 py-2 text-text-primary text-sm font-bold focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors w-full placeholder-ctp-overlay0"
                disabled={mode === 'draw'}
            />
        </div>
    );
};

export const NotesModule: React.FC = () => {
    const { 
        textData, setText, 
        strokes, addStroke, undoStroke, clearAll, 
        mode, setMode 
    } = useNotesStore();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const currentStrokeRef = useRef<Stroke | null>(null);

    // Render strokes to canvas
    const drawStrokes = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        strokes.forEach(stroke => {
            ctx.beginPath();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            stroke.points.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        });
    }, [strokes]);

    // Resize canvas to fit container
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && containerRef.current) {
                // Get the full scrollable height of the container
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.scrollHeight;
                drawStrokes();
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        // Small delay to ensure layout is complete before sizing canvas
        setTimeout(handleResize, 100);
        
        return () => window.removeEventListener('resize', handleResize);
    }, [strokes, drawStrokes]); // Redraw when strokes change

    // Drawing handlers
    const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode !== 'draw') return;
        e.preventDefault();
        
        const point = getCoordinates(e);
        if (!point) return;

        setIsDrawing(true);
        currentStrokeRef.current = {
            id: generateId(),
            points: [point],
            color: '#89b4fa', // ctp-blue for high visibility
            width: 3
        };
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || mode !== 'draw' || !currentStrokeRef.current) return;
        e.preventDefault();

        const point = getCoordinates(e);
        if (!point) return;

        currentStrokeRef.current.points.push(point);
        
        // Instant visual feedback
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            const points = currentStrokeRef.current.points;
            if (points.length >= 2) {
                ctx.beginPath();
                ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
                ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
                ctx.strokeStyle = currentStrokeRef.current.color;
                ctx.lineWidth = currentStrokeRef.current.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }
        }
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
            addStroke(currentStrokeRef.current);
        }
        currentStrokeRef.current = null;
    };

    return (
        <div className="w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden">
            {/* Scrollable Content Area */}
            <div 
                ref={containerRef}
                className="flex-1 overflow-y-auto relative hide-scrollbar px-6 md:px-8 pt-4 pb-6"
            >
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
                            <textarea 
                                value={textData['crz_notes'] || ''}
                                onChange={(e) => setText('crz_notes', e.target.value)}
                                disabled={mode === 'draw'}
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
                        <textarea 
                            value={textData['scratchpad'] || ''}
                            onChange={(e) => setText('scratchpad', e.target.value)}
                            disabled={mode === 'draw'}
                            placeholder="Freeform typing area..."
                            className="flex-1 bg-transparent border-none text-text-primary text-sm font-bold focus:outline-none resize-none w-full placeholder-ctp-overlay0"
                        />
                    </div>


                </div>

                {/* Canvas Overlay for Drawing */}
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full z-50 cursor-crosshair"
                    style={{ 
                        pointerEvents: mode === 'draw' ? 'auto' : 'none',
                        touchAction: 'none' // Prevent scrolling while drawing on touch devices
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            {/* ── Bottom Toolbar ── */}
            <div className="shrink-0 px-6 md:px-8 py-4 border-t border-white/[0.05] bg-black/20 flex items-center justify-end z-10">
                <div className="flex bg-black/20 rounded-xl p-1 border border-white/[0.05]">
                    <button
                        onClick={() => setMode('type')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 ${
                            mode === 'type' ? 'bg-white/[0.1] text-accent-blue shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <Type className="w-4 h-4" /> Type
                    </button>
                    <button
                        onClick={() => setMode('draw')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 ${
                            mode === 'draw' ? 'bg-white/[0.1] text-accent-blue shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <Pen className="w-4 h-4" /> Draw
                    </button>
                    <div className="w-px h-5 bg-white/[0.05] mx-2 self-center" />
                    <button onClick={undoStroke} className="p-1.5 px-3 text-text-secondary hover:text-text-primary rounded-md transition-all active:scale-95" title="Undo Stroke">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={clearAll} className="p-1.5 px-3 text-accent-red hover:text-accent-red/80 rounded-md transition-all active:scale-95 ml-1" title="Clear All">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
