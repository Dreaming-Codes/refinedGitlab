import type { FeatureContext } from '@/utils/feature';
import { getCurrentRunId } from '@/utils/runner';
import { waitForElement } from '@/utils/dom';
import { selectors } from '@/utils/selectors';
import { loadDiffStats } from './load-stats';
import { summarize } from './classify';
import { removeCodeStats, renderCodeStats } from './render';
import { rgDebug, rgError } from '@/utils/debug';

export async function initBetterChangeCounts(
  ctx: FeatureContext,
): Promise<() => void> {
  const cleanup = () => removeCodeStats(ctx.root);

  if (!ctx.route || ctx.route.mrIid == null) {
    return cleanup;
  }

  const statsPromise = loadDiffStats(ctx.route, ctx.page, ctx.signal);

  const anchor = await waitForElement(selectors.diffStats, {
    root: ctx.root,
    signal: ctx.signal,
    timeoutMs: 12_000,
  });

  if (ctx.signal.aborted || ctx.runId !== getCurrentRunId()) return cleanup;

  if (!anchor) {
    rgError('better-change-counts: .diff-stats not found');
    return cleanup;
  }

  const { files, partial } = await statsPromise;
  if (ctx.signal.aborted || ctx.runId !== getCurrentRunId()) return cleanup;

  if (files.length === 0) {
    rgError('better-change-counts: no file stats from metadata/scrape');
    return cleanup;
  }

  const summary = summarize(files, partial);
  if (summary.excluded.length === 0) return cleanup;

  renderCodeStats(anchor, summary);
  rgDebug('better-change-counts: rendered', summary);
  return cleanup;
}
