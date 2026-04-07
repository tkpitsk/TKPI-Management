"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface Option {
    _id: string;
    name: string;
}

type RawOption = {
    _id: string;
    name?: string;
    productName?: string;
    title?: string;
    size?: string;
    grade?: string;
    thickness?: string;
};

/* ================= COMPONENT ================= */

export default function SearchSelect({
    label,
    value,
    onChange,
    fetchUrl,
    disabled,
}: {
    label: string;
    value?: string;
    onChange: (value: string, label: string) => void;
    fetchUrl: string;
    disabled?: boolean;
}) {
    const [data, setData] = useState<Option[]>([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ================= FETCH ================= */

    useEffect(() => {
        if (!fetchUrl || disabled) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await api.get(fetchUrl);

                /* 🔥 HANDLE BOTH RESPONSE TYPES */
                const raw = Array.isArray(res.data)
                    ? res.data
                    : res.data?.data || [];

                const normalized: Option[] = raw.map((item: RawOption) => {
                    /* VARIANT TYPE */
                    if (item.size || item.grade || item.thickness) {
                        return {
                            _id: item._id,
                            name: [item.size, item.grade, item.thickness]
                                .filter(Boolean)
                                .join(" • "),
                        };
                    }

                    /* NORMAL TYPE */
                    return {
                        _id: item._id,
                        name:
                            item.name ||
                            item.productName ||
                            item.title ||
                            "Unnamed",
                    };
                });

                setData(normalized);
            } catch (err) {
                console.error("SearchSelect error:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchUrl, disabled]);

    /* ================= OUTSIDE CLICK ================= */

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest(".search-select")) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () =>
            document.removeEventListener("click", handleClickOutside);
    }, []);

    /* ================= FILTER ================= */

    const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedItem = data.find((d) => d._id === value);

    /* ================= UI ================= */

    return (
        <div className="search-select relative space-y-1.5">
            {/* LABEL */}
            <label className="text-xs font-medium text-text-secondary">
                {label}
            </label>

            {/* INPUT */}
            <div
                className={`
                    relative rounded-xl px-3 py-2.5 transition-all duration-200
                    border border-border bg-surface shadow-sm

                    ${open ? "ring-2 ring-accent/20 border-accent" : ""}
                    ${disabled
                        ? "bg-muted opacity-70 cursor-not-allowed"
                        : "hover:border-accent/40"}
                `}
            >
                <input
                    disabled={disabled}
                    value={open ? search : selectedItem?.name || ""}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setOpen(true);
                    }}
                    placeholder={`Search ${label}`}
                    className="w-full text-sm text-text-primary outline-none bg-transparent placeholder:text-text-muted"
                />

                <span
                    className={`
                        absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-all duration-200
                        ${open ? "text-accent rotate-180" : "text-text-muted"}
                    `}
                >
                    ⌄
                </span>
            </div>

            {/* DROPDOWN */}
            {open && !disabled && (
                <div className="absolute z-30 mt-2 w-full bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">

                    <div className="max-h-60 overflow-y-auto">

                        {/* LOADING */}
                        {loading && (
                            <div className="px-4 py-6 text-center text-sm text-text-muted">
                                Loading...
                            </div>
                        )}

                        {/* OPTIONS */}
                        {!loading &&
                            filtered.map((item) => {
                                const isSelected = value === item._id;

                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => {
                                            onChange(item._id, item.name);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className={`
                                            px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-all

                                            ${isSelected
                                                ? "bg-accent text-(--color-accent-foreground) capitalize"
                                                : "text-text-primary hover:bg-muted"}
                                        `}
                                    >
                                        <span className="truncate capitalize">
                                            {item.name}
                                        </span>

                                        {isSelected && (
                                            <span className="text-xs opacity-80">
                                                ✔
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                        {/* EMPTY */}
                        {!loading && filtered.length === 0 && (
                            <div className="px-4 py-6 text-center text-sm text-text-muted">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}