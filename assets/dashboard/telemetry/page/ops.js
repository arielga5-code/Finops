// Dashboard C — Real-time AI operations. Audience: on-call.
// Panels follow docs/04-dashboards.md section C. Everything here is telemetry:
// no cost export supplies it at any grain.
(function () {
  const FD = window.FD;
  const TOKEN_NUM = ['input_tokens', 'output_tokens', 'requests', 'total_tokens'];

  dash.calc('burn_rate', {
    title: 'Token burn, last 6 hours against the 6 before',
    description: 'Tokens in the most recent six hours of telemetry, against the six hours before them.',
    inputs: ['tokens_by_deployment'],
    fn: (tokens_by_deployment) => {
      const hours = Array.from(new Set(tokens_by_deployment.map((r) => r.hour))).sort();
      if (!hours.length) return [{ recent: null, prior: null, change: null, hours: 0 }];
      const recent = hours.slice(-6);
      const prior = hours.slice(-12, -6);
      const total = (set) =>
        tokens_by_deployment
          .filter((r) => set.includes(r.hour))
          .reduce((a, r) => a + (Number(r.total_tokens) || Number(r.input_tokens) + Number(r.output_tokens) || 0), 0);
      const a = total(recent);
      const b = total(prior);
      return [{ recent: a, prior: b || null, change: b ? (a - b) / b : null, hours: recent.length }];
    },
  });

  dash.calc('throttle_rate', {
    title: '429 and quota errors, latest hour',
    description: 'Share of requests answered 429 in the most recent hour of telemetry.',
    inputs: ['openai_errors'],
    fn: (openai_errors) => {
      const hours = Array.from(new Set(openai_errors.map((r) => r.hour))).sort();
      if (!hours.length) return [{ rate: null, requests: null, throttled: null }];
      const latest = hours[hours.length - 1];
      let requests = 0;
      let throttled = 0;
      openai_errors
        .filter((r) => r.hour === latest)
        .forEach((r) => {
          requests += Number(r.requests) || 0;
          if (String(r.status_code) === '429') throttled += Number(r.errors) || 0;
        });
      return [{ hour: latest, requests, throttled, rate: requests ? throttled / requests : null }];
    },
  });

  dash.calc('anomaly_count', {
    title: 'Open anomaly records',
    description: 'Records in the anomaly file scoring 75 or above, the threshold the alert rules in assets/alerts use.',
    inputs: ['ml_anomalies'],
    fn: (ml_anomalies) => {
      const scored = ml_anomalies.map((r) => Number(r.anomaly_score)).filter((v) => isFinite(v));
      const major = scored.filter((v) => v >= 75);
      return [{ total: ml_anomalies.length, major: major.length, max: scored.length ? Math.max.apply(null, scored) : null }];
    },
  });

  FD.pages.operations = () => {
    const burn = dash.data('burn_rate');
    const b = burn.status === 'ok' && Array.isArray(burn.data) && burn.data[0] ? burn.data[0] : {};
    FD.setValue('#tile-burn .fd-tile-value', FD.num(b.recent));
    FD.setValue('#tile-burn .fd-tile-sub', b.change == null ? 'Waiting for data' : `${FD.signedPct(b.change)} against the 6 hours before`);
    const burnEl = document.querySelector('#tile-burn .fd-tile-sub');
    if (burnEl) {
      burnEl.classList.remove('fd-warn', 'fd-ok');
      if (b.change != null) burnEl.classList.add(b.change > 0.5 ? 'fd-warn' : 'fd-ok');
    }

    const throttle = dash.data('throttle_rate');
    const t = throttle.status === 'ok' && Array.isArray(throttle.data) && throttle.data[0] ? throttle.data[0] : {};
    FD.setValue('#tile-throttle .fd-tile-value', FD.pct(t.rate, 2));
    FD.setValue('#tile-throttle .fd-tile-sub', t.requests ? `${FD.num(t.throttled)} of ${FD.num(t.requests)} requests` : 'Waiting for data');
    const throttleEl = document.querySelector('#tile-throttle .fd-tile-value');
    if (throttleEl) {
      throttleEl.classList.remove('fd-bad', 'fd-ok');
      if (t.rate != null) throttleEl.classList.add(t.rate > 0.01 ? 'fd-bad' : 'fd-ok');
    }

    const anomalies = dash.data('anomaly_count');
    const an = anomalies.status === 'ok' && Array.isArray(anomalies.data) && anomalies.data[0] ? anomalies.data[0] : {};
    FD.setValue('#tile-anomalies .fd-tile-value', an.major == null ? '—' : FD.num(an.major));
    FD.setValue('#tile-anomalies .fd-tile-sub', an.max == null ? 'Waiting for data' : `highest score ${d3.format('.0f')(an.max)}`);
    const anEl = document.querySelector('#tile-anomalies .fd-tile-value');
    if (anEl) {
      anEl.classList.remove('fd-bad', 'fd-ok');
      if (an.major != null) anEl.classList.add(an.major > 0 ? 'fd-bad' : 'fd-ok');
    }

    // token burn per deployment, last 12 hours of whatever the file holds
    const tokens = FD.read('tokens_by_deployment', TOKEN_NUM);
    const burnChart = document.getElementById('chart-burn');
    if (FD.visible(burnChart)) {
      if (tokens.status === 'error') FD.chartState(burnChart, 'error');
      else if (tokens.empty)
        FD.chartState(burnChart, 'empty', 'Tokens per hour per deployment. On a 5-minute timegrain this is the only signal that catches a runaway workload before it bills.');
      else {
        const hours = Array.from(new Set(tokens.rows.map((r) => r.hour))).sort().slice(-12);
        const rows = tokens.rows
          .filter((r) => hours.includes(r.hour))
          .map((r) => ({ t: r.hour, series: r.resource, value: r.total_tokens ?? (r.input_tokens || 0) + (r.output_tokens || 0) }));
        FD.lines(burnChart, rows, { height: 260, format: FD.num, timeFormat: '%H:%M', tipFormat: '%b %-d %H:%M', emptyText: 'Tokens per hour per deployment.' });
      }
    }

    // PTU live
    const ptu = FD.read('ptu_utilization', ['avg_util', 'max_util', 'min_util']);
    const ptuChart = document.getElementById('chart-ptu-live');
    if (FD.visible(ptuChart)) {
      if (ptu.status === 'error') FD.chartState(ptuChart, 'error');
      else if (ptu.empty) FD.chartState(ptuChart, 'empty', 'Live PTU utilization, with the 90% throttling line drawn.');
      else {
        const hours = Array.from(new Set(ptu.rows.map((r) => r.hour))).sort().slice(-12);
        FD.lines(
          ptuChart,
          ptu.rows.filter((r) => hours.includes(r.hour)).map((r) => ({ t: r.hour, series: r.resource, value: r.avg_util })),
          {
            height: 260,
            format: (v) => `${d3.format('.0f')(v)}%`,
            timeFormat: '%H:%M',
            tipFormat: '%b %-d %H:%M',
            yMin: 100,
            refs: [{ value: 90, label: '90% throttling risk' }],
            emptyText: 'Live PTU utilization.',
          }
        );
      }
    }

    // 429 rate over time
    const errors = FD.read('openai_errors', ['requests', 'errors']);
    const throttleChart = document.getElementById('chart-throttle');
    if (FD.visible(throttleChart)) {
      if (errors.status === 'error') FD.chartState(throttleChart, 'error');
      else if (errors.empty) FD.chartState(throttleChart, 'empty', 'The 429 share per hour. A retry storm bills twice: once for the retries, once for the tokens.');
      else {
        const rows = Array.from(
          d3.rollup(
            errors.rows,
            (v) => ({ req: FD.sum(v, 'requests'), throttled: d3.sum(v, (r) => (String(r.status_code) === '429' ? r.errors || 0 : 0)) }),
            (r) => r.hour
          ),
          ([hour, v]) => ({ t: hour, series: '429 share', value: v.req ? (v.throttled / v.req) * 100 : 0 })
        ).sort((a, b) => (a.t < b.t ? -1 : 1));
        FD.lines(throttleChart, rows, {
          height: 220,
          format: (v) => `${d3.format('.2f')(v)}%`,
          timeFormat: '%H:%M',
          tipFormat: '%b %-d %H:%M',
          emptyText: 'The 429 share per hour.',
        });
      }
    }

    // active anomalies
    const anomalyRows = FD.read('ml_anomalies', ['actual', 'typical', 'anomaly_score']);
    FD.table(
      document.getElementById('table-anomalies'),
      anomalyRows.rows.slice().sort((a, b) => (b.anomaly_score || 0) - (a.anomaly_score || 0)).slice(0, 20),
      [
        { field: 'time', th: true, render: (r) => FD.hourLabel(r.time) },
        { field: 'job_id' },
        { field: 'resource' },
        { field: 'actual', align: 'right', className: 'fd-numeric', render: (r) => FD.num(r.actual) },
        { field: 'typical', align: 'right', className: 'fd-numeric', render: (r) => FD.num(r.typical) },
        {
          field: 'anomaly_score',
          align: 'right',
          className: 'fd-numeric',
          render: (r) => (r.anomaly_score == null ? '—' : d3.format('.0f')(r.anomaly_score)),
          tone: (r) => (r.anomaly_score >= 75 ? 'bad' : r.anomaly_score >= 50 ? 'warn' : null),
        },
      ],
      { keyColumns: ['time', 'job_id'] }
    );
  };
})();
