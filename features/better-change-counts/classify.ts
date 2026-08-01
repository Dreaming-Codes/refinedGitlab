import picomatch from 'picomatch';
import type { ExtensionOptions } from '@/utils/options';
import type { FileDiffStat } from '@/utils/gitlab-api';
import {
  DEFAULT_IGNORE_PATTERNS,
  MAX_PATTERN_LENGTH,
} from './default-ignore-patterns';

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

export function buildMatcher(options: ExtensionOptions) {
  const disabled = new Set(options.disabledIgnorePatternIds);
  const enabledOptional = new Set(options.enabledOptionalIgnorePatternIds);

  const patterns = DEFAULT_IGNORE_PATTERNS.filter((p) => {
    if (disabled.has(p.id)) return false;
    if (p.tier === 'A') return true;
    return enabledOptional.has(p.id);
  }).map((p) => p.pattern);

  const userPatterns = options.extraIgnorePatterns.filter(
    (p) => p.length > 0 && p.length <= MAX_PATTERN_LENGTH,
  );

  const isMatch = picomatch([...patterns, ...userPatterns], { dot: true });

  return {
    isIgnored(file: FileDiffStat): boolean {
      if (file.generated === true) return true;
      return isMatch(file.path) || (file.oldPath ? isMatch(file.oldPath) : false);
    },
  };
}

export function summarize(
  files: FileDiffStat[],
  options: ExtensionOptions,
  partial = false,
): Summary {
  const { isIgnored } = buildMatcher(options);
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
