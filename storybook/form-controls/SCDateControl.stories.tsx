import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePickerInput } from '@mantine/dates';
import { Stack, Text } from '@mantine/core';
import ScDateControl from '../../components/sc-controls/form-controls/v2/ScDateControl';

/**
 * SCDateControl is the Mantine v7 date input for ServCraft forms. It wraps
 * Mantine's `DateInput` with a consistent margin and forwards all DateInputProps.
 *
 * Source: `components/sc-controls/form-controls/v2/ScDateControl.tsx`
 *
 * > For **date ranges** use Mantine's `DatePickerInput type="range"` directly —
 * > see the `Date range` story below.
 *
 * **Props:**
 * - All Mantine `DateInputProps` are accepted
 * - `label` — field label
 * - `placeholder` — placeholder text
 * - `required` — marks the field as required
 * - `disabled` — prevents interaction
 * - `error` — validation error message
 * - `clearable` — shows a clear button
 *
 * **States:** Default · With value · Clearable · Error · Required · Disabled · Date range
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCDateControl',
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

export const DateRange: Story = {
  name: 'Date range (DatePickerInput)',
  render: () => {
    function RangePicker() {
      const [value, setValue] = useState<[Date | null, Date | null]>([null, null]);
      const fmt = (d: Date | null) =>
        d ? d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
      return (
        <Stack gap="sm" style={{ maxWidth: 520 }}>
          <Text size="xs" c="dimmed">
            Use Mantine's <code>DatePickerInput type="range"</code> for date ranges —
            SCDateControl is single-date only.
          </Text>
          <DatePickerInput
            type="range"
            label="Date range"
            placeholder="Pick start and end date"
            value={value}
            onChange={setValue}
            numberOfColumns={2}
            allowSingleDateInRange
            locale="en"
          />
          <Text size="sm" c="dimmed">
            Selected: <strong>{fmt(value[0])}</strong> → <strong>{fmt(value[1])}</strong>
          </Text>
        </Stack>
      );
    }
    return <RangePicker />;
  },
};
