"use client";

import { ProductForm } from "@/types/productForm";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";

export default function ProductMediaTab({
    form,
    setForm
}: {
    form: ProductForm;
    setForm: any;
}) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setForm((prev: any) => ({
                ...prev,
                galleryImages: [...prev.galleryImages, ...files]
            }));
        }
    };

    const removeNewImage = (index: number) => {
        setForm((prev: any) => ({
            ...prev,
            galleryImages: prev.galleryImages.filter((_: any, i: number) => i !== index)
        }));
    };

    const removeExistingImage = (publicId: string) => {
        setForm((prev: any) => ({
            ...prev,
            existingGalleryImages: prev.existingGalleryImages.filter((img: any) => img.publicId !== publicId),
            removedGalleryImages: [...prev.removedGalleryImages, publicId]
        }));
    };

    return (
        <div className="grid gap-8 p-6">
            <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Product Gallery</label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {/* Existing Images */}
                    {form.existingGalleryImages.map((img) => (
                        <div key={img.publicId} className="group relative aspect-square rounded-2xl border border-border bg-muted overflow-hidden">
                            <img src={img.url} className="h-full w-full object-cover" alt="Product" />
                            <button 
                                type="button"
                                onClick={() => removeExistingImage(img.publicId)}
                                className="absolute right-2 top-2 rounded-lg bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}

                    {/* New Images */}
                    {form.galleryImages.map((file, i) => (
                        <div key={i} className="group relative aspect-square rounded-2xl border border-border bg-muted overflow-hidden">
                            <img src={URL.createObjectURL(file)} className="h-full w-full object-cover" alt="New" />
                            <button 
                                type="button"
                                onClick={() => removeNewImage(i)}
                                className="absolute right-2 top-2 rounded-lg bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}

                    {/* Upload Trigger */}
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all">
                        <Upload className="h-8 w-8 text-text-muted" />
                        <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Add Photo</span>
                        <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                </div>
            </div>

            <div className="h-px bg-border w-full" />

            <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Technical Brochure (PDF)</label>
                <div className="flex items-center gap-6 p-6 rounded-2xl border-2 border-dashed border-border bg-muted/10">
                    <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <FileText className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-text">
                            {form.brochure?.name || form.existingBrochure?.url || "No brochure uploaded"}
                        </p>
                        <p className="text-xs text-text-muted mt-1">Upload technical data sheets or certification PDFs.</p>
                    </div>
                    <label className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white cursor-pointer hover:opacity-90">
                        Upload PDF
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="application/pdf"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setForm((prev: any) => ({ ...prev, brochure: e.target.files![0] }));
                                }
                            }}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
