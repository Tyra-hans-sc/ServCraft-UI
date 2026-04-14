import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Anchor,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconFileDescription, IconSearch, IconArrowLeft } from '@tabler/icons-react';
import { useMantineTheme } from '@mantine/core';

/**
 * The LinkPickerModal (`PageComponents/Links/LinkPickerModal.tsx`) lets users
 * search and select a related document (Quote, Invoice, Purchase Order, Query,
 * or Project) to link to a job.
 *
 * The real component depends on react-query and live API services. These stories
 * are a **static visual replica** showing the layout and all states.
 *
 * **Structure:**
 * - 400 px wide Mantine Modal (scBlue blur overlay)
 * - Search input in the header
 * - Optional Back button (when accessed from an options step)
 * - Scrollable list of item rows — each row shows:
 *   - `IconFileDescription` (gray) on left
 *   - Document number (bold scBlue) + status badge
 *   - Customer / location name below
 *   - Amount (bold) + date (gray) on right
 * - Empty state: "No linkable [type]s found"
 *
 * Source: `PageComponents/Links/LinkPickerModal.tsx`
 */
const meta: Meta = {
  title: 'Layout/SCLinkPickerModal',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Colour constants
// ---------------------------------------------------------------------------

const SC_BLUE = 'var(--mantine-color-scBlue-7)';

// ---------------------------------------------------------------------------
// Static data sets
// ---------------------------------------------------------------------------

const QUOTES = [
  { doc: 'Q-00231', name: 'Acme Corp — Geyser install',        status: 'Draft',    statusColor: 'gray',  amount: 'R 4 850.00', date: '12 Mar 2025' },
  { doc: 'Q-00245', name: 'BuildRight Ltd — Plumbing repairs',  status: 'Accepted', statusColor: 'green', amount: 'R 12 300.00', date: '28 Mar 2025' },
  { doc: 'Q-00259', name: 'SunSet Homes — Roof inspection',     status: 'Declined', statusColor: 'red',   amount: 'R 2 100.00', date: '3 Apr 2025' },
  { doc: 'Q-00264', name: 'FastFix Plumbing — Pipe reline',     status: 'Expired',  statusColor: 'yellow', amount: 'R 7 400.00', date: '9 Apr 2025' },
];

const INVOICES = [
  { doc: 'INV-0098', name: 'Acme Corp',        status: 'Unpaid',   statusColor: 'blue',  amount: 'R 9 200.00', date: '5 Feb 2025' },
  { doc: 'INV-0112', name: 'BuildRight Ltd',   status: 'Paid',     statusColor: 'green', amount: 'R 15 750.00', date: '14 Mar 2025' },
  { doc: 'INV-0131', name: 'SunSet Homes',     status: 'Overdue',  statusColor: 'red',   amount: 'R 3 680.00', date: '1 Apr 2025' },
];

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function PickerRow({
  doc, name, status, statusColor, amount, date,
}: {
  doc: string; name: string; status: string; statusColor: string; amount?: string; date?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Flex
      align="center"
      justify="space-between"
      gap="md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: 4,
        padding: '10px 12px',
        cursor: 'pointer',
        background: hovered ? 'var(--mantine-color-gray-0)' : '#fff',
        transition: 'background 80ms',
      }}
    >
      <Flex align="center" gap={6} style={{ flex: 1, minWidth: 0 }}>
        <Box style={{ alignSelf: 'flex-start', paddingTop: 2 }}>
          <IconFileDescription size={19} color="var(--mantine-color-gray-6)" />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap="xs" wrap="nowrap">
            <Text fw={700} size="sm" c="scBlue" style={{ whiteSpace: 'nowrap' }}>{doc}</Text>
            <Badge color={statusColor} variant="light" radius="xl" fw="normal" size="xs">
              {status}
            </Badge>
          </Flex>
          <Text c="dark.6" size="sm" lineClamp={1} mt={4}>{name}</Text>
        </Box>
      </Flex>
      {(amount || date) && (
        <Box style={{ textAlign: 'right', flexShrink: 0 }}>
          {amount && <Text size="sm" fw={700}>{amount}</Text>}
          {date && <Text size="sm" c="dimmed">{date}</Text>}
        </Box>
      )}
    </Flex>
  );
}

// ---------------------------------------------------------------------------
// Picker shell
// ---------------------------------------------------------------------------

function PickerShell({
  title,
  rows,
  showBack = false,
  empty = false,
  emptyMessage = 'No linkable items found',
}: {
  title: string;
  rows: typeof QUOTES;
  showBack?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}) {
  const theme = useMantineTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = empty
    ? []
    : rows.filter(
        (r) =>
          r.doc.toLowerCase().includes(search.toLowerCase()) ||
          r.name.toLowerCase().includes(search.toLowerCase()),
      );

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open picker</Button>
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        withCloseButton={false}
        centered
        size={400}
        radius={6}
        padding={0}
        closeOnEscape
        closeOnClickOutside
        overlayProps={{
          color: theme.colors.scBlue[5],
          blur: 10,
          opacity: 0.55,
        }}
        transitionProps={{ transition: 'pop', duration: 100 }}
      >
        {/* Header */}
        <Box>
          <Flex
            align="center"
            justify="space-between"
            px="sm"
            pt="sm"
            pb={4}
          >
            <Text fw={700} size="sm">{title}</Text>
            {showBack && (
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconArrowLeft size={14} />}
                onClick={() => setOpen(false)}
              >
                Back
              </Button>
            )}
          </Flex>

          <Box px="sm" pb="sm">
            <TextInput
              placeholder={`Search ${title.toLowerCase()}…`}
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="sm"
              styles={{ input: { background: 'var(--mantine-color-gray-0)', border: '1px solid var(--mantine-color-gray-3)' } }}
            />
          </Box>

          <Divider />

          {/* Item list */}
          <ScrollArea.Autosize mah={340} type="auto">
            {filtered.length === 0 ? (
              <Flex align="center" justify="center" py="xl">
                <Text size="sm" c="dimmed">{emptyMessage}</Text>
              </Flex>
            ) : (
              <Stack gap={6} p="sm">
                {filtered.map((row) => (
                  <PickerRow key={row.doc} {...row} />
                ))}
              </Stack>
            )}
          </ScrollArea.Autosize>
        </Box>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const QuotesPicker: Story = {
  name: 'Quotes picker',
  render: () => (
    <PickerShell
      title="Quotes"
      rows={QUOTES}
      emptyMessage="No linkable quotes found"
    />
  ),
};

export const InvoicesPicker: Story = {
  name: 'Invoices picker',
  render: () => (
    <PickerShell
      title="Invoices"
      rows={INVOICES}
      emptyMessage="No linkable invoices found"
    />
  ),
};

export const WithBackButton: Story = {
  name: 'With back button',
  render: () => (
    <PickerShell
      title="Quotes"
      rows={QUOTES}
      showBack
      emptyMessage="No linkable quotes found"
    />
  ),
};

export const EmptyState: Story = {
  name: 'Empty state',
  render: () => (
    <PickerShell
      title="Purchase Orders"
      rows={[]}
      empty
      emptyMessage="No linkable purchase orders found"
    />
  ),
};
