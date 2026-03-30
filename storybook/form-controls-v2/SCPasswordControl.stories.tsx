import type { Meta, StoryObj } from '@storybook/react';
import ScPasswordControl from '../../components/sc-controls/form-controls/v2/sc-password-control';

/**
 * ScPasswordControl is the Mantine v7 password input for ServCraft V2 forms.
 * It wraps Mantine's `PasswordInput` and forwards all PasswordInputProps.
 *
 * **Props:**
 * - All Mantine `PasswordInputProps` are accepted
 * - `label` — field label
 * - `placeholder` — placeholder text
 * - `required` — marks the field as required
 * - `error` — validation error message
 *
 * **States:** Default · Error · Required · Disabled
 */
const meta: Meta<any> = {
  title: 'Form Controls V2/ScPasswordControl',
  component: ScPasswordControl,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    error: 'Password is incorrect',
  },
};

export const Required: Story = {
  args: {
    label: 'New password',
    required: true,
    placeholder: 'Choose a strong password',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Password',
    value: 'hidden',
    disabled: true,
  },
};
