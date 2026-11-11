import type { SearchIntent, PageCategory } from "./classify";

/**
 * Transparent rule-based keyword opportunity flags. They are prompts for human
 * review, not predictions. Every rule has a minimum-sample guard so tiny
 * numbers do not generate noise. Thresholds are exported for the UI/docs.
 */
export const OPPORTUNITY_THRESHOLDS = {
  lowCtr: { minImpressions: 100, maxPosition: 20, maxCtr: 0.02 },
  declining: { minPrevClicks: 5, maxRatio: 0.7 },
  improving: { minPrevImpressions: 20, minPositionGain: 1 },
  weakLanding: { minImpressions: 20 },
  cannibalization: { minImpressions: 50, minSecondPageShare: 0.2 },
} as const;

export const OPPORTUNITY_KEYS = [
  "LOW_CTR",
  "DECLINING",
  "IMPROVING",
  "WEAK_LANDING_MATCH",
  "CANNIBALIZATION",
] as const;
export type OpportunityKey = (typeof OPPORTUNITY_KEYS)[number];

export const OPPORTUNITY_LABELS: Record<OpportunityKey, string> = {
  LOW_CTR: "High impressions, low CTR",
  DECLINING: "Clicks declining",
  IMPROVING: "Visibility improving",
  WEAK_LANDING_MATCH: "Landing page may not match",
  CANNIBALIZATION: "Possible cannibalization",
};

export interface OpportunityInput {
  clicks: number;
  impressions: number;
  ctr: number | null;
  position: number | null;
  prev: { clicks: number; impressions: number; position: number | null } | null;
  intent: SearchIntent;
  topPageCategory: PageCategory;
  /** Impressions per landing page for this query, descending. */
  pageImpressions: number[];
}

export function computeOpportunities(r: OpportunityInput): OpportunityKey[] {
  const T = OPPORTUNITY_THRESHOLDS;
  const out: OpportunityKey[] = [];

  if (
    r.impressions >= T.lowCtr.minImpressions &&
    r.position !== null &&
    r.position <= T.lowCtr.maxPosition &&
    r.ctr !== null &&
    r.ctr < T.lowCtr.maxCtr
  ) {
    out.push("LOW_CTR");
  }

  if (
    r.prev &&
    r.prev.clicks >= T.declining.minPrevClicks &&
    r.clicks <= r.prev.clicks * T.declining.maxRatio
  ) {
    out.push("DECLINING");
  }

  if (
    r.prev &&
    r.prev.impressions >= T.improving.minPrevImpressions &&
    r.prev.position !== null &&
    r.position !== null &&
    r.prev.position - r.position >= T.improving.minPositionGain
  ) {
    out.push("IMPROVING");
  }

  if (
    r.intent !== "BRAND" &&
    r.impressions >= T.weakLanding.minImpressions &&
    (r.topPageCategory === "HOMEPAGE" ||
      r.topPageCategory === "OTHER" ||
      r.topPageCategory === "CONTACT_INFO")
  ) {
    out.push("WEAK_LANDING_MATCH");
  }

  if (r.pageImpressions.length >= 2) {
    const total = r.pageImpressions.reduce((a, b) => a + b, 0);
    if (
      total >= T.cannibalization.minImpressions &&
      r.pageImpressions[1] / total >= T.cannibalization.minSecondPageShare
    ) {
      out.push("CANNIBALIZATION");
    }
  }

  return out;
}
