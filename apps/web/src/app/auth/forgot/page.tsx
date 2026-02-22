"use client";
import { FormEvent, useState } from "react";
import { api } from "../../../lib/api";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const submit = async (e: FormEvent) => { e.preventDefault(); await api.post('/auth/forgot-password',{email}); setMsg('If account exists, reset instructions have been generated.'); };
  return <form onSubmit={submit} className="max-w-md mx-auto mt-16 space-y-4 p-6 bg-slate-900 rounded"><h1>Forgot Password</h1><input className="w-full p-2 bg-slate-800 rounded" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email"/><button className="w-full bg-emerald-600 p-2 rounded">Request reset</button><p>{msg}</p></form>;
}
