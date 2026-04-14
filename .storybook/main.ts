import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import type { Plugin } from 'vite';
import { transform } from 'esbuild';

// Transform .js files that contain JSX (legacy component files in this project).
// All SC components use useLegacy = false but Vite still needs to parse the imports.
const jsxInJsPlugin: Plugin = {
  name: 'jsx-in-js',
  async transform(code, id) {
    if (/\.js$/.test(id) && !id.includes('node_modules') && (code.includes('</') || code.includes('/>'))) {
      const result = await transform(code, {
        loader: 'jsx',
        jsx: 'automatic',
        logLevel: 'silent',
      });
      return { code: result.code };
    }
  },
};

const config: StorybookConfig = {
  stories: [
    '../storybook/**/*.mdx',
    '../storybook/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  // Disable automatic prop extraction via react-docgen — this project has
  // complex TypeScript patterns that trip up the parser. argTypes in each
  // story file document all props manually.
  typescript: {
    reactDocgen: false,
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = [
      // Preserve any aliases Storybook already set
      ...Object.entries(
        (config.resolve.alias && !Array.isArray(config.resolve.alias)
          ? config.resolve.alias
          : {}) as Record<string, string>
      ).map(([find, replacement]) => ({ find, replacement })),
      { find: '@',            replacement: path.resolve(__dirname, '..') },
      { find: 'next/dynamic', replacement: path.resolve(__dirname, './mocks/next-dynamic') },
      { find: 'next/router',  replacement: path.resolve(__dirname, './mocks/next-router') },
      { find: 'next/link',    replacement: path.resolve(__dirname, './mocks/next-link') },
      { find: 'next/image',   replacement: path.resolve(__dirname, './mocks/next-image') },
      // Redirect ALL @progress/kendo-* to a no-op mock — being phased out,
      // have uninstalled transitive deps. All SC components use useLegacy = false.
      { find: /^@progress\/kendo-.*/, replacement: path.resolve(__dirname, './mocks/kendo-empty') },
    ];
    config.plugins = [...(config.plugins || []), jsxInJsPlugin];
    config.define = {
      ...config.define,
      'process.env.NODE_ENV': '"development"',
      'process.env.NEXT_PUBLIC_API_URL': '"http://localhost:3000"',
      'process.env.NEXT_PUBLIC_MANAGER_URL': '"http://localhost:3001"',
      'process.env.NEXT_PUBLIC_SANITY_PROJECT_ID': '""',
    };
    // Suppress duplicate-key errors in legacy JS files
    config.esbuild = {
      ...config.esbuild,
      logOverride: {
        'duplicate-object-key': 'silent',
      },
    };
    // Exclude ALL installed @progress/kendo-* packages from esbuild pre-bundling.
    // esbuild runs before Vite's plugin layer (before resolve.alias applies), so it
    // follows kendo's internal imports to packages that aren't installed and crashes.
    // The regex alias above handles runtime resolution once files are served.
    // Tell esbuild's pre-bundler scanner to parse .js files as JSX.
    // The jsxInJsPlugin handles this for Vite's serve phase, but esbuild runs
    // before Vite plugins and needs this hint independently.
    config.optimizeDeps = {
      ...config.optimizeDeps,
      esbuildOptions: {
        ...config.optimizeDeps?.esbuildOptions,
        loader: {
          ...config.optimizeDeps?.esbuildOptions?.loader,
          '.js': 'jsx',
        },
      },
      exclude: [
        ...(config.optimizeDeps?.exclude ?? []),
        '@progress/kendo-data-query',
        '@progress/kendo-date-math',
        '@progress/kendo-draggable-common',
        '@progress/kendo-drawing',
        '@progress/kendo-licensing',
        '@progress/kendo-react-buttons',
        '@progress/kendo-react-charts',
        '@progress/kendo-react-common',
        '@progress/kendo-react-data-tools',
        '@progress/kendo-react-dateinputs',
        '@progress/kendo-react-dialogs',
        '@progress/kendo-react-dropdowns',
        '@progress/kendo-react-editor',
        '@progress/kendo-react-grid',
        '@progress/kendo-react-inputs',
        '@progress/kendo-react-intl',
        '@progress/kendo-react-listbox',
        '@progress/kendo-react-popup',
        '@progress/kendo-react-scheduler',
        '@progress/kendo-react-tooltip',
        '@progress/kendo-react-upload',
        '@progress/kendo-svg-icons',
        '@progress/kendo-theme-material',
      ],
    };
    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};
    const existing = config.build.rollupOptions.external;
    const existingArray = Array.isArray(existing) ? existing : existing ? [existing] : [];
    config.build.rollupOptions.external = [
      ...existingArray,
      /^@progress\/kendo-.*/,
    ];
    return config;
  },
};
export default config;
