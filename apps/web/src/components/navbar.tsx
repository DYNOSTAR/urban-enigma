"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authStore } from "../lib/auth-store";
import { setAuthToken } from "../lib/api";

export function Navbar() {
  const router = useRouter();
  const user = authStore.user;
  return (
    <nav className="p-4 border-b border-slate-800 flex justify-between items-center">
      <div className="space-x-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/favorites">Favorites</Link>
        {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
      </div>
      <div className="flex gap-3 items-center">
        <span className="text-sm text-slate-300">{user?.email}</span>
        <button className="bg-slate-700 px-3 py-1 rounded" onClick={() => { authStore.token = null; authStore.user = null; setAuthToken(null); router.push("/auth/login"); }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
