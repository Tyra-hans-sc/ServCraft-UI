import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCCard from '../../components/sc-controls/layout/sc-card';

/**
 * SCCard is the standard content card for ServCraft. It provides a white
 * rounded container with a drop shadow, wrapping any `body` content.
 *
 * **Props:**
 * - `body` — the content to render inside the card (any ReactNode)
 *
 * **Variants:** Text content · Form-like content · With list
 */
const meta: Meta<any> = {
  title: 'Layout/SCCard',
  component: SCCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    body: (
      <div>
        <h4 style={{ margin: '0 0 8px' }}>Card title</h4>
        <p style={{ margin: 0, color: '#666' }}>
          This is the standard ServCraft card. Use it to group related content with a consistent container.
        </p>
      </div>
    ),
  },
};

export const WithList: Story = {
  name: 'With list content',
  args: {
    body: (
      <div>
        <h4 style={{ margin: '0 0 12px' }}>Recent activity</h4>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Job #J-0043 updated by Alice</li>
          <li>Invoice #INV-0082 paid</li>
          <li>New customer: Acme Corp</li>
        </ul>
      </div>
    ),
  },
};

export const Minimal: Story = {
  args: {
    body: <p style={{ margin: 0 }}>Simple card with just a paragraph of text.</p>,
  },
};
