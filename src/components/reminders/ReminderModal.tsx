"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import type { Reminder } from "@/types/reminder";
import { isPastDate } from "@/utils/date";
import { Pencil, Trash2, X } from "lucide-react";

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
            return;
        }

        const baseDate = date ? new Date(date) : new Date();
        const formatted = baseDate.toISOString().slice(0, 10);

        setTitle("");
        setDescription("");
        setTime("");
        setSelectedDate(formatted);
        setSelectedExpiryDate(formatted);
    }, [reminder, mode, date, open]);

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

                        <div>
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