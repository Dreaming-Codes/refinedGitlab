import { describe, expect, test } from 'bun:test';
import { normalizeDiffFiles } from './gitlab-api';

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
});
