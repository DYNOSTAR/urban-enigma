"use client";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { authStore } from "../lib/auth-store";
import { setAuthToken } from "../lib/api";

export function Protected({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    const token = authStore.token;
    const user = authStore.user;
    if (!token || !user) router.push("/auth/login");
    else if (adminOnly && user.role !== "ADMIN") router.push("/dashboard");
    else setAuthToken(token);
  }, [router, adminOnly]);
  return <>{children}</>;
}
