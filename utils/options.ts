import type { FeatureId } from './feature';
import { FEATURE_MANIFEST } from '@/features/manifest';

const STORAGE_KEY = 'refined-gitlab-options';

export interface ExtensionOptions {
  features: Record<string, boolean>;
  extraIgnorePatterns: string[];
  disabledIgnorePatternIds: string[];
  enabledOptionalIgnorePatternIds: string[];
}

export const DEFAULT_OPTIONS: ExtensionOptions = {
  features: Object.fromEntries(
    FEATURE_MANIFEST.map((m) => [m.id, m.defaultEnabled ?? true]),
  ),
  extraIgnorePatterns: [],
  disabledIgnorePatternIds: [],
  enabledOptionalIgnorePatternIds: [],
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function mergeOptions(raw: unknown): ExtensionOptions {
  const base: ExtensionOptions = {
    features: { ...DEFAULT_OPTIONS.features },
    extraIgnorePatterns: [...DEFAULT_OPTIONS.extraIgnorePatterns],
    disabledIgnorePatternIds: [...DEFAULT_OPTIONS.disabledIgnorePatternIds],
    enabledOptionalIgnorePatternIds: [
      ...DEFAULT_OPTIONS.enabledOptionalIgnorePatternIds,
    ],
  };

  if (!isRecord(raw)) return base;

  if (isRecord(raw.features)) {
    for (const [k, v] of Object.entries(raw.features)) {
      if (typeof v === 'boolean') base.features[k] = v;
    }
  }
  if (Array.isArray(raw.extraIgnorePatterns)) {
    base.extraIgnorePatterns = raw.extraIgnorePatterns.filter(
      (p): p is string => typeof p === 'string',
    );
  }
  if (Array.isArray(raw.disabledIgnorePatternIds)) {
    base.disabledIgnorePatternIds = raw.disabledIgnorePatternIds.filter(
      (p): p is string => typeof p === 'string',
    );
  }
  if (Array.isArray(raw.enabledOptionalIgnorePatternIds)) {
    base.enabledOptionalIgnorePatternIds =
      raw.enabledOptionalIgnorePatternIds.filter(
        (p): p is string => typeof p === 'string',
      );
  }

  return base;
}

export async function getOptions(): Promise<ExtensionOptions> {
  const result = await browser.storage.sync.get(STORAGE_KEY);
  return mergeOptions(result[STORAGE_KEY]);
}

export async function setOptions(
  patch: Partial<ExtensionOptions>,
): Promise<ExtensionOptions> {
  const current = await getOptions();
  const next: ExtensionOptions = {
    features: { ...current.features, ...(patch.features ?? {}) },
    extraIgnorePatterns:
      patch.extraIgnorePatterns ?? current.extraIgnorePatterns,
    disabledIgnorePatternIds:
      patch.disabledIgnorePatternIds ?? current.disabledIgnorePatternIds,
    enabledOptionalIgnorePatternIds:
      patch.enabledOptionalIgnorePatternIds ??
      current.enabledOptionalIgnorePatternIds,
  };
  await browser.storage.sync.set({ [STORAGE_KEY]: next });
  return next;
}

export async function setFeatureEnabled(
  id: FeatureId,
  enabled: boolean,
): Promise<void> {
  await setOptions({ features: { [id]: enabled } });
}

export function onOptionsChanged(listener: () => void): () => void {
  const handler: Parameters<typeof browser.storage.onChanged.addListener>[0] = (
    changes,
    area,
  ) => {
    if (area !== 'sync') return;
    if (STORAGE_KEY in changes) listener();
  };
  browser.storage.onChanged.addListener(handler);
  return () => browser.storage.onChanged.removeListener(handler);
}
