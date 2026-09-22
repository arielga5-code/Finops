/**
 * AI cost for August 2026 on its own, as the mosaic and the other slides want it.
 *
 * Derived from the August period already extracted into `ai-cost-periods.json`,
 * reshaped to the interface `data/ai-cost-window.js` exposes so the same slide
 * builders work unchanged against either period.
 *
 * THREE THINGS ABOUT THIS PERIOD
 *
 * 1. It is 1 to 19 August, nineteen days, not a calendar month. That is what
 *    the export covers. Everything here says nineteen days, and the run rate is
 *    given per day; nothing is scaled up to a month without being labelled a
 *    projection.
 *
 * 2. There is no separate Teams sheet in this export, so a team is simply the
 *    sum of its application rows. That removes the inter-sheet difference the
 *    combined workbook carries, which is why `sheetGap` is zero here and the
 *    slide's footnote has nothing to disclose about it.
 *
 * 3. `best` is the reconciliation figure where the export gives one and the
 *    token estimate where it does not. Azure has no reconciliation column at
 *    all, so every Azure figure is an estimate.
 */

const RAW = require("./ai-cost-periods.json").august;
const { COLORS } = require("../lib/theme");

const sum = (a) => a.reduce((x, y) => x + (y || 0), 0);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pct = (n, d = 1) => n.toFixed(d) + "%";
const num = (n) => Math.round(n).toLocaleString("en-US");

const PROVIDERS = ["Claude", "Azure", "GCP"];
const SOURCE_COLOR = { Azure: COLORS.azure, Claude: COLORS.aws, GCP: COLORS.gcp };

/** Rows whose application name identifies nothing. */
const UNNAMED = /^(unknown|\(unlabeled\)|unlabeled|n\/a|-)$/i;

const parse = (s) => {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const start = parse(RAW.start);
const end = parse(RAW.end);
const days = (end - start) / 86400000 + 1;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const label =
  `${start.getUTCDate()} to ${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]} ` +
  `${end.getUTCFullYear()}`;

/** Cost Explorer actual where the export has one, the estimate where it does not. */
const bestOf = (r) => (r.ce !== null && r.ce !== undefined ? r.ce : r.est);

const rows = RAW.rows.map((r) => ({
  ...r,
  team: (r.team || "unknown").toLowerCase(),
  best: bestOf(r),
  hasCe: r.ce !== null && r.ce !== undefined,
  unnamed: UNNAMED.test(String(r.app).trim()),
}));

const attributed = sum(rows.map((r) => r.best));
const invocations = sum(rows.map((r) => r.invocations));

/* ------------------------------------------------------------------ *
 * Applications, rolled by name so one application is one thing even when
 * it is served by two providers, with the provider split kept on the row.
 * ------------------------------------------------------------------ */

function rollup(list) {
  return [...list
    .reduce((m, r) => {
      const key = r.app.toLowerCase();
      const a = m.get(key) || {
        app: r.app, team: r.team, Claude: 0, Azure: 0, GCP: 0,
        total: 0, invocations: 0, unnamed: r.unnamed,
      };
      a[r.source] = (a[r.source] || 0) + r.best;
      a.total += r.best;
      a.invocations += r.invocations;
      return m.set(key, a);
    }, new Map())
    .values()]
    .map((a) => ({
      ...a,
      perThousand: a.invocations ? (a.total / a.invocations) * 1000 : 0,
    }))
    .sort((x, y) => y.total - x.total);
}

const appRollup = rollup(rows);
const appsFor = (team) => rollup(rows.filter((r) => r.team === team));

/* ------------------------------------------------------------------ *
 * Teams
 * ------------------------------------------------------------------ */

const teams = [...new Set(rows.map((r) => r.team))]
  .map((name) => {
    const rs = rows.filter((r) => r.team === name);
    const inv = sum(rs.map((r) => r.invocations));
    return {
      name,
      claude: sum(rs.filter((r) => r.source === "Claude").map((r) => r.best)),
      azure: sum(rs.filter((r) => r.source === "Azure").map((r) => r.best)),
      gcp: sum(rs.filter((r) => r.source === "GCP").map((r) => r.best)),
      invocations: inv,
      best: sum(rs.map((r) => r.best)),
      perThousand: inv ? (sum(rs.map((r) => r.best)) / inv) * 1000 : 0,
      apps: appsFor(name).length,
    };
  })
  .sort((a, b) => b.best - a.best);

/**
 * Teams that are not business owners: a gateway and two defaults, named as
 * such in the combined workbook's README and treated the same way here so the
 * two periods do not disagree about who counts as an owner.
 */
const NOT_AN_OWNER = new Set(["apim", "azure", "unknown"]);
const ownedTeams = teams.filter((t) => !NOT_AN_OWNER.has(t.name));
const unownedTeams = teams.filter((t) => NOT_AN_OWNER.has(t.name));

/* ------------------------------------------------------------------ *
 * The charges that belong to no application
 * ------------------------------------------------------------------ */

const find = (re) => (RAW.unattributed || []).find((u) => re.test(u.item)) || { amount: 0 };
const guardrails = find(/guardrail/i).amount;
const untagged = sum((RAW.unattributed || []).map((u) => u.amount)) - guardrails;
const unattributable = untagged + guardrails;
const grand = attributed + unattributable;

const unnamedRows = rows.filter((r) => r.unnamed).sort((a, b) => b.best - a.best);
const unnamedBest = sum(unnamedRows.map((r) => r.best));
const unchargeable = unattributable + unnamedBest;

/* ------------------------------------------------------------------ *
 * By provider. Untagged Bedrock and guardrail fees are billed on AWS, so they
 * sit on the Claude row and nowhere else; there is no honest alternative.
 * ------------------------------------------------------------------ */

const bySource = PROVIDERS.map((name) => {
  const rs = rows.filter((r) => r.source === name);
  const here = sum(rs.map((r) => r.best));
  const extra = name === "Claude" ? unattributable : 0;
  return {
    name,
    color: SOURCE_COLOR[name],
    rows: rs.length,
    invocations: sum(rs.map((r) => r.invocations)),
    attributed: here,
    unattributable: extra,
    total: here + extra,
  };
})
  .filter((s) => s.total > 0)
  .sort((a, b) => b.total - a.total);

// A team's applications have to add back to the team, or the mosaic drawn from
// them is a picture rather than a figure.
for (const t of teams) {
  const apps = sum(appsFor(t.name).map((a) => a.total));
  if (Math.abs(apps - t.best) > 0.5) {
    throw new Error(
      `ai-cost-august: ${t.name} applications come to ${money(apps)} against a ` +
        `team total of ${money(t.best)}.`
    );
  }
}

module.exports = {
  label, start: RAW.start, end: RAW.end, days,
  rows, teams, ownedTeams, unownedTeams, bySource,
  appRollup, appsFor, PROVIDERS, SOURCE_COLOR,
  attributed, invocations, grand,
  untagged, guardrails, unattributable,
  unnamedRows, unnamedBest, unchargeable,
  perDay: grand / days,
  perMonth: (grand / days) * (365 / 12),
  perThousand: invocations ? (attributed / invocations) * 1000 : 0,
  // This export has one table, so there is no inter-sheet difference to carry.
  sheetGap: 0,
  money, pct, num, sum,
};
