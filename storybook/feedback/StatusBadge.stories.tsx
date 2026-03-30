import type { Meta, StoryObj } from '@storybook/react';
import StatusBadge from '../../PageComponents/StatusBadge';

/**
 * StatusBadge renders a coloured Mantine Badge for a numeric status value.
 * Pass in the enum object and colour map for your domain entity.
 *
 * **Props:**
 * - `value` — the numeric status value to display
 * - `statusEnum` — `{ [label: string]: number }` — the status enumeration
 * - `statusColors` — `{ [value: number]: string }` — colour for each status value
 * - `minWidth` — minimum badge width
 * - All Mantine `BadgeProps` are forwarded
 *
 * **Variants:** All job statuses · All invoice statuses
 */
const meta: Meta<any> = {
  title: 'Feedback/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number', description: 'Numeric status value' },
    minWidth: { control: 'text', description: 'Minimum badge width' },
  },
};

export default meta;
type Story = StoryObj<any>;

const JOB_STATUS = {
  Pending: 0,
  'In Progress': 1,
  Complete: 2,
  'On Hold': 3,
  Cancelled: 4,
};

const JOB_COLORS: Record<number, string> = {
  0: 'yellow',
  1: 'blue',
  2: 'green',
  3: 'orange',
  4: 'red',
};

const INVOICE_STATUS = {
  Draft: 0,
  Sent: 1,
  Paid: 2,
  Overdue: 3,
  Void: 4,
};

const INVOICE_COLORS: Record<number, string> = {
  0: 'gray',
  1: 'blue',
  2: 'green',
  3: 'red',
  4: 'dark',
};

export const JobPending: Story = {
  name: 'Job — Pending',
  args: { value: 0, statusEnum: JOB_STATUS, statusColors: JOB_COLORS },
};

export const JobInProgress: Story = {
  name: 'Job — In Progress',
  args: { value: 1, statusEnum: JOB_STATUS, statusColors: JOB_COLORS },
};

export const JobComplete: Story = {
  name: 'Job — Complete',
  args: { value: 2, statusEnum: JOB_STATUS, statusColors: JOB_COLORS },
};

export const JobCancelled: Story = {
  name: 'Job — Cancelled',
  args: { value: 4, statusEnum: JOB_STATUS, statusColors: JOB_COLORS },
};

export const InvoicePaid: Story = {
  name: 'Invoice — Paid',
  args: { value: 2, statusEnum: INVOICE_STATUS, statusColors: INVOICE_COLORS },
};

export const InvoiceOverdue: Story = {
  name: 'Invoice — Overdue',
  args: { value: 3, statusEnum: INVOICE_STATUS, statusColors: INVOICE_COLORS },
};
