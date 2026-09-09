import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  BookMarked,
  ScanLine,
  Save,
  ClipboardCheck,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import {
  STATUS_LABEL,
  formatWhen,
  getDraft,
  saveInspection,
  type Inspection,
} from "@/lib/inspections";
import { openInspectionPdf } from "@/lib/inspection-pdf";

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

const statusMeta = {
  pass: { icon: CheckCircle2, cls: "text-success", label: "Compliant" },
  fail: { icon: XCircle, cls: "text-destructive", label: "Violation" },
  warn: { icon: AlertTriangle, cls: "text-warning", label: "Review" },
} as const;

const outcomeMeta = {
  compliant: {
    icon: CheckCircle2,
    text: "text-success",
    bg: "bg-success-soft",
    ring: "bg-success/12",
  },
  warning: { icon: AlertTriangle, text: "text-warning", bg: "bg-warning-soft", ring: "bg-warning/12" },
  violation: { icon: XCircle, text: "text-destructive", bg: "bg-destructive-soft", ring: "bg-destructive/12" },
} as const;

function ResultScreen() {
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInspection(getDraft());
    setLoaded(true);
  }, []);

  if (loaded && !inspection) {
    return (
      <MobileShell>
        <AppBar title="Compliance Result" subtitle="No active inspection" backTo="/dashboard" />
        <div className="fade-up px-4 pt-4">
          <section className="card-surface flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <ScanLine className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-base font-semibold">No result to show</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Scan or upload a package label to generate a compliance result.
            </p>
            <Button asChild size="lg" className="mt-6 h-12 rounded-2xl px-6 font-semibold shadow-elevated">
              <Link to="/scan">Start Inspection</Link>
            </Button>
          </section>
        </div>
      </MobileShell>
    );
  }

  if (!inspection) {
    return (
      <MobileShell>
        <AppBar title="Compliance Result" backTo="/scan" />
      </MobileShell>
    );
  }

  const outcome = outcomeMeta[inspection.status];
  const OutcomeIcon = outcome.icon;
  const passCount = inspection.checks.filter((c) => c.status === "pass").length;
  const failCount = inspection.checks.filter((c) => c.status === "fail").length;
  const warnCount = inspection.checks.filter((c) => c.status === "warn").length;

  return (
    <MobileShell>
      <AppBar
        title="Compliance Result"
        subtitle={`Inspection #${inspection.id}`}
        backTo="/scan"
      />

      <div className="fade-up space-y-5 px-4 pt-4">
        <section className="card-surface overflow-hidden">
          <div className={`${outcome.bg} px-4 py-5 text-center`}>
            <span
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${outcome.ring} ${outcome.text}`}
            >
              <OutcomeIcon className="h-7 w-7" />
            </span>
            <p className={`mt-2 text-lg font-semibold ${outcome.text}`}>
              {STATUS_LABEL[inspection.status]}
            </p>
            <p className="text-xs text-muted-foreground">
              {failCount} violation{failCount === 1 ? "" : "s"} · {warnCount} item
              {warnCount === 1 ? "" : "s"} need review
            </p>
            <p className={`mt-3 text-3xl font-semibold ${outcome.text}`}>{inspection.score}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Compliance score</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border text-center">
            <div className="px-2 py-3">
              <p className="text-lg font-semibold text-success">{passCount}</p>
              <p className="text-[11px] text-muted-foreground">Compliant</p>
            </div>
            <div className="px-2 py-3">
              <p className="text-lg font-semibold text-destructive">{failCount}</p>
              <p className="text-[11px] text-muted-foreground">Violation</p>
            </div>
            <div className="px-2 py-3">
              <p className="text-lg font-semibold text-warning">{warnCount}</p>
              <p className="text-[11px] text-muted-foreground">Review</p>
            </div>
          </div>
        </section>

        <section className="card-surface p-4">
          <p className="text-sm font-semibold">
            {inspection.fields.productName ?? "Product name not declared"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {inspection.place} · {formatWhen(inspection.createdAt)}
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Mandatory Declarations</h2>
          <ul className="card-surface divide-y divide-border">
            {inspection.checks.map((item) => {
              const meta = statusMeta[item.status];
              const Icon = meta.icon;
              return (
                <li key={item.key} className="flex items-start gap-3 px-4 py-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.cls}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.value ?? item.note}</p>
                    {item.status !== "pass" ? (
                      <p className={`mt-0.5 text-[11px] ${meta.cls}`}>{item.rule}</p>
                    ) : null}
                  </div>
                  <span className={`shrink-0 text-[11px] font-medium ${meta.cls}`}>{meta.label}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card-surface flex items-start gap-3 p-4">
          <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">Inspector remarks</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{inspection.remarks}</p>
          </div>
        </section>

        <section className="card-surface p-4">
          <p className="text-sm font-medium">Extracted label text</p>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
            {inspection.rawText || "No text could be extracted from the label."}
          </pre>
        </section>

        <section className="card-surface flex items-start gap-3 p-4">
          <BookMarked className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Assessed under the Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6 requires
            every pre-packaged commodity to legibly declare the manufacturer, net quantity, retail
            sale price, date of packing and consumer care details.
          </p>
        </section>

        <div className="space-y-3 pb-2">
          <Button
            size="lg"
            className="h-13 w-full rounded-2xl py-4 font-semibold shadow-elevated"
            onClick={() => openInspectionPdf(inspection)}
          >
            <FileText className="mr-2 h-4 w-4" /> Generate PDF
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-2xl border-primary/30 text-primary"
              onClick={() => {
                saveInspection(inspection);
                setSaved(true);
              }}
            >
              <Save className="mr-2 h-4 w-4" /> {saved ? "Saved" : "Save Inspection"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-12 rounded-2xl"
              onClick={() => {
                saveInspection(inspection);
                setSaved(true);
                navigate({ to: "/history" });
              }}
            >
              Save &amp; View History
            </Button>
          </div>
          {saved ? (
            <p className="text-center text-[11px] text-success">
              Inspection saved to history and dashboard statistics.
            </p>
          ) : null}
        </div>
      </div>
    </MobileShell>
  );
}
