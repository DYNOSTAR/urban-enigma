"use client";
import { FormEvent, useState } from "react";
import { api } from "../../../lib/api";

export default function ResetPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const submit = async (e: FormEvent) => { e.preventDefault(); await api.post('/auth/reset-password',{token,password}); setMsg('Password updated.'); };
  return <form onSubmit={submit} className="max-w-md mx-auto mt-16 space-y-4 p-6 bg-slate-900 rounded"><h1>Reset Password</h1><input className="w-full p-2 bg-slate-800 rounded" value={token} onChange={(e)=>setToken(e.target.value)} placeholder="Reset token"/><input type="password" className="w-full p-2 bg-slate-800 rounded" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="New password"/><button className="w-full bg-emerald-600 p-2 rounded">Reset</button><p>{msg}</p></form>;
}
