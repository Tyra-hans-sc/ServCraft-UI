import type { Meta, StoryObj } from '@storybook/react';
import BusyIndicator from '../../components/busy-indicator';

/**
 * BusyIndicator is a full-page loading overlay that blocks interaction while
 * an async operation is in progress.
 *
 * **Props:**
 * - `text` — optional message shown below the spinner (default: `null`)
 *
 * > The component renders at `position: fixed` and covers the full viewport.
 * > Canvas stories use a constrained wrapper for preview purposes.
 *
 * **Variants:** Default (no text) · With message
 */
const meta: Meta<any> = {
  title: 'Feedback/BusyIndicator',
  component: BusyIndicator,
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text', description: 'Optional message displayed below the spinner' },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 200, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: { text: 'Saving changes…' },
};

export const WithMessage: Story = {
  name: 'With message',
  args: { text: 'Saving changes…' },
};

export const LongMessage: Story = {
  name: 'Uploading',
  args: { text: 'Uploading attachments, please wait…' },
};
