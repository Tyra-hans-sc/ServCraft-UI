import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import SCCheckbox from '../../components/sc-controls/form-controls/sc-checkbox';

/**
 * SCCheckbox is the standard boolean input for ServCraft forms. It wraps
 * Mantine's Checkbox with the `scBlue` brand colour and consistent spacing.
 *
 * The `value` prop controls the checked state (truthy = checked). The
 * `onChange` callback receives a plain `boolean`.
 *
 * **States:** Unchecked · Checked · Indeterminate · Disabled · With hint
 */
const meta: Meta<typeof SCCheckbox> = {
  title: 'Form Controls/SCCheckbox',
  component: SCCheckbox,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Label displayed next to the checkbox' },
    value: { control: 'boolean', description: 'Checked state (truthy = checked)' },
    hint: { control: 'text', description: 'Helper description shown below the label' },
    disabled: { control: 'boolean', description: 'Prevents interaction and dims the control' },
    indeterminate: { control: 'boolean', description: 'Shows a dash instead of a tick — used for "select all" patterns' },
    labelPlacement: {
      control: 'radio',
      options: ['after', 'before'],
      description: 'Position of the label relative to the checkbox',
      table: { defaultValue: { summary: 'after' } },
    },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof SCCheckbox>;

export const Unchecked: Story = {
  args: {
    label: 'Send email notifications',
    value: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Send email notifications',
    value: true,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Accept terms and conditions',
    value: false,
    hint: 'You must accept before continuing',
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all jobs',
    value: false,
    indeterminate: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /select all jobs/i });
    // Checkbox must be present and interactive
    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).not.toBeDisabled();
    // Click must not throw — onChange fires via Storybook action
    await userEvent.click(checkbox);
    await expect(canvas.getByRole('checkbox')).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    label: 'SMS notifications (unavailable)',
    value: false,
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  name: 'Disabled (checked)',
  args: {
    label: 'Mandatory compliance setting',
    value: true,
    disabled: true,
  },
};

export const LabelBefore: Story = {
  name: 'Label before checkbox',
  args: {
    label: 'Active',
    value: true,
    labelPlacement: 'before',
  },
};
