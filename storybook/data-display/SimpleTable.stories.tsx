import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SimpleTable from '../../PageComponents/SimpleTable/SimpleTable';

/**
 * SimpleTable is the standard data table used throughout ServCraft. It renders
 * rows from a `data` array using a `mapping` array that defines each column.
 *
 * **Key props:**
 * - `data` — array of row objects
 * - `mapping` — array of column definitions (`{ key, label, type?, valueFunction? }`)
 * - `controls` — row action buttons (edit, delete, etc.)
 * - `onAction` — called when a row action is triggered
 * - `showTotals` — renders a totals footer row
 * - `isLoading` — shows a loading state
 * - `onSort` — enables sortable columns
 * - `addButton` — shows an "Add" button below the table
 *
 * **Variants:** Default · With actions · Sortable · Loading · With totals · Empty
 */
const meta: Meta<any> = {
  title: 'Data Display/SimpleTable',
  component: SimpleTable,
  tags: ['autodocs'],
  argTypes: {
    isLoading: { control: 'boolean', description: 'Shows loading state' },
    showTotals: { control: 'boolean', description: 'Renders a totals footer row' },
    onAction: { action: 'action-triggered' },
    onSort: { action: 'sort-changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const JOBS = [
  { ID: 1, jobNumber: 'J-00123', customer: 'Acme Corp', status: 'In Progress', amount: 1250.0 },
  { ID: 2, jobNumber: 'J-00124', customer: 'Beta Ltd', status: 'Pending', amount: 875.5 },
  { ID: 3, jobNumber: 'J-00125', customer: 'Gamma Inc', status: 'Complete', amount: 3400.0 },
  { ID: 4, jobNumber: 'J-00126', customer: 'Delta Co', status: 'On Hold', amount: 620.0 },
];

const MAPPING = [
  { key: 'jobNumber', label: 'Job #' },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount', valueFunction: (item: any) => `$${item.amount.toFixed(2)}`, alignRight: true },
];

export const Default: Story = {
  args: {
    data: JOBS,
    mapping: MAPPING,
    uniqueIdKey: 'ID',
  },
};

export const WithActions: Story = {
  name: 'With row actions',
  args: {
    data: JOBS,
    mapping: MAPPING,
    uniqueIdKey: 'ID',
    canEdit: true,
    controls: [
      { name: 'edit', icon: 'edit', tooltip: 'Edit job' },
      { name: 'delete', icon: 'delete', tooltip: 'Delete job' },
    ],
  },
};

export const WithTotals: Story = {
  name: 'With totals row',
  args: {
    data: JOBS,
    mapping: MAPPING,
    uniqueIdKey: 'ID',
    showTotals: true,
    footerRow: ['', '', 'Total', `$${JOBS.reduce((s, j) => s + j.amount, 0).toFixed(2)}`],
  },
};

export const Loading: Story = {
  args: {
    data: [],
    mapping: MAPPING,
    uniqueIdKey: 'ID',
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    mapping: MAPPING,
    uniqueIdKey: 'ID',
  },
};

export const WithAddButton: Story = {
  name: 'With add button',
  args: {
    data: JOBS,
    mapping: MAPPING,
    uniqueIdKey: 'ID',
    addButton: { label: 'Add job' },
  },
};
