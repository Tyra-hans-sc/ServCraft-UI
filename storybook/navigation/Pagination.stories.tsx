import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Pagination from '../../components/pagination';

/**
 * Pagination provides page navigation and page-size controls for tables and
 * list views throughout ServCraft.
 *
 * **Props:**
 * - `currentPage` — the current page number (1-based)
 * - `totalResults` — total number of items across all pages
 * - `pageSize` — number of items per page
 * - `setCurrentPage` — called with the new page number
 * - `setPageSize` — called with the new page size
 * - `invert` — inverts the colour scheme for dark backgrounds
 *
 * **Variants:** Default · Many pages · Few results · Inverted
 */
const meta: Meta<any> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    currentPage: { control: 'number', description: 'Current page (1-based)' },
    totalResults: { control: 'number', description: 'Total items across all pages' },
    pageSize: { control: 'select', options: [10, 25, 50, 100], description: 'Items per page' },
    invert: { control: 'boolean', description: 'Invert colour scheme (for dark backgrounds)' },
    setCurrentPage: { action: 'page-changed' },
    setPageSize: { action: 'page-size-changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Controlled = (args: any) => {
  const [page, setPage] = useState(args.currentPage ?? 1);
  const [size, setSize] = useState(args.pageSize ?? 25);
  return (
    <Pagination
      {...args}
      currentPage={page}
      pageSize={size}
      setCurrentPage={setPage}
      setPageSize={setSize}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} totalResults={247} currentPage={1} pageSize={25} />,
};

export const MiddlePage: Story = {
  name: 'Middle page',
  render: (args) => <Controlled {...args} totalResults={247} currentPage={5} pageSize={25} />,
};

export const LastPage: Story = {
  name: 'Last page',
  render: (args) => <Controlled {...args} totalResults={247} currentPage={10} pageSize={25} />,
};

export const SmallDataset: Story = {
  name: 'Small dataset (one page)',
  render: (args) => <Controlled {...args} totalResults={8} currentPage={1} pageSize={25} />,
};
