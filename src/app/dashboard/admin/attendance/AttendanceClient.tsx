"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import EmployeeSelect from "@/components/attendance/EmployeeSelect";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import type { Employee, AttendanceRecord } from "@/types/attendance";
import { CalendarDays, Users } from "lucide-react";

type RequestState = "idle" | "loading" | "success" | "error";

export default function AttendanceClient() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [fetchedRecords, setFetchedRecords] = useState<AttendanceRecord[]>([]);
    const [month, setMonth] = useState(new Date());

    const [employeesState, setEmployeesState] = useState<RequestState>("idle");
    const [recordsState, setRecordsState] = useState<RequestState>("idle");

    useEffect(() => {
        let ignore = false;

        async function fetchEmployees() {
            setEmployeesState("loading");
            try {
                const res = await api.get<Employee[]>("/users");
                if (ignore) return;

                setEmployees(res.data);

                if (res.data.length > 0) {
                    setSelectedEmployee((prev) => prev ?? res.data[0]);
                }

                setEmployeesState("success");
            } catch (error) {
                if (ignore) return;
                console.error("Failed to fetch employees", error);
                setEmployeesState("error");
            }
        }

        fetchEmployees();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (!selectedEmployee) return;

        let ignore = false;

        async function fetchAttendance() {
            const start = new Date(month.getFullYear(), month.getMonth(), 1);
            const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

            setRecordsState("loading");

            try {
                const res = await api.get<AttendanceRecord[]>("/attendance", {
                    params: {
                        employeeId: selectedEmployee?._id,
                        start: start.toISOString(),
                        end: end.toISOString(),
                    },
                });

                if (ignore) return;

                setFetchedRecords(res.data);
                setRecordsState("success");
            } catch (error) {
                if (ignore) return;

                console.error("Failed to fetch attendance", error);
                setRecordsState("error");
            }
        }

        fetchAttendance();

        return () => {
            ignore = true;
        };
    }, [selectedEmployee, month]);

    const records = useMemo(
        () => (selectedEmployee ? fetchedRecords : []),
        [selectedEmployee, fetchedRecords]
    );

    const monthLabel = month.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });

    const loadingEmployees = employeesState === "loading";
    const loadingRecords = recordsState === "loading";

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
                <div className="border-b border-border bg-muted/40 px-5 py-5 md:px-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text-muted">
                                <CalendarDays size={14} />
                                Attendance register
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">
                                    Attendance & Advance
                                </h1>
                                <p className="mt-1 text-sm text-text-muted">
                                    Mark daily attendance, track advances, and monitor monthly records.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-white px-4 py-3">
                                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                                    Current month
                                </p>
                                <p className="mt-1 text-sm font-semibold text-text">{monthLabel}</p>
                            </div>

                            <div className="rounded-2xl border border-border bg-white px-4 py-3">
                                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                                    Active employee
                                </p>
                                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-text">
                                    <Users size={14} className="text-text-muted" />
                                    {selectedEmployee?.userId || "None selected"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 px-5 py-5 md:px-6">
                    <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
                        <EmployeeSelect
                            employees={employees}
                            value={selectedEmployee}
                            onChange={setSelectedEmployee}
                            loading={loadingEmployees}
                        />

                        {!selectedEmployee ? (
                            <div className="flex min-h-22 items-center rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-4 text-sm text-text-muted">
                                Select an employee to enable attendance marking and advance tracking.
                            </div>
                        ) : (
                            <AttendanceSummary records={records} loading={loadingRecords} />
                        )}
                    </div>
                </div>
            </section>

            <AttendanceCalendar
                month={month}
                records={records}
                employee={selectedEmployee}
                disabled={!selectedEmployee}
                loading={loadingRecords}
                onMonthChange={setMonth}
                onSaved={() => {
                    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth(), 1));
                }}
            />
        </div>
    );
}