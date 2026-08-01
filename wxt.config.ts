import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-solid'],
  manifest: {
    name: 'Refined GitLab',
    description:
      'Improves the GitLab web UI. Works on gitlab.com and self-hosted instances.',
    permissions: ['storage'],
    action: {
      default_title: 'Refined GitLab',
    },
    browser_specific_settings: {
      gecko: {
        id: 'refined-gitlab@dreamingcodes',
        strict_min_version: '109.0',
      },
    },
  },
});
