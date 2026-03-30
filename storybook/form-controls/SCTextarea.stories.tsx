import type { Meta, StoryObj } from '@storybook/react';
import SCTextArea from '../../components/sc-controls/form-controls/sc-textarea';

/**
 * SCTextArea is the multi-line text input for ServCraft forms. It wraps
 * Mantine's Textarea with autosize enabled by default, growing from 4 rows
 * up to 10 rows before showing a scrollbar.
 *
 * Default `maxLength` is 4000 characters.
 *
 * **States:** Default · With value · Error · Disabled · ReadOnly · Required · Fixed height
 */
const meta: Meta<typeof SCTextArea> = {
  title: 'Form Controls/SCTextArea',
  component: SCTextArea,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label displayed above the textarea' },
    value: { control: 'text', description: 'Controlled value' },
    placeholder: { control: 'text', description: 'Placeholder text shown when empty' },
    hint: { control: 'text', description: 'Helper text shown below the textarea' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Shows an asterisk on the label' },
    disabled: { control: 'boolean', description: 'Prevents interaction and dims the field' },
    readOnly: { control: 'boolean', description: 'Shows value but prevents editing' },
    autoSize: {
      control: 'boolean',
      description: 'Grow height to fit content (rows → maxRows)',
      table: { defaultValue: { summary: 'true' } },
    },
    rows: { control: 'number', description: 'Minimum number of visible rows', table: { defaultValue: { summary: '4' } } },
    maxRows: { control: 'number', description: 'Maximum rows before scrolling', table: { defaultValue: { summary: '10' } } },
    maxLength: { control: 'number', description: 'Character limit', table: { defaultValue: { summary: '4000' } } },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof SCTextArea>;

export const Default: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Add any relevant notes…',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Job description',
    value: 'Replace the faulty compressor unit in the rooftop HVAC system. Ensure all safety procedures are followed and document any additional faults observed.',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Customer message',
    placeholder: 'Write a message to the customer…',
    hint: 'This will be visible in the customer portal',
  },
};

export const WithError: Story = {
  args: {
    label: 'Notes',
    value: '',
    error: 'Notes are required for this job type',
  },
};

export const Required: Story = {
  args: {
    label: 'Reason for cancellation',
    required: true,
    placeholder: 'Explain why this job is being cancelled…',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Archived notes',
    value: 'These notes are from a completed job and cannot be edited.',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Original scope',
    value: 'Install 3x split-system air conditioners in open-plan office area.',
    readOnly: true,
  },
};

export const FixedHeight: Story = {
  name: 'Fixed height (no autosize)',
  args: {
    label: 'Comments',
    placeholder: 'Enter comments…',
    autoSize: false,
    rows: 6,
  },
};
