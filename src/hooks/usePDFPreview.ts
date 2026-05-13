import { useState, useCallback } from "react";
import api from "@/lib/api";

export function usePDFPreview() {
    const [isOpen, setIsOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [targetName, setTargetName] = useState("");

    const preview = useCallback(async (path: string, fileName: string, displayTitle: string) => {
        setIsOpen(true);
        setPdfUrl(null);
        setTitle(displayTitle);
        setTargetName(fileName);
        setLoading(true);

        try {
            const res = await api.get(path, { responseType: "blob" });
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error("PDF Preview failed", error);
            setIsOpen(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    }, [pdfUrl]);

    const download = useCallback(() => {
        if (!pdfUrl) return;
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.setAttribute("download", targetName.endsWith(".pdf") ? targetName : `${targetName}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }, [pdfUrl, targetName]);

    return {
        isOpen,
        pdfUrl,
        title,
        loading,
        preview,
        close,
        download
    };
}
