import type { Summary } from './classify';

const ATTR = 'data-refined-gitlab';
const ID = 'better-change-counts';

export function removeCodeStats(root: ParentNode = document): void {
  root.querySelectorAll(`[${ATTR}="${ID}"]`).forEach((el) => el.remove());
}

export function renderCodeStats(anchor: Element, summary: Summary): HTMLElement {
  removeCodeStats(anchor.ownerDocument ?? document);

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
