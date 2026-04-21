/**
 * Tests for the pdf-compare utility functions.
 * Uses Node.js built-in test runner (node --test).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsePageRange, normalizeText, detectRepeatingHeaderFooter, stripHeaderFooter } from '../scripts/utils.js';
import { difflib_unifiedDiff } from '../scripts/text_diff.js';

describe('parsePageRange', () => {
  it('returns all pages for null/empty spec', () => {
    assert.deepStrictEqual(parsePageRange(null, 5), [0, 1, 2, 3, 4]);
    assert.deepStrictEqual(parsePageRange('', 3), [0, 1, 2]);
  });

  it('parses single page numbers', () => {
    assert.deepStrictEqual(parsePageRange('2', 5), [1]);
    assert.deepStrictEqual(parsePageRange('1,3,5', 5), [0, 2, 4]);
  });

  it('parses page ranges', () => {
    assert.deepStrictEqual(parsePageRange('1-3', 5), [0, 1, 2]);
    assert.deepStrictEqual(parsePageRange('2-4,7', 10), [1, 2, 3, 6]);
  });

  it('deduplicates and sorts', () => {
    assert.deepStrictEqual(parsePageRange('3,1,2,1', 5), [0, 1, 2]);
  });

  it('throws on out of range', () => {
    assert.throws(() => parsePageRange('0', 5));
    assert.throws(() => parsePageRange('6', 5));
    assert.throws(() => parsePageRange('3-6', 5));
  });

  it('throws on malformed spec', () => {
    assert.throws(() => parsePageRange('abc', 5));
  });
});

describe('normalizeText', () => {
  it('strips leading/trailing whitespace', () => {
    assert.strictEqual(normalizeText('  hello  '), 'hello');
  });

  it('collapses horizontal whitespace', () => {
    assert.strictEqual(normalizeText('hello   world\tfoo'), 'hello world foo');
  });

  it('collapses excessive newlines', () => {
    assert.strictEqual(normalizeText('a\n\n\n\n\nb'), 'a\n\nb');
  });

  it('can disable normalization', () => {
    assert.strictEqual(normalizeText('  hi  ', { collapseWhitespace: false, strip: false }), '  hi  ');
  });
});

describe('detectRepeatingHeaderFooter', () => {
  it('detects repeated first/last lines', () => {
    const pages = [
      'Header Line\nContent A\nFooter Line',
      'Header Line\nContent B\nFooter Line',
      'Header Line\nContent C\nFooter Line',
    ];
    const { header, footer } = detectRepeatingHeaderFooter(pages, 3);
    assert.strictEqual(header, 'Header Line');
    assert.strictEqual(footer, 'Footer Line');
  });

  it('returns null when below threshold', () => {
    const pages = [
      'Header\nContent\nFooter',
      'Different\nContent\nAlso Different',
    ];
    const { header, footer } = detectRepeatingHeaderFooter(pages, 3);
    assert.strictEqual(header, null);
    assert.strictEqual(footer, null);
  });
});

describe('stripHeaderFooter', () => {
  it('removes matching header and footer', () => {
    const result = stripHeaderFooter('Header\nContent Line 1\nContent Line 2\nFooter', 'Header', 'Footer');
    assert.strictEqual(result, 'Content Line 1\nContent Line 2');
  });

  it('handles null header/footer', () => {
    const result = stripHeaderFooter('Line 1\nLine 2', null, null);
    assert.strictEqual(result, 'Line 1\nLine 2');
  });
});

describe('difflib_unifiedDiff', () => {
  it('identical inputs produce no +/- lines', () => {
    const lines = ['hello', 'world'];
    const diff = difflib_unifiedDiff(lines, lines);
    const changes = diff.filter(l => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'));
    assert.strictEqual(changes.length, 0);
  });

  it('detects insertions', () => {
    const left = ['hello', 'world'];
    const right = ['hello', 'beautiful', 'world'];
    const diff = difflib_unifiedDiff(left, right);
    const insertions = diff.filter(l => l.startsWith('+') && !l.startsWith('+++'));
    assert.ok(insertions.length > 0, 'Should have at least one insertion');
  });

  it('detects deletions', () => {
    const left = ['hello', 'beautiful', 'world'];
    const right = ['hello', 'world'];
    const diff = difflib_unifiedDiff(left, right);
    const deletions = diff.filter(l => l.startsWith('-') && !l.startsWith('---'));
    assert.ok(deletions.length > 0, 'Should have at least one deletion');
  });
});
