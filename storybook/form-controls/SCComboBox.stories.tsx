import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCComboBox from '../../components/sc-controls/form-controls/sc-combobox';

/**
 * SCComboBox is the standard searchable dropdown for ServCraft forms. It wraps
 * Mantine's Combobox with async or static option loading, optional clear button,
 * and support for inline "add" actions.
 *
 * **Loading modes:**
 * - `options` — static array of options (no async fetch needed)
 * - `getOptions` — async function for server-side search
 *
 * **States:** Default · Disabled · ReadOnly · With error · With hint · Required
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCComboBox',
  component: SCComboBox,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label displayed above the input' },
    placeholder: { control: 'text', description: 'Placeholder text when no value is selected' },
    hint: { control: 'text', description: 'Helper text shown below the input' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    readOnly: { control: 'boolean', description: 'Shows value but prevents editing' },
    canClear: { control: 'boolean', description: 'Shows a clear button when a value is selected' },
    canSearch: { control: 'boolean', description: 'Allows typing to filter options' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const MOCK_OPTIONS = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Williams' },
  { id: 3, name: 'Carol Smith' },
  { id: 4, name: 'David Brown' },
  { id: 5, name: 'Eve Davis' },
];

const Controlled = (args: any) => {
  const [value, setValue] = useState(null);
  return (
    <SCComboBox
      {...args}
      value={value}
      onChange={setValue}
      options={MOCK_OPTIONS}
      textField="name"
      dataItemKey="id"
      name="demo"
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} label="Technician" placeholder="Select a technician" />,
};

export const WithValue: Story = {
  name: 'With pre-selected value',
  render: (args) => {
    const [value, setValue] = useState(MOCK_OPTIONS[0]);
    return (
      <SCComboBox
        {...args}
        value={value}
        onChange={setValue}
        options={MOCK_OPTIONS}
        textField="name"
        dataItemKey="id"
        name="demo"
        label="Technician"
      />
    );
  },
};

export const WithHint: Story = {
  render: (args) => (
    <Controlled {...args} label="Assigned to" hint="Select the technician responsible for this job" />
  ),
};

export const WithError: Story = {
  render: (args) => <Controlled {...args} label="Customer" error="Please select a customer" />,
};

export const Required: Story = {
  render: (args) => <Controlled {...args} label="Job type" required />,
};

export const Disabled: Story = {
  render: () => (
    <SCComboBox
      value={MOCK_OPTIONS[1]}
      options={MOCK_OPTIONS}
      textField="name"
      dataItemKey="id"
      name="demo"
      label="Assigned to"
      disabled
    />
  ),
};

export const NoClear: Story = {
  name: 'No clear button',
  render: (args) => <Controlled {...args} label="Status" canClear={false} />,
};
