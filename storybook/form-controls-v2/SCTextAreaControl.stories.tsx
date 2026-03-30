import type { Meta, StoryObj } from '@storybook/react';
import ScTextAreaControl from '../../components/sc-controls/form-controls/v2/ScTextAreaControl';

/**
 * ScTextAreaControl is the Mantine v7 textarea for ServCraft V2 forms. It
 * forwards all Mantine `TextareaProps` and supports auto-resize.
 *
 * **Props:**
 * - All Mantine `TextareaProps` are accepted
 * - `label` — field label
 * - `placeholder` — placeholder text
 * - `autosize` — auto-grows to fit content
 * - `minRows` / `maxRows` — row limits when `autosize` is on
 * - `required` — marks the field as required
 * - `error` — validation error message
 *
 * **States:** Default · With value · Autosize · Error · Disabled
 */
const meta: Meta<any> = {
  title: 'Form Controls V2/ScTextAreaControl',
  component: ScTextAreaControl,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Marks the field as required' },
    disabled: { control: 'boolean', description: 'Prevents editing' },
    autosize: { control: 'boolean', description: 'Auto-grows with content' },
    minRows: { control: 'number', description: 'Minimum visible rows' },
    maxRows: { control: 'number', description: 'Maximum rows before scrolling' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Enter notes…',
    minRows: 3,
  },
};

export const WithValue: Story = {
  name: 'With value',
  args: {
    label: 'Job description',
    value: 'Replace broken gutter section on north-facing wall. Use 150mm aluminium gutter to match existing.',
    minRows: 3,
  },
};

export const Autosize: Story = {
  name: 'Autosize',
  args: {
    label: 'Description',
    placeholder: 'Start typing — the field grows automatically…',
    autosize: true,
    minRows: 2,
    maxRows: 8,
  },
};

export const WithError: Story = {
  args: {
    label: 'Reason for cancellation',
    error: 'Please provide a reason',
    minRows: 3,
  },
};

export const Required: Story = {
  args: {
    label: 'Job description',
    required: true,
    minRows: 3,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Internal notes',
    value: 'These notes are read-only.',
    disabled: true,
    minRows: 2,
  },
};
