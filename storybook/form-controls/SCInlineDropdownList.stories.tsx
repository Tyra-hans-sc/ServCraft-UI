import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCInlineDropdownList from '../../components/sc-controls/form-controls/sc-inline-dropdownlist';

/**
 * SCInlineDropdownList is a compact, label-less dropdown used inside table cells
 * and inline editing contexts. It renders a native `<select>` styled for inline use.
 *
 * **Props:**
 * - `value` — currently selected value
 * - `options` — array of `{ value, label }` objects
 * - `onChange` — called with the new value
 * - `width` — CSS width of the select
 * - `autoFocus` — focuses on mount
 *
 * **Variants:** Default · Custom width · Auto-focused
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCInlineDropdownList',
  component: SCInlineDropdownList,
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'text', description: 'CSS width of the dropdown' },
    autoFocus: { control: 'boolean', description: 'Focuses the dropdown on mount' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'complete', label: 'Complete' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Controlled = (args: any) => {
  const [value, setValue] = useState(args.value ?? 'pending');
  return (
    <SCInlineDropdownList
      {...args}
      name="status"
      value={value}
      options={STATUS_OPTIONS}
      onChange={(v: any) => setValue(v)}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

export const CustomWidth: Story = {
  name: 'Custom width (200px)',
  render: (args) => <Controlled {...args} width="200px" />,
};

export const PreSelected: Story = {
  name: 'Pre-selected value',
  render: (args) => <Controlled {...args} value="complete" />,
};
