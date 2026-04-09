"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Employee } from "@/types/attendance";
import { Check, ChevronDown, Search, UserRound, Users } from "lucide-react";

interface Props {
    employees: Employee[];
    value: Employee | null;
    onChange: (employee: Employee | null) => void;
    loading?: boolean;
}

export default function EmployeeSelect({
    employees,
    value,
    onChange,
    loading = false,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const filteredEmployees = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return employees;

        return employees.filter((employee) => {
            const userId = employee.userId?.toLowerCase() ?? "";
            return userId.includes(q);
        });
    }, [employees, query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (employee: Employee) => {
        onChange(employee);
        setQuery("");
        setActiveIndex(0);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prev) => {
            const next = !prev;
            if (next) setActiveIndex(0);
            return next;
        });

        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setActiveIndex(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
            setOpen(true);
            setActiveIndex(0);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                Math.min(prev + 1, Math.max(filteredEmployees.length - 1, 0))
            );
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        }

        if (e.key === "Enter" && filteredEmployees[activeIndex]) {
            e.preventDefault();
            handleSelect(filteredEmployees[activeIndex]);
        }

        if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div
            className="rounded-3xl border border-border bg-white p-4 shadow-sm"
            ref={wrapperRef}
        >
            <div className="mb-3 flex items-start gap-3">
                <div className="rounded-2xl bg-brand-primary/10 p-2.5 text-brand-primary">
                    <UserRound size={18} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-text">Employee</p>
                    <p className="text-xs text-text-muted">
                        Search and select a worker to manage attendance
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface">
                <button
                    type="button"
                    onClick={handleToggle}
                    className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left"
                >
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                            Active employee
                        </p>
                        <p className="truncate text-sm font-semibold text-text">
                            {value?.userId || "Select employee"}
                        </p>
                    </div>

                    <ChevronDown
                        size={18}
                        className={`shrink-0 text-text-muted transition ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {open && (
                    <div className="border-t border-border p-3">
                        <div className="relative">
                            <Search
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                            />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={handleQueryChange}
                                onKeyDown={handleKeyDown}
                                placeholder={loading ? "Loading employees..." : "Search employee"}
                                className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-text outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                                role="combobox"
                                aria-expanded={open}
                                aria-autocomplete="list"
                                aria-controls="employee-listbox"
                            />
                        </div>

                        <div
                            id="employee-listbox"
                            role="listbox"
                            className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-border bg-white p-1"
                        >
                            {loading ? (
                                <div className="px-3 py-3 text-sm text-text-muted">
                                    Loading employees...
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                                    <div className="rounded-2xl bg-muted p-3 text-text-muted">
                                        <Users size={18} />
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-text">
                                        No employee found
                                    </p>
                                    <p className="mt-1 text-xs text-text-muted">
                                        Try searching by employee ID, name, or phone
                                    </p>
                                </div>
                            ) : (
                                filteredEmployees.map((employee, index) => {
                                    const selected = value?._id === employee._id;
                                    const active = activeIndex === index;

                                    return (
                                        <button
                                            key={employee._id}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onClick={() => handleSelect(employee)}
                                            className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${active ? "bg-muted" : ""
                                                } ${selected ? "bg-brand-primary/5" : ""}`}
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-text">
                                                    {employee.userId}
                                                </p>
                                                <p className="truncate text-xs text-text-muted">
                                                    {employee.userId}
                                                </p>
                                            </div>

                                            {selected && (
                                                <span className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white">
                                                    <Check size={14} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}