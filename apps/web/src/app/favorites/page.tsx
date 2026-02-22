"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Navbar } from "../../components/navbar";
import { Protected } from "../../components/protected";

export default function FavoritesPage() {
  const { data, refetch } = useQuery({ queryKey: ["favorites"], queryFn: async () => (await api.get("/favorites")).data });
  return <Protected><div><Navbar /><main className="max-w-4xl mx-auto p-6 space-y-3"><h1 className="text-2xl">Favorites</h1>
    {data?.map((f: any)=><div key={f.id} className="bg-slate-900 p-4 rounded flex justify-between"><p>{f.match.homeTeam.name} vs {f.match.awayTeam.name} • {f.match.prediction?.bestScoreline}</p><button onClick={async()=>{await api.delete(`/favorites/${f.matchId}`); refetch();}} className="underline">Remove</button></div>)}
  </main></div></Protected>;
}
