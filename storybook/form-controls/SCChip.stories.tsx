import type { Meta, StoryObj } from '@storybook/react';
import SCChip from '../../components/sc-controls/form-controls/sc-chip';

/**
 * SCChip is a single selectable chip used within SCChipList or standalone.
 * It renders a Kendo Chip with a label and fires selection events.
 *
 * **Props:**
 * - `text` — label shown inside the chip
 * - `value` — the value associated with this chip
 * - `disabled` — prevents interaction
 *
 * > Used inside **SCChipList** for multi-option selection groups.
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCChip',
  component: SCChip,
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text', description: 'Label displayed inside the chip' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    text: 'Active',
    value: 1,
  },
};

export const Disabled: Story = {
  args: {
    text: 'Inactive',
    value: 0,
    disabled: true,
  },
};
