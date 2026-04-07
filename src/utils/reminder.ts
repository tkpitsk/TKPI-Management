import type { Reminder } from "@/types/reminder";

export function isExpired(reminder: Reminder) {
    const expiry = new Date(reminder.expiryDate);

    if (reminder.time) {
        const [hours, minutes] = reminder.time.split(":").map(Number);
        expiry.setHours(hours, minutes, 0, 0);
    } else {
        expiry.setHours(23, 59, 59, 999);
    }

    return expiry < new Date();
}