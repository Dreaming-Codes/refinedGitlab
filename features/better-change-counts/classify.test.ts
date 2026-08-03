import { describe, expect, test } from 'bun:test';
import { summarize } from './classify';

describe('summarize', () => {
  test('excludes only files GitLab marks generated', () => {
    const summary = summarize([
      { path: 'src/main.ts', added: 10, removed: 2 },
      {
        path: 'MODULE.bazel.lock',
        added: 19,
        removed: 667,
        generated: true,
      },
      { path: 'Cargo.lock', added: 3000, removed: 0, generated: true },
      // path alone is not enough — must be flagged by GitLab
      { path: 'yarn.lock', added: 500, removed: 1 },
    ]);

    expect(summary.codeFiles).toBe(2);
    expect(summary.codeAdded).toBe(510);
    expect(summary.codeRemoved).toBe(3);
    expect(summary.excluded.map((f) => f.path)).toEqual([
      'MODULE.bazel.lock',
      'Cargo.lock',
    ]);
    expect(summary.totalAdded).toBe(3529);
  });

  test('nothing excluded without generated flag', () => {
    const summary = summarize([
      { path: 'package-lock.json', added: 9, removed: 0 },
      { path: 'vendor/lib/foo.go', added: 4, removed: 0 },
    ]);
    expect(summary.codeFiles).toBe(2);
    expect(summary.excluded).toHaveLength(0);
  });
});
