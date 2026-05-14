"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import type { Reminder } from "@/types/reminder";
import { isPastDate } from "@/utils/date";
import { Pencil, Trash2, X, User as UserIcon, Loader2, ChevronDown } from "lucide-react";

interface Props {
    open: boolean;
    mode: "create" | "edit";
    date?: Date;
    reminder?: Reminder | null;
    reminders?: Reminder[];
    onClose: () => void;
    onSaved: () => void | Promise<void>;
}

export default function ReminderModal({
    open,
    mode,
    date,
    reminder,
    reminders = [],
    onClose,
    onSaved,
}: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [time, setTime] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedExpiryDate, setSelectedExpiryDate] = useState("");
    const [priority, setPriority] = useState<Reminder['priority']>("medium");
    const [repeat, setRepeat] = useState<Reminder['repeat']>("none");
    const [customDays, setCustomDays] = useState<number>(1);
    const [assignedTo, setAssignedTo] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [isUserListLoading, setIsUserListLoading] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (reminder && mode === "edit") {
            setTitle(reminder.title || "");
            setDescription(reminder.description || "");
            setTime(reminder.time || "");
            setSelectedDate(new Date(reminder.date).toISOString().slice(0, 10));
            setSelectedExpiryDate(
                new Date(reminder.expiryDate).toISOString().slice(0, 10)
            );
            setPriority(reminder.priority || "medium");
            setRepeat(reminder.repeat || "none");
            setCustomDays(reminder.customDays || 1);
            setAssignedTo(reminder.assignedTo || "");
            return;
        }

        const baseDate = date ? new Date(date) : new Date();
        const formatted = baseDate.toISOString().slice(0, 10);

        setTitle("");
        setDescription("");
        setTime("");
        setSelectedDate(formatted);
        setSelectedExpiryDate(formatted);
        setPriority("medium");
        setRepeat("none");
        setCustomDays(1);
        setAssignedTo("");
    }, [reminder, mode, date, open]);

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            setIsUserListLoading(true);
            const { data } = await api.get("/users?isActive=true");
            setUsers(data || []);
        } catch (error) {
            console.error("Failed to fetch users for assignment:", error);
        } finally {
            setIsUserListLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!assignedTo) return users;
        const q = assignedTo.toLowerCase();
        return users.filter(u => 
            u.name?.toLowerCase().includes(q) || 
            u.userId?.toLowerCase().includes(q)
        );
    }, [users, assignedTo]);

    const resolvedDate = useMemo(() => {
        return selectedDate ? new Date(selectedDate) : date || new Date();
    }, [selectedDate, date]);

    const isPastCreate = mode === "create" && isPastDate(resolvedDate);

    const save = async () => {
        if (!title.trim()) {
            alert("Title is required");
            return;
        }

        if (!selectedDate || !selectedExpiryDate) {
            alert("Date and expiry date are required");
            return;
        }

        if (new Date(selectedExpiryDate) < new Date(selectedDate)) {
            alert("Expiry date cannot be before reminder date");
            return;
        }

        if (isPastCreate) {
            alert("You cannot add a reminder to a past date");
            return;
        }

        const payload = {
            title: title.trim(),
            description: description.trim() || undefined,
            date: selectedDate,
            expiryDate: selectedExpiryDate,
            time: time || undefined,
            priority,
            repeat,
            customDays: repeat === "custom" ? customDays : undefined,
            assignedTo: assignedTo.trim() || undefined,
        };

        try {
            setSaving(true);

            if (mode === "edit" && reminder) {
                await api.put(`/reminders/${reminder._id}`, payload);
            } else {
                await api.post("/reminders", payload);
            }

            await onSaved();
        } catch (error) {
            console.error("Failed to save reminder:", error);
            alert("Failed to save reminder");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id: string) => {
        const confirmed = window.confirm("Delete this reminder?");
        if (!confirmed) return;

        try {
            await api.delete(`/reminders/${id}`);
            await onSaved();
        } catch (error) {
            console.error("Failed to delete reminder:", error);
            alert("Failed to delete reminder");
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-[28px] border border-border bg-surface shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-border px-6 py-5">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
                            Reminder
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-text">
                            {mode === "edit" ? "Edit reminder" : "Create reminder"}
                        </h3>
                        <p className="mt-1 text-sm text-text-muted">
                            Add due dates, notes and expiry timing for better follow-up.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl border border-border bg-white p-2 text-text transition hover:bg-muted"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-4">
                                                <div className="relative w-full">
                            <label className="mb-2 block text-sm font-medium text-text">
                                Assigned To
                            </label>
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        className="w-full rounded-2xl border border-border bg-white pl-4 pr-10 py-3 text-sm outline-none transition focus:border-brand-primary"
                                        placeholder="Search user or enter custom name"
                                        value={assignedTo}
                                        onFocus={() => setShowUserList(true)}
                                        onChange={(e) => {
                                            setAssignedTo(e.target.value);
                                            setShowUserList(true);
                                        }}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-text-muted">
                                        {isUserListLoading && <Loader2 size={16} className="animate-spin" />}
                                        <ChevronDown size={18} className={`transition-transform duration-200 ${showUserList ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {showUserList && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-60" 
                                            onClick={() => setShowUserList(false)}
                                        />
                                        <div className="absolute left-0 right-0 top-full z-70 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-border bg-white py-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                                            {filteredUsers.length > 0 ? (
                                                <div className="px-2 pb-2 border-b border-border mb-1">
                                                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                                        Select Team Member
                                                    </p>
                                                </div>
                                            ) : null}

                                            {filteredUsers.map((u) => (
                                                <button
                                                    key={u._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setAssignedTo(u.name || u.userId);
                                                        setShowUserList(false);
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-muted"
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-text">
                                                            {u.name || "No Name"}
                                                        </p>
                                                        <p className="truncate text-[10px] text-text-muted uppercase">
                                                            ID: {u.userId} • {u.role}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}

                                            {assignedTo && !users.some(u => (u.name || u.userId) === assignedTo) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowUserList(false)}
                                                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-muted border-t border-border mt-1 pt-3"
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 text-text-muted">
                                                        <Pencil size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-text">
                                                            Use custom: &quot;{assignedTo}&quot;
                                                        </p>
                                                        <p className="truncate text-[10px] text-text-muted">
                                                            Manually entered name
                                                        </p>
                                                    </div>
                                                </button>
                                            )}

                                            {filteredUsers.length === 0 && !assignedTo && (
                                                <div className="px-4 py-6 text-center">
                                                    <p className="text-xs text-text-muted">No active users found</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-text">
                                Title
                            </label>
                            <input
                                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary"
                                placeholder="Enter reminder title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-text">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary"
                                placeholder="Optional note or context"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">
                                    Reminder date
                                </label>
                                <input
                                    type="date"
                                    min={mode === "create" ? new Date().toISOString().slice(0, 10) : undefined}
                                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">
                                    Time
                                </label>
                                <input
                                    type="time"
                                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="">
                                <label className="mb-2 block text-sm font-medium text-text">
                                    Expiry date
                                </label>
                                <input
                                    type="date"
                                    min={selectedDate || new Date().toISOString().slice(0, 10)}
                                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary"
                                    value={selectedExpiryDate}
                                    onChange={(e) => setSelectedExpiryDate(e.target.value)}
                                />
                            </div>
                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-text">
                                    Recurring Option
                                </label>
                                <div className="w-full">
                                    <select
                                        value={repeat}
                                        onChange={(e) => setRepeat(e.target.value as any)}
                                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary"
                                    >
                                        <option value="none">No Repeat</option>
                                        <option value="hourly">Every Hour</option>
                                        <option value="daily">Every Day</option>
                                        <option value="3days">Every 3 Days</option>
                                        <option value="weekly">Every Week</option>
                                        <option value="15days">Every 15 Days</option>
                                        <option value="monthly">Every Month</option>
                                        <option value="6monthly">Every 6 Months</option>
                                        <option value="yearly">Every Year</option>
                                        <option value="custom">Custom Days</option>
                                    </select>

                                    {repeat === "custom" && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="number"
                                                min={1}
                                                className="w-20 rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary"
                                                value={customDays}
                                                onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                                            />
                                            <span className="text-sm text-text-muted">Days</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">
                                    Priority
                                </label>
                                <div className="flex gap-2">
                                    {(['low', 'medium', 'high'] as const).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={`flex-1 rounded-xl border py-2 px-4 text-xs font-semibold capitalize transition ${priority === p
                                                ? p === 'high'
                                                    ? 'border-red-500 bg-red-50 text-red-700'
                                                    : p === 'medium'
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-border bg-white text-text-muted hover:bg-muted'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isPastCreate && (
                            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                                You cannot create a reminder for a past date.
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-3xl border border-border bg-white p-4">
                            <h4 className="text-sm font-semibold text-text">Quick summary</h4>
                            <div className="mt-3 space-y-2 text-sm text-text-muted">
                                <p>
                                    <span className="font-medium text-text">Date:</span>{" "}
                                    {selectedDate || "--"}
                                </p>
                                <p>
                                    <span className="font-medium text-text">Time:</span>{" "}
                                    {time || "--"}
                                </p>
                                <p>
                                    <span className="font-medium text-text">Expiry:</span>{" "}
                                    {selectedExpiryDate || "--"}
                                </p>
                                <p>
                                    <span className="font-medium text-text">Priority:</span>{" "}
                                    <span className="capitalize">{priority}</span>
                                </p>
                                {repeat !== 'none' && (
                                    <p>
                                        <span className="font-medium text-text">Repeat:</span>{" "}
                                        <span className="capitalize">{repeat === 'custom' ? `Every ${customDays} days` : repeat}</span>
                                    </p>
                                )}
                                {assignedTo && (
                                    <p>
                                        <span className="font-medium text-text">Assignee:</span>{" "}
                                        {assignedTo}
                                    </p>
                                )}
                            </div>
                        </div>

                        {date && reminders.length > 0 && (
                            <div className="rounded-3xl border border-border bg-white p-4">
                                <h4 className="text-sm font-semibold text-text">
                                    Existing on selected date
                                </h4>

                                <div className="mt-3 space-y-3">
                                    {reminders.map((r) => (
                                        <div
                                            key={r._id}
                                            className="rounded-2xl border border-border bg-surface px-3 py-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-text">
                                                        {r.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-text-muted">
                                                        {new Date(r.date).toLocaleDateString("en-IN")}
                                                        {r.time ? ` • ${r.time}` : ""}
                                                    </p>
                                                </div>

                                                {mode === "edit" && reminder?._id === r._id ? null : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setTitle(r.title || "");
                                                                setDescription(r.description || "");
                                                                setTime(r.time || "");
                                                                setSelectedDate(
                                                                    new Date(r.date).toISOString().slice(0, 10)
                                                                );
                                                                setSelectedExpiryDate(
                                                                    new Date(r.expiryDate).toISOString().slice(0, 10)
                                                                );
                                                                setPriority(r.priority || "medium");
                                                                setRepeat(r.repeat || "none");
                                                                setCustomDays(r.customDays || 1);
                                                                setAssignedTo(r.assignedTo || "");
                                                            }}
                                                            className="rounded-lg border border-border p-2 text-text hover:bg-muted"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>

                                                        <button
                                                            onClick={() => remove(r._id)}
                                                            className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
                    <button
                        onClick={onClose}
                        className="rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-text transition hover:bg-muted"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-2xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : mode === "edit" ? "Update reminder" : "Save reminder"}
                    </button>
                </div>
            </div>
        </div>
    );
}