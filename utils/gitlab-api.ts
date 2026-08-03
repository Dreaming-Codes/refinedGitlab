import type { GitLabRoute } from './gitlab-url';
import { mrDiffsMetadataUrl, mrRestDiffsUrl } from './gitlab-url';
import { rgDebug, rgWarn } from './debug';

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

function asGenerated(o: Record<string, unknown>): boolean | undefined {
  if (
    o.generated_file === true ||
    o.generatedFile === true ||
    o.generated === true
  ) {
    return true;
  }
  if (o.viewer && typeof o.viewer === 'object') {
    const v = o.viewer as Record<string, unknown>;
    if (v.generated === true) return true;
    if (v.generated === false) return false;
  }
  if (
    o.generated_file === false ||
    o.generatedFile === false ||
    o.generated === false
  ) {
    return false;
  }
  return undefined;
}

function normalizeFile(raw: unknown): FileDiffStat | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const path = asString(o.new_path) || asString(o.newPath) || asString(o.path);
  if (!path) return null;
  const oldPath = asString(o.old_path) || asString(o.oldPath) || undefined;
  const generated = asGenerated(o);
  return {
    path,
    oldPath: oldPath || undefined,
    added: asNumber(o.added_lines ?? o.addedLines ?? o.added),
    removed: asNumber(o.removed_lines ?? o.removedLines ?? o.removed),
    ...(generated !== undefined ? { generated } : {}),
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

/** Apply generated flags from REST diffs onto metadata rows (matched by path). */
export function mergeGeneratedFlags(
  files: FileDiffStat[],
  generatedPaths: ReadonlySet<string>,
): FileDiffStat[] {
  if (generatedPaths.size === 0) return files;
  return files.map((f) => {
    if (
      generatedPaths.has(f.path) ||
      (f.oldPath !== undefined && generatedPaths.has(f.oldPath))
    ) {
      return f.generated === true ? f : { ...f, generated: true };
    }
    return f;
  });
}

async function fetchJson(
  url: string,
  signal?: AbortSignal,
): Promise<{ data: unknown; res: Response }> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return { data: await res.json(), res };
}

/**
 * diffs_metadata.json has line counts but not generated_file.
 * REST /diffs has generated_file (and full patch text we discard).
 */
export async function fetchGeneratedPaths(
  route: GitLabRoute,
  signal?: AbortSignal,
): Promise<Set<string>> {
  const paths = new Set<string>();
  let page = 1;

  for (;;) {
    const { data, res } = await fetchJson(mrRestDiffsUrl(route, page), signal);
    const files = normalizeDiffFiles(data);
    for (const f of files) {
      if (f.generated === true) {
        paths.add(f.path);
        if (f.oldPath) paths.add(f.oldPath);
      }
    }

    const next = res.headers.get('x-next-page');
    if (!next) break;
    const n = Number(next);
    if (!Number.isFinite(n) || n <= page) break;
    page = n;
  }

  return paths;
}

export async function fetchMrDiffsMetadata(
  route: GitLabRoute,
  signal?: AbortSignal,
): Promise<FileDiffStat[]> {
  const metaPromise = fetchJson(mrDiffsMetadataUrl(route), signal).then(
    ({ data }) => normalizeDiffFiles(data),
  );

  // generated flags are not on diffs_metadata; pull them from REST in parallel
  const generatedPromise = fetchGeneratedPaths(route, signal).catch((err) => {
    // Session may lack API access; feature degrades to "nothing generated"
    rgWarn('REST diffs (generated_file) failed', err);
    return new Set<string>();
  });

  const [files, generatedPaths] = await Promise.all([
    metaPromise,
    generatedPromise,
  ]);

  rgDebug(
    'diffs_metadata',
    files.length,
    'generated_file',
    generatedPaths.size,
  );
  return mergeGeneratedFlags(files, generatedPaths);
}
