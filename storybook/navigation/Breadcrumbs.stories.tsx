import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Box } from '@mantine/core';
import Breadcrumbs from '../../PageComponents/Layout/Breadcrumbs';

/**
 * Breadcrumbs renders the page-level navigation trail used across all ServCraft
 * pages. The trail is driven by a `breadcrumbs` array stored in
 * `sessionStorage["servCrumbs"]` by the app router, plus an optional `currPage`
 * prop for the active leaf.
 *
 * **Props:**
 * - `currPage` — `{ text: string; link: string; type: string }` — active leaf crumb
 * - `color` — CSS colour for the breadcrumb text
 *
 * **Behaviour:**
 * - "Dashboard" is filtered out of the visible trail (always implicit)
 * - Last crumb renders `fw={600}` (bold)
 * - Crumbs are separated by `IconChevronRight`
 * - On mobile (`≤800px`) only the last crumb is shown; a chevron-button reveals
 *   the full trail in a dropdown
 *
 * > These stories pre-populate `sessionStorage["servCrumbs"]` so the full
 * > trail renders in isolation.
 *
 * Source: `PageComponents/Layout/Breadcrumbs.tsx`
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

// ---------------------------------------------------------------------------
// Helper: pre-populates sessionStorage so the component renders a full trail
// ---------------------------------------------------------------------------

function BreadcrumbsWithTrail({
  crumbs,
  currPage,
  color,
}: {
  crumbs: { text: string; link: string; type: string }[];
  currPage: { text: string; link: string; type: string };
  color?: string;
}) {
  // The component reads sessionStorage['servCrumbs'] on mount and calls
  // initialiseCurrentPage() which appends currPage itself. If currPage is
  // already the last item and its type matches, the component collapses the
  // trail. Pre-populate with only the ancestor crumbs (excluding currPage)
  // so the component logic correctly builds the full visible trail.
  sessionStorage['servCrumbs'] = JSON.stringify([
    { text: 'Dashboard', link: '/', type: 'list' },
    ...crumbs,
  ]);
  return <Breadcrumbs currPage={currPage} color={color} />;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Single crumb (current page only)',
  args: {
    currPage: { text: 'Job #J-00123', link: '/jobs/123', type: 'edit' },
  },
};

export const TwoLevels: Story = {
  name: 'Two levels — Jobs → Job detail',
  render: () => (
    <BreadcrumbsWithTrail
      crumbs={[{ text: 'Jobs', link: '/jobs', type: 'list' }]}
      currPage={{ text: 'Job #J-00123', link: '/jobs/123', type: 'edit' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both crumb labels must be rendered in the trail
    await expect(canvas.getByText('Jobs')).toBeInTheDocument();
    await expect(canvas.getByText('Job #J-00123')).toBeInTheDocument();
  },
};

export const ThreeLevels: Story = {
  name: 'Three levels — Customers → Jobs → Job detail',
  render: () => (
    <BreadcrumbsWithTrail
      crumbs={[
        { text: 'Customers', link: '/customers', type: 'list' },
        { text: 'Acme Corp', link: '/customers/42', type: 'edit' },
      ]}
      currPage={{ text: 'Job #J-00123', link: '/jobs/123', type: 'edit' }}
    />
  ),
};

export const InvoiceTrail: Story = {
  name: 'Invoice trail — Jobs → Invoice',
  render: () => (
    <BreadcrumbsWithTrail
      crumbs={[{ text: 'Jobs', link: '/jobs', type: 'list' }]}
      currPage={{ text: 'Invoice #INV-0054', link: '/invoices/54', type: 'edit' }}
    />
  ),
};

export const CustomColour: Story = {
  name: 'Custom colour (white — on dark header)',
  render: () => (
    <Box style={{ background: 'var(--mantine-color-scBlue-7)', padding: '12px 16px', borderRadius: 4 }}>
      <BreadcrumbsWithTrail
        crumbs={[{ text: 'Jobs', link: '/jobs', type: 'list' }]}
        currPage={{ text: 'Job #J-00123', link: '/jobs/123', type: 'edit' }}
        color="white"
      />
    </Box>
  ),
};

export const MobileView: Story = {
  name: 'Mobile — collapsed trail (≤400px)',
  render: () => (
    <Box style={{ maxWidth: 360 }}>
      <BreadcrumbsWithTrail
        crumbs={[
          { text: 'Customers', link: '/customers', type: 'list' },
          { text: 'Acme Corp', link: '/customers/42', type: 'edit' },
        ]}
        currPage={{ text: 'Job #J-00123', link: '/jobs/123', type: 'edit' }}
      />
    </Box>
  ),
};
