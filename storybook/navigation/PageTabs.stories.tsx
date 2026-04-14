import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PageTabs from '../../PageComponents/Layout/PageTabs';

/**
 * PageTabs is the primary horizontal tab navigation used at the top of ServCraft
 * detail pages (jobs, invoices, customers, etc.).
 *
 * **Props:**
 * - `tabs` — array of `{ text, count?, disabled?, newItem? }` objects
 * - `selectedTab` — the currently active tab's text
 * - `setSelectedTab` — called when a tab is clicked
 * - `showTab1Count` — show the count badge on the first tab
 * - `tabsProps` — forwarded to the underlying Mantine Tabs component
 *
 * **Variants:** Default · With counts · With disabled tab · With "new" badge
 */
const meta: Meta<any> = {
  title: 'Navigation/PageTabs',
  component: PageTabs,
  tags: ['autodocs'],
  argTypes: {
    showTab1Count: { control: 'boolean', description: 'Show count badge on the first tab' },
    setSelectedTab: { action: 'tab-selected' },
  },
  parameters: {
    // PageTabs is a navigation-only component — it renders <Tabs.List> but not
    // <Tabs.Panel>. In production, the page consumer renders panels inside the
    // same <Tabs> context. Storybook stories can't replicate that structure, so
    // Mantine's auto-generated aria-controls refs will point to non-existent
    // panels. Suppress aria-valid-attr-value for this story only.
    a11y: {
      // options.rules is what the test: 'error' channel path actually reads
      options: {
        rules: { 'aria-valid-attr-value': { enabled: false } },
      },
    },
  },
};

export default meta;
type Story = StoryObj<any>;

const TABS = [
  { text: 'Details' },
  { text: 'Notes', count: 3 },
  { text: 'Attachments', count: 7 },
  { text: 'History' },
];

const Controlled = ({ tabs, ...args }: any) => {
  const [selected, setSelected] = useState(tabs[0].text);
  return (
    <PageTabs
      {...args}
      tabs={tabs}
      selectedTab={selected}
      setSelectedTab={setSelected}
      tabsProps={{}}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} tabs={[{ text: 'Details' }, { text: 'Notes' }, { text: 'History' }]} />,
};

export const WithCounts: Story = {
  name: 'With count badges',
  render: (args) => <Controlled {...args} tabs={TABS} />,
};

export const WithDisabled: Story = {
  name: 'With disabled tab',
  render: (args) => (
    <Controlled
      {...args}
      tabs={[
        { text: 'Details' },
        { text: 'Payments', count: 2 },
        { text: 'Attachments', disabled: true },
        { text: 'History' },
      ]}
    />
  ),
};

export const WithNewBadge: Story = {
  name: 'With "new" badge',
  render: (args) => (
    <Controlled
      {...args}
      tabs={[
        { text: 'Details' },
        { text: 'AI Insights', newItem: true },
        { text: 'History' },
      ]}
    />
  ),
};
