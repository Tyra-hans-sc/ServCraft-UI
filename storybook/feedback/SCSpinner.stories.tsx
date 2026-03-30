import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCSpinner from '../../components/sc-controls/misc/sc-spinner';

/**
 * SCSpinner is the standard loading indicator for ServCraft. It renders a
 * Mantine Loader sized to fill its container.
 *
 * **Props:**
 * - `colour` — `'light'` (default) or `'dark'`
 *
 * Use `'light'` on dark backgrounds, `'dark'` on light or white backgrounds.
 *
 * **Variants:** Light · Dark
 */
const meta: Meta<any> = {
  title: 'Feedback/SCSpinner',
  component: SCSpinner,
  tags: ['autodocs'],
  argTypes: {
    colour: {
      control: 'radio',
      options: ['light', 'dark'],
      description: 'Spinner colour — use light on dark backgrounds, dark on light',
    },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Light: Story = {
  args: { colour: 'light' },
  decorators: [
    (Story) => (
      <div style={{ background: '#003ED0', padding: 32, borderRadius: 8, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
};

export const Dark: Story = {
  args: { colour: 'dark' },
  decorators: [
    (Story) => (
      <div style={{ background: '#f8f9fa', padding: 32, borderRadius: 8, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
};
