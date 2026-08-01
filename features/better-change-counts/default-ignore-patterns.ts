export type IgnoreTier = 'A' | 'B';

export interface IgnorePattern {
  id: string;
  pattern: string;
  reason: 'lockfile' | 'generated' | 'minified' | 'vendor';
  description: string;
  tier: IgnoreTier;
}

export const DEFAULT_IGNORE_PATTERNS: IgnorePattern[] = [
  {
    id: 'package-lock',
    pattern: '**/package-lock.json',
    reason: 'lockfile',
    description: 'npm lockfile',
    tier: 'A',
  },
  {
    id: 'npm-shrinkwrap',
    pattern: '**/npm-shrinkwrap.json',
    reason: 'lockfile',
    description: 'npm shrinkwrap',
    tier: 'A',
  },
  {
    id: 'yarn-lock',
    pattern: '**/yarn.lock',
    reason: 'lockfile',
    description: 'Yarn lockfile',
    tier: 'A',
  },
  {
    id: 'pnpm-lock',
    pattern: '**/pnpm-lock.yaml',
    reason: 'lockfile',
    description: 'pnpm lockfile',
    tier: 'A',
  },
  {
    id: 'bun-lock',
    pattern: '**/bun.lock',
    reason: 'lockfile',
    description: 'Bun text lockfile',
    tier: 'A',
  },
  {
    id: 'bun-lockb',
    pattern: '**/bun.lockb',
    reason: 'lockfile',
    description: 'Bun binary lockfile',
    tier: 'A',
  },
  {
    id: 'cargo-lock',
    pattern: '**/Cargo.lock',
    reason: 'lockfile',
    description: 'Cargo lockfile',
    tier: 'A',
  },
  {
    id: 'go-sum',
    pattern: '**/go.sum',
    reason: 'lockfile',
    description: 'Go checksums',
    tier: 'A',
  },
  {
    id: 'go-workspace-sum',
    pattern: '**/go.work.sum',
    reason: 'lockfile',
    description: 'Go workspace checksums',
    tier: 'A',
  },
  {
    id: 'composer-lock',
    pattern: '**/composer.lock',
    reason: 'lockfile',
    description: 'Composer lockfile',
    tier: 'A',
  },
  {
    id: 'gemfile-lock',
    pattern: '**/Gemfile.lock',
    reason: 'lockfile',
    description: 'Bundler lockfile',
    tier: 'A',
  },
  {
    id: 'poetry-lock',
    pattern: '**/poetry.lock',
    reason: 'lockfile',
    description: 'Poetry lockfile',
    tier: 'A',
  },
  {
    id: 'pipfile-lock',
    pattern: '**/Pipfile.lock',
    reason: 'lockfile',
    description: 'Pipenv lockfile',
    tier: 'A',
  },
  {
    id: 'pdm-lock',
    pattern: '**/pdm.lock',
    reason: 'lockfile',
    description: 'PDM lockfile',
    tier: 'A',
  },
  {
    id: 'uv-lock',
    pattern: '**/uv.lock',
    reason: 'lockfile',
    description: 'uv lockfile',
    tier: 'A',
  },
  {
    id: 'flake-lock',
    pattern: '**/flake.lock',
    reason: 'lockfile',
    description: 'Nix flake lock',
    tier: 'A',
  },
  {
    id: 'pubspec-lock',
    pattern: '**/pubspec.lock',
    reason: 'lockfile',
    description: 'Dart lockfile',
    tier: 'A',
  },
  {
    id: 'mix-lock',
    pattern: '**/mix.lock',
    reason: 'lockfile',
    description: 'Elixir lockfile',
    tier: 'A',
  },
  {
    id: 'deno-lock',
    pattern: '**/deno.lock',
    reason: 'lockfile',
    description: 'Deno lockfile',
    tier: 'A',
  },
  {
    id: 'terraform-lock',
    pattern: '**/.terraform.lock.hcl',
    reason: 'lockfile',
    description: 'Terraform provider lock',
    tier: 'A',
  },

  {
    id: 'min-js',
    pattern: '**/*.min.js',
    reason: 'minified',
    description: 'Minified JS',
    tier: 'A',
  },
  {
    id: 'min-css',
    pattern: '**/*.min.css',
    reason: 'minified',
    description: 'Minified CSS',
    tier: 'A',
  },
  {
    id: 'source-map',
    pattern: '**/*.{js,css}.map',
    reason: 'generated',
    description: 'Source maps',
    tier: 'A',
  },
  {
    id: 'pb-go',
    pattern: '**/*.pb.go',
    reason: 'generated',
    description: 'protoc Go',
    tier: 'A',
  },
  {
    id: 'graphql-generated-ext',
    pattern: '**/*.generated.{ts,tsx,js,jsx}',
    reason: 'generated',
    description: '*.generated.* codegen',
    tier: 'A',
  },

  {
    id: 'vendor-dir',
    pattern: '**/vendor/**',
    reason: 'vendor',
    description: 'Vendor directory',
    tier: 'B',
  },
  {
    id: 'dist-dir',
    pattern: '**/dist/**',
    reason: 'generated',
    description: 'dist/ output',
    tier: 'B',
  },
  {
    id: 'next-static',
    pattern: '**/.next/**',
    reason: 'generated',
    description: 'Next.js build',
    tier: 'B',
  },
  {
    id: 'bundle-js',
    pattern: '**/*.{bundle,chunk}.js',
    reason: 'minified',
    description: 'Bundled JS heuristic',
    tier: 'B',
  },
  {
    id: 'openapi-path',
    pattern: '**/openapi/**/*.{ts,js,go}',
    reason: 'generated',
    description: 'OpenAPI path heuristic',
    tier: 'B',
  },
  {
    id: 'graphql-generated-dir',
    pattern: '**/generated/graphql.{ts,js}',
    reason: 'generated',
    description: 'GraphQL generated path',
    tier: 'B',
  },
];

export const MAX_PATTERN_LENGTH = 200;
