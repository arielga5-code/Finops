// Dashboard B — Engineering / weekly. Audience: platform and app teams.
// Panels follow docs/04-dashboards.md section B.
(function () {
  const FD = window.FD;
  const TOKEN_NUM = ['input_tokens', 'output_tokens', 'requests', 'total_tokens', 'output_ratio', 'tokens_per_call'];
  const PTU_NUM = ['avg_util', 'max_util', 'min_util'];
  const CACHE_NUM = ['total_tokens', 'active_tokens', 'reported_cache_rate', 'cached_tokens', 'derived_cache_rate'];

  dash.calc('cache_latest', {
    title: 'Latest prompt cache match rate',
    description: 'The most recent hour of cache match rate, against the mean of the hours before it.',
    inputs: ['cache_effectiveness'],
    fn: (cache_effectiveness) => {
      const rows = cache_effectiveness
        .map((r) => ({ hour: r.hour, rate: Number(r.reported_cache_rate ?? r.derived_cache_rate) }))
        .filter((r) => isFinite(r.rate))
        .sort((a, b) => (a.hour < b.hour ? -1 : 1));
      if (!rows.length) return { rate: null, baseline: null, change: null };
      const latest = rows[rows.length - 1].rate;
      const earlier = rows.slice(0, -1);
      const baseline = earlier.length ? earlier.reduce((a, r) => a + r.rate, 0) / earlier.length : null;
      return { rate: latest, baseline, change: baseline ? latest - baseline : null };
    },
  });

  FD.pages.engineering = () => {
    const daily = FD.read('daily_cost', ['cost', 'quantity']);
    const cur = daily.rows.length ? daily.rows[0].currency || 'USD' : 'USD';

    // daily spend by resource group
    const rg = document.getElementById('chart-rg-spend');
    if (FD.visible(rg)) {
      if (daily.status === 'error') FD.chartState(rg, 'error');
      else if (daily.empty) FD.chartState(rg, 'empty', 'Daily spend stacked by resource group, once daily_cost.csv has rows.');
      else {
        const top = new Set(
          Array.from(d3.rollup(daily.rows, (v) => FD.sum(v, 'cost'), (r) => r.resource_group))
            .sort((x, y) => y[1] - x[1])
            .slice(0, 7)
            .map(([k]) => k)
        );
        // An eighth series would be a generated hue, so the tail folds into Other.
        const rows = Array.from(
          d3.rollup(daily.rows, (v) => FD.sum(v, 'cost'), (r) => r.date, (r) => (top.has(r.resource_group) ? r.resource_group : 'Other')),
          ([date, inner]) => Array.from(inner, ([series, value]) => ({ key: date, series, value }))
        ).flat();
        FD.bars(rg, rows, { height: 260, format: (v) => FD.money(v, cur), emptyText: 'Daily spend by resource group.' });
      }
    }

    // daily spend by meter category
    const cat = document.getElementById('chart-category-spend');
    if (FD.visible(cat)) {
      if (daily.status === 'error') FD.chartState(cat, 'error');
      else if (daily.empty) FD.chartState(cat, 'empty', 'Spend by meter category, which is the closest the export gets to resource type.');
      else {
        const rows = Array.from(
          d3.rollup(daily.rows, (v) => FD.sum(v, 'cost'), (r) => r.meter_category),
          ([key, value]) => ({ key, series: 'Spend', value })
        )
          .sort((x, y) => y.value - x.value)
          .slice(0, 12);
        FD.bars(cat, rows, { height: 260, format: (v) => FD.money(v, cur), label: (k) => k, emptyText: 'Spend by meter category.' });
      }
    }

    // input vs output tokens
    const tokens = FD.read('tokens_by_deployment', TOKEN_NUM);
    const split = document.getElementById('chart-token-split');
    if (FD.visible(split)) {
      if (tokens.status === 'error') FD.chartState(split, 'error');
      else if (tokens.empty)
        FD.chartState(split, 'empty', 'Input against output tokens per hour. Output bills at several times input, so the split is the point — a flat total can hide a rising bill.');
      else {
        const rows = [];
        d3.rollup(tokens.rows, (v) => ({ input: FD.sum(v, 'input_tokens'), output: FD.sum(v, 'output_tokens') }), (r) => r.hour).forEach(
          (v, hour) => {
            rows.push({ key: hour, series: 'Input tokens', value: v.input });
            rows.push({ key: hour, series: 'Output tokens', value: v.output });
          }
        );
        rows.sort((a, b) => (a.key < b.key ? -1 : 1));
        FD.bars(split, rows, { height: 260, format: FD.num, label: FD.hourLabel, emptyText: 'Input against output tokens.' });
      }
    }

    // PTU utilization band
    const ptu = FD.read('ptu_utilization', PTU_NUM);
    const band = document.getElementById('chart-ptu-band');
    if (FD.visible(band)) {
      if (ptu.status === 'error') FD.chartState(band, 'error');
      else if (ptu.empty)
        FD.chartState(band, 'empty', 'Average utilization per provisioned deployment, with the 50% and 90% lines drawn. Between them is where PTU earns its cost.');
      else {
        FD.lines(band, ptu.rows.map((r) => ({ t: r.hour, series: r.resource, value: r.avg_util })), {
          height: 260,
          format: (v) => `${d3.format('.0f')(v)}%`,
          timeFormat: '%b %-d %H:%M',
          yMin: 100,
          refs: [
            { value: 90, label: '90% throttling risk' },
            { value: 50, label: '50% over-provisioned below' },
          ],
          emptyText: 'PTU utilization per deployment.',
        });
      }
    }

    // PTU verdicts, straight from the query's own verdict column
    FD.table(
      document.getElementById('table-ptu'),
      ptu.rows.slice().sort((a, b) => (b.avg_util || 0) - (a.avg_util || 0)).slice(0, 20),
      [
        { field: 'resource', th: true },
        { field: 'hour', render: (r) => FD.hourLabel(r.hour) },
        { field: 'avg_util', align: 'right', className: 'fd-numeric', render: (r) => (r.avg_util == null ? '—' : `${d3.format('.1f')(r.avg_util)}%`) },
        { field: 'max_util', align: 'right', className: 'fd-numeric', render: (r) => (r.max_util == null ? '—' : `${d3.format('.1f')(r.max_util)}%`) },
        {
          field: 'verdict',
          tone: (r) => (r.verdict === 'throttling' ? 'bad' : r.verdict === 'saturated' ? 'warn' : r.verdict === 'over-provisioned' ? 'warn' : 'ok'),
        },
      ],
      { keyColumns: ['resource', 'hour'] }
    );

    // cache effectiveness
    const cache = FD.read('cache_effectiveness', CACHE_NUM);
    const latest = dash.data('cache_latest');
    const c = latest.status === 'ok' && latest.data ? latest.data : {};
    FD.setValue('#tile-cache .fd-tile-value', c.rate == null ? '—' : `${d3.format('.1f')(c.rate)}%`);
    FD.setValue(
      '#tile-cache .fd-tile-sub',
      c.change == null ? 'Waiting for data' : `${c.change > 0 ? '+' : ''}${d3.format('.1f')(c.change)} pts against earlier hours`
    );
    const cacheEl = document.querySelector('#tile-cache .fd-tile-sub');
    if (cacheEl) {
      cacheEl.classList.remove('fd-ok', 'fd-bad');
      if (c.change != null) cacheEl.classList.add(c.change < -5 ? 'fd-bad' : 'fd-ok');
    }

    const cacheChart = document.getElementById('chart-cache');
    if (FD.visible(cacheChart)) {
      if (cache.status === 'error') FD.chartState(cacheChart, 'error');
      else if (cache.empty)
        FD.chartState(cacheChart, 'empty', 'Cache match rate per deployment. Read a step down as a cost regression — usually a variable put near the start of a system prompt.');
      else {
        const rows = cache.rows
          .map((r) => ({ t: r.hour, series: r.resource, value: r.reported_cache_rate ?? r.derived_cache_rate }))
          .filter((r) => r.value != null);
        FD.lines(cacheChart, rows, {
          height: 240,
          format: (v) => `${d3.format('.0f')(v)}%`,
          timeFormat: '%b %-d %H:%M',
          yMin: 100,
          emptyText: 'Cache match rate over time.',
        });
      }
    }

    // Retry storms are billable. Two measures on different scales, so two charts
    // on a shared time axis rather than one chart with two y-scales.
    const errors = FD.read('openai_errors', ['requests', 'errors']);
    const errChart = document.getElementById('chart-error-rate');
    if (FD.visible(errChart)) {
      if (errors.status === 'error') FD.chartState(errChart, 'error');
      else if (errors.empty) FD.chartState(errChart, 'empty', 'Error rate per hour across deployments.');
      else {
        const rows = Array.from(
          d3.rollup(errors.rows, (v) => ({ req: FD.sum(v, 'requests'), err: FD.sum(v, 'errors') }), (r) => r.hour),
          ([hour, v]) => ({ t: hour, series: 'Error rate', value: v.req ? (v.err / v.req) * 100 : 0 })
        ).sort((a, b) => (a.t < b.t ? -1 : 1));
        FD.lines(errChart, rows, { height: 200, format: (v) => `${d3.format('.1f')(v)}%`, timeFormat: '%b %-d %H:%M', emptyText: 'Error rate per hour.' });
      }
    }

    const aiSpendChart = document.getElementById('chart-ai-spend-daily');
    if (FD.visible(aiSpendChart)) {
      const ai = FD.read('ai_cost', ['cost']);
      if (ai.status === 'error') FD.chartState(aiSpendChart, 'error');
      else if (ai.empty) FD.chartState(aiSpendChart, 'empty', 'AI meter spend per day, to read beside the error rate above.');
      else {
        const rows = Array.from(
          d3.rollup(ai.rows, (v) => FD.sum(v, 'cost'), (r) => String(r.date).slice(0, 10)),
          ([key, value]) => ({ key, series: 'AI spend', value })
        ).sort((a, b) => (a.key < b.key ? -1 : 1));
        FD.bars(aiSpendChart, rows, { height: 200, format: (v) => FD.money(v, cur), emptyText: 'AI spend per day.' });
      }
    }
  };
})();
