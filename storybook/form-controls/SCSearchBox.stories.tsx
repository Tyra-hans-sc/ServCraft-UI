import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCSearchBox from '../../components/sc-controls/form-controls/sc-searchbox';

/**
 * SCSearchBox is a lightweight search input used for filtering lists and tables.
 * It renders a left icon (default: magnifying glass) with an optional clear
 * button when the field has a value.
 *
 * **Props:**
 * - `value` — controlled value (pass `null` for empty)
 * - `placeholder` — placeholder text
 * - `canClear` — shows a clear (×) button when a value is present (default: `true`)
 * - `onChange` — called with the new string value or `null` on clear
 *
 * **Variants:** Default · With value · No clear button
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCSearchBox',
  component: SCSearchBox,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text', description: 'Placeholder text' },
    label: { control: 'text', description: 'Optional label above the search box' },
    canClear: { control: 'boolean', description: 'Show a clear button when the field has a value' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Controlled = (args: any) => {
  const [value, setValue] = useState<string | null>(null);
  return <SCSearchBox {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: (args) => <Controlled {...args} placeholder="Search jobs, customers…" />,
};

export const WithValue: Story = {
  name: 'With value',
  render: (args) => {
    const [value, setValue] = useState<string | null>('John Smith');
    return <SCSearchBox {...args} value={value} onChange={setValue} placeholder="Search…" />;
  },
};

export const WithLabel: Story = {
  name: 'With label',
  render: (args) => <Controlled {...args} label="Filter by name" placeholder="Type to filter…" />,
};

export const NoClear: Story = {
  name: 'No clear button',
  render: (args) => <Controlled {...args} placeholder="Search…" canClear={false} />,
};
