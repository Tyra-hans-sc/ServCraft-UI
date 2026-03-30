import type { Meta, StoryObj } from '@storybook/react';
import SCDatePicker from '../../components/sc-controls/form-controls/sc-datepicker';

/**
 * SCDatePicker is the standard date input for ServCraft forms. It wraps
 * Mantine's DateInput with date parsing via the internal `Time` utility.
 *
 * The `value` prop accepts a `Date`, ISO string, or `null`.
 * Changes are returned via `changeHandler({ name, value: isoString | null })`
 * or the simpler `onChange(isoString | null)`.
 *
 * Set `canClear` to show an × button when a date is selected.
 * Use `minDate` / `maxDate` to constrain the calendar.
 *
 * **States:** Default · With value · Min/Max bounds · Clearable · Error · Disabled · ReadOnly · Required
 */
const meta: Meta<typeof SCDatePicker> = {
  title: 'Form Controls/SCDatePicker',
  component: SCDatePicker,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    hint: { control: 'text', description: 'Helper text below the input' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Shows asterisk on label' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    readOnly: { control: 'boolean', description: 'Shows value but prevents editing' },
    canClear: { control: 'boolean', description: 'Show × button to clear the date' },
    onChange: { action: 'changed' },
    changeHandler: { action: 'changeHandler' },
  },
};

export default meta;
type Story = StoryObj<typeof SCDatePicker>;

export const Default: Story = {
  args: {
    label: 'Start date',
    value: null,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Start date',
    value: new Date('2025-06-15'),
  },
};

export const Clearable: Story = {
  args: {
    label: 'Due date',
    value: new Date('2025-07-01'),
    canClear: true,
  },
};

export const WithMinMax: Story = {
  name: 'Min / max date bounds',
  args: {
    label: 'Schedule date',
    value: null,
    minDate: new Date(),
    hint: 'Cannot select a date in the past',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Warranty expiry',
    value: null,
    hint: 'Leave blank if no warranty applies',
  },
};

export const WithError: Story = {
  args: {
    label: 'Start date',
    value: null,
    error: 'Start date is required',
  },
};

export const Required: Story = {
  args: {
    label: 'Job date',
    required: true,
    value: null,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Completion date',
    value: new Date('2025-05-20'),
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Invoice date',
    value: new Date('2025-04-01'),
    readOnly: true,
  },
};
