"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { CheckCircle2, Clock3, X, XCircle, Users, Search, Calendar, CalendarRange, AlertCircle } from "lucide-react";
import { formatLocalISO } from "@/utils/date";

type AttendanceStatus = "present" | "absent" | "half-day";

interface Employee {
    _id: string;
    name: string;
    userId?: string;
    role: string;
    image?: string;
}

export default function BulkAttendanceModal({
    open,
    onClose,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
}) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [status, setStatus] = useState<AttendanceStatus>("present");
    const [advance, setAdvance] = useState("");
    const [reason, setReason] = useState("");
    
    // Date Range State
    const [isRange, setIsRange] = useState(false);
    const [startDate, setStartDate] = useState(formatLocalISO(new Date()));
    const [endDate, setEndDate] = useState(formatLocalISO(new Date()));
    
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        async function loadEmployees() {
            setLoading(true);
            try {
                const { data } = await api.get("/users");
                const validRoles = ["admin", "manager", "employee", "worker"];
                const filtered = (data || []).filter((u: Employee) => validRoles.includes(u.role) && (u as any).isActive !== false);
                setEmployees(filtered);
            } catch (error) {
                console.error("Failed to load employees", error);
            } finally {
                setLoading(false);
            }
        }

        loadEmployees();
    }, [open]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => {
            const name = e.name || "";
            const userId = e.userId || "";
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 userId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === "all" || e.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [employees, searchQuery, roleFilter]);

    const daysCount = useMemo(() => {
        if (!isRange) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 0;
    }, [isRange, startDate, endDate]);

    const toggleEmployee = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredEmployees.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredEmployees.map(e => e._id)));
        }
    };

    const handleBulkSave = async () => {
        if (selectedIds.size === 0) {
            alert("Please select at least one employee");
            return;
        }

        if (isRange && daysCount <= 0) {
            alert("End date must be after or same as start date");
            return;
        }

        setSaving(true);
        try {
            await api.post("/attendance/bulk", {
                employeeIds: Array.from(selectedIds),
                startDate,
                endDate: isRange ? endDate : undefined,
                status,
                advance: Number(advance || 0),
                reason,
            });
            await onSaved();
            onClose();
        } catch (error) {
            console.error("Bulk attendance failed", error);
            alert("Failed to mark bulk attendance");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    const statusOptions = [
        {
            value: "present",
            label: "Present",
            icon: <CheckCircle2 size={16} />,
            activeClass: "border-emerald-300 bg-emerald-50 text-emerald-700",
        },
        {
            value: "absent",
            label: "Absent",
            icon: <XCircle size={16} />,
            activeClass: "border-red-300 bg-red-50 text-red-700",
        },
        {
            value: "half-day",
            label: "Half day",
            icon: <Clock3 size={16} />,
            activeClass: "border-amber-300 bg-amber-50 text-amber-700",
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-border bg-surface shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="border-b border-border bg-white px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text">Bulk Mark Attendance</h3>
                                <p className="text-sm text-text-muted">Process multiple employees and date ranges at once.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-xl border border-border p-2.5 text-text-muted transition hover:bg-muted hover:text-text">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex h-[600px] flex-col lg:flex-row overflow-hidden">
                    {/* Left Side: Employee Selection */}
                    <div className="flex flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r bg-white/50">
                        <div className="space-y-4 p-6">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or ID..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-brand-primary"
                                    />
                                </div>
                                <select
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                                    className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-brand-primary"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admins Only</option>
                                    <option value="manager">Managers Only</option>
                                    <option value="employee">Staff Only</option>
                                    <option value="worker">Worker Only</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={toggleAll}
                                        className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                                            selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0
                                                ? "border-brand-primary bg-brand-primary text-white"
                                                : "border-border bg-white"
                                        }`}
                                    >
                                        {selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0 && <X size={14} strokeWidth={4} />}
                                    </button>
                                    <span className="text-xs font-bold text-text uppercase tracking-wider">
                                        Select All Filtered
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                    {selectedIds.size} / {filteredEmployees.length} Selected
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            {loading ? (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-text-muted italic">Loading employees...</p>
                                </div>
                            ) : filteredEmployees.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {filteredEmployees.map(e => (
                                        <button
                                            key={e._id}
                                            onClick={() => toggleEmployee(e._id)}
                                            className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                                                selectedIds.has(e._id)
                                                    ? "border-brand-primary/30 bg-brand-primary/5 ring-1 ring-brand-primary/20"
                                                    : "border-border bg-white hover:border-brand-primary/30"
                                            }`}
                                        >
                                            {e.image ? (
                                                <img 
                                                    src={e.image} 
                                                    alt={e.name} 
                                                    className="h-8 w-8 rounded-lg object-cover border border-border"
                                                />
                                            ) : (
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                                                    selectedIds.has(e._id)
                                                        ? "border-brand-primary bg-brand-primary text-white"
                                                        : "border-border bg-muted/50 text-text-muted"
                                                }`}>
                                                    {selectedIds.has(e._id) ? <X size={14} strokeWidth={4} /> : <Users size={14} />}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-text">{e.name}</p>
                                                <p className="text-[10px] text-text-muted uppercase tracking-wider">{e.role} • {e.userId || e._id.slice(-6)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-text-muted">
                                    <p className="text-sm">No employees found matching filters.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Settings */}
                    <div className="w-full bg-muted/30 lg:w-[400px] flex flex-col">
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {/* Date Selection Toggle */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-text">Select Mode</label>
                                <div className="flex p-1 bg-white border border-border rounded-2xl">
                                    <button
                                        onClick={() => setIsRange(false)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
                                            !isRange ? "bg-brand-primary text-white shadow-md" : "text-text-muted hover:bg-muted"
                                        }`}
                                    >
                                        <Calendar size={16} />
                                        Single Day
                                    </button>
                                    <button
                                        onClick={() => setIsRange(true)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
                                            isRange ? "bg-brand-primary text-white shadow-md" : "text-text-muted hover:bg-muted"
                                        }`}
                                    >
                                        <CalendarRange size={16} />
                                        Date Range
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text">{isRange ? "Start Date" : "Mark for Date"}</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-brand-primary"
                                    />
                                </div>

                                {isRange && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-brand-primary"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-text">Attendance Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {statusOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setStatus(opt.value as AttendanceStatus)}
                                            className={`flex flex-col items-center gap-2 rounded-2xl border py-4 text-xs font-bold transition ${
                                                status === opt.value
                                                    ? opt.activeClass
                                                    : "border-border bg-white text-text-muted hover:border-brand-primary/30"
                                            }`}
                                        >
                                            {opt.icon}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-text">Daily Advance</label>
                                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Per Day / Per Person</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">₹</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={advance}
                                        onChange={e => setAdvance(e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-border bg-white pl-9 pr-4 text-sm outline-none transition focus:border-brand-primary"
                                    />
                                </div>
                                {isRange && (
                                    <div className="flex items-start gap-2 rounded-xl bg-brand-primary/5 p-3 text-[11px] text-brand-primary border border-brand-primary/10">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                        <p>Advance will be applied to <strong>each</strong> of the {daysCount} days selected.</p>
                                    </div>
                                )}
                            </div>

                            {(status === "absent" || status === "half-day") && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-bold text-text">
                                        Reason for {status === "absent" ? "Absence" : "Half-day"}
                                        <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted opacity-60">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder={`e.g. Festival, Medical leave...`}
                                        className="w-full rounded-2xl border border-border bg-white p-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 resize-none"
                                        rows={2}
                                    />
                                </div>
                            )}

                            {/* Summary Box */}
                            <div className="rounded-[24px] bg-white p-5 shadow-sm border border-border">
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.12em]">Action Summary</h4>
                                <div className="mt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Selection</span>
                                        <span className="font-bold text-text">{selectedIds.size} Employees</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Duration</span>
                                        <span className="font-bold text-text">{daysCount} Days</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-dashed">
                                        <span className="text-text-muted font-medium italic">Total Operations</span>
                                        <span className="font-bold text-brand-primary">{selectedIds.size * daysCount} Records</span>
                                    </div>
                                    {Number(advance) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">Total Advance</span>
                                            <span className="font-bold text-amber-600">₹{Math.round(Number(advance) * selectedIds.size * daysCount).toLocaleString("en-IN")}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border bg-white px-8 py-6">
                    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
                        <button
                            disabled={saving}
                            onClick={onClose}
                            className="h-12 rounded-2xl border border-border px-8 text-sm font-bold text-text transition hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={saving || selectedIds.size === 0 || (isRange && daysCount <= 0)}
                            onClick={handleBulkSave}
                            className="h-12 rounded-2xl bg-brand-primary px-10 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Processing..." : `Mark ${selectedIds.size * daysCount} Attendance Records`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
