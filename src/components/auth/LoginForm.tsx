"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

import AuthCard from "./AuthCard";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";

export default function LoginForm() {

  const { login, user, loading } = useAuth();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [loading, user, router]);

  const handleLogin = async () => {
    try {
      setSubmitting(true);
      await login(userId, password);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard>

      {/* Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-serif text-text-primary">
          KPI Management
        </h1>

        <p className="text-sm text-text-muted mt-1">
          Sign in to continue
        </p>
      </div>

      <div className="space-y-4">

        <AuthInput
          label="User ID"
          placeholder="Enter your user ID"
          value={userId}
          onChange={(e)=>setUserId(e.target.value)}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <AuthButton
          loading={submitting}
          onClick={handleLogin}
        >
          Sign in
        </AuthButton>

      </div>

      <p className="mt-6 text-xs text-center text-text-muted">
        © {new Date().getFullYear()} KPI Management
      </p>

    </AuthCard>
  );
}