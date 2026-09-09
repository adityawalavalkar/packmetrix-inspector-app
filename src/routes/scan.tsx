import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, ImageUp, Sparkles, Info } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan Product — PackMetrix AI" },
      {
        name: "description",
        content: "Capture or upload a package label and analyse its mandatory declarations.",
      },
      { property: "og:title", content: "Scan Product — PackMetrix AI" },
      {
        property: "og:description",
        content: "Capture or upload a package label and analyse its mandatory declarations.",
      },
    ],
  }),
  component: ScanScreen,
});

function ScanScreen() {
  const navigate = useNavigate();

  return (
    <MobileShell>
      <AppBar title="Scan Product" subtitle="Packaged Commodity Label" backTo="/dashboard" />

      <div className="fade-up space-y-5 px-4 pt-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-foreground/90">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-primary-foreground/70">
            <Camera className="h-10 w-10" />
            <p className="text-xs">Camera preview appears here</p>
          </div>

          <div className="pointer-events-none absolute inset-6">
            <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-primary-foreground" />
            <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-primary-foreground" />
            <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-primary-foreground" />
            <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-primary-foreground" />
            <span className="scan-line absolute left-2 right-2 top-2 h-0.5 rounded-full bg-primary-foreground/80" />
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground/60 px-3 py-1 text-[11px] text-primary-foreground">
            Align the declaration panel inside the guides
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" className="h-12 rounded-2xl border-primary/30 text-primary">
            <Camera className="mr-2 h-4 w-4" /> Open Camera
          </Button>
          <Button variant="outline" size="lg" className="h-12 rounded-2xl border-primary/30 text-primary">
            <ImageUp className="mr-2 h-4 w-4" /> Upload Image
          </Button>
        </div>

        <Button
          size="lg"
          className="h-14 w-full rounded-2xl text-base font-semibold shadow-elevated"
          onClick={() => navigate({ to: "/result" })}
        >
          <Sparkles className="mr-2 h-5 w-5" /> Analyze Package
        </Button>

        <div className="card-surface flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Capture tips</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>Include manufacturer name, net quantity, MRP and MFG date.</li>
              <li>Avoid glare and keep the label flat.</li>
              <li>Hold steady until the guides turn solid.</li>
            </ul>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
