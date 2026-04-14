import type { Meta, StoryObj } from '@storybook/react';
import {
  InvoiceStatus,
  InvoiceStatusColor,
  QuoteStatus,
  QuoteStatusColor,
  PurchaseOrderStatus,
  PurchaseOrderStatusColor,
} from '../../utils/enums';
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
 * **Entities covered:** Invoice · Quote · Purchase Order
 *
 * > **Note:** Job statuses in ServCraft are tenant-configurable (custom names
 * > and colours set per account). They have no static enum and cannot be
 * > represented as fixed stories. Use `DisplayColor` from `utils/enums.js`
 * > when rendering job status badges at runtime.
 *
 * Source: `PageComponents/StatusBadge.tsx`
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

// Production colour maps are stored as { ColorName: statusValue }.
// StatusBadge expects { statusValue: colorName }. Invert here.
function invertColorMap(colorMap: Record<string, number>): Record<number, string> {
  return Object.fromEntries(
    Object.entries(colorMap).map(([color, value]) => [value, color.toLowerCase()])
  );
}

// Factory: creates a story for a single status value within an entity group.
function makeStory(
  name: string,
  value: number,
  statusEnum: Record<string, number>,
  statusColors: Record<number, string>
): Story {
  return { name, args: { value, statusEnum, statusColors } };
}

// ---------------------------------------------------------------------------
// Invoice — None · Draft · Unpaid · Overdue · Paid · Cancelled
// None (0) has no colour entry — falls back to 'gray' inside StatusBadge
// ---------------------------------------------------------------------------

const INVOICE_COLORS = invertColorMap(InvoiceStatusColor);

export const InvoiceNone     = makeStory('Invoice — None',      InvoiceStatus.None,      InvoiceStatus, INVOICE_COLORS);
export const InvoiceDraft    = makeStory('Invoice — Draft',     InvoiceStatus.Draft,     InvoiceStatus, INVOICE_COLORS);
export const InvoiceUnpaid   = makeStory('Invoice — Unpaid',    InvoiceStatus.Unpaid,    InvoiceStatus, INVOICE_COLORS);
export const InvoiceOverdue  = makeStory('Invoice — Overdue',   InvoiceStatus.Overdue,   InvoiceStatus, INVOICE_COLORS);
export const InvoicePaid     = makeStory('Invoice — Paid',      InvoiceStatus.Paid,      InvoiceStatus, INVOICE_COLORS);
export const InvoiceCancelled = makeStory('Invoice — Cancelled', InvoiceStatus.Cancelled, InvoiceStatus, INVOICE_COLORS);

// ---------------------------------------------------------------------------
// Quote — Draft · Accepted · Declined · Invoiced · Approved · Cancelled
// None (-1) omitted — not a displayable user-facing state
// ---------------------------------------------------------------------------

const QUOTE_COLORS = invertColorMap(QuoteStatusColor);

export const QuoteDraft     = makeStory('Quote — Draft',     QuoteStatus.Draft,     QuoteStatus, QUOTE_COLORS);
export const QuoteAccepted  = makeStory('Quote — Accepted',  QuoteStatus.Accepted,  QuoteStatus, QUOTE_COLORS);
export const QuoteDeclined  = makeStory('Quote — Declined',  QuoteStatus.Declined,  QuoteStatus, QUOTE_COLORS);
export const QuoteInvoiced  = makeStory('Quote — Invoiced',  QuoteStatus.Invoiced,  QuoteStatus, QUOTE_COLORS);
export const QuoteApproved  = makeStory('Quote — Approved',  QuoteStatus.Approved,  QuoteStatus, QUOTE_COLORS);
export const QuoteCancelled = makeStory('Quote — Cancelled', QuoteStatus.Cancelled, QuoteStatus, QUOTE_COLORS);

// ---------------------------------------------------------------------------
// Purchase Order — Draft · Approved · Billed · Cancelled
// None (0) omitted — not a displayable user-facing state
// ---------------------------------------------------------------------------

const PO_COLORS = invertColorMap(PurchaseOrderStatusColor);

export const PODraft     = makeStory('Purchase Order — Draft',     PurchaseOrderStatus.Draft,      PurchaseOrderStatus, PO_COLORS);
export const POApproved  = makeStory('Purchase Order — Approved',  PurchaseOrderStatus.Approved,   PurchaseOrderStatus, PO_COLORS);
export const POBilled    = makeStory('Purchase Order — Billed',    PurchaseOrderStatus.Billed,     PurchaseOrderStatus, PO_COLORS);
export const POCancelled = makeStory('Purchase Order — Cancelled', PurchaseOrderStatus.Cancelled,  PurchaseOrderStatus, PO_COLORS);
