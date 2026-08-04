/*
 * Speaker notes for the five-slide CIO brief.
 *
 * Written for a short meeting with one decision-maker in the room. Each note
 * names the point of the slide, the thing to say that is not printed on it,
 * and the objection to expect.
 *
 * No figures about this organization are asserted — the bracketed prompts mark
 * where your own numbers belong. Industry figures come from the FinOps
 * Foundation's State of FinOps 2026.
 */
module.exports = {
  gap:
    "Twelve minutes of material, so open on the ask and let the rest be evidence. The framing " +
    "that works with a CIO is control, not thrift: this is the one large line where spending " +
    "commitments are made daily, by engineers, with no approval step — everywhere else in the " +
    "budget that would be considered a control gap. " +
    "Fill in the three bullets with our own position before presenting: how long it actually took " +
    "to explain the last unexpected increase, what share of spend currently lands unallocated, and " +
    "whether any workload has a hard ceiling today. Specifics here are worth more than any slide " +
    "later in the deck. " +
    "Close the opening by reading the line under the asks — no new headcount, no platform " +
    "purchase — because that is the first thing a CIO is calculating while you talk. If the " +
    "meeting ends after this slide, the three asks are what you wanted.",

  "why-now":
    "This slide exists to answer 'why is this on my desk, and why now'. The 78% figure is the " +
    "one that matters to this audience: FinOps has moved from a finance reporting function to a " +
    "technology capability, and it now reports into the CTO/CIO organization in most practices — " +
    "up eighteen points in three years. That is the industry telling us where accountability sits. " +
    "The middle card is the scope point. Practices are no longer managing cloud alone: AI spend is " +
    "now near-universal, SaaS is close behind, and data centre is climbing. If we build allocation " +
    "and ownership only for cloud, we rebuild it twice. " +
    "The third card pre-empts the obvious question, 'haven't we already done the cost work?'. " +
    "Optimization dropped below governance and forecasting in the 2026 priorities because mature " +
    "practices hit diminishing returns on hunting waste after the fact. Attribute the numbers to " +
    "the State of FinOps 2026 out loud — this is external evidence, not our opinion, and it is " +
    "the strongest slide in the deck for that reason.",

  visibility:
    "One slide for the whole of part one, so keep it to the chain: tag, allocate, show, measure. " +
    "The single sentence worth landing is that every interesting question about cloud spend " +
    "collapses into one prerequisite — can this cost be traced to an owner? " +
    "Give the allocation KPI a number, because a CIO will hold you to it: under 5% unallocated, " +
    "reported weekly, is the target that makes the rest work. " +
    "Expect the objection that tagging is an old idea nobody has managed to enforce. Agree, and " +
    "make the distinction that matters: it fails when it is a reporting request and works when it " +
    "is a deployment requirement. Enforcement at creation costs nothing after configuration; " +
    "retrofitting a live estate is a manual project. " +
    "The right-hand card is the outcome to promise — the shift from an argument about whether IT " +
    "overspends to a sentence naming a team, a resource, a cost and a result.",

  governance:
    "The ordering is the argument, so walk it in the order shown. Quotas act in seconds and are " +
    "the only thing on the slide that can stop money being spent. Alerts act in minutes to days. " +
    "Ownership and budget thresholds are always-on and within the month. Everything a cost " +
    "dashboard does is downstream of all four. " +
    "The quote at the bottom is the technical fact underneath the whole section: billing data " +
    "arrives a day or two late, so any control built on it reports rather than prevents. If the " +
    "CIO takes one thing from part two, this is it. " +
    "Expect pushback that limits will throttle legitimate growth. The answer is that a ceiling is " +
    "not a target — it is the point at which a human is asked whether this was intended — and " +
    "that every control here is reversible in minutes, which is what makes it safe to set " +
    "conservatively and loosen later.",

  ask:
    "Land the plane on specifics. Ninety days, three phases, and nothing in it requires a purchase " +
    "or a new team — that is deliberate, and worth saying, because a CIO has seen this proposal " +
    "arrive with a licence attached before. " +
    "Do not leave the room without the three decisions at the bottom. The third is the one people " +
    "avoid: a limit that never blocks anything is treated as advisory, because it is. Ask " +
    "explicitly whether we are willing to have a hard ceiling somewhere, and where. " +
    "If time allows, the useful close is the outcome rather than the plan: at the end of this we " +
    "are not promising a smaller bill, we are promising an invoice with nothing in it that has " +
    "not already been seen, explained and decided about. A savings percentage promised before " +
    "anyone can see where the waste is would be a guess. " +
    "The longer 22-slide deck stands behind every claim here if anyone wants the detail — offer " +
    "it as a follow-up rather than presenting from it.",
};
