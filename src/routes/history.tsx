import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  History as HistoryIcon,
  Search,
  SlidersHorizontal,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABEL, formatWhen, setDraft, useInspections } from "@/lib/inspections";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Inspection History — PackMetrix AI" },
      {
        name: "description",
        content: "Review past field inspections, compliance outcomes and issued notices.",
      },
      { property: "og:title", content: "Inspection History — PackMetrix AI" },
      {
        property: "og:description",
        content: "Review past field inspections, compliance outcomes and issued notices.",
      },
    ],
  }),
  component: HistoryScreen,
});

const filters = ["All", "Compliant", "Violations", "Notices"] as const;

const rowMeta = {
  compliant: { icon: CheckCircle2, cls: "bg-success-soft text-success" },
  warning: { icon: AlertTriangle, cls: "bg-warning-soft text-warning" },
  violation: { icon: XCircle, cls: "bg-destructive-soft text-destructive" },
} as const;

function HistoryScreen() {
  const navigate = useNavigate();
  const inspections = useInspections();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const visible = inspections.filter((item) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Compliant" && item.status === "compliant") ||
      (filter === "Violations" && item.status === "violation") ||
      (filter === "Notices" && item.status !== "compliant");
    const haystack = `${item.fields.productName ?? ""} ${item.fields.manufacturer ?? ""} ${item.place}`;
    return matchesFilter && haystack.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <MobileShell>
      <AppBar title="Inspection History" subtitle="Delhi Central Circle" />

      <div className="fade-up space-y-4 px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search product or premises"
              className="h-11 rounded-2xl pl-10"
              aria-label="Search inspections"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button
            aria-label="Filter inspections"
            onClick={() => setFilter("All")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${
                item === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <section className="card-surface flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <HistoryIcon className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-base font-semibold">
              {inspections.length === 0 ? "No inspections recorded yet" : "No matching inspections"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Completed inspections will appear here with their compliance outcome, location and
              any draft notice generated.
            </p>
            <Button asChild size="lg" className="mt-6 h-12 rounded-2xl px-6 font-semibold shadow-elevated">
              <Link to="/scan">
                <ScanLine className="mr-2 h-4 w-4" /> Start First Inspection
              </Link>
            </Button>
          </section>
        ) : (
          <ul className="card-surface divide-y divide-border overflow-hidden">
            {visible.map((item) => {
              const meta = rowMeta[item.status];
              const Icon = meta.icon;
              return (
                <li key={item.id}>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    onClick={() => {
                      setDraft(item);
                      navigate({ to: "/result" });
                    }}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.cls}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.fields.productName ?? "Unnamed commodity"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {STATUS_LABEL[item.status]} · {item.score}/100 · {formatWhen(item.createdAt)}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="pb-2 text-center text-[11px] text-muted-foreground">
          Records are retained as per departmental record-keeping norms.
        </p>
      </div>
    </MobileShell>
  );
}
