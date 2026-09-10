import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ScanLine,
  ShieldCheck,
  TriangleAlert,
  FileClock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { computeStats, formatWhen, useInspections } from "@/lib/inspections";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Inspector Dashboard — PackMetrix AI" },
      {
        name: "description",
        content: "Daily inspection summary: total scans, compliance rate, violations and pending notices.",
      },
      { property: "og:title", content: "Inspector Dashboard — PackMetrix AI" },
      {
        property: "og:description",
        content: "Daily inspection summary: total scans, compliance rate, violations and pending notices.",
      },
    ],
  }),
  component: DashboardScreen,
});

const stats = [
  { label: "Total Scans", value: "128", icon: ScanLine, tone: "primary" },
  { label: "Compliance Rate", value: "82%", icon: ShieldCheck, tone: "success" },
  { label: "Violations", value: "23", icon: TriangleAlert, tone: "destructive" },
  { label: "Pending Notices", value: "6", icon: FileClock, tone: "warning" },
] as const;

const toneClasses: Record<string, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  destructive: "bg-destructive-soft text-destructive",
  warning: "bg-warning-soft text-warning",
};

const recent = [
  { product: "Aashirvaad Atta 5 kg", place: "Sadar Bazar, Delhi", time: "Today, 11:42", ok: true },
  { product: "Parachute Oil 500 ml", place: "Karol Bagh, Delhi", time: "Today, 10:15", ok: false },
  { product: "Tata Salt 1 kg", place: "Azadpur Mandi", time: "Yesterday, 17:05", ok: true },
  { product: "Surf Excel 1 kg", place: "Lajpat Nagar", time: "Yesterday, 12:30", ok: false },
];

function DashboardScreen() {
  return (
    <MobileShell>
      <AppBar
        title="Inspector Dashboard"
        subtitle="Ministry of Consumer Affairs"
        action={
          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-saffron" />
          </button>
        }
      />

      <div className="fade-up space-y-5 px-4 pt-4">
        <section className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-base font-semibold text-primary">
              RS
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">Insp. Rohan Sharma</p>
              <p className="truncate text-xs text-muted-foreground">
                Legal Metrology Officer · LM-DEL-2291
              </p>
            </div>
            <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-medium text-success">
              On Duty
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
            <div>
              <p className="text-muted-foreground">Circle</p>
              <p className="font-medium">Delhi Central</p>
            </div>
            <div>
              <p className="text-muted-foreground">Today&apos;s Target</p>
              <p className="font-medium">8 of 12 done</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Inspection Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="card-surface p-4">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-2xl font-semibold leading-none">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <Link
          to="/scan"
          className="gov-gradient flex items-center justify-between rounded-2xl px-4 py-4 text-primary-foreground shadow-elevated"
        >
          <span className="flex items-center gap-3">
            <ScanLine className="h-6 w-6" />
            <span>
              <span className="block text-sm font-semibold">Start New Inspection</span>
              <span className="block text-[11px] text-primary-foreground/80">
                Scan a packaged commodity label
              </span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </Link>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Inspections</h2>
            <Link to="/history" className="text-xs font-medium text-primary">
              View all
            </Link>
          </div>
          <ul className="card-surface divide-y divide-border overflow-hidden">
            {recent.map((item) => (
              <li key={item.product}>
                <Link to="/result" className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      item.ok ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"
                    }`}
                  >
                    {item.ok ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.product}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.place} · {item.time}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </MobileShell>
  );
}
