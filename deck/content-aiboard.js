/**
 * The AI consumption slide for the CIO deck, 1 July to 19 August 2026.
 *
 * Same numbers as `content-aitable.js`, same source, laid out to be read from
 * the back of a room instead of scanned with a finger. The table version is
 * kept because somebody will want to audit a line; this is the one that gets
 * presented.
 *
 * THE ARGUMENT THE LAYOUT MAKES
 *
 * A strip across the top sizes the whole bill before a single figure is read.
 * Three cards underneath answer "which team, which provider, which
 * application" in one glance each. A full-width band beneath them carries the
 * money that belongs to no team, which gets the width because it is larger
 * than any of the three cards above it.
 *
 * Cards plus band account for the entire $79,448. It is a partition, not a
 * sample, and the build fails below if that stops being true.
 *
 * COLOUR RULE
 *
 * Colour is the provider, everywhere: Claude orange, Azure OpenAI blue, GCP
 * green, as on every other slide in the deck. A team's accent appears only on
 * its own name and the rule above its card, so nothing coloured is ever a team.
 */

const { COLORS } = require("./lib/theme");
const W = require("./data/ai-cost-window");

const { money, pct, num, sum } = W;

/** The three teams that carry the bill, in order. */
const LISTED = ["insait", "ai-factory", "solugen"];
const CARD_ACCENT = { insait: COLORS.cyan, "ai-factory": COLORS.ai, solugen: COLORS.warn };

/**
 * Rows on each card: three applications and one rolled line for the rest.
 *
 * Rows with no application name are forced in above their rank, but only above
 * a floor. Showing a $5 unnamed row while a $2,394 named application hides in
 * the roll-up would distort the card to make a point the band already makes
 * with the full figure.
 */
const APPS = 3;
const FORCE_UNNAMED_ABOVE = 100;

const teamOf = (name) => W.teams.find((t) => t.name === name);
const others = W.teams.filter((t) => !LISTED.includes(t.name) && t.invocations > 0);
const othersTotal = sum(others.map((t) => t.best));

/**
 * One card's application list.
 *
 * Unnamed rows are pulled in whatever they rank, because a slide about who
 * spends the money cannot quietly roll up the rows that say nobody knows. The
 * remainder becomes one muted line carrying its own count, so a team never
 * looks like it has four applications when it has forty-seven.
 */
function appsFor(name) {
  const all = W.appsFor(name);
  const spending = all.filter((a) => a.total >= 0.005);
  const keep = new Set(spending.filter((a) => a.unnamed && a.total >= FORCE_UNNAMED_ABOVE));
  for (const a of spending) {
    if (keep.size >= APPS) break;
    keep.add(a);
  }
  const head = all.filter((a) => keep.has(a));
  const tail = all.filter((a) => !keep.has(a));

  const rows = head.map((a) => ({
    name: a.app.length > 24 ? a.app.slice(0, 23) + "..." : a.app,
    value: a.total,
    unnamed: a.unnamed,
  }));
  if (tail.length) {
    rows.push({
      name: `${tail.length} more applications`,
      value: sum(tail.map((a) => a.total)),
      muted: true,
    });
  }
  return rows;
}

function card(name) {
  const t = teamOf(name);
  const unnamed = W.appsFor(name).filter((a) => a.unnamed);
  const unnamedCost = sum(unnamed.map((a) => a.total));
  return {
    name,
    accent: CARD_ACCENT[name],
    total: t.best,
    // One line, by contract: the card reserves one line for it, and the share
    // is already on the strip above, so this carries the two facts that are not.
    sub: num(t.invocations) + " calls, $" + t.perThousand.toFixed(0) + " per 1,000",
    split: [
      { label: "Claude", value: t.claude, color: W.SOURCE_COLOR.Claude },
      { label: "Azure OpenAI", value: t.azure, color: W.SOURCE_COLOR.Azure },
      { label: "GCP", value: t.gcp, color: W.SOURCE_COLOR.GCP },
    ],
    apps: appsFor(name),
    unnamedCost,
  };
}

const cards = LISTED.map(card);

// Cards plus the band have to be the whole bill, or the slide is a selection
// pretending to be a summary.
{
  const shown = sum(cards.map((c) => c.total)) + othersTotal + W.unattributable;
  if (Math.abs(shown - W.grand) > 0.5) {
    throw new Error(
      `ai consumption board: the cards and the band come to ${money(shown)} ` +
        `against a bill of ${money(W.grand)}.`
    );
  }
}

const insait = teamOf("insait");
const aws = W.bySource.find((s) => s.name === "Claude");

module.exports = [
  {
    kind: "teamCards",
    eyebrow: "AI consumption, " + W.label,
    accent: COLORS.cyan,
    title: money(W.grand) + " of AI in " + W.days + " days, and who is spending it",
    note:
      num(W.invocations) + " calls across Claude, Azure OpenAI and GCP. About " +
      money(W.perMonth) + " a month at this rate.",

    strip: [
      ...cards.map((c) => ({ label: c.name, value: c.total, color: c.accent })),
      { label: "13 other teams", value: othersTotal, color: COLORS.faint },
      { label: "No team at all", value: W.unattributable, color: COLORS.danger },
    ],

    cards,

    band: {
      value: W.unattributable,
      valueLabel: "no team, no application",
      title: "The largest single line in the bill has no owner",
      // Two lines is what the band holds. Anything longer belongs in the notes.
      text:
        money(W.untagged) + " has no application tag, plus " + money(W.guardrails) +
        " of guardrail fees. That is " + pct((aws.unattributable / aws.total) * 100, 0) +
        " of our Bedrock bill, and more than " + insait.name + ".",
      aside: {
        label: "13 other teams",
        value: othersTotal,
        note: pct((othersTotal / W.grand) * 100) + " of the bill",
      },
    },

    foot:
      "Cost Explorer actuals where they exist, token estimate where they do not. Red is spend with no " +
      "application name: " + money(W.unnamedBest) + " on rows named unknown inside the teams, plus the " +
      money(W.unattributable) + " below, is " + money(W.unchargeable) + " or " +
      pct((W.unchargeable / W.grand) * 100, 0) + " of the bill.",

    speakerNotes: [
      "THE WHOLE AI BILL ON ONE SLIDE. " + money(W.grand) + ", " + W.days + " days, " +
        num(W.invocations) + " calls.",
      "",
      "READ THE STRIP FIRST. Five segments, and the red one on the right is the",
      "biggest thing on the slide. That is the argument.",
      "",
      "THE THREE TEAMS",
      ...cards.map(
        (c) =>
          `  ${c.name.padEnd(12)} ${money(c.total).padStart(8)}  ` +
          `${pct((c.total / W.grand) * 100).padStart(6)} of the bill  ` +
          `${num(teamOf(c.name).invocations).padStart(9)} calls  ` +
          `$${teamOf(c.name).perThousand.toFixed(0)}/1K`
      ),
      "",
      "  insait      agent and the copilots, expensive per call by nature",
      "  ai-factory  the only team on all three providers, three different jobs",
      "  solugen     one application, half our call volume, cheapest per call",
      "",
      "THE RED ROWS INSIDE THE CARDS",
      ...W.unnamedRows
        .filter((r) => r.best >= 1)
        .map(
          (r) =>
            `  ${r.app.padEnd(13)} ${r.source.padEnd(7)} ${r.team.toLowerCase().padEnd(10)} ` +
            `${money(r.best).padStart(8)}  ${num(r.invocations).padStart(8)} calls`
        ),
      "",
      "At $91 and $97 per thousand calls the two insait rows are production agent",
      "traffic that lost its label, not somebody's test script. Say 'almost",
      "certainly', not 'is', because we cannot prove it from this file.",
      "",
      "THE BAND IS THE POINT OF THE SLIDE.",
      "  " + money(W.untagged) + "  Bedrock model spend with no application tag",
      "  " + money(W.guardrails) + "  guardrail fees, billed apart from inference",
      "  " + money(W.unattributable) + "  together, against " + money(insait.best) +
        " for insait, our largest team",
      "",
      "That is " + pct((aws.unattributable / aws.total) * 100, 0) +
        " of our Bedrock spend with nothing to charge it to. Add the",
      money(W.unnamedBest) + " of unknown rows inside the cards and " +
        pct((W.unchargeable / W.grand) * 100, 0) + " of the bill has no",
      "application name on it.",
      "",
      "WHAT IT COSTS US: no chargeback, no quota anyone can be held to, and no",
      "answer to 'whose is this' for nearly half the spend.",
      "",
      "THE ASK: put an application tag on the Bedrock calls. Gateway",
      "configuration, not a project. Nobody has to stop building anything.",
      "",
      "IF ASKED WHY THE CARDS DO NOT ADD TO THE TOTAL: they do. Three cards, the",
      "13 other teams on the right of the band, and the untagged line, come to " +
        money(W.grand) + ".",
      "",
      "IF ASKED FOR A SINGLE APPLICATION FIGURE: agent is " +
        money(W.appRollup[0].total) + " across Claude and",
      "Azure, the largest thing we run. insureGen is " + money(W.appRollup[1].total) +
        " on " + num(W.appRollup[1].invocations) + " calls,",
      "half our volume for a quarter of the money.",
    ].join("\n"),
  },
];
