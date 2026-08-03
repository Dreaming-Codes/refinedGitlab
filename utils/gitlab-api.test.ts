import { describe, expect, test } from 'bun:test';
import { mergeGeneratedFlags, normalizeDiffFiles } from './gitlab-api';

describe('normalizeDiffFiles', () => {
  test('diff_files envelope', () => {
    const files = normalizeDiffFiles({
      diff_files: [
        {
          new_path: 'a.ts',
          old_path: 'a.ts',
          added_lines: 2,
          removed_lines: 1,
        },
      ],
    });
    expect(files).toEqual([
      { path: 'a.ts', oldPath: 'a.ts', added: 2, removed: 1 },
    ]);
  });

  test('bare array', () => {
    const files = normalizeDiffFiles([
      { new_path: 'b.ts', added_lines: 5, removed_lines: 0 },
    ]);
    expect(files[0]?.path).toBe('b.ts');
    expect(files[0]?.added).toBe(5);
  });

  test('reads generated_file from GitLab', () => {
    const files = normalizeDiffFiles({
      diff_files: [
        {
          new_path: 'MODULE.bazel.lock',
          added_lines: 1,
          removed_lines: 2,
          generated_file: true,
        },
        {
          new_path: 'src/main.rs',
          added_lines: 3,
          removed_lines: 0,
          generated_file: false,
        },
      ],
    });
    expect(files[0]).toEqual({
      path: 'MODULE.bazel.lock',
      added: 1,
      removed: 2,
      generated: true,
    });
    expect(files[1]).toEqual({
      path: 'src/main.rs',
      added: 3,
      removed: 0,
      generated: false,
    });
  });

  test('accepts camelCase generatedFile', () => {
    const files = normalizeDiffFiles([
      { newPath: 'x.lock', addedLines: 1, generatedFile: true },
    ]);
    expect(files[0]?.generated).toBe(true);
  });

  test('reads viewer.generated from full diff entities', () => {
    const files = normalizeDiffFiles([
      {
        new_path: 'out.min.js',
        added_lines: 1,
        viewer: { generated: true },
      },
    ]);
    expect(files[0]?.generated).toBe(true);
  });
});

describe('mergeGeneratedFlags', () => {
  test('marks matching paths from REST set', () => {
    const merged = mergeGeneratedFlags(
      [
        { path: 'src/a.ts', added: 1, removed: 0 },
        { path: 'MODULE.bazel.lock', added: 19, removed: 667 },
        { path: 'Cargo.lock', oldPath: 'Cargo.lock', added: 2, removed: 1 },
      ],
      new Set(['MODULE.bazel.lock', 'Cargo.lock']),
    );
    expect(merged.map((f) => f.generated)).toEqual([undefined, true, true]);
    expect(merged[1]?.added).toBe(19);
  });
});
