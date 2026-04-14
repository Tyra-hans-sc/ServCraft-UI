import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCMaskedInput from '../../components/sc-controls/form-controls/sc-masked-input';

/**
 * SCMaskedInput is a text input that enforces a phone number mask format.
 * Used for fields where a specific character pattern is required.
 *
 * **Props:**
 * - `label` — field label
 * - `value` — controlled value
 * - `hint` — helper text
 * - `error` — validation error message
 * - `required` — marks the field as required
 * - `onChange` — called with `{ name, value }`
 *
 * **States:** Default · With value · Error · Required
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCMaskedInput',
  component: SCMaskedInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    hint: { control: 'text', description: 'Helper text' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Controlled = (args: any) => {
  const [value, setValue] = useState(args.value ?? '');
  return (
    <SCMaskedInput
      {...args}
      name="phone"
      value={value}
      onChange={(e: any) => setValue(e.value)}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} label="Phone number" />,
};

export const WithValue: Story = {
  name: 'With value',
  render: (args) => <Controlled {...args} label="Mobile number" value="0412345678" />,
};

export const WithHint: Story = {
  render: (args) => (
    <Controlled {...args} label="Contact number" hint="Australian mobile or landline" />
  ),
};

export const WithError: Story = {
  render: (args) => (
    <Controlled {...args} label="Phone number" value="04" error="Please enter a valid phone number" />
  ),
};

export const Required: Story = {
  render: (args) => <Controlled {...args} label="Mobile number" required />,
};
