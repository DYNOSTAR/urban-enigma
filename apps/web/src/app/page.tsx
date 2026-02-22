import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">Sure Odds</h1>
      <p className="text-slate-300">Real-time football correct-score insights powered by a transparent probabilistic model.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {[1,2,3].map((n) => <div key={n} className="p-4 rounded bg-slate-900 border border-slate-700 blur-[1px]">Sample prediction #{n}: 2-1 • confidence 41%</div>)}
      </div>
      <div className="space-x-3">
        <Link className="bg-emerald-600 px-4 py-2 rounded" href="/auth/register">Create account</Link>
        <Link className="bg-slate-700 px-4 py-2 rounded" href="/auth/login">Sign in</Link>
      </div>
    </main>
  );
}
