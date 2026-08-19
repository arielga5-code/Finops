/**
 * AI cost for the whole window, 1 July to 19 August 2026.
 *
 * `ai-cost-window.json` is the AI cost dataset workbook extracted by
 * `tools/extract-window.py`: its Apps sheet, its Teams sheet, and the two
 * figures its README states as constants because they appear in neither table.
 * Every figure on the window slides is derived here.
 *
 * FIVE PROPERTIES OF THE SOURCE THAT SHAPE THE SLIDES
 *
 * 1. There are two authorities and they are not interchangeable. The workbook's
 *    README says to use the Teams sheet for attributed dollars and the Apps
 *    sheet for ranking inside a team, because the source report blends CE
 *    actual with the estimate for the most recent day and the two sheets apply
 *    that blend differently. They disagree by $753, 1.5%. This module follows
 *    that instruction rather than picking whichever total is larger, and
 *    exposes the gap so a slide can state it instead of hiding it.
 *
 * 2. `best` is CE actual where it exists and the estimate where it does not.
 *    Azure has no CE column at all, so every Azure figure here is an estimate,
 *    and no Azure row can be reconciled.
 *
 * 3. Untagged Bedrock spend and guardrail fees are real, billed, and carry no
 *    application tag. They are billed on AWS, so they belong on the AWS line
 *    and nowhere else; they cannot be split by team and this module never
 *    tries. They are the reason the grand total is not the attributed total.
 *
 * 4. Cost per 1,000 calls is a property of the workload, not a grade. An agent
 *    turn costs more than a classification call because it is a different unit
 *    of work. The spread is on the slides as the size of the lever, never as a
 *    league table.
 *
 * 5. `ai-factory` and `AI-Factory` are two rows in the source. They are folded,
 *    as they were on the earlier decks.
 *
 * The workbook's own header calls this an "August 2026 window". The report it
 * was built from covers 1 July onwards, which is the period carried in the JSON
 * and the period every slide states.
 */

const RAW = require("./ai-cost-window.json");
const { COLORS } = require("../lib/theme");

const sum = (a) => a.reduce((x, y) => x + (y || 0), 0);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n) => "$" + n.toFixed(2);
const pct = (n, d = 1) => n.toFixed(d) + "%";
const times = (n, d = 1) => n.toFixed(d) + "x";
const num = (n) => Math.round(n).toLocaleString("en-US");

/** One accent per provider, the same across every deck in this folder. */
const SOURCE_COLOR = { Azure: COLORS.azure, Claude: COLORS.aws, GCP: COLORS.gcp };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

const parseDate = (s) => {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const start = parseDate(RAW.start);
const end = parseDate(RAW.end);
const days = (end - start) / 86400000 + 1;
const label =
  `${start.getUTCDate()} ${MONTHS[start.getUTCMonth()]} to ` +
  `${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]} ${end.getUTCFullYear()}`;

/** Rows whose application name identifies nothing. */
const UNNAMED = /^(unknown|\(unlabeled\)|unlabeled|n\/a|-)$/i;

/* ------------------------------------------------------------------ *
 * Applications
 * ------------------------------------------------------------------ */

const apps = RAW.apps
  .map((r) => {
    const best = r.ce !== null ? r.ce : r.est;
    return {
      ...r,
      best,
      hasCe: r.ce !== null,
      unnamed: UNNAMED.test(r.app.trim()),
      color: SOURCE_COLOR[r.source] || COLORS.muted,
      perThousand: r.invocations ? (best / r.invocations) * 1000 : 0,
    };
  })
  .sort((a, b) => b.best - a.best);

const appsBest = sum(apps.map((r) => r.best));
const invocations = sum(apps.map((r) => r.invocations));

const unnamedApps = apps.filter((r) => r.unnamed);
const unnamedBest = sum(unnamedApps.map((r) => r.best));

/* ------------------------------------------------------------------ *
 * Teams, which the workbook says are authoritative for dollars
 * ------------------------------------------------------------------ */

const teams = [...RAW.teams
  .reduce((m, t) => {
    const key = t.team.toLowerCase(); // ai-factory and AI-Factory are one team
    const acc = m.get(key) || {
      name: key, claude: 0, azure: 0, gcp: 0, invocations: 0, est: 0, best: 0,
    };
    for (const k of ["claude", "azure", "gcp", "invocations", "est", "best"]) {
      acc[k] += t[k] || 0;
    }
    return m.set(key, acc);
  }, new Map())
  .values()]
  .map((t) => ({
    ...t,
    perThousand: t.invocations ? (t.best / t.invocations) * 1000 : 0,
    apps: apps.filter((r) => r.team.toLowerCase() === t.name).length,
  }))
  .sort((a, b) => b.best - a.best);

const attributed = sum(teams.map((t) => t.best));

/**
 * Teams that are not business owners.
 *
 * The workbook's README names these: `apim` is the gateway, `azure` and
 * `unknown` are defaults nobody chose. They are real spend and stay in every
 * total; they are flagged so a slide asking "who owns this" does not present a
 * gateway as an owner.
 */
const NOT_AN_OWNER = new Set(["apim", "azure", "unknown"]);
const ownedTeams = teams.filter((t) => !NOT_AN_OWNER.has(t.name));
const unownedTeams = teams.filter((t) => NOT_AN_OWNER.has(t.name));

/* ------------------------------------------------------------------ *
 * The whole bill, including what has no application on it
 * ------------------------------------------------------------------ */

const untagged = RAW.untaggedBedrock;
const guardrails = RAW.guardrails;
const unattributable = untagged + guardrails;
const grand = attributed + unattributable;

/**
 * Everything that cannot be charged to a named application.
 *
 * Two separate failures with the same consequence: spend that carries no tag at
 * all, and spend whose tag is the word "unknown". Kept as one figure because a
 * CIO asking "how much of this can I charge back" gets one answer, and as two
 * components because they are fixed in different places.
 */
const unchargeable = unattributable + unnamedBest;

/**
 * Attributed spend that also carries a real application name.
 *
 * `attributed` comes from the Teams sheet and `unnamedBest` from the Apps
 * sheet, and the two sheets disagree by `sheetGap`, $753 or 1.5%, because the
 * most recent day is still estimated rather than billed. Subtracting one from
 * the other therefore carries that much slack. It is well inside the precision
 * of anything said out loud about a $5,487 component, and the alternative,
 * taking the whole partition off the Apps sheet, would contradict the
 * workbook's own instruction to treat Teams as authoritative for dollars.
 */
const namedAttributed = attributed - unnamedBest;

/* ------------------------------------------------------------------ *
 * By provider
 *
 * Attribution is an application-level property, so the split is taken from the
 * Apps sheet; the untagged and guardrail lines are added to AWS because that is
 * where they are billed and there is nowhere honest to put them.
 * ------------------------------------------------------------------ */

const bySource = [...new Set(apps.map((r) => r.source))]
  .map((name) => {
    const rs = apps.filter((r) => r.source === name);
    const withCe = rs.filter((r) => r.hasCe);
    const extra = name === "Claude" ? unattributable : 0;
    const attributedHere = sum(rs.map((r) => r.best));
    return {
      name,
      // The workbook writes the AWS row as "AWS / Bedrock (Claude)". The decks
      // have called this vendor Claude throughout, so the name stays.
      color: SOURCE_COLOR[name] || COLORS.muted,
      rows: rs.length,
      verifiedRows: withCe.length,
      invocations: sum(rs.map((r) => r.invocations)),
      attributed: attributedHere,
      unattributable: extra,
      total: attributedHere + extra,
      est: sum(rs.map((r) => r.est)),
      matchedEst: sum(withCe.map((r) => r.est)),
      matchedCe: sum(withCe.map((r) => r.ce)),
      perThousand: sum(rs.map((r) => r.invocations))
        ? (attributedHere / sum(rs.map((r) => r.invocations))) * 1000
        : 0,
    };
  })
  .sort((a, b) => b.total - a.total);

/* ------------------------------------------------------------------ *
 * How far the estimate is out, where it can be checked at all
 * ------------------------------------------------------------------ */

const checked = apps.filter((r) => r.hasCe);
const checkedEst = sum(checked.map((r) => r.est));
const checkedCe = sum(checked.map((r) => r.ce));
const variance = checkedEst ? (checkedCe / checkedEst - 1) * 100 : 0;

/** The single largest reconciled application, where the aggregate hides most. */
const largestChecked = checked.slice().sort((a, b) => b.ce - a.ce)[0];
const largestCheckedVariance = (largestChecked.ce / largestChecked.est - 1) * 100;

/* ------------------------------------------------------------------ *
 * Reconciliation between the workbook's own two sheets
 * ------------------------------------------------------------------ */

const sheetGap = attributed - appsBest;

// Both sheets must agree on volume, or the two are not describing the same
// window and nothing derived from either of them means anything.
{
  const teamInvocations = sum(teams.map((t) => t.invocations));
  if (teamInvocations !== invocations) {
    throw new Error(
      `ai-cost-window: the Apps sheet counts ${invocations} invocations and the ` +
        `Teams sheet counts ${teamInvocations}, so they are not the same window.`
    );
  }
}

module.exports = {
  label, start: RAW.start, end: RAW.end, days,

  apps, teams, ownedTeams, unownedTeams, bySource,
  invocations, appsBest, attributed,
  untagged, guardrails, unattributable, grand,
  unnamedApps, unnamedBest, unchargeable, namedAttributed,
  perDay: grand / days,
  perMonth: (grand / days) * (365 / 12),
  perThousand: (attributed / invocations) * 1000,

  checked, checkedEst, checkedCe, variance,
  largestChecked, largestCheckedVariance,
  sheetGap,

  money, money2, pct, times, num, sum, SOURCE_COLOR,
};
