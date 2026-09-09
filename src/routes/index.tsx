import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import logo from "@/assets/packmetrix-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PackMetrix AI — Legal Metrology Inspection App" },
      {
        name: "description",
        content:
          "PackMetrix AI helps Legal Metrology inspectors verify packaged commodity declarations on the field.",
      },
      { property: "og:title", content: "PackMetrix AI — Legal Metrology Inspection App" },
      {
        property: "og:description",
        content: "Field inspection companion for Legal Metrology officers, Ministry of Consumer Affairs.",
      },
    ],
  }),
  component: SplashScreen,
});

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate({ to: "/login" }), 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen justify-center bg-secondary">
      <div className="gov-gradient relative flex min-h-screen w-full max-w-[390px] flex-col items-center justify-between px-6 py-16 text-primary-foreground">
        <div className="fade-up flex flex-col items-center gap-2 pt-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary-foreground/80">
            Government of India
          </p>
          <p className="text-xs font-medium text-primary-foreground/90">
            Ministry of Consumer Affairs, Food &amp; Public Distribution
          </p>
        </div>

        <div className="fade-up flex flex-col items-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-primary-foreground/12 ring-1 ring-primary-foreground/25">
            <img src={logo} alt="PackMetrix AI emblem" width={512} height={512} className="h-20 w-20" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight">PackMetrix AI</h1>
            <p className="mt-2 text-sm text-primary-foreground/85">
              Legal Metrology Compliance Inspection
            </p>
          </div>
          <div className="h-1 w-28 overflow-hidden rounded-full bg-primary-foreground/25">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary-foreground" />
          </div>
        </div>

        <p className="text-[11px] text-primary-foreground/70">
          Legal Metrology (Packaged Commodities) Rules, 2011
        </p>
      </div>
    </div>
  );
}
