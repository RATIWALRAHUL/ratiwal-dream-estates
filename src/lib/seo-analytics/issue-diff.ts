import type { Finding } from "./tech-scanner";

/** Minimal view of a stored issue needed to decide new / ongoing / resolved. */
export interface StoredIssueRef {
  issueKey: string;
  status: "OPEN" | "RESOLVED";
  firstRunId: string;
  firstSeenAt: Date;
  timesSeen: number;
}

export interface IssueWrite {
  finding: Finding;
  state: "NEW" | "ONGOING";
  firstRunId: string;
  firstSeenAt: Date;
  timesSeen: number;
}

export interface IssuePlan {
  writes: IssueWrite[];
  /** Keys to mark RESOLVED (only ever non-empty for a completed scan). */
  resolveKeys: string[];
  newCount: number;
  ongoingCount: number;
}

/**
 * Decides what a scan changes in the issue register.
 * - Found + not previously OPEN  → NEW (also covers re-opened RESOLVED issues).
 * - Found + previously OPEN      → ONGOING (history preserved).
 * - Previously OPEN, not found   → RESOLVED, but ONLY if the scan completed. A partial
 *   scan cannot prove an issue is gone, so it never resolves anything.
 */
export function planIssueChanges(params: {
  existing: StoredIssueRef[];
  found: Finding[];
  completed: boolean;
  runId: string;
  now: Date;
}): IssuePlan {
  const { existing, found, completed, runId, now } = params;
  const byKey = new Map(existing.map((e) => [e.issueKey, e]));
  const foundKeys = new Set<string>();
  const writes: IssueWrite[] = [];
  let newCount = 0;
  let ongoingCount = 0;

  for (const f of found) {
    if (foundKeys.has(f.key)) continue;
    foundKeys.add(f.key);
    const prev = byKey.get(f.key);
    if (prev && prev.status === "OPEN") {
      ongoingCount++;
      writes.push({ finding: f, state: "ONGOING", firstRunId: prev.firstRunId, firstSeenAt: prev.firstSeenAt, timesSeen: prev.timesSeen + 1 });
    } else {
      newCount++;
      writes.push({ finding: f, state: "NEW", firstRunId: runId, firstSeenAt: now, timesSeen: 1 });
    }
  }

  const resolveKeys = completed
    ? existing.filter((e) => e.status === "OPEN" && !foundKeys.has(e.issueKey)).map((e) => e.issueKey)
    : [];

  return { writes, resolveKeys, newCount, ongoingCount };
}
