import {
  type FeatureContext,
  type FeatureDefinition,
  type FeatureId,
  getRegisteredFeatures,
} from './feature';
import { featureMatches } from './runner-match';
import { detectPage, isGitLabApp } from './page-detect';
import { parseGitLabRoute } from './gitlab-url';
import { rgDebug, rgError } from './debug';

interface ActiveFeature {
  def: FeatureDefinition;
  cleanup?: () => void;
  controller: AbortController;
}

const active = new Map<FeatureId, ActiveFeature>();
let currentRunId = 0;

let pending: {
  enabledMap: Record<FeatureId, boolean>;
  reason: 'nav' | 'options' | 'boot';
} | null = null;

let executing = false;

export function scheduleRunFeatures(
  enabledMap: Record<FeatureId, boolean>,
  reason: 'nav' | 'options' | 'boot',
): void {
  currentRunId += 1;
  abortAllActive();
  pending = { enabledMap, reason };

  if (!executing) {
    executing = true;
    void drainLoop();
  }
}

async function drainLoop(): Promise<void> {
  try {
    while (pending) {
      const job = pending;
      pending = null;
      const runId = currentRunId;
      try {
        await runFeatures(job.enabledMap, job.reason, runId);
      } catch (err) {
        rgError('runFeatures failed', err);
      }
    }
  } finally {
    executing = false;
    if (pending) {
      executing = true;
      void drainLoop();
    }
  }
}

function abortAllActive(): void {
  for (const entry of active.values()) {
    entry.controller.abort();
  }
}

async function runFeatures(
  enabledMap: Record<FeatureId, boolean>,
  reason: string,
  runId: number,
): Promise<void> {
  await teardownAll();
  if (runId !== currentRunId) return;

  if (!isGitLabApp()) {
    rgDebug('skip: not GitLab', reason);
    return;
  }

  const page = detectPage();
  const route = parseGitLabRoute();
  rgDebug('run', { reason, runId, page, path: location.pathname });

  for (const def of getRegisteredFeatures()) {
    if (runId !== currentRunId) return;

    const enabled = enabledMap[def.id] ?? def.defaultEnabled ?? true;
    if (!enabled || !featureMatches(def)) continue;

    const controller = new AbortController();
    if (runId !== currentRunId) {
      controller.abort();
      return;
    }

    const ctx: FeatureContext = {
      signal: controller.signal,
      runId,
      page,
      root: document,
      route,
    };

    active.set(def.id, { def, controller });

    try {
      const cleanup = await def.init(ctx);
      if (runId !== currentRunId || controller.signal.aborted) {
        if (typeof cleanup === 'function') cleanup();
        else def.destroy?.();
        active.delete(def.id);
        continue;
      }
      active.set(def.id, {
        def,
        cleanup: typeof cleanup === 'function' ? cleanup : def.destroy,
        controller,
      });
    } catch (err) {
      if (!controller.signal.aborted) {
        rgError(`${def.id} init failed`, err);
      }
      active.delete(def.id);
      controller.abort();
    }
  }
}

async function teardownAll(): Promise<void> {
  for (const id of [...active.keys()]) {
    await teardown(id);
  }
}

async function teardown(id: FeatureId): Promise<void> {
  const entry = active.get(id);
  if (!entry) return;
  active.delete(id);
  entry.controller.abort();
  try {
    entry.cleanup?.();
  } catch (err) {
    rgError(`${id} cleanup failed`, err);
  }
}

export function getCurrentRunId(): number {
  return currentRunId;
}
