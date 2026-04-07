"use client";

import { useAuth } from "@/context/auth-context";

export default function Header() {

    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">

            {/* User Info */}
            <div className="flex flex-col">
                <span className="text-xs text-text-muted">
                    Logged in as
                </span>

                <span className="text-sm font-medium text-text-primary flex items-center gap-2">
                    {user.userId}
                    <span className="text-[10px] px-3 py-1 uppercase border border-border bg-border rounded-full">{user.role}</span>
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={logout}
                    className="text-sm font-medium text-text-secondary hover:text-red-600 transition cursor-pointer"
                >
                    Logout
                </button>

            </div>

        </header>
    );
}