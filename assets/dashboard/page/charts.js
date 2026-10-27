// Shared drawing helpers for the three FinOps dashboards.
// Everything the page modules share hangs off window.FD.
(function () {
  const FD = (window.FD = { pages: {} });

  // ---- formatting -----------------------------------------------------------
  const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

  FD.money = (v, cur) => {
    if (v == null || !isFinite(v)) return '—';
    const sign = v < 0 ? '-' : '';
    const n = Math.abs(v);
    const body = n >= 10000 ? compact.format(n) : d3.format(',.2f')(n);
    return `${sign}${cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : '$'}${body}`;
  };
  FD.num = (v) => (v == null || !isFinite(v) ? '—' : Math.abs(v) >= 10000 ? compact.format(v) : d3.format(',')(v));
  FD.pct = (v, digits) => (v == null || !isFinite(v) ? '—' : d3.format(`.${digits == null ? 1 : digits}%`)(v));
  FD.signedPct = (v) => (v == null || !isFinite(v) ? '—' : (v > 0 ? '+' : '') + d3.format('.1%')(v));
  FD.day = (s) => d3.utcFormat('%b %-d')(new Date(s));
  FD.hourLabel = (s) => d3.utcFormat('%b %-d %H:%M')(new Date(s));

  // ---- data access ----------------------------------------------------------
  // Rows arrive from CSV as text; every numeric column is converted here so the
  // drawing code never has to think about it.
  FD.read = (id, numeric) => {
    const d = dash.data(id);
    const rows = d.status === 'ok' && Array.isArray(d.data) ? d.data : [];
    const typed = rows.map((r) => {
      const out = Object.assign({}, r);
      (numeric || []).forEach((k) => {
        const raw = out[k];
        out[k] = raw === '' || raw == null ? null : Number(raw);
      });
      return out;
    });
    return { status: d.status, rows: typed, empty: typed.length === 0, message: d.message, refreshing: d.refreshing };
  };

  FD.sum = (rows, key) => d3.sum(rows, (r) => r[key] || 0);

  // ---- element states -------------------------------------------------------
  FD.setValue = (sel, text) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    el.classList.remove('dash-skeleton');
    el.textContent = text;
  };

  // A chart that would look broken empty gets one muted line under its heading
  // instead of axes drawn over nothing.
  FD.chartState = (el, state, text) => {
    if (!el) return false;
    el.classList.remove('dash-skeleton');
    el.replaceChildren();
    if (state === 'loading') {
      el.classList.add('dash-skeleton');
      return false;
    }
    const note = document.createElement('p');
    note.className = 'fd-chart-note';
    if (state === 'error') {
      note.innerHTML = '<span class="fd-dot"></span>';
      note.append('Failed to load');
      note.classList.add('fd-chart-note--bad');
    } else {
      note.textContent = text;
    }
    el.append(note);
    return false;
  };

  // Returns an SVG ready to draw into, or false when the element should show a
  // state instead. Width comes from the live box so the chart reflows.
  FD.frame = (el, opts) => {
    const o = Object.assign({ height: 220, margin: { top: 12, right: 16, bottom: 28, left: 48 } }, opts);
    const width = Math.max(el.clientWidth || 0, 240);
    el.replaceChildren();
    el.classList.remove('dash-skeleton');
    const svg = d3
      .select(el)
      .append('svg')
      .attr('width', '100%')
      .attr('height', o.height)
      .attr('viewBox', `0 0 ${width} ${o.height}`)
      .attr('role', 'img');
    const g = svg.append('g').attr('transform', `translate(${o.margin.left},${o.margin.top})`);
    return {
      svg,
      g,
      width,
      height: o.height,
      margin: o.margin,
      iw: width - o.margin.left - o.margin.right,
      ih: o.height - o.margin.top - o.margin.bottom,
    };
  };

  // Measure the widest tick as drawn and give the axis exactly that much room,
  // since the data decides how wide a label is.
  FD.fitLeft = (f, scale, format) => {
    const probe = f.svg.append('g').attr('visibility', 'hidden');
    let widest = 0;
    scale.ticks(4).forEach((t) => {
      const node = probe.append('text').attr('class', 'fd-tick').text(format(t)).node();
      widest = Math.max(widest, node.getComputedTextLength());
    });
    probe.remove();
    const left = Math.ceil(widest) + 12;
    if (left !== f.margin.left) {
      f.margin.left = left;
      f.iw = f.width - left - f.margin.right;
      f.g.attr('transform', `translate(${left},${f.margin.top})`);
    }
    return f;
  };

  FD.axisY = (f, scale, format) => {
    const axis = f.g
      .append('g')
      .attr('class', 'fd-axis')
      .call(d3.axisLeft(scale).ticks(4).tickSize(-f.iw).tickFormat(format));
    axis.attr('font-size', null).attr('font-family', null);
    axis.select('.domain').remove();
    axis.selectAll('.tick line').attr('class', 'fd-grid');
    axis.selectAll('.tick text').attr('class', 'fd-tick');
    return axis;
  };

  // Thin out ticks until the labels cannot meet.
  FD.axisX = (f, scale, format, isBand) => {
    const span = isBand ? scale.domain().length : 6;
    const every = Math.max(1, Math.ceil(span / Math.max(2, Math.floor(f.iw / 64))));
    const axis = f.g.append('g').attr('class', 'fd-axis').attr('transform', `translate(0,${f.ih})`);
    if (isBand) {
      axis.call(d3.axisBottom(scale).tickSize(0).tickValues(scale.domain().filter((_, i) => i % every === 0)).tickFormat(format));
    } else {
      axis.call(d3.axisBottom(scale).ticks(Math.max(2, Math.floor(f.iw / 80))).tickSize(0).tickFormat(format));
    }
    axis.attr('font-size', null).attr('font-family', null);
    axis.select('.domain').attr('class', 'fd-axis-line');
    axis.selectAll('.tick text').attr('class', 'fd-tick').attr('dy', '1.1em');
    return axis;
  };

  FD.refLine = (f, scale, value, label) => {
    const y = scale(value);
    f.g.append('line').attr('class', 'fd-ref').attr('x1', 0).attr('x2', f.iw).attr('y1', y).attr('y2', y);
    if (label) {
      f.g.append('text').attr('class', 'fd-ref-label').attr('x', f.iw).attr('y', y - 4).attr('text-anchor', 'end').text(label);
    }
  };

  // ---- tooltip --------------------------------------------------------------
  FD.tip = (el) => {
    let node = el.querySelector('.fd-tip');
    if (!node) {
      node = document.createElement('div');
      node.className = 'fd-tip';
      node.hidden = true;
      el.append(node);
    }
    return {
      show(html, x, y) {
        node.innerHTML = html;
        node.hidden = false;
        const box = el.getBoundingClientRect();
        const own = node.getBoundingClientRect();
        let left = x + 12;
        if (left + own.width > box.width) left = Math.max(0, x - own.width - 12);
        node.style.left = `${left}px`;
        node.style.top = `${Math.max(0, Math.min(y - own.height / 2, box.height - own.height))}px`;
      },
      hide() {
        node.hidden = true;
      },
    };
  };

  FD.tipRow = (color, name, value) =>
    `<div class="fd-tip-row">${color ? `<span class="fd-swatch" style="background:${color}"></span>` : ''}` +
    `<span class="fd-tip-name">${FD.escape(name)}</span><span class="fd-tip-val">${FD.escape(value)}</span></div>`;

  FD.escape = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  FD.legend = (el, items) => {
    const wrap = document.createElement('div');
    wrap.className = 'fd-legend';
    items.forEach(([name, color]) => {
      const item = document.createElement('span');
      item.className = 'fd-legend-item';
      const sw = document.createElement('span');
      sw.className = 'fd-swatch';
      sw.style.background = color;
      item.append(sw);
      item.append(document.createTextNode(name));
      wrap.append(item);
    });
    el.append(wrap);
  };

  // ---- generic bar chart ----------------------------------------------------
  // rows: [{key, series, value}] already shaped by the caller.
  FD.bars = (el, rows, opts) => {
    const o = Object.assign({ height: 220, stacked: true, format: FD.num, label: FD.day }, opts);
    if (!rows.length) return FD.chartState(el, 'empty', o.emptyText);
    const keys = Array.from(new Set(rows.map((r) => r.key)));
    const series = Array.from(new Set(rows.map((r) => r.series)));
    const byKey = new Map(keys.map((k) => [k, new Map()]));
    rows.forEach((r) => byKey.get(r.key).set(r.series, (byKey.get(r.key).get(r.series) || 0) + (r.value || 0)));

    const f = FD.frame(el, { height: o.height });
    const totals = keys.map((k) => d3.sum(series, (s) => byKey.get(k).get(s) || 0));
    const y = d3.scaleLinear([0, Math.max(d3.max(totals) || 0, 1) * 1.08], [f.ih, 0]).nice();
    FD.fitLeft(f, y, o.format);
    const x = d3.scaleBand(keys, [0, f.iw]).padding(keys.length > 40 ? 0.1 : 0.25);
    FD.axisY(f, y, o.format);
    FD.axisX(f, x, o.label, true);

    const color = (s, i) => (series.length === 1 ? dash.colors[0] : dash.colors[i % dash.colors.length]);
    const tip = FD.tip(el);
    const barWidth = Math.min(x.bandwidth(), 32);

    keys.forEach((k) => {
      let acc = 0;
      const cx = x(k) + (x.bandwidth() - barWidth) / 2;
      series.forEach((s, i) => {
        const v = byKey.get(k).get(s);
        if (!v) return;
        const top = y(acc + v);
        const bottom = y(acc);
        acc += v;
        f.g
          .append('rect')
          .attr('x', cx)
          .attr('width', barWidth)
          .attr('y', top)
          // a 2px surface gap keeps stacked segments legible
          .attr('height', Math.max(1, bottom - top - 2))
          .attr('rx', 4)
          .attr('fill', color(s, i))
          .on('pointerenter pointermove', (event) => {
            const [mx, my] = d3.pointer(event, el);
            tip.show(
              `<div class="fd-tip-head">${FD.escape(o.label(k))}</div>` +
                FD.tipRow(series.length === 1 ? null : color(s, i), s, o.format(v)),
              mx,
              my
            );
          })
          .on('pointerleave', tip.hide);
      });
    });

    if (series.length > 1) FD.legend(el, series.map((s, i) => [s, color(s, i)]));
    return true;
  };

  // ---- generic line chart ---------------------------------------------------
  // rows: [{t: Date-able, series, value}]
  FD.lines = (el, rows, opts) => {
    const o = Object.assign({ height: 220, format: FD.num, refs: [], directLabel: true }, opts);
    if (!rows.length) return FD.chartState(el, 'empty', o.emptyText);
    const parsed = rows.map((r) => ({ t: new Date(r.t), series: r.series, value: r.value })).filter((r) => !isNaN(r.t) && r.value != null);
    if (!parsed.length) return FD.chartState(el, 'empty', o.emptyText);
    const series = Array.from(new Set(parsed.map((r) => r.series)));

    const f = FD.frame(el, { height: o.height, margin: { top: 12, right: o.directLabel && series.length <= 4 ? 76 : 16, bottom: 28, left: 48 } });
    const vmax = Math.max(d3.max(parsed, (r) => r.value) || 0, o.yMin || 0, ...o.refs.map((r) => r.value));
    const y = d3.scaleLinear([0, vmax * 1.08 || 1], [f.ih, 0]).nice();
    FD.fitLeft(f, y, o.format);
    const x = d3.scaleUtc(d3.extent(parsed, (r) => r.t), [0, f.iw]);
    FD.axisY(f, y, o.format);
    FD.axisX(f, x, d3.utcFormat(o.timeFormat || '%b %-d'), false);
    o.refs.forEach((r) => FD.refLine(f, y, r.value, r.label));

    const color = (i) => (series.length === 1 ? dash.colors[0] : dash.colors[i % dash.colors.length]);
    const line = d3.line().x((d) => x(d.t)).y((d) => y(d.value));

    series.forEach((s, i) => {
      const pts = parsed.filter((r) => r.series === s).sort((a, b) => a.t - b.t);
      f.g.append('path').attr('class', 'fd-line').attr('d', line(pts)).attr('stroke', color(i));
      const last = pts[pts.length - 1];
      if (last) {
        f.g.append('circle').attr('class', 'fd-endpoint').attr('cx', x(last.t)).attr('cy', y(last.value)).attr('r', 3.5).attr('fill', color(i));
        if (o.directLabel && series.length <= 4) {
          f.g
            .append('text')
            .attr('class', 'fd-end-label')
            .attr('x', x(last.t) + 8)
            .attr('y', y(last.value))
            .attr('dy', '0.32em')
            .attr('fill', color(i))
            .text(series.length === 1 ? o.format(last.value) : `${s} ${o.format(last.value)}`);
        }
      }
    });

    // crosshair + tooltip across every series at the hovered time
    const tip = FD.tip(el);
    const times = Array.from(new Set(parsed.map((r) => +r.t))).sort((a, b) => a - b);
    const rule = f.g.append('line').attr('class', 'fd-crosshair').attr('y1', 0).attr('y2', f.ih).attr('visibility', 'hidden');
    f.svg
      .append('rect')
      .attr('x', f.margin.left)
      .attr('y', f.margin.top)
      .attr('width', Math.max(0, f.iw))
      .attr('height', Math.max(0, f.ih))
      .attr('fill', 'transparent')
      .on('pointerenter pointermove', (event) => {
        const [mx, my] = d3.pointer(event, el);
        const t0 = x.invert(mx - f.margin.left);
        const t = times.reduce((a, b) => (Math.abs(b - t0) < Math.abs(a - t0) ? b : a), times[0]);
        rule.attr('visibility', 'visible').attr('x1', x(new Date(t))).attr('x2', x(new Date(t)));
        const at = parsed.filter((r) => +r.t === t);
        tip.show(
          `<div class="fd-tip-head">${FD.escape(d3.utcFormat(o.tipFormat || o.timeFormat || '%b %-d')(new Date(t)))}</div>` +
            series
              .map((s, i) => {
                const hit = at.find((r) => r.series === s);
                return hit ? FD.tipRow(series.length === 1 ? null : color(i), s, o.format(hit.value)) : '';
              })
              .join(''),
          mx,
          my
        );
      })
      .on('pointerleave', () => {
        rule.attr('visibility', 'hidden');
        tip.hide();
      });

    if (series.length > 1) FD.legend(el, series.map((s, i) => [s, color(i)]));
    return true;
  };

  // ---- table ----------------------------------------------------------------
  // Writes words only: every body cell is its own citation, so no per-cell marks.
  FD.table = (tableEl, rows, columns, opts) => {
    const o = Object.assign({ emptyText: 'No rows yet.', keyColumns: [] }, opts);
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;
    tbody.replaceChildren();
    tableEl.classList.toggle('fd-table--empty', rows.length === 0);
    const note = tableEl.parentElement.querySelector('.fd-table-empty');
    if (note) note.hidden = rows.length > 0;
    if (!rows.length) return;
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      if (o.keyColumns.length) {
        tr.dataset.key = o.keyColumns.map((c) => encodeURIComponent(row[c] == null ? '' : row[c])).join(',');
      }
      columns.forEach((col) => {
        const cell = document.createElement(col.th ? 'th' : 'td');
        if (col.th) cell.scope = 'row';
        if (col.align) cell.style.textAlign = col.align;
        if (col.className) cell.className = col.className;
        const value = col.render ? col.render(row) : row[col.field];
        cell.textContent = value == null || value === '' ? '—' : value;
        if (col.tone) {
          const tone = col.tone(row);
          if (tone) cell.classList.add(`fd-${tone}`);
        }
        tr.append(cell);
      });
      tbody.append(tr);
    });
  };

  FD.visible = (el) => !!el && !el.hidden && el.offsetParent !== null && el.clientWidth > 0;
})();
