/**
 * AI cost per application, from the AI_cost_table workbook.
 *
 * Everything on the "AI cost by application" deck is derived here from
 * `ai-cost-apps.json`, which is the workbook's Details sheet extracted
 * verbatim, one row per application/source/team. Nothing is typed in twice.
 *
 * TWO THINGS ABOUT THE SOURCE WORTH KNOWING BEFORE READING ANY FIGURE
 *
 * 1. `ce` (the workbook's "CE Actual $") is the reconciliation figure, and it
 *    is blank on every Azure row. Just under half the estimated spend
 *    therefore has nothing to check it against. The workbook's own Notes sheet
 *    says so, and says the deltas are only meaningful where CE exists.
 *
 * 2. The workbook's Summary_Team sheet lists ai-factory twice, once as
 *    "AI-Factory" and once as "ai-factory", each carrying the full figure. It
 *    totals $56,501 against the Details sheet's $43,547, the difference is
 *    exactly the duplicated row, and every share on that sheet is computed
 *    against the inflated denominator. This module works from Details and
 *    folds team names case-insensitively, so the totals here reconcile with
 *    the Summary_Source sheet instead.
 *
 * The workbook states no date range anywhere, so nothing here claims a period.
 */

const { rows } = require("./ai-cost-apps.json");
const { COLORS } = require("../lib/theme");

const sum = (a) => a.reduce((x, y) => x + (y || 0), 0);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pct = (n, d = 1) => n.toFixed(d) + "%";

/** One accent per provider, matching the rest of the deck. */
const SOURCE_COLOR = {
  Azure: COLORS.azure,
  Claude: COLORS.aws,
  GCP: COLORS.gcp,
};

const total = sum(rows.map((r) => r.est));
const invocations = sum(rows.map((r) => r.invocations));
const apps = rows.length;

/* ------------------------------------------------------------------ *
 * By provider
 * ------------------------------------------------------------------ */

const bySource = [...new Set(rows.map((r) => r.source))]
  .map((name) => {
    const rs = rows.filter((r) => r.source === name);
    const withCe = rs.filter((r) => r.ce !== null);
    return {
      name,
      color: SOURCE_COLOR[name] || COLORS.muted,
      rows: rs.length,
      verifiedRows: withCe.length,
      invocations: sum(rs.map((r) => r.invocations)),
      est: sum(rs.map((r) => r.est)),
      // Only the rows that actually carry a reconciliation figure, so the
      // comparison is like for like rather than measuring against blanks.
      matchedEst: sum(withCe.map((r) => r.est)),
      matchedCe: sum(withCe.map((r) => r.ce)),
    };
  })
  .sort((a, b) => b.est - a.est);

/* ------------------------------------------------------------------ *
 * Verified against unverified
 * ------------------------------------------------------------------ */

const verifiedEst = sum(rows.filter((r) => r.ce !== null).map((r) => r.est));
const unverifiedEst = total - verifiedEst;

/**
 * How far the estimate is out where it can be checked at all.
 *
 * GCP is excluded from this: its estimate equals its CE actual to the cent on
 * every one of its rows, which means the two columns are the same number
 * rather than two independent measurements. Counting it would dilute a real
 * variance with rows that cannot disagree by construction. Claude is the only
 * provider whose estimate and reconciliation figure were derived separately,
 * so it is the only genuine check in the workbook.
 */
const isIndependent = (s) =>
  s.verifiedRows > 0 && Math.abs(s.matchedCe - s.matchedEst) > 0.005;

const checks = bySource.filter(isIndependent);
const checkedEst = sum(checks.map((s) => s.matchedEst));
const checkedCe = sum(checks.map((s) => s.matchedCe));
const understatement = checkedEst ? (checkedCe / checkedEst - 1) * 100 : 0;

/** Providers whose estimate simply mirrors the reconciliation figure. */
const mirrored = bySource.filter((s) => s.verifiedRows > 0 && !isIndependent(s));

/* ------------------------------------------------------------------ *
 * By application and by team
 * ------------------------------------------------------------------ */

/** Two rows can share an app name across providers; they stay separate. */
const byApp = [...rows]
  .map((r) => ({
    ...r,
    label: r.app,
    perThousand: r.invocations ? (r.est / r.invocations) * 1000 : 0,
    verified: r.ce !== null,
    color: SOURCE_COLOR[r.source] || COLORS.muted,
  }))
  .sort((a, b) => b.est - a.est);

/** Cumulative share, for "the top n applications are most of the bill". */
function topShare(n) {
  return (sum(byApp.slice(0, n).map((r) => r.est)) / total) * 100;
}

const byTeam = (() => {
  const acc = new Map();
  for (const r of rows) {
    // Case-folded: the source has both "AI-Factory" and "ai-factory".
    const key = (r.team || "unknown").toLowerCase();
    const t = acc.get(key) || { name: key, invocations: 0, est: 0, ce: 0, apps: 0 };
    t.invocations += r.invocations;
    t.est += r.est;
    t.ce += r.ce || 0;
    t.apps += 1;
    acc.set(key, t);
  }
  return [...acc.values()].sort((a, b) => b.est - a.est);
})();

/**
 * Applications whose name identifies nothing, "unknown", "(unlabeled)".
 *
 * Kept as its own figure because it is the part of the bill that cannot be
 * charged to anyone even in principle, whatever the reconciliation says.
 */
const UNNAMED = /^(unknown|\(unlabeled\)|unlabeled|n\/a|-)$/i;
const unnamed = rows.filter((r) => UNNAMED.test((r.app || "").trim()));
const unnamedEst = sum(unnamed.map((r) => r.est));

module.exports = {
  rows, total, invocations, apps,
  bySource, byApp, byTeam, topShare,
  verifiedEst, unverifiedEst,
  checks, checkedEst, checkedCe, understatement, mirrored,
  unnamed, unnamedEst,
  money, pct, sum, SOURCE_COLOR,
};
