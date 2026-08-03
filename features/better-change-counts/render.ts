import type { Summary } from './classify';

const ATTR = 'data-refined-gitlab';
const ID = 'better-change-counts';
const NATIVE_ATTR = 'data-rg-native-stats';

export function removeCodeStats(root: ParentNode = document): void {
  root.querySelectorAll(`[${ATTR}="${ID}"]`).forEach((el) => el.remove());
  restoreNativeStats(root);
}

function restoreNativeStats(root: ParentNode): void {
  root.querySelectorAll(`[${NATIVE_ATTR}]`).forEach((el) => {
    const original = el.getAttribute(NATIVE_ATTR);
    if (original !== null) el.textContent = original;
    el.removeAttribute(NATIVE_ATTR);
  });
}

function remember(el: Element): void {
  if (!el.hasAttribute(NATIVE_ATTR)) {
    el.setAttribute(NATIVE_ATTR, el.textContent ?? '');
  }
}

/**
 * GitLab's header stats can under-count (e.g. huge generated files). When we
 * show "excluding generated" next to them, rewrite the native totals from the
 * same metadata we use so left ≥ right.
 */
export function syncNativeStats(anchor: Element, summary: Summary): void {
  restoreNativeStats(anchor);

  const fileWord = summary.totalFiles === 1 ? 'file' : 'files';
  const fileRe = /\d[\d,]*\s*files?/i;

  for (const el of anchor.querySelectorAll('*')) {
    // Only leaf-ish text holders (no element children with text structure).
    if (el.children.length > 0) continue;
    const t = el.textContent ?? '';
    if (!fileRe.test(t)) continue;
    remember(el);
    el.textContent = t.replace(fileRe, `${summary.totalFiles} ${fileWord}`);
    break;
  }

  let setAdd = false;
  let setRem = false;

  for (const g of anchor.querySelectorAll('.diff-stats-group')) {
    const norm = (g.textContent ?? '').replace(/[\u2212\u2013]/g, '-');
    if (!setAdd && /\+\s*[\d,]+/.test(norm)) {
      patchStatGroup(g, summary.totalAdded);
      setAdd = true;
      continue;
    }
    if (!setRem && /(^|[^+\d])-\s*[\d,]+/.test(norm)) {
      patchStatGroup(g, summary.totalRemoved);
      setRem = true;
    }
  }
}

function patchStatGroup(group: Element, value: number): void {
  const spans = [...group.querySelectorAll('span')];
  // Common GL markup: <span>+</span><span>123</span>
  if (spans.length >= 2) {
    const num = spans[spans.length - 1]!;
    remember(num);
    num.textContent = String(value);
    return;
  }

  const leaves = [...group.querySelectorAll('*')].filter(
    (el) => el.children.length === 0 && /\d/.test(el.textContent ?? ''),
  );
  if (leaves.length > 0) {
    const num = leaves[leaves.length - 1]!;
    remember(num);
    num.textContent = String(value);
    return;
  }

  remember(group);
  const sign = (group.textContent ?? '').trim().startsWith('+') ? '+' : '−';
  group.textContent = `${sign}${value}`;
}

export function renderCodeStats(anchor: Element, summary: Summary): HTMLElement {
  removeCodeStats(anchor.ownerDocument ?? document);
  syncNativeStats(anchor, summary);

  const fileWord = summary.codeFiles === 1 ? 'file' : 'files';
  const minus = '−';

  const root = document.createElement('div');
  root.setAttribute(ATTR, ID);
  root.className = 'diff-stats gl-inline-flex rg-better-change-counts';

  root.innerHTML = `
    <div class="diff-stats-contents">
      <div class="diff-stats-group">
        <span class="gl-font-bold gl-text-subtle">${summary.codeFiles} ${fileWord}</span>
      </div>
      <div class="gl-flex" aria-label="Excluding generated files: +${summary.codeAdded} ${minus}${summary.codeRemoved}">
        <div class="diff-stats-group gl-flex gl-items-center gl-text-success gl-font-bold">
          <span>+</span> <span>${summary.codeAdded}</span>
        </div>
        <div class="diff-stats-group gl-flex gl-items-center gl-text-danger gl-font-bold">
          <span>${minus}</span> <span>${summary.codeRemoved}</span>
        </div>
      </div>
    </div>
  `.trim();

  const basenames = summary.excluded
    .slice(0, 5)
    .map((f) => f.path.split('/').pop() ?? f.path);
  const more =
    summary.excluded.length > 5
      ? ` (+${summary.excluded.length - 5} more)`
      : '';

  const excludedDelta = `+${summary.totalAdded - summary.codeAdded} ${minus}${summary.totalRemoved - summary.codeRemoved}`;
  root.title =
    summary.excluded.length === 0
      ? 'No generated files excluded'
      : `Excluded ${summary.excluded.length} generated file(s) (${excludedDelta})` +
        (basenames.length ? `: ${basenames.join(', ')}${more}` : '') +
        (summary.partial ? '. GitLab omitted some files from the list.' : '');

  root.setAttribute(
    'aria-label',
    `${summary.codeFiles} files excluding generated, +${summary.codeAdded} ${minus}${summary.codeRemoved}` +
      (summary.excluded.length
        ? `, ${summary.excluded.length} files excluded`
        : ''),
  );

  if (!anchor.parentElement) {
    throw new Error('better-change-counts: .diff-stats has no parent');
  }
  anchor.parentElement.insertBefore(root, anchor.nextSibling);
  return root;
}
