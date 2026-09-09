import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, AlertTriangle, FileText, Share2, BookMarked } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Compliance Result — PackMetrix AI" },
      {
        name: "description",
        content:
          "Declaration-wise compliance result for the inspected package under the Packaged Commodities Rules, 2011.",
      },
      { property: "og:title", content: "Compliance Result — PackMetrix AI" },
      {
        property: "og:description",
        content: "Declaration-wise compliance result for the inspected package.",
      },
    ],
  }),
  component: ResultScreen,
});

const declarations = [
  { field: "Manufacturer / Packer name", value: "ITC Limited, Food Division", status: "pass" },
  { field: "Complete address", value: "Virginia House, 37 J.L. Nehru Road, Kolkata", status: "pass" },
  { field: "Net quantity", value: "5 kg", status: "pass" },
  { field: "Retail sale price (MRP)", value: "Not clearly legible", status: "fail" },
  { field: "Month & year of packing", value: "08/2026", status: "pass" },
  { field: "Consumer care details", value: "Phone present, e-mail missing", status: "warn" },
  { field: "Country of origin", value: "India", status: "pass" },
] as const;

const statusMeta = {
  pass: { icon: CheckCircle2, cls: "text-success", label: "Compliant" },
  fail: { icon: XCircle, cls: "text-destructive", label: "Violation" },
  warn: { icon: AlertTriangle, cls: "text-warning", label: "Review" },
} as const;

function ResultScreen() {
  return (
    <MobileShell>
      <AppBar title="Compliance Result" subtitle="Inspection #DEL-2026-0128" backTo="/scan" />

      <div className="fade-up space-y-5 px-4 pt-4">
        <section className="card-surface overflow-hidden">
          <div className="bg-destructive-soft px-4 py-5 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/12 text-destructive">
              <XCircle className="h-7 w-7" />
            </span>
            <p className="mt-2 text-lg font-semibold text-destructive">Non-Compliant</p>
            <p className="text-xs text-muted-foreground">1 violation · 1 item needs review</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border text-center">
            <div className="px-2 py-3">
              <p className="text-lg font-semibold text-success">5</p>
              <p className="text-[11px] text-muted-foreground">Compliant</p>
            </div>
            <div className="px-2 py-3">
              <p className="text-lg font-semibold text-destructive">1</p>
              <p className="text-[11px] text-muted-foreground">Violation</p>
            </div>
            <div className="px-2 py-3">
              <p className="text-lg font-semibold text-warning">1</p>
              <p className="text-[11px] text-muted-foreground">Review</p>
            </div>
          </div>
        </section>

        <section className="card-surface p-4">
          <p className="text-sm font-semibold">Aashirvaad Whole Wheat Atta</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sadar Bazar, Delhi · Inspected today, 11:42
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Mandatory Declarations</h2>
          <ul className="card-surface divide-y divide-border">
            {declarations.map((item) => {
              const meta = statusMeta[item.status];
              const Icon = meta.icon;
              return (
                <li key={item.field} className="flex items-start gap-3 px-4 py-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.cls}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.field}</p>
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-medium ${meta.cls}`}>{meta.label}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card-surface flex items-start gap-3 p-4">
          <BookMarked className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Relevant provision: Rule 6(1)(e), Legal Metrology (Packaged Commodities) Rules, 2011 —
            retail sale price must be legibly declared on the principal display panel.
          </p>
        </section>

        <div className="space-y-3 pb-2">
          <Button size="lg" className="h-13 w-full rounded-2xl py-4 font-semibold shadow-elevated">
            <FileText className="mr-2 h-4 w-4" /> Generate Draft Notice
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" className="h-12 rounded-2xl border-primary/30 text-primary">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-12 rounded-2xl">
              <Link to="/history">Save to History</Link>
            </Button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
