import { selectors } from '@/utils/selectors';
import type { FileDiffStat } from '@/utils/gitlab-api';

export function parsePlusMinus(
  statsText: string,
): { added: number; removed: number } | null {
  const text = statsText.replace(/[\u2212\u2013]/g, '-').replace(/,/g, '');
  const addedMatch = text.match(/\+(\d+)/);
  const removedMatch = text.match(/(?<!\d)-(\d+)/);
  if (!addedMatch && !removedMatch) return null;
  return {
    added: addedMatch ? Number(addedMatch[1]) : 0,
    removed: removedMatch ? Number(removedMatch[1]) : 0,
  };
}

export function scrapeFileStats(root: ParentNode = document): FileDiffStat[] {
  const headers = root.querySelectorAll(selectors.diffFileHeader);
  const out: FileDiffStat[] = [];
  for (const h of headers) {
    const pathEl = h.querySelector(selectors.diffFilePath);
    const path =
      pathEl?.getAttribute('title')?.trim() ||
      pathEl?.textContent?.trim() ||
      '';
    const statsEl = h.querySelector(selectors.diffFileStats);
    const statsText = statsEl?.textContent ?? h.textContent ?? '';
    const pm = parsePlusMinus(statsText);
    if (path && pm) out.push({ path, added: pm.added, removed: pm.removed });
  }
  return out;
}
