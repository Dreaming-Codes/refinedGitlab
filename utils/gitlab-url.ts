export interface GitLabRoute {
  origin: string;
  fullPath: string;
  mrIid?: number;
  commitSha?: string;
  compareSpec?: string;
}

export function parseGitLabRoute(
  url: Location | URL = location,
): GitLabRoute | null {
  const pathname = url.pathname.replace(/\/{2,}/g, '/');
  const sep = '/-/';
  const idx = pathname.indexOf(sep);
  if (idx <= 0) return null;

  const fullPath = pathname.slice(1, idx);
  if (!fullPath || fullPath.includes('..')) return null;

  const rest = pathname.slice(idx + sep.length);
  const origin = 'origin' in url ? url.origin : location.origin;

  let mrIid: number | undefined;
  let commitSha: string | undefined;
  let compareSpec: string | undefined;

  const mr = /^merge_requests\/(\d+)/.exec(rest);
  if (mr) mrIid = Number(mr[1]);

  const commit = /^commit\/([0-9a-f]{7,40})/i.exec(rest);
  if (commit) commitSha = commit[1];

  const compare = /^compare\/(.+?)(?:\/|$)/.exec(rest);
  if (compare) compareSpec = compare[1];

  return { origin, fullPath, mrIid, commitSha, compareSpec };
}

export function encodeProjectPath(fullPath: string): string {
  return fullPath.split('/').map(encodeURIComponent).join('%2F');
}

export function mrDiffsMetadataUrl(route: GitLabRoute): string {
  if (route.mrIid == null) throw new Error('not an MR route');
  const path = route.fullPath.split('/').map(encodeURIComponent).join('/');
  return `${route.origin}/${path}/-/merge_requests/${route.mrIid}/diffs_metadata.json`;
}
