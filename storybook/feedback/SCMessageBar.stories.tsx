import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCMessageBar from '../../components/sc-controls/message-bar/sc-message-bar';

/**
 * SCMessageBar is a fixed top-of-page notification bar used for system-wide
 * messages such as subscription warnings or maintenance alerts.
 *
 * **MessageBarType values:**
 * - `0` — Warning (orange background)
 * - `1` — Error (red background)
 *
 * **Props:**
 * - `messageBarType` — `0` (Warning) or `1` (Error)
 * - `message` — the message text to display
 * - `isActive` — shows the bar when `true` (default: `false`)
 *
 * > The bar renders at `position: fixed; top: 0` — stories use a relative
 * > wrapper to keep it visible in the canvas.
 */
const meta: Meta<any> = {
  title: 'Feedback/SCMessageBar',
  component: SCMessageBar,
  tags: ['autodocs'],
  argTypes: {
    messageBarType: {
      control: 'radio',
      options: [0, 1],
      description: '0 = Warning (orange), 1 = Error (red)',
    },
    message: { control: 'text', description: 'Message text to display' },
    isActive: { control: 'boolean', description: 'Shows the bar when true' },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 60, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<any>;

export const Warning: Story = {
  args: {
    messageBarType: 0,
    message: 'Your subscription expires in 7 days. Renew now to avoid service interruption.',
    isActive: true,
  },
};

export const Error: Story = {
  args: {
    messageBarType: 1,
    message: 'Your account has been suspended. Please contact support to restore access.',
    isActive: true,
  },
};

export const Inactive: Story = {
  name: 'Inactive (hidden)',
  args: {
    messageBarType: 0,
    message: 'This message is not shown when isActive is false.',
    isActive: false,
  },
};
