import { useSyncExternalStore } from "react";

export type FieldKey =
  | "productName"
  | "mrp"
  | "netQuantity"
  | "manufacturer"
  | "packingDate"
  | "consumerCare";

export type ExtractedFields = Record<FieldKey, string | null>;

export type FieldCheck = {
  key: FieldKey;
  label: string;
  value: string | null;
  status: "pass" | "fail" | "warn";
  note: string;
  rule: string;
};

/** Extra observations the label reader reports, used by Rules 8 & 9. */
export type LabelSignals = {
  declarationsOnPrincipalPanel: boolean | null;
  textLegible: boolean | null;
  legibilityNotes: string | null;
};

export type RuleKey = "rule6" | "rule8" | "rule9" | "rule10" | "rule11";

export type RuleResult = {
  key: RuleKey;
  title: string;
  provision: string;
  status: "pass" | "fail" | "warn";
  weight: number;
  earned: number;
  summary: string;
  findings: string[];
  remark: string;
};

export type Inspection = {
  id: string;
  createdAt: string;
  imageDataUrl: string | null;
  rawText: string;
  fields: ExtractedFields;
  checks: FieldCheck[];
  rules?: RuleResult[];
  signals?: LabelSignals;
  recommendation?: string;
  score: number;
  status: "compliant" | "warning" | "violation";
  remarks: string;
  place: string;
};

export const FIELD_META: {
  key: FieldKey;
  label: string;
  severity: "fail" | "warn";
  rule: string;
}[] = [
  {
    key: "productName",
    label: "Product / commodity name",
    severity: "warn",
    rule: "Rule 6(1)(b) — name of the commodity",
  },
  {
    key: "mrp",
    label: "Retail sale price (MRP)",
    severity: "fail",
    rule: "Rule 6(1)(e) — retail sale price legibly declared",
  },
  {
    key: "netQuantity",
    label: "Net quantity",
    severity: "fail",
    rule: "Rule 6(1)(d) — net quantity in standard units",
  },
  {
    key: "manufacturer",
    label: "Manufacturer / packer / importer",
    severity: "fail",
    rule: "Rule 6(1)(a) — name and complete address of manufacturer",
  },
  {
    key: "packingDate",
    label: "Manufacturing / packing date",
    severity: "warn",
    rule: "Rule 6(1)(c) — month and year of manufacture or packing",
  },
  {
    key: "consumerCare",
    label: "Consumer care details",
    severity: "warn",
    rule: "Rule 6(1)(f) — consumer care name, phone and e-mail",
  },
];

const isPresent = (value: string | null | undefined) =>
  typeof value === "string" && value.trim().length > 0 && !/^(n\/?a|none|not found)$/i.test(value.trim());

export function evaluateFields(fields: ExtractedFields) {
  const checks: FieldCheck[] = FIELD_META.map((meta) => {
    const value = fields[meta.key];
    if (isPresent(value)) {
      return {
        key: meta.key,
        label: meta.label,
        value: (value as string).trim(),
        status: "pass" as const,
        note: "Declaration found on the package",
        rule: meta.rule,
      };
    }
    return {
      key: meta.key,
      label: meta.label,
      value: null,
      status: meta.severity,
      note:
        meta.severity === "fail"
          ? "Mandatory declaration missing or not legible"
          : "Declaration incomplete — requires verification",
      rule: meta.rule,
    };
  });

  const violations = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const score = Math.max(0, 100 - violations * 22 - warnings * 9);
  const status: Inspection["status"] =
    violations > 0 ? "violation" : warnings > 0 ? "warning" : "compliant";

  const remarks =
    violations > 0
      ? `Package found non-compliant. ${violations} mandatory declaration${
          violations > 1 ? "s" : ""
        } missing or illegible. Draft notice recommended under the Legal Metrology (Packaged Commodities) Rules, 2011.`
      : warnings > 0
        ? `Package broadly compliant with ${warnings} declaration${
            warnings > 1 ? "s" : ""
          } needing verification at the premises before closing the inspection.`
        : "All mandatory declarations verified. Package is compliant with the Packaged Commodities Rules, 2011.";

  return { checks, score, status, violations, warnings, remarks };
}

export const STATUS_LABEL: Record<Inspection["status"], string> = {
  compliant: "Compliant",
  warning: "Needs Review",
  violation: "Non-Compliant",
};

/* ---------------- saved inspections store ---------------- */

const KEY = "packmetrix.inspections.v1";
const listeners = new Set<() => void>();
let cache: Inspection[] = [];
let cacheRaw: string | null = null;

function read(): Inspection[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? (JSON.parse(raw) as Inspection[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export function saveInspection(inspection: Inspection) {
  if (typeof window === "undefined") return;
  const next = [inspection, ...read().filter((i) => i.id !== inspection.id)];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function useInspections(): Inspection[] {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      const onStorage = () => emit();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    read,
    () => [],
  );
}

export function computeStats(items: Inspection[]) {
  const total = items.length;
  const violations = items.filter((i) => i.status === "violation").length;
  const compliant = items.filter((i) => i.status === "compliant").length;
  const pending = items.filter((i) => i.status !== "compliant").length;
  const rate = total === 0 ? 0 : Math.round((compliant / total) * 100);
  return { total, violations, compliant, pending, rate };
}

/* ---------------- current draft (scan -> result) ---------------- */

const DRAFT_KEY = "packmetrix.draft.v1";

export function setDraft(inspection: Inspection) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(inspection));
}

export function getDraft(): Inspection | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Inspection;
  } catch {
    return null;
  }
}

export function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
