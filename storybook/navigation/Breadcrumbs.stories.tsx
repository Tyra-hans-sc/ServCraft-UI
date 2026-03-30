import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumbs from '../../PageComponents/Layout/Breadcrumbs';

/**
 * Breadcrumbs renders the page-level navigation trail used across all ServCraft
 * pages. The trail is driven by a `breadcrumbs` array stored in session storage
 * by the app router, plus an optional `currPage` prop for the active leaf.
 *
 * **Props:**
 * - `currPage` — `{ text: string; link: string; type: string }` — the current
 *   (active) page shown as the last crumb
 * - `color` — CSS colour for the breadcrumb text
 *
 * > In Storybook the session storage trail is empty, so only the `currPage`
 * > crumb is shown. In production the full trail is built by the router.
 *
 * **Variants:** Single crumb · Custom colour
 */
const meta: Meta<any> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color', description: 'Text colour for the breadcrumb trail' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    currPage: { text: 'Job #J-00123', link: '/jobs/123', type: 'job' },
  },
};

export const CustomColour: Story = {
  name: 'Custom colour',
  args: {
    currPage: { text: 'Invoice #INV-0054', link: '/invoices/54', type: 'invoice' },
    color: '#003ED0',
  },
};
