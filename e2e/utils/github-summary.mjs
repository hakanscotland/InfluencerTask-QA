import fs from 'node:fs';
import path from 'node:path';

const reportsDir = path.resolve('e2e/reports');
const cucumberJsonPath = path.join(reportsDir, 'cucumber-report.json');
const markdownSummaryPath = path.join(reportsDir, 'report-summary.md');
const htmlReportPath = path.join(reportsDir, 'index.html');

function durationMs(nanos = 0) {
  return Math.round(nanos / 1_000_000);
}

function formatDuration(ms = 0) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}m ${rest}s`;
}

function statusForScenario(scenario) {
  const failedStep = scenario.steps?.find(step => step.result?.status === 'failed');
  if (failedStep) return 'failed';
  const undefinedStep = scenario.steps?.find(step => step.result?.status === 'undefined');
  if (undefinedStep) return 'undefined';
  const skippedStep = scenario.steps?.find(step => step.result?.status === 'skipped');
  if (skippedStep) return 'skipped';
  return 'passed';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function slug(value, fallback = 'item') {
  const safe = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return safe || fallback;
}

function loadReport() {
  if (!fs.existsSync(cucumberJsonPath)) {
    return { features: [], scenarios: [], missing: true };
  }

  const rawFeatures = JSON.parse(fs.readFileSync(cucumberJsonPath, 'utf8'));
  const features = rawFeatures.map((feature, featureIndex) => {
    const featureId = `feature-${featureIndex}-${slug(feature.name, 'feature')}`;
    const scenarios = (feature.elements ?? [])
      .filter(element => element.type === 'scenario')
      .map((scenario, scenarioIndex) => {
        const steps = (scenario.steps ?? []).map(step => ({
          keyword: step.keyword?.trim() ?? '',
          name: step.name ?? '',
          status: step.result?.status ?? 'unknown',
          duration: durationMs(step.result?.duration),
          error: step.result?.error_message ?? '',
        }));
        const status = statusForScenario(scenario);
        const failedStep = steps.find(step => step.status === 'failed' || step.status === 'undefined');
        return {
          id: `${featureId}-scenario-${scenarioIndex}-${slug(scenario.name, 'scenario')}`,
          feature: feature.name,
          name: scenario.name,
          tags: (scenario.tags ?? []).map(tag => tag.name),
          status,
          duration: steps.reduce((total, step) => total + step.duration, 0),
          failedStep: failedStep?.name ?? '',
          error: failedStep?.error ?? '',
          steps,
        };
      });

    return {
      id: featureId,
      name: feature.name,
      uri: feature.uri ?? '',
      scenarios,
    };
  });

  return {
    features,
    scenarios: features.flatMap(feature => feature.scenarios),
    missing: false,
  };
}

function countsFor(scenarios) {
  const counts = { passed: 0, failed: 0, skipped: 0, undefined: 0, unknown: 0 };
  for (const scenario of scenarios) {
    counts[scenario.status] = (counts[scenario.status] ?? 0) + 1;
  }
  counts.total = scenarios.length;
  counts.passRate = counts.total ? Math.round((counts.passed / counts.total) * 100) : 0;
  counts.duration = scenarios.reduce((total, scenario) => total + scenario.duration, 0);
  return counts;
}

function buildMarkdown(data) {
  if (data.missing) {
    return [
      '# E2E Test Report',
      '',
      `Cucumber JSON report was not found at \`${cucumberJsonPath}\`.`,
    ].join('\n');
  }

  const counts = countsFor(data.scenarios);
  const failedScenarios = data.scenarios.filter(scenario => scenario.status === 'failed' || scenario.status === 'undefined');
  const lines = [
    '# E2E Test Report',
    '',
    `**Result:** ${failedScenarios.length ? 'Failed' : 'Passed'}`,
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Total scenarios | ${counts.total} |`,
    `| Passed | ${counts.passed} |`,
    `| Failed | ${counts.failed} |`,
    `| Skipped | ${counts.skipped} |`,
    `| Undefined | ${counts.undefined} |`,
    `| Unknown | ${counts.unknown} |`,
    `| Pass rate | ${counts.passRate}% |`,
    `| Duration | ${formatDuration(counts.duration)} |`,
    '',
    '## Navigable HTML Report',
    '',
    '- Download the `e2e-cucumber-report-*` artifact and open `index.html`.',
    '- The original Cucumber HTML report is also included as `cucumber-report.html`.',
  ];

  if (failedScenarios.length) {
    lines.push('', '## Failures', '', '| Feature | Scenario | Step | Status |', '| --- | --- | --- | --- |');
    for (const scenario of failedScenarios.slice(0, 25)) {
      lines.push(`| ${escapeCell(scenario.feature)} | ${escapeCell(scenario.name)} | ${escapeCell(scenario.failedStep)} | ${scenario.status} |`);
    }
  }

  lines.push('', '## Feature Summary', '', '| Feature | Passed | Failed | Skipped | Undefined | Unknown |', '| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const feature of data.features) {
    const featureCounts = countsFor(feature.scenarios);
    lines.push(`| ${escapeCell(feature.name)} | ${featureCounts.passed} | ${featureCounts.failed} | ${featureCounts.skipped} | ${featureCounts.undefined} | ${featureCounts.unknown} |`);
  }

  return `${lines.join('\n')}\n`;
}

function statusBadge(status) {
  return `<span class="badge ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}

function buildHtml(data) {
  if (data.missing) {
    return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>E2E Test Report</title></head>
<body><h1>E2E Test Report</h1><p>Cucumber JSON report was not found.</p></body>
</html>`;
  }

  const counts = countsFor(data.scenarios);
  const failedScenarios = data.scenarios.filter(scenario => scenario.status === 'failed' || scenario.status === 'undefined');
  const issueCount = counts.failed + counts.undefined;
  const generatedAt = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');

  const navItems = data.features
    .map(feature => {
      const featureCounts = countsFor(feature.scenarios);
      const failedCount = featureCounts.failed + featureCounts.undefined;
      return `<a href="#${feature.id}">
        <span>${escapeHtml(feature.name)}</span>
        <strong>${failedCount ? `${failedCount} fail` : `${featureCounts.passed}/${featureCounts.total}`}</strong>
      </a>`;
    })
    .join('\n');

  const failureRows = failedScenarios.length
    ? failedScenarios.map(scenario => `<tr>
        <td>${escapeHtml(scenario.feature)}</td>
        <td><a href="#${scenario.id}">${escapeHtml(scenario.name)}</a></td>
        <td>${escapeHtml(scenario.failedStep)}</td>
        <td>${statusBadge(scenario.status)}</td>
      </tr>`).join('\n')
    : '<tr><td colspan="4" class="muted">No failures.</td></tr>';

  const featureSections = data.features.map(feature => {
    const featureCounts = countsFor(feature.scenarios);
    const scenarioRows = feature.scenarios.map(scenario => {
      const tags = scenario.tags.length ? scenario.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join(' ') : '<span class="muted">none</span>';
      const stepRows = scenario.steps.map(step => `<tr>
          <td class="step-keyword">${escapeHtml(step.keyword)}</td>
          <td>${escapeHtml(step.name)}</td>
          <td>${statusBadge(step.status)}</td>
          <td>${formatDuration(step.duration)}</td>
        </tr>${step.error ? `<tr><td></td><td colspan="3"><pre>${escapeHtml(step.error)}</pre></td></tr>` : ''}`).join('\n');

      return `<tr id="${scenario.id}" class="scenario-row" data-status="${scenario.status}" data-search="${escapeHtml(`${feature.name} ${scenario.name} ${scenario.tags.join(' ')}`.toLowerCase())}">
        <td>${statusBadge(scenario.status)}</td>
        <td>
          <details ${scenario.status === 'failed' || scenario.status === 'undefined' ? 'open' : ''}>
            <summary>${escapeHtml(scenario.name)}</summary>
            <div class="scenario-meta">
              <span>Duration: ${formatDuration(scenario.duration)}</span>
              <span>Tags: ${tags}</span>
            </div>
            <table class="steps">
              <thead><tr><th>Keyword</th><th>Step</th><th>Status</th><th>Duration</th></tr></thead>
              <tbody>${stepRows}</tbody>
            </table>
          </details>
        </td>
        <td>${formatDuration(scenario.duration)}</td>
      </tr>`;
    }).join('\n');

    return `<section id="${feature.id}" class="feature-card">
      <div class="feature-header">
        <div>
          <h2>${escapeHtml(feature.name)}</h2>
          <p>${escapeHtml(feature.uri)}</p>
        </div>
        <div class="feature-counts">
          <span>${featureCounts.total} scenarios</span>
          <span>${featureCounts.passed} passed</span>
          <span>${featureCounts.failed + featureCounts.undefined} failed</span>
        </div>
      </div>
      <table class="scenarios">
        <thead><tr><th>Status</th><th>Scenario</th><th>Duration</th></tr></thead>
        <tbody>${scenarioRows}</tbody>
      </table>
    </section>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>E2E Test Report</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f8fb;
      --panel: #ffffff;
      --line: #d8e0ea;
      --text: #172033;
      --muted: #65758b;
      --passed: #16833a;
      --failed: #bf1d2d;
      --skipped: #8a5b00;
      --undefined: #7a2fb8;
      --accent: #155eef;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font: 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); min-height: 100vh; }
    aside { position: sticky; top: 0; height: 100vh; overflow: auto; border-right: 1px solid var(--line); background: #132033; color: white; padding: 20px; }
    aside h1 { font-size: 20px; margin: 0 0 4px; }
    aside p { color: #b9c4d4; margin: 0 0 18px; }
    aside nav { display: grid; gap: 6px; }
    aside nav a { display: flex; justify-content: space-between; gap: 12px; border-radius: 8px; padding: 8px 10px; color: #e9eef8; background: rgba(255,255,255,.06); }
    aside nav strong { color: #b9c4d4; white-space: nowrap; }
    main { padding: 28px; max-width: 1400px; width: 100%; }
    .topbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
    .topbar h1 { margin: 0; font-size: 30px; }
    .topbar p { margin: 4px 0 0; color: var(--muted); }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; border: 1px solid var(--line); border-radius: 8px; padding: 0 12px; background: var(--panel); color: var(--text); font-weight: 600; }
    .cards { display: grid; grid-template-columns: repeat(7, minmax(110px, 1fr)); gap: 12px; margin-bottom: 18px; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 14px; }
    .card span { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0; }
    .card strong { display: block; font-size: 24px; margin-top: 4px; }
    .toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 12px; margin-bottom: 18px; }
    .toolbar input { flex: 1 1 320px; min-height: 38px; border: 1px solid var(--line); border-radius: 8px; padding: 0 12px; font: inherit; }
    .toolbar button { min-height: 38px; border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 0 12px; cursor: pointer; }
    .toolbar button.active { background: #172033; border-color: #172033; color: white; }
    .feature-card, .failures { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; margin: 18px 0; overflow: hidden; }
    .feature-header { display: flex; justify-content: space-between; gap: 16px; padding: 16px; border-bottom: 1px solid var(--line); }
    .feature-header h2 { margin: 0; font-size: 20px; }
    .feature-header p { margin: 4px 0 0; color: var(--muted); }
    .feature-counts { display: flex; gap: 8px; flex-wrap: wrap; align-content: start; justify-content: end; }
    .feature-counts span { background: #edf2f7; border-radius: 999px; padding: 4px 8px; color: #334155; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid var(--line); padding: 10px 12px; text-align: left; vertical-align: top; }
    th { background: #f2f5f9; font-size: 12px; text-transform: uppercase; letter-spacing: 0; color: #46566d; }
    tr:last-child td { border-bottom: 0; }
    details summary { cursor: pointer; font-weight: 700; }
    .scenario-meta { display: flex; gap: 16px; flex-wrap: wrap; margin: 8px 0; color: var(--muted); }
    .steps { margin-top: 10px; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    .step-keyword { width: 90px; color: var(--muted); }
    .badge { display: inline-flex; align-items: center; justify-content: center; min-width: 76px; border-radius: 999px; padding: 3px 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .badge.passed { background: #dcfce7; color: var(--passed); }
    .badge.failed { background: #fee2e2; color: var(--failed); }
    .badge.skipped { background: #fef3c7; color: var(--skipped); }
    .badge.undefined { background: #f3e8ff; color: var(--undefined); }
    .badge.unknown { background: #e5e7eb; color: #374151; }
    .tag { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 1px 7px; margin-right: 4px; color: #475569; background: #f8fafc; }
    .muted { color: var(--muted); }
    pre { max-height: 280px; overflow: auto; white-space: pre-wrap; background: #111827; color: #f8fafc; border-radius: 8px; padding: 12px; }
    .hidden { display: none; }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      aside { position: static; height: auto; }
      .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .feature-header { display: block; }
      .feature-counts { justify-content: start; margin-top: 12px; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <aside>
      <h1>E2E Report</h1>
      <p>${escapeHtml(generatedAt)}</p>
      <nav>${navItems}</nav>
    </aside>
    <main>
      <div class="topbar">
        <div>
          <h1>E2E Test Report</h1>
          <p>${issueCount ? 'Failed' : 'Passed'} run with ${counts.total} scenarios.</p>
        </div>
        <div class="actions">
          <a class="button" href="cucumber-report.html">Open Cucumber HTML</a>
          <a class="button" href="cucumber-report.json">Download JSON</a>
        </div>
      </div>
      <div class="cards">
        <div class="card"><span>Total</span><strong>${counts.total}</strong></div>
        <div class="card"><span>Passed</span><strong>${counts.passed}</strong></div>
        <div class="card"><span>Failed</span><strong>${counts.failed}</strong></div>
        <div class="card"><span>Undefined</span><strong>${counts.undefined}</strong></div>
        <div class="card"><span>Skipped</span><strong>${counts.skipped}</strong></div>
        <div class="card"><span>Pass Rate</span><strong>${counts.passRate}%</strong></div>
        <div class="card"><span>Duration</span><strong>${formatDuration(counts.duration)}</strong></div>
      </div>
      <div class="toolbar">
        <input id="search" type="search" placeholder="Search feature, scenario, or tag">
        <button class="active" data-filter="all">All</button>
        <button data-filter="issue">Issues</button>
        <button data-filter="failed">Failed</button>
        <button data-filter="undefined">Undefined</button>
        <button data-filter="passed">Passed</button>
        <button data-filter="skipped">Skipped</button>
      </div>
      <section class="failures">
        <div class="feature-header"><h2>Failures</h2><p>${failedScenarios.length} failed or undefined scenarios</p></div>
        <table>
          <thead><tr><th>Feature</th><th>Scenario</th><th>Step</th><th>Status</th></tr></thead>
          <tbody>${failureRows}</tbody>
        </table>
      </section>
      ${featureSections}
    </main>
  </div>
  <script>
    const search = document.querySelector('#search');
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const rows = [...document.querySelectorAll('.scenario-row')];

    function applyFilters() {
      const term = search.value.trim().toLowerCase();
      const active = document.querySelector('[data-filter].active')?.dataset.filter ?? 'all';
      rows.forEach(row => {
        const matchesStatus = active === 'all' || row.dataset.status === active || (active === 'issue' && ['failed', 'undefined'].includes(row.dataset.status));
        const matchesSearch = !term || row.dataset.search.includes(term);
        row.classList.toggle('hidden', !(matchesStatus && matchesSearch));
      });
    }

    search.addEventListener('input', applyFilters);
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        applyFilters();
      });
    });
  </script>
</body>
</html>`;
}

fs.mkdirSync(reportsDir, { recursive: true });

const data = loadReport();
const markdown = buildMarkdown(data);
const html = buildHtml(data);

fs.writeFileSync(markdownSummaryPath, markdown);
fs.writeFileSync(htmlReportPath, html);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}
