"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
    Eye,
    EyeOff,
    IndianRupee,
    RefreshCw,
    ShieldCheck,
    UserCog,
    X,
} from "lucide-react";
import api from "@/lib/api";

interface User {
    _id: string;
    userId: string;
    role: "admin" | "manager" | "employee" | "labour";
    isActive: boolean;
    name?: string;
    phone?: string;
    salaryType?: "monthly" | "weekly" | "daily";
    salaryAmount?: number;
}

interface EditUserModalProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onUpdated?: () => void;
}

type Role = "admin" | "manager" | "employee" | "labour" | "";
type SalaryType = "monthly" | "weekly" | "daily" | "";

type FormData = {
    role: Role;
    isActive: boolean;
    salaryType: SalaryType;
    salaryAmount: string;
    newPassword: string;
};

type FormErrors = {
    role?: string;
    salaryType?: string;
    salaryAmount?: string;
    newPassword?: string;
    general?: string;
};

export default function EditUserModal({
    open,
    user,
    onClose,
    onUpdated,
}: EditUserModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const firstActionRef = useRef<HTMLButtonElement>(null);

    const initialForm = useMemo<FormData>(() => {
        if (!user) {
            return {
                role: "",
                isActive: true,
                salaryType: "",
                salaryAmount: "",
                newPassword: "",
            };
        }

        return {
            role: user.role,
            isActive: user.isActive,
            salaryType:
                user.role === "manager" || user.role === "employee"
                    ? "monthly"
                    : user.salaryType || "",
            salaryAmount:
                user.salaryAmount !== undefined && user.salaryAmount !== null
                    ? String(user.salaryAmount)
                    : "",
            newPassword: "",
        };
    }, [user]);

    const [form, setForm] = useState<FormData>(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isSalaryRequired =
        form.role === "manager" || form.role === "employee" || form.role === "labour";

    const showSalaryType = form.role === "labour";

    useEffect(() => {
        if (open) {
            setForm(initialForm);
            setErrors({});
            setSubmitting(false);
            setShowPassword(false);

            const timer = setTimeout(() => {
                firstActionRef.current?.focus();
            }, 20);

            return () => clearTimeout(timer);
        }
    }, [open, initialForm]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (open) {
            document.addEventListener("keydown", onKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    const validate = () => {
        const nextErrors: FormErrors = {};

        if (!form.role) {
            nextErrors.role = "Please select a role";
        }

        if (isSalaryRequired) {
            if (!form.salaryAmount.trim()) {
                nextErrors.salaryAmount = "Salary amount is required";
            } else if (Number(form.salaryAmount) < 0) {
                nextErrors.salaryAmount = "Salary amount cannot be negative";
            }
        }

        if (showSalaryType && !form.salaryType) {
            nextErrors.salaryType = "Please select salary type";
        }

        if (form.newPassword && form.newPassword.trim().length < 6) {
            nextErrors.newPassword = "Password must be at least 6 characters";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleRoleChange = (role: Role) => {
        setForm((prev) => {
            const next = { ...prev, role };

            if (role === "admin") {
                next.salaryType = "";
                next.salaryAmount = "";
            } else if (role === "manager" || role === "employee") {
                next.salaryType = "monthly";
            } else if (role === "labour" && !next.salaryType) {
                next.salaryType = "daily";
            }

            return next;
        });

        setErrors((prev) => ({
            ...prev,
            role: undefined,
            salaryType: undefined,
            salaryAmount: undefined,
            general: undefined,
        }));
    };

    const handleStatusChange = (isActive: boolean) => {
        setForm((prev) => ({
            ...prev,
            isActive,
        }));

        setErrors((prev) => ({
            ...prev,
            general: undefined,
        }));
    };

    const handlePasswordChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            newPassword: value,
        }));

        setErrors((prev) => ({
            ...prev,
            newPassword: undefined,
            general: undefined,
        }));
    };

    const handleFieldChange = (field: keyof FormData, value: string | boolean) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
            general: undefined,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;
        if (!validate()) return;

        try {
            setSubmitting(true);

            await api.put(`/users/${user._id}`, {
                role: form.role,
                isActive: form.isActive,
                salaryType:
                    form.role === "labour"
                        ? form.salaryType
                        : form.role === "manager" || form.role === "employee"
                            ? "monthly"
                            : undefined,
                salaryAmount:
                    form.role === "admin" || form.salaryAmount.trim() === ""
                        ? 0
                        : Number(form.salaryAmount),
            });

            if (form.newPassword.trim()) {
                await api.put(`/users/${user._id}/password`, {
                    newPassword: form.newPassword.trim(),
                });
            }

            onUpdated?.();
            onClose();
        } catch (error: unknown) {
            console.error(error);

            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };

            const message =
                err?.response?.data?.message || "Failed to update user";

            setErrors((prev) => ({
                ...prev,
                general: message,
            }));
        } finally {
            setSubmitting(false);
        }
    };

    const generatePassword = () => {
        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
        let password = "";

        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setForm((prev) => ({
            ...prev,
            newPassword: password,
        }));

        setShowPassword(true);

        setErrors((prev) => ({
            ...prev,
            newPassword: undefined,
            general: undefined,
        }));
    };

    if (!open || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close modal backdrop"
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between border-b border-border px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-primary">
                            <UserCog size={18} />
                        </div>

                        <div>
                            <h2 id={titleId} className="text-lg font-semibold text-text">
                                Edit User
                            </h2>
                            <p id={descriptionId} className="mt-1 text-sm text-text-muted">
                                Update account role, status, compensation, and password.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-text-muted transition hover:bg-muted hover:text-text"
                        aria-label="Close edit user modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="max-h-[85vh] overflow-y-auto px-5 py-5"
                >
                    <div className="space-y-5">
                        {errors.general && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {errors.general}
                            </div>
                        )}

                        <div className="rounded-2xl border border-border bg-surface/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                                User details
                            </p>

                            <div className="mt-3 flex items-start gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-primary">
                                    <ShieldCheck size={18} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-text">
                                        {user.name?.trim() || user.userId}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-text-muted">
                                        <span>@{user.userId}</span>
                                        {user.phone && <span>• {user.phone}</span>}
                                        <span>• {user._id.slice(-6)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface/70 p-4">
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-text">Reset password</h3>
                                <p className="mt-1 text-xs text-text-muted">
                                    Leave this blank if you do not want to change the password.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.newPassword}
                                        disabled={submitting}
                                        onChange={(e) => handlePasswordChange(e.target.value)}
                                        placeholder="Enter new password"
                                        className={`h-11 w-full rounded-2xl border bg-white px-4 pr-24 text-sm text-text outline-none transition placeholder:text-text-muted focus:bg-white ${errors.newPassword
                                            ? "border-red-300 focus:border-red-500"
                                            : "border-border focus:border-primary"
                                            }`}
                                    />

                                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="rounded-lg p-2 text-text-muted transition hover:bg-muted hover:text-text"
                                            aria-label="Generate password"
                                        >
                                            <RefreshCw size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="rounded-lg p-2 text-text-muted transition hover:bg-muted hover:text-text"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-text-muted">
                                    Use at least 6 characters. Generated passwords avoid confusing characters.
                                </p>

                                {errors.newPassword && (
                                    <p className="text-xs text-red-600">{errors.newPassword}</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-white p-4">
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-text">Access role</h3>
                                <p className="mt-1 text-xs text-text-muted">
                                    Choose the permission level for this account.
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {["admin", "manager", "employee", "labour"].map((role) => {
                                    const active = form.role === role;

                                    return (
                                        <button
                                            key={role}
                                            ref={role === "admin" ? firstActionRef : undefined}
                                            type="button"
                                            disabled={submitting}
                                            onClick={() => handleRoleChange(role as Role)}
                                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium capitalize transition ${active
                                                ? "border-primary bg-accent text-white shadow-sm"
                                                : "border-border bg-surface text-text hover:bg-muted"
                                                } disabled:cursor-not-allowed disabled:opacity-60`}
                                        >
                                            <span className="block">{role}</span>
                                            <span
                                                className={`mt-1 block text-xs ${active ? "text-white/80" : "text-text-muted"
                                                    }`}
                                            >
                                                {role === "admin" && "Full access to system controls"}
                                                {role === "manager" && "Operational and supervisory access"}
                                                {role === "employee" && "Standard staff access"}
                                                {role === "labour" && "Workforce and wage-based access"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {errors.role && (
                                <p className="mt-2 text-xs text-red-600">{errors.role}</p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-border bg-white p-4">
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-text">Compensation</h3>
                                <p className="mt-1 text-xs text-text-muted">
                                    Salary settings change automatically based on the selected role.
                                </p>
                            </div>

                            {form.role === "admin" ? (
                                <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-sm text-text-muted">
                                    Admin accounts do not require salary configuration.
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {showSalaryType && (
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">
                                                Salary Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={form.salaryType}
                                                onChange={(e) =>
                                                    handleFieldChange("salaryType", e.target.value)
                                                }
                                                disabled={submitting}
                                                className={`h-11 w-full rounded-2xl border bg-surface px-4 text-sm text-text outline-none transition focus:bg-white ${errors.salaryType
                                                    ? "border-red-300 focus:border-red-500"
                                                    : "border-border focus:border-primary"
                                                    }`}
                                            >
                                                <option value="">Select salary type</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                            {errors.salaryType && (
                                                <p className="text-xs text-red-600">{errors.salaryType}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text">
                                            Salary Amount <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                                <IndianRupee size={16} />
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.salaryAmount}
                                                disabled={submitting}
                                                onChange={(e) =>
                                                    handleFieldChange("salaryAmount", e.target.value)
                                                }
                                                placeholder="Enter amount"
                                                className={`h-11 w-full rounded-2xl border bg-surface pl-11 pr-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:bg-white ${errors.salaryAmount
                                                    ? "border-red-300 focus:border-red-500"
                                                    : "border-border focus:border-primary"
                                                    }`}
                                            />
                                        </div>
                                        {errors.salaryAmount && (
                                            <p className="text-xs text-red-600">{errors.salaryAmount}</p>
                                        )}

                                        {(form.role === "manager" || form.role === "employee") && (
                                            <p className="text-xs text-text-muted">
                                                Salary type is fixed to monthly for this role.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-border bg-white p-4">
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-text">Account status</h3>
                                <p className="mt-1 text-xs text-text-muted">
                                    Control whether this user can actively access the system.
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleStatusChange(true)}
                                    className={`rounded-2xl border px-4 py-3 text-left transition ${form.isActive
                                        ? "border-green-300 bg-green-50 text-green-700"
                                        : "border-border bg-surface text-text hover:bg-muted"
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    <span className="block text-sm font-medium">Active</span>
                                    <span
                                        className={`mt-1 block text-xs ${form.isActive ? "text-green-600" : "text-text-muted"
                                            }`}
                                    >
                                        User can sign in and use permitted features.
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleStatusChange(false)}
                                    className={`rounded-2xl border px-4 py-3 text-left transition ${!form.isActive
                                        ? "border-red-300 bg-red-50 text-red-700"
                                        : "border-border bg-surface text-text hover:bg-muted"
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    <span className="block text-sm font-medium">Inactive</span>
                                    <span
                                        className={`mt-1 block text-xs ${!form.isActive ? "text-red-600" : "text-text-muted"
                                            }`}
                                    >
                                        User access is blocked without deleting the account.
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium text-text transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Saving changes..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}