import type { GitLabRoute } from './gitlab-url';
import { mrDiffsMetadataUrl } from './gitlab-url';

export interface FileDiffStat {
  path: string;
  oldPath?: string;
  added: number;
  removed: number;
  generated?: boolean;
}

function asNumber(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function normalizeFile(raw: unknown): FileDiffStat | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const path = asString(o.new_path) || asString(o.newPath) || asString(o.path);
  if (!path) return null;
  const oldPath = asString(o.old_path) || asString(o.oldPath) || undefined;
  return {
    path,
    oldPath: oldPath || undefined,
    added: asNumber(o.added_lines ?? o.addedLines ?? o.added),
    removed: asNumber(o.removed_lines ?? o.removedLines ?? o.removed),
  };
}

export function normalizeDiffFiles(data: unknown): FileDiffStat[] {
  if (!data) return [];

  let list: unknown[] | undefined;

  if (Array.isArray(data)) {
    list = data;
  } else if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.diff_files)) list = o.diff_files;
    else if (Array.isArray(o.diffFiles)) list = o.diffFiles;
    else if (Array.isArray(o.files)) list = o.files;
    else if (o.data && typeof o.data === 'object') {
      const d = o.data as Record<string, unknown>;
      if (Array.isArray(d.diff_files)) list = d.diff_files;
      else if (Array.isArray(d.files)) list = d.files;
    }
  }

  if (!list) return [];

  const out: FileDiffStat[] = [];
  for (const item of list) {
    const f = normalizeFile(item);
    if (f) out.push(f);
  }
  return out;
}

export async function fetchMrDiffsMetadata(
  route: GitLabRoute,
  signal?: AbortSignal,
): Promise<FileDiffStat[]> {
  const url = mrDiffsMetadataUrl(route);
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw new Error(`diffs_metadata ${res.status}`);
  const data: unknown = await res.json();
  return normalizeDiffFiles(data);
}
