"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  X, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  User, 
  Bell, 
  Wallet,
  Loader2,
  AlertCircle
} from "lucide-react";

interface DailyData {
  date: string;
  attendance: any[];
  advances: any[];
  reminders: any[];
}

export default function DailyOverviewModal({
  open,
  date,
  onClose,
}: {
  open: boolean;
  date: Date | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    if (open && date) {
      fetchOverview();
    }
  }, [open, date]);

  const fetchOverview = async () => {
    if (!date) return;
    try {
      setLoading(true);
      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const { data } = await api.get(`/daily-overview?date=${dateStr}`);
      setData(data);
    } catch (error) {
      console.error("Failed to fetch daily overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !date) return null;

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const filteredAttendance = data?.attendance.filter((a) => {
    const name = a.employee?.name?.toLowerCase() || "";
    const userId = a.employee?.userId?.toLowerCase() || "";
    const role = a.employee?.role || "";
    const searchTerm = search.toLowerCase();
    
    const matchesSearch = name.includes(searchTerm) || userId.includes(searchTerm);
    const matchesRole = roleFilter === "all" || role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const filteredReminders = data?.reminders.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredAdvances = data?.advances.filter((a) => {
    const name = a.employee?.name?.toLowerCase() || "";
    const userId = a.employee?.userId?.toLowerCase() || "";
    const role = a.employee?.role || "";
    const searchTerm = search.toLowerCase();
    
    const matchesSearch = name.includes(searchTerm) || userId.includes(searchTerm);
    const matchesRole = roleFilter === "all" || role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden rounded-[32px] border border-border bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,248,248,0.94)_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                <Calendar size={14} />
                Daily Overview
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-text">
                Activity for {formattedDate}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Consolidated view of attendance, advances, and reminders.
              </p>
            </div>

            <div className="flex items-center gap-3">
               <button
                onClick={onClose}
                className="rounded-xl border border-border bg-white p-2 text-text transition hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                placeholder="Search employee or reminder..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All" },
                { id: "admin", label: "Admins" },
                { id: "manager", label: "Managers" },
                { id: "employee", label: "Employees" },
                { id: "worker", label: "Workers" }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setRoleFilter(role.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    roleFilter === role.id
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                      : "bg-white border border-border text-text-muted hover:border-brand-primary/30 hover:text-brand-primary"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-text-muted">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              <p className="text-sm font-medium">Fetching daily records...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ATTENDANCE SECTION */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text">
                    <User size={16} className="text-brand-primary" />
                    Attendance ({filteredAttendance.length})
                  </h4>
                </div>

                {filteredAttendance.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {filteredAttendance.map((record) => (
                      <AttendanceCard key={record._id} record={record} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No attendance records found for this date." />
                )}
              </section>
              {/* ADVANCES SECTION */}
              <section>
                <div className="mb-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text">
                    <Wallet size={16} className="text-brand-primary" />
                    Advances ({filteredAdvances.length})
                  </h4>
                </div>

                {filteredAdvances.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {filteredAdvances.map((advance) => (
                      <AdvanceCard key={advance._id} advance={advance} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No advance records found for this date." />
                )}
              </section>

              {/* REMINDERS SECTION */}
              <section>
                <div className="mb-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text">
                    <Bell size={16} className="text-brand-primary" />
                    Reminders ({filteredReminders.length})
                  </h4>
                </div>

                {filteredReminders.length > 0 ? (
                  <div className="grid gap-3">
                    {filteredReminders.map((reminder) => (
                      <ReminderCard key={reminder._id} reminder={reminder} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No reminders scheduled for this date." />
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendanceCard({ record }: { record: any }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle2 className="text-emerald-500" size={16} />;
      case "absent": return <XCircle className="text-red-500" size={16} />;
      case "half-day": return <Clock3 className="text-amber-500" size={16} />;
      default: return null;
    }
  };

  const statusStyles = {
    present: "bg-emerald-50 text-emerald-700 border-emerald-200",
    absent: "bg-red-50 text-red-700 border-red-200",
    "half-day": "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        {record.employee?.image ? (
          <img 
            src={record.employee.image} 
            alt={record.employee.name} 
            className="h-10 w-10 rounded-xl object-cover border border-border" 
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/20">
            {record.employee?.name?.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-text">
            {record.employee?.name}
          </p>
          <p className="text-[11px] text-text-muted">
             {record.employee?.userId || "ID: " + record.employee?._id.slice(-6)}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-tight ${statusStyles[record.status as keyof typeof statusStyles]}`}>
          {getStatusIcon(record.status)}
          {record.status}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
        <p className="text-[10px] font-medium text-text-muted italic">
          Marked by {record.markedBy?.name || "System"}
        </p>
        {record.reason && (
          <p className="max-w-[150px] truncate text-[10px] text-text-muted" title={record.reason}>
            "{record.reason}"
          </p>
        )}
      </div>
    </div>
  );
}

function AdvanceCard({ advance }: { advance: any }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md border-l-4 border-l-brand-primary">
      <div className="flex items-center gap-3">
        {advance.employee?.image ? (
          <img 
            src={advance.employee.image} 
            alt={advance.employee.name} 
            className="h-10 w-10 rounded-xl object-cover border border-border" 
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/20">
            {advance.employee?.name?.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-text">
            {advance.employee?.name}
          </p>
          <p className="text-[11px] text-text-muted">
             {advance.employee?.userId || "ID: " + advance.employee?._id.slice(-6)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-brand-primary">
            ₹{advance.amount.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">
            Advance
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
        <p className="text-[10px] font-medium text-text-muted italic">
          Given by {advance.givenBy?.name || "System"}
        </p>
        {advance.note && (
          <p className="max-w-[150px] truncate text-[10px] text-text-muted" title={advance.note}>
            "{advance.note}"
          </p>
        )}
      </div>
    </div>
  );
}

function ReminderCard({ reminder }: { reminder: any }) {
  const priorityStyles = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${priorityStyles[reminder.priority as keyof typeof priorityStyles] || 'border-border'}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 rounded-xl p-2 ${
          reminder.priority === 'high' 
            ? 'bg-red-100 text-red-600' 
            : reminder.priority === 'medium'
            ? 'bg-amber-100 text-amber-600'
            : 'bg-emerald-100 text-emerald-600'
        }`}>
          <AlertCircle size={18} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-sm font-semibold text-text">{reminder.title}</h5>
            <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">
              {reminder.priority} Priority
            </span>
          </div>
          
          {reminder.description && (
            <p className="mt-1 text-xs text-text-muted leading-relaxed">
              {reminder.description}
            </p>
          )}

          {reminder.assignedTo && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/50 px-2 py-1 text-[10px] font-semibold text-brand-primary border border-brand-primary/10">
              <User size={10} />
              Assigned to: {reminder.assignedTo}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
            <p className="text-[10px] font-medium text-text-muted italic">
              Created by {reminder.createdBy?.name || "Admin"}
              {reminder.repeat !== 'none' && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-black/5 px-1.5 py-0.5 not-italic">
                  <Clock3 size={8} />
                  {reminder.repeat === 'custom' ? `${reminder.customDays}d` : reminder.repeat}
                </span>
              )}
            </p>
            {reminder.time && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary bg-white px-2 py-0.5 rounded-full shadow-sm border border-brand-primary/5">
                <Clock3 size={10} />
                {reminder.time}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white/50 px-6 py-10 text-center">
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}
