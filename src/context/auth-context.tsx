"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

interface User {
    id: string;
    userId: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userId: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD USER ================= */

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = Cookies.get("token");

                if (!token) {
                    setLoading(false);
                    return;
                }

                const res = await api.get("/auth/me");

                setUser(res.data.user);
            } catch (err) {
                console.error("Auth load error:", err);
                Cookies.remove("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    /* ================= LOGIN ================= */

    const login = async (userId: string, password: string) => {
        const res = await api.post("/auth/login", {
            userId,
            password,
        });

        const { accessToken, user } = res.data;

        /* 🔥 FORCE COOKIE */
        Cookies.set("token", accessToken, {
            expires: 7,
            path: "/", // IMPORTANT
        });
        
        setUser(user);
        
        /* ensure interceptor picks token */
        window.location.reload();
    };

    /* ================= LOGOUT ================= */

    const logout = () => {
        Cookies.remove("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/* ================= HOOK ================= */

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}