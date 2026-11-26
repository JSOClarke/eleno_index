import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkflowSteps } from "@/components/landing/WorkflowSteps";

interface LandingPageProps {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

const QUICK_LINKS = [
  { to: "/catalogue", title: "Catalogue", desc: "Browse books ranked by Reading Flow & proficiency level, inspect chapter pacing, and export i+1 Anki decks." },
  { to: "/dictionary", title: "Dictionary & Sentence Bank", desc: "Search lemmas or conjugated forms across millions of real corpus sentences." },
  { to: "/known-words", title: "Known Words", desc: "Track your vocabulary and apply frequency starter packs." },
];

export const LandingPage: React.FC<LandingPageProps> = ({ isAuthenticated, onRequireAuth }) => {
  return (
    <div className="space-y-8 py-2">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xs space-y-5">
        <div className="max-w-3xl space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-[1.08]">
            Know what you can actually read before you start.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Threshold measures real text coverage from your vocabulary, pulls i+1 sentences with only one unknown word, and exports ready-to-study Anki decks — synced with the web extension.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {!isAuthenticated && (
            <button
              type="button"
              onClick={onRequireAuth}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </section>

      <WorkflowSteps onRequireAuth={onRequireAuth} />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-slate-300 transition space-y-1"
          >
            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>{item.title}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-900 transition" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
};
