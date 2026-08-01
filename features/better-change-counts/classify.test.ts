import { describe, expect, test } from 'bun:test';
import { DEFAULT_OPTIONS } from '@/utils/options';
import { summarize } from './classify';

describe('summarize', () => {
  test('excludes lockfiles from code totals', () => {
    const summary = summarize(
      [
        { path: 'src/main.ts', added: 10, removed: 2 },
        { path: 'package-lock.json', added: 3000, removed: 0 },
        { path: 'yarn.lock', added: 500, removed: 1 },
      ],
      DEFAULT_OPTIONS,
    );

    expect(summary.codeFiles).toBe(1);
    expect(summary.codeAdded).toBe(10);
    expect(summary.codeRemoved).toBe(2);
    expect(summary.excluded.map((f) => f.path)).toEqual([
      'package-lock.json',
      'yarn.lock',
    ]);
    expect(summary.totalAdded).toBe(3510);
  });

  test('nested lock path', () => {
    const summary = summarize(
      [{ path: 'apps/web/pnpm-lock.yaml', added: 9, removed: 0 }],
      DEFAULT_OPTIONS,
    );
    expect(summary.excluded).toHaveLength(1);
    expect(summary.codeFiles).toBe(0);
  });

  test('tier B vendor off by default', () => {
    const summary = summarize(
      [{ path: 'vendor/lib/foo.go', added: 4, removed: 0 }],
      DEFAULT_OPTIONS,
    );
    expect(summary.codeFiles).toBe(1);
    expect(summary.excluded).toHaveLength(0);
  });

  test('tier B vendor when opted in', () => {
    const summary = summarize(
      [{ path: 'vendor/lib/foo.go', added: 4, removed: 0 }],
      {
        ...DEFAULT_OPTIONS,
        enabledOptionalIgnorePatternIds: ['vendor-dir'],
      },
    );
    expect(summary.excluded).toHaveLength(1);
  });
});
