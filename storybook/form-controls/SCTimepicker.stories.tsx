import type { Meta, StoryObj } from '@storybook/react';
import SCTimePicker from '../../components/sc-controls/form-controls/sc-timepicker';

/**
 * SCTimePicker is the standard time input for ServCraft forms. It renders a
 * 24-hour time input (HH:mm by default, HH:mm:ss when `format` includes `:ss`).
 *
 * The `value` prop should be a time string or ISO datetime string.
 * Changes are returned via `changeHandler({ name, value: timeString | null })`.
 *
 * `changeHandler` is required — it is the primary callback for time changes.
 *
 * **States:** Default · With value · With seconds · Error · Disabled · Required
 */
const meta: Meta<typeof SCTimePicker> = {
  title: 'Form Controls/SCTimePicker',
  component: SCTimePicker,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    value: { control: 'text', description: 'Time string value (HH:mm or ISO datetime)' },
    hint: { control: 'text', description: 'Helper text below the input' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Shows asterisk on label' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    format: {
      control: 'select',
      options: ['HH:mm', 'HH:mm:ss'],
      description: 'Time format — include :ss to show seconds field',
      table: { defaultValue: { summary: 'HH:mm' } },
    },
    changeHandler: { action: 'changeHandler' },
  },
};

export default meta;
type Story = StoryObj<typeof SCTimePicker>;

const noopHandler = () => {};

export const Default: Story = {
  args: {
    label: 'Start time',
    value: null,
    changeHandler: noopHandler,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Start time',
    value: '09:30',
    changeHandler: noopHandler,
  },
};

export const WithSeconds: Story = {
  name: 'With seconds (HH:mm:ss)',
  args: {
    label: 'Duration',
    value: '01:30:00',
    format: 'HH:mm:ss',
    changeHandler: noopHandler,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Appointment time',
    value: null,
    hint: 'Choose a time within business hours (8am–6pm)',
    changeHandler: noopHandler,
  },
};

export const WithError: Story = {
  args: {
    label: 'Start time',
    value: null,
    error: 'Start time is required',
    changeHandler: noopHandler,
  },
};

export const Required: Story = {
  args: {
    label: 'Job start time',
    required: true,
    value: null,
    changeHandler: noopHandler,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Locked time',
    value: '14:00',
    disabled: true,
    changeHandler: noopHandler,
  },
};
