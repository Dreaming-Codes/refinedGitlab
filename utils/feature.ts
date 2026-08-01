import type { PageId } from './page-detect';
import type { GitLabRoute } from './gitlab-url';
import { rgWarn } from './debug';

export type FeatureId = string;

export type PageDetectFn = () => boolean;

export interface FeatureContext {
  signal: AbortSignal;
  runId: number;
  page: PageId;
  root: Document | Element;
  route: GitLabRoute | null;
}

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  description: string;
  defaultEnabled?: boolean;
  include?: PageDetectFn[];
  exclude?: PageDetectFn[];
  asLongAs?: PageDetectFn[];
  init: (
    ctx: FeatureContext,
  ) => void | (() => void) | Promise<void | (() => void)>;
  destroy?: () => void;
}

const registry = new Map<FeatureId, FeatureDefinition>();

export function feature(def: FeatureDefinition): void {
  if (registry.has(def.id)) {
    rgWarn(`duplicate feature id: ${def.id}`);
    return;
  }
  registry.set(def.id, { defaultEnabled: true, ...def });
}

export function getRegisteredFeatures(): FeatureDefinition[] {
  return [...registry.values()];
}

export function clearFeatureRegistry(): void {
  registry.clear();
}
