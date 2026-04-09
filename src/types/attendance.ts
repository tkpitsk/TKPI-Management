// types/attendance.ts
export type AttendanceStatus = "present" | "absent" | "half-day";

export interface AttendanceRecord {
    _id?: string;
    date: string;
    status: AttendanceStatus;
    advance: number;
}

export interface AttendanceSummary {
    totalRecords?: number;
    present: number;
    absent: number;
    halfDay: number;
    payableDays: number;
    totalAdvance: number;
}

export interface EmployeeMini {
    _id: string;
    userId: string;
    role: string;
    name: string;
    phone?: string;
    salaryType: "monthly" | "daily";
    salaryAmount: number;
}

export interface SalaryBreakdown {
    present: number;
    absent: number;
    halfDay: number;
    payableDays: number;
    totalAdvance: number;
    grossSalary?: number;
    netSalary?: number;
    salaryAmount?: number;
    salaryType?: string;
}

export interface EmployeeDashboardResponse {
    employee: EmployeeMini;
    summary: AttendanceSummary;
    salary: SalaryBreakdown;
    records: AttendanceRecord[];
}

export interface AdvanceItem {
    _id: string;
    employee: string;
    amount: number;
    date: string;
    note?: string;
}

export interface EmployeeOption {
    _id: string;
    name: string;
    userId?: string;
}