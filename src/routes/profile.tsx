import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CloudOff, FileSignature, BookOpen, LogOut, ChevronRight, BadgeCheck } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Officer Profile — PackMetrix AI" },
      {
        name: "description",
        content: "Officer details, offline inspection mode, auto draft notices and rulebook reference.",
      },
      { property: "og:title", content: "Officer Profile — PackMetrix AI" },
      {
        property: "og:description",
        content: "Officer details, offline inspection mode, auto draft notices and rulebook reference.",
      },
    ],
  }),
  component: ProfileScreen,
});

const details = [
  { label: "Officer ID", value: "LM-DEL-2291" },
  { label: "Designation", value: "Legal Metrology Officer" },
  { label: "Circle", value: "Delhi Central" },
  { label: "Jurisdiction", value: "Sadar Bazar & Karol Bagh" },
  { label: "Official e-mail", value: "rohan.sharma@lm.gov.in" },
];

function ProfileScreen() {
  const navigate = useNavigate();
  const [offline, setOffline] = useState(true);
  const [autoDraft, setAutoDraft] = useState(false);

  return (
    <MobileShell>
      <AppBar title="Officer Profile" subtitle="Ministry of Consumer Affairs" />

      <div className="fade-up space-y-5 px-4 pt-4">
        <section className="card-surface flex flex-col items-center px-4 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-xl font-semibold text-primary">
            RS
          </div>
          <p className="mt-3 text-lg font-semibold">Insp. Rohan Sharma</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" /> Verified officer credentials
          </p>
        </section>

        <section className="card-surface divide-y divide-border">
          {details.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="max-w-[60%] truncate text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </section>

        <section className="card-surface divide-y divide-border">
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <CloudOff className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Offline inspection</p>
              <p className="text-xs text-muted-foreground">Store scans locally and sync later</p>
            </div>
            <Switch
              checked={offline}
              onCheckedChange={setOffline}
              aria-label="Toggle offline inspection"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <FileSignature className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Auto draft notice</p>
              <p className="text-xs text-muted-foreground">
                Prepare a notice whenever a violation is found
              </p>
            </div>
            <Switch
              checked={autoDraft}
              onCheckedChange={setAutoDraft}
              aria-label="Toggle auto draft notice"
            />
          </div>
          <button className="flex w-full items-center gap-3 px-4 py-4 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Rulebook reference</p>
              <p className="text-xs text-muted-foreground">
                Packaged Commodities Rules, 2011 · Legal Metrology Act, 2009
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        <Button
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-2xl border-destructive/30 text-destructive"
          onClick={() => navigate({ to: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>

        <p className="pb-2 text-center text-[11px] text-muted-foreground">
          PackMetrix AI v1.0 · Ministry of Consumer Affairs, Food &amp; Public Distribution
        </p>
      </div>
    </MobileShell>
  );
}
