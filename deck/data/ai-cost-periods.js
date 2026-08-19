/**
 * AI cost for the two exported periods: full July 2026, and 1 to 19 August 2026.
 *
 * `ai-cost-periods.json` is the two workbooks' detail sheets extracted verbatim
 * by `tools/extract-periods.py`, one row per application per provider. Every
 * figure on both period decks is derived here. Nothing is typed in twice.
 *
 * FOUR PROPERTIES OF THE SOURCE THAT SHAPE EVERY SLIDE
 *
 * 1. The periods are different lengths, 31 days against 19. Comparing the two
 *    totals directly would say August is up 27% when the daily rate is up 107%.
 *    Everything comparative in this module is therefore per day, and the raw
 *    totals are only ever used to describe a single period on its own.
 *
 * 2. `ce`, the reconciliation figure, is null on every Azure row in both
 *    periods. `null` and `0` are kept distinct: null means the source gave no
 *    figure, zero means it gave zero.
 *
 * 3. The August export lists two Bedrock charges its own notes say belong to no
 *    application, $9,183.98 of untagged actual and $665.66 of guardrail fees.
 *    They sit outside the row totals in the source and they stay outside them
 *    here. July's export names no such bucket, which is not the same as there
 *    not having been one, so nothing in this module claims the bucket is new.
 *
 * 4. Team names carry two capitalisations of ai-factory in both files. They are
 *    folded, as they were for the by-application deck.
 */

const RAW = require("./ai-cost-periods.json");
const { COLORS } = require("../lib/theme");

const sum = (a) => a.reduce((x, y) => x + (y || 0), 0);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n) => "$" + n.toFixed(2);
const pct = (n, d = 1) => n.toFixed(d) + "%";
const times = (n, d = 1) => n.toFixed(d) + "x";
const num = (n) => Math.round(n).toLocaleString("en-US");

const SOURCE_COLOR = { Azure: COLORS.azure, Claude: COLORS.aws, GCP: COLORS.gcp };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

/** "19/08/2026" -> Date. The exports write dates the Israeli way round. */
function parseDate(s) {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** "1 to 19 August 2026", or "July 2026" when the range is a whole month. */
function describe(start, end) {
  const a = parseDate(start);
  const b = parseDate(end);
  const month = MONTHS[a.getUTCMonth()];
  const whole =
    a.getUTCDate() === 1 &&
    b.getUTCDate() ===
      new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth() + 1, 0)).getUTCDate();
  return whole
    ? `${month} ${a.getUTCFullYear()}`
    : `${a.getUTCDate()} to ${b.getUTCDate()} ${month} ${a.getUTCFullYear()}`;
}

function days(start, end) {
  return (parseDate(end) - parseDate(start)) / 86400000 + 1;
}

/** Rows whose application name identifies nothing. */
const UNNAMED = /^(unknown|\(unlabeled\)|unlabeled|n\/a|-)$/i;

/** Same application seen through the same provider, across periods. */
const appKey = (r) => r.app.toLowerCase() + " | " + r.source;

function build(raw) {
  const rows = raw.rows;
  const total = sum(rows.map((r) => r.est));
  const invocations = sum(rows.map((r) => r.invocations));
  const d = days(raw.start, raw.end);

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
        matchedEst: sum(withCe.map((r) => r.est)),
        matchedCe: sum(withCe.map((r) => r.ce)),
      };
    })
    .sort((a, b) => b.est - a.est);

  // One row per application per provider, rolled up: a few names appear more
  // than once inside a period because the export splits them by team.
  const byApp = [...rows
    .reduce((m, r) => {
      const k = appKey(r);
      const t = m.get(k) || { key: k, app: r.app, source: r.source, team: r.team, est: 0, invocations: 0, ce: 0, hasCe: false };
      t.est += r.est;
      t.invocations += r.invocations;
      if (r.ce !== null) { t.ce += r.ce; t.hasCe = true; }
      return m.set(k, t);
    }, new Map())
    .values()]
    .map((r) => ({
      ...r,
      color: SOURCE_COLOR[r.source] || COLORS.muted,
      perThousand: r.invocations ? (r.est / r.invocations) * 1000 : 0,
      perDay: r.est / d,
    }))
    .sort((a, b) => b.est - a.est);

  const byTeam = [...rows
    .reduce((m, r) => {
      const k = (r.team || "unknown").toLowerCase();
      const t = m.get(k) || { name: k, est: 0, invocations: 0, ce: 0, verifiedEst: 0, apps: 0 };
      t.est += r.est;
      t.invocations += r.invocations;
      t.apps += 1;
      if (r.ce !== null) { t.ce += r.ce; t.verifiedEst += r.est; }
      return m.set(k, t);
    }, new Map())
    .values()]
    .map((t) => ({ ...t, perDay: t.est / d }))
    .sort((a, b) => b.est - a.est);

  const withCe = rows.filter((r) => r.ce !== null);
  const verifiedEst = sum(withCe.map((r) => r.est));

  /**
   * A provider is only a real check if its two columns can disagree. Where the
   * estimate equals the reconciliation figure to the cent on every row, one
   * column was copied from the other, and counting it would dilute a genuine
   * variance with rows that cannot differ by construction.
   */
  const isIndependent = (s) =>
    s.verifiedRows > 0 && Math.abs(s.matchedCe - s.matchedEst) > 0.005;
  const checks = bySource.filter(isIndependent);
  const checkedEst = sum(checks.map((s) => s.matchedEst));
  const checkedCe = sum(checks.map((s) => s.matchedCe));

  const unnamed = rows.filter((r) => UNNAMED.test(r.app.trim()));
  const unattributed = (raw.unattributed || []).map((u) => ({ ...u }));

  return {
    label: describe(raw.start, raw.end),
    start: raw.start,
    end: raw.end,
    days: d,
    dated: raw.dated || "stated on the sheet",
    rows,
    total,
    invocations,
    apps: byApp.length,
    perDay: total / d,
    callsPerDay: invocations / d,
    perThousand: invocations ? (total / invocations) * 1000 : 0,
    bySource,
    byApp,
    byTeam,
    verifiedEst,
    unverifiedEst: total - verifiedEst,
    checks,
    checkedEst,
    checkedCe,
    understatement: checkedEst ? (checkedCe / checkedEst - 1) * 100 : 0,
    mirrored: bySource.filter((s) => s.verifiedRows > 0 && !isIndependent(s)),
    unnamed,
    unnamedEst: sum(unnamed.map((r) => r.est)),
    unattributed,
    unattributedTotal: sum(unattributed.map((u) => u.amount)),
    topShare: (n) => (sum(byApp.slice(0, n).map((r) => r.est)) / total) * 100,
  };
}

const july = build(RAW.july);
const august = build(RAW.august);

/* ------------------------------------------------------------------ *
 * The two periods against each other
 *
 * Always per day. 31 days against 19 makes every raw total incomparable.
 * ------------------------------------------------------------------ */

const growth = (a, b) => (a > 0 ? b / a : null);

/** One entry per application seen in either period, with its daily change. */
const appMoves = (() => {
  const keys = new Set([...july.byApp, ...august.byApp].map((r) => r.key));
  return [...keys]
    .map((k) => {
      const j = july.byApp.find((r) => r.key === k);
      const a = august.byApp.find((r) => r.key === k);
      const ref = a || j;
      return {
        key: k,
        app: ref.app,
        source: ref.source,
        team: ref.team,
        color: ref.color,
        julyPerDay: j ? j.perDay : 0,
        augustPerDay: a ? a.perDay : 0,
        change: (a ? a.perDay : 0) - (j ? j.perDay : 0),
        growth: j && a ? growth(j.perDay, a.perDay) : null,
        isNew: !j,
        isGone: !a,
      };
    })
    .sort((x, y) => y.change - x.change);
})();

const teamMoves = (() => {
  const keys = new Set([...july.byTeam, ...august.byTeam].map((t) => t.name));
  return [...keys]
    .map((name) => {
      const j = july.byTeam.find((t) => t.name === name);
      const a = august.byTeam.find((t) => t.name === name);
      return {
        name,
        julyPerDay: j ? j.perDay : 0,
        augustPerDay: a ? a.perDay : 0,
        change: (a ? a.perDay : 0) - (j ? j.perDay : 0),
        growth: j && a ? growth(j.perDay, a.perDay) : null,
      };
    })
    .sort((x, y) => y.augustPerDay - x.augustPerDay);
})();

const sourceMoves = [...new Set([...july.bySource, ...august.bySource].map((s) => s.name))]
  .map((name) => {
    const j = july.bySource.find((s) => s.name === name);
    const a = august.bySource.find((s) => s.name === name);
    return {
      name,
      color: SOURCE_COLOR[name] || COLORS.muted,
      julyPerDay: j ? j.est / july.days : 0,
      augustPerDay: a ? a.est / august.days : 0,
      growth: j && a ? growth(j.est / july.days, a.est / august.days) : null,
    };
  })
  .sort((x, y) => y.augustPerDay - x.augustPerDay);

/**
 * The decomposition the whole August deck turns on.
 *
 * Daily cost is calls per day times cost per call, so the growth in cost is the
 * growth in volume times the growth in unit price. Splitting it that way is
 * what separates "we are being used more" from "we are paying more for the same
 * thing", and they need completely different responses.
 */
const compare = {
  costGrowth: growth(july.perDay, august.perDay),
  volumeGrowth: growth(july.callsPerDay, august.callsPerDay),
  priceGrowth: growth(july.perThousand, august.perThousand),
  /** August's daily rate carried across a full 31-day month. */
  projected: august.perDay * 31,
  newApps: appMoves.filter((m) => m.isNew),
  goneApps: appMoves.filter((m) => m.isGone),
  appMoves,
  teamMoves,
  sourceMoves,
};

// The decomposition has to close, or one of the three figures is wrong.
{
  const implied = compare.volumeGrowth * compare.priceGrowth;
  if (Math.abs(implied - compare.costGrowth) > 0.005) {
    throw new Error(
      `ai-cost-periods: volume x price is ${implied.toFixed(4)} but cost growth ` +
        `is ${compare.costGrowth.toFixed(4)}, the decomposition does not close.`
    );
  }
}

module.exports = {
  july, august, compare,
  money, money2, pct, times, num, sum, SOURCE_COLOR,
};
