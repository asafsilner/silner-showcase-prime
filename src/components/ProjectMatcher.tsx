import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { projectsData } from "@/data/projects";

type Rec = { id: string; relevance: number; reason: string; highlights: string[] };
type Result = { summary: string; recommendations: Rec[] };

const examples = [
  "Senior game designer for a mobile F2P puzzle studio",
  "Creative director for location-based / phygital entertainment",
  "VR training & simulation UX",
];

const catalog = projectsData.map((p) => ({
  id: p.id,
  title: p.title,
  tagline: p.tagline,
  role: p.role,
  platform: p.platform,
  tools: p.tools,
  responsibilities: p.responsibilities,
  problem: p.content.problem,
  solution: p.content.solution,
  systems: p.content.systems,
  outcome: p.content.outcome,
}));

const ProjectMatcher = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (q = query) => {
    if (!q.trim() || loading) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("recommend-projects", {
      body: { query: q, projects: catalog },
    });
    setLoading(false);
    if (error) {
      let msg = "Couldn't get recommendations. Please try again.";
      try {
        const body = await (error as { context?: Response }).context?.json();
        if (body?.error) msg = body.error;
      } catch { /* ignore */ }
      setError(msg);
      return;
    }
    if (data?.error) return setError(data.error);
    setResult(data as Result);
  };

  return (
    <section id="match" className="px-6 md:px-12 py-24 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 text-primary mb-4">
          <Crosshair className="w-5 h-5" />
          <span className="text-sm uppercase tracking-[0.2em] font-semibold">For recruiters</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">What are you hiring for?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Describe the role or skill you're evaluating — AI will pick the most relevant projects and explain why.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); run(); }}
          className="flex flex-col md:flex-row gap-3"
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(); } }}
            maxLength={2000}
            rows={2}
            placeholder="e.g. Systems designer with live-ops economy experience"
            className="flex-1 resize-none rounded-md bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="md:w-48 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold px-6 py-3 disabled:opacity-50 transition-opacity"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Find matches <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mt-4">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => run(ex)}
              disabled={loading}
              className="text-xs rounded-full border border-border px-3 py-1.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {loading && <p className="mt-8 text-muted-foreground animate-pulse">Matching projects to your role…</p>}
        {error && <p className="mt-8 text-destructive">{error}</p>}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-4">
              <p className="text-lg text-foreground">{result.summary}</p>
              {result.recommendations.map((r, i) => {
                const p = projectsData.find((x) => x.id === r.id)!;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      to={`/project/${p.id}`}
                      className="group flex flex-col md:flex-row gap-5 rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors"
                    >
                      <img src={p.media.thumbnail} alt={p.title} className="w-full md:w-48 h-32 object-cover rounded-md" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{p.title}</h3>
                            <p className="text-xs text-muted-foreground">{p.role} · {p.platform}</p>
                          </div>
                          <span className="text-primary font-bold text-lg shrink-0">{r.relevance}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{r.reason}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {r.highlights.map((h) => (
                            <span key={h} className="text-xs rounded bg-secondary px-2 py-1 text-secondary-foreground">{h}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProjectMatcher;
