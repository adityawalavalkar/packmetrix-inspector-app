import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, ImageUp, Sparkles, Info, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { fileToCompressedDataUrl } from "@/lib/image";
import { extractLabelFields } from "@/lib/ocr.functions";
import { evaluateFields, setDraft, type ExtractedFields, type Inspection } from "@/lib/inspections";

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
  const analyze = useServerFn(extractLabelFields);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    try {
      setImage(await fileToCompressedDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that image.");
    }
  }

  async function onAnalyze() {
    if (!image || busy) return;
    setBusy(true);
    setError(null);
    try {
      const [result] = await Promise.all([
        analyze({ data: { imageDataUrl: image } }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      const fields: ExtractedFields = {
        productName: result.productName,
        mrp: result.mrp,
        netQuantity: result.netQuantity,
        manufacturer: result.manufacturer,
        packingDate: result.packingDate,
        consumerCare: result.consumerCare,
      };
      const evaluation = evaluateFields(fields);
      const now = new Date();
      const inspection: Inspection = {
        id: `DEL-${now.getFullYear()}-${String(now.getTime()).slice(-5)}`,
        createdAt: now.toISOString(),
        imageDataUrl: image,
        rawText: result.rawText ?? "",
        fields,
        checks: evaluation.checks,
        score: evaluation.score,
        status: evaluation.status,
        remarks: evaluation.remarks,
        place: "Field inspection · Delhi Central",
      };
      setDraft(inspection);
      navigate({ to: "/result" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileShell>
      <AppBar title="Scan Product" subtitle="Packaged Commodity Label" backTo="/dashboard" />

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={onPick} />

      <div className="fade-up space-y-5 px-4 pt-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-foreground/90">
          {image ? (
            <img src={image} alt="Captured package label" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-primary-foreground/70">
              <Camera className="h-10 w-10" />
              <p className="text-xs">Camera preview appears here</p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-6">
            <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-primary-foreground" />
            <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-primary-foreground" />
            <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-primary-foreground" />
            <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-primary-foreground" />
            <span className="scan-line absolute left-2 right-2 top-2 h-0.5 rounded-full bg-primary-foreground/80" />
          </div>

          {image ? (
            <button
              onClick={() => setImage(null)}
              className="absolute right-3 top-3 flex h-9 items-center gap-1.5 rounded-full bg-foreground/60 px-3 text-[11px] font-medium text-primary-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retake
            </button>
          ) : null}

          {busy ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/75 text-primary-foreground">
              <Loader2 className="h-9 w-9 animate-spin" />
              <p className="text-sm font-medium">Analyzing declarations…</p>
              <p className="text-[11px] text-primary-foreground/75">
                Reading label text and checking Rules, 2011
              </p>
            </div>
          ) : (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground/60 px-3 py-1 text-[11px] text-primary-foreground">
              Align the declaration panel inside the guides
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-2xl border-primary/30 text-primary"
            onClick={() => cameraRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" /> Open Camera
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-2xl border-primary/30 text-primary"
            onClick={() => galleryRef.current?.click()}
          >
            <ImageUp className="mr-2 h-4 w-4" /> Upload Image
          </Button>
        </div>

        {error ? (
          <div className="card-surface flex items-start gap-3 border border-destructive/30 p-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-xs leading-relaxed text-destructive">{error}</p>
          </div>
        ) : null}

        <Button
          size="lg"
          disabled={!image || busy}
          className="h-14 w-full rounded-2xl text-base font-semibold shadow-elevated"
          onClick={onAnalyze}
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" /> Analyze Package
            </>
          )}
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
