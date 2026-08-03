# Refined GitLab

Browser extension for the GitLab web UI. Features are small, independent modules.

Runs on gitlab.com and self-hosted instances. The content script matches all pages; features only activate when the page looks like GitLab.

## Features

- **Better change line counts**: next to the native MR stats, shows file and line totals that exclude files GitLab marks as generated (`generated_file` / `.gitattributes` `gitlab-generated`).

## Develop

```bash
bun install
bun run dev          # Chrome
bun run dev:firefox  # Firefox
bun test
bun run compile
```

After `dev` or `build`, load `.output/chrome-mv3` (or the Firefox build) as an unpacked extension.

## Store builds

```bash
bun install
bun test
bun run compile
bun run zip            # Chrome
bun run zip:firefox    # Firefox (AMO)
```

Zips land in `.output/`.

Firefox add-on id (stable across updates): `refined-gitlab@dreamingcodes`.

### AMO source review

```bash
bun install
bun run zip:firefox
```

Upload the generated Firefox zip from `.output/`. Sources are this repository; Node/Bun required. Do not include `node_modules` or `.output` in a sources archive.

## Stack

WXT, SolidJS (popup), TypeScript, MV3
