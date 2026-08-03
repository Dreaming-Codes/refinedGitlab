import { describe, expect, test } from 'bun:test';
import {
  encodeProjectPath,
  mrDiffsMetadataUrl,
  mrRestDiffsUrl,
  parseGitLabRoute,
} from './gitlab-url';

function url(href: string): URL {
  return new URL(href);
}

describe('parseGitLabRoute', () => {
  test('parses nested group MR on self-hosted origin', () => {
    const r = parseGitLabRoute(
      url('https://git.company.internal/team/app/-/merge_requests/42/diffs'),
    );
    expect(r).toEqual({
      origin: 'https://git.company.internal',
      fullPath: 'team/app',
      mrIid: 42,
      commitSha: undefined,
      compareSpec: undefined,
    });
  });

  test('parses deep group path', () => {
    const r = parseGitLabRoute(
      url('http://gitlab.local/a/b/c/proj/-/merge_requests/7'),
    );
    expect(r?.fullPath).toBe('a/b/c/proj');
    expect(r?.mrIid).toBe(7);
    expect(r?.origin).toBe('http://gitlab.local');
  });

  test('parses commit', () => {
    const r = parseGitLabRoute(
      url('https://gitlab.com/org/repo/-/commit/abc1234deadbeef'),
    );
    expect(r?.commitSha).toBe('abc1234deadbeef');
  });

  test('returns null outside project routes', () => {
    expect(parseGitLabRoute(url('https://git.example/explore'))).toBeNull();
  });
});

describe('mrDiffsMetadataUrl', () => {
  test('builds same-origin metadata URL with encoded segments', () => {
    const href = mrDiffsMetadataUrl({
      origin: 'https://git.example',
      fullPath: 'group/my project',
      mrIid: 9,
    });
    expect(href).toBe(
      'https://git.example/group/my%20project/-/merge_requests/9/diffs_metadata.json',
    );
  });
});

describe('encodeProjectPath', () => {
  test('encodes slashes as %2F', () => {
    expect(encodeProjectPath('a/b/c')).toBe('a%2Fb%2Fc');
  });
});

describe('mrRestDiffsUrl', () => {
  test('builds paginated REST diffs URL', () => {
    const href = mrRestDiffsUrl(
      {
        origin: 'https://git.example',
        fullPath: 'group/proj',
        mrIid: 3,
      },
      2,
    );
    expect(href).toBe(
      'https://git.example/api/v4/projects/group%2Fproj/merge_requests/3/diffs?per_page=100&page=2',
    );
  });
});
