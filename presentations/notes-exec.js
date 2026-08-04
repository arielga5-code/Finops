/*
 * Speaker notes, default cut — a mixed executive-leadership audience.
 *
 * Argues the practice: what each slide is for, what to say out loud that is not
 * printed on it, and where to substitute the organization's own figures.
 *
 * Keys are slide slugs rather than numbers so slides can be inserted without
 * renumbering every note. build-deck.js fails loudly on a missing key.
 */
module.exports = {
  "title":
    "Framing: this briefing is about the Inform phase of FinOps — visibility. " +
    "It is deliberately not an optimization pitch. The argument is that visibility is the " +
    "prerequisite that makes every later saving durable rather than one-off.",

  "problem":
    "Open with the lived experience rather than theory: the month-end surprise. " +
    "If you have one, use a real example of a bill that moved and could not be explained within 24 hours. " +
    "The point of the quote is that a dashboard is not the same thing as visibility — " +
    "visibility means an owner and a cause can be named.",

  "what-is-finops":
    "Stress the 'Finance + DevOps' compound: this is an operating model that puts two functions in the " +
    "same conversation, not a tool purchase. Inform is highlighted because it is where this organization is, " +
    "and because the cycle repeats — each optimization round needs fresh visibility to target the next one.",

  "why-visibility":
    "These four questions are the acceptance test for the visibility programme. " +
    "Invite the room to answer them for our own estate right now — the gaps in the answers are the business case. " +
    "The bottom line matters most to a cost-conscious executive: without allocation, the only lever left is " +
    "an across-the-board cut, which lands hardest on whoever is least able to argue back rather than on actual waste.",

  "framework":
    "Four capabilities, in dependency order: allocation makes reporting meaningful, reporting makes unit " +
    "economics computable, and freshness determines whether any of it is actionable. " +
    "Unit economics is the one that changes the conversation with the board — it separates 'spend is up' " +
    "from 'spend per customer is down', which are opposite stories told by the same invoice.",

  "blockers":
    "This is the honest slide: it says the goal is hard and names why. " +
    "The next four slides map one-to-one onto the first four blockers. " +
    "SaaS and marketplace spend has no dedicated solution slide because the fix is procurement discipline " +
    "rather than tooling — flag it as an action for finance, not engineering.",

  "tagging":
    "The one slide to take away if only one lands. Two decisions are needed from this room: " +
    "who owns the tag taxonomy, and whether we are willing to enforce it with policy that blocks " +
    "untagged resource creation. Enforcement at creation is nearly free; retrofitting a live estate is not. " +
    "The five minimum tags are a starting point — resist the urge to design thirty.",

  "shared-resources":
    "Worth naming our own shared platforms out loud here. " +
    "The caveat to flag: a shared platform carries one set of tags, so resource tags alone cannot split it — " +
    "per-team attribution needs either gateway-level keys or application-level instrumentation. " +
    "Decide which before promising anyone chargeback on a shared service.",

  "commitments":
    "Two failure modes to describe: under-coverage, where we pay on-demand rates for workloads that never " +
    "turn off; and over-commitment, where we buy for a peak that never returns. " +
    "The reporting fix is showing both prices — teams that only see the discounted rate cannot tell whether " +
    "the commitment is earning its keep, and teams that only see list price will not believe the savings claim.",

  "multi-cloud":
    "Calibrate to our own footprint: if we are effectively single-cloud, the native tooling is sufficient and " +
    "a platform purchase is premature. The FOCUS point still matters even then — asking vendors for " +
    "FOCUS-compliant exports keeps the option open and makes any future migration cheap.",

  "showback-chargeback":
    "The sequencing is the message. Showback is a runway, not a lesser version of chargeback: it is where " +
    "allocation disputes get found and settled while the stakes are still low. " +
    "A chargeback launched on 60% tagging coverage produces an argument about the numbers instead of a " +
    "conversation about the spend, and that argument is expensive to unwind.",

  "best-practices":
    "Use this as a maturity self-assessment rather than a wish list: mark each of the six as in place, " +
    "partial, or absent for our estate. Note that four of the six are visibility practices — " +
    "high performers are not distinguished by how aggressively they cut, but by how early and how precisely they see.",

  "governance-intro":
    "The hinge of the deck — say plainly that part one was about seeing and part two is about " +
    "controlling, and that the second does not follow automatically from the first. " +
    "The distinction worth landing: a report tells you what already happened, a control decides " +
    "what is permitted to happen next. Teams routinely build the first and assume they have the " +
    "second. If time is short, the two pillars that pay for themselves fastest are ownership and " +
    "rate limits — one gives every alert a destination, the other is the only thing on the list " +
    "that can stop spend in progress.",

  "app-ownership":
    "Ownership is the prerequisite for everything else in this section: an alert with no owner is " +
    "a notification, a budget with no owner is a forecast. Push hard on the named-person point, " +
    "because it is where this usually goes soft — a team alias feels safer to assign and answers " +
    "nothing at 2am. The four duties are deliberately concrete; if a proposed owner cannot do all " +
    "four, they are a contact, not an owner. The bottom callout is the one to leave hanging: " +
    "unowned resources are not unbudgeted, they are simply charged to whoever is least able to " +
    "refuse them, which is usually the central platform budget.",

  "budget-controls":
    "Three tiers so the response matches the severity — notify, review, gate — and only the last " +
    "one blocks anything. Make the case for a real gate somewhere in the estate: teams treat a " +
    "threshold that has never stopped anything as advisory, because it is. " +
    "The bottom panel is the technical heart of the slide and worth reading aloud. Proportional " +
    "burn compares spend against how much of the month has elapsed, so it separates a healthy " +
    "month that is simply late from a runaway that started on day three — a flat percentage " +
    "cannot tell those apart. Keep the budget figures in one place finance can edit; budgets " +
    "hard-coded across alert rules go stale within a quarter.",

  "rate-limits":
    "The chart is the argument: billing data arrives a day or two late, utilization metrics in " +
    "minutes, application telemetry in seconds. Anything built on the billing plane is a report " +
    "on money already gone. State it directly — a cost alert cannot stop a runaway job. " +
    "The four controls are all reversible in seconds, which is what makes them safe to set " +
    "conservatively: a quota that turns out to be too tight is a five-minute fix, while the " +
    "absence of one is a five-figure invoice. Expect pushback that limits will throttle " +
    "legitimate growth. The answer is that a ceiling is not a target, it is the point at which a " +
    "human is asked whether this is intended.",

  "automated-alerts":
    "The tiering rule is the takeaway: sort alerts by what they can actually prevent, then route " +
    "them by that. Protective alerts run on fast signals and earn a page. Budget alerts run on " +
    "billing data and belong in a channel. Advisory alerts become tickets. " +
    "The three cautions at the bottom are hard-won. Paging on a budget threshold wakes someone " +
    "about a fact they cannot change, and does it repeatedly until they mute the rule — at which " +
    "point the alerting looks healthy and is not. The silence alert is the one nobody builds " +
    "until after the incident: an expired credential stops the data feed, every threshold rule " +
    "goes quiet, and a quiet dashboard is indistinguishable from a good month.",

  "shared-responsibility":
    "Close the section on the division of labour, because the most common failure here is not a " +
    "missing tool but an assumption that FinOps is the platform team's job. " +
    "Walk one row rather than all five — guardrails is a good choice, since engineering builds " +
    "them but does not get to decide unilaterally where the ceiling sits. The pattern to point " +
    "out is that no column owns more than two rows: this is a shared model by construction, and " +
    "any version where one function owns everything has quietly become that function's problem " +
    "alone. Bring a filled-in version of this grid with real names to the next meeting; the grid " +
    "with roles is a discussion, the grid with names is a commitment.",

  "shift-left":
    "This is the slide that defines shift left properly, so do not let it be heard as a tooling " +
    "pitch. Shift left is a change in when the FinOps conversation happens: today it starts when " +
    "the invoice arrives, and it belongs at requirements and design, where the decisions that " +
    "commit the money are actually made. " +
    "Walk the band left to right and make the point under it — by the time the design is agreed, " +
    "most of the lifetime cost of that workload is already determined. Rightsizing afterwards " +
    "trims the margin; the architecture set the base. " +
    "The two cards are the exchange, and the right one matters more than the left. FinOps arrives " +
    "with priced options and a cost target, but it leaves with an understanding of what the " +
    "project actually needs — the real SLO, what is temporary, where the business value sits. " +
    "That is why a named person has to be in the room rather than a report being circulated. " +
    "Cite the Framework line at the bottom: this is a defined capability, not an invented process.",

  "design-questions":
    "The practical companion to the previous slide, and the one to hand to an architect. None of " +
    "the six is a finance question — every one is a design question the team can answer in the " +
    "room, and every one moves the bill by a large factor. " +
    "Pick two to talk through rather than reading all six. The shape-of-load question is the " +
    "highest-yield: sizing for a weekly peak is the most common and most expensive habit. The " +
    "temporary question is the cheapest win, because an expiry date set on day one costs nothing " +
    "and removing an environment two years later is a project nobody volunteers for. " +
    "The bottom line is what makes the meeting real: the output is a number attached to the " +
    "design and a cost target recorded next to the latency and availability targets, so cost " +
    "becomes a non-functional requirement rather than a preference. Automation enforces it " +
    "afterwards — the cost diff on the pull request and policy as code — but the number comes " +
    "from this conversation, not from the tool.",

  "billing-shock":
    "The payoff slide for both halves of the deck, and the one to use if someone asks what all " +
    "this buys. Walk the timeline left to right: the same overrun, found at four different " +
    "moments, and only the first three leave anyone a decision to make. " +
    "The fourth point is the status quo — it is not that the invoice is wrong, it is that by the " +
    "time it arrives the only available action is explaining it. Land the closing line " +
    "deliberately: we are not promising a smaller bill, and anyone who promises that before " +
    "seeing the data is guessing. We are promising a bill with nothing surprising in it, which " +
    "is a different and more defensible commitment.",

  "path-forward":
    "This is the ask. Step 1 is highlighted because it is the only one that cannot be parallelized — " +
    "everything downstream degrades if the taxonomy is still in flux. " +
    "Steps 2 and 4 are both arguments against over-engineering: pick the top spend categories and the " +
    "tooling that matches the estate we actually have, not the one we might have in three years.",

  "takeaways":
    "Close on the causal chain rather than a summary of slides. Each link is a separate management " +
    "commitment: allocation data, published ownership, cost surfaced in the engineering workflow, and a " +
    "review cadence that keeps it alive. Ask for the first two today; the rest follow from them.",

  "closing":
    "Anticipate three questions. What will this cost — mostly effort, not licences, if we stay on native " +
    "tooling. How long until we see savings — allocation coverage improves in weeks, targeted savings follow " +
    "the first full month of clean data. Who owns it — name the tagging owner and the review cadence before " +
    "leaving the room, or nothing on the previous slides happens.",

};
