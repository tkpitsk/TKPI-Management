"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
    Copy,
    Eye,
    EyeOff,
    RefreshCw,
    ShieldPlus,
    Upload,
    X,
    UserCircle,
    Briefcase,
    Building,
    FileText,
    IndianRupee,
} from "lucide-react";
import api from "@/lib/api";

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

type Role = "admin" | "manager" | "employee" | "worker" | "";
type SalaryType = "monthly" | "weekly" | "daily" | "";

type FormData = {
    userId: string;
    password: string;
    role: Role;
    name: string;
    phone: string;
    aadhar: string;
    pan: string;
    salaryType: SalaryType;
    salaryAmount: string;
    image: File | null;
    
    // New fields
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
    userId?: string;
    password?: string;
    role?: string;
    name?: string;
    phone?: string;
    salaryType?: string;
    salaryAmount?: string;
    general?: string;
};

type TabType = "basic" | "personal" | "job" | "other";

export default function CreateUserModal({
    open,
    onClose,
    onCreated,
}: CreateUserModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const firstInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<TabType>("basic");
    const [form, setForm] = useState<FormData>({
        userId: "", password: "", role: "", name: "", phone: "", aadhar: "", pan: "",
        salaryType: "", salaryAmount: "", image: null,
        dob: "", address: "", aadharPhoto: null, panPhoto: null, designation: "",
        reportingTime: "", workDescription: "", joiningDate: "", familyMembersCount: "",
        familyDependents: "", previousWorkplace: "", previousDesignation: "", reasonForLeaving: "",
        salaryPaymentDate: "", iqTestResult: "", kgTestResult: "", personType: "",
        significantAction: "", employeeClassification: "", incentivesProvided: "", additionalBenefits: "",
        bankAccountNumber: "", bankIfscCode: "", bankName: ""
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const isSalaryRequired = useMemo(() => ["manager", "employee", "worker"].includes(form.role), [form.role]);
    const showSalaryType = form.role === "worker";

    useEffect(() => {
        if (!open) {
            setForm({
                userId: "", password: "", role: "", name: "", phone: "", aadhar: "", pan: "",
                salaryType: "", salaryAmount: "", image: null,
                dob: "", address: "", aadharPhoto: null, panPhoto: null, designation: "",
                reportingTime: "", workDescription: "", joiningDate: "", familyMembersCount: "",
                familyDependents: "", previousWorkplace: "", previousDesignation: "", reasonForLeaving: "",
                salaryPaymentDate: "", iqTestResult: "", kgTestResult: "", personType: "",
                significantAction: "", employeeClassification: "", incentivesProvided: "", additionalBenefits: "",
                bankAccountNumber: "", bankIfscCode: "", bankName: ""
            });
            setErrors({});
            setSubmitting(false);
            setShowPassword(false);
            setCopied(false);
            setActiveTab("basic");
            return;
        }

        const timer = setTimeout(() => {
            firstInputRef.current?.focus();
        }, 20);

        return () => clearTimeout(timer);
    }, [open]);

    const validate = () => {
        const nextErrors: FormErrors = {};

        if (!form.name.trim()) nextErrors.name = "Full Name is required";
        if (!form.password) nextErrors.password = "Password is required";
        else if (form.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
        if (!form.role) nextErrors.role = "Please select a role";
        
        if (isSalaryRequired) {
            if (!form.salaryAmount.trim()) nextErrors.salaryAmount = "Salary amount is required";
            else if (Number(form.salaryAmount) < 0) nextErrors.salaryAmount = "Salary amount cannot be negative";
        }
        if (showSalaryType && !form.salaryType) nextErrors.salaryType = "Please select salary type";

        setErrors(nextErrors);
        
        if (Object.keys(nextErrors).length > 0) {
            setActiveTab("basic");
        }
        
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (field: keyof FormData, value: any) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "role") {
                if (value === "admin") { next.salaryType = ""; next.salaryAmount = ""; }
                else if (value === "manager" || value === "employee") { next.salaryType = "monthly"; }
                else if (value === "worker" && !next.salaryType) { next.salaryType = "daily"; }
            }
            return next;
        });

        if (field === "password") setCopied(false);
    };

    const handleFileChange = (field: "image" | "aadharPhoto" | "panPhoto", file: File | null) => {
        if (file && file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, general: "Image size must be less than 5MB" }));
            return;
        }
        setForm(prev => ({ ...prev, [field]: file }));
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
        let password = "";
        for (let i = 0; i < 10; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
        setForm(prev => ({ ...prev, password }));
        setShowPassword(true);
        setCopied(false);
    };

    const copyPassword = async () => {
        if (!form.password) return;
        try {
            await navigator.clipboard.writeText(form.password);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {}
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            
            // Append basic
            formData.append("password", form.password);
            formData.append("role", form.role);
            if (form.name.trim()) formData.append("name", form.name.trim());
            if (form.phone.trim()) formData.append("phone", form.phone.trim());
            if (form.aadhar.trim()) formData.append("aadhar", form.aadhar.trim());
            if (form.pan.trim()) formData.append("pan", form.pan.trim());
            
            const salaryType = form.role === "worker" ? form.salaryType : form.role === "manager" || form.role === "employee" ? "monthly" : undefined;
            if (salaryType) formData.append("salaryType", salaryType);
            if (form.salaryAmount.trim() !== "") formData.append("salaryAmount", form.salaryAmount);
            if (form.image) formData.append("image", form.image);

            // Append new fields
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

            await api.post("/users", formData, { headers: { "Content-Type": "multipart/form-data" } });
            onCreated?.();
            onClose();
        } catch (error: any) {
            setErrors(prev => ({ ...prev, general: error?.response?.data?.message || "Failed to create user" }));
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

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

            <div role="dialog" className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-white shadow-2xl flex flex-col max-h-[95vh]">
                <div className="flex flex-shrink-0 items-start justify-between border-b border-border px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-primary">
                            <ShieldPlus size={18} />
                        </div>
                        <div>
                            <h2 id={titleId} className="text-lg font-semibold text-text">Create User</h2>
                            <p id={descriptionId} className="mt-1 text-sm text-text-muted">Add a new account and configure comprehensive employee details.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-xl p-2 text-text-muted hover:bg-muted">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex border-b border-border px-5 py-3 bg-surface/30 overflow-x-auto gap-2 flex-shrink-0 scrollbar-hide">
                    <TabButton type="basic" icon={UserCircle} label="Basic & Role" />
                    <TabButton type="personal" icon={FileText} label="Identity" />
                    <TabButton type="job" icon={Briefcase} label="Job History" />
                    <TabButton type="other" icon={Building} label="Payroll & Misc" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#FAFAFA]">
                        {errors.general && (
                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                            {errors.general}
                        </div>
                    )}

                    <div className={activeTab === "basic" ? "block space-y-6" : "hidden"}>
                        
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center gap-4 border-b border-border pb-6 sm:flex-row">
                            <div className="relative group">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-white transition group-hover:border-accent">
                                    {form.image ? (
                                        <img src={URL.createObjectURL(form.image)} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <Upload className="text-text-muted group-hover:text-accent" size={24} />
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={e => handleFileChange("image", e.target.files?.[0] || null)} className="absolute inset-0 cursor-pointer opacity-0" title="Choose profile image" />
                                {form.image && (
                                    <button type="button" onClick={() => setForm(prev => ({ ...prev, image: null }))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-sm font-semibold text-text">Profile Picture</h3>
                                <p className="text-xs text-text-muted mt-1">Recommended: Square image, max 5MB. This will be visible across the management panel.</p>
                                <button type="button" className="mt-2 text-xs font-bold text-accent hover:underline" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>Choose Photo</button>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-sm font-medium text-text">Full Name <span className="text-red-500">*</span></label>
                                <input ref={firstInputRef} type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Enter full name" className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none focus:border-primary transition" />
                                <p className="text-[10px] text-text-muted ml-1">User ID auto-generated based on name.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-text">Phone</label>
                                <input type="text" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="Enter phone number" className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none focus:border-primary transition" />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <label className="text-sm font-semibold text-text">Password <span className="text-red-500">*</span></label>
                                <p className="mt-1 text-xs text-text-muted">Use at least 6 characters. Passphrases are better than short complex strings.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="Enter password" className="h-11 w-full rounded-2xl border border-border bg-surface px-4 pr-11 text-sm outline-none focus:border-primary transition focus:bg-white" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition"><Eye size={18} /></button>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <button type="button" onClick={generatePassword} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-text transition hover:bg-muted"><RefreshCw size={16} />Generate Password</button>
                                    <button type="button" onClick={copyPassword} disabled={!form.password} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-text transition hover:bg-muted disabled:opacity-50"><Copy size={16} />{copied ? "Copied" : "Copy"}</button>
                                </div>
                                <p className="text-xs text-text-muted">Generated password avoids confusing characters like O, 0, l, and 1.</p>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-text">Access Role <span className="text-red-500">*</span></h3>
                                <p className="mt-1 text-xs text-text-muted">Choose the permission level for this account.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {["admin", "manager", "employee", "worker"].map(role => {
                                    const active = form.role === role;
                                    return (
                                        <button key={role} type="button" onClick={() => handleChange("role", role)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-accent/5 shadow-sm" : "border-border bg-surface hover:bg-muted"}`}>
                                            <span className={`block text-sm font-bold capitalize ${active ? "text-primary" : "text-text"}`}>{role}</span>
                                            <span className={`mt-1 block text-xs ${active ? "text-primary/80" : "text-text-muted"}`}>
                                                {role === "admin" && "Full access to system controls"}
                                                {role === "manager" && "Operational and supervisory access"}
                                                {role === "employee" && "Standard staff access"}
                                                {role === "worker" && "Workforce and wage-based access"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Compensation */}
                        {isSalaryRequired && (
                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-text">Compensation</h3>
                                    <p className="mt-1 text-xs text-text-muted">Salary settings required for this role.</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {showSalaryType && (
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text">Salary Type <span className="text-red-500">*</span></label>
                                            <select value={form.salaryType} onChange={e => handleChange("salaryType", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary transition focus:bg-white">
                                                <option value="">Select type</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text">Salary Amount <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"><IndianRupee size={16}/></span>
                                            <input type="number" value={form.salaryAmount} onChange={e => handleChange("salaryAmount", e.target.value)} placeholder="0.00" className="h-11 w-full rounded-2xl border border-border bg-surface pl-11 pr-4 text-sm outline-none focus:border-primary transition focus:bg-white" />
                                        </div>
                                        {(form.role === "manager" || form.role === "employee") && (
                                            <p className="text-[10px] text-text-muted">Salary type is fixed to monthly for this role.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={activeTab === "personal" ? "block space-y-6" : "hidden"}>
                        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-text mb-4">Personal Details</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Date of Birth</label>
                                    <input type="date" value={form.dob} onChange={e => handleChange("dob", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Address</label>
                                    <input type="text" placeholder="Full residential address" value={form.address} onChange={e => handleChange("address", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Family Members Count</label>
                                    <input type="number" placeholder="e.g. 4" value={form.familyMembersCount} onChange={e => handleChange("familyMembersCount", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Family Dependents</label>
                                    <input type="text" placeholder="Details of dependents" value={form.familyDependents} onChange={e => handleChange("familyDependents", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-text">Identity Documents</h3>
                                <p className="mt-1 text-xs text-text-muted">Upload high-quality scans of national identity cards.</p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Aadhar */}
                                <div className="space-y-3 p-4 rounded-2xl border border-dashed border-border bg-surface/50 transition hover:border-border/80">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-text">Aadhar Card</label>
                                    </div>
                                    <input type="text" placeholder="Enter 12-digit Aadhar No" value={form.aadhar} onChange={e => handleChange("aadhar", e.target.value)} className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-primary" />
                                    
                                    <div className="relative group mt-2">
                                        <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white transition">
                                            {form.aadharPhoto ? (
                                                <img src={URL.createObjectURL(form.aadharPhoto)} alt="Aadhar" className="h-full w-full object-contain p-1" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="mx-auto text-text-muted mb-2" size={24} />
                                                    <span className="text-xs font-medium text-text-muted">Upload Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={e => handleFileChange("aadharPhoto", e.target.files?.[0] || null)} className="absolute inset-0 cursor-pointer opacity-0" />
                                        {form.aadharPhoto && (
                                            <button type="button" onClick={() => setForm(prev => ({ ...prev, aadharPhoto: null }))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600">
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* PAN */}
                                <div className="space-y-3 p-4 rounded-2xl border border-dashed border-border bg-surface/50 transition hover:border-border/80">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-text">PAN Card</label>
                                    </div>
                                    <input type="text" placeholder="Enter PAN No" value={form.pan} onChange={e => handleChange("pan", e.target.value)} className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-primary" />
                                    
                                    <div className="relative group mt-2">
                                        <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white transition">
                                            {form.panPhoto ? (
                                                <img src={URL.createObjectURL(form.panPhoto)} alt="PAN" className="h-full w-full object-contain p-1" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="mx-auto text-text-muted mb-2" size={24} />
                                                    <span className="text-xs font-medium text-text-muted">Upload Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={e => handleFileChange("panPhoto", e.target.files?.[0] || null)} className="absolute inset-0 cursor-pointer opacity-0" />
                                        {form.panPhoto && (
                                            <button type="button" onClick={() => setForm(prev => ({ ...prev, panPhoto: null }))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600">
                                                <X size={12} />
                                            </button>
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
                                    <input type="text" placeholder="e.g. Senior Technician" value={form.designation} onChange={e => handleChange("designation", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Employee Classification</label>
                                    <select value={form.employeeClassification} onChange={e => handleChange("employeeClassification", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:bg-white">
                                        <option value="">Select Classification</option>
                                        <option value="White Collar">White Collar</option>
                                        <option value="Blue Collar">Blue Collar</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Reporting Time</label>
                                    <input type="text" value={form.reportingTime} onChange={e => handleChange("reportingTime", e.target.value)} placeholder="e.g. 09:00 AM" className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Joining Date</label>
                                    <input type="date" value={form.joiningDate} onChange={e => handleChange("joiningDate", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5 mt-4">
                                <label className="text-sm font-medium text-text">Work Description / Duty</label>
                                <textarea placeholder="Describe the daily responsibilities..." value={form.workDescription} onChange={e => handleChange("workDescription", e.target.value)} className="w-full rounded-2xl border border-border bg-surface p-4 text-sm resize-none h-24 outline-none focus:border-primary focus:bg-white transition" />
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
                                    <input type="text" placeholder="Company Name" value={form.previousWorkplace} onChange={e => handleChange("previousWorkplace", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text">Previous Designation</label>
                                    <input type="text" placeholder="Role/Title" value={form.previousDesignation} onChange={e => handleChange("previousDesignation", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5 col-span-2 mt-2">
                                    <label className="text-xs font-medium text-text">Reason for Leaving</label>
                                    <input type="text" placeholder="Why did they leave?" value={form.reasonForLeaving} onChange={e => handleChange("reasonForLeaving", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
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
                                    <input type="text" placeholder="e.g. HDFC Bank" value={form.bankName} onChange={e => handleChange("bankName", e.target.value)} className="h-11 rounded-2xl border border-border bg-surface px-4 text-sm w-full outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text">Account Number</label>
                                    <input type="text" placeholder="XXXXXXXXXXX" value={form.bankAccountNumber} onChange={e => handleChange("bankAccountNumber", e.target.value)} className="h-11 rounded-2xl border border-border bg-surface px-4 text-sm w-full outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text">IFSC Code</label>
                                    <input type="text" placeholder="e.g. HDFC0001234" value={form.bankIfscCode} onChange={e => handleChange("bankIfscCode", e.target.value)} className="h-11 rounded-2xl border border-border bg-surface px-4 text-sm w-full outline-none focus:border-primary uppercase" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-text mb-4">Misc & Assessments</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Salary Payment Date</label>
                                    <input type="number" min="1" max="31" placeholder="Day of the month (1-31)" value={form.salaryPaymentDate} onChange={e => handleChange("salaryPaymentDate", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Person Type / Nature</label>
                                    <input type="text" placeholder="Behavioral notes" value={form.personType} onChange={e => handleChange("personType", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">IQ Test Result</label>
                                    <input type="text" placeholder="Score / Feedback" value={form.iqTestResult} onChange={e => handleChange("iqTestResult", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">KG Test Result</label>
                                    <input type="text" placeholder="Score / Feedback" value={form.kgTestResult} onChange={e => handleChange("kgTestResult", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                
                                <div className="space-y-1.5 col-span-2 mt-2">
                                    <label className="text-sm font-medium text-text">Significant Action to Remember</label>
                                    <input type="text" placeholder="Any notable achievements or incidents..." value={form.significantAction} onChange={e => handleChange("significantAction", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Incentives Provided</label>
                                    <input type="text" placeholder="Details of incentives" value={form.incentivesProvided} onChange={e => handleChange("incentivesProvided", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text">Additional Benefits</label>
                                    <input type="text" placeholder="Other perks..." value={form.additionalBenefits} onChange={e => handleChange("additionalBenefits", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>
                    </div>

                    </div>
                    <div className="border-t border-border bg-white p-4 sm:px-6 flex gap-3 sm:justify-end flex-shrink-0">
                        <button type="button" onClick={onClose} className="h-12 px-6 rounded-2xl border border-border bg-white text-sm font-medium text-text shadow-sm transition hover:bg-muted w-full sm:w-auto">Cancel</button>
                        <button type="submit" disabled={submitting || !form.name.trim() || !form.password || !form.role} className="h-12 px-8 rounded-2xl bg-accent text-white text-sm font-bold shadow-md transition hover:opacity-90 disabled:opacity-60 w-full sm:w-auto">
                            {submitting ? "Saving..." : !form.name.trim() || !form.password || !form.role ? "Fill Required Info" : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}