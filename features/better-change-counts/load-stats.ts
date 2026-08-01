import type { PageId } from '@/utils/page-detect';
import type { GitLabRoute } from '@/utils/gitlab-url';
import { type FileDiffStat, fetchMrDiffsMetadata } from '@/utils/gitlab-api';
import { scrapeFileStats } from './scrape';
import { rgDebug } from '@/utils/debug';

export async function loadDiffStats(
  route: GitLabRoute,
  page: PageId,
  signal?: AbortSignal,
): Promise<{ files: FileDiffStat[]; partial: boolean }> {
  switch (page) {
    case 'merge-request':
    case 'merge-request-diffs':
      return loadMr(route, signal);
    default:
      return { files: [], partial: false };
  }
}

async function loadMr(
  route: GitLabRoute,
  signal?: AbortSignal,
): Promise<{ files: FileDiffStat[]; partial: boolean }> {
  try {
    const files = await fetchMrDiffsMetadata(route, signal);
    if (files.length > 0) {
      rgDebug('diffs_metadata', files.length);
      return { files, partial: false };
    }
  } catch (err) {
    if (signal?.aborted) return { files: [], partial: false };
    rgDebug('diffs_metadata failed', err);
  }

  if (signal?.aborted) return { files: [], partial: false };

  const scraped = scrapeFileStats();
  if (scraped.length > 0) {
    rgDebug('dom scrape', scraped.length);
    return { files: scraped, partial: false };
  }

  return { files: [], partial: false };
}
