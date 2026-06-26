import React, { useState, useCallback } from 'react';
import { BookOpen, Upload, X, FileText } from 'lucide-react';
import { usePDFStore } from '../../stores/pdfStore';

// ── Main PDF Module ───────────────────────────────────────────────────────────
export const PDFModule: React.FC = () => {
    const { files, activeFileUrl, addFiles, removeFile, setActiveFile } = usePDFStore();
    const [isDragging, setIsDragging] = useState(false);

    // ── File input handlers ───────────────────────────────────────────────────
    const handleFiles = useCallback((fileList: FileList) => {
        const entries = Array.from(fileList)
            .filter(f => f.type === 'application/pdf')
            .map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
        if (entries.length > 0) addFiles(entries);
    }, [addFiles]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(e.target.files);
        e.target.value = ''; 
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    };

    // ── Empty state ───────────────────────────────────────────────────────────
    if (files.length === 0) {
        return (
            <div className="w-full h-full p-6 md:p-8 flex flex-col font-sans text-text-primary bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] overflow-hidden shadow-2xl">


                <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors ${
                        isDragging ? 'border-accent-purple bg-accent-purple/10' : 'border-white/[0.05] hover:border-ctp-surface2 bg-white/[0.03]'
                    }`}
                >
                    <Upload className="w-16 h-16 text-text-secondary/70/50 mb-4" />
                    <p className="text-lg font-bold uppercase text-text-secondary mb-2">Drop PDF files here</p>
                    <p className="text-sm font-bold text-text-secondary/70 mb-6">FCOM, QRH, SOPs — any PDF document</p>
                    <label className="glass-button flex w-fit items-center gap-2 text-accent-purple px-6 py-2.5 text-sm font-bold uppercase cursor-pointer hover:text-accent-purple/80 transition-colors active:scale-95">
                        <FileText className="w-4 h-4" />
                        Browse Files
                        <input type="file" accept=".pdf" multiple onChange={handleFileInput} className="hidden" />
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full font-sans text-text-primary bg-white/[0.03] border border-white/[0.05] flex flex-col rounded-[1.5rem] overflow-hidden shadow-2xl">
            {/* ── Top toolbar ── */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.05] shrink-0">
                <BookOpen className="w-5 h-5 text-accent-purple shrink-0" />

                {/* File tabs */}
                <div className="flex items-center gap-1 flex-1 overflow-x-auto min-w-0">
                    {files.map(f => (
                        <div
                            key={f.url}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase shrink-0 cursor-pointer transition-colors ${
                                activeFileUrl === f.url ? 'bg-white/[0.05] text-text-primary' : 'text-text-secondary hover:bg-white/[0.05]'
                            }`}
                            onClick={() => setActiveFile(f.url)}
                        >
                            <span className="max-w-[140px] truncate">{f.name}</span>
                            <button
                                onClick={e => { e.stopPropagation(); removeFile(f.url); }}
                                className="text-text-secondary/70 hover:text-accent-red transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase text-text-secondary hover:bg-white/[0.05] cursor-pointer transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5" /> Add
                        <input type="file" accept=".pdf" multiple onChange={handleFileInput} className="hidden" />
                    </label>
                </div>
            </div>

            {/* ── Body: Native Browser PDF Viewer ── */}
            <div className="flex-1 w-full h-full relative">
                {files.map(f => (
                    <iframe 
                        key={f.url}
                        src={`${f.url}#toolbar=1&navpanes=1&view=FitH`}
                        className={`absolute inset-0 w-full h-full border-none ${activeFileUrl === f.url ? 'block' : 'hidden'}`}
                        title={`PDF Viewer - ${f.name}`}
                    />
                ))}
                {!activeFileUrl && (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold uppercase">
                        Select a file to view
                    </div>
                )}
            </div>
        </div>
    );
};
