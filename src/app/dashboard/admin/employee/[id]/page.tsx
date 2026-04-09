import EmployeeDetailClient from "@/components/employee/EmployeeDetailClient";

export default async function EmployeeDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        start?: string;
        end?: string;
        from?: string;
    }>;
}) {
    const { id } = await params;
    const query = await searchParams;

    return (
        <EmployeeDetailClient
            employeeId={id}
            initialStart={query.start}
            initialEnd={query.end}
            from={query.from}
        />
    );
}