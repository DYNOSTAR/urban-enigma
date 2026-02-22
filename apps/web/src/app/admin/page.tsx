"use client";
import { FormEvent, useState } from "react";
import { api } from "../../lib/api";
import { Navbar } from "../../components/navbar";
import { Protected } from "../../components/protected";

export default function AdminPage() {
  const [league, setLeague] = useState({ name: "", country: "" });
  const [msg, setMsg] = useState("");
  const createLeague = async (e: FormEvent) => { e.preventDefault(); await api.post('/admin/leagues', league); setMsg('League created'); };
  return <Protected adminOnly><div><Navbar /><main className="max-w-3xl mx-auto p-6 space-y-4">
    <h1 className="text-2xl">Admin Panel</h1>
    <button onClick={async()=>{await api.post('/admin/refresh-predictions'); setMsg('Prediction refresh triggered');}} className="bg-emerald-700 px-4 py-2 rounded">Refresh predictions</button>
    <form onSubmit={createLeague} className="bg-slate-900 p-4 rounded space-y-2"><h2>Create league</h2><input className="w-full bg-slate-800 p-2 rounded" placeholder="Name" value={league.name} onChange={(e)=>setLeague({...league,name:e.target.value})}/><input className="w-full bg-slate-800 p-2 rounded" placeholder="Country" value={league.country} onChange={(e)=>setLeague({...league,country:e.target.value})}/><button className="bg-slate-700 px-3 py-1 rounded">Save</button></form>
    {msg && <p>{msg}</p>}
  </main></div></Protected>;
}
