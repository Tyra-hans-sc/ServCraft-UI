import type { Meta, StoryObj } from '@storybook/react';
import NewBadge from '../../components/NewBadge';

/**
 * NewBadge renders a small "NEW" label used to highlight recently added features
 * or items in the UI.
 *
 * **Props:**
 * - `size` — Mantine size token (`'xs'` · `'sm'` · `'md'` · `'lg'` · `'xl'`)
 *   Default: `'lg'`
 *
 * **Variants:** Default (lg) · Small · Extra large
 */
const meta: Meta<typeof NewBadge> = {
  title: 'Feedback/NewBadge',
  component: NewBadge,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Mantine size token controlling badge size',
      table: { defaultValue: { summary: 'lg' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NewBadge>;

export const Default: Story = {
  args: { size: 'lg' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const ExtraLarge: Story = {
  name: 'Extra large',
  args: { size: 'xl' },
};
