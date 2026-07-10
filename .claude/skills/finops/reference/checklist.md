# FinOps review checklist

Use as a menu, not a mandatory sequence — pick the items relevant to the
question asked.

## Inform (visibility)

- [ ] Total spend + trend (MoM, WoW) by account/subscription/project
- [ ] Top N cost drivers by service
- [ ] % of spend that is untagged / unallocated to a cost center
- [ ] Spend by environment (prod/staging/dev) — dev/test running 24/7 is a
      classic waste signal

## Optimize (levers, roughly in order of typical impact)

- [ ] **Idle/orphaned resources** — unattached volumes/disks, unused
      elastic/static IPs, idle load balancers, stopped-but-still-billing
      instances, old snapshots/AMIs/images past retention need
- [ ] **Rightsizing** — compute/DB instances with sustained low CPU/memory
      utilization vs. provisioned size (compare to CloudWatch/Monitor/
      Cloud Monitoring metrics if available)
- [ ] **Commitment coverage** — % of steady-state compute/DB usage covered
      by Reserved Instances / Savings Plans / Committed Use Discounts vs.
      on-demand; look for coverage gaps and, separately, for unused/
      underutilized commitments
- [ ] **Storage tiering** — data in high-cost tiers (e.g. S3 Standard,
      Premium SSD) that's infrequently accessed and could move to a
      cheaper tier or lifecycle-expire
- [ ] **Spot/preemptible usage** — fault-tolerant or batch workloads still
      running on on-demand pricing
- [ ] **Data transfer** — cross-AZ/cross-region/egress costs, often an
      overlooked line item worth isolating
- [ ] **License optimization** — BYOL opportunities, oversized license
      tiers, unused SaaS/marketplace subscriptions

## Operate (accountability)

- [ ] Chargeback/showback: cost by team/cost-center tag, with an untagged
      bucket called out rather than hidden
- [ ] Budget vs. actual variance, and which dimension drove the variance
- [ ] Anomaly detection: day-over-day or week-over-week spend spikes beyond
      normal variance, isolated to the specific service/resource
- [ ] Unit economics — cost per business driver, e.g.:
      `cost_per_unit = total_cost / usage_driver` (requests, transactions,
      active users, GB processed). Track the trend of this ratio, not just
      absolute spend — flat or falling unit cost with rising absolute
      spend usually means healthy growth, not waste.
