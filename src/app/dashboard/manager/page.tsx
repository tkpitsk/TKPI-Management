"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { CalendarCheck, BellRing, ArrowRight, FileBarChart, Users } from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Welcome back, {user?.name || "Manager"}
        </h1>
        <p className="mt-2 text-text-muted">
          Here's what you can manage today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          title="Attendance"
          description="Mark daily attendance and manage employee advances."
          href="/dashboard/manager/attendance"
          icon={<CalendarCheck className="h-6 w-6 text-brand-primary" />}
        />
        <QuickActionCard
          title="Reminders"
          description="View and manage due dates, follow-ups, and renewals."
          href="/dashboard/manager/reminders"
          icon={<BellRing className="h-6 w-6 text-brand-primary" />}
        />
        <QuickActionCard
          title="Reports"
          description="View attendance summaries and download employee reports."
          href="/dashboard/manager/reports"
          icon={<FileBarChart className="h-6 w-6 text-brand-primary" />}
        />
        <QuickActionCard
          title="Users"
          description="Manage employee accounts, roles, and status."
          href="/dashboard/manager/users"
          icon={<Users className="h-6 w-6 text-brand-primary" />}
        />
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-border bg-surface p-8 transition-all hover:border-brand-primary/50 hover:shadow-lg"
    >
      <div>
        <div className="inline-flex rounded-2xl bg-brand-primary/8 p-3 transition-colors group-hover:bg-brand-primary/12">
          {icon}
        </div>
        <h3 className="mt-6 text-xl font-semibold text-text">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm font-medium text-brand-primary">
        Go to {title}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}