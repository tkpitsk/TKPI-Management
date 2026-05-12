"use client";

import { useAuth } from "@/context/auth-context";

export default function Header() {

    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">

            {/* User Info */}
                <div className="flex items-center gap-3">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name || user.userId}
                            className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold border border-brand-primary/20">
                            {(user.name || user.userId).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary flex items-center gap-2">
                            {user.name || user.userId}
                            <span className="text-[10px] px-2 py-0.5 uppercase border border-border bg-border rounded-full font-bold">{user.role}</span>
                        </span>
                        <span className="text-[10px] text-text-muted">
                            @{user.userId}
                        </span>
                    </div>
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