import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCRadioButtonGroup from '../../components/sc-controls/form-controls/sc-radio-button-group';
import SCRadioButton from '../../components/sc-controls/form-controls/sc-radio-button';

/**
 * SCRadioButton and SCRadioButtonGroup work together to create radio button sets.
 *
 * - **SCRadioButtonGroup** — the container. Manages selection state and fires
 *   `onChange({ name, value })` when the user picks an option.
 * - **SCRadioButton** — individual radio option. Place these as children
 *   inside SCRadioButtonGroup.
 *
 * Both render Mantine Radio components with the `scBlue` brand colour.
 *
 * **States:** Default · With selection · Required · With hint · Disabled option
 */
const meta: Meta<typeof SCRadioButtonGroup> = {
  title: 'Form Controls/SCRadioButtonGroup',
  component: SCRadioButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Group label shown above the options' },
    hint: { control: 'text', description: 'Helper text below the label' },
    required: { control: 'boolean', description: 'Shows asterisk on the group label' },
    value: { control: 'text', description: 'Currently selected value' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof SCRadioButtonGroup>;

export const Default: Story = {
  args: {
    label: 'Job type',
    name: 'jobType',
  },
  render: (args) => (
    <SCRadioButtonGroup {...args}>
      <SCRadioButton value="install" label="Installation" />
      <SCRadioButton value="service" label="Service" />
      <SCRadioButton value="repair" label="Repair" />
    </SCRadioButtonGroup>
  ),
};

export const WithSelection: Story = {
  args: {
    label: 'Job type',
    name: 'jobType',
    value: 'service',
  },
  render: (args) => (
    <SCRadioButtonGroup {...args}>
      <SCRadioButton value="install" label="Installation" />
      <SCRadioButton value="service" label="Service" />
      <SCRadioButton value="repair" label="Repair" />
    </SCRadioButtonGroup>
  ),
};

export const Required: Story = {
  args: {
    label: 'Invoice frequency',
    name: 'invoiceFreq',
    required: true,
  },
  render: (args) => (
    <SCRadioButtonGroup {...args}>
      <SCRadioButton value="weekly" label="Weekly" />
      <SCRadioButton value="fortnightly" label="Fortnightly" />
      <SCRadioButton value="monthly" label="Monthly" />
    </SCRadioButtonGroup>
  ),
};

export const WithHint: Story = {
  args: {
    label: 'Billing method',
    name: 'billing',
    hint: 'This determines how invoices are generated for this customer',
  },
  render: (args) => (
    <SCRadioButtonGroup {...args}>
      <SCRadioButton value="auto" label="Automatic (on job completion)" />
      <SCRadioButton value="manual" label="Manual (I will create invoices)" />
    </SCRadioButtonGroup>
  ),
};

export const WithDisabledOption: Story = {
  name: 'With a disabled option',
  args: {
    label: 'Notification preference',
    name: 'notif',
    value: 'email',
  },
  render: (args) => (
    <SCRadioButtonGroup {...args}>
      <SCRadioButton value="email" label="Email" />
      <SCRadioButton value="sms" label="SMS" disabled />
      <SCRadioButton value="push" label="Push notification" disabled />
    </SCRadioButtonGroup>
  ),
};
