import type { FileDiffStat } from '@/utils/gitlab-api';

export interface Summary {
  totalFiles: number;
  totalAdded: number;
  totalRemoved: number;
  codeFiles: number;
  codeAdded: number;
  codeRemoved: number;
  excluded: FileDiffStat[];
  partial: boolean;
}

export function isIgnored(file: FileDiffStat): boolean {
  return file.generated === true;
}

export function summarize(
  files: FileDiffStat[],
  partial = false,
): Summary {
  const excluded: FileDiffStat[] = [];
  let codeFiles = 0;
  let codeAdded = 0;
  let codeRemoved = 0;
  let totalAdded = 0;
  let totalRemoved = 0;

  for (const f of files) {
    totalAdded += f.added;
    totalRemoved += f.removed;
    if (isIgnored(f)) {
      excluded.push(f);
    } else {
      codeFiles += 1;
      codeAdded += f.added;
      codeRemoved += f.removed;
    }
  }

  return {
    totalFiles: files.length,
    totalAdded,
    totalRemoved,
    codeFiles,
    codeAdded,
    codeRemoved,
    excluded,
    partial,
  };
}
