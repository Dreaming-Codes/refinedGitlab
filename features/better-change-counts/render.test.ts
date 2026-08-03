import { afterEach, describe, expect, test } from 'bun:test';
import { parseHTML } from 'linkedom';
import { removeCodeStats, renderCodeStats } from './render';
import type { Summary } from './classify';

const { window } = parseHTML('<!doctype html><html><body></body></html>');
const document = window.document;
// render.ts uses global document
Object.assign(globalThis, { document, NodeFilter: window.NodeFilter });

function nativeBar(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  return root.querySelector('.diff-stats') as HTMLElement;
}

afterEach(() => {
  document.body.innerHTML = '';
});

const summary: Summary = {
  totalFiles: 32,
  totalAdded: 3179,
  totalRemoved: 990,
  codeFiles: 31,
  codeAdded: 3160,
  codeRemoved: 323,
  excluded: [
    {
      path: 'MODULE.bazel.lock',
      added: 19,
      removed: 667,
      generated: true,
    },
  ],
  partial: false,
};

describe('renderCodeStats', () => {
  test('rewrites under-counted native totals so left ≥ right', () => {
    const anchor = nativeBar(`
      <div class="diff-stats">
        <div class="diff-stats-contents">
          <div class="diff-stats-group">
            <span class="gl-font-bold gl-text-subtle">25 files</span>
          </div>
          <div class="gl-flex">
            <div class="diff-stats-group gl-text-success">
              <span>+</span><span>3129</span>
            </div>
            <div class="diff-stats-group gl-text-danger">
              <span>−</span><span>957</span>
            </div>
          </div>
        </div>
      </div>
    `);

    renderCodeStats(anchor, summary);

    expect(anchor.textContent).toContain('32 files');
    expect(anchor.textContent).toContain('3179');
    expect(anchor.textContent).toContain('990');

    const code = document.querySelector(
      '[data-refined-gitlab="better-change-counts"]',
    );
    expect(code?.textContent).toContain('31 files');
    expect(code?.textContent).toContain('3160');
    expect(code?.textContent).toContain('323');

    removeCodeStats(document);
    expect(anchor.textContent).toContain('25 files');
    expect(anchor.textContent).toContain('3129');
    expect(
      document.querySelector('[data-refined-gitlab="better-change-counts"]'),
    ).toBeNull();

    anchor.parentElement?.remove();
  });
});
