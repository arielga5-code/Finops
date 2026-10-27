// Dashboard A — Executive / monthly. Audience: finance and leadership.
// Panels follow docs/04-dashboards.md section A.
(function () {
  const FD = window.FD;

  // The monthly budget is a fixed reference, not a measured value. 50,000 is the
  // placeholder from assets/esql/forecast_vs_actual.esql and wants replacing with
  // the real figure, or a lookup index finance can maintain.
  const MONTHLY_BUDGET = 50000;

  const DAILY_NUM = ['cost', 'quantity'];

  dash.calc('budget_status', {
    title: 'Month-to-date spend against budget',
    description:
      'Month-to-date actual from the latest month in the cost export, projected to month end at the rate so far, against a fixed 50,000 monthly budget.',
    inputs: ['daily_cost'],
    fn: (daily_cost) => {
      const rows = daily_cost.map((r) => ({ date: r.date, cost: Number(r.cost) || 0 }));
      if (!rows.length) return { mtd: null, projected: null, used_pct: null, projected_pct: null, days: 0, verdict: null };
      const month = rows.map((r) => String(r.date).slice(0, 7)).sort().pop();
      const inMonth = rows.filter((r) => String(r.date).slice(0, 7) === month);
      const days = new Set(inMonth.map((r) => r.date)).size;
      const mtd = inMonth.reduce((a, r) => a + r.cost, 0);
      const daysInMonth = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();
      const projected = days ? (mtd / days) * daysInMonth : null;
      const budget = 50000;
      return {
        month,
        days,
        mtd,
        projected,
        used_pct: mtd / budget,
        projected_pct: projected == null ? null : projected / budget,
        verdict: projected == null ? null : projected > budget ? 'over budget' : projected > budget * 0.9 ? 'at risk' : 'on track',
      };
    },
  });

  dash.calc('ai_share', {
    title: 'AI spend as a share of total',
    description: 'AI meter spend divided by all spend, over the whole period in both files.',
    inputs: ['ai_cost', 'daily_cost'],
    fn: (ai_cost, daily_cost) => {
      const ai = ai_cost.reduce((a, r) => a + (Number(r.cost) || 0), 0);
      const total = daily_cost.reduce((a, r) => a + (Number(r.cost) || 0), 0);
      return { ai, total, pct: total ? ai / total : null };
    },
  });

  dash.calc('unallocated_share', {
    title: 'Spend with no cost center',
    description: 'The unallocated share of spend. Target is under 5%.',
    inputs: ['allocation'],
    fn: (allocation) => {
      let unallocated = 0;
      let total = 0;
      allocation.forEach((r) => {
        const cost = Number(r.cost) || 0;
        total += cost;
        if (r.allocation === 'unallocated') unallocated += cost;
      });
      return { unallocated, total, pct: total ? unallocated / total : null };
    },
  });

  dash.calc('cost_per_mtok', {
    title: 'Cost per million tokens by day',
    description:
      'Daily AI meter spend divided by daily tokens in millions. Spans the cost and telemetry files, which have different latencies, so the most recent days can be incomplete on one side.',
    inputs: ['ai_cost', 'tokens_by_deployment'],
    fn: (ai_cost, tokens_by_deployment) => {
      const cost = new Map();
      ai_cost.forEach((r) => {
        const day = String(r.date).slice(0, 10);
        cost.set(day, (cost.get(day) || 0) + (Number(r.cost) || 0));
      });
      const tokens = new Map();
      tokens_by_deployment.forEach((r) => {
        const day = String(r.hour).slice(0, 10);
        const total = Number(r.total_tokens) || Number(r.input_tokens) + Number(r.output_tokens) || 0;
        tokens.set(day, (tokens.get(day) || 0) + total);
      });
      return Array.from(cost.keys())
        .filter((day) => tokens.get(day) > 0)
        .sort()
        .map((day) => ({ day, cost: cost.get(day), tokens: tokens.get(day), cost_per_million: cost.get(day) / (tokens.get(day) / 1e6) }));
    },
  });

  dash.calc('top_resources', {
    title: 'Top resources by spend, with month change',
    description: 'The ten costliest resources in the latest month, each against the month before it.',
    inputs: ['resource_cost'],
    fn: (resource_cost) => {
      const months = Array.from(new Set(resource_cost.map((r) => r.month))).sort();
      const latest = months[months.length - 1];
      const prior = months[months.length - 2];
      const totals = new Map();
      resource_cost.forEach((r) => {
        const key = `${r.resource}\u0000${r.resource_group}\u0000${r.subscription}`;
        if (!totals.has(key)) totals.set(key, { resource: r.resource, resource_group: r.resource_group, subscription: r.subscription, latest: 0, prior: 0 });
        const entry = totals.get(key);
        if (r.month === latest) entry.latest += Number(r.cost) || 0;
        if (r.month === prior) entry.prior += Number(r.cost) || 0;
      });
      return Array.from(totals.values())
        .sort((a, b) => b.latest - a.latest)
        .slice(0, 10)
        .map((e) => Object.assign({}, e, { delta: e.prior ? (e.latest - e.prior) / e.prior : null }));
    },
  });

  const currencyOf = (rows) => (rows.length ? rows[0].currency || 'USD' : 'USD');

  FD.pages.executive = () => {
    const daily = FD.read('daily_cost', DAILY_NUM);
    const cur = currencyOf(daily.rows);
    const budget = dash.data('budget_status');
    const b = budget.status === 'ok' && budget.data ? budget.data : {};
    const share = dash.data('ai_share');
    const s = share.status === 'ok' && share.data ? share.data : {};
    const alloc = dash.data('unallocated_share');
    const a = alloc.status === 'ok' && alloc.data ? alloc.data : {};

    // tiles
    FD.setValue('#tile-mtd .fd-tile-value', FD.money(b.mtd, cur));
    FD.setValue('#tile-mtd .fd-tile-sub', b.month ? `${b.month}, ${b.days} day${b.days === 1 ? '' : 's'} of data` : 'Waiting for data');
    FD.setValue('#tile-projected .fd-tile-value', FD.money(b.projected, cur));
    FD.setValue('#tile-projected .fd-tile-sub', b.verdict ? b.verdict : 'Waiting for data');
    const verdictEl = document.querySelector('#tile-projected .fd-tile-sub');
    if (verdictEl) {
      verdictEl.classList.remove('fd-ok', 'fd-warn', 'fd-bad');
      if (b.verdict === 'over budget') verdictEl.classList.add('fd-bad');
      else if (b.verdict === 'at risk') verdictEl.classList.add('fd-warn');
      else if (b.verdict === 'on track') verdictEl.classList.add('fd-ok');
    }
    FD.setValue('#tile-budget .fd-tile-value', FD.pct(b.used_pct, 0));
    FD.setValue('#tile-ai-share .fd-tile-value', FD.pct(s.pct, 1));
    FD.setValue('#tile-unallocated .fd-tile-value', FD.pct(a.pct, 1));
    const unallocEl = document.querySelector('#tile-unallocated .fd-tile-value');
    if (unallocEl) {
      unallocEl.classList.remove('fd-ok', 'fd-bad');
      if (a.pct != null) unallocEl.classList.add(a.pct > 0.05 ? 'fd-bad' : 'fd-ok');
    }

    // cumulative spend against budget pace
    const pace = document.getElementById('chart-budget-pace');
    if (FD.visible(pace)) {
      if (daily.status === 'error') FD.chartState(pace, 'error');
      else if (daily.empty) FD.chartState(pace, 'empty', 'Cumulative spend against the budget line, once daily_cost.csv has rows.');
      else {
        const byDay = d3.rollup(daily.rows, (v) => FD.sum(v, 'cost'), (r) => r.date);
        const month = Array.from(byDay.keys()).map((d) => d.slice(0, 7)).sort().pop();
        let acc = 0;
        const rows = Array.from(byDay.entries())
          .filter(([d]) => d.slice(0, 7) === month)
          .sort((x, y) => (x[0] < y[0] ? -1 : 1))
          .map(([d, v]) => ({ t: d, series: 'Cumulative spend', value: (acc += v) }));
        FD.lines(pace, rows, {
          height: 240,
          format: (v) => FD.money(v, cur),
          refs: [{ value: MONTHLY_BUDGET, label: `Budget ${FD.money(MONTHLY_BUDGET, cur)}` }],
          emptyText: 'Cumulative spend against the budget line.',
        });
      }
    }

    // spend by cost center, unallocated included as its own bar
    const centers = document.getElementById('chart-cost-centers');
    if (FD.visible(centers)) {
      if (daily.status === 'error') FD.chartState(centers, 'error');
      else if (daily.empty) FD.chartState(centers, 'empty', 'One bar per cost center, with unallocated shown rather than dropped.');
      else {
        const rows = Array.from(
          d3.rollup(daily.rows, (v) => FD.sum(v, 'cost'), (r) => r.cost_center || 'unallocated'),
          ([key, value]) => ({ key, series: 'Spend', value })
        ).sort((x, y) => y.value - x.value);
        FD.bars(centers, rows, { height: 240, format: (v) => FD.money(v, cur), label: (k) => k, emptyText: 'One bar per cost center.' });
      }
    }

    // unit economics
    const unit = document.getElementById('chart-unit-economics');
    if (FD.visible(unit)) {
      const cpm = dash.data('cost_per_mtok');
      const rows = cpm.status === 'ok' && Array.isArray(cpm.data) ? cpm.data : [];
      if (!rows.length) {
        FD.chartState(unit, 'empty', 'Needs both ai_cost.csv and tokens_by_deployment.csv. The token side comes from Azure Monitor, not from any cost export.');
      } else {
        FD.lines(unit, rows.map((r) => ({ t: r.day, series: 'Cost per million tokens', value: r.cost_per_million })), {
          height: 240,
          format: (v) => FD.money(v, cur),
          emptyText: 'Cost per million tokens over time.',
        });
      }
    }

    // top resources
    const top = dash.data('top_resources');
    const topRows = top.status === 'ok' && Array.isArray(top.data) ? top.data : [];
    FD.table(
      document.getElementById('table-top-resources'),
      topRows,
      [
        { field: 'resource', th: true },
        { field: 'resource_group' },
        { field: 'subscription' },
        { field: 'latest', align: 'right', className: 'fd-numeric', render: (r) => FD.money(r.latest, cur) },
        {
          field: 'delta',
          align: 'right',
          className: 'fd-numeric',
          render: (r) => FD.signedPct(r.delta),
          tone: (r) => (r.delta == null ? null : r.delta > 0.2 ? 'bad' : r.delta < -0.2 ? 'ok' : null),
        },
      ],
      { keyColumns: ['resource'] }
    );
  };
})();
