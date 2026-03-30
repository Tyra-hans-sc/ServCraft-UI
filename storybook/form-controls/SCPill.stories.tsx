import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCPill from '../../components/sc-controls/form-controls/sc-pill';

/**
 * SCPill renders a group of selectable pill/tag buttons. Each item has a
 * `label` and a `selected` boolean. Clicking a pill toggles its selection
 * and fires `onChange` with the updated items array.
 *
 * **Props:**
 * - `items` — array of `{ label: string; selected: boolean }`
 * - `onChange` — called with the full updated items array
 * - `disabled` — prevents toggling
 *
 * **Variants:** Default · Pre-selected · Multiple selected · Disabled
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCPill',
  component: SCPill,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean', description: 'Prevents toggling any pill' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => ({
  label: d,
  selected: false,
}));

const Controlled = (args: any) => {
  const [items, setItems] = useState(args.items ?? DAYS);
  return <SCPill {...args} items={items} onChange={setItems} />;
};

export const Default: Story = {
  render: (args) => <Controlled {...args} items={DAYS} />,
};

export const WithSelections: Story = {
  name: 'Pre-selected items',
  render: (args) => (
    <Controlled
      {...args}
      items={DAYS.map((d, i) => ({ ...d, selected: i === 0 || i === 2 }))}
    />
  ),
};

export const AllSelected: Story = {
  name: 'All selected',
  render: (args) => (
    <Controlled {...args} items={DAYS.map((d) => ({ ...d, selected: true }))} />
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <Controlled
      {...args}
      items={DAYS.map((d, i) => ({ ...d, selected: i < 2 }))}
      disabled
    />
  ),
};
