import fs from 'node:fs';
import path from 'node:path';

const reportPath = path.resolve('e2e/reports/cucumber-report.json');
const summaryPath = path.resolve('e2e/reports/report-summary.md');

function durationMs(nanos = 0) {
  return Math.round(nanos / 1_000_000);
}

function statusForScenario(scenario) {
  const failedStep = scenario.steps?.find(step => step.result?.status === 'failed');
  if (failedStep) return 'failed';
  const skippedStep = scenario.steps?.find(step => step.result?.status === 'skipped');
  if (skippedStep) return 'skipped';
  const undefinedStep = scenario.steps?.find(step => step.result?.status === 'undefined');
  if (undefinedStep) return 'undefined';
  return 'passed';
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function buildSummary() {
  if (!fs.existsSync(reportPath)) {
    return [
      '# E2E Test Report',
      '',
      `Cucumber JSON report was not found at \`${reportPath}\`.`,
    ].join('\n');
  }

  const features = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const scenarios = [];

  for (const feature of features) {
    for (const element of feature.elements ?? []) {
      if (element.type !== 'scenario') continue;
      const status = statusForScenario(element);
      const duration = (element.steps ?? []).reduce((total, step) => total + durationMs(step.result?.duration), 0);
      scenarios.push({
        feature: feature.name,
        scenario: element.name,
        status,
        duration,
        failedStep: element.steps?.find(step => step.result?.status === 'failed')?.name ?? '',
      });
    }
  }

  const counts = scenarios.reduce(
    (acc, scenario) => {
      acc[scenario.status] = (acc[scenario.status] ?? 0) + 1;
      return acc;
    },
    { passed: 0, failed: 0, skipped: 0, undefined: 0 },
  );

  const total = scenarios.length;
  const passed = counts.passed ?? 0;
  const failed = counts.failed ?? 0;
  const skipped = counts.skipped ?? 0;
  const undefinedCount = counts.undefined ?? 0;
  const passRate = total ? Math.round((passed / total) * 100) : 0;

  const lines = [
    '# E2E Test Report',
    '',
    `**Result:** ${failed || undefinedCount ? 'Failed' : 'Passed'}`,
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Total scenarios | ${total} |`,
    `| Passed | ${passed} |`,
    `| Failed | ${failed} |`,
    `| Skipped | ${skipped} |`,
    `| Undefined | ${undefinedCount} |`,
    `| Pass rate | ${passRate}% |`,
    '',
    '## Report Files',
    '',
    '- Download the `e2e-cucumber-report-*` artifact from this workflow run.',
    '- Open `cucumber-report.html` from the artifact for the full interactive report.',
    '- This summary is also saved as `report-summary.md` inside the same artifact.',
  ];

  const failedScenarios = scenarios.filter(scenario => scenario.status === 'failed' || scenario.status === 'undefined');
  if (failedScenarios.length) {
    lines.push('', '## Failures', '', '| Feature | Scenario | Step | Status |', '| --- | --- | --- | --- |');
    for (const scenario of failedScenarios.slice(0, 25)) {
      lines.push(`| ${escapeCell(scenario.feature)} | ${escapeCell(scenario.scenario)} | ${escapeCell(scenario.failedStep)} | ${scenario.status} |`);
    }
  }

  lines.push('', '## Feature Summary', '', '| Feature | Passed | Failed | Skipped | Undefined |', '| --- | ---: | ---: | ---: | ---: |');
  const featureGroups = new Map();
  for (const scenario of scenarios) {
    const group = featureGroups.get(scenario.feature) ?? { passed: 0, failed: 0, skipped: 0, undefined: 0 };
    group[scenario.status] = (group[scenario.status] ?? 0) + 1;
    featureGroups.set(scenario.feature, group);
  }

  for (const [feature, group] of [...featureGroups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`| ${escapeCell(feature)} | ${group.passed ?? 0} | ${group.failed ?? 0} | ${group.skipped ?? 0} | ${group.undefined ?? 0} |`);
  }

  return `${lines.join('\n')}\n`;
}

fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
const summary = buildSummary();
fs.writeFileSync(summaryPath, summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
