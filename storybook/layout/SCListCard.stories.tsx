import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCListCard from '../../components/sc-controls/layout/sc-list-card';

/**
 * SCListCard is a clickable card used in list views. It wraps its children
 * in a card-style container with an optional click handler and background colour.
 *
 * **Props:**
 * - `children` — content to display inside the card
 * - `background` — CSS background colour (default: white)
 * - `onClick` — called when the card is clicked (adds pointer cursor)
 *
 * **Variants:** Default · Clickable · Coloured background · Stacked list
 */
const meta: Meta<any> = {
  title: 'Layout/SCListCard',
  component: SCListCard,
  tags: ['autodocs'],
  argTypes: {
    background: { control: 'color', description: 'Card background colour' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  render: (args) => (
    <SCListCard {...args}>
      <strong>Job #J-00123</strong>
      <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
        Replace gutters — Acme Corp · 42 Main St
      </p>
    </SCListCard>
  ),
};

export const Clickable: Story = {
  render: (args) => (
    <SCListCard {...args} onClick={() => {}}>
      <strong>Invoice #INV-0054</strong>
      <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
        $1,250.00 · Paid · Due 15 Jun 2025
      </p>
    </SCListCard>
  ),
};

export const ColouredBackground: Story = {
  name: 'Coloured background',
  render: (args) => (
    <SCListCard {...args} background="#e9f1ff">
      <strong>Upcoming appointment</strong>
      <p style={{ margin: '4px 0 0', fontSize: 14 }}>Tomorrow at 9:00 AM · Acme Corp</p>
    </SCListCard>
  ),
};

export const StackedList: Story = {
  name: 'Stacked list',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
      {['J-001', 'J-002', 'J-003'].map((id) => (
        <SCListCard key={id} {...args} onClick={() => {}}>
          <strong>Job #{id}</strong>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>Sample job · In Progress</p>
        </SCListCard>
      ))}
    </div>
  ),
};
