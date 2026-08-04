/*
 * Speaker notes, default cut — a mixed executive-leadership audience.
 *
 * Argues the practice: what each slide is for, what to say out loud that is not
 * printed on it, and where to substitute the organization's own figures.
 */
module.exports = {
  1:
    "Framing: this briefing is about the Inform phase of FinOps — visibility. " +
    "It is deliberately not an optimization pitch. The argument is that visibility is the " +
    "prerequisite that makes every later saving durable rather than one-off.",

  2:
    "Open with the lived experience rather than theory: the month-end surprise. " +
    "If you have one, use a real example of a bill that moved and could not be explained within 24 hours. " +
    "The point of the quote is that a dashboard is not the same thing as visibility — " +
    "visibility means an owner and a cause can be named.",

  3:
    "Stress the 'Finance + DevOps' compound: this is an operating model that puts two functions in the " +
    "same conversation, not a tool purchase. Inform is highlighted because it is where this organization is, " +
    "and because the cycle repeats — each optimization round needs fresh visibility to target the next one.",

  4:
    "These four questions are the acceptance test for the visibility programme. " +
    "Invite the room to answer them for our own estate right now — the gaps in the answers are the business case. " +
    "The bottom line matters most to a cost-conscious executive: without allocation, the only lever left is " +
    "an across-the-board cut, which lands hardest on whoever is least able to argue back rather than on actual waste.",

  5:
    "Four capabilities, in dependency order: allocation makes reporting meaningful, reporting makes unit " +
    "economics computable, and freshness determines whether any of it is actionable. " +
    "Unit economics is the one that changes the conversation with the board — it separates 'spend is up' " +
    "from 'spend per customer is down', which are opposite stories told by the same invoice.",

  6:
    "This is the honest slide: it says the goal is hard and names why. " +
    "The next four slides map one-to-one onto the first four blockers. " +
    "SaaS and marketplace spend has no dedicated solution slide because the fix is procurement discipline " +
    "rather than tooling — flag it as an action for finance, not engineering.",

  7:
    "The one slide to take away if only one lands. Two decisions are needed from this room: " +
    "who owns the tag taxonomy, and whether we are willing to enforce it with policy that blocks " +
    "untagged resource creation. Enforcement at creation is nearly free; retrofitting a live estate is not. " +
    "The five minimum tags are a starting point — resist the urge to design thirty.",

  8:
    "Worth naming our own shared platforms out loud here. " +
    "The caveat to flag: a shared platform carries one set of tags, so resource tags alone cannot split it — " +
    "per-team attribution needs either gateway-level keys or application-level instrumentation. " +
    "Decide which before promising anyone chargeback on a shared service.",

  9:
    "Two failure modes to describe: under-coverage, where we pay on-demand rates for workloads that never " +
    "turn off; and over-commitment, where we buy for a peak that never returns. " +
    "The reporting fix is showing both prices — teams that only see the discounted rate cannot tell whether " +
    "the commitment is earning its keep, and teams that only see list price will not believe the savings claim.",

  10:
    "Calibrate to our own footprint: if we are effectively single-cloud, the native tooling is sufficient and " +
    "a platform purchase is premature. The FOCUS point still matters even then — asking vendors for " +
    "FOCUS-compliant exports keeps the option open and makes any future migration cheap.",

  11:
    "The sequencing is the message. Showback is a runway, not a lesser version of chargeback: it is where " +
    "allocation disputes get found and settled while the stakes are still low. " +
    "A chargeback launched on 60% tagging coverage produces an argument about the numbers instead of a " +
    "conversation about the spend, and that argument is expensive to unwind.",

  12:
    "Use this as a maturity self-assessment rather than a wish list: mark each of the six as in place, " +
    "partial, or absent for our estate. Note that four of the six are visibility practices — " +
    "high performers are not distinguished by how aggressively they cut, but by how early and how precisely they see.",

  13:
    "This is the ask. Step 1 is highlighted because it is the only one that cannot be parallelized — " +
    "everything downstream degrades if the taxonomy is still in flux. " +
    "Steps 2 and 4 are both arguments against over-engineering: pick the top spend categories and the " +
    "tooling that matches the estate we actually have, not the one we might have in three years.",

  14:
    "Close on the causal chain rather than a summary of slides. Each link is a separate management " +
    "commitment: allocation data, published ownership, cost surfaced in the engineering workflow, and a " +
    "review cadence that keeps it alive. Ask for the first two today; the rest follow from them.",

  15:
    "Anticipate three questions. What will this cost — mostly effort, not licences, if we stay on native " +
    "tooling. How long until we see savings — allocation coverage improves in weeks, targeted savings follow " +
    "the first full month of clean data. Who owns it — name the tagging owner and the review cadence before " +
    "leaving the room, or nothing on the previous slides happens.",

};
