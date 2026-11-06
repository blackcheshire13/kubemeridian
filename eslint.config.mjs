// Lints the site's own JavaScript: VitePress config helpers and scripts (docs/.vitepress,
// docs/scripts), the Pages Functions (functions/) and the pilot form worker (workers/).
// Vue and TypeScript files are compiled by the VitePress build, which runs in CI too.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', 'docs/.vitepress/cache/**', '**/.wrangler/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.node } },
    rules: { curly: 'error', eqeqeq: ['error', 'smart'] },
  },
  {
    // Workers runtime: fetch, Response, crypto, btoa… but no Node globals
    files: ['functions/**/*.js', 'workers/**/*.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
];
