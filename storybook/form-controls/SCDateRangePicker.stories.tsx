import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePickerInput } from '@mantine/dates';
import { Text, Stack, Badge } from '@mantine/core';

/**
 * ServCraft uses Mantine's `DatePickerInput` with `type="range"` for date
 * range selection. The production wrapper lives at
 * `components/kendo/kendo-date-range-picker.tsx`.
 *
 * **Key props:**
 * - `type="range"` — enables range selection mode
 * - `numberOfColumns={2}` — shows two side-by-side months
 * - `allowSingleDateInRange` — lets a single day be selected as a valid range
 * - `value` — `[Date | null, Date | null]` tuple
 * - `onChange` — called with the same tuple on every click
 *
 * For the full DatePickerInput API see
 * [Mantine docs → DatePickerInput](https://mantine.dev/dates/date-picker-input/).
 */
const meta: Meta = {
  title: 'Form Controls/SCDateRangePicker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Date range selection built on Mantine `DatePickerInput type="range"`. ' +
          'See [Mantine docs](https://mantine.dev/dates/date-picker-input/) for the full prop list.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Controlled wrapper so the calendar is interactive in Storybook
// ---------------------------------------------------------------------------

function RangePicker({
  initialValue = [null, null] as [Date | null, Date | null],
  numberOfColumns = 2,
  allowSingleDateInRange = true,
  label = 'Date range',
  placeholder = 'Pick start and end date',
}: {
  initialValue?: [Date | null, Date | null];
  numberOfColumns?: 1 | 2;
  allowSingleDateInRange?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState<[Date | null, Date | null]>(initialValue);

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <Stack gap="sm" style={{ maxWidth: 520 }}>
      <DatePickerInput
        type="range"
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={setValue}
        numberOfColumns={numberOfColumns}
        allowSingleDateInRange={allowSingleDateInRange}
        locale="en"
      />
      <Text size="sm" c="dimmed">
        Selected: <strong>{formatDate(value[0])}</strong> → <strong>{formatDate(value[1])}</strong>
      </Text>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Default (empty)',
  render: () => <RangePicker />,
};

export const WithValue: Story = {
  name: 'Pre-selected range',
  render: () => (
    <RangePicker
      label="Job period"
      initialValue={[new Date('2025-06-02'), new Date('2025-06-14')]}
    />
  ),
};

export const SingleColumn: Story = {
  name: 'Single column calendar',
  render: () => (
    <RangePicker
      label="Filter by date"
      numberOfColumns={1}
    />
  ),
};

export const SingleDateAsRange: Story = {
  name: 'Single date as valid range',
  render: () => (
    <Stack gap="xs" style={{ maxWidth: 520 }}>
      <Badge color="blue" variant="light" size="sm">
        allowSingleDateInRange = true
      </Badge>
      <RangePicker
        label="One-day job"
        initialValue={[new Date('2025-07-10'), new Date('2025-07-10')]}
        allowSingleDateInRange={true}
      />
    </Stack>
  ),
};
