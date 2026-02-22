"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import Link from "next/link";
import { api } from "../../lib/api";
import { Navbar } from "../../components/navbar";
import { Disclaimer } from "../../components/disclaimer";
import { Protected } from "../../components/protected";

export default function DashboardPage() {
  const [date, setDate] = useState("today");
  const [leagueId, setLeagueId] = useState("");
  const [minConfidence, setMinConfidence] = useState(20);
  const [updatedId, setUpdatedId] = useState<string | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["matches", date, leagueId, minConfidence],
    queryFn: async () => (await api.get("/matches", { params: { date, leagueId: leagueId || undefined, minConfidence } })).data
  });

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, { withCredentials: true });
    s.on("prediction:update", (payload) => { setUpdatedId(payload.matchId); refetch(); setTimeout(()=>setUpdatedId(null), 3000); });
    return () => s.disconnect();
  }, [refetch]);

  const leagues = useMemo(() => {
    const map = new Map<string, string>();
    data?.forEach((m: any) => map.set(m.leagueId, m.league.name));
    return [...map.entries()];
  }, [data]);

  return <Protected><div><Navbar /><main className="max-w-6xl mx-auto p-6 space-y-4"><Disclaimer />
    <div className="grid md:grid-cols-4 gap-3 bg-slate-900 p-3 rounded">
      <select value={date} onChange={(e)=>setDate(e.target.value)} className="bg-slate-800 p-2 rounded"><option value="today">Today</option><option value="tomorrow">Tomorrow</option></select>
      <select value={leagueId} onChange={(e)=>setLeagueId(e.target.value)} className="bg-slate-800 p-2 rounded"><option value="">All leagues</option>{leagues.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
      <input type="range" min={0} max={100} value={minConfidence} onChange={(e)=>setMinConfidence(Number(e.target.value))} />
      <p>Min confidence: {minConfidence}%</p>
    </div>
    <div className="grid md:grid-cols-2 gap-4">{data?.map((m: any)=><Link key={m.id} href={`/matches/${m.id}`} className="p-4 bg-slate-900 rounded border border-slate-800 space-y-1">
      <p className="text-xs text-emerald-300">{m.league.name} • {new Date(m.kickoffAt).toLocaleString()}</p>
      <p className="font-semibold">{m.homeTeam.name} vs {m.awayTeam.name}</p>
      <p>Best scoreline: <span className="font-bold">{m.prediction?.bestScoreline}</span></p>
      <p className="text-sm">Confidence: <span className="px-2 py-1 rounded bg-emerald-700">{m.prediction?.confidence}%</span></p>
      <p className="text-sm">Top 3: {m.prediction?.topScorelines?.map((s: any)=>`${s.score} (${s.probability}%)`).join(", ")}</p>
      {updatedId === m.id && <p className="text-xs text-cyan-300">Updated just now</p>}
    </Link>)}</div></main></div></Protected>;
}
