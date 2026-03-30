import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCNativeSelect from '../../components/sc-controls/form-controls/sc-native-select';

/**
 * SCNativeSelect renders a browser-native `<select>` element, styled to match
 * the ServCraft form system. Use when a lightweight, always-accessible dropdown
 * is needed without the overhead of the Mantine Combobox.
 *
 * **Props:**
 * - `options` — array of data objects
 * - `labelField` — key to use as the option label
 * - `valueField` — key to use as the option value
 * - `allowNull` — prepends an empty "— Select —" option
 * - `error` — validation error message
 * - `required` — marks the field as required
 *
 * **States:** Default · With null option · Error · Required
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCNativeSelect',
  component: SCNativeSelect,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    allowNull: { control: 'boolean', description: 'Adds a blank "— Select —" first option' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const PRIORITY_OPTIONS = [
  { id: 1, label: 'Low' },
  { id: 2, label: 'Medium' },
  { id: 3, label: 'High' },
  { id: 4, label: 'Critical' },
];

const Controlled = (args: any) => {
  const [value, setValue] = useState(PRIORITY_OPTIONS[1].id);
  return (
    <SCNativeSelect
      {...args}
      name="priority"
      value={value}
      options={PRIORITY_OPTIONS}
      labelField="label"
      valueField="id"
      onChange={(e: any) => setValue(e.value)}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} label="Priority" />,
};

export const WithNullOption: Story = {
  name: 'With empty option',
  render: (args) => <Controlled {...args} label="Priority" allowNull />,
};

export const WithError: Story = {
  render: (args) => <Controlled {...args} label="Priority" error="Please select a priority" />,
};

export const Required: Story = {
  render: (args) => <Controlled {...args} label="Job type" required />,
};
