export const selectors = {
  diffStats: '.diff-stats',
  diffFileHeader: '.diff-file .file-header-content, [data-testid="file-header"]',
  diffFilePath:
    '[data-testid="file-name-content"], .file-title-name, a[data-testid="file-name"]',
  diffFileStats: '[data-testid="diff-file-stats"], .file-header-content .diff-stats',
} as const;
