// Overview, Where it goes and AI tabs. Real figures from the May to July 2026
// Azure EA cost report (enrollment 51378402). Two bases appear here and are never
// blended: invoiced totals, and consumption cost in the breakdown tables.
(function () {
  const FD = window.FD;
  const USD = 'USD';

  // ---- calculations (each returns rows, so a single figure can be cited as a cell) ----
  dash.calc('headline', {
    title: 'Invoiced spend, May to July',
    description: 'Invoiced totals summed over the three months, July against June and against May, and the three-month total of the AI and data platform lines.',
    inputs: ['invoiced_months', 'ai_platforms'],
    fn: (invoiced_months, ai_platforms) => {
      const by = {};
      invoiced_months.forEach((r) => { by[r.month] = Number(r.invoiced); });
      const total = invoiced_months.reduce((a, r) => a + Number(r.invoiced), 0);
      return [{
        total,
        may: by.May,
        jun: by.Jun,
        jul: by.Jul,
        jul_change: by.Jun ? (by.Jul - by.Jun) / by.Jun : null,
        may_to_jul: by.May ? (by.Jul - by.May) / by.May : null,
        ai_total: ai_platforms.reduce((a, r) => a + (Number(r.total) || 0), 0),
      }];
    },
  });

  dash.calc('reconciliation', {
    title: 'Invoiced total against the breakdown tables',
    description: 'The breakdown tables sum to more than the invoiced total. Databricks consumption that was pre-purchased and not invoiced explains part of the gap. The files do not explain the rest.',
    inputs: ['invoiced_months', 'by_service', 'ai_drivers'],
    fn: (invoiced_months, by_service, ai_drivers) => {
      const invoiced = invoiced_months.reduce((a, r) => a + Number(r.invoiced), 0);
      const breakdown = by_service.reduce((a, r) => a + Number(r.total), 0);
      const dbu = ai_drivers
        .filter((r) => String(r.charge).indexOf('Pre-purchased') === 0)
        .reduce((a, r) => a + Number(r.consumed_3mo), 0);
      return [
        { item: 'Invoiced total', amount: invoiced, note: 'Azure Cost Management invoices, three months' },
        { item: 'Breakdown tables total', amount: breakdown, note: 'Subscription, service, cost centre and project tables each add up to this' },
        { item: 'Gap', amount: breakdown - invoiced, note: 'Consumption cost above what was invoiced' },
        { item: 'Databricks, pre-purchased', amount: dbu, note: 'Consumed against a prepaid balance, never invoiced' },
        { item: 'Not explained by the files', amount: breakdown - invoiced - dbu, note: 'Left over after the Databricks line' },
      ];
    },
  });

  dash.calc('untagged_share', {
    title: 'Spend with no project tag, by month',
    description: 'The untagged project line over the sum of all project lines, for each month.',
    inputs: ['by_project'],
    fn: (by_project) => {
      const untagged = by_project.filter((r) => r.project === '(untagged)')[0];
      return ['may', 'jun', 'jul'].map((m) => {
        const total = by_project.reduce((a, r) => a + (Number(r[m]) || 0), 0);
        const un = untagged ? Number(untagged[m]) || 0 : 0;
        return { month: m.charAt(0).toUpperCase() + m.slice(1), untagged: un, total, share: total ? un / total : null };
      });
    },
  });

  // ---- ranked list ----------------------------------------------------------
  // items: [{label, value, sub, tag, color}]  Bars share one scale from zero.
  FD.rank = (el, items, opts) => {
    const o = Object.assign({ emptyText: 'Nothing to rank yet.' }, opts);
    el.classList.remove('dash-skeleton');
    el.replaceChildren();
    if (!items.length) return FD.chartState(el, 'empty', o.emptyText);
    const max = d3.max(items, (i) => Math.abs(i.value)) || 1;
    items.forEach((i) => {
      const row = document.createElement('div');
      row.className = 'fd-rank';
      const head = document.createElement('div');
      head.className = 'fd-rank-head';
      const label = document.createElement('span');
      label.className = 'fd-rank-label';
      label.textContent = i.label;
      head.append(label);
      if (i.tag) {
        const tag = document.createElement('span');
        tag.className = 'fd-rank-vendor';
        tag.textContent = i.tag;
        head.append(tag);
      }
      const value = document.createElement('span');
      value.className = 'fd-rank-value';
      value.textContent = i.valueText || FD.money(i.value, USD);
      head.append(value);
      row.append(head);
      const track = document.createElement('div');
      track.className = 'fd-rank-track';
      const fill = document.createElement('div');
      fill.className = 'fd-rank-fill';
      fill.style.width = `${Math.max(2, (Math.abs(i.value) / max) * 100)}%`;
      fill.style.background = i.color || dash.colors[0];
      track.append(fill);
      row.append(track);
      if (i.sub) {
        const sub = document.createElement('div');
        sub.className = 'fd-rank-note';
        sub.textContent = i.sub;
        row.append(sub);
      }
      el.append(row);
    });
    return true;
  };

  const monthsText = (r) => `May ${FD.money(r.may, USD)} · Jun ${FD.money(r.jun, USD)} · Jul ${FD.money(r.jul, USD)}`;
  const delta = (v) => (v == null ? '' : ` · ${FD.signedPct(v / 100)} May to Jul`);
  const num = ['may', 'jun', 'jul', 'total'];

  // Draw a ranked list for a table of monthly rows, or its failure/empty state.
  const monthlyRank = (id, datasetId, mapper, limit, emptyText) => {
    const el = document.getElementById(id);
    if (!FD.visible(el)) return;
    const d = FD.read(datasetId, num.concat(['change_pct', 'share_pct', 'ai', 'non_ai', 'ai_share_pct']));
    if (d.status === 'error') return FD.chartState(el, 'error');
    if (d.empty) return FD.chartState(el, 'empty', emptyText);
    const rows = d.rows.slice().sort((a, b) => b.total - a.total);
    const shown = limit ? rows.slice(0, limit) : rows;
    FD.rank(el, shown.map(mapper));
    if (limit && rows.length > limit) {
      const more = document.createElement('p');
      more.className = 'fd-source';
      more.textContent = `Showing the ${limit} largest of ${rows.length}.`;
      el.append(more);
    }
  };

  // ---- Overview -------------------------------------------------------------
  FD.pages.overview = () => {
    const h = dash.data('headline');
    const r0 = h.status === 'ok' && Array.isArray(h.data) && h.data[0] ? h.data[0] : {};
    FD.setValue('#tile-inv-total .fd-tile-value', FD.money(r0.total, USD));
    FD.setValue('#tile-inv-total .fd-tile-sub', r0.total == null ? 'Waiting for data' : 'Invoiced, May to July 2026');
    FD.setValue('#tile-inv-jul .fd-tile-value', FD.money(r0.jul, USD));
    FD.setValue('#tile-inv-jul .fd-tile-sub', r0.jul_change == null ? 'Waiting for data' : `${FD.signedPct(r0.jul_change)} on June`);
    const julEl = document.querySelector('#tile-inv-jul .fd-tile-sub');
    if (julEl) { julEl.classList.remove('fd-bad', 'fd-ok'); if (r0.jul_change != null) julEl.classList.add(r0.jul_change > 0.05 ? 'fd-bad' : 'fd-ok'); }
    FD.setValue('#tile-ai-total .fd-tile-value', FD.money(r0.ai_total, USD));
    FD.setValue('#tile-ai-total .fd-tile-sub', r0.ai_total == null ? 'Waiting for data' : 'AI and data platforms, three months');

    const months = document.getElementById('chart-invoiced');
    if (FD.visible(months)) {
      const inv = FD.read('invoiced_months', ['invoiced']);
      if (inv.status === 'error') FD.chartState(months, 'error');
      else if (inv.empty) FD.chartState(months, 'empty', 'Invoiced spend per month.');
      else FD.bars(months, inv.rows.map((r) => ({ key: r.month, series: 'Invoiced', value: r.invoiced })), {
        height: 240, format: (v) => FD.money(v, USD), label: (k) => k, emptyText: 'Invoiced spend per month.',
      });
    }

    const rec = dash.data('reconciliation');
    FD.table(
      document.getElementById('table-reconciliation'),
      rec.status === 'ok' && Array.isArray(rec.data) ? rec.data : [],
      [
        { field: 'item', th: true },
        { field: 'amount', align: 'right', className: 'fd-numeric', render: (x) => FD.money(x.amount, USD) },
        { field: 'note' },
      ],
      { keyColumns: ['item'] }
    );

    const tag = document.getElementById('chart-untagged');
    if (FD.visible(tag)) {
      const u = dash.data('untagged_share');
      const rows = u.status === 'ok' && Array.isArray(u.data) ? u.data : [];
      if (u.status === 'error') FD.chartState(tag, 'error');
      else if (!rows.length) FD.chartState(tag, 'empty', 'Share of spend with no project tag, per month.');
      else FD.bars(tag, rows.map((x) => ({ key: x.month, series: 'No project tag', value: x.share * 100 })), {
        height: 220, format: (v) => `${d3.format('.1f')(v)}%`, label: (k) => k, emptyText: 'Untagged share.',
      });
    }
  };

  // ---- Where it goes --------------------------------------------------------
  FD.pages.where = () => {
    monthlyRank('rank-subscription', 'by_subscription',
      (r) => ({ label: r.subscription, value: r.total, sub: `${monthsText(r)}${delta(r.change_pct)}${r.ai_share_pct == null ? '' : ` · ${d3.format('.1f')(r.ai_share_pct)}% AI`}` }),
      null, 'Spend by subscription.');
    monthlyRank('rank-service', 'by_service',
      (r) => ({ label: r.service, value: r.total, sub: `${monthsText(r)}${delta(r.change_pct)}` }),
      null, 'Spend by service.');
    monthlyRank('rank-cost-centre', 'by_cost_centre',
      (r) => ({ label: r.cost_centre, value: r.total, sub: `${monthsText(r)}${r.ai ? ` · AI ${FD.money(r.ai, USD)}` : ''}`, color: r.cost_centre === '(untagged)' ? 'var(--cds-chart-status-critical)' : undefined }),
      null, 'Spend by cost centre.');
    monthlyRank('rank-project', 'by_project',
      (r) => ({ label: r.project, value: r.total, sub: `${monthsText(r)}${r.ai ? ` · AI ${FD.money(r.ai, USD)}` : ''}`, color: r.project === '(untagged)' ? 'var(--cds-chart-status-critical)' : undefined }),
      10, 'Spend by project.');

    const movers = document.getElementById('rank-movers');
    if (FD.visible(movers)) {
      const d = FD.read('meter_movers', ['may', 'jun', 'jul', 'change_usd', 'change_pct']);
      if (d.status === 'error') FD.chartState(movers, 'error');
      else if (d.empty) FD.chartState(movers, 'empty', 'Largest changes by meter category.');
      else {
        FD.rank(movers, d.rows.slice().sort((a, b) => b.change_usd - a.change_usd).map((r) => ({
          label: r.meter_category,
          value: r.change_usd,
          valueText: `${r.change_usd > 0 ? '+' : ''}${FD.money(r.change_usd, USD)}`,
          sub: `May ${FD.money(r.may, USD)} → Jul ${FD.money(r.jul, USD)}${r.shape ? ` · ${r.shape}` : ''}`,
          color: r.change_usd < 0 ? 'var(--cds-chart-muted)' : undefined,
        })));
      }
    }
  };

  // ---- AI -------------------------------------------------------------------
  FD.pages.ai = () => {
    const chart = document.getElementById('chart-ai-platforms');
    if (FD.visible(chart)) {
      const d = FD.read('ai_platforms', ['may', 'jun', 'jul', 'total', 'change_pct']);
      if (d.status === 'error') FD.chartState(chart, 'error');
      else if (d.empty) FD.chartState(chart, 'empty', 'AI and data platform spend per month.');
      else {
        const rows = [];
        ['may', 'jun', 'jul'].forEach((m) => d.rows.forEach((r) =>
          rows.push({ key: m.charAt(0).toUpperCase() + m.slice(1), series: r.platform, value: r[m] })));
        FD.bars(chart, rows, { height: 260, format: (v) => FD.money(v, USD), label: (k) => k, emptyText: 'AI platform spend per month.' });
      }
    }

    const drivers = document.getElementById('rank-ai-drivers');
    if (FD.visible(drivers)) {
      const d = FD.read('ai_drivers', ['consumed_3mo', 'share_pct']);
      if (d.status === 'error') FD.chartState(drivers, 'error');
      else if (d.empty) FD.chartState(drivers, 'empty', 'Largest AI cost drivers.');
      else FD.rank(drivers, d.rows.slice().sort((a, b) => b.consumed_3mo - a.consumed_3mo).map((r) => ({
        label: r.service,
        value: r.consumed_3mo,
        tag: r.charge,
        sub: `${d3.format('.1f')(r.share_pct)}% of AI consumption`,
        color: String(r.charge).indexOf('Pre-purchased') === 0 ? 'var(--cds-chart-muted)' : undefined,
      })));
    }

    const factory = document.getElementById('rank-aifactory');
    if (FD.visible(factory)) {
      const d = FD.read('aifactory', ['may', 'jun', 'jul', 'total', 'share_pct']);
      if (d.status === 'error') FD.chartState(factory, 'error');
      else if (d.empty) FD.chartState(factory, 'empty', 'AIFactory infrastructure against AI.');
      else {
        FD.rank(factory, d.rows.slice().sort((a, b) => b.total - a.total).map((r) => ({
          label: r.meter_category,
          value: r.total,
          tag: r.kind,
          sub: monthsText(r),
          color: r.kind === 'AI' ? dash.colors[0] : dash.colors[1],
        })));
        FD.legend(factory, [['AI', dash.colors[0]], ['Infrastructure', dash.colors[1]]]);
      }
    }
  };
})();
