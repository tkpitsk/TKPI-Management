import type { Employee } from "@/types/attendance";
import { ChevronDown, Search, UserRound } from "lucide-react";

interface Props {
    employees: Employee[];
    value: Employee | null;
    onChange: (employee: Employee | null) => void;
    loading?: boolean;
}

export default function EmployeeSelect({
    employees,
    value,
    onChange,
    loading = false,
}: Props) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <div className="rounded-xl bg-brand-primary/10 p-2 text-brand-primary">
                    <UserRound size={16} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-text">Employee</p>
                    <p className="text-xs text-text-muted">Choose a worker to manage attendance</p>
                </div>
            </div>

            <div className="relative">
                <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <select
                    className="h-12 w-full appearance-none rounded-xl border border-border bg-surface pl-10 pr-10 text-sm font-medium text-text outline-none transition focus:border-brand-primary focus:bg-white"
                    value={value?._id ?? ""}
                    onChange={(e) =>
                        onChange(employees.find((u) => u._id === e.target.value) ?? null)
                    }
                    disabled={loading}
                >
                    <option value="">
                        {loading ? "Loading employees..." : "Select employee"}
                    </option>

                    {employees.map((e) => (
                        <option key={e._id} value={e._id}>
                            {e.userId}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}