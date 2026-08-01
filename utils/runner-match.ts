import type { FeatureDefinition } from './feature';

export function featureMatches(def: FeatureDefinition): boolean {
  const include = def.include ?? [() => true];
  const exclude = def.exclude ?? [];
  const asLongAs = def.asLongAs ?? [() => true];

  return (
    include.some((fn) => fn()) &&
    !exclude.some((fn) => fn()) &&
    asLongAs.every((fn) => fn())
  );
}
