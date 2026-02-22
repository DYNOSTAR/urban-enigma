"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { Navbar } from "../../../components/navbar";
import { Disclaimer } from "../../../components/disclaimer";
import { Protected } from "../../../components/protected";

export default function MatchDetail() {
  const params = useParams<{ id: string }>();
  const { data } = useQuery({ queryKey: ["match", params.id], queryFn: async () => (await api.get(`/matches/${params.id}`)).data });

  return <Protected><div><Navbar /><main className="max-w-4xl mx-auto p-6 space-y-4"><Disclaimer />
    <h1 className="text-2xl font-semibold">{data?.homeTeam?.name} vs {data?.awayTeam?.name}</h1>
    <p>Best projected score: {data?.prediction?.bestScoreline} ({data?.prediction?.confidence}%)</p>
    <p>Why this prediction: {data?.prediction?.explanation}</p>
    <p>Form summary: {data?.formSummary}</p>
    <p>Head-to-head summary: {data?.headToHeadSummary}</p>
    <p>Performance snippet: {data?.performanceSnippet}</p>
  </main></div></Protected>;
}
