import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IconDownload, IconPrinter, IconSend } from '@tabler/icons-react';
import SCSplitButton from '../../components/sc-controls/form-controls/sc-split-button';

/**
 * SCSplitButton combines a primary action button with a dropdown menu of
 * secondary actions. It's used throughout ServCraft for contextual actions
 * where one action is primary (e.g. Save) and others are secondary
 * (e.g. Save and send, Save as draft).
 *
 * The first item with `defaultItem: true` becomes the primary button.
 * All other non-hidden items appear in the dropdown menu.
 *
 * Set `hidden: true` on an item to remove it from both button and menu.
 * Set `disabled: true` on an item to grey it out but keep it visible.
 *
 * **States:** Default · With icons · Some items disabled · All disabled · Hidden items · Single item
 */
const meta: Meta<typeof SCSplitButton> = {
  title: 'Form Controls/SCSplitButton',
  component: SCSplitButton,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean', description: 'Disables the entire control (button + all menu items)' },
  },
};

export default meta;
type Story = StoryObj<typeof SCSplitButton>;

export const Default: Story = {
  render: () => (
    <SCSplitButton items={[
      { key: 'save', label: 'Save', defaultItem: true, action: () => {} },
      { key: 'save-send', label: 'Save and send', action: () => {} },
      { key: 'save-draft', label: 'Save as draft', action: () => {} },
    ]} />
  ),
};

export const WithIcons: Story = {
  name: 'With icons',
  render: () => (
    <SCSplitButton items={[
      { key: 'download', label: 'Download PDF', defaultItem: true, leftSection: <IconDownload size={14} />, action: () => {} },
      { key: 'print', label: 'Print', leftSection: <IconPrinter size={14} />, action: () => {} },
      { key: 'send', label: 'Send to customer', leftSection: <IconSend size={14} />, action: () => {} },
    ]} />
  ),
};

export const WithDisabledItem: Story = {
  name: 'Some items disabled',
  render: () => (
    <SCSplitButton items={[
      { key: 'save', label: 'Save', defaultItem: true, action: () => {} },
      { key: 'send', label: 'Send invoice', action: () => {} },
      { key: 'delete', label: 'Delete', disabled: true, action: () => {} },
    ]} />
  ),
};

export const AllDisabled: Story = {
  name: 'All disabled',
  render: () => (
    <SCSplitButton
      disabled
      items={[
        { key: 'save', label: 'Save', defaultItem: true, action: () => {} },
        { key: 'save-send', label: 'Save and send', action: () => {} },
      ]}
    />
  ),
};

export const WithHiddenItems: Story = {
  name: 'With hidden items (permissions)',
  render: () => (
    <SCSplitButton items={[
      { key: 'save', label: 'Save', defaultItem: true, action: () => {} },
      { key: 'approve', label: 'Approve', action: () => {} },
      { key: 'delete', label: 'Delete (hidden)', hidden: true, action: () => {} },
    ]} />
  ),
};

export const SingleItem: Story = {
  name: 'Single item (no dropdown)',
  render: () => (
    <SCSplitButton items={[
      { key: 'save', label: 'Save', defaultItem: true, action: () => {} },
    ]} />
  ),
};
