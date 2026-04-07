import type { AttendanceRecord } from "@/types/attendance";

export function calculateAttendanceSummary(
    records: AttendanceRecord[]
) {
    let present = 0;
    let halfDay = 0;
    let absent = 0;
    let advanceTotal = 0;

    records.forEach((r) => {
        if (r.status === "present") present += 1;
        if (r.status === "half-day") halfDay += 1;
        if (r.status === "absent") absent += 1;

        advanceTotal += r.advance || 0;
    });

    const workedUnits = present + halfDay * 0.5;

    return {
        present,
        halfDay,
        absent,
        workedUnits,
        advanceTotal,
    };
}
