import type { Meta, StoryObj } from '@storybook/react';
import SCPasswordInput from '../../components/sc-controls/form-controls/sc-password-input';

/**
 * SCPasswordInput extends Mantine's PasswordInput with an optional strength
 * popover. When `showPopover` is true (default), a strength meter appears on
 * focus showing password requirements.
 *
 * **Props:**
 * - `showPopover` — toggles the strength popover (default: `true`)
 * - `userwords` — array of strings to penalise (e.g. the user's name)
 * - All standard Mantine `PasswordInputProps` are forwarded
 *
 * **Variants:** Default · No popover · With label and error
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCPasswordInput',
  component: SCPasswordInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    error: { control: 'text', description: 'Validation error message' },
    showPopover: { control: 'boolean', description: 'Show password strength popover on focus' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    onChange: { action: 'changed' },
  },
  parameters: {
    // Mantine v7 PasswordInput sets aria-expanded + aria-haspopup="dialog" on
    // the inner <input> for the strength popover — aria-expanded is not a valid
    // attribute on role="textbox". This is a Mantine library bug; suppress the
    // rule until a Mantine upgrade resolves it.
    a11y: {
      options: {
        rules: { 'aria-allowed-attr': { enabled: false } },
      },
    },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter a password',
    showPopover: true,
  },
};

export const NoPopover: Story = {
  name: 'Without strength popover',
  args: {
    label: 'Password',
    placeholder: 'Enter a password',
    showPopover: false,
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    value: '123',
    error: 'Password must be at least 8 characters',
    showPopover: false,
  },
};

export const Required: Story = {
  args: {
    label: 'New password',
    required: true,
    showPopover: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Password',
    value: 'hidden-value',
    disabled: true,
    showPopover: false,
  },
};
