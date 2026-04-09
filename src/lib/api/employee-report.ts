export interface EmployeeSummary {
    totalDays: number;
    present: number;
    absent: number;
    halfDay: number;
    totalAdvance: number;
}

export interface EmployeeDetailRecord {
    _id: string;
    date: string;
    status: "present" | "absent" | "half-day";
    advance: number;
}

interface BaseParams {
    employeeId: string;
    start: string;
    end: string;
    token?: string;
}

export async function getEmployeeSummary({
    employeeId,
    start,
    end,
    token,
}: BaseParams): Promise<EmployeeSummary> {
    const params = new URLSearchParams({
        employeeId,
        start,
        end,
    });

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee-report/summary?${params.toString()}`,
        {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch employee summary");
    }

    return data.data;
}

export async function getEmployeeDetails({
    employeeId,
    start,
    end,
    token,
}: BaseParams): Promise<EmployeeDetailRecord[]> {
    const params = new URLSearchParams({
        employeeId,
        start,
        end,
    });

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee-report/details?${params.toString()}`,
        {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch employee details");
    }

    return data.data;
}

export async function downloadEmployeeReportPDF({
    employeeId,
    start,
    end,
    type = "employee",
    token,
}: BaseParams & { type?: string }) {
    const params = new URLSearchParams({
        employeeId,
        start,
        end,
        type,
    });

    const url = `${process.env.NEXT_PUBLIC_API_URL}/pdf/employee-report?${params.toString()}`;

    if (!token) {
        window.open(url, "_blank");
        return;
    }

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to download PDF");
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `employee-report-${employeeId}.pdf`;
    a.click();

    window.URL.revokeObjectURL(blobUrl);
}