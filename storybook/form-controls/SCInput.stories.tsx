import type { Meta, StoryObj } from '@storybook/react';
import SCInput from '../../components/sc-controls/form-controls/sc-input';

/**
 * SCInput is the standard text input component for ServCraft forms. It wraps
 * Mantine's TextInput, NumberInput, PasswordInput, and PhoneInput depending
 * on the `type` prop. All form inputs should use SCInput rather than native
 * inputs or raw Mantine components.
 *
 * **Variants by type:**
 * - `text` (default) — standard single-line text field
 * - `number` — numeric input with 4 decimal scale, scroll-to-change disabled
 * - `password` — password field with show/hide toggle
 * - `tel` — mobile number input with formatting
 *
 * **States:** Default · Error · Disabled · ReadOnly · Required
 */
const meta: Meta<typeof SCInput> = {
  title: 'Form Controls/SCInput',
  component: SCInput,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'number', 'password', 'tel'],
      description: 'Input type — drives which underlying control is rendered',
      table: { defaultValue: { summary: 'text' } },
    },
    label: { control: 'text', description: 'Field label displayed above the input' },
    placeholder: { control: 'text', description: 'Placeholder text shown when empty' },
    value: { control: 'text', description: 'Controlled value' },
    hint: { control: 'text', description: 'Helper text shown below the input' },
    error: { control: 'text', description: 'Validation error message — turns the input red' },
    required: { control: 'boolean', description: 'Shows an asterisk on the label' },
    disabled: { control: 'boolean', description: 'Prevents interaction and dims the field' },
    readOnly: { control: 'boolean', description: 'Shows the value but prevents editing' },
    autoFocus: { control: 'boolean', description: 'Focuses the input on mount' },
    min: { control: 'number', description: 'Minimum value (number type only)' },
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
  },
};

export default meta;
type Story = StoryObj<typeof SCInput>;

export const Default: Story = {
  args: {
    label: 'Full name',
    placeholder: 'Enter your full name',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Full name',
    value: 'Jane Smith',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Email address',
    placeholder: 'jane@example.com',
    hint: 'Used for login and notifications',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email address',
    value: 'not-an-email',
    error: 'Please enter a valid email address',
  },
};

export const Required: Story = {
  args: {
    label: 'Job title',
    required: true,
    placeholder: 'e.g. Senior Technician',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Account number',
    value: 'ACC-00123',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Customer ID',
    value: 'CUST-4892',
    readOnly: true,
  },
};

export const NumberType: Story = {
  name: 'Type: Number',
  args: {
    label: 'Quantity',
    type: 'number',
    placeholder: '0',
    min: 0,
  },
};

export const PasswordType: Story = {
  name: 'Type: Password',
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const TelType: Story = {
  name: 'Type: Phone',
  args: {
    label: 'Mobile number',
    type: 'tel',
    placeholder: '04XX XXX XXX',
  },
};
