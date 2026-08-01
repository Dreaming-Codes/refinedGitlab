const MR_RE = /\/-\/merge_requests\/\d+/;
const MR_DIFFS_RE = /\/-\/merge_requests\/\d+\/diffs(?:\/|$|\?)/;
const COMMIT_RE = /\/-\/commit\/[0-9a-f]{7,40}/i;
const COMPARE_RE = /\/-\/compare\//;

export const isMRPage = (): boolean => MR_RE.test(location.pathname);
export const isMRDiffsPage = (): boolean => MR_DIFFS_RE.test(location.pathname);
export const isCommitPage = (): boolean => COMMIT_RE.test(location.pathname);
export const isComparePage = (): boolean => COMPARE_RE.test(location.pathname);

export function isGitLabApp(): boolean {
  const body = document.body;
  if (!body) return false;

  const hasCsrf = Boolean(document.querySelector('meta[name="csrf-token"]'));
  const hasDataPage = body.hasAttribute('data-page');
  const hasChrome = Boolean(
    document.querySelector(
      '.navbar-gitlab, .header-logged-in, #super-sidebar, header.navbar, #gl-header, .js-super-sidebar',
    ),
  );
  const hasGitlabMeta = Boolean(
    document.querySelector(
      'meta[name="gitlab-feature-flags"], meta[property="og:site_name"][content="GitLab"], meta[name="application-name"][content="GitLab"]',
    ),
  );

  if (hasDataPage || hasGitlabMeta) return true;
  return Number(hasCsrf) + Number(hasChrome) >= 2;
}

export type PageId =
  | 'merge-request'
  | 'merge-request-diffs'
  | 'commit'
  | 'compare'
  | 'unknown';

export function detectPage(): PageId {
  if (isMRDiffsPage()) return 'merge-request-diffs';
  if (isMRPage()) return 'merge-request';
  if (isCommitPage()) return 'commit';
  if (isComparePage()) return 'compare';
  return 'unknown';
}
