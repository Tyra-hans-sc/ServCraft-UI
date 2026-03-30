import type { Meta, StoryObj } from '@storybook/react';
import ScDateControl from '../../components/sc-controls/form-controls/v2/ScDateControl';

/**
 * ScDateControl is the Mantine v7 date input for ServCraft V2 forms. It wraps
 * Mantine's `DateInput` with a consistent margin and forwards all DateInputProps.
 *
 * **Props:**
 * - All Mantine `DateInputProps` are accepted
 * - `label` — field label
 * - `placeholder` — placeholder text
 * - `required` — marks the field as required
 * - `disabled` — prevents interaction
 * - `error` — validation error message
 *
 * **States:** Default · With value · Error · Disabled · Required
 */
const meta: Meta<any> = {
  title: 'Form Controls V2/ScDateControl',
  component: ScDateControl,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    clearable: { control: 'boolean', description: 'Show a clear button' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    label: 'Job date',
    placeholder: 'Select a date',
  },
};

export const WithValue: Story = {
  name: 'With value',
  args: {
    label: 'Due date',
    value: new Date('2025-06-15'),
  },
};

export const WithError: Story = {
  args: {
    label: 'Start date',
    error: 'Start date is required',
  },
};

export const Required: Story = {
  args: {
    label: 'Appointment date',
    required: true,
    placeholder: 'Select a date',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Created date',
    value: new Date('2025-01-10'),
    disabled: true,
  },
};

export const Clearable: Story = {
  args: {
    label: 'Follow-up date',
    value: new Date('2025-07-20'),
    clearable: true,
  },
};
