"use client";

import { useEffect, useState, useId } from "react";
import {
    X,
    UserCircle,
    Briefcase,
    Building,
    FileText,
    Calendar,
    Phone,
    MapPin,
    CreditCard,
    Info,
    ShieldCheck,
    CalendarCheck2,
    Users,
    Activity,
    IndianRupee,
    Clock,
    Medal,
    BadgeCheck
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
    createdAt?: string;
}

interface ViewUserModalProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
}

type TabType = "basic" | "personal" | "job" | "other";

export default function ViewUserModal({ open, user, onClose }: ViewUserModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const [activeTab, setActiveTab] = useState<TabType>("basic");
    const [stats, setStats] = useState<{ totalLeaves: number, financialYear: string } | null>(null);

    useEffect(() => {
        if (!open) {
            setActiveTab("basic");
            setStats(null);
            return;
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open && user && (user.role === "employee" || user.role === "worker")) {
            const fetchStats = async () => {
                try {
                    const res = await api.get(`/users/${user._id}/stats`);
                    setStats(res.data);
                } catch (error) {
                    console.error("Failed to fetch user stats", error);
                }
            };
            fetchStats();
        }
    }, [open, user]);

    if (!open || !user) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not provided";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric"
        });
    };

    const InfoItem = ({ label, value, icon: Icon, highlight = false }: { label: string, value?: string | number, icon?: any, highlight?: boolean }) => (
        <div className={`flex flex-col gap-1.5 p-4 rounded-2xl border transition ${highlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-surface/50 hover:bg-surface'}`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                {Icon && <Icon size={14} />} {label}
            </span>
            <span className={`text-sm ${value ? 'font-semibold text-text' : 'font-medium text-text-muted italic'}`}>
                {value || "Not provided"}
            </span>
        </div>
    );

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
                {/* Header */}
                <div className="flex flex-shrink-0 items-start justify-between border-b border-border px-6 py-5 bg-gradient-to-r from-surface to-white">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-3xl bg-accent/10 text-primary border-2 border-white shadow-sm">
                            {user.image ? (
                                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <UserCircle size={32} />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 id={titleId} className="text-xl font-bold text-text">
                                    {user.name || "Unnamed User"}
                                </h2>
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${user.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {user.isActive ? 'Active Account' : 'Inactive Account'}
                                </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-text-muted">
                                <span className="bg-white px-2 py-1 rounded-md border border-border shadow-sm flex items-center gap-1">
                                    <ShieldCheck size={12}/> @{user.userId}
                                </span>
                                <span className="bg-white px-2 py-1 rounded-md border border-border shadow-sm flex items-center gap-1 capitalize">
                                    <Briefcase size={12}/> {user.role}
                                </span>
                                {user.designation && (
                                    <span className="flex items-center gap-1 text-text">
                                        <BadgeCheck size={14} className="text-accent" /> {user.designation}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-xl p-2.5 text-text-muted bg-white border border-border shadow-sm transition hover:bg-muted hover:text-text">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex border-b border-border px-5 py-3 bg-surface/30 overflow-x-auto gap-2 flex-shrink-0 scrollbar-hide">
                    <TabButton type="basic" icon={UserCircle} label="Basic Info" />
                    <TabButton type="personal" icon={FileText} label="Personal & Identity" />
                    <TabButton type="job" icon={Briefcase} label="Job & History" />
                    <TabButton type="other" icon={Building} label="Payroll & Misc" />
                </div>

                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#FAFAFA]">
                        {activeTab === "basic" && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
                                    <UserCircle size={18} className="text-primary"/> Contact & System Info
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <InfoItem label="Full Name" value={user.name} />
                                    <InfoItem label="Phone Number" value={user.phone} icon={Phone} />
                                    <InfoItem label="System Role" value={user.role} icon={ShieldCheck} />
                                    <InfoItem label="Database ID" value={user._id} />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
                                    <Activity size={18} className="text-primary"/> Account Status
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InfoItem label="Account Created" value={formatDate(user.createdAt)} icon={Calendar} />
                                    <div className="flex flex-col gap-1.5 p-4 rounded-2xl border border-border bg-surface/50">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Current Status</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-sm font-semibold text-text">{user.isActive ? "Active & Permitted" : "Blocked / Inactive"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {(user.role === "employee" || user.role === "worker") && stats && (
                                <div className="rounded-3xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-red-900 flex items-center gap-2 mb-4">
                                        <CalendarCheck2 size={18} className="text-red-600"/> Attendance Statistics
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1 p-5 rounded-2xl border border-red-200 bg-white shadow-sm">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">Total Leaves Taken</span>
                                            <div className="flex items-end gap-2 mt-1">
                                                <span className="text-3xl font-black text-red-700">{stats.totalLeaves}</span>
                                                <span className="text-sm font-semibold text-red-500 mb-1">days</span>
                                            </div>
                                            <span className="text-xs font-medium text-red-400 mt-2">Financial Year: {stats.financialYear}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "personal" && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
                                    <Users size={18} className="text-primary"/> Demographics & Family
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoItem label="Date of Birth" value={formatDate(user.dob)} icon={Calendar} />
                                    <InfoItem label="Residential Address" value={user.address} icon={MapPin} />
                                    <InfoItem label="Family Members Count" value={user.familyMembersCount} />
                                    <InfoItem label="Family Dependents Info" value={user.familyDependents} />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
                                    <CreditCard size={18} className="text-primary"/> Identity Documents
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col border border-border rounded-2xl overflow-hidden bg-surface/30">
                                        <div className="flex justify-between items-center p-4 border-b border-border bg-white">
                                            <span className="text-sm font-bold text-text">Aadhar Card</span>
                                            <span className="font-mono text-sm font-semibold tracking-wider text-primary">{user.aadhar || "Not Provided"}</span>
                                        </div>
                                        <div className="p-4 flex items-center justify-center min-h-[200px]">
                                            {user.aadharPhoto ? (
                                                <img src={user.aadharPhoto} alt="Aadhar" className="max-w-full max-h-48 object-contain rounded-xl shadow-sm border border-border" />
                                            ) : (
                                                <div className="flex flex-col items-center text-text-muted"><CreditCard size={32} className="mb-2 opacity-50" /><span className="text-sm font-medium">No Image Uploaded</span></div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col border border-border rounded-2xl overflow-hidden bg-surface/30">
                                        <div className="flex justify-between items-center p-4 border-b border-border bg-white">
                                            <span className="text-sm font-bold text-text">PAN Card</span>
                                            <span className="font-mono text-sm font-semibold tracking-wider text-primary">{user.pan || "Not Provided"}</span>
                                        </div>
                                        <div className="p-4 flex items-center justify-center min-h-[200px]">
                                            {user.panPhoto ? (
                                                <img src={user.panPhoto} alt="PAN" className="max-w-full max-h-48 object-contain rounded-xl shadow-sm border border-border" />
                                            ) : (
                                                <div className="flex flex-col items-center text-text-muted"><CreditCard size={32} className="mb-2 opacity-50" /><span className="text-sm font-medium">No Image Uploaded</span></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "job" && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
                                    <Briefcase size={18} className="text-primary"/> Current Employment
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <InfoItem label="Designation" value={user.designation} highlight={true} />
                                    <InfoItem label="Classification" value={user.employeeClassification} />
                                    <InfoItem label="Reporting Time" value={user.reportingTime} icon={Clock} />
                                    <InfoItem label="Joining Date" value={formatDate(user.joiningDate)} icon={Calendar} />
                                </div>
                                <div className="mt-4 flex flex-col gap-1.5 p-4 rounded-2xl border border-border bg-surface/50">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Work Description & Duties</span>
                                    <p className="text-sm text-text whitespace-pre-wrap mt-1 leading-relaxed">
                                        {user.workDescription || <span className="italic text-text-muted">No description provided</span>}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
                                    <Building size={18} className="text-primary"/> Previous Experience
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoItem label="Previous Workplace" value={user.previousWorkplace} icon={Building} />
                                    <InfoItem label="Previous Designation" value={user.previousDesignation} icon={BadgeCheck} />
                                    <div className="sm:col-span-2">
                                        <InfoItem label="Reason for Leaving" value={user.reasonForLeaving} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "other" && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
                                    <IndianRupee size={18} className="text-primary"/> Compensation & Banking
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <InfoItem label="Salary Type" value={user.salaryType} />
                                    <InfoItem label="Salary Amount" value={user.salaryAmount ? `₹${user.salaryAmount.toLocaleString('en-IN')}` : undefined} highlight={true} />
                                    <InfoItem label="Payment Date" value={user.salaryPaymentDate ? `${user.salaryPaymentDate}${user.salaryPaymentDate === 1 ? 'st' : user.salaryPaymentDate === 2 ? 'nd' : user.salaryPaymentDate === 3 ? 'rd' : 'th'} of month` : undefined} icon={Calendar} />
                                    <InfoItem label="Person Type" value={user.personType} />
                                </div>
                                <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InfoItem label="Bank Name" value={user.bankAccount?.bankName} icon={Building} />
                                    <InfoItem label="Account Number" value={user.bankAccount?.accountNumber} />
                                    <InfoItem label="IFSC Code" value={user.bankAccount?.ifscCode} />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
                                    <Medal size={18} className="text-primary"/> Assessments & Extras
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <InfoItem label="IQ Test Result" value={user.iqTestResult} />
                                    <InfoItem label="KG Test Result" value={user.kgTestResult} />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <InfoItem label="Significant Action to Remember" value={user.significantAction} />
                                    <InfoItem label="Incentives Provided" value={user.incentivesProvided} />
                                    <InfoItem label="Additional Benefits" value={user.additionalBenefits} />
                                </div>
                            </div>
                        </div>
                        )}
                    </div>

                    <div className="border-t border-border p-4 sm:px-6 bg-white flex justify-end flex-shrink-0">
                        <button type="button" onClick={onClose} className="h-12 px-8 rounded-2xl bg-accent text-white text-sm font-bold shadow-md transition hover:opacity-90 w-full sm:w-auto">
                            Close Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
