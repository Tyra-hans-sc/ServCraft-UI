import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCChipList from '../../components/sc-controls/form-controls/sc-chiplist';

/**
 * SCChipList renders a horizontal group of selectable chips from an options array.
 * It handles single or multi-select patterns via `handleChange`.
 *
 * **Props:**
 * - `options` — array of data objects
 * - `textField` — key to display as the chip label
 * - `valueField` — key used as the chip value
 * - `handleChange` — called when a chip is selected/deselected
 * - `disabled` — prevents all interaction
 *
 * **Variants:** Default · Disabled
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCChipList',
  component: SCChipList,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean', description: 'Prevents all chip interaction' },
    handleChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const STATUS_OPTIONS = [
  { id: 1, label: 'Pending' },
  { id: 2, label: 'In Progress' },
  { id: 3, label: 'Complete' },
  { id: 4, label: 'On Hold' },
  { id: 5, label: 'Cancelled' },
];

export const Default: Story = {
  render: (args) => (
    <SCChipList
      {...args}
      options={STATUS_OPTIONS}
      textField="label"
      valueField="id"
      handleChange={(v: any) => {}}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <SCChipList
      options={STATUS_OPTIONS}
      textField="label"
      valueField="id"
      handleChange={() => {}}
      disabled
    />
  ),
};
