import { betterChangeCountsMeta } from './better-change-counts/meta';

export const FEATURE_MANIFEST = [betterChangeCountsMeta] as const;

export type FeatureMeta = (typeof FEATURE_MANIFEST)[number];
