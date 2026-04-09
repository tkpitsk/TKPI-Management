// lib/api/attendance.ts
import api from "@/lib/api";
import type {
    AttendanceRecord,
    AttendanceSummary,
    EmployeeDashboardResponse,
    AdvanceItem,
    AttendanceStatus,
} from "@/types/attendance";

export async function markAttendance(payload: {
    employeeId: string;
    date: string;
    status: AttendanceStatus;
    advance?: number;
}) {
    const res = await api.post("/attendance", payload);
    return res.data;
}

export async function getAttendance(params: {
    employeeId: string;
    start: string;
    end: string;
}) {
    const res = await api.get<AttendanceRecord[]>("/attendance", { params });
    return res.data;
}

export async function getMyAttendance(params: {
    start: string;
    end: string;
}) {
    const res = await api.get<AttendanceRecord[]>("/attendance/me", { params });
    return res.data;
}

export async function getEmployeeSummary(params: {
    employeeId: string;
    start: string;
    end: string;
}) {
    const res = await api.get<{ success: true; data: AttendanceSummary }>(
        "/reports/employee-summary",
        { params }
    );
    return res.data.data;
}

export async function getEmployeeDetails(params: {
    employeeId: string;
    start: string;
    end: string;
}) {
    const res = await api.get<{ success: true; data: AttendanceRecord[] }>(
        "/reports/employee-details",
        { params }
    );
    return res.data.data;
}

export async function getEmployeeDashboard(params: {
    employeeId: string;
    start: string;
    end: string;
}) {
    const res = await api.get<{ success: true; data: EmployeeDashboardResponse }>(
        "/reports/employee-dashboard",
        { params }
    );
    return res.data.data;
}

export async function giveAdvance(payload: {
    employeeId: string;
    amount: number;
    date: string;
    reason?: string;
}) {
    const res = await api.post("/advances", payload);
    return res.data;
}

export async function getAdvances(params: {
    employeeId: string;
    start: string;
    end: string;
}) {
    const res = await api.get<AdvanceItem[]>("/advances", { params });
    return res.data;
}