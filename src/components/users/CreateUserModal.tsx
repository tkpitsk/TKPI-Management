"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
    Copy,
    Eye,
    EyeOff,
    RefreshCw,
    ShieldPlus,
    X,
} from "lucide-react";
import api from "@/lib/api";

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

type Role = "admin" | "manager" | "employee" | "labour" | "";
type SalaryType = "monthly" | "weekly" | "daily" | "";

type FormData = {
    userId: string;
    password: string;
    role: Role;
    name: string;
    phone: string;
    salaryType: SalaryType;
    salaryAmount: string;
};

type FormErrors = {
    userId?: string;
    password?: string;
    role?: string;
    name?: string;
    phone?: string;
    salaryType?: string;
    salaryAmount?: string;
    general?: string;
};

export default function CreateUserModal({
    open,
    onClose,
    onCreated,
}: CreateUserModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const firstInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<FormData>({
        userId: "",
        password: "",
        role: "",
        name: "",
        phone: "",
        salaryType: "",
        salaryAmount: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const isSalaryRequired = useMemo(
        () => ["manager", "employee", "labour"].includes(form.role),
        [form.role]
    );

    const showSalaryType = form.role === "labour";

    useEffect(() => {
        if (!open) {
            setForm({
                userId: "",
                password: "",
                role: "",
                name: "",
                phone: "",
                salaryType: "",
                salaryAmount: "",
            });
            setErrors({});
            setSubmitting(false);
            setShowPassword(false);
            setCopied(false);
            return;
        }

        const timer = setTimeout(() => {
            firstInputRef.current?.focus();
        }, 20);

        return () => clearTimeout(timer);
    }, [open]);

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

        if (!form.userId.trim()) {
            nextErrors.userId = "User ID is required";
        } else if (form.userId.trim().length < 3) {
            nextErrors.userId = "User ID must be at least 3 characters";
        }

        if (!form.password) {
            nextErrors.password = "Password is required";
        } else if (form.password.length < 6) {
            nextErrors.password = "Password must be at least 6 characters";
        }

        if (!form.role) {
            nextErrors.role = "Please select a role";
        }

        if (form.phone && !/^[0-9+\-\s()]{7,15}$/.test(form.phone.trim())) {
            nextErrors.phone = "Please enter a valid phone number";
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

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            if (field === "role") {
                if (value === "admin") {
                    next.salaryType = "";
                    next.salaryAmount = "";
                } else if (value === "manager" || value === "employee") {
                    next.salaryType = "monthly";
                } else if (value === "labour" && !next.salaryType) {
                    next.salaryType = "daily";
                }
            }

            return next;
        });

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
            salaryType: field === "role" ? undefined : prev.salaryType,
            salaryAmount: field === "role" ? undefined : prev.salaryAmount,
            general: undefined,
        }));

        if (field === "password") {
            setCopied(false);
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
            password,
        }));

        setErrors((prev) => ({
            ...prev,
            password: undefined,
            general: undefined,
        }));

        setShowPassword(true);
        setCopied(false);
    };

    const copyPassword = async () => {
        if (!form.password) return;

        try {
            await navigator.clipboard.writeText(form.password);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error("Failed to copy password", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setSubmitting(true);

            await api.post("/users", {
                userId: form.userId.trim(),
                password: form.password,
                role: form.role,
                name: form.name.trim() || undefined,
                phone: form.phone.trim() || undefined,
                salaryType:
                    form.role === "labour"
                        ? form.salaryType
                        : form.role === "manager" || form.role === "employee"
                            ? "monthly"
                            : undefined,
                salaryAmount:
                    form.salaryAmount.trim() === ""
                        ? undefined
                        : Number(form.salaryAmount),
            });

            onCreated?.();
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
                err?.response?.data?.message || "Failed to create user";

            setErrors((prev) => ({
                ...prev,
                general: message,
            }));
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

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
                            <ShieldPlus size={18} />
                        </div>

                        <div>
                            <h2 id={titleId} className="text-lg font-semibold text-text">
                                Create User
                            </h2>
                            <p id={descriptionId} className="mt-1 text-sm text-text-muted">
                                Add a new account, assign role, and configure compensation details.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-text-muted transition hover:bg-muted hover:text-text"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[85vh] overflow-y-auto px-5 py-5">
                    <div className="space-y-4">
                        {errors.general && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {errors.general}
                            </div>
                        )}

                        <div className="gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text">
                                    User ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    ref={firstInputRef}
                                    type="text"
                                    value={form.userId}
                                    onChange={(e) => handleChange("userId", e.target.value)}
                                    placeholder="Enter user ID"
                                    className={`h-11 w-full rounded-2xl border bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:bg-white ${errors.userId
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-border focus:border-primary"
                                        }`}
                                />
                                {errors.userId && (
                                    <p className="text-xs text-red-600">{errors.userId}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 pb-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text">Full Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Enter full name"
                                    className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-white"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text">Phone</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="Enter phone number"
                                    className={`h-11 w-full rounded-2xl border bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:bg-white ${errors.phone
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-border focus:border-primary"
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-600">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface/70 p-4">
                            <div className="mb-3">
                                <label className="text-sm font-medium text-text">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <p className="mt-1 text-xs text-text-muted">
                                    Use at least 6 characters. Longer passwords are safer, and passphrases are better than short complex strings.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        placeholder="Enter password"
                                        className={`h-11 w-full rounded-2xl border bg-white px-4 pr-11 text-sm text-text outline-none transition placeholder:text-text-muted focus:bg-white ${errors.password
                                            ? "border-red-300 focus:border-red-500"
                                            : "border-border focus:border-primary"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-medium text-text transition hover:bg-muted"
                                    >
                                        <RefreshCw size={16} />
                                        Generate Password
                                    </button>

                                    <button
                                        type="button"
                                        onClick={copyPassword}
                                        disabled={!form.password}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-medium text-text transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Copy size={16} />
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>

                                <p className="text-xs text-text-muted">
                                    Generated password avoids confusing characters like O, 0, l, and 1.
                                </p>

                                {errors.password && (
                                    <p className="text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                {["admin", "manager", "employee", "labour"].map((role) => {
                                    const active = form.role === role;

                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => handleChange("role", role as Role)}
                                            className={`rounded-2xl border w-full px-4 py-3 text-sm font-medium capitalize transition ${active
                                                ? "border-primary bg-accent text-white"
                                                : "border-border bg-white text-text-muted hover:bg-muted hover:text-text"
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.role && (
                                <p className="text-xs text-red-600">{errors.role}</p>
                            )}
                        </div>

                        {(form.role === "manager" ||
                            form.role === "employee" ||
                            form.role === "labour") && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {showSalaryType && (
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">
                                                Salary Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={form.salaryType}
                                                onChange={(e) => handleChange("salaryType", e.target.value)}
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
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.salaryAmount}
                                            onChange={(e) => handleChange("salaryAmount", e.target.value)}
                                            placeholder="Enter amount"
                                            className={`h-11 w-full rounded-2xl border bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:bg-white ${errors.salaryAmount
                                                ? "border-red-300 focus:border-red-500"
                                                : "border-border focus:border-primary"
                                                }`}
                                        />
                                        {errors.salaryAmount && (
                                            <p className="text-xs text-red-600">{errors.salaryAmount}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium text-text transition hover:bg-muted"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}