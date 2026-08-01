# Refined GitLab

Browser extension for the GitLab web UI. Features are small, independent modules.

Runs on gitlab.com and self-hosted instances. The content script matches all pages; features only activate when the page looks like GitLab.

## Features

- **Better change line counts**: next to the native MR stats, shows file and line totals that exclude lockfiles and common generated files.

## Develop

```bash
bun install
bun run dev          # Chrome
bun run dev:firefox  # Firefox
bun test
bun run compile
```

After `dev` or `build`, load `.output/chrome-mv3` (or the Firefox build) as an unpacked extension.

## Stack

WXT, SolidJS (popup), TypeScript, MV3
