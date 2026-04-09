"use client";

import { useEffect, useMemo, useState } from "react";
import UpcomingReminders from "@/components/reminders/UpcomingReminders";
import type { Reminder } from "@/types/reminder";
import { CalendarDays, Clock3, AlertTriangle, BellRing } from "lucide-react";
import api from "@/lib/api";


export default function AdminDashboardPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/reminders");
      setReminders(res.data || []);
    } catch (err: unknown) {
      console.error("Failed to fetch reminders:", err);

      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(error?.response?.data?.message || "Failed to fetch reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleDeleteReminder = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this reminder?");
    if (!confirmed) return;

    try {
      await api.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((item) => item._id !== id));

      if (selectedReminder?._id === id) {
        setSelectedReminder(null);
      }
    } catch (err: unknown) {
      console.error("Delete reminder failed:", err);

      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      alert(error?.response?.data?.message || "Failed to delete reminder");
    }
  };

  const now = new Date();

  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const expired = useMemo(() => {
    const now = new Date();

    return reminders.filter(
      (r) => r.expiryDate && new Date(r.expiryDate) < now
    );
  }, [reminders]);

  const today = useMemo(() => {
    const now = new Date();

    const isToday = (dateString?: string) => {
      if (!dateString) return false;
      const d = new Date(dateString);

      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    };

    return reminders.filter((r) => isToday(r.date));
  }, [reminders]);

  const upcoming = useMemo(() => {
    const now = new Date();

    return reminders.filter(
      (r) =>
        r.date &&
        new Date(r.date) > now &&
        (!r.expiryDate || new Date(r.expiryDate) >= now)
    );
  }, [reminders]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="h-8 w-40 animate-pulse rounded-xl bg-muted" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-16 w-64 animate-pulse rounded-2xl bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <div className="h-105 animate-pulse rounded-2xl border border-border bg-surface" />
          <div className="h-105 animate-pulse rounded-2xl border border-border bg-surface" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-700">Failed to load dashboard</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={fetchReminders}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Dashboard
          </h1>
          <p className="text-sm text-text-muted">
            Track important reminder activity and priority actions for the day.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Snapshot
          </p>
          <p className="mt-1 text-sm font-medium text-text capitalize">
            {reminders.length} total reminders in system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Reminders"
          value={reminders.length}
          helper="All scheduled reminder records"
          icon={<BellRing size={18} />}
          tone="default"
        />

        <StatCard
          title="Due Today"
          value={today.length}
          helper="Reminders scheduled for today"
          icon={<CalendarDays size={18} />}
          tone="blue"
        />

        <StatCard
          title="Upcoming"
          value={upcoming.length}
          helper="Future reminders still active"
          icon={<Clock3 size={18} />}
          tone="amber"
        />

        <StatCard
          title="Expired"
          value={expired.length}
          helper="Need review or cleanup"
          icon={<AlertTriangle size={18} />}
          tone="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="min-w-0">
          <UpcomingReminders
            reminders={reminders}
            onDelete={handleDeleteReminder}
            onSelect={setSelectedReminder}
          />
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text">Reminder Summary</h3>
          </div>

          <div className="mt-4 space-y-3">
            <SummaryRow
              label="Today’s reminders"
              value={`${today.length} item${today.length !== 1 ? "s" : ""}`}
            />
            <SummaryRow
              label="Upcoming active"
              value={`${upcoming.length} item${upcoming.length !== 1 ? "s" : ""}`}
            />
            <SummaryRow
              label="Expired reminders"
              value={`${expired.length} item${expired.length !== 1 ? "s" : ""}`}
              danger={expired.length > 0}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-muted p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Notes
            </p>

            {selectedReminder ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-semibold text-text">
                  {selectedReminder.title}
                </p>

                {selectedReminder.description && (
                  <p className="text-sm leading-6 text-text-muted">
                    {selectedReminder.description}
                  </p>
                )}

                <p className="text-xs text-text-muted">
                  Reminder date:{" "}
                  {new Date(selectedReminder.date).toLocaleDateString("en-IN")}
                </p>

                <p className="text-xs text-text-muted">
                  Expiry date:{" "}
                  {new Date(selectedReminder.expiryDate).toLocaleDateString("en-IN")}
                </p>

                {selectedReminder.time && (
                  <p className="text-xs text-text-muted">
                    Time: {selectedReminder.time}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Select a reminder from the list to preview its details here.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  helper,
  icon,
  tone = "default",
}: {
  title: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
  tone?: "default" | "blue" | "amber" | "red";
}) {
  const toneMap = {
    default: "bg-black/5 text-text",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {title}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-text">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-2.5 ${toneMap[tone]}`}>{icon}</div>
      </div>

      <p className="mt-3 text-sm text-text-muted">{helper}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl bg-muted px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 text-base font-semibold ${danger ? "text-red-600" : "text-text"}`}>
        {value}
      </p>
    </div>
  );
}