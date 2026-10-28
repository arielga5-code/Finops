// Dashboard D — Savings. Filled from the July 2026 recommendations workbook.
// Opportunities are estimates from that workbook, not measured spend.
(function () {
  const FD = window.FD;

  dash.calc('savings_summary', {
    title: 'Azure annual savings identified',
    description:
      'Sum of the Azure lines in the recommendations summary that state an amount. The 1-year reserved instance line is left out because it is an alternative to the 3-year line, not an addition. Overlaps between the remaining lines are not netted out, so read it as an upper bound.',
    inputs: ['savings_opportunities'],
    fn: (savings_opportunities) => {
      const lines = savings_opportunities
        .map((r) => ({ vendor: r.vendor, description: r.description, amount: r.annual_savings === '' ? null : Number(r.annual_savings) }))
        .filter((r) => r.amount != null && isFinite(r.amount));
      const azure = lines.filter((r) => r.vendor === 'Azure' && r.description !== 'RI 1Y Purchase');
      const top = azure.slice().sort((a, b) => b.amount - a.amount)[0];
      return [{
        total: azure.reduce((a, r) => a + r.amount, 0),
        lines: azure.length,
        top_description: top ? top.description : null,
        top_amount: top ? top.amount : null,
      }];
    },
  });

  dash.calc('reservation_summary', {
    title: 'Reservations needing attention',
    description: 'Reservations whose status is Expiring, and the exchange saving listed across all reservations.',
    inputs: ['reservations'],
    fn: (reservations) => [{
      expiring: reservations.filter((r) => r.status === 'Expiring').length,
      total: reservations.length,
      exchange: reservations.reduce((a, r) => a + (Number(r.potential_exchange_saving) || 0), 0),
    }],
  });

  const rankList = (el, rows) => {
    el.classList.remove('dash-skeleton');
    el.replaceChildren();
    if (!rows.length) return FD.chartState(el, 'empty', 'Ranked annual savings by opportunity.');
    const sorted = rows.slice().sort((a, b) => (b.annual_savings == null ? -1 : b.annual_savings) - (a.annual_savings == null ? -1 : a.annual_savings));
    const max = d3.max(sorted, (r) => r.annual_savings || 0) || 1;
    sorted.forEach((r) => {
      const item = document.createElement('div');
      item.className = 'fd-rank';
      const head = document.createElement('div');
      head.className = 'fd-rank-head';
      const label = document.createElement('span');
      label.className = 'fd-rank-label';
      label.textContent = r.description;
      const vendor = document.createElement('span');
      vendor.className = 'fd-rank-vendor';
      vendor.textContent = r.vendor;
      const value = document.createElement('span');
      value.className = 'fd-rank-value';
      value.textContent = r.annual_savings == null ? 'no figure' : FD.money(r.annual_savings, 'USD');
      head.append(label, vendor, value);
      item.append(head);
      if (r.annual_savings != null) {
        const track = document.createElement('div');
        track.className = 'fd-rank-track';
        const fill = document.createElement('div');
        fill.className = 'fd-rank-fill';
        fill.style.width = `${Math.max(2, (r.annual_savings / max) * 100)}%`;
        // The alternative RI line gets the muted color so it reads as not additive.
        fill.style.background = r.description === 'RI 1Y Purchase' ? 'var(--cds-chart-muted)' : dash.colors[0];
        track.append(fill);
        item.append(track);
      }
      if (r.note) {
        const note = document.createElement('div');
        note.className = 'fd-rank-note';
        note.textContent = r.note;
        item.append(note);
      }
      el.append(item);
    });
  };

  FD.pages.savings = () => {
    const sum = dash.data('savings_summary');
    const s = sum.status === 'ok' && Array.isArray(sum.data) && sum.data[0] ? sum.data[0] : {};
    FD.setValue('#tile-sav-total .fd-tile-value', FD.money(s.total, 'USD'));
    FD.setValue('#tile-sav-total .fd-tile-sub', s.lines ? `${s.lines} Azure lines, overlaps not netted out` : 'Waiting for data');
    FD.setValue('#tile-sav-top .fd-tile-value', FD.money(s.top_amount, 'USD'));
    FD.setValue('#tile-sav-top .fd-tile-sub', s.top_description || 'Waiting for data');

    const res = dash.data('reservation_summary');
    const r = res.status === 'ok' && Array.isArray(res.data) && res.data[0] ? res.data[0] : {};
    FD.setValue('#tile-sav-res .fd-tile-value', r.total == null ? '—' : FD.num(r.expiring));
    FD.setValue('#tile-sav-res .fd-tile-sub', r.total == null ? 'Waiting for data' : `of ${r.total} reservations, ${FD.money(r.exchange, 'USD')} possible exchange saving`);
    const resEl = document.querySelector('#tile-sav-res .fd-tile-value');
    if (resEl) {
      resEl.classList.remove('fd-warn', 'fd-ok');
      if (r.total != null) resEl.classList.add(r.expiring > 0 ? 'fd-warn' : 'fd-ok');
    }

    const opp = FD.read('savings_opportunities', ['annual_savings']);
    const list = document.getElementById('list-savings');
    if (FD.visible(list)) {
      if (opp.status === 'error') FD.chartState(list, 'error');
      else rankList(list, opp.rows);
    }

    FD.table(
      document.getElementById('table-reservations'),
      FD.read('reservations', ['quantity', 'util_1d', 'util_7d', 'util_30d', 'monthly_amortized', 'potential_exchange_saving']).rows,
      [
        { field: 'name', th: true },
        { field: 'status', tone: (x) => (x.status === 'Expiring' ? 'warn' : null) },
        { field: 'expiration_date' },
        { field: 'product' },
        { field: 'util_30d', align: 'right', className: 'fd-numeric', render: (x) => (x.util_30d == null ? '—' : `${x.util_30d}%`), tone: (x) => (x.util_30d != null && x.util_30d < 80 ? 'warn' : null) },
        { field: 'monthly_amortized', align: 'right', className: 'fd-numeric', render: (x) => FD.money(x.monthly_amortized, 'USD') },
        { field: 'potential_exchange_saving', align: 'right', className: 'fd-numeric', render: (x) => FD.money(x.potential_exchange_saving, 'USD') },
      ],
      { keyColumns: ['reservation_id'] }
    );

    const disks = FD.read('idle_disks', ['monthly_cost', 'yearly_saving', 'size_gib']);
    FD.table(
      document.getElementById('table-disks'),
      disks.rows.slice().sort((a, b) => (b.yearly_saving || 0) - (a.yearly_saving || 0)),
      [
        { field: 'disk_name', th: true },
        { field: 'disk_state', tone: (x) => (x.disk_state === 'Unattached' ? 'warn' : null) },
        { field: 'subscription' },
        { field: 'storage_type' },
        { field: 'size_gib', align: 'right', className: 'fd-numeric', render: (x) => FD.num(x.size_gib) },
        { field: 'monthly_cost', align: 'right', className: 'fd-numeric', render: (x) => FD.money(x.monthly_cost, 'USD') },
        { field: 'yearly_saving', align: 'right', className: 'fd-numeric', render: (x) => FD.money(x.yearly_saving, 'USD') },
      ],
      { keyColumns: ['disk_name'] }
    );

    FD.table(
      document.getElementById('table-asp'),
      FD.read('app_service_plans', ['monthly_cost', 'ri_1y_annual_saving', 'ri_3y_annual_saving']).rows,
      [
        { field: 'name', th: true },
        { field: 'pricing_tier' },
        { field: 'os' },
        { field: 'monthly_cost', align: 'right', className: 'fd-numeric', render: (x) => FD.money(x.monthly_cost, 'USD') },
        { field: 'ri_1y_annual_saving', align: 'right', className: 'fd-numeric', render: (x) => FD.money(x.ri_1y_annual_saving, 'USD') },
        { field: 'ri_3y_annual_saving', align: 'right', className: 'fd-numeric', render: (x) => FD.money(x.ri_3y_annual_saving, 'USD') },
      ],
      { keyColumns: ['name'] }
    );
  };
})();
