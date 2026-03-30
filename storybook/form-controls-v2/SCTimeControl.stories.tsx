import type { Meta, StoryObj } from '@storybook/react';
import SCTimeControl from '../../components/sc-controls/form-controls/v2/SCTimeControl';

/**
 * SCTimeControl is the Mantine v7 time input for ServCraft V2 forms. It
 * accepts a value in `yyyy-MM-ddTHH:mm:ss` ISO format and supports both
 * 12-hour and 24-hour display modes.
 *
 * **Props:**
 * - `value` — ISO datetime string
 * - `format` — `'12'` or `'24'` (default: `'24'`)
 * - `label` — field label
 * - `error` — validation error message
 * - `required` — marks the field as required
 * - `disabled` — prevents interaction
 * - `withSeconds` — shows seconds field
 *
 * **Variants:** Default · 12-hour · With seconds · Error · Disabled
 */
const meta: Meta<any> = {
  title: 'Form Controls V2/SCTimeControl',
  component: SCTimeControl,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    format: { control: 'select', options: ['12', '24'], description: '12 or 24 hour clock' },
    withSeconds: { control: 'boolean', description: 'Show seconds field' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    label: 'Start time',
    value: '2025-01-01T09:00:00',
    format: '24',
  },
};

export const TwelveHour: Story = {
  name: '12-hour format',
  args: {
    label: 'Appointment time',
    value: '2025-01-01T14:30:00',
    format: '12',
  },
};

export const WithSeconds: Story = {
  name: 'With seconds',
  args: {
    label: 'Duration',
    value: '2025-01-01T01:30:45',
    withSeconds: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Start time',
    value: '2025-01-01T00:00:00',
    error: 'Start time is required',
  },
};

export const Required: Story = {
  args: {
    label: 'Job start time',
    value: '2025-01-01T08:00:00',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Created at',
    value: '2025-01-01T10:23:00',
    disabled: true,
  },
};
