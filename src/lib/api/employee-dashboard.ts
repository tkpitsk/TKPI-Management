interface Params {
    employeeId: string;
    start: string;
    end: string;
}

export async function getEmployeeDashboard({
    employeeId,
    start,
    end,
}: Params) {
    const params = new URLSearchParams({
        employeeId,
        start,
        end,
    });

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee-dashboard?${params.toString()}`,
        {
            cache: "no-store",
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch dashboard");
    }

    return data.data;
}