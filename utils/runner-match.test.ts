import { describe, expect, test } from 'bun:test';
import type { FeatureDefinition } from './feature';
import { featureMatches } from './runner-match';

function def(partial: Partial<FeatureDefinition>): FeatureDefinition {
  return {
    id: 't',
    name: 't',
    description: 't',
    init: () => {},
    ...partial,
  };
}

describe('featureMatches', () => {
  test('empty include matches all', () => {
    expect(featureMatches(def({}))).toBe(true);
  });

  test('include is OR', () => {
    expect(
      featureMatches(def({ include: [() => false, () => true] })),
    ).toBe(true);
    expect(featureMatches(def({ include: [() => false] }))).toBe(false);
  });

  test('exclude is OR reject', () => {
    expect(
      featureMatches(def({ include: [() => true], exclude: [() => true] })),
    ).toBe(false);
  });

  test('asLongAs is AND gate', () => {
    expect(
      featureMatches(
        def({
          include: [() => true],
          asLongAs: [() => true, () => false],
        }),
      ),
    ).toBe(false);
    expect(
      featureMatches(
        def({
          include: [() => true],
          asLongAs: [() => true, () => true],
        }),
      ),
    ).toBe(true);
  });
});
