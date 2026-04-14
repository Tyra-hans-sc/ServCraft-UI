import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Group, Text, TextInput, Badge, Code, Divider } from '@mantine/core';
import {
  IconHome,
  IconBriefcase,
  IconCalendar,
  IconFileInvoice,
  IconReceipt,
  IconUsers,
  IconPackage,
  IconChartBar,
  IconMessage,
  IconSettings,
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDownload,
  IconUpload,
  IconEye,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconInfoCircle,
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconFilter,
  IconRefresh,
  IconUser,
  IconUserOff,
  IconLogout,
  IconLock,
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconCalendarEvent,
  IconPrinter,
  IconSend,
  IconArrowLeft,
  IconArrowRight,
  IconExternalLink,
  IconCopy,
  IconStar,
  IconBell,
  IconHelpCircle,
  IconMenu2,
} from '@tabler/icons-react';

/**
 * ServCraft uses **@tabler/icons-react** v2 for all UI icons.
 *
 * ## Import
 * ```tsx
 * import { IconHome, IconBriefcase } from '@tabler/icons-react';
 * ```
 *
 * ## Key props
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `size` | `number \| string` | `24` | Width and height in px |
 * | `stroke` | `number` | `2` | Stroke width — use `1.5` for lighter look |
 * | `color` | `string` | `currentColor` | CSS colour value |
 *
 * ## Browse the full library
 * → [tabler.io/icons](https://tabler.io/icons)
 */
const meta: Meta = {
  title: 'Icons/Tabler Icons',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Icon catalogue data
// ---------------------------------------------------------------------------

const catalogue: { name: string; Icon: React.FC<any>; label: string }[] = [
  { name: 'IconHome', Icon: IconHome, label: 'Dashboard' },
  { name: 'IconBriefcase', Icon: IconBriefcase, label: 'Jobs' },
  { name: 'IconCalendar', Icon: IconCalendar, label: 'Calendar' },
  { name: 'IconCalendarEvent', Icon: IconCalendarEvent, label: 'Appointments' },
  { name: 'IconFileInvoice', Icon: IconFileInvoice, label: 'Invoices' },
  { name: 'IconReceipt', Icon: IconReceipt, label: 'Quotes' },
  { name: 'IconUsers', Icon: IconUsers, label: 'Customers' },
  { name: 'IconPackage', Icon: IconPackage, label: 'Inventory' },
  { name: 'IconChartBar', Icon: IconChartBar, label: 'Reports' },
  { name: 'IconMessage', Icon: IconMessage, label: 'Messages' },
  { name: 'IconSettings', Icon: IconSettings, label: 'Settings' },
  { name: 'IconSearch', Icon: IconSearch, label: 'Search' },
  { name: 'IconPlus', Icon: IconPlus, label: 'Add' },
  { name: 'IconEdit', Icon: IconEdit, label: 'Edit' },
  { name: 'IconTrash', Icon: IconTrash, label: 'Delete' },
  { name: 'IconDownload', Icon: IconDownload, label: 'Download' },
  { name: 'IconUpload', Icon: IconUpload, label: 'Upload' },
  { name: 'IconEye', Icon: IconEye, label: 'View' },
  { name: 'IconCheck', Icon: IconCheck, label: 'Success' },
  { name: 'IconX', Icon: IconX, label: 'Close' },
  { name: 'IconAlertCircle', Icon: IconAlertCircle, label: 'Alert' },
  { name: 'IconInfoCircle', Icon: IconInfoCircle, label: 'Info' },
  { name: 'IconChevronDown', Icon: IconChevronDown, label: 'Expand' },
  { name: 'IconChevronRight', Icon: IconChevronRight, label: 'Navigate' },
  { name: 'IconDotsVertical', Icon: IconDotsVertical, label: 'More' },
  { name: 'IconFilter', Icon: IconFilter, label: 'Filter' },
  { name: 'IconRefresh', Icon: IconRefresh, label: 'Refresh' },
  { name: 'IconUser', Icon: IconUser, label: 'User' },
  { name: 'IconUserOff', Icon: IconUserOff, label: 'Unassigned' },
  { name: 'IconLogout', Icon: IconLogout, label: 'Logout' },
  { name: 'IconLock', Icon: IconLock, label: 'Lock' },
  { name: 'IconPhone', Icon: IconPhone, label: 'Phone' },
  { name: 'IconMail', Icon: IconMail, label: 'Email' },
  { name: 'IconMapPin', Icon: IconMapPin, label: 'Location' },
  { name: 'IconClock', Icon: IconClock, label: 'Time' },
  { name: 'IconPrinter', Icon: IconPrinter, label: 'Print' },
  { name: 'IconSend', Icon: IconSend, label: 'Send' },
  { name: 'IconArrowLeft', Icon: IconArrowLeft, label: 'Back' },
  { name: 'IconArrowRight', Icon: IconArrowRight, label: 'Forward' },
  { name: 'IconExternalLink', Icon: IconExternalLink, label: 'External' },
  { name: 'IconCopy', Icon: IconCopy, label: 'Copy' },
  { name: 'IconStar', Icon: IconStar, label: 'Favourite' },
  { name: 'IconBell', Icon: IconBell, label: 'Notifications' },
  { name: 'IconHelpCircle', Icon: IconHelpCircle, label: 'Help' },
  { name: 'IconMenu2', Icon: IconMenu2, label: 'Menu' },
];

// ---------------------------------------------------------------------------
// Gallery with search
// ---------------------------------------------------------------------------

function IconGallery() {
  const [query, setQuery] = useState('');
  const filtered = catalogue.filter(
    ({ name, label }) =>
      name.toLowerCase().includes(query.toLowerCase()) ||
      label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Search icons…"
        leftSection={<IconSearch size={16} />}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        style={{ maxWidth: 320 }}
      />
      <Text size="xs" c="dimmed">
        Showing {filtered.length} of {catalogue.length} commonly used icons.{' '}
        <a href="https://tabler.io/icons" target="_blank" rel="noreferrer" style={{ color: '#003ED0' }}>
          Browse all 5 000+ icons →
        </a>
      </Text>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map(({ name, Icon, label }) => (
          <div
            key={name}
            title={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '12px 8px',
              border: '1px solid #E9EDF4',
              borderRadius: 8,
              background: '#fff',
              cursor: 'default',
            }}
          >
            <Icon size={24} color="#003ED0" />
            <Text size="xs" c="dimmed" style={{ textAlign: 'center', lineHeight: 1.3 }}>
              {label}
            </Text>
            <Text
              size="xs"
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                color: '#9CA3AF',
                textAlign: 'center',
                wordBreak: 'break-all',
              }}
            >
              {name}
            </Text>
          </div>
        ))}
      </div>
    </Stack>
  );
}

export const Gallery: Story = {
  name: 'Icon gallery',
  render: () => <IconGallery />,
};

// ---------------------------------------------------------------------------
// Usage examples — size, stroke, color
// ---------------------------------------------------------------------------

export const SizeVariants: Story = {
  name: 'Size variants',
  render: () => (
    <Stack gap="lg">
      <Text size="sm" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        size prop
      </Text>
      <Group gap="xl" align="center">
        {[14, 18, 24, 32, 40].map((size) => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <IconBriefcase size={size} color="#003ED0" />
            <Code style={{ fontSize: 11 }}>size={size}</Code>
          </div>
        ))}
      </Group>
    </Stack>
  ),
};

export const StrokeVariants: Story = {
  name: 'Stroke variants',
  render: () => (
    <Stack gap="lg">
      <Text size="sm" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        stroke prop
      </Text>
      <Group gap="xl" align="center">
        {[1, 1.5, 2, 2.5, 3].map((stroke) => (
          <div key={stroke} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <IconSettings size={28} stroke={stroke} color="#003ED0" />
            <Code style={{ fontSize: 11 }}>stroke={stroke}</Code>
          </div>
        ))}
      </Group>
      <Text size="xs" c="dimmed">
        ServCraft components typically use the default stroke of <strong>2</strong>. Use <strong>1.5</strong> for a lighter feel in dense UI.
      </Text>
    </Stack>
  ),
};

export const ColourVariants: Story = {
  name: 'Colour with Mantine theme',
  render: () => (
    <Stack gap="lg">
      <Text size="sm" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        colour prop — using scBlue scale + semantic colours
      </Text>
      <Group gap="xl" align="center">
        {[
          { color: '#003ED0', label: 'scBlue[6]' },
          { color: '#265dfa', label: 'scBlue[5]' },
          { color: '#37B24D', label: 'green (success)' },
          { color: '#E67700', label: 'orange (warning)' },
          { color: '#C92A2A', label: 'red (error)' },
          { color: '#868E96', label: 'gray (muted)' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <IconCheck size={28} color={color} />
            <Text size="xs" c="dimmed" style={{ textAlign: 'center', fontSize: 11 }}>
              {label}
            </Text>
          </div>
        ))}
      </Group>
    </Stack>
  ),
};

export const ImportExample: Story = {
  name: 'Import pattern',
  render: () => (
    <Stack gap="md" style={{ maxWidth: 560 }}>
      <Text size="sm" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        How to import
      </Text>
      <div
        style={{
          background: '#1e1e2e',
          color: '#cdd6f4',
          borderRadius: 8,
          padding: '16px 20px',
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        <span style={{ color: '#89b4fa' }}>import</span>{' '}
        {'{'}{' '}
        <span style={{ color: '#a6e3a1' }}>IconHome, IconBriefcase, IconSettings</span>{' '}
        {'}'}{' '}
        <span style={{ color: '#89b4fa' }}>from</span>{' '}
        <span style={{ color: '#f38ba8' }}>'@tabler/icons-react'</span>;
        <br />
        <br />
        <span style={{ color: '#6c7086' }}>{'// In JSX:'}</span>
        <br />
        {'<'}<span style={{ color: '#89dceb' }}>IconHome</span>
        {' '}
        <span style={{ color: '#fab387' }}>size</span>=<span style={{ color: '#a6e3a1' }}>{'{24}'}</span>
        {' '}
        <span style={{ color: '#fab387' }}>stroke</span>=<span style={{ color: '#a6e3a1' }}>{'{1.5}'}</span>
        {' '}
        <span style={{ color: '#fab387' }}>color</span>=<span style={{ color: '#a6e3a1' }}>"#003ED0"</span>
        {' />'};
      </div>
      <Badge
        component="a"
        href="https://tabler.io/icons"
        target="_blank"
        rel="noreferrer"
        variant="light"
        color="blue"
        style={{ cursor: 'pointer', alignSelf: 'flex-start' }}
        rightSection={<IconExternalLink size={12} />}
      >
        Browse all icons at tabler.io/icons
      </Badge>
    </Stack>
  ),
};
