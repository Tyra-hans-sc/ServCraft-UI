import React from 'react';
// Make React available globally for legacy components that reference React.xxx without importing it
(globalThis as any).React = React;
import type { Preview, Decorator } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from '../theme/mantineTheme';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const withMantine: Decorator = (Story, context) => {
  const isFullscreen = context.parameters?.layout === 'fullscreen';
  return (
    <MantineProvider theme={mantineTheme}>
      {isFullscreen ? (
        <Story />
      ) : (
        <div style={{ padding: '24px', maxWidth: '600px' }}>
          <Story />
        </div>
      )}
    </MantineProvider>
  );
};

const preview: Preview = {
  decorators: [withMantine],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Fail CI on wcag2a + wcag2aa violations. color-contrast is suppressed
      // globally — Mantine's disabled-state palette intentionally uses
      // low-contrast colours by design.
      // Note: rule disable must live in options.rules (applied to axe.run)
      // not config.rules (axe.configure) — the test: 'error' channel path
      // only picks up options.
      test: 'error',
      options: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        rules: { 'color-contrast': { enabled: false } },
      },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Changelog',
          'Design System',
          'Icons',
          'Layout',
          'Form Controls',
          'Data Display',
          'Feedback',
          'Navigation',
        ],
      },
    },
  },
};

export default preview;
