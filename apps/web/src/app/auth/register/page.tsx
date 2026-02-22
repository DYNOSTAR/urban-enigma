"use client";
import { FormEvent, useState } from "react";
import { api, setAuthToken } from "../../../lib/api";
import { authStore } from "../../../lib/auth-store";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const { data } = await api.post("/auth/register", { email, password });
    authStore.token = data.accessToken;
    authStore.user = data.user;
    setAuthToken(data.accessToken);
    router.push("/dashboard");
  };

  return <form onSubmit={submit} className="max-w-md mx-auto mt-16 space-y-4 p-6 bg-slate-900 rounded">
    <h1 className="text-2xl font-semibold">Register</h1>
    <input className="w-full p-2 bg-slate-800 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
    <input className="w-full p-2 bg-slate-800 rounded" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
    <button className="w-full bg-emerald-600 p-2 rounded">Create account</button>
  </form>;
}
