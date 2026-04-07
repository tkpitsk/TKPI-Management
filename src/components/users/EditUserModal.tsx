"use client";

import { useEffect, useState } from "react";
import {
    Eye,
    EyeOff,
    KeyRound,
    RefreshCw,
    ShieldCheck,
    UserCog,
    X,
} from "lucide-react";
import api from "@/lib/api";

interface User {
    _id: string;
    userId: string;
    role: "admin" | "manager" | "employee";
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface EditUserModalProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onUpdated?: () => void;
}

type FormData = {
    role: "admin" | "manager" | "employee" | "";
    isActive: boolean;
    newPassword: string;
};

type FormErrors = {
    role?: string;
    newPassword?: string;
    general?: string;
};

export default function EditUserModal({
    open,
    user,
    onClose,
    onUpdated,
}: EditUserModalProps) {
    const [form, setForm] = useState<FormData>({
        role: "",
        isActive: true,
        newPassword: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (open && user) {
            setForm({
                role: user.role,
                isActive: user.isActive,
                newPassword: "",
            });
            setErrors({});
            setSubmitting(false);
            setShowPassword(false);
        }
    }, [open, user]);

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

        if (form.newPassword && form.newPassword.length < 6) {
            nextErrors.newPassword = "Password must be at least 6 characters";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleRoleChange = (role: FormData["role"]) => {
        setForm((prev) => ({
            ...prev,
            role,
        }));

        setErrors((prev) => ({
            ...prev,
            role: undefined,
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

    const generatePassword = () => {
        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setForm((prev) => ({
            ...prev,
            newPassword: password,
        }));

        setErrors((prev) => ({
            ...prev,
            newPassword: undefined,
            general: undefined,
        }));
        setShowPassword(true);
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

    if (!open || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-user-title"
                aria-describedby="edit-user-description"
                className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between border-b border-border px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-primary">
                            <UserCog size={18} />
                        </div>

                        <div>
                            <h2
                                id="edit-user-title"
                                className="text-lg font-semibold text-text"
                            >
                                Edit User
                            </h2>
                            <p
                                id="edit-user-description"
                                className="mt-1 text-sm text-text-muted"
                            >
                                Update role, account status, and password for this user.
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

                <form onSubmit={handleSubmit} className="px-5 py-5">
                    <div className="space-y-5">
                        {errors.general && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {errors.general}
                            </div>
                        )}

                        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-text-muted">
                                User ID
                            </p>
                            <p className="mt-1 text-sm font-semibold text-text">
                                {user.userId}
                            </p>
                            <p className="mt-2 text-xs text-text-muted">
                                User ID is fixed and cannot be edited here.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text">
                                Role <span className="text-red-500">*</span>
                            </label>

                            <div className="grid gap-2 sm:grid-cols-3">
                                {["admin", "manager", "employee"].map((role) => {
                                    const active = form.role === role;

                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() =>
                                                handleRoleChange(
                                                    role as FormData["role"]
                                                )
                                            }
                                            className={`rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition ${active
                                                    ? "border-accent/20 bg-accent text-white"
                                                    : "border-border bg-white text-text-muted hover:bg-muted hover:text-text"
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    );
                                })}
                            </div>

                            {errors.role && (
                                <p className="text-xs text-red-600">
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text">
                                Account Status
                            </label>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(true)}
                                    className={`rounded-2xl border px-4 py-3 text-left transition ${form.isActive
                                            ? "border-green-300 bg-green-50 text-green-700"
                                            : "border-border bg-white text-text-muted hover:bg-muted hover:text-text"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                            <ShieldCheck size={16} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold">Active</p>
                                            <p className="text-xs opacity-80">
                                                User can access the system
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(false)}
                                    className={`rounded-2xl border px-4 py-3 text-left transition ${!form.isActive
                                            ? "border-red-300 bg-red-50 text-red-700"
                                            : "border-border bg-white text-text-muted hover:bg-muted hover:text-text"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700">
                                            <X size={16} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold">Inactive</p>
                                            <p className="text-xs opacity-80">
                                                User cannot log in
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface/70 p-4">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
                                    <KeyRound size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text">
                                        Reset Password
                                    </h3>
                                    <p className="mt-1 text-xs text-text-muted">
                                        Leave this blank if you do not want to change the password.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text">
                                    New Password
                                </label>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <div className="relative flex-1">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={form.newPassword}
                                            onChange={(e) =>
                                                handlePasswordChange(e.target.value)
                                            }
                                            placeholder="Enter new password"
                                            className={`h-11 w-full rounded-2xl border bg-white px-4 pr-11 text-sm text-text outline-none transition placeholder:text-text-muted focus:bg-white ${errors.newPassword
                                                    ? "border-red-300 focus:border-red-500"
                                                    : "border-border focus:border-primary"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-medium text-text transition hover:bg-muted"
                                    >
                                        <RefreshCw size={16} />
                                        Generate
                                    </button>
                                </div>

                                <p className="text-xs text-text-muted">
                                    Generated password uses 8 characters.
                                </p>

                                {errors.newPassword && (
                                    <p className="text-xs text-red-600">
                                        {errors.newPassword}
                                    </p>
                                )}
                            </div>
                        </div>
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
                            {submitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}