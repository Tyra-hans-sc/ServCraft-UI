import type { Meta, StoryObj } from '@storybook/react';
import SCAvatar from '../../components/sc-controls/layout/sc-avatar';

/**
 * SCAvatar renders a circular avatar showing initials or a short text label.
 * It wraps the Kendo React Avatar component with a fixed `"small"` size and
 * `"circle"` shape.
 *
 * **Props:**
 * - `content` — initials or short label to display (e.g. `"AJ"`, `"SC"`)
 * - `size` — forwarded to the underlying avatar (currently fixed to `"small"`)
 *
 * > In Storybook, Kendo components are replaced with a no-op mock. The avatar
 * > renders its `content` via a `<span>` inside the Kendo Avatar shell.
 *
 * **Variants:** Single initial · Two initials · Long name
 */
const meta: Meta<any> = {
  title: 'Layout/SCAvatar',
  component: SCAvatar,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text', description: 'Initials or label shown inside the avatar' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: { content: 'AJ' },
};

export const SingleInitial: Story = {
  name: 'Single initial',
  args: { content: 'A' },
};

export const CompanyInitials: Story = {
  name: 'Company initials',
  args: { content: 'SC' },
};
