/**
 * The AI Factory programme, project by project and service by service.
 *
 * Two slides read from here: the project overview and the infrastructure cut.
 * Both are derived from `charts.json` at build time, so neither can drift from
 * the source workbooks or from each other.
 *
 * Basis: metered consumption, January to July 2026, Azure enrollment.
 *
 * WHAT COUNTS AS AI
 * The model and inference meters — Foundry Models, Foundry Tools, Azure
 * Cognitive Search — plus the whole of Document Intelligence, which is an OCR
 * API and bills nothing but page meters. Everything else a project consumes is
 * infrastructure: the gateway in front of the models, the servers they run on,
 * the databases, the networking, the monitoring.
 *
 * The split is deliberately generous to AI. Cognitive Search is counted as AI
 * even though it is as much a search index as a model, and any inference
 * running on a plain virtual machine is counted as infrastructure because that
 * is how it bills. The infrastructure figure is a floor, not a ceiling.
 */

const DATA = require("./charts.json");
const { COLORS } = require("../lib/theme");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const sum = (a) => a.reduce((x, y) => x + (y || 0), 0);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

/** Meters that are the AI itself rather than the platform under it. */
const AI_SERVICES = new Set([
  "Foundry Models",
  "Foundry Tools",
  "Azure Cognitive Search",
]);

const ROLLUP = "chart32"; // the programme, one series per project

/**
 * Each project, and the chart holding its service-level split.
 *
 * `services: null` means there is no service chart for it. Document
 * Intelligence is the only one, and it needs none: it is a hosted OCR API, so
 * every meter under it is a page meter and none of it is infrastructure. That
 * is stated on the slide rather than assumed quietly.
 */
const PROJECTS = [
  {
    name: "AI Factory",
    series: "Aifactory",
    services: "chart34",
    color: COLORS.azure,
    desc: "The shared platform. A gateway, the models behind it, and the servers, databases and network under both.",
  },
  {
    name: "Solugen",
    series: "Solugen",
    services: "chart35",
    color: COLORS.cyan,
    desc: "The most model-heavy workload in the programme. Four fifths of it is Foundry models and tools.",
  },
  {
    name: "Document Intelligence",
    series: "Document Intelligence (OCR Services)",
    services: null,
    color: COLORS.aws,
    desc: "OCR as a hosted API. It bills page meters and nothing else, so it carries no infrastructure at all.",
  },
  {
    name: "INSAIT",
    series: "INSAIT",
    services: "chart37",
    color: COLORS.ai,
    desc: "Research workload. Almost entirely container apps, an application gateway and the machines behind them.",
  },
];

/** Monthly series for one project, off the programme rollup. */
function monthly(name) {
  const s = DATA[ROLLUP].series.find((x) => x.name === name);
  if (!s) {
    throw new Error(
      `ai-projects: "${name}" is not a series in ${ROLLUP} — the source data ` +
      "changed, update PROJECTS."
    );
  }
  return s.vals.map((v) => v || 0);
}

/** A project's services, split into the two kinds. */
function servicesOf(p, total) {
  if (!p.services) return { ai: total, infra: 0, lines: [] };
  const raw = DATA[p.services];
  if (!raw) throw new Error(`ai-projects: unknown chart ${p.services}`);

  const lines = raw.series.map((s) => ({
    name: s.name,
    value: sum(s.vals),
    ai: AI_SERVICES.has(s.name),
  }));

  // The service chart and the rollup are two cuts of the same money. If they
  // stop agreeing, one of them has been re-extracted and the split below is
  // no longer describing the project on the slide.
  const charted = sum(lines.map((l) => l.value));
  if (Math.abs(charted - total) > Math.max(5, total * 0.005)) {
    throw new Error(
      `ai-projects: ${p.name} is ${money(total)} in ${ROLLUP} but ` +
      `${money(charted)} in ${p.services} — the two cuts disagree.`
    );
  }

  return {
    ai: sum(lines.filter((l) => l.ai).map((l) => l.value)),
    infra: sum(lines.filter((l) => !l.ai).map((l) => l.value)),
    lines,
  };
}

const projects = PROJECTS.map((p) => {
  const vals = monthly(p.series);
  const total = sum(vals);
  const split = servicesOf(p, total);
  return {
    ...p,
    vals,
    total,
    first: vals[0],
    last: vals[vals.length - 1],
    ai: split.ai,
    infra: split.infra,
    lines: split.lines,
  };
});

const total = sum(projects.map((p) => p.total));
const infraTotal = sum(projects.map((p) => p.infra));
const aiTotal = sum(projects.map((p) => p.ai));

const monthlyTotals = MONTHS.map((_, i) => sum(projects.map((p) => p.vals[i])));
const growth = ((monthlyTotals[monthlyTotals.length - 1] / monthlyTotals[0] - 1) * 100);

/**
 * Every infrastructure service in the programme, added across projects.
 *
 * Virtual machine licences are folded into virtual machines: they are the same
 * line as far as anyone reading the slide is concerned, and splitting them puts
 * a $551 row next to a $23,000 one for no reason.
 */
const FOLD = { "Virtual Machines Licenses": "Virtual Machines" };

const infraByService = (() => {
  const acc = new Map();
  for (const p of projects) {
    for (const l of p.lines) {
      if (l.ai) continue;
      const name = FOLD[l.name] || l.name;
      acc.set(name, (acc.get(name) || 0) + l.value);
    }
  }
  return [...acc]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
})();

/** Growth said in whichever way is honest: a ratio off a tiny base is noise. */
function badgeFor(vals) {
  const first = vals[0];
  const last = vals[vals.length - 1];
  if (!first) return `First billed in ${MONTHS[vals.findIndex((v) => v > 0)]}`;
  const growth = (last / first - 1) * 100;
  if (growth >= 1000) return `${money(first)} to ${money(last)}`;
  return `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}% Jan to Jul`;
}

// Attached in place rather than recomputed per consumer, so every slide that
// cites a project's growth is quoting the same figure.
projects.forEach((p) => { p.badge = badgeFor(p.vals); });

/** The shape the `platforms` slide kind wants. */
const cards = projects.map((p) => ({
  name: p.name,
  color: p.color,
  desc: p.desc,
  total: p.total,
  first: p.first,
  last: p.last,
  badge: p.badge,
}));

/** Projects that actually carry infrastructure, largest first. */
const infraByProject = projects
  .filter((p) => p.infra > 0)
  .sort((a, b) => b.infra - a.infra);

module.exports = {
  MONTHS, projects, cards, total, infraTotal, aiTotal, monthlyTotals, growth,
  infraByService, infraByProject, money, AI_SERVICES,
};
