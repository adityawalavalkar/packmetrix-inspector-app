import { createFileRoute, Link } from "@tanstack/react-router";
import { History as HistoryIcon, Search, SlidersHorizontal, ScanLine } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const filters = ["All", "Compliant", "Violations", "Notices"];

function HistoryScreen() {
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
            />
          </div>
          <button
            aria-label="Filter inspections"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter, index) => (
            <button
              key={filter}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${
                index === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <section className="card-surface flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
            <HistoryIcon className="h-8 w-8" />
          </span>
          <h2 className="mt-4 text-base font-semibold">No inspections recorded yet</h2>
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

        <p className="pb-2 text-center text-[11px] text-muted-foreground">
          Records are retained as per departmental record-keeping norms.
        </p>
      </div>
    </MobileShell>
  );
}
