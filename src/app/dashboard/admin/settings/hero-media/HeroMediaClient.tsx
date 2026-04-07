"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import api from "@/lib/api";
import {
    GripVertical,
    ImageIcon,
    Trash2,
    UploadCloud,
    Video,
    Images,
    Film,
    Sparkles,
} from "lucide-react";

interface HeroMedia {
    _id: string;
    type: "image" | "video";
    url: string;
    order: number;
}

export default function HeroMediaClient() {
    const [items, setItems] = useState<HeroMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const fetchMedia = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get<HeroMedia[]>("/hero-media");
            const sorted = [...res.data].sort((a, b) => a.order - b.order);
            setItems(sorted);
        } catch (error) {
            console.error("Failed to fetch hero media:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const uploadMultiple = async (files: File[]) => {
        if (!files.length) return;

        setUploading(true);

        try {
            for (const file of files) {
                const form = new FormData();
                form.append("file", file);

                await api.post("/hero-media", form, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            await fetchMedia();
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this media?")) return;

        try {
            await api.delete(`/hero-media/${id}`);
            setItems((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const onDragStart = (id: string) => {
        if (uploading) return;
        setDraggedId(id);
    };

    const onDrop = async (targetId: string) => {
        if (!draggedId || draggedId === targetId) {
            setDragOverId(null);
            return;
        }

        const updated = [...items];
        const fromIndex = updated.findIndex((i) => i._id === draggedId);
        const toIndex = updated.findIndex((i) => i._id === targetId);

        if (fromIndex === -1 || toIndex === -1) {
            setDragOverId(null);
            setDraggedId(null);
            return;
        }

        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);

        const reordered = updated.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        setItems(reordered);
        setDraggedId(null);
        setDragOverId(null);

        try {
            await api.put("/hero-media/reorder", {
                items: reordered.map((item) => ({
                    id: item._id,
                    order: item.order,
                })),
            });
        } catch (error) {
            console.error("Reorder failed:", error);
            fetchMedia();
        }
    };

    const stats = useMemo(() => {
        return {
            total: items.length,
            images: items.filter((item) => item.type === "image").length,
            videos: items.filter((item) => item.type === "video").length,
        };
    }, [items]);

    const getPositionLabel = (index: number) => {
        if (index === 0) return "Primary";
        if (index === 1) return "Secondary";
        if (index === 2) return "Third";
        return `#${index + 1}`;
    };

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-border bg-linear-to-br from-surface via-white to-surface p-6 shadow-sm">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-medium text-text-muted backdrop-blur">
                            <Sparkles size={14} className="text-primary" />
                            Homepage visual manager
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">
                            Hero Media
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-text-muted">
                            Curate the visual sequence for your homepage hero section. Upload
                            images or videos, reorder them with drag and drop, and keep the
                            strongest media first.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:w-auto">
                        <StatCard
                            label="Total"
                            value={stats.total}
                            icon={<Images size={16} />}
                        />
                        <StatCard
                            label="Images"
                            value={stats.images}
                            icon={<ImageIcon size={16} />}
                        />
                        <StatCard
                            label="Videos"
                            value={stats.videos}
                            icon={<Film size={16} />}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-[28px] border border-border bg-surface p-4 shadow-sm md:p-5">
                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-linear-to-br from-white to-surface px-6 py-12 text-center transition hover:border-primary/40 hover:bg-white">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm transition group-hover:scale-105">
                        <UploadCloud size={24} />
                    </div>

                    <p className="text-sm font-semibold text-text">
                        {uploading ? "Uploading hero media..." : "Upload images or videos"}
                    </p>

                    <p className="mt-2 max-w-md text-xs leading-5 text-text-muted">
                        Add multiple files at once. Reorder later to control which visual
                        appears first in your homepage hero rotation.
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-text-muted">
                        <ImageIcon size={12} />
                        Images
                        <span className="h-1 w-1 rounded-full bg-text-muted/40" />
                        <Video size={12} />
                        Videos
                    </div>

                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        disabled={uploading}
                        className="hidden"
                        onChange={(e) => {
                            if (!e.target.files) return;
                            uploadMultiple(Array.from(e.target.files));
                            e.target.value = "";
                        }}
                    />
                </label>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="overflow-hidden rounded-[26px] border border-border bg-white p-3 shadow-sm"
                        >
                            <div className="h-56 animate-pulse rounded-[20px] bg-muted" />
                            <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-muted" />
                            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[28px] border border-border bg-white px-6 py-20 text-center shadow-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted text-text-muted">
                        <ImageIcon size={28} />
                    </div>
                    <h3 className="text-base font-semibold text-text">No hero media yet</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
                        Upload your first image or video to start building the homepage hero
                        sequence.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {items.map((item, index) => {
                        const isDragging = draggedId === item._id;
                        const isDragOver = dragOverId === item._id;
                        const isPrimary = index === 0;

                        return (
                            <div
                                key={item._id}
                                draggable={!uploading}
                                onDragStart={() => onDragStart(item._id)}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (dragOverId !== item._id) setDragOverId(item._id);
                                }}
                                onDragLeave={() => {
                                    if (dragOverId === item._id) setDragOverId(null);
                                }}
                                onDrop={() => onDrop(item._id)}
                                className={`group overflow-hidden rounded-[28px] border bg-white p-3 shadow-sm transition-all ${isDragging
                                        ? "scale-[0.985] opacity-60"
                                        : isDragOver
                                            ? "border-primary ring-2 ring-primary/15"
                                            : "border-border hover:-translate-y-0.5 hover:shadow-md"
                                    }`}
                            >
                                <div className="relative overflow-hidden rounded-[22px] bg-muted">
                                    {item.type === "image" ? (
                                        <Image
                                            src={item.url}
                                            alt={`Hero media ${index + 1}`}
                                            width={600}
                                            height={420}
                                            className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <video
                                            src={item.url}
                                            className="h-56 w-full object-cover"
                                            muted
                                            loop
                                            playsInline
                                        />
                                    )}

                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

                                    <div className="absolute left-3 top-3 flex items-center gap-2">
                                        <div className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                                            {item.type === "image" ? (
                                                <ImageIcon size={12} />
                                            ) : (
                                                <Video size={12} />
                                            )}
                                            {item.type}
                                        </div>

                                        {isPrimary && (
                                            <div className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                                                Live first
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute right-3 top-3 flex items-center gap-2">
                                        <div className="rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                                            {getPositionLabel(index)}
                                        </div>

                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur">
                                            <GripVertical size={14} />
                                        </div>
                                    </div>

                                    <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-white">
                                                Hero media {index + 1}
                                            </p>
                                            <p className="mt-0.5 text-xs text-white/75">
                                                Drag to change homepage order
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => remove(item._id)}
                                            className="pointer-events-auto inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3 px-1">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-text">
                                            {isPrimary ? "Primary hero asset" : `Position ${index + 1}`}
                                        </p>
                                        <p className="mt-0.5 text-xs text-text-muted">
                                            {item.type === "image"
                                                ? "Used as homepage visual image"
                                                : "Used as homepage visual video"}
                                        </p>
                                    </div>

                                    <div className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-text-muted">
                                        Order {index + 1}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-wide text-text-muted">
                    {label}
                </p>
                <div className="text-primary">{icon}</div>
            </div>
            <p className="mt-2 text-xl font-semibold text-text">{value}</p>
        </div>
    );
}