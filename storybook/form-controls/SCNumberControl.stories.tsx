import type { Meta, StoryObj } from '@storybook/react';
import ScNumberControl from '../../components/sc-controls/form-controls/v2/sc-number-control';

/**
 * ScNumberControl is the Mantine v7 number input for ServCraft V2 forms. It
 * wraps Mantine's `NumberInput` with `selectOnFocus` behaviour enabled by default.
 *
 * **Props:**
 * - All Mantine `NumberInputProps` are accepted
 * - `selectOnFocus` — selects all text on focus (default: `true`)
 * - `label` — field label
 * - `min` / `max` — allowed range
 * - `prefix` / `suffix` — currency or unit symbols
 *
 * **States:** Default · With prefix · With suffix · Error · Disabled
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCNumberControl',
  component: ScNumberControl,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    min: { control: 'number', description: 'Minimum allowed value' },
    max: { control: 'number', description: 'Maximum allowed value' },
    selectOnFocus: { control: 'boolean', description: 'Selects value text on focus' },
    prefix: { control: 'text', description: 'Symbol before the value (e.g. $)' },
    suffix: { control: 'text', description: 'Symbol after the value (e.g. %)' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    label: 'Quantity',
    value: 1,
    min: 0,
  },
};

export const Currency: Story = {
  args: {
    label: 'Unit price',
    value: 125.0,
    prefix: '$',
    decimalScale: 2,
    fixedDecimalScale: true,
  },
};

export const Percentage: Story = {
  args: {
    label: 'Discount',
    value: 10,
    suffix: '%',
    min: 0,
    max: 100,
  },
};

export const WithError: Story = {
  args: {
    label: 'Quantity',
    error: 'Quantity must be greater than 0',
  },
};

export const Required: Story = {
  args: {
    label: 'Hours',
    required: true,
    min: 0,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Total (calculated)',
    value: 375.0,
    prefix: '$',
    disabled: true,
  },
};
