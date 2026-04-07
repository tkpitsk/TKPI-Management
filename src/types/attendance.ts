export type AttendanceStatus =
    | "present"
    | "absent"
    | "half-day";

export interface Employee {
    _id: string;
    userId: string;
}

export interface AttendanceRecord {
    date: string;
    status: AttendanceStatus;
    advance: number;
}
