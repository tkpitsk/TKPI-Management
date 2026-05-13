"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    Clock,
    Eye,
    EyeOff,
    IndianRupee,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Trash2,
    Upload,
    UserCog,
    X,
} from "lucide-react";
import api from "@/lib/api";

interface User {
    _id: string;
    userId: string;
    role: "admin" | "manager" | "employee" | "worker";
    isActive: boolean;
    name?: string;
    phone?: string;
    salaryType?: "monthly" | "weekly" | "daily";
    salaryAmount?: number;
    image?: string;
}

interface EditUserModalProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onUpdated?: () => void;
    initialMode?: "edit" | "delete";
}

type Role = "admin" | "manager" | "employee" | "worker" | "";
type SalaryType = "monthly" | "weekly" | "daily" | "";

type FormData = {
    name: string;
    phone: string;
    role: Role;
    isActive: boolean;
    salaryType: SalaryType;
    salaryAmount: string;
    newPassword: string;
    image: File | null;
};

type FormErrors = {
    name?: string;
    phone?: string;
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
    initialMode = "edit",
}: EditUserModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const firstActionRef = useRef<HTMLButtonElement>(null);

    const initialForm = useMemo<FormData>(() => {
        if (!user) {
            return {
                name: "",
                phone: "",
                role: "",
                isActive: true,
                salaryType: "",
                salaryAmount: "",
                newPassword: "",
                image: null,
            };
        }

        return {
            name: user.name || "",
            phone: user.phone || "",
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
            image: null,
        };
    }, [user]);

    const [form, setForm] = useState<FormData>(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [deleteMode, setDeleteMode] = useState(false);
    const [references, setReferences] = useState<{ label: string; count: number }[]>([]);
    const [checkingReferences, setCheckingReferences] = useState(false);
    const [deleteCountdown, setDeleteCountdown] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [salarySummary, setSalarySummary] = useState<any>(null);
    const [fetchingSalary, setFetchingSalary] = useState(false);

    const isSalaryRequired =
        form.role === "manager" || form.role === "employee" || form.role === "worker";

    const showSalaryType = form.role === "worker";


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

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (deleteMode && deleteCountdown > 0) {
            timer = setTimeout(() => {
                setDeleteCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [deleteMode, deleteCountdown]);

    const handleDeleteStart = async () => {
        if (!user) return;
        setDeleteMode(true);
        setCheckingReferences(true);
        setFetchingSalary(user.role !== "admin");

        try {
            // Fetch references
            const refRes = await api.get(`/users/${user._id}/references`);
            setReferences(refRes.data.references || []);

            // Fetch salary summary for current month if not admin
            if (user.role !== "admin") {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

                const salRes = await api.get(
                    `/employee-dashboard?employeeId=${user._id}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
                );
                setSalarySummary(salRes.data?.data?.salary || null);
            }

            setDeleteCountdown(5);
        } catch (error) {
            console.error(error);
            setErrors((prev) => ({
                ...prev,
                general: "Failed to fetch user details for deletion",
            }));
        } finally {
            setCheckingReferences(false);
            setFetchingSalary(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (!user || deleteCountdown > 0) return;
        try {
            setDeleting(true);
            await api.delete(`/users/${user._id}/permanent`);
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
            const message = err?.response?.data?.message || "Failed to delete user permanently";
            setErrors((prev) => ({
                ...prev,
                general: message,
            }));
            setDeleteMode(false);
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        if (open) {
            setForm(initialForm);
            setErrors({});
            setSubmitting(false);
            setShowPassword(false);
            setDeleteMode(false);
            setReferences([]);
            setCheckingReferences(false);
            setDeleteCountdown(0);
            setDeleting(false);
            setSalarySummary(null);
            setFetchingSalary(false);

            if (initialMode === "delete") {
                handleDeleteStart();
            }

            const timer = setTimeout(() => {
                firstActionRef.current?.focus();
            }, 20);

            return () => clearTimeout(timer);
        }
    }, [open, initialForm, initialMode]);

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
            } else if (role === "worker" && !next.salaryType) {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, general: "Image size must be less than 5MB" }));
                return;
            }
            setForm(prev => ({ ...prev, image: file }));
            setErrors(prev => ({ ...prev, general: undefined }));
        }
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

            const formData = new FormData();
            formData.append("name", form.name.trim());
            formData.append("phone", form.phone.trim());
            formData.append("role", form.role);
            formData.append("isActive", String(form.isActive));
            
            const salaryType = form.role === "worker"
                ? form.salaryType
                : form.role === "manager" || form.role === "employee"
                    ? "monthly"
                    : undefined;
            
            if (salaryType) formData.append("salaryType", salaryType);
            
            const salaryAmount = form.role === "admin" || form.salaryAmount.trim() === ""
                ? 0
                : Number(form.salaryAmount);
            
            formData.append("salaryAmount", String(salaryAmount));

            if (form.image) {
                formData.append("image", form.image);
            }

            await api.put(`/users/${user._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
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

                    <div className="max-h-[85vh] overflow-y-auto px-5 py-5">
                        {deleteMode ? (
                            <div className="space-y-6 py-2">
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                                        <AlertTriangle size={28} />
                                    </div>
                                    <h3 className="text-lg font-bold text-red-900">Permanent Deletion</h3>
                                    <p className="mt-2 text-sm text-red-700">
                                        You are about to permanently delete <strong>{form.name || user.userId}</strong>.
                                        This action cannot be undone and will remove all login access.
                                    </p>
                                </div>

                                {checkingReferences ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                                        <Loader2 className="mb-3 animate-spin" size={24} />
                                        <p className="text-sm">Checking for user references...</p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-border bg-surface/50 p-5">
                                        <h4 className="mb-3 text-sm font-semibold text-text">Reference Check</h4>
                                        {references.length > 0 ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-text-muted italic">
                                                    This user is currently linked to the following records. Deleting the user may cause data integrity issues in these modules.
                                                </p>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {references.map((ref, idx) => (
                                                        <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2">
                                                            <span className="text-xs font-medium text-text">{ref.label}</span>
                                                            <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-bold text-text-muted">{ref.count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-green-600">
                                                <ShieldCheck size={18} />
                                                <p className="text-sm font-medium">No active references found. Safe to delete.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {user.role !== "admin" && (
                                    <div className="rounded-2xl border border-border bg-surface/50 p-5">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-text">Current Month Salary Summary</h4>
                                            {fetchingSalary && <Loader2 size={14} className="animate-spin text-text-muted" />}
                                        </div>

                                        {salarySummary ? (
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <div className="rounded-xl border border-border bg-white p-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Advance</p>
                                                    <p className="mt-1 text-lg font-bold text-amber-600">₹{Math.round(salarySummary.totalAdvance).toLocaleString("en-IN")}</p>
                                                </div>
                                                <div className="rounded-xl border border-border bg-white p-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Earned Amount</p>
                                                    <p className="mt-1 text-lg font-bold text-emerald-600">₹{Math.round(salarySummary.earned).toLocaleString("en-IN")}</p>
                                                </div>
                                                <div className="rounded-xl border border-border bg-white p-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Net Payable</p>
                                                    <p className="mt-1 text-lg font-bold text-primary">₹{Math.round(salarySummary.netSalary).toLocaleString("en-IN")}</p>
                                                </div>
                                            </div>
                                        ) : !fetchingSalary ? (
                                            <p className="text-xs text-text-muted italic">No salary data available for this month.</p>
                                        ) : null}
                                        
                                        <p className="mt-3 text-[10px] text-text-muted italic">
                                            * This is a snapshot of the current month ({new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}). Ensure all dues are settled before permanent deletion.
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setDeleteMode(false)}
                                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-6 text-sm font-medium text-text transition hover:bg-muted"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        type="button"
                                        disabled={deleteCountdown > 0 || deleting}
                                        onClick={handlePermanentDelete}
                                        className="inline-flex h-11 min-w-48 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-sm font-medium text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Deleting...
                                            </>
                                        ) : deleteCountdown > 0 ? (
                                            <>
                                                <Clock size={16} />
                                                Wait {deleteCountdown}s to Delete
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                Confirm Permanent Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {errors.general && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {errors.general}
                                    </div>
                                )}

                                <div className="flex flex-col items-center gap-4 border-b border-border pb-6 sm:flex-row">
                                    <div className="relative group">
                                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-surface transition group-hover:border-accent">
                                            {form.image ? (
                                                <img
                                                    src={URL.createObjectURL(form.image)}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name || user.userId}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Upload className="text-text-muted group-hover:text-accent" size={24} />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                            title="Choose profile image"
                                        />
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-sm font-semibold text-text">Profile Picture</h3>
                                        <p className="text-xs text-text-muted mt-1">
                                            {user.image ? "Change your profile photo." : "Upload a profile photo."} Max 5MB.
                                        </p>
                                        <button
                                            type="button"
                                            className="mt-2 text-xs font-bold text-accent hover:underline"
                                            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                        >
                                            {user.image ? "Replace Photo" : "Upload Photo"}
                                        </button>
                                    </div>
                                </div>

                                {/* User Details Section */}
                                <div className="rounded-2xl border border-border bg-surface/70 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                                        User details
                                    </p>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-text-muted">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                disabled={submitting}
                                                onChange={(e) => handleFieldChange("name", e.target.value)}
                                                placeholder="Enter full name"
                                                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-primary"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-text-muted">
                                                Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                disabled={submitting}
                                                onChange={(e) => handleFieldChange("phone", e.target.value)}
                                                placeholder="Enter phone number"
                                                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-text outline-none transition focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-start gap-3 border-t border-border/50 pt-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-primary">
                                            <ShieldCheck size={18} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-text-muted">
                                                User ID (Unchangeable)
                                            </p>
                                            <p className="text-sm font-semibold text-text">
                                                @{user.userId}
                                            </p>
                                            <p className="mt-0.5 text-[10px] text-text-muted">
                                                Internal ID: {user._id}
                                            </p>
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
                                        {["admin", "manager", "employee", "worker"].map((role) => {
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
                                                        {role === "worker" && "Workforce and wage-based access"}
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
                        )}
                    </div>
            </div>
        </div>
    );
}