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

  const rules = runRuleEngine(fields, checks, signals);

  const violations = rules.filter((r) => r.status === "fail").length;
  const warnings = rules.filter((r) => r.status === "warn").length;
  const score = Math.max(
    0,
    Math.min(100, Math.round(rules.reduce((sum, r) => sum + r.earned, 0))),
  );
  const status: Inspection["status"] =
    violations > 0 ? "violation" : warnings > 0 ? "warning" : "compliant";

  const failedTitles = rules.filter((r) => r.status === "fail").map((r) => r.title);
  const warnTitles = rules.filter((r) => r.status === "warn").map((r) => r.title);

  const remarks =
    violations > 0
      ? `Package found non-compliant. Contravention observed under ${failedTitles.join(
          ", ",
        )}. Compliance score ${score}/100 under the Legal Metrology (Packaged Commodities) Rules, 2011.`
      : warnings > 0
        ? `Package broadly compliant. ${warnTitles.join(
            ", ",
          )} require verification at the premises before closing the inspection. Compliance score ${score}/100.`
        : `All rule checks passed. Package complies with Rules 6, 8, 9, 10 and 11 of the Packaged Commodities Rules, 2011. Compliance score ${score}/100.`;

  const recommendation =
    violations > 0
      ? "Recommended action: issue a show-cause notice under Section 36 of the Legal Metrology Act, 2009 read with Rule 32 of the Packaged Commodities Rules, 2011. Seize a sample package as evidence, record the manufacturer/packer details and log the batch for follow-up."
      : warnings > 0
        ? "Recommended action: advise the packer to rectify the flagged declarations. Re-verify the corrected label on the next visit; no notice required if rectified within 30 days."
        : "Recommended action: no further action required. Close the inspection and file the report for record.";

  return { checks, rules, score, status, violations, warnings, remarks, recommendation };
}

/* ---------------- Legal Metrology rule engine ---------------- */

const STANDARD_UNIT = /(\d+(?:[.,]\d+)?)\s*(mg|g|gm|gms|gram|grams|kg|kgs|ml|l|ltr|litre|liter|cm|m|mm|n|u|pcs|pieces)\b/i;
const NON_STANDARD_UNIT = /\b(oz|ounce|lb|lbs|pound|gallon|pint|quart|inch|inches|ft|feet|tola|seer)\b/i;

function scoreOf(status: RuleResult["status"], weight: number) {
  return status === "pass" ? weight : status === "warn" ? weight * 0.5 : 0;
}

function runRuleEngine(
  fields: ExtractedFields,
  checks: FieldCheck[],
  signals?: LabelSignals,
): RuleResult[] {
  const results: RuleResult[] = [];

  /* ---- Rule 6 — mandatory declarations ---- */
  const missingMandatory = checks.filter((c) => c.status === "fail");
  const missingOther = checks.filter((c) => c.status === "warn");
  const rule6Status: RuleResult["status"] =
    missingMandatory.length > 0 ? "fail" : missingOther.length > 0 ? "warn" : "pass";
  results.push({
    key: "rule6",
    title: "Rule 6 — Mandatory declarations",
    provision: "Rule 6(1) — declarations to be made on every pre-packaged commodity",
    status: rule6Status,
    weight: 40,
    earned: scoreOf(rule6Status, 40),
    summary:
      rule6Status === "pass"
        ? "All six mandatory declarations are present on the label."
        : `${missingMandatory.length + missingOther.length} of 6 declarations missing or illegible.`,
    findings: [...missingMandatory, ...missingOther].map(
      (c) => `${c.label} not declared — ${c.rule}`,
    ),
    remark:
      rule6Status === "fail"
        ? "Absence of a mandatory declaration is a contravention of Rule 6(1) punishable under Rule 32 read with Section 36 of the Legal Metrology Act, 2009."
        : rule6Status === "warn"
          ? "Incomplete declarations attract compliance advice under Rule 6(1); verify the printed panel physically."
          : "Declarations conform to Rule 6(1).",
  });

  /* ---- Rule 8 — principal display panel ---- */
  const pdpCritical = ["mrp", "netQuantity", "productName"] as const;
  const pdpMissing = pdpCritical.filter((k) => !isPresent(fields[k]));
  const panelSignal = signals?.declarationsOnPrincipalPanel;
  const rule8Status: RuleResult["status"] =
    pdpMissing.length > 0 || panelSignal === false ? "fail" : panelSignal === true ? "pass" : "warn";
  results.push({
    key: "rule8",
    title: "Rule 8 — Principal display panel",
    provision: "Rule 8 — declarations to appear on the principal display panel",
    status: rule8Status,
    weight: 15,
    earned: scoreOf(rule8Status, 15),
    summary:
      rule8Status === "pass"
        ? "Name, net quantity and retail sale price are visible on the principal display panel."
        : rule8Status === "fail"
          ? "Key declarations are not visible on the principal display panel."
          : "Principal display panel layout could not be confirmed from the captured image.",
    findings: [
      ...pdpMissing.map(
        (k) =>
          `${FIELD_META.find((m) => m.key === k)?.label ?? k} not visible on the principal display panel`,
      ),
      ...(panelSignal === false
        ? ["Declarations appear grouped away from the principal display panel"]
        : []),
      ...(panelSignal == null ? ["Capture the full front panel to confirm Rule 8 placement"] : []),
    ],
    remark:
      rule8Status === "fail"
        ? "Rule 8 requires the name, net quantity and retail sale price to be grouped together on the principal display panel; placement elsewhere is a contravention."
        : rule8Status === "warn"
          ? "Verify at the premises that the declarations are grouped on the principal display panel as required by Rule 8."
          : "Placement conforms to Rule 8.",
  });

  /* ---- Rule 9 — readability / font visibility ---- */
  const legible = signals?.textLegible;
  const rawShort = (fields.mrp ?? "").length === 0 && (fields.netQuantity ?? "").length === 0;
  const rule9Status: RuleResult["status"] =
    legible === false || rawShort ? "fail" : legible === true ? "pass" : "warn";
  results.push({
    key: "rule9",
    title: "Rule 9 — Readability & font visibility",
    provision: "Rule 9 — declarations to be legible, prominent and in a contrasting colour",
    status: rule9Status,
    weight: 15,
    earned: scoreOf(rule9Status, 15),
    summary:
      rule9Status === "pass"
        ? "Declarations are legible, prominent and in a contrasting colour."
        : rule9Status === "fail"
          ? "Declarations are not legible at the prescribed size or contrast."
          : "Legibility could not be conclusively assessed from the captured image.",
    findings: [
      ...(signals?.legibilityNotes ? [signals.legibilityNotes] : []),
      ...(rawShort ? ["Price and quantity text could not be read from the label"] : []),
    ],
    remark:
      rule9Status === "fail"
        ? "Rule 9 requires declarations in a distinct, conspicuous and contrasting print of the prescribed minimum height; illegible print is a contravention."
        : rule9Status === "warn"
          ? "Measure the printed font height physically against the Rule 9 minimum height table before recording a finding."
          : "Print size and contrast conform to Rule 9.",
  });

  /* ---- Rule 10 — manufacturer / packer address completeness ---- */
  const addr = (fields.manufacturer ?? "").trim();
  const hasPin = /\b\d{6}\b/.test(addr);
  const hasLocality = addr.split(/[,\n]/).filter((p) => p.trim().length > 1).length >= 3;
  const rule10Status: RuleResult["status"] = !isPresent(addr)
    ? "fail"
    : hasPin && hasLocality
      ? "pass"
      : "warn";
  results.push({
    key: "rule10",
    title: "Rule 10 — Manufacturer / packer address",
    provision: "Rule 10 — name and complete address of manufacturer, packer or importer",
    status: rule10Status,
    weight: 15,
    earned: scoreOf(rule10Status, 15),
    summary:
      rule10Status === "pass"
        ? "Complete address with locality and PIN code declared."
        : rule10Status === "fail"
          ? "Manufacturer / packer name and address not declared."
          : "Address declared but appears incomplete.",
    findings: [
      ...(isPresent(addr) ? [] : ["No manufacturer, packer or importer address on the label"]),
      ...(isPresent(addr) && !hasPin ? ["PIN code missing from the declared address"] : []),
      ...(isPresent(addr) && !hasLocality
        ? ["Street / locality / district details appear incomplete"]
        : []),
    ],
    remark:
      rule10Status === "fail"
        ? "Rule 10 mandates the name and complete address of the manufacturer, packer or importer; omission is a contravention."
        : rule10Status === "warn"
          ? "An address without PIN code or locality is not a 'complete address' under Rule 10; direct the packer to complete it."
          : "Address conforms to Rule 10.",
  });

  /* ---- Rule 11 — standard units of quantity ---- */
  const qty = (fields.netQuantity ?? "").trim();
  const unitMatch = qty.match(STANDARD_UNIT);
  const nonStandard = NON_STANDARD_UNIT.test(qty);
  const rule11Status: RuleResult["status"] = !isPresent(qty)
    ? "fail"
    : nonStandard
      ? "fail"
      : unitMatch
        ? "pass"
        : "warn";
  results.push({
    key: "rule11",
    title: "Rule 11 — Standard quantity units",
    provision: "Rule 11 — net quantity to be declared in metric units (g, kg, ml, L)",
    status: rule11Status,
    weight: 15,
    earned: scoreOf(rule11Status, 15),
    summary:
      rule11Status === "pass"
        ? `Net quantity "${qty}" declared in a standard metric unit.`
        : rule11Status === "fail"
          ? isPresent(qty)
            ? `Net quantity "${qty}" uses a non-metric unit.`
            : "Net quantity not declared."
          : `Unit of measurement in "${qty}" could not be recognised.`,
    findings: [
      ...(isPresent(qty) ? [] : ["Net quantity declaration absent"]),
      ...(nonStandard ? ["Non-metric unit used in the net quantity declaration"] : []),
      ...(isPresent(qty) && !unitMatch && !nonStandard
        ? ["Numeral and unit not clearly separated in the declaration"]
        : []),
    ],
    remark:
      rule11Status === "fail"
        ? "Rule 11 permits net quantity only in metric units (g, kg, ml, L or number); any other unit is a contravention."
        : rule11Status === "warn"
          ? "Confirm the unit symbol printed on the pack complies with the metric units listed in Rule 11."
          : "Unit of declaration conforms to Rule 11.",
  });

  return results;
}

export const RULE_STATUS_LABEL: Record<RuleResult["status"], string> = {
  pass: "Pass",
  fail: "Fail",
  warn: "Review",
};

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
