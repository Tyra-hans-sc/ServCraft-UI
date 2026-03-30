import type { Meta, StoryObj } from '@storybook/react';
import ScMobileNumberControl from '../../components/sc-controls/form-controls/v2/sc-mobile-number-control';

/**
 * ScMobileNumberControl is the Mantine v7 mobile number input for ServCraft V2
 * forms. It uses an input mask to enforce a phone number format.
 *
 * **Props:**
 * - All Mantine `InputBase` props are accepted
 * - `label` — field label
 * - `placeholder` — placeholder text
 * - `required` — marks the field as required
 * - `error` — validation error message
 *
 * **States:** Default · With value · Error · Required · Disabled
 */
const meta: Meta<any> = {
  title: 'Form Controls V2/ScMobileNumberControl',
  component: ScMobileNumberControl,
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
    label: 'Mobile number',
    placeholder: '04__ ___ ___',
  },
};

export const WithValue: Story = {
  name: 'With value',
  args: {
    label: 'Mobile number',
    value: '0412345678',
  },
};

export const WithError: Story = {
  args: {
    label: 'Mobile number',
    error: 'Please enter a valid Australian mobile number',
  },
};

export const Required: Story = {
  args: {
    label: 'Contact mobile',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Mobile number',
    value: '0498765432',
    disabled: true,
  },
};
