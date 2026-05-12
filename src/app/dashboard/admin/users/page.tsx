"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
    BadgeCheck,
    Ban,
    Briefcase,
    HardHat,
    IndianRupee,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UserCog,
    Users,
} from "lucide-react";
import CreateUserModal from "@/components/users/CreateUserModal";
import EditUserModal from "@/components/users/EditUserModal";

interface User {
    _id: string;
    userId: string;
    name?: string;
    phone?: string;
    role: "admin" | "manager" | "employee" | "worker";
    salaryType?: "monthly" | "weekly" | "daily";
    salaryAmount?: number;
    isActive: boolean;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalMode, setModalMode] = useState<"edit" | "delete">("edit");

    const fetchUsers = async () => {
        try {
            setPageError("");
            const res = await api.get("/users");
            setUsers(res.data || []);
        } catch (error) {
            console.error(error);
            setPageError("Failed to fetch users. Please refresh and try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const q = search.trim().toLowerCase();

            const matchesSearch =
                !q ||
                user.userId.toLowerCase().includes(q) ||
                user.name?.toLowerCase().includes(q) ||
                user.phone?.toLowerCase().includes(q);

            const matchesRole =
                roleFilter === "all" ? true : user.role === roleFilter;

            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "active"
                        ? user.isActive
                        : !user.isActive;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: users.length,
            active: users.filter((u) => u.isActive).length,
            inactive: users.filter((u) => !u.isActive).length,
            admins: users.filter((u) => u.role === "admin").length,
        };
    }, [users]);

    const getRoleClass = (role: User["role"]) => {
        switch (role) {
            case "admin":
                return "border-purple-200 bg-purple-50 text-purple-700";
            case "manager":
                return "border-blue-200 bg-blue-50 text-blue-700";
            case "employee":
                return "border-slate-200 bg-slate-50 text-slate-700";
            case "worker":
                return "border-amber-200 bg-amber-50 text-amber-700";
            default:
                return "border-slate-200 bg-slate-50 text-slate-700";
        }
    };

    const getStatusClass = (isActive: boolean) =>
        isActive
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700";

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const formatSalary = (user: User) => {
        if (!user.salaryAmount || user.salaryAmount <= 0) return "—";
        const amount = new Intl.NumberFormat("en-IN").format(Math.round(user.salaryAmount));
        return `₹${amount}${user.salaryType ? ` / ${user.salaryType}` : ""}`;
    };

    const handleDeactivate = async (id: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to deactivate this user?"
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`/users/${id}`);
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === id ? { ...user, isActive: false } : user
                )
            );
        } catch (error) {
            console.error(error);
            alert("Failed to deactivate user");
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setModalMode("edit");
        setEditModalOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setModalMode("delete");
        setEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <div className="space-y-2">
                    <div className="h-8 w-44 animate-pulse rounded-xl bg-muted" />
                    <div className="h-4 w-72 animate-pulse rounded bg-muted" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-28 animate-pulse rounded-3xl border border-border bg-white"
                        />
                    ))}
                </div>

                <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
                    <div className="mb-4 h-11 w-full animate-pulse rounded-2xl bg-muted" />
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-16 animate-pulse rounded-2xl bg-muted"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Create users, assign roles, manage wages, and control account access.
                    </p>
                </div>

                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                >
                    <Plus size={16} />
                    Add User
                </button>
            </div>

            {pageError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {pageError}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Users" value={stats.total} icon={<Users size={18} />} />
                <StatCard label="Active Users" value={stats.active} icon={<BadgeCheck size={18} />} />
                <StatCard label="Inactive Users" value={stats.inactive} icon={<UserCog size={18} />} />
                <StatCard label="Admins" value={stats.admins} icon={<ShieldCheck size={18} />} />
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
                <div className="border-b border-border px-4 py-4 md:px-5">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-text md:text-base">
                                    Users List
                                </h2>
                                <p className="text-xs text-text-muted">
                                    Search by user ID, name, or phone and filter by role or status
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-sm">
                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search user ID, name, phone..."
                                    className="h-11 w-full rounded-2xl border border-border bg-surface pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-2">
                                {["all", "admin", "manager", "employee", "worker"].map((role) => {
                                    const active = roleFilter === role;
                                    return (
                                        <button
                                            key={role}
                                            onClick={() => setRoleFilter(role)}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${active
                                                ? "border-accent bg-accent text-white"
                                                : "border-border bg-white text-text-muted hover:bg-muted"
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {["all", "active", "inactive"].map((status) => {
                                    const active = statusFilter === status;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${active
                                                ? "border-primary bg-accent text-white"
                                                : "border-border bg-white text-text-muted hover:bg-muted"
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-text-muted">
                            <Users size={24} />
                        </div>
                        <h3 className="text-base font-semibold text-text">No users found</h3>
                        <p className="mt-1 max-w-md text-sm text-text-muted">
                            No users match your current search or applied filters.
                        </p>
                        <button
                            onClick={() => {
                                setSearch("");
                                setRoleFilter("all");
                                setStatusFilter("all");
                            }}
                            className="mt-5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-muted"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-245 text-sm">
                            <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-text-muted">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">User</th>
                                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                                    <th className="px-4 py-3 text-left font-semibold">Salary</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="transition hover:bg-surface/60">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name || user.userId}
                                                        className="h-10 w-10 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
                                                        <Users size={16} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-text">
                                                        {user.name?.trim() || user.userId}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
                                                        <span>@{user.userId}</span>
                                                        {user.phone && <span>• {user.phone}</span>}
                                                        <span>• {user._id.slice(-6)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getRoleClass(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-text-muted">
                                            <div className="inline-flex items-center gap-1">
                                                <IndianRupee size={14} />
                                                <span>{formatSalary(user)}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    user.isActive
                                                )}`}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-text-muted">
                                            {formatDate(user.createdAt)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-medium text-text transition hover:bg-muted"
                                                >
                                                    <UserCog size={14} />
                                                    Edit
                                                </button>

                                                {user.isActive && (
                                                    <button
                                                        onClick={() => handleDeactivate(user._id)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
                                                    >
                                                        <Ban size={14} />
                                                        Deactivate
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateUserModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={fetchUsers}
            />

            <EditUserModal
                open={editModalOpen}
                user={selectedUser}
                initialMode={modalMode}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedUser(null);
                }}
                onUpdated={fetchUsers}
            />
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-text-muted">
                    {label}
                </p>
                <div className="rounded-xl bg-accent/10 p-2 text-primary">{icon}</div>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-text">
                {value}
            </p>
        </div>
    );
}