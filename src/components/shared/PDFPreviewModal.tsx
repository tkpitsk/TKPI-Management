"use client";

import { X, Download, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PDFPreviewModalProps {
    open: boolean;
    onClose: () => void;
    pdfUrl: string | null;
    title: string;
    onDownload: () => void;
    downloading?: boolean;
}

export default function PDFPreviewModal({
    open,
    onClose,
    pdfUrl,
    title,
    onDownload,
    downloading = false,
}: PDFPreviewModalProps) {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative flex flex-col overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-2xl transition-all duration-300 ${isMaximized ? "h-full w-full" : "h-[90vh] w-full max-w-5xl"
                    }`}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                            <Maximize2 size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-text">{title}</h3>
                            <p className="text-xs text-text-muted">Previewing document before download</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            className="hidden h-10 w-10 items-center justify-center rounded-xl text-text-muted transition hover:bg-muted hover:text-text sm:flex"
                        >
                            {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition hover:bg-muted hover:text-text"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body - PDF Viewer */}
                <div className="relative flex-1 bg-muted/30">
                    {!pdfUrl ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4">
                            <Loader2 size={32} className="animate-spin text-brand-primary" />
                            <p className="text-sm font-medium text-text-muted text-center">
                                Generating high-quality preview...<br />
                                This may take a few seconds for bulk reports.
                            </p>
                        </div>
                    ) : (
                        <iframe
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="h-full w-full border-none"
                            title="PDF Preview"
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-between border-t border-border bg-surface/50 px-6 py-4">
                    <p className="hidden text-xs text-text-muted sm:block">
                        Tip: You can use the buttons above to maximize the view.
                    </p>
                    <div className="flex w-full items-center gap-3 sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-border bg-white px-6 py-2.5 text-sm font-medium text-text transition hover:bg-muted sm:flex-none"
                        >
                            Close Preview
                        </button>
                        <button
                            disabled={!pdfUrl || downloading}
                            onClick={onDownload}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50 sm:flex-none"
                        >
                            {downloading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
