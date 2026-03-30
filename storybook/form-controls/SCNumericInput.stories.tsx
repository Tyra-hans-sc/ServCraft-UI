import type { Meta, StoryObj } from '@storybook/react';
import SCNumericInput from '../../components/sc-controls/form-controls/sc-numeric-input';

/**
 * SCNumericInput is the standard number input for ServCraft forms. It wraps
 * Mantine's NumberInput with currency, percentage, decimal, and integer formatting.
 *
 * **Format variants:**
 * - `Decimal` — default, 2 decimal places
 * - `Integer` — whole numbers only
 * - `Currency` — prefixed with $
 * - `Percentage` — suffixed with %
 *
 * **States:** Default · Error · Disabled · ReadOnly · Required
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCNumericInput',
  component: SCNumericInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    hint: { control: 'text', description: 'Helper text below the input' },
    error: { control: 'text', description: 'Validation error message' },
    value: { control: 'number', description: 'Controlled value' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    readOnly: { control: 'boolean', description: 'Shows value without editing' },
    min: { control: 'number', description: 'Minimum allowed value' },
    max: { control: 'number', description: 'Maximum allowed value' },
    alignRight: { control: 'boolean', description: 'Right-aligns the number value' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    name: 'quantity',
    label: 'Quantity',
    value: 0,
    min: 0,
  },
};

export const WithValue: Story = {
  args: {
    name: 'price',
    label: 'Unit price',
    value: 125.5,
  },
};

export const WithHint: Story = {
  args: {
    name: 'hours',
    label: 'Hours worked',
    value: 8,
    hint: 'Enter the number of hours to the nearest quarter hour',
  },
};

export const WithError: Story = {
  args: {
    name: 'qty',
    label: 'Quantity',
    value: -1,
    min: 0,
    error: 'Quantity must be 0 or greater',
  },
};

export const Required: Story = {
  args: {
    name: 'amount',
    label: 'Invoice amount',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    name: 'total',
    label: 'Calculated total',
    value: 340.0,
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    name: 'tax',
    label: 'Tax amount',
    value: 34.0,
    readOnly: true,
  },
};

export const AlignRight: Story = {
  name: 'Right-aligned',
  args: {
    name: 'cost',
    label: 'Cost',
    value: 99.99,
    alignRight: true,
  },
};
