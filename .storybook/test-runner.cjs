/** @type {import('@storybook/test-runner').TestRunnerConfig} */

// A11y checking is handled by @storybook/addon-a11y via parameters.a11y in
// preview.tsx (test: 'error'). No custom axe injection needed here.
// This file exists as the hook point for future per-story timeout overrides
// or custom post-visit assertions.

module.exports = {};
