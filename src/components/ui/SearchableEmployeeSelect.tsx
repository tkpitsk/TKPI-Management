"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, User2 } from "lucide-react";

type EmployeeOption = {
    _id: string;
    name: string;
    userId?: string;
};

interface SearchableEmployeeSelectProps {
    value: string;
    options: EmployeeOption[];
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchableEmployeeSelect({
    value,
    options,
    onChange,
    placeholder = "Search employee by name or ID",
}: SearchableEmployeeSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);

    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const listboxId = React.useId();

    const selected = options.find((item) => item._id === value);

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;

        return options.filter((item) => {
            const name = item.name?.toLowerCase() || "";
            const id = item._id?.toLowerCase() || "";
            const userId = item.userId?.toLowerCase() || "";
            return name.includes(q) || id.includes(q) || userId.includes(q);
        });
    }, [options, query]);

    React.useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    React.useEffect(() => {
        if (open) {
            setActiveIndex(0);
            const timer = setTimeout(() => inputRef.current?.focus(), 30);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!filtered.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % filtered.length);
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const picked = filtered[activeIndex];
            if (picked) {
                onChange(picked._id);
                setOpen(false);
                setQuery("");
            }
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full min-w-70 sm:w-85">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={listboxId}
                className={`group flex h-13 w-full items-center justify-between rounded-2xl border bg-white px-4 text-left shadow-sm transition ${open
                        ? "border-brand-primary/40 ring-4 ring-brand-primary/10"
                        : "border-border hover:border-brand-primary/25"
                    }`}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
                        <User2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <p
                            className={`truncate text-sm font-medium ${selected ? "text-text" : "text-text-muted"
                                }`}
                        >
                            {selected ? selected.name : placeholder}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                            {selected
                                ? `ID: ${selected.userId || selected._id}`
                                : "Select employee"}
                        </p>
                    </div>
                </div>

                <ChevronsUpDown
                    className={`h-4 w-4 shrink-0 text-text-muted transition ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-[22px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                    <div className="border-b border-border bg-surface/80 p-3">
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 shadow-sm">
                            <Search className="h-4 w-4 text-text-muted" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setActiveIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                role="combobox"
                                aria-expanded={open}
                                aria-controls={listboxId}
                                aria-autocomplete="list"
                                placeholder="Type name, employee ID or user ID..."
                                className="h-11 w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                            />
                        </div>
                    </div>

                    <div
                        id={listboxId}
                        role="listbox"
                        className="max-h-80 overflow-y-auto p-2"
                    >
                        {filtered.length > 0 ? (
                            filtered.map((item, index) => {
                                const active = item._id === value;
                                const highlighted = index === activeIndex;

                                return (
                                    <button
                                        key={item._id}
                                        type="button"
                                        role="option"
                                        aria-selected={active}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => {
                                            onChange(item._id);
                                            setOpen(false);
                                            setQuery("");
                                        }}
                                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${highlighted
                                                ? "bg-muted"
                                                : active
                                                    ? "bg-brand-primary/8"
                                                    : "bg-transparent"
                                            }`}
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-text">
                                                {item.name}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                                                <span className="rounded-full bg-black/5 px-2 py-0.5">
                                                    {item.userId || "No user ID"}
                                                </span>
                                                <span className="truncate">Ref: {item._id}</span>
                                            </div>
                                        </div>

                                        <Check
                                            className={`ml-3 h-4 w-4 shrink-0 ${active ? "text-brand-primary" : "text-transparent"
                                                }`}
                                        />
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-text-muted">
                                    <Search className="h-4 w-4" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-text">No employee found</p>
                                <p className="mt-1 text-xs text-text-muted">
                                    Try searching by name, employee ID, or user ID
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}