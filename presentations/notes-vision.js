/*
 * Speaker notes for the five-slide vision deck.
 *
 * One idea per slide, in the order a management audience needs it: where we
 * are going, where we stand today, how we get visibility, how we hold it,
 * what we are asking for. No idea repeats across slides.
 */
module.exports = {
  vision:
    "Open with the sentence on the slide and stop — let it land before explaining it. Every " +
    "project has a name, an owner, a number and a limit is the whole vision; everything after " +
    "this slide is how we get there. " +
    "Say plainly that this is not a cost-cutting pitch. Cloud and AI are the one large spending " +
    "line where commitments are made daily, by engineers, with no approval step in between — " +
    "everywhere else in the budget that would be called a control gap, and closing it is the ask. " +
    "The four words at the bottom are the structure for the rest of the deck: named and owned are " +
    "slide 3, measured is slides 3 and 5, limited is slide 4. Naming them here means nothing later " +
    "needs re-introducing.",

  "why-now":
    "This slide answers 'why is this on the agenda now', with external evidence rather than our " +
    "own complaint. The 78% figure matters most: FinOps has moved from a finance reporting " +
    "function to a technology capability, and it now sits in the CTO/CIO organization in most " +
    "practices \u2014 up eighteen points in three years. That is the industry telling us where " +
    "accountability belongs. " +
    "The middle card is the scope point. Practices are no longer managing cloud alone \u2014 AI " +
    "spend is now near-universal, SaaS is close behind, data centre is climbing. Build allocation " +
    "and ownership for all of it, or rebuild the same work twice. " +
    "The third card pre-empts the obvious pushback, 'haven't we already done the cost work?'. " +
    "Optimization dropped below governance in the 2026 priorities because mature practices hit " +
    "diminishing returns on hunting waste after the fact \u2014 the returns now come from " +
    "ownership and governance, which is exactly what slides 3 and 4 propose. " +
    "Attribute the numbers to the State of FinOps 2026 out loud. This is external evidence, not " +
    "our opinion, and it is the strongest slide in the deck for that reason.",

  "see-it":
    "This is the whole of visibility in one slide, deliberately: trace it, and price it whole. " +
    "The left side is the allocation chain — tag, allocate, showback, divide by a unit — and the " +
    "single number to commit to is under 5% unallocated, reported weekly. That is the target that " +
    "makes everything else on this slide possible. " +
    "The right side is the point most cost conversations miss, and it is worth slowing down for: " +
    "an AI feature gets quoted at its token cost, but it runs on compute, databases, cache, " +
    "storage, gateway and log ingestion that bill every month regardless of how heavily the model " +
    "is called. A project priced at its model line alone will be wrong by the size of everything " +
    "under it, and the surprise arrives at the first full month, not the pilot. " +
    "The instruction is the bottom bar: one ApplicationID across every resource a project touches. " +
    "That is a tagging decision, not an engineering project, and it is the single most impactful " +
    "thing this room can approve today.",

  "control-it":
    "Visibility is not a control — this slide is the controls, and the two columns are the only " +
    "two moments a cost can be changed. " +
    "Shift left is a change in when the conversation happens, not a tool purchase: FinOps in the " +
    "design and intake conversation, understanding what a project needs before the architecture is " +
    "set. Most of a workload's lifetime cost is settled at that point — rightsizing afterwards " +
    "trims the margin, the design set the base. " +
    "The runtime column is ordered by speed on purpose. Quotas act in seconds and are the only " +
    "thing here that can stop money being spent while it is happening; alerts and budget " +
    "thresholds act on a slower clock and only ever notify. Say the quote at the bottom plainly — " +
    "billing data arrives a day or two late, so anything built on it can only report, never prevent. " +
    "If asked what this costs: someone's time in design reviews, and reversible technical settings. " +
    "No new tooling is implied by either column.",

  ask:
    "Land the plane on specifics. Ninety days, three phases, each one word — name it, see it, " +
    "hold it — mapping directly back to the vision statement on slide 1. Nothing in the plan " +
    "requires a purchase or new headcount, and the closing line says so explicitly because that is " +
    "the first thing being calculated while this slide is on screen. " +
    "The KPI panel is what makes this reportable next quarter, and none of the three is a savings " +
    "number — allocation coverage says whether the data can be trusted, time-to-attribute says " +
    "whether we can act, cost per unit says whether growth is healthy. " +
    "Do not leave the room without the two decisions on the right. The second is the one people " +
    "avoid — a limit that never blocks anything is treated as advisory, because it is. Ask directly " +
    "whether we are willing to have a hard ceiling somewhere, and where. " +
    "If asked about tooling: it is deliberately absent from this plan. A platform is worth " +
    "evaluating once allocation cannot be fixed at source — that conversation comes after these " +
    "ninety days, not instead of them.",
};
