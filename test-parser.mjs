import { build } from 'esbuild';
import { writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const SRC = 'C:\\Users\\Gregory\\Documents\\deepseek-harness\\default-workspace\\_tc\\TimeConverter-main\\src';
const TMP = 'C:\\Users\\Gregory\\Documents\\deepseek-harness\\default-workspace\\_tc\\parser-test';

await mkdir(TMP, { recursive: true });
const outfile = TMP + '\\timeUtils.mjs';

await build({
  entryPoints: [SRC + '\\utils\\timeUtils.ts'],
  outfile,
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  logLevel: 'warning',
});

const { parseTimeAndSeconds, classifyPasteToken, splitPastedValues } = await import(
  pathToFileURL(outfile).href
);

const TAB = '\t';
const NL = '\n';

const cases = [
  // [input, expected kind, expected base HH:MM:SS, expected delta]
  ['07:51:06' + TAB + '547', 'base+delta', '07:51:06', 547],
  ['07:51:06 547', 'base+delta', '07:51:06', 547],
  ['07:51:06' + NL + '547', 'base+delta', '07:51:06', 547],
  ['07:51:06,547', 'base+delta', '07:51:06', 547],
  ['07:51:06;547', 'base+delta', '07:51:06', 547],
  ['547' + TAB + '07:51:06', 'base+delta', '07:51:06', 547],
  ['01:30:00' + TAB + '1800', 'base+delta', '01:30:00', 1800],
  // "07:51" is a minutes:seconds span (7m51s), so it pairs with another number
  // about as well as "547" does — refusing to guess is the safe outcome.
  ['07:51' + TAB + '547', 'ambiguous'],
  ['2h 30m' + TAB + '547', 'base+delta', '02:30:00', 547],
  ['00:00:00' + TAB + '0', 'base+delta', '00:00:00', 0],
  ['07:51:06' + TAB + '1.234', 'base+delta', '07:51:06', 1234],
  ['07:51:06' + TAB + '1.500', 'base+delta', '07:51:06', 1500],
  ['07:51:06' + TAB + '1.5', 'base+delta', '07:51:06', 2],
  // Two times: a difference, not a sum, so no guessing.
  ['07:51:06' + TAB + '1.5m', 'ambiguous'],
  // Ambiguous / non-matching inputs
  ['07:51:06' + TAB + '08:00:00', 'ambiguous'],
  ['547' + TAB + '120', 'ambiguous'],
  ['07:51:06', 'none'],
  ['547', 'none'],
  ['07:51:06' + TAB + '547' + TAB + '99', 'none'],
  ['hola' + TAB + '547', 'none'],
  ['07:51:06' + TAB + '547x', 'none'],
  ['07:51:06' + TAB + '', 'none'],
  ['', 'none'],
  // Both values share the same shape -> never guess
  ['12:00:00' + TAB + '3:00:00', 'ambiguous'],
];

// Cases where the values are run together without an explicit separator.
const spaceCases = [
  ['07:51:06 547', 'base+delta', '07:51:06', 547],
  ['547 07:51:06', 'base+delta', '07:51:06', 547],
  ['2h 30m 547', 'base+delta', '02:30:00', 547],
  ['1h 30m 1800', 'base+delta', '01:30:00', 1800],
  // A plain number is NOT read as HH:MM, so these stay ambiguous on purpose.
  ['547 120', 'ambiguous'],
  ['7:51 547', 'ambiguous'],
];

let failures = 0;
const fmt = (parts) =>
  parts
    ? `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}:${String(parts.seconds).padStart(2, '0')}`
    : '';

for (const [input, expectedKind, expectedBase, expectedDelta] of [...cases, ...spaceCases]) {
  const result = parseTimeAndSeconds(input);
  const label = JSON.stringify(input).replace(/\\t/g, '<TAB>').replace(/\\n/g, '<NL>');

  let ok = result.kind === expectedKind;
  let actual = result.kind;
  if (ok && result.kind === 'base+delta') {
    const base = fmt(result.base);
    ok = base === expectedBase && result.deltaSeconds === expectedDelta;
    actual = `${base} + ${result.deltaSeconds}s`;
  }

  if (!ok) failures++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(44)} -> ${String(actual).padEnd(20)}` +
      (ok ? '' : ` (expected ${expectedKind}${expectedBase ? ` ${expectedBase} + ${expectedDelta}s` : ''})`)
  );
}

// Tokenizer sanity: the tab-separated spreadsheet row must yield exactly two values.
const split = splitPastedValues('07:51:06' + TAB + '547');
console.log('\nsplitPastedValues ->', JSON.stringify(split));
const kinds = split.map((t) => classifyPasteToken(t)?.kind).join(', ');
console.log('classify ->', kinds);

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'} (${cases.length} cases)`);
process.exit(failures === 0 ? 0 : 1);
