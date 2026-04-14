import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Tabs from '../../components/tabs';

/**
 * Tabs is the standard tab navigation component used in list pages and
 * filtered views throughout ServCraft.
 *
 * **Props:**
 * - `tabs` — array of `{ text, count?, suppressCount?, fitContent?, disabled? }`
 * - `selectedTab` — the currently active tab text
 * - `setSelectedTab` — called when a tab is clicked
 * - `showTab1Count` — show count on the first tab
 * - `disabled` — disables all tab interaction
 *
 * **Variants:** Default · With counts · Disabled · Compact (fitContent)
 */
const meta: Meta<any> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean', description: 'Disables all tab interaction' },
    showTab1Count: { control: 'boolean', description: 'Show count badge on first tab' },
    setSelectedTab: { action: 'tab-selected' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Controlled = ({ tabs, ...args }: any) => {
  const [selected, setSelected] = useState(tabs[0].text);
  return (
    <Tabs {...args} tabs={tabs} selectedTab={selected} setSelectedTab={setSelected} />
  );
};

export const Default: Story = {
  render: (args) => (
    <Controlled {...args} tabs={[{ text: 'All' }, { text: 'Active' }, { text: 'Completed' }]} />
  ),
};

export const WithCounts: Story = {
  name: 'With counts',
  render: (args) => (
    <Controlled
      {...args}
      tabs={[
        { text: 'All', count: 142 },
        { text: 'Pending', count: 23 },
        { text: 'In Progress', count: 8 },
        { text: 'Complete', count: 111 },
      ]}
    />
  ),
};

export const WithDisabledTab: Story = {
  name: 'With disabled tab',
  render: (args) => (
    <Controlled
      {...args}
      tabs={[{ text: 'Active' }, { text: 'Archived', disabled: true }, { text: 'All' }]}
    />
  ),
};

export const AllDisabled: Story = {
  name: 'All tabs disabled',
  render: (args) => (
    <Controlled
      {...args}
      tabs={[{ text: 'Jobs' }, { text: 'Quotes' }, { text: 'Invoices' }]}
      disabled
    />
  ),
};
