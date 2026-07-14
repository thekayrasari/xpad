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
            <div
                className={`w-full h-full flex flex-col font-sans text-text-primary overflow-hidden transition-colors
                    ${isDragging ? 'border-accent-blue bg-accent-blue/10' : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <div className="xp-empty flex-1">
                    <Upload className="w-16 h-16" />
                    <p className="text-lg font-bold uppercase">Drop PDF files here</p>
                    <p className="text-sm text-text-secondary/70">FCOM, QRH, SOPs — any PDF document</p>
                    <label className="xp-btn-primary cursor-pointer mt-2">
                        <FileText className="w-4 h-4" />
                        Browse Files
                        <input type="file" accept=".pdf" multiple onChange={handleFileInput} className="hidden" />
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full font-sans text-text-primary flex flex-col overflow-hidden">
            {/* ── Top toolbar ── */}
            <div className="xp-panel-header gap-2">
                <BookOpen className="w-4 h-4 text-accent-blue shrink-0" />

                {/* File tabs */}
                <div className="flex items-center gap-1 flex-1 overflow-x-auto min-w-0">
                    {files.map(f => (
                        <div
                            key={f.url}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase
                                       shrink-0 cursor-pointer transition-colors
                                       ${activeFileUrl === f.url
                                           ? 'bg-nav-hover border border-border-dark text-text-primary'
                                           : 'text-text-secondary hover:bg-nav-hover'}`}
                            onClick={() => setActiveFile(f.url)}
                        >
                            <span className="max-w-[140px] truncate">{f.name}</span>
                            <button
                                onClick={e => { e.stopPropagation(); removeFile(f.url); }}
                                className="text-text-secondary hover:text-accent-red transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    <label className="xp-btn-ghost cursor-pointer text-xs px-3 py-1.5 shrink-0">
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
                    <div className="xp-empty h-full">
                        <span className="text-sm font-bold">Select a file to view</span>
                    </div>
                )}
            </div>
        </div>
    );
};
