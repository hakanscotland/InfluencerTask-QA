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

function sanitizeReportText(value) {
  return String(value ?? '')
    .replace(/(test id\s+"[^"]*(?:email|password|secret|token|key|iban)[^"]*"\s+(?:with|should have value)\s+)"[^"]*"/gi, '$1"[redacted]"')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
    .replace(/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g, '[redacted-key]')
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, '[redacted-token]')
    .replace(/(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, '$1[redacted-token]')
    .replace(/((?:password|secret|token|api[_-]?key|authorization)\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1[redacted]');
}

function slug(value, fallback = 'item') {
  const safe = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return safe || fallback;
}

function fileSlug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function listScreenshots() {
  const screenshotsDir = path.join(reportsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) return [];

  return fs.readdirSync(screenshotsDir)
    .filter(fileName => /\.(png|jpe?g|webp)$/i.test(fileName))
    .map(fileName => ({
      fileName,
      href: `screenshots/${encodeURIComponent(fileName)}`,
      slug: fileSlug(path.basename(fileName, path.extname(fileName))),
    }));
}

function screenshotForScenario(scenarioName, screenshots) {
  const scenarioSlug = fileSlug(scenarioName);
  if (!scenarioSlug) return '';

  const exact = screenshots.find(screenshot => screenshot.slug === scenarioSlug);
  if (exact) return exact.href;

  const partial = screenshots.find(screenshot => (
    screenshot.slug.includes(scenarioSlug) || scenarioSlug.includes(screenshot.slug)
  ));
  return partial?.href ?? '';
}

function loadReport() {
  if (!fs.existsSync(cucumberJsonPath)) {
    return { features: [], scenarios: [], missing: true };
  }

  const rawFeatures = JSON.parse(fs.readFileSync(cucumberJsonPath, 'utf8'));
  const screenshots = listScreenshots();
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
          failedStep: sanitizeReportText(failedStep?.name ?? ''),
          error: sanitizeReportText(failedStep?.error ?? ''),
          screenshot: screenshotForScenario(scenario.name, screenshots),
          steps: steps.map(step => ({
            ...step,
            name: sanitizeReportText(step.name),
            error: sanitizeReportText(step.error),
          })),
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

function pagesReportUrl() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository?.includes('/')) return '';

  const [owner, repo] = repository.split('/');
  return `https://${owner}.github.io/${repo}/`;
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
  const pagesUrl = pagesReportUrl();
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
    pagesUrl ? `- Open the published TestOps report: ${pagesUrl}` : '- Open the published TestOps report from the repository GitHub Pages site.',
    '- The original Cucumber HTML report is also included as `cucumber-report.html`.',
  ];

  if (failedScenarios.length) {
    lines.push('', '## Failures', '', '| Feature | Scenario | Step | Status |', '| --- | --- | --- | --- |');
    for (const scenario of failedScenarios.slice(0, 25)) {
      lines.push(`| ${escapeCell(scenario.feature)} | ${escapeCell(scenario.name)} | ${escapeCell(sanitizeReportText(scenario.failedStep))} | ${scenario.status} |`);
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

function reportJsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/-->/g, '--\\>');
}

function statusLabel(status) {
  if (status === 'passed') return 'PASS';
  if (status === 'failed') return 'FAIL';
  if (status === 'undefined') return 'UNDEF';
  if (status === 'skipped') return 'SKIP';
  return 'UNKNOWN';
}

function statusGroup(status) {
  if (status === 'passed') return 'pass';
  if (status === 'failed' || status === 'undefined') return 'fail';
  if (status === 'skipped') return 'skip';
  return 'unknown';
}

function statusClassName(status) {
  if (status === 'undefined') return 'undefined';
  return statusGroup(status);
}

function testOpsStatusBadge(status) {
  const label = statusLabel(status);
  return `<span class="status-pill ${statusClassName(status)}">${escapeHtml(label)}</span>`;
}

function stepStatusClass(status) {
  if (status === 'passed') return 'pass';
  if (status === 'failed' || status === 'undefined') return 'fail';
  if (status === 'skipped') return 'skip';
  return 'unknown';
}

function firstLine(value, fallback = 'No diagnostic trace captured for this execution.') {
  const text = String(value ?? '').split(/\r?\n/).find(line => line.trim());
  return text?.trim() || fallback;
}

function truncate(value, length = 140) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length - 3)}...`;
}

function platformsForScenario(scenario) {
  const source = `${scenario.feature} ${scenario.name} ${scenario.tags.join(' ')}`.toLowerCase();
  const platforms = ['chrome'];

  if (/mobile|phone|android|ios|responsive/.test(source)) {
    platforms.push('mobile');
  } else {
    platforms.push('desktop');
  }

  if (/api|finance|wallet|deposit|withdrawal|reset|auth|login/.test(source)) {
    platforms.push('service');
  }

  if (scenario.status !== 'passed') {
    platforms.push('terminal');
  }

  return [...new Set(platforms)];
}

function platformIcon(platform) {
  const labels = {
    chrome: 'CH',
    desktop: 'DS',
    mobile: 'MB',
    service: 'API',
    terminal: 'CLI',
  };
  return `<span class="platform-chip" title="${escapeHtml(platform)}">${escapeHtml(labels[platform] ?? platform.slice(0, 3).toUpperCase())}</span>`;
}

function percent(count, total) {
  return total ? Math.round((count / total) * 100) : 0;
}

function envState(key, secret = false) {
  const configured = Boolean(process.env[key]);
  return {
    key,
    value: configured ? (secret ? 'secure value injected' : 'configured') : 'not set',
    scope: secret ? 'SECURE' : 'INTERNAL',
    isSecret: secret,
    configured,
  };
}

function buildTestOpsHtml(data) {
  const generatedAt = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');

  if (data.missing) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TestOps Pro Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #131315; color: #e4e2e4; font-family: "Plus Jakarta Sans", system-ui, sans-serif; }
    .empty { max-width: 560px; border: 1px solid rgba(51,65,85,.6); border-radius: 12px; background: rgba(30,41,59,.7); padding: 32px; }
    .brand { display: flex; align-items: center; gap: 10px; color: white; font-weight: 800; font-size: 22px; }
    .brand::before { content: ""; width: 10px; height: 28px; border-radius: 3px; background: linear-gradient(#bec6e0, #3131c0); }
    p { color: #c6c6cd; line-height: 1.6; }
    code { color: #bec6e0; font-family: "JetBrains Mono", monospace; }
  </style>
</head>
<body>
  <main class="empty">
    <div class="brand">TestOps Pro</div>
    <h1>E2E report is not available</h1>
    <p>Cucumber JSON report was not found at <code>${escapeHtml(cucumberJsonPath)}</code>.</p>
  </main>
</body>
</html>`;
  }

  const counts = countsFor(data.scenarios);
  const issueCount = counts.failed + counts.undefined;
  const issueScenarios = data.scenarios.filter(scenario => scenario.status === 'failed' || scenario.status === 'undefined');
  const resultLabel = issueCount ? 'Failed' : 'Passed';
  const features = data.features.map((feature, index) => ({
    id: feature.id,
    buildNumber: `F${String(index + 1).padStart(2, '0')}`,
    name: feature.name,
    uri: feature.uri,
    counts: countsFor(feature.scenarios),
  }));

  const testCases = data.scenarios.map((scenario, index) => ({
    id: `E2E-${String(index + 1).padStart(3, '0')}`,
    domId: scenario.id,
    name: scenario.name,
    suite: scenario.feature,
    status: statusLabel(scenario.status),
    rawStatus: scenario.status,
    statusGroup: statusGroup(scenario.status),
    statusClass: statusClassName(scenario.status),
    duration: formatDuration(scenario.duration),
    durationMs: scenario.duration,
    failedStep: scenario.failedStep,
    errorSnippet: firstLine(scenario.error, scenario.failedStep ? `Failed at step: ${scenario.failedStep}` : ''),
    stackTrace: scenario.error,
    screenshotUrl: scenario.screenshot,
    platforms: platformsForScenario(scenario),
    updatedAt: 'Current run',
    tags: scenario.tags,
    steps: scenario.steps.map((step, stepIndex) => ({
      id: stepIndex + 1,
      keyword: step.keyword,
      description: `${step.keyword ? `${step.keyword} ` : ''}${step.name}`.trim(),
      status: statusLabel(step.status),
      rawStatus: step.status,
      statusClass: stepStatusClass(step.status),
      duration: formatDuration(step.duration),
      error: step.error,
    })),
  }));

  const suites = [...new Set(testCases.map(testCase => testCase.suite))].sort((a, b) => a.localeCompare(b));
  const payload = {
    generatedAt,
    counts,
    resultLabel,
    testCases,
    suites,
  };

  const donutSegments = [
    ['#10b981', counts.passed],
    ['#ef4444', issueCount],
    ['#dec29a', counts.skipped],
    ['#64748b', counts.undefined + counts.unknown],
  ];
  let donutCursor = 0;
  const donutGradient = counts.total
    ? donutSegments
      .filter(([, value]) => value > 0)
      .map(([color, value]) => {
        const start = donutCursor;
        donutCursor += (value / counts.total) * 100;
        return `${color} ${start.toFixed(2)}% ${donutCursor.toFixed(2)}%`;
      })
      .join(', ')
    : '#334155 0% 100%';

  const metricCards = [
    {
      title: 'TOTAL TESTS',
      value: counts.total.toLocaleString('en-US'),
      change: `${features.length} feature modules`,
      icon: 'TR',
      tone: 'accent',
    },
    {
      title: 'PASS RATE %',
      value: `${counts.passRate}%`,
      change: issueCount ? 'Needs attention' : 'Stable performance',
      icon: 'OK',
      tone: 'pass',
    },
    {
      title: 'AVG. DURATION',
      value: counts.total ? formatDuration(Math.round(counts.duration / counts.total)) : '0ms',
      change: `Total ${formatDuration(counts.duration)}`,
      icon: 'TM',
      tone: 'warn',
    },
    {
      title: 'FAILURE COUNT',
      value: issueCount.toLocaleString('en-US'),
      change: issueCount ? 'Requires diagnostic attention' : 'No triage required',
      icon: 'AL',
      tone: 'fail',
      highlight: issueCount > 0,
    },
  ].map(card => `<article class="metric-card ${card.highlight ? 'highlight' : ''}">
      <div class="metric-top">
        <span>${escapeHtml(card.title)}</span>
        <span class="metric-icon ${escapeHtml(card.tone)}">${escapeHtml(card.icon)}</span>
      </div>
      <strong>${escapeHtml(card.value)}</strong>
      <p class="${card.tone === 'pass' ? 'good' : card.tone === 'fail' ? 'bad' : ''}">${escapeHtml(card.change)}</p>
    </article>`).join('\n');

  const legendCards = [
    ['PASS', counts.passed, 'pass'],
    ['FAIL', issueCount, 'fail'],
    ['SKIP', counts.skipped, 'skip'],
    ['OTHER', counts.undefined + counts.unknown, 'unknown'],
  ].map(([label, value, tone]) => `<div class="legend-card">
      <span class="dot ${tone}"></span>
      <span>${escapeHtml(label)}</span>
      <strong>${Number(value).toLocaleString('en-US')}</strong>
    </div>`).join('\n');

  const trendSource = features.length ? features.slice(0, 10) : [{ buildNumber: 'F00', name: 'No suites', counts }];
  const maxFeatureTotal = Math.max(...trendSource.map(feature => feature.counts.total), 1);
  const trendBars = trendSource.map(feature => {
    const featureIssueCount = feature.counts.failed + feature.counts.undefined;
    const totalHeight = feature.counts.total ? Math.max(34, Math.round((feature.counts.total / maxFeatureTotal) * 168)) : 10;
    const passHeight = percent(feature.counts.passed, feature.counts.total);
    const issueHeight = percent(featureIssueCount, feature.counts.total);
    const skipHeight = Math.max(0, 100 - passHeight - issueHeight);
    return `<div class="trend-column" title="${escapeHtml(`${feature.name}: ${feature.counts.passed} pass, ${featureIssueCount} fail`)}">
        <div class="trend-tooltip">
          <strong>${escapeHtml(feature.buildNumber)}</strong>
          <span>${escapeHtml(truncate(feature.name, 34))}</span>
          <span class="good">Passed: ${feature.counts.passed}</span>
          <span class="bad">Failed: ${featureIssueCount}</span>
        </div>
        <div class="trend-stack" style="height: ${totalHeight}px">
          <div class="trend-pass" style="height: ${passHeight}%"></div>
          <div class="trend-fail" style="height: ${issueHeight}%"></div>
          <div class="trend-skip" style="height: ${skipHeight}%"></div>
        </div>
        <span>${escapeHtml(feature.buildNumber)}</span>
      </div>`;
  }).join('\n');

  const recentFailures = issueScenarios.slice(0, 8).map((scenario, index) => {
    const testCase = testCases.find(item => item.domId === scenario.id);
    return `<tr class="clickable" data-failure-select="${escapeHtml(testCase.id)}">
        <td>
          <div class="test-title with-marker">
            <span class="failure-marker"></span>
            <div>
              <strong>${escapeHtml(scenario.name)}</strong>
              <small>${escapeHtml(testCase.id)}</small>
            </div>
          </div>
        </td>
        <td>${escapeHtml(scenario.feature)}</td>
        <td class="mono">${escapeHtml(formatDuration(scenario.duration))}</td>
        <td><span class="error-snippet">${escapeHtml(truncate(firstLine(scenario.error, scenario.failedStep), 96))}</span></td>
        <td><div class="platforms">${testCase.platforms.map(platformIcon).join('')}</div></td>
        <td class="right"><button class="ghost-icon" type="button" title="Open failure triage" data-failure-select="${escapeHtml(testCase.id)}">-&gt;</button></td>
      </tr>`;
  }).join('\n') || `<tr><td colspan="6" class="empty-state">No critical suite failures in this run.</td></tr>`;

  const suiteOptions = suites.map(suite => `<option value="${escapeHtml(suite)}">${escapeHtml(suite)}</option>`).join('\n');

  const executionRows = testCases.map(testCase => {
    const tagHtml = testCase.tags.length
      ? testCase.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')
      : '<span class="muted">No tags</span>';
    const stepHtml = testCase.steps.length
      ? testCase.steps.map(step => `<div class="step-row ${escapeHtml(step.statusClass)}">
          <div>
            <span class="step-status">${escapeHtml(step.status)}</span>
            <span>${escapeHtml(step.id)}. ${escapeHtml(step.description)}</span>
          </div>
          <span class="mono">${escapeHtml(step.duration)}</span>
        </div>${step.error ? `<pre class="step-error">${escapeHtml(step.error)}</pre>` : ''}`).join('\n')
      : `<div class="clean-block">
          <strong>Execution Clean</strong>
          <span>All automated suite steps associated with this specification passed successfully.</span>
        </div>`;
    const errorHtml = testCase.statusGroup === 'fail'
      ? `<div class="detail-log">
          <span>Error Diagnostics Log</span>
          <pre>${escapeHtml(testCase.stackTrace || testCase.errorSnippet)}</pre>
        </div>`
      : '';
    const snapshotHtml = testCase.screenshotUrl
      ? `<a class="snapshot-frame has-image" href="${escapeHtml(testCase.screenshotUrl)}" target="_blank" rel="noreferrer">
          <img src="${escapeHtml(testCase.screenshotUrl)}" alt="Failure snapshot for ${escapeHtml(testCase.name)}">
          <span>Open snapshot</span>
        </a>`
      : `<div class="snapshot-frame">
          <span class="snapshot-icon">?</span>
          <strong>No Snapshot Attached</strong>
          <p>Passing or skipped executions do not allocate failure frames in this report.</p>
        </div>`;

    return `<tr class="execution-row" data-case-id="${escapeHtml(testCase.id)}" data-status="${escapeHtml(testCase.status)}" data-status-group="${escapeHtml(testCase.statusGroup)}" data-suite="${escapeHtml(testCase.suite)}" data-search="${escapeHtml(`${testCase.id} ${testCase.name} ${testCase.suite} ${testCase.tags.join(' ')} ${testCase.errorSnippet}`.toLowerCase())}">
        <td class="center"><button class="expand-toggle" type="button" title="Toggle execution details">v</button></td>
        <td>${testOpsStatusBadge(testCase.rawStatus)}</td>
        <td>
          <div class="test-title">
            <strong>${escapeHtml(testCase.name)}</strong>
            <small>${escapeHtml(testCase.id)}</small>
          </div>
        </td>
        <td>${escapeHtml(testCase.suite)}</td>
        <td><div class="platforms">${testCase.platforms.map(platformIcon).join('')}</div></td>
        <td class="right mono">${escapeHtml(testCase.duration)}</td>
        <td class="right mono">${escapeHtml(testCase.updatedAt)}</td>
      </tr>
      <tr class="execution-detail-row" data-detail-for="${escapeHtml(testCase.id)}" hidden>
        <td colspan="7">
          <div class="execution-detail-grid">
            <section class="detail-main">
              <div class="detail-header">
                <span>Execution breakdown Details</span>
                ${testCase.statusGroup === 'fail' ? `<button type="button" class="link-button" data-failure-select="${escapeHtml(testCase.id)}">Open Failure Triage</button>` : ''}
              </div>
              <div class="tags">${tagHtml}</div>
              <div class="steps-list">${stepHtml}</div>
              ${errorHtml}
            </section>
            <aside class="detail-side">
              <span>Failure Snapshot</span>
              ${snapshotHtml}
            </aside>
          </div>
        </td>
      </tr>`;
  }).join('\n') || `<tr><td colspan="7" class="empty-state">No executions found in this report.</td></tr>`;

  const failureList = testCases.filter(testCase => testCase.statusGroup === 'fail').map((testCase, index) => `<button class="failure-list-item ${index === 0 ? 'active' : ''}" type="button" data-failure-select="${escapeHtml(testCase.id)}">
      <span>${testOpsStatusBadge(testCase.rawStatus)}</span>
      <strong>${escapeHtml(testCase.name)}</strong>
      <small>${escapeHtml(testCase.suite)} / ${escapeHtml(testCase.id)}</small>
    </button>`).join('\n') || '<div class="empty-state compact">No failed executions to triage.</div>';

  const envVars = [
    envState('BASE_URL'),
    envState('APP_LOCALE'),
    envState('HEADLESS'),
    envState('CI'),
    envState('E2E_RESET_SECRET', true),
    envState('QA_BRAND_EMAIL', true),
    envState('QA_BRAND_PASSWORD', true),
    envState('QA_USER_EMAIL', true),
    envState('QA_USER_PASSWORD', true),
    envState('QA_ADMIN_EMAIL', true),
    envState('QA_ADMIN_PASSWORD', true),
  ];
  const envRows = envVars.map(variable => `<tr data-env-row data-search="${escapeHtml(`${variable.key} ${variable.scope} ${variable.value}`.toLowerCase())}">
      <td class="mono key">${escapeHtml(variable.key)}</td>
      <td class="mono">${escapeHtml(variable.value)}</td>
      <td><span class="scope ${variable.scope.toLowerCase()}">${escapeHtml(variable.scope)}</span></td>
      <td class="right">${variable.configured ? '<span class="config-ok">Configured</span>' : '<span class="config-missing">Missing</span>'}</td>
    </tr>`).join('\n');

  const featureSummaryRows = features.map(feature => {
    const featureIssueCount = feature.counts.failed + feature.counts.undefined;
    return `<tr>
      <td>${escapeHtml(feature.name)}<small>${escapeHtml(feature.uri)}</small></td>
      <td class="right">${feature.counts.total}</td>
      <td class="right good">${feature.counts.passed}</td>
      <td class="right bad">${featureIssueCount}</td>
      <td class="right warn">${feature.counts.skipped}</td>
      <td class="right">${feature.counts.passRate}%</td>
    </tr>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TestOps Pro E2E Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    :root {
      color-scheme: dark;
      --app-bg: #131315;
      --panel-bg: rgba(30, 41, 59, .70);
      --panel-bg-soft: rgba(30, 41, 59, .50);
      --sidebar-bg: #1b1b1d;
      --line: rgba(69, 70, 77, .45);
      --line-strong: rgba(51, 65, 85, .60);
      --text: #e4e2e4;
      --white: #ffffff;
      --muted: #c6c6cd;
      --muted-soft: rgba(198, 198, 205, .70);
      --accent: #3131c0;
      --accent-text: #b0b2ff;
      --steel: #bec6e0;
      --pass: #10b981;
      --fail: #ef4444;
      --warn: #dec29a;
      --unknown: #64748b;
      --radius: 12px;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--app-bg);
      color: var(--text);
      font: 14px/1.5 "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
      letter-spacing: 0;
      selection-background-color: var(--steel);
    }
    ::selection { background: var(--steel); color: #283044; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #131315; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }

    a { color: inherit; text-decoration: none; }
    button, input, select { font: inherit; letter-spacing: 0; }
    button { cursor: pointer; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 14px 16px; vertical-align: middle; }
    th {
      background: rgba(19, 19, 21, .80);
      border-bottom: 1px solid var(--line);
      color: rgba(198, 198, 205, .90);
      font-size: 11px;
      font-weight: 800;
      text-align: left;
      text-transform: uppercase;
    }
    td { border-bottom: 1px solid rgba(51, 65, 85, .30); color: var(--muted); }
    tr[hidden] { display: none !important; }
    small { display: block; color: rgba(198, 198, 205, .72); font-size: 10px; font-family: "JetBrains Mono", ui-monospace, monospace; margin-top: 2px; }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 12px;
      line-height: 1.55;
    }

    .app-header {
      position: fixed;
      inset: 0 0 auto 0;
      height: 64px;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 0 32px;
      background: #131315;
      border-bottom: 1px solid rgba(69, 70, 77, .30);
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: white;
      font-size: 20px;
      font-weight: 800;
      white-space: nowrap;
    }
    .brand-mark {
      width: 10px;
      height: 26px;
      border-radius: 3px;
      background: linear-gradient(180deg, #bec6e0, #3131c0);
      display: inline-block;
    }
    .global-search {
      position: relative;
      flex: 1;
      max-width: 460px;
      margin: 0 auto;
    }
    .global-search span {
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(198, 198, 205, .65);
      font-size: 12px;
      pointer-events: none;
    }
    .global-search input {
      width: 100%;
      height: 34px;
      padding: 0 14px 0 38px;
      color: white;
      background: #1b1b1d;
      border: 1px solid rgba(69, 70, 77, .35);
      border-radius: 8px;
      outline: 0;
      font-size: 12px;
    }
    .global-search input:focus { border-color: var(--steel); box-shadow: 0 0 0 1px rgba(190, 198, 224, .22); }
    .header-actions { display: flex; align-items: center; gap: 10px; }
    .round-button {
      width: 36px;
      height: 36px;
      border-radius: 999px;
      border: 1px solid rgba(190, 198, 224, .10);
      color: var(--muted);
      background: transparent;
      display: inline-grid;
      place-items: center;
      font-weight: 800;
      font-size: 11px;
    }
    .round-button:hover { color: white; background: #2a2a2b; }

    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 40;
      width: 256px;
      height: 100vh;
      padding: 80px 16px 24px;
      background: var(--sidebar-bg);
      border-right: 1px solid rgba(69, 70, 77, .30);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 18px 50px rgba(0, 0, 0, .24);
    }
    .release-block { padding: 0 12px 24px; }
    .release-block h2 { margin: 0; color: white; font-size: 20px; line-height: 1.1; }
    .release-block p { margin: 6px 0 0; color: rgba(198, 198, 205, .72); font-family: "JetBrains Mono", monospace; font-size: 11px; }
    .nav-stack { display: grid; gap: 4px; }
    .nav-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 42px;
      padding: 0 12px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--muted);
      text-align: left;
      font-size: 14px;
      font-weight: 800;
      transition: background .2s, color .2s, transform .2s;
    }
    .nav-button:hover { background: #2a2a2b; color: white; }
    .nav-button.active {
      background: var(--accent);
      color: var(--accent-text);
      transform: translateX(4px);
      box-shadow: 0 12px 24px rgba(49, 49, 192, .16);
    }
    .nav-icon {
      width: 28px;
      height: 28px;
      display: inline-grid;
      place-items: center;
      border: 1px solid rgba(198, 198, 205, .14);
      border-radius: 8px;
      font-size: 10px;
      font-weight: 900;
    }
    .sidebar-footer {
      border-top: 1px solid rgba(69, 70, 77, .20);
      padding: 18px 12px 0;
      display: grid;
      gap: 14px;
    }
    .engineer-card { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 999px;
      border: 1px solid rgba(144, 144, 151, .40);
      display: grid;
      place-items: center;
      color: var(--steel);
      background: #131315;
      font-weight: 900;
    }
    .engineer-card strong { color: white; display: block; line-height: 1.1; }
    .engineer-card span { color: rgba(198, 198, 205, .72); font-size: 10px; }

    .main {
      margin-left: 256px;
      min-height: 100vh;
      padding: 84px 32px 36px;
    }
    .content { max-width: 1280px; margin: 0 auto; }
    .view-panel { display: none; animation: fadeIn .18s ease-out; }
    .view-panel.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .view-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    .view-header h1, .view-header h2 { margin: 0; color: white; font-size: 26px; line-height: 1.15; }
    .view-header p { margin: 6px 0 0; color: var(--muted); font-size: 12px; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .action-button, .primary-button, .link-button {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
      padding: 0 14px;
      font-size: 12px;
      font-weight: 800;
      border: 1px solid var(--line-strong);
    }
    .action-button { color: white; background: #1e293b; }
    .action-button:hover { background: #2a374a; }
    .primary-button { color: var(--accent-text); background: var(--accent); border-color: transparent; box-shadow: 0 12px 24px rgba(49, 49, 192, .16); }
    .primary-button:hover { filter: brightness(1.08); }
    .link-button { color: var(--accent-text); background: rgba(49,49,192,.10); border-color: rgba(49,49,192,.25); min-height: 30px; }

    .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; margin-bottom: 24px; }
    .metric-card, .panel {
      background: var(--panel-bg);
      border: 1px solid var(--line-strong);
      border-radius: var(--radius);
      box-shadow: 0 12px 28px rgba(0,0,0,.12);
    }
    .metric-card {
      min-height: 156px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .metric-card.highlight { border-color: rgba(239,68,68,.30); border-left: 4px solid var(--fail); }
    .metric-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .metric-top > span:first-child { color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .metric-icon {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: inline-grid;
      place-items: center;
      background: rgba(19,19,21,.52);
      border: 1px solid rgba(51,65,85,.45);
      font-size: 10px;
      font-weight: 900;
      font-family: "JetBrains Mono", monospace;
    }
    .metric-icon.accent { color: var(--steel); }
    .metric-icon.pass { color: var(--pass); }
    .metric-icon.warn { color: var(--warn); }
    .metric-icon.fail { color: var(--fail); }
    .metric-card strong { display: block; margin-top: 20px; color: white; font-size: 34px; line-height: 1; font-weight: 900; }
    .metric-card p { margin: 8px 0 0; color: rgba(198,198,205,.82); font-size: 11px; font-weight: 700; }
    .good { color: var(--pass) !important; }
    .bad { color: var(--fail) !important; }
    .warn { color: var(--warn) !important; }
    .muted { color: var(--muted-soft) !important; }
    .mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
    .right { text-align: right; }
    .center { text-align: center; }

    .dashboard-grid { display: grid; grid-template-columns: 4fr 8fr; gap: 24px; margin-bottom: 24px; }
    .panel { overflow: hidden; }
    .panel.pad { padding: 24px; }
    .panel-header {
      padding: 18px 22px;
      border-bottom: 1px solid var(--line-strong);
      background: rgba(19,19,21,.40);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .panel-header h3, .panel-header h4 { margin: 0; color: white; font-size: 18px; line-height: 1.2; }
    .panel-header p { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
    .donut-wrap { display: grid; place-items: center; padding: 26px 10px 18px; }
    .donut {
      width: 188px;
      height: 188px;
      border-radius: 50%;
      background: conic-gradient(${donutGradient});
      position: relative;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.18);
    }
    .donut::after {
      content: "";
      position: absolute;
      inset: 22px;
      border-radius: 50%;
      background: #1e293b;
      border: 1px solid rgba(51,65,85,.60);
    }
    .donut-center {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: grid;
      place-items: center;
      text-align: center;
    }
    .donut-center strong { color: white; display: block; font-size: 32px; line-height: 1; }
    .donut-center span { display: block; margin-top: 6px; color: ${issueCount ? '#ef4444' : '#10b981'}; font-size: 10px; font-weight: 900; text-transform: uppercase; }
    .legend-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 18px; }
    .legend-card {
      min-height: 74px;
      display: grid;
      align-content: center;
      justify-items: center;
      gap: 5px;
      padding: 10px 6px;
      background: rgba(19,19,21,.50);
      border: 1px solid rgba(51,65,85,.35);
      border-radius: 8px;
      font-size: 10px;
      font-weight: 900;
      color: var(--muted);
    }
    .legend-card strong { color: white; font-size: 13px; }
    .dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
    .dot.pass { background: var(--pass); }
    .dot.fail { background: var(--fail); }
    .dot.skip { background: var(--warn); }
    .dot.unknown { background: var(--unknown); }

    .trend-panel { position: relative; min-height: 386px; }
    .trend-legend { display: flex; gap: 18px; align-items: center; color: var(--muted); font-size: 12px; font-weight: 800; }
    .trend-legend span { display: inline-flex; align-items: center; gap: 8px; }
    .trend-body {
      height: 264px;
      margin: 8px 22px 22px;
      border-bottom: 1px solid rgba(51,65,85,.45);
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      position: relative;
      padding: 22px 4px 12px;
    }
    .trend-body::before {
      content: "";
      position: absolute;
      inset: 22px 0 48px;
      pointer-events: none;
      opacity: .08;
      background: repeating-linear-gradient(to bottom, white 0, white 1px, transparent 1px, transparent 48px);
    }
    .trend-column {
      position: relative;
      width: min(46px, 100%);
      min-width: 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .trend-stack {
      width: 22px;
      min-height: 10px;
      display: flex;
      flex-direction: column-reverse;
      gap: 3px;
    }
    .trend-pass, .trend-fail, .trend-skip {
      width: 100%;
      min-height: 0;
      border-top: 2px solid currentColor;
      border-radius: 3px 3px 1px 1px;
      transition: filter .2s;
    }
    .trend-pass { color: var(--pass); background: rgba(16,185,129,.20); }
    .trend-fail { color: var(--fail); background: rgba(239,68,68,.22); }
    .trend-skip { color: var(--warn); background: rgba(222,194,154,.18); }
    .trend-column > span { color: rgba(198,198,205,.80); font-size: 10px; font-family: "JetBrains Mono", monospace; }
    .trend-column:hover .trend-pass, .trend-column:hover .trend-fail, .trend-column:hover .trend-skip { filter: brightness(1.35); }
    .trend-tooltip {
      display: none;
      position: absolute;
      bottom: calc(100% + 8px);
      z-index: 6;
      min-width: 150px;
      padding: 9px;
      border-radius: 8px;
      background: #131315;
      border: 1px solid #334155;
      box-shadow: 0 16px 28px rgba(0,0,0,.25);
      font-size: 10px;
      line-height: 1.4;
      color: var(--muted);
    }
    .trend-tooltip strong, .trend-tooltip span { display: block; }
    .trend-column:hover .trend-tooltip { display: block; }

    .table-wrap { overflow-x: auto; }
    .clickable { cursor: pointer; }
    .clickable:hover, .execution-row:hover { background: rgba(19,19,21,.38); }
    .test-title { display: flex; align-items: center; gap: 12px; color: white; }
    .test-title strong { color: white; font-size: 13px; display: block; }
    .test-title.with-marker { align-items: center; }
    .failure-marker { display: inline-block; width: 6px; height: 26px; border-radius: 99px; background: var(--fail); flex: 0 0 auto; }
    .error-snippet {
      display: inline-block;
      max-width: 340px;
      color: #f87171;
      background: rgba(248,113,113,.06);
      border: 1px solid rgba(239,68,68,.12);
      border-radius: 8px;
      padding: 7px 9px;
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    .platforms { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .platform-chip {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      display: inline-grid;
      place-items: center;
      color: var(--steel);
      background: #131315;
      border: 1px solid rgba(51,65,85,.55);
      font-family: "JetBrains Mono", monospace;
      font-size: 9px;
      font-weight: 900;
    }
    .ghost-icon, .expand-toggle {
      min-width: 30px;
      height: 30px;
      border: 1px solid rgba(51,65,85,.45);
      border-radius: 999px;
      color: var(--muted);
      background: transparent;
      font-weight: 900;
    }
    .ghost-icon:hover, .expand-toggle:hover { color: white; background: rgba(49,49,192,.20); }
    .execution-row.is-expanded { background: rgba(19,19,21,.25); }
    .execution-row.is-expanded .expand-toggle { transform: rotate(180deg); color: var(--steel); }

    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 66px;
      height: 26px;
      border-radius: 999px;
      padding: 0 10px;
      font-size: 11px;
      font-weight: 900;
      font-family: "Plus Jakarta Sans", system-ui, sans-serif;
      text-transform: uppercase;
    }
    .status-pill.pass { color: var(--pass); background: rgba(16,185,129,.10); border: 1px solid rgba(16,185,129,.30); }
    .status-pill.fail { color: var(--fail); background: rgba(239,68,68,.10); border: 1px solid rgba(239,68,68,.30); }
    .status-pill.undefined { color: #c084fc; background: rgba(192,132,252,.10); border: 1px solid rgba(192,132,252,.28); }
    .status-pill.skip { color: var(--warn); background: rgba(222,194,154,.10); border: 1px solid rgba(222,194,154,.30); }
    .status-pill.unknown { color: #94a3b8; background: rgba(100,116,139,.12); border: 1px solid rgba(100,116,139,.30); }

    .filters-panel {
      margin-bottom: 24px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      background: var(--panel-bg);
      border: 1px solid var(--line-strong);
      border-radius: var(--radius);
    }
    .filter-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .filter-group > span { color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .segmented {
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      background: rgba(19,19,21,.80);
      border: 1px solid rgba(69,70,77,.35);
      border-radius: 8px;
    }
    .segmented button {
      min-height: 26px;
      border: 0;
      border-radius: 6px;
      padding: 0 10px;
      color: var(--muted);
      background: transparent;
      font-size: 11px;
      font-weight: 900;
    }
    .segmented button.active { background: var(--accent); color: var(--accent-text); }
    select, .env-search {
      min-height: 32px;
      border-radius: 8px;
      border: 1px solid rgba(69,70,77,.35);
      background: rgba(19,19,21,.80);
      color: white;
      padding: 0 11px;
      outline: 0;
      font-size: 12px;
      font-weight: 700;
    }
    .result-count { color: var(--muted); font-size: 12px; }
    .result-count strong { color: white; }

    .execution-detail-row td { padding: 24px 40px; background: rgba(19,19,21,.12); }
    .execution-detail-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(220px, 1fr); gap: 24px; }
    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
      color: rgba(190,198,224,.90);
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .tag {
      border: 1px solid rgba(190,198,224,.16);
      color: var(--steel);
      background: rgba(190,198,224,.07);
      border-radius: 999px;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 800;
    }
    .steps-list { display: grid; gap: 8px; }
    .step-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 12px;
      color: rgba(255,255,255,.92);
    }
    .step-row.pass { background: rgba(16,185,129,.05); border: 1px solid rgba(16,185,129,.15); }
    .step-row.fail { background: rgba(239,68,68,.05); border: 1px solid rgba(239,68,68,.15); }
    .step-row.skip { background: rgba(222,194,154,.05); border: 1px solid rgba(222,194,154,.15); color: var(--warn); }
    .step-row.unknown { background: rgba(100,116,139,.08); border: 1px solid rgba(100,116,139,.18); }
    .step-row > div { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .step-status { min-width: 48px; color: var(--muted); font-size: 10px; font-weight: 900; }
    .step-error {
      margin: -2px 0 4px 0;
      padding: 12px;
      color: #f87171;
      background: rgba(19,19,21,.75);
      border: 1px solid rgba(239,68,68,.10);
      border-radius: 8px;
      max-height: 180px;
      overflow: auto;
    }
    .clean-block {
      padding: 16px;
      border-radius: 8px;
      color: rgba(255,255,255,.92);
      background: rgba(16,185,129,.06);
      border: 1px solid rgba(16,185,129,.16);
      display: grid;
      gap: 4px;
    }
    .clean-block strong { color: var(--pass); font-size: 12px; }
    .clean-block span { color: var(--muted); font-size: 11px; }
    .detail-log { margin-top: 16px; display: grid; gap: 8px; }
    .detail-log > span { color: rgba(248,113,113,.85); font-size: 10px; font-weight: 900; text-transform: uppercase; }
    .detail-log pre {
      max-height: 220px;
      overflow: auto;
      padding: 16px;
      color: #f87171;
      background: rgba(19,19,21,.80);
      border: 1px solid rgba(239,68,68,.10);
      border-radius: 8px;
    }
    .detail-side > span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; }
    .snapshot-frame {
      min-height: 150px;
      border: 1px dashed rgba(69,70,77,.55);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 18px;
      text-align: center;
      color: var(--muted);
      background: rgba(19,19,21,.28);
    }
    .snapshot-frame p { margin: 0; font-size: 10px; max-width: 230px; }
    .snapshot-frame.has-image {
      position: relative;
      display: block;
      min-height: auto;
      padding: 0;
      overflow: hidden;
      border-style: solid;
      background: #131315;
    }
    .snapshot-frame.has-image img { width: 100%; display: block; filter: brightness(.78); transition: transform .35s, filter .35s; }
    .snapshot-frame.has-image:hover img { transform: scale(1.02); filter: brightness(1); }
    .snapshot-frame.has-image span {
      position: absolute;
      inset: auto 12px 12px auto;
      padding: 6px 10px;
      border-radius: 8px;
      color: white;
      background: rgba(19,19,21,.82);
      border: 1px solid rgba(51,65,85,.7);
      font-size: 11px;
      font-weight: 800;
    }
    .snapshot-icon {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      border: 1px solid rgba(198,198,205,.18);
      color: rgba(198,198,205,.72);
      font-weight: 900;
    }

    .failure-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 24px; align-items: start; }
    .failure-list { display: grid; gap: 10px; }
    .failure-list-item {
      width: 100%;
      display: grid;
      gap: 8px;
      text-align: left;
      padding: 14px;
      border-radius: 8px;
      border: 1px solid rgba(51,65,85,.45);
      background: rgba(30,41,59,.50);
      color: var(--muted);
    }
    .failure-list-item strong { color: white; line-height: 1.25; }
    .failure-list-item.active, .failure-list-item:hover { border-color: rgba(239,68,68,.35); background: rgba(19,19,21,.46); }
    .failure-detail { display: grid; gap: 24px; }
    .failure-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .failure-title h2 { width: 100%; margin: 4px 0 0; color: white; font-size: 24px; }
    .id-chip {
      color: var(--muted);
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      background: rgba(19,19,21,.80);
      border: 1px solid rgba(51,65,85,.60);
      border-radius: 7px;
      padding: 4px 8px;
    }
    .failure-grid { display: grid; grid-template-columns: minmax(0, 8fr) minmax(280px, 4fr); gap: 24px; }
    .terminal-panel .panel-body { padding: 0; background: rgba(19,19,21,.88); }
    .terminal-panel pre { padding: 22px; color: var(--muted); max-height: 520px; overflow: auto; }
    .meta-card { padding: 18px; display: grid; gap: 12px; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px;
      background: rgba(19,19,21,.40);
      border: 1px solid rgba(51,65,85,.30);
      border-radius: 8px;
      font-size: 12px;
    }
    .meta-row span:first-child { color: var(--muted); font-weight: 800; }
    .meta-row strong { color: white; text-align: right; }
    .copilot-card {
      padding: 22px;
      background: linear-gradient(135deg, #1e293b, #131315);
      border: 1px solid #334155;
      border-radius: var(--radius);
    }
    .copilot-card h3 { margin: 0 0 10px; color: var(--steel); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .copilot-card p { margin: 0 0 14px; color: var(--muted); font-size: 12px; }
    .suggested-card { overflow: hidden; }
    .suggested-card .panel-body { padding: 18px; color: var(--muted); font-size: 12px; font-style: italic; }

    .environment-grid { display: grid; grid-template-columns: 4fr 8fr; gap: 24px; margin-bottom: 24px; }
    .infra-list { display: grid; gap: 12px; }
    .infra-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(51,65,85,.30); }
    .infra-row span { color: var(--muted); font-size: 12px; }
    .infra-row strong { color: white; font-family: "JetBrains Mono", monospace; font-size: 12px; text-align: right; }
    .resource-block { margin-top: 18px; padding: 16px; border-radius: 8px; background: rgba(19,19,21,.50); border: 1px solid rgba(51,65,85,.30); }
    .bar { height: 7px; overflow: hidden; border-radius: 999px; background: #334155; }
    .bar span { display: block; height: 100%; width: 42%; border-radius: inherit; background: var(--accent-text); }
    .info-tile { padding: 18px; border-left: 4px solid var(--steel); border-radius: 8px; background: rgba(19,19,21,.40); }
    .info-tile.alt { border-left-color: var(--muted); }
    .info-tile strong { display: block; color: white; margin-bottom: 4px; }
    .info-tile p { margin: 0; color: var(--muted); font-size: 12px; }
    .topology-map {
      min-height: 188px;
      border-radius: var(--radius);
      border: 1px solid rgba(51,65,85,.60);
      background-color: rgba(19,19,21,.50);
      background-image: radial-gradient(rgba(190,198,224,.18) 1px, transparent 1px);
      background-size: 16px 16px;
      display: grid;
      place-items: center;
      text-align: center;
      color: var(--steel);
      font-size: 12px;
      font-weight: 900;
    }
    .env-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-bottom: 24px; }
    .env-tile { padding: 22px; background: var(--panel-bg-soft); border: 1px solid var(--line-strong); border-radius: var(--radius); }
    .env-tile h4 { margin: 0 0 14px; color: var(--muted); font-size: 12px; }
    .env-tile strong { color: white; font-size: 26px; }
    .env-tile code { display: block; color: var(--steel); background: rgba(19,19,21,.72); border: 1px solid rgba(51,65,85,.30); border-radius: 8px; padding: 12px; font-size: 11px; white-space: normal; word-break: break-word; }
    .scope {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 0 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 900;
    }
    .scope.secure { color: var(--fail); background: rgba(239,68,68,.10); border: 1px solid rgba(239,68,68,.16); }
    .scope.internal { color: var(--steel); background: rgba(190,198,224,.10); border: 1px solid rgba(190,198,224,.16); }
    .config-ok { color: var(--pass); font-weight: 800; font-size: 11px; }
    .config-missing { color: var(--warn); font-weight: 800; font-size: 11px; }
    .key { color: var(--steel); font-weight: 800; }
    .empty-state { padding: 30px !important; text-align: center; color: var(--muted); }
    .empty-state.compact { padding: 18px !important; border: 1px dashed rgba(69,70,77,.50); border-radius: 8px; }

    @media (max-width: 1100px) {
      .metrics-grid, .dashboard-grid, .environment-grid, .failure-grid { grid-template-columns: 1fr; }
      .failure-layout { grid-template-columns: 1fr; }
      .env-tiles { grid-template-columns: 1fr; }
      .execution-detail-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 860px) {
      .app-header { padding: 0 16px; }
      .global-search { display: none; }
      .sidebar {
        position: fixed;
        top: 64px;
        width: 100%;
        height: auto;
        padding: 10px 12px;
        overflow-x: auto;
      }
      .release-block, .sidebar-footer { display: none; }
      .nav-stack { display: flex; min-width: max-content; }
      .nav-button { width: auto; white-space: nowrap; }
      .main { margin-left: 0; padding: 136px 16px 26px; }
      .view-header { align-items: flex-start; flex-direction: column; }
      .metrics-grid { grid-template-columns: 1fr; gap: 14px; }
      th, td { padding: 12px; }
    }
  </style>
</head>
<body>
  <header class="app-header">
    <a class="brand" href="#summary" data-view-link="summary"><span class="brand-mark"></span><span>TestOps Pro</span></a>
    <label class="global-search">
      <span>SR</span>
      <input id="globalSearch" type="search" placeholder="Search tests, suites, or error trace strings...">
    </label>
    <div class="header-actions">
      <button class="round-button" type="button" title="Refresh current metrics" id="refreshButton">RF</button>
      <button class="round-button" type="button" title="System settings">ST</button>
      <button class="round-button" type="button" title="Automation workspace">QA</button>
    </div>
  </header>

  <aside class="sidebar">
    <div>
      <div class="release-block">
        <h2>Release E2E</h2>
        <p>${escapeHtml(resultLabel)} / ${escapeHtml(generatedAt)}</p>
      </div>
      <nav class="nav-stack" aria-label="Report sections">
        <button class="nav-button active" type="button" data-view-link="summary"><span class="nav-icon">SM</span><span>Summary</span></button>
        <button class="nav-button" type="button" data-view-link="executions"><span class="nav-icon">EX</span><span>Executions</span></button>
        <button class="nav-button" type="button" data-view-link="failures"><span class="nav-icon">FL</span><span>Failures</span></button>
        <button class="nav-button" type="button" data-view-link="environment"><span class="nav-icon">EN</span><span>Environment</span></button>
      </nav>
    </div>
    <div class="sidebar-footer">
      <a href="cucumber-report.html" class="muted">Cucumber HTML</a>
      <a href="cucumber-report.json" class="muted">Cucumber JSON</a>
      <div class="engineer-card">
        <span class="avatar">QA</span>
        <div><strong>Automation</strong><span>GitHub Actions</span></div>
      </div>
    </div>
  </aside>

  <main class="main">
    <div class="content">
      <section id="summary" class="view-panel active">
        <div class="metrics-grid">${metricCards}</div>

        <div class="dashboard-grid">
          <section class="panel pad">
            <div>
              <h3>Status Distribution</h3>
              <p class="muted">Web app real-time execution structure</p>
            </div>
            <div class="donut-wrap">
              <div class="donut">
                <div class="donut-center">
                  <div><strong>${counts.passRate}%</strong><span>${issueCount ? 'Attention' : 'Healthy'}</span></div>
                </div>
              </div>
            </div>
            <div class="legend-grid">${legendCards}</div>
          </section>

          <section class="panel trend-panel">
            <div class="panel-header">
              <div>
                <h3>Performance Trends</h3>
                <p>Pass/fail data across feature modules in this run</p>
              </div>
              <div class="trend-legend">
                <span><i class="dot pass"></i> Passes</span>
                <span><i class="dot fail"></i> Failures</span>
              </div>
            </div>
            <div class="trend-body">${trendBars}</div>
          </section>
        </div>

        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Recent Failures</h3>
              <p>Critical suite exceptions requiring triage</p>
            </div>
            <button type="button" class="primary-button" data-view-link="failures">Triage Failures</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Test Name</th><th>Suite</th><th>Duration</th><th>Error Snippet</th><th>Platform</th><th class="right">Actions</th></tr></thead>
              <tbody>${recentFailures}</tbody>
            </table>
          </div>
        </section>

        <section class="panel" style="margin-top: 24px">
          <div class="panel-header">
            <div>
              <h3>Feature Summary</h3>
              <p>Module level execution split for the current Cucumber report</p>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Feature</th><th class="right">Total</th><th class="right">Passed</th><th class="right">Failed</th><th class="right">Skipped</th><th class="right">Pass Rate</th></tr></thead>
              <tbody>${featureSummaryRows || '<tr><td colspan="6" class="empty-state">No feature data found.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </section>

      <section id="executions" class="view-panel">
        <header class="view-header">
          <div>
            <h1>Test Executions</h1>
            <p>Reviewing suite runtime results for <strong class="good">${escapeHtml(resultLabel)}</strong> E2E run</p>
          </div>
          <div class="actions">
            <button class="action-button" type="button" id="exportCsv">Export CSV</button>
            <a class="primary-button" href="cucumber-report.html">Open Cucumber HTML</a>
          </div>
        </header>

        <div class="filters-panel">
          <div class="filter-group">
            <span>Status:</span>
            <div class="segmented" id="statusFilters">
              <button class="active" type="button" data-status-filter="ALL">ALL</button>
              <button type="button" data-status-filter="PASS">PASS</button>
              <button type="button" data-status-filter="FAIL">FAIL</button>
              <button type="button" data-status-filter="SKIP">SKIP</button>
              <button type="button" data-status-filter="UNDEF">UNDEF</button>
            </div>
          </div>
          <div class="filter-group">
            <span>Suite:</span>
            <select id="suiteFilter">
              <option value="All Modules">All Modules</option>
              ${suiteOptions}
            </select>
          </div>
          <div class="result-count">Showing <strong id="executionCount">${testCases.length}</strong> executions</div>
        </div>

        <section class="panel">
          <div class="table-wrap">
            <table>
              <thead><tr><th class="center"></th><th>Status</th><th>Test Name (Spec)</th><th>Suite / Module</th><th>Platform</th><th class="right">Duration</th><th class="right">Updated</th></tr></thead>
              <tbody>${executionRows}</tbody>
            </table>
          </div>
        </section>
      </section>

      <section id="failures" class="view-panel">
        <header class="view-header">
          <div>
            <h1>Failure Triage</h1>
            <p>Focused diagnostics workspace for failed and undefined scenarios.</p>
          </div>
          <div class="actions">
            <button class="action-button" type="button" id="copyTrace">Copy Trace</button>
          </div>
        </header>

        <div class="failure-layout">
          <aside class="failure-list">${failureList}</aside>
          <section class="failure-detail" id="failureDetail"></section>
        </div>
      </section>

      <section id="environment" class="view-panel">
        <header class="view-header">
          <div>
            <h1>Environment Configuration</h1>
            <p>Detailed transparency into build runtime setup. Secret values are never printed into this public report.</p>
          </div>
          <div class="actions">
            <button class="action-button" type="button" id="exportEnvironment">Export Config</button>
            <button class="primary-button" type="button" data-view-link="executions">Review Executions</button>
          </div>
        </header>

        <div class="environment-grid">
          <section class="panel pad">
            <div class="panel-header" style="padding: 0 0 18px; margin-bottom: 18px; background: transparent; border-bottom-color: rgba(51,65,85,.30)">
              <div><h3>Test Runner</h3><p>Current automation runtime</p></div>
              <span class="config-ok">Active</span>
            </div>
            <div class="infra-list">
              <div class="infra-row"><span>Framework</span><strong>Playwright + Cucumber</strong></div>
              <div class="infra-row"><span>Runtime</span><strong>${escapeHtml(process.version)}</strong></div>
              <div class="infra-row"><span>OS</span><strong>${escapeHtml(process.platform)}</strong></div>
              <div class="infra-row"><span>Language</span><strong>TypeScript</strong></div>
            </div>
            <div class="resource-block">
              <p class="muted" style="margin: 0 0 10px; font-size: 10px; font-weight: 900; text-transform: uppercase">Resource Utilization</p>
              <div class="bar"><span></span></div>
            </div>
          </section>

          <section class="panel pad">
            <div class="panel-header" style="padding: 0 0 18px; margin-bottom: 18px; background: transparent; border-bottom-color: rgba(51,65,85,.30)">
              <div><h3>Infrastructure Node</h3><p>GitHub Actions managed execution environment</p></div>
              <span class="scope internal">${process.env.CI ? 'CI' : 'LOCAL'}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px">
              <div class="infra-list">
                <div class="info-tile"><strong>Runner Type</strong><p>Managed automation execution environment with browser artifacts.</p></div>
                <div class="info-tile alt"><strong>Network Tier</strong><p>Outbound access controlled by the configured CI runner.</p></div>
              </div>
              <div class="topology-map"><div>Infrastructure Map Topology<br><span class="muted">Report artifact workspace</span></div></div>
            </div>
          </section>
        </div>

        <section class="env-tiles">
          <div class="env-tile"><h4>BaseURL endpoint</h4><code>${process.env.BASE_URL ? 'configured' : 'not set'}</code></div>
          <div class="env-tile"><h4>Scenario total</h4><strong>${counts.total}</strong></div>
          <div class="env-tile"><h4>Parallelization scale</h4><strong>${process.env.CI ? 'CI' : 'Local'}</strong></div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Environment Variables</h3>
              <p>${envVars.length} report-safe configuration keys tracked</p>
            </div>
            <input class="env-search" id="envSearch" type="search" placeholder="Filter config keys...">
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Environment Key</th><th>Config Value</th><th>Variable Scope</th><th class="right">State</th></tr></thead>
              <tbody>${envRows}</tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  </main>

  <script id="report-data" type="application/json">${reportJsonForScript(payload)}</script>
  <script>
    const report = JSON.parse(document.getElementById('report-data').textContent);
    const testCases = report.testCases;
    let currentStatus = 'ALL';
    let currentSuite = 'All Modules';
    let selectedFailureId = (testCases.find(item => item.statusGroup === 'fail') || testCases[0] || {}).id;

    const globalSearch = document.getElementById('globalSearch');
    const navButtons = Array.from(document.querySelectorAll('[data-view-link]'));
    const panels = Array.from(document.querySelectorAll('.view-panel'));
    const executionRows = Array.from(document.querySelectorAll('.execution-row'));
    const statusButtons = Array.from(document.querySelectorAll('[data-status-filter]'));
    const suiteFilter = document.getElementById('suiteFilter');
    const executionCount = document.getElementById('executionCount');
    const failureDetail = document.getElementById('failureDetail');

    function escapeText(value) {
      return String(value || '').replace(/[&<>"']/g, function(char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
    }

    function showView(viewName) {
      panels.forEach(function(panel) {
        panel.classList.toggle('active', panel.id === viewName);
      });
      navButtons.forEach(function(button) {
        button.classList.toggle('active', button.dataset.viewLink === viewName && button.classList.contains('nav-button'));
      });
      if (viewName === 'failures') {
        renderFailure(selectedFailureId);
      }
    }

    navButtons.forEach(function(button) {
      button.addEventListener('click', function(event) {
        const viewName = button.dataset.viewLink;
        if (!viewName) return;
        event.preventDefault();
        showView(viewName);
      });
    });

    function detailRowFor(id) {
      return document.querySelector('[data-detail-for="' + CSS.escape(id) + '"]');
    }

    function applyExecutionFilters() {
      const term = (globalSearch ? globalSearch.value : '').trim().toLowerCase();
      let visible = 0;
      executionRows.forEach(function(row) {
        const matchesStatus = currentStatus === 'ALL'
          || row.dataset.status === currentStatus
          || (currentStatus === 'FAIL' && row.dataset.statusGroup === 'fail');
        const matchesSuite = currentSuite === 'All Modules' || row.dataset.suite === currentSuite;
        const matchesSearch = !term || row.dataset.search.includes(term);
        const shouldShow = matchesStatus && matchesSuite && matchesSearch;
        const detailRow = detailRowFor(row.dataset.caseId);
        row.hidden = !shouldShow;
        if (detailRow) detailRow.hidden = !shouldShow || !row.classList.contains('is-expanded');
        if (shouldShow) visible += 1;
      });
      if (executionCount) executionCount.textContent = visible;
    }

    if (globalSearch) {
      globalSearch.addEventListener('input', applyExecutionFilters);
    }
    statusButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        currentStatus = button.dataset.statusFilter || 'ALL';
        statusButtons.forEach(function(item) { item.classList.remove('active'); });
        button.classList.add('active');
        applyExecutionFilters();
      });
    });
    if (suiteFilter) {
      suiteFilter.addEventListener('change', function() {
        currentSuite = suiteFilter.value;
        applyExecutionFilters();
      });
    }

    executionRows.forEach(function(row) {
      row.addEventListener('click', function() {
        const wasExpanded = row.classList.contains('is-expanded');
        executionRows.forEach(function(item) {
          item.classList.remove('is-expanded');
          const detail = detailRowFor(item.dataset.caseId);
          if (detail) detail.hidden = true;
        });
        if (!wasExpanded) {
          row.classList.add('is-expanded');
          const detail = detailRowFor(row.dataset.caseId);
          if (detail) detail.hidden = row.hidden;
        }
      });
    });

    function statusPill(testCase) {
      return '<span class="status-pill ' + escapeText(testCase.statusClass) + '">' + escapeText(testCase.status) + '</span>';
    }

    function platformChips(testCase) {
      return testCase.platforms.map(function(platform) {
        const label = ({ chrome: 'CH', desktop: 'DS', mobile: 'MB', service: 'API', terminal: 'CLI' })[platform] || platform.slice(0, 3).toUpperCase();
        return '<span class="platform-chip" title="' + escapeText(platform) + '">' + escapeText(label) + '</span>';
      }).join('');
    }

    function renderFailure(id) {
      const failedCases = testCases.filter(function(item) { return item.statusGroup === 'fail'; });
      const testCase = testCases.find(function(item) { return item.id === id; }) || failedCases[0] || testCases[0];
      if (!failureDetail || !testCase) return;
      selectedFailureId = testCase.id;
      document.querySelectorAll('.failure-list-item').forEach(function(item) {
        item.classList.toggle('active', item.dataset.failureSelect === selectedFailureId);
      });
      const trace = testCase.stackTrace || testCase.errorSnippet || 'No diagnostic trace captured.';
      const snapshot = testCase.screenshotUrl
        ? '<a class="snapshot-frame has-image" href="' + escapeText(testCase.screenshotUrl) + '" target="_blank" rel="noreferrer"><img src="' + escapeText(testCase.screenshotUrl) + '" alt="Failure snapshot for ' + escapeText(testCase.name) + '"><span>Open snapshot</span></a>'
        : '<div class="snapshot-frame"><span class="snapshot-icon">?</span><strong>No Snapshot Attached</strong><p>No Playwright failure frame was matched to this scenario.</p></div>';
      failureDetail.innerHTML =
        '<header class="failure-title">' +
          statusPill(testCase) +
          '<span class="id-chip">ID: ' + escapeText(testCase.id) + '</span>' +
          '<h2>' + escapeText(testCase.name) + '</h2>' +
          '<p class="muted">Failed at diagnostic execution point: <span class="mono">' + escapeText(testCase.suite) + '</span></p>' +
        '</header>' +
        '<div class="failure-grid">' +
          '<section class="panel terminal-panel">' +
            '<div class="panel-header"><div><h3>Error Log & Stack Trace</h3><p>' + escapeText(testCase.failedStep || 'Scenario diagnostic output') + '</p></div></div>' +
            '<div class="panel-body"><pre id="activeTrace">' + escapeText(trace) + '</pre></div>' +
          '</section>' +
          '<aside class="failure-side">' +
            '<div class="panel meta-card">' +
              '<h3 style="margin:0;color:white;font-size:13px">Execution Metadata</h3>' +
              '<div class="meta-row"><span>Status</span><strong>' + escapeText(testCase.status) + '</strong></div>' +
              '<div class="meta-row"><span>Duration</span><strong>' + escapeText(testCase.duration) + '</strong></div>' +
              '<div class="meta-row"><span>Suite</span><strong>' + escapeText(testCase.suite) + '</strong></div>' +
              '<div class="meta-row"><span>Platform</span><strong><span class="platforms">' + platformChips(testCase) + '</span></strong></div>' +
            '</div>' +
            '<div class="copilot-card">' +
              '<h3>Diagnostic Copilot</h3>' +
              '<p>Static triage summary generated from the captured Cucumber error trace.</p>' +
              '<button class="primary-button" type="button" data-case-scroll="' + escapeText(testCase.id) + '">Open Execution Row</button>' +
            '</div>' +
            '<div class="panel suggested-card">' +
              '<div class="panel-header"><h3>Suggested action</h3></div>' +
              '<div class="panel-body">"' + escapeText(testCase.failedStep ? 'Start with the failed step and compare selector, network, and validation timing around this point.' : 'Review the full trace and retry with video/screenshot artifacts enabled.') + '"</div>' +
            '</div>' +
          '</aside>' +
        '</div>' +
        '<section class="panel">' +
          '<div class="panel-header"><h3>Failure Snapshot</h3></div>' +
          '<div style="padding:16px">' + snapshot + '</div>' +
        '</section>';
    }

    document.addEventListener('click', function(event) {
      const failureButton = event.target.closest('[data-failure-select]');
      if (failureButton) {
        event.preventDefault();
        renderFailure(failureButton.dataset.failureSelect);
        showView('failures');
        return;
      }
      const scrollButton = event.target.closest('[data-case-scroll]');
      if (scrollButton) {
        const id = scrollButton.dataset.caseScroll;
        showView('executions');
        const row = document.querySelector('[data-case-id="' + CSS.escape(id) + '"]');
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.click();
        }
      }
    });

    const copyTrace = document.getElementById('copyTrace');
    if (copyTrace) {
      copyTrace.addEventListener('click', function() {
        const trace = document.getElementById('activeTrace');
        if (trace && navigator.clipboard) {
          navigator.clipboard.writeText(trace.textContent || '');
          copyTrace.textContent = 'Trace Copied';
          setTimeout(function() { copyTrace.textContent = 'Copy Trace'; }, 1200);
        }
      });
    }

    const exportCsv = document.getElementById('exportCsv');
    if (exportCsv) {
      exportCsv.addEventListener('click', function() {
        const csvEscape = function(value) { return '"' + String(value || '').replace(/"/g, '""') + '"'; };
        const lines = ['ID,Name,Suite,Status,Duration,Failed Step'];
        testCases.forEach(function(testCase) {
          lines.push([testCase.id, testCase.name, testCase.suite, testCase.status, testCase.duration, testCase.failedStep || ''].map(csvEscape).join(','));
        });
        const blob = new Blob([lines.join('\\n')], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'testops_executions_report.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      });
    }

    const envSearch = document.getElementById('envSearch');
    if (envSearch) {
      envSearch.addEventListener('input', function() {
        const term = envSearch.value.trim().toLowerCase();
        document.querySelectorAll('[data-env-row]').forEach(function(row) {
          row.hidden = term && !row.dataset.search.includes(term);
        });
      });
    }

    const exportEnvironment = document.getElementById('exportEnvironment');
    if (exportEnvironment) {
      exportEnvironment.addEventListener('click', function() {
        const config = {
          framework: 'Playwright + Cucumber',
          runtime: '${escapeHtml(process.version)}',
          os: '${escapeHtml(process.platform)}',
          generatedAt: report.generatedAt,
          note: 'Secret values are intentionally omitted from the report export.'
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'testops_environment_export.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      });
    }

    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
      refreshButton.addEventListener('click', function() {
        refreshButton.textContent = 'OK';
        setTimeout(function() { refreshButton.textContent = 'RF'; }, 900);
      });
    }

    renderFailure(selectedFailureId);
    applyExecutionFilters();
  </script>
</body>
</html>`;
}

fs.mkdirSync(reportsDir, { recursive: true });

const data = loadReport();
const markdown = buildMarkdown(data);
const html = buildTestOpsHtml(data);

fs.writeFileSync(markdownSummaryPath, markdown);
fs.writeFileSync(htmlReportPath, html);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}
