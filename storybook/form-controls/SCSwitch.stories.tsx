import type { Meta, StoryObj } from '@storybook/react';
import SCSwitch from '../../components/sc-controls/form-controls/sc-switch';

/**
 * SCSwitch is a toggle control for binary on/off settings. It wraps Mantine's
 * Switch at `sm` size with the `scBlue` brand colour.
 *
 * Use SCSwitch when the action takes effect immediately (e.g. enabling a
 * feature). Use SCCheckbox for form submissions where values are committed
 * together.
 *
 * The `onChange` callback receives `{ name, value: boolean }`.
 * The `onToggle` callback receives the boolean directly.
 *
 * **States:** Off · On · Disabled · With label · Custom colour
 */
const meta: Meta<typeof SCSwitch> = {
  title: 'Form Controls/SCSwitch',
  component: SCSwitch,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Label displayed next to the toggle' },
    checked: { control: 'boolean', description: 'Whether the switch is on' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    onLabel: { control: 'text', description: 'Text inside the track when on (optional)' },
    offLabel: { control: 'text', description: 'Text inside the track when off (optional)' },
    color: { control: 'text', description: 'Mantine color key — defaults to scBlue' },
    onChange: { action: 'changed' },
    onToggle: { action: 'toggled' },
  },
};

export default meta;
type Story = StoryObj<typeof SCSwitch>;

export const Off: Story = {
  args: {
    label: 'Enable notifications',
    checked: false,
  },
};

export const On: Story = {
  args: {
    label: 'Enable notifications',
    checked: true,
  },
};

export const NoLabel: Story = {
  args: {
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Auto-assign jobs',
    checked: false,
    disabled: true,
  },
};

export const DisabledOn: Story = {
  name: 'Disabled (on)',
  args: {
    label: 'Auto-assign jobs',
    checked: true,
    disabled: true,
  },
};

export const WithTrackLabels: Story = {
  name: 'With on/off track labels',
  args: {
    checked: true,
    onLabel: 'Yes',
    offLabel: 'No',
  },
};
