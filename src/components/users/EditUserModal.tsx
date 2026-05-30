"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    Clock,
    Eye,
    IndianRupee,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Trash2,
    Upload,
    UserCog,
    X,
    UserCircle,
    Briefcase,
    Building,
    FileText
} from "lucide-react";
import api from "@/lib/api";

interface User {
    _id: string;
    userId: string;
    role: "admin" | "manager" | "employee" | "worker";
    isActive: boolean;
    name?: string;
    phone?: string;
    aadhar?: string;
    pan?: string;
    salaryType?: "monthly" | "weekly" | "daily";
    salaryAmount?: number;
    image?: string;
    
    dob?: string;
    address?: string;
    aadharPhoto?: string;
    panPhoto?: string;
    designation?: string;
    reportingTime?: string;
    workDescription?: string;
    joiningDate?: string;
    familyMembersCount?: number;
    familyDependents?: string;
    previousWorkplace?: string;
    previousDesignation?: string;
    reasonForLeaving?: string;
    salaryPaymentDate?: number;
    iqTestResult?: string;
    kgTestResult?: string;
    personType?: string;
    significantAction?: string;
    employeeClassification?: string;
    incentivesProvided?: string;
    additionalBenefits?: string;
    bankAccount?: {
        accountNumber?: string;
        ifscCode?: string;
        bankName?: string;
    };
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
    aadhar: string;
    pan: string;
    role: Role;
    isActive: boolean;
    salaryType: SalaryType;
    salaryAmount: string;
    newPassword: string;
    image: File | null;
    
    dob: string;
    address: string;
    aadharPhoto: File | null;
    panPhoto: File | null;
    designation: string;
    reportingTime: string;
    workDescription: string;
    joiningDate: string;
    familyMembersCount: string;
    familyDependents: string;
    previousWorkplace: string;
    previousDesignation: string;
    reasonForLeaving: string;
    salaryPaymentDate: string;
    iqTestResult: string;
    kgTestResult: string;
    personType: string;
    significantAction: string;
    employeeClassification: string;
    incentivesProvided: string;
    additionalBenefits: string;
    bankAccountNumber: string;
    bankIfscCode: string;
    bankName: string;
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

type TabType = "basic" | "personal" | "job" | "other";

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
    const [activeTab, setActiveTab] = useState<TabType>("basic");

    const initialForm = useMemo<FormData>(() => {
        if (!user) {
            return {
                name: "", phone: "", aadhar: "", pan: "", role: "", isActive: true,
                salaryType: "", salaryAmount: "", newPassword: "", image: null,
                dob: "", address: "", aadharPhoto: null, panPhoto: null, designation: "",
                reportingTime: "", workDescription: "", joiningDate: "", familyMembersCount: "",
                familyDependents: "", previousWorkplace: "", previousDesignation: "", reasonForLeaving: "",
                salaryPaymentDate: "", iqTestResult: "", kgTestResult: "", personType: "",
                significantAction: "", employeeClassification: "", incentivesProvided: "", additionalBenefits: "",
                bankAccountNumber: "", bankIfscCode: "", bankName: ""
            };
        }

        return {
            name: user.name || "",
            phone: user.phone || "",
            aadhar: user.aadhar || "",
            pan: user.pan || "",
            role: user.role,
            isActive: user.isActive,
            salaryType: user.role === "manager" || user.role === "employee" ? "monthly" : user.salaryType || "",
            salaryAmount: user.salaryAmount !== undefined && user.salaryAmount !== null ? String(user.salaryAmount) : "",
            newPassword: "",
            image: null,
            
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            address: user.address || "",
            aadharPhoto: null,
            panPhoto: null,
            designation: user.designation || "",
            reportingTime: user.reportingTime || "",
            workDescription: user.workDescription || "",
            joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : "",
            familyMembersCount: user.familyMembersCount !== undefined ? String(user.familyMembersCount) : "",
            familyDependents: user.familyDependents || "",
            previousWorkplace: user.previousWorkplace || "",
            previousDesignation: user.previousDesignation || "",
            reasonForLeaving: user.reasonForLeaving || "",
            salaryPaymentDate: user.salaryPaymentDate ? String(user.salaryPaymentDate) : "",
            iqTestResult: user.iqTestResult || "",
            kgTestResult: user.kgTestResult || "",
            personType: user.personType || "",
            significantAction: user.significantAction || "",
            employeeClassification: user.employeeClassification || "",
            incentivesProvided: user.incentivesProvided || "",
            additionalBenefits: user.additionalBenefits || "",
            bankAccountNumber: user.bankAccount?.accountNumber || "",
            bankIfscCode: user.bankAccount?.ifscCode || "",
            bankName: user.bankAccount?.bankName || ""
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

    const isSalaryRequired = form.role === "manager" || form.role === "employee" || form.role === "worker";
    const showSalaryType = form.role === "worker";

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (open) { document.addEventListener("keydown", onKeyDown); document.body.style.overflow = "hidden"; }
        return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
    }, [open, onClose]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (deleteMode && deleteCountdown > 0) {
            timer = setTimeout(() => { setDeleteCountdown((prev) => prev - 1); }, 1000);
        }
        return () => clearTimeout(timer);
    }, [deleteMode, deleteCountdown]);

    const handleDeleteStart = async () => {
        if (!user) return;
        setDeleteMode(true);
        setCheckingReferences(true);
        setFetchingSalary(user.role !== "admin");

        try {
            const refRes = await api.get(`/users/${user._id}/references`);
            setReferences(refRes.data.references || []);

            if (user.role !== "admin") {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
                const salRes = await api.get(`/employee-dashboard?employeeId=${user._id}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
                setSalarySummary(salRes.data?.data?.salary || null);
            }
            setDeleteCountdown(5);
        } catch (error) {
            setErrors((prev) => ({ ...prev, general: "Failed to fetch user details for deletion" }));
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
        } catch (error: any) {
            setErrors((prev) => ({ ...prev, general: error?.response?.data?.message || "Failed to delete user permanently" }));
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
            setActiveTab("basic");
            
            if (initialMode === "delete") handleDeleteStart();
            const timer = setTimeout(() => { firstActionRef.current?.focus(); }, 20);
            return () => clearTimeout(timer);
        }
    }, [open, initialForm, initialMode]);

    const validate = () => {
        const nextErrors: FormErrors = {};
        if (!form.name.trim()) nextErrors.name = "Full name is required";
        if (!form.role) nextErrors.role = "Please select a role";
        
        if (isSalaryRequired) {
            if (!form.salaryAmount.trim()) nextErrors.salaryAmount = "Salary amount is required";
            else if (Number(form.salaryAmount) < 0) nextErrors.salaryAmount = "Salary amount cannot be negative";
        }
        if (showSalaryType && !form.salaryType) nextErrors.salaryType = "Please select salary type";
        if (form.newPassword && form.newPassword.trim().length < 6) nextErrors.newPassword = "Password must be at least 6 characters";

        setErrors(nextErrors);
        
        if (Object.keys(nextErrors).length > 0) {
            setActiveTab("basic");
        }
        
        return Object.keys(nextErrors).length === 0;
    };

    const handleRoleChange = (role: Role) => {
        setForm((prev) => {
            const next = { ...prev, role };
            if (role === "admin") { next.salaryType = ""; next.salaryAmount = ""; }
            else if (role === "manager" || role === "employee") { next.salaryType = "monthly"; }
            else if (role === "worker" && !next.salaryType) { next.salaryType = "daily"; }
            return next;
        });
        setErrors((prev) => ({ ...prev, role: undefined, salaryType: undefined, salaryAmount: undefined, general: undefined }));
    };

    const handleFileChange = (field: "image" | "aadharPhoto" | "panPhoto", file: File | null) => {
        if (file && file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, general: "Image size must be less than 5MB" }));
            return;
        }
        setForm(prev => ({ ...prev, [field]: file }));
    };

    const handleFieldChange = (field: keyof FormData, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !validate()) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            
            formData.append("name", form.name.trim());
            formData.append("phone", form.phone.trim());
            formData.append("aadhar", form.aadhar.trim());
            formData.append("pan", form.pan.trim());
            formData.append("role", form.role);
            formData.append("isActive", String(form.isActive));
            
            const salaryType = form.role === "worker" ? form.salaryType : form.role === "manager" || form.role === "employee" ? "monthly" : undefined;
            if (salaryType) formData.append("salaryType", salaryType);
            const salaryAmount = form.role === "admin" || form.salaryAmount.trim() === "" ? 0 : Number(form.salaryAmount);
            formData.append("salaryAmount", String(salaryAmount));
            if (form.image) formData.append("image", form.image);
            
            if (form.dob) formData.append("dob", form.dob);
            if (form.address) formData.append("address", form.address);
            if (form.aadharPhoto) formData.append("aadharPhoto", form.aadharPhoto);
            if (form.panPhoto) formData.append("panPhoto", form.panPhoto);
            if (form.designation) formData.append("designation", form.designation);
            if (form.reportingTime) formData.append("reportingTime", form.reportingTime);
            if (form.workDescription) formData.append("workDescription", form.workDescription);
            if (form.joiningDate) formData.append("joiningDate", form.joiningDate);
            if (form.familyMembersCount) formData.append("familyMembersCount", form.familyMembersCount);
            if (form.familyDependents) formData.append("familyDependents", form.familyDependents);
            if (form.previousWorkplace) formData.append("previousWorkplace", form.previousWorkplace);
            if (form.previousDesignation) formData.append("previousDesignation", form.previousDesignation);
            if (form.reasonForLeaving) formData.append("reasonForLeaving", form.reasonForLeaving);
            if (form.salaryPaymentDate) formData.append("salaryPaymentDate", form.salaryPaymentDate);
            if (form.iqTestResult) formData.append("iqTestResult", form.iqTestResult);
            if (form.kgTestResult) formData.append("kgTestResult", form.kgTestResult);
            if (form.personType) formData.append("personType", form.personType);
            if (form.significantAction) formData.append("significantAction", form.significantAction);
            if (form.employeeClassification) formData.append("employeeClassification", form.employeeClassification);
            if (form.incentivesProvided) formData.append("incentivesProvided", form.incentivesProvided);
            if (form.additionalBenefits) formData.append("additionalBenefits", form.additionalBenefits);
            
            if (form.bankAccountNumber || form.bankIfscCode || form.bankName) {
                formData.append("bankAccount", JSON.stringify({
                    accountNumber: form.bankAccountNumber,
                    ifscCode: form.bankIfscCode,
                    bankName: form.bankName
                }));
            }

            await api.put(`/users/${user._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (form.newPassword.trim()) {
                await api.put(`/users/${user._id}/password`, { newPassword: form.newPassword.trim() });
            }
            onUpdated?.();
            onClose();
        } catch (error: any) {
            setErrors((prev) => ({ ...prev, general: error?.response?.data?.message || "Failed to update user" }));
        } finally {
            setSubmitting(false);
        }
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
        let password = "";
        for (let i = 0; i < 10; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
        setForm((prev) => ({ ...prev, newPassword: password }));
        setShowPassword(true);
        setErrors((prev) => ({ ...prev, newPassword: undefined, general: undefined }));
    };

    if (!open || !user) return null;

    const TabButton = ({ type, icon: Icon, label }: { type: TabType, icon: any, label: string }) => (
        <button 
            type="button" 
            onClick={() => setActiveTab(type)} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === type ? "bg-accent text-white shadow-md" : "text-text-muted hover:bg-muted hover:text-text"}`}
        >
            <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div role="dialog" className="relative z-10 w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden rounded-3xl border border-border bg-white shadow-2xl">
                <div className="flex flex-shrink-0 items-start justify-between border-b border-border px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-primary">
                            <UserCog size={18} />
                        </div>
                        <div>
                            <h2 id={titleId} className="text-lg font-semibold text-text">Edit User - {user.userId}</h2>
                            <p id={descriptionId} className="mt-1 text-sm text-text-muted">Update account, compensation, and profile details.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!deleteMode && (
                            <button type="button" onClick={handleDeleteStart} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100" title="Delete User">
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="rounded-xl p-2 text-text-muted transition hover:bg-muted hover:text-text">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {!deleteMode && (
                    <div className="flex border-b border-border px-5 py-3 bg-surface/30 overflow-x-auto gap-2 flex-shrink-0 scrollbar-hide">
                        <TabButton type="basic" icon={UserCircle} label="Basic & Role" />
                        <TabButton type="personal" icon={FileText} label="Identity" />
                        <TabButton type="job" icon={Briefcase} label="Job History" />
                        <TabButton type="other" icon={Building} label="Payroll & Misc" />
                    </div>
                )}

                <div className="flex flex-1 flex-col overflow-hidden">
                    {deleteMode ? (
                        <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#FAFAFA]">
                            <div className="space-y-6 py-2 max-w-2xl mx-auto">
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                                    <AlertTriangle size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-red-900">Permanent Deletion Warning</h3>
                                <p className="mt-2 text-sm text-red-700">
                                    You are about to permanently delete <strong>{form.name || user.userId}</strong>.
                                    This action cannot be undone and will remove all login access and potentially sever connected data.
                                </p>
                            </div>

                            {checkingReferences ? (
                                <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                                    <Loader2 className="mb-3 animate-spin text-primary" size={28} />
                                    <p className="text-sm font-medium">Checking for associated records...</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-border bg-white shadow-sm p-5">
                                    <h4 className="mb-3 text-sm font-semibold text-text flex items-center gap-2"><ShieldCheck size={16}/> Reference Check</h4>
                                    {references.length > 0 ? (
                                        <div className="space-y-4">
                                            <p className="text-xs text-text-muted">This user is currently linked to the following records. Deleting the user may leave these records unassigned or orphaned.</p>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {references.map((ref, idx) => (
                                                    <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                                                        <span className="text-xs font-medium text-text">{ref.label}</span>
                                                        <span className="rounded-lg bg-accent text-white px-2 py-0.5 text-xs font-bold shadow-sm">{ref.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                                            <ShieldCheck size={20} />
                                            <p className="text-sm font-medium">No active references found. It is relatively safe to delete this user.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {user.role !== "admin" && (
                                <div className="rounded-2xl border border-border bg-white shadow-sm p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-text flex items-center gap-2"><IndianRupee size={16}/> Current Month Salary Summary</h4>
                                        {fetchingSalary && <Loader2 size={16} className="animate-spin text-text-muted" />}
                                    </div>
                                    {salarySummary ? (
                                        <div className="grid gap-3 sm:grid-cols-4">
                                            <div className="rounded-xl border border-border bg-surface p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Advance</p><p className="mt-1 text-lg font-bold text-amber-600">₹{Math.round(salarySummary.totalAdvance).toLocaleString("en-IN")}</p></div>
                                            <div className="rounded-xl border border-border bg-surface p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Repaid</p><p className="mt-1 text-lg font-bold text-amber-700">₹{Math.round(salarySummary.totalDeduction || 0).toLocaleString("en-IN")}</p></div>
                                            <div className="rounded-xl border border-border bg-surface p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Earned Amount</p><p className="mt-1 text-lg font-bold text-emerald-600">₹{Math.round(salarySummary.earned).toLocaleString("en-IN")}</p></div>
                                            <div className="rounded-xl border border-border bg-surface p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Net Payable</p><p className="mt-1 text-lg font-bold text-primary">₹{Math.round(salarySummary.netSalary).toLocaleString("en-IN")}</p></div>
                                        </div>
                                    ) : !fetchingSalary && <p className="text-xs text-text-muted p-3 bg-surface rounded-xl border border-border text-center">No salary data recorded for this month.</p>}
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                                <button type="button" onClick={() => setDeleteMode(false)} className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-white px-6 text-sm font-medium text-text transition hover:bg-muted shadow-sm">Cancel Deletion</button>
                                <button type="button" disabled={deleteCountdown > 0 || deleting} onClick={handlePermanentDelete} className="inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-sm font-medium text-white shadow-md transition hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
                                    {deleting ? <><Loader2 size={18} className="animate-spin" />Deleting...</> : deleteCountdown > 0 ? <><Clock size={18} />Wait {deleteCountdown}s to confirm</> : <><Trash2 size={18} />Confirm Delete</>}
                                </button>
                            </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#FAFAFA]">
                                <div className="space-y-6">
                                    {errors.general && (
                                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">{errors.general}</div>
                                    )}
                            
                            <div className={activeTab === "basic" ? "block space-y-6" : "hidden"}>
                                
                                {/* Profile Picture Section */}
                                <div className="flex flex-col items-center gap-4 border-b border-border pb-6 sm:flex-row">
                                    <div className="relative group">
                                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-white transition group-hover:border-accent">
                                            {form.image ? (
                                                <img src={URL.createObjectURL(form.image)} alt="Preview" className="h-full w-full object-cover" />
                                            ) : user.image ? (
                                                <img src={user.image} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <Upload className="text-text-muted group-hover:text-accent" size={24} />
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={e => handleFileChange("image", e.target.files?.[0] || null)} className="absolute inset-0 cursor-pointer opacity-0" title="Choose profile image" />
                                        {(form.image || user.image) && (
                                            <button type="button" onClick={() => setForm(prev => ({ ...prev, image: null }))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600">
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-sm font-semibold text-text">Profile Picture</h3>
                                        <p className="text-xs text-text-muted mt-1">Update the profile picture for this user.</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-sm font-medium text-text">Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={form.name} onChange={(e) => handleFieldChange("name", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none focus:border-primary transition" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text">Phone</label>
                                        <input type="text" value={form.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none focus:border-primary transition" />
                                    </div>
                                </div>
                                
                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                        <label className="text-sm font-semibold text-text">Reset Password</label>
                                        <p className="mt-1 text-xs text-text-muted">Leave blank if you do not wish to change the current password.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} value={form.newPassword} onChange={(e) => handleFieldChange("newPassword", e.target.value)} placeholder="New password" className="h-11 w-full rounded-2xl border border-border bg-surface px-4 pr-11 text-sm outline-none focus:border-primary transition focus:bg-white" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"><Eye size={18} /></button>
                                        </div>
                                        <button type="button" onClick={generatePassword} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs font-medium text-text transition hover:bg-muted">
                                            <RefreshCw size={14} />Generate Secure Password
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-text">Access Role <span className="text-red-500">*</span></h3>
                                        <p className="mt-1 text-xs text-text-muted">Update the permission level for this account.</p>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {["admin", "manager", "employee", "worker"].map(role => (
                                            <button key={role} type="button" onClick={() => handleRoleChange(role as Role)} className={`rounded-2xl border p-4 text-left transition ${form.role === role ? "border-primary bg-accent/5 shadow-sm" : "border-border bg-surface hover:bg-muted"}`}>
                                                <span className={`block text-sm font-bold capitalize ${form.role === role ? "text-primary" : "text-text"}`}>{role}</span>
                                                <span className={`mt-1 block text-xs ${form.role === role ? "text-primary/80" : "text-text-muted"}`}>
                                                    {role === "admin" && "Full access controls"}
                                                    {role === "manager" && "Supervisory access"}
                                                    {role === "employee" && "Standard access"}
                                                    {role === "worker" && "Wage-based access"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {isSalaryRequired && (
                                    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                        <div className="mb-4">
                                            <h3 className="text-sm font-semibold text-text">Compensation</h3>
                                            <p className="mt-1 text-xs text-text-muted">Update salary settings.</p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {showSalaryType && (
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-text">Salary Type <span className="text-red-500">*</span></label>
                                                    <select value={form.salaryType} onChange={e => handleFieldChange("salaryType", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary transition focus:bg-white">
                                                        <option value="">Select type</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-text">Salary Amount <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"><IndianRupee size={16}/></span>
                                                    <input type="number" value={form.salaryAmount} onChange={e => handleFieldChange("salaryAmount", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface pl-11 pr-4 text-sm outline-none focus:border-primary transition focus:bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-text">Account status</h3>
                                        <p className="mt-1 text-xs text-text-muted">Temporarily suspend or activate the user's login access.</p>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <button type="button" onClick={() => handleFieldChange("isActive", true)} className={`rounded-2xl border p-4 text-left transition ${form.isActive ? "border-green-400 bg-green-50 shadow-sm" : "border-border bg-surface hover:bg-muted"}`}>
                                            <span className={`block text-sm font-bold ${form.isActive ? "text-green-700" : "text-text"}`}>Active</span>
                                            <span className="mt-1 block text-xs text-text-muted">User can sign in.</span>
                                        </button>
                                        <button type="button" onClick={() => handleFieldChange("isActive", false)} className={`rounded-2xl border p-4 text-left transition ${!form.isActive ? "border-red-400 bg-red-50 shadow-sm" : "border-border bg-surface hover:bg-muted"}`}>
                                            <span className={`block text-sm font-bold ${!form.isActive ? "text-red-700" : "text-text"}`}>Inactive</span>
                                            <span className="mt-1 block text-xs text-text-muted">Login is blocked.</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={activeTab === "personal" ? "block space-y-6" : "hidden"}>
                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-text mb-4">Personal Details</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Date of Birth</label>
                                            <input type="date" value={form.dob} onChange={e => handleFieldChange("dob", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Address</label>
                                            <input type="text" value={form.address} onChange={e => handleFieldChange("address", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Family Members Count</label>
                                            <input type="number" value={form.familyMembersCount} onChange={e => handleFieldChange("familyMembersCount", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Family Dependents</label>
                                            <input type="text" value={form.familyDependents} onChange={e => handleFieldChange("familyDependents", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-text">Identity Documents</h3>
                                        <p className="mt-1 text-xs text-text-muted">Update scans of national identity cards.</p>
                                    </div>
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-3 p-4 rounded-2xl border border-dashed border-border bg-surface/50 transition hover:border-border/80">
                                            <label className="text-sm font-semibold text-text">Aadhar Card</label>
                                            <input type="text" placeholder="Aadhar No" value={form.aadhar} onChange={e => handleFieldChange("aadhar", e.target.value)} className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-primary" />
                                            
                                            <div className="relative group mt-2">
                                                <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white transition">
                                                    {form.aadharPhoto ? <img src={URL.createObjectURL(form.aadharPhoto)} className="h-full w-full object-contain p-1" /> : user.aadharPhoto ? <img src={user.aadharPhoto} className="h-full w-full object-contain p-1" /> : (
                                                        <div className="text-center"><Upload className="mx-auto text-text-muted mb-2" size={24} /><span className="text-xs font-medium text-text-muted">Upload</span></div>
                                                    )}
                                                </div>
                                                <input type="file" accept="image/*" onChange={e => handleFileChange("aadharPhoto", e.target.files?.[0] || null)} className="absolute inset-0 cursor-pointer opacity-0" />
                                                {(form.aadharPhoto || user.aadharPhoto) && (
                                                    <button type="button" onClick={() => setForm(prev => ({ ...prev, aadharPhoto: null }))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"><X size={12} /></button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4 rounded-2xl border border-dashed border-border bg-surface/50 transition hover:border-border/80">
                                            <label className="text-sm font-semibold text-text">PAN Card</label>
                                            <input type="text" placeholder="PAN No" value={form.pan} onChange={e => handleFieldChange("pan", e.target.value)} className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-primary" />
                                            
                                            <div className="relative group mt-2">
                                                <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white transition">
                                                    {form.panPhoto ? <img src={URL.createObjectURL(form.panPhoto)} className="h-full w-full object-contain p-1" /> : user.panPhoto ? <img src={user.panPhoto} className="h-full w-full object-contain p-1" /> : (
                                                        <div className="text-center"><Upload className="mx-auto text-text-muted mb-2" size={24} /><span className="text-xs font-medium text-text-muted">Upload</span></div>
                                                    )}
                                                </div>
                                                <input type="file" accept="image/*" onChange={e => handleFileChange("panPhoto", e.target.files?.[0] || null)} className="absolute inset-0 cursor-pointer opacity-0" />
                                                {(form.panPhoto || user.panPhoto) && (
                                                    <button type="button" onClick={() => setForm(prev => ({ ...prev, panPhoto: null }))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"><X size={12} /></button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={activeTab === "job" ? "block space-y-6" : "hidden"}>
                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-text mb-4">Current Job Profile</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Designation</label>
                                            <input type="text" value={form.designation} onChange={e => handleFieldChange("designation", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Employee Classification</label>
                                            <select value={form.employeeClassification} onChange={e => handleFieldChange("employeeClassification", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:bg-white">
                                                <option value="">Select Classification</option>
                                                <option value="White Collar">White Collar</option>
                                                <option value="Blue Collar">Blue Collar</option>
                                            </select>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Reporting Time</label>
                                            <input type="text" value={form.reportingTime} onChange={e => handleFieldChange("reportingTime", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Joining Date</label>
                                            <input type="date" value={form.joiningDate} onChange={e => handleFieldChange("joiningDate", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5 mt-4">
                                        <label className="text-sm font-medium text-text">Work Description / Duty</label>
                                        <textarea value={form.workDescription} onChange={e => handleFieldChange("workDescription", e.target.value)} className="w-full rounded-2xl border border-border bg-surface p-4 text-sm resize-none h-24 outline-none focus:border-primary focus:bg-white transition" />
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-text">Previous Employment</h3>
                                        <p className="mt-1 text-xs text-text-muted">Details regarding the employee's most recent job before joining.</p>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-text">Previous Workplace</label>
                                            <input type="text" value={form.previousWorkplace} onChange={e => handleFieldChange("previousWorkplace", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-text">Previous Designation</label>
                                            <input type="text" value={form.previousDesignation} onChange={e => handleFieldChange("previousDesignation", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5 col-span-2 mt-2">
                                            <label className="text-xs font-medium text-text">Reason for Leaving</label>
                                            <input type="text" value={form.reasonForLeaving} onChange={e => handleFieldChange("reasonForLeaving", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={activeTab === "other" ? "block space-y-6" : "hidden"}>
                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-text mb-4">Bank Account Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-text">Bank Name</label>
                                            <input type="text" value={form.bankName} onChange={e => handleFieldChange("bankName", e.target.value)} className="h-11 rounded-2xl border border-border bg-surface px-4 text-sm w-full outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-text">Account Number</label>
                                            <input type="text" value={form.bankAccountNumber} onChange={e => handleFieldChange("bankAccountNumber", e.target.value)} className="h-11 rounded-2xl border border-border bg-surface px-4 text-sm w-full outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-text">IFSC Code</label>
                                            <input type="text" value={form.bankIfscCode} onChange={e => handleFieldChange("bankIfscCode", e.target.value)} className="h-11 rounded-2xl border border-border bg-surface px-4 text-sm w-full outline-none focus:border-primary uppercase" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-text mb-4">Misc & Assessments</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Salary Payment Date</label>
                                            <input type="number" min="1" max="31" value={form.salaryPaymentDate} onChange={e => handleFieldChange("salaryPaymentDate", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Person Type / Nature</label>
                                            <input type="text" value={form.personType} onChange={e => handleFieldChange("personType", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">IQ Test Result</label>
                                            <input type="text" value={form.iqTestResult} onChange={e => handleFieldChange("iqTestResult", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">KG Test Result</label>
                                            <input type="text" value={form.kgTestResult} onChange={e => handleFieldChange("kgTestResult", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        
                                        <div className="space-y-1.5 col-span-2 mt-2">
                                            <label className="text-sm font-medium text-text">Significant Action to Remember</label>
                                            <input type="text" value={form.significantAction} onChange={e => handleFieldChange("significantAction", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Incentives Provided</label>
                                            <input type="text" value={form.incentivesProvided} onChange={e => handleFieldChange("incentivesProvided", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Additional Benefits</label>
                                            <input type="text" value={form.additionalBenefits} onChange={e => handleFieldChange("additionalBenefits", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                                </div>
                            </div>
                            <div className="border-t border-border bg-white p-4 sm:px-6 flex gap-3 sm:justify-end flex-shrink-0">
                                <button type="button" onClick={onClose} disabled={submitting} className="h-12 px-6 rounded-2xl border border-border bg-white text-sm font-medium text-text shadow-sm transition hover:bg-muted w-full sm:w-auto">Cancel</button>
                                <button type="submit" disabled={submitting || !form.name.trim() || !form.role} className="h-12 px-8 rounded-2xl bg-accent text-white text-sm font-bold shadow-md transition hover:opacity-90 disabled:opacity-60 w-full sm:w-auto">
                                    {submitting ? "Saving changes..." : !form.name.trim() || !form.role ? "Fill Required Info" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}