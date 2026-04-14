import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex, Text, Tooltip, Stack } from '@mantine/core';
import { IconMessage2 } from '@tabler/icons-react';

/**
 * The ServCraft side navigation (`components/sc-controls/layout/SidebarItems.tsx`).
 *
 * The real sidebar depends on the Next.js router, permissions service, subscription
 * context, and feature flags — it cannot be rendered in isolation.
 *
 * These stories faithfully represent the visual structure with static props.
 *
 * **Colours:**
 * - Background: `#003ED0` (bluePrimary)
 * - Inactive text/icon: `#99b2ec` (sidebarColor)
 * - Active / hover bg: `#1951d5` (sidebarHoverBackground)
 * - Active text: `#ffffff`
 *
 * **Widths:** 180 px expanded · 60 px collapsed
 *
 * **Logo:** `/logo-type-white.svg` (expanded) · `/logo-white.svg` (collapsed)
 *
 * **Icons:** Custom SC SVG icons from `/sc-icons/` (served via Storybook's
 * `staticDirs: ['../public']`). Messages uses Tabler's `IconMessage2` — there
 * is no corresponding SC icon for that item.
 *
 * Source: `components/sc-controls/layout/SidebarItems.tsx`
 */
const meta: Meta = {
  title: 'Navigation/SideNavigation',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Sidebar colours
// ---------------------------------------------------------------------------

const BG        = '#003ED0'; // bluePrimary
const ITEM_TEXT = '#99b2ec'; // sidebarColor — inactive
const ACTIVE_BG = '#1951d5'; // sidebarHoverBackground
const ACTIVE_FG = '#ffffff';

// ---------------------------------------------------------------------------
// Nav items — matches SidebarItems.tsx
// All items are shown here as they appear for a full-permission user.
// icon: null = no SC custom icon; falls back to Tabler's IconMessage2.
// ---------------------------------------------------------------------------

const navItems: { label: string; icon: string | null }[] = [
  { label: 'Dashboard',    icon: '/sc-icons/dashboard-light.svg' },
  { label: 'Jobs',          icon: '/sc-icons/jobs-light.svg' },
  { label: 'Appointments',  icon: '/sc-icons/appointments-light.svg' },
  { label: 'Queries',       icon: '/sc-icons/queries-light.svg' },
  { label: 'Quotes',        icon: '/sc-icons/quotes-light.svg' },
  { label: 'Invoices',      icon: '/sc-icons/invoices-light.svg' },
  { label: 'Purchases',     icon: '/sc-icons/purchases-light.svg' },
  { label: 'Customers',     icon: '/sc-icons/customers-light.svg' },
  { label: 'Inventory',     icon: '/sc-icons/inventory-light.svg' },
  { label: 'Reports',       icon: '/sc-icons/reports-light.svg' },
  { label: 'Messages',      icon: null },
];

// ---------------------------------------------------------------------------
// NavIcon helper
// ---------------------------------------------------------------------------

function NavIcon({ icon, label, active }: { icon: string | null; label: string; active: boolean }) {
  if (icon === null) {
    return <IconMessage2 size={20} color={active ? ACTIVE_FG : ITEM_TEXT} stroke={1.8} />;
  }
  return (
    <img
      src={icon}
      alt={label}
      style={{ width: 20, height: 20, flexShrink: 0, display: 'block' }}
    />
  );
}

// ---------------------------------------------------------------------------
// Sidebar shell
// ---------------------------------------------------------------------------

interface SidebarProps {
  collapsed?: boolean;
  activeLabel?: string;
}

function SidebarShell({ collapsed = false, activeLabel = 'Dashboard' }: SidebarProps) {
  const width = collapsed ? 60 : 180;

  return (
    <Flex style={{ height: '100vh', overflow: 'hidden', background: '#F4F5F7' }}>
      {/* Sidebar */}
      <Box
        style={{
          width,
          minWidth: width,
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Logo */}
        <Box
          style={{
            padding: collapsed ? '20px 0' : '20px 16px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            flexShrink: 0,
          }}
        >
          {collapsed ? (
            <img src="/logo-white.svg" alt="ServCraft" style={{ width: 19 }} />
          ) : (
            <img src="/logo-type-white.svg" alt="ServCraft" style={{ width: 107 }} />
          )}
        </Box>

        {/* Nav items */}
        <Stack
          gap={0}
          style={{
            flex: 1,
            padding: collapsed ? '4px' : '0 8px',
            overflowY: 'auto',
          }}
        >
          {navItems.map(({ label, icon }) => {
            const isActive = activeLabel === label;

            const item = (
              <Flex
                align="center"
                justify={collapsed ? 'center' : 'flex-start'}
                style={{
                  padding: collapsed ? '0' : '0 8px',
                  height: 48,
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: isActive ? ACTIVE_BG : 'transparent',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.background = ACTIVE_BG;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <NavIcon icon={icon} label={label} active={isActive} />
                {!collapsed && (
                  <Text
                    fw={700}
                    ml={16}
                    style={{
                      color: isActive ? ACTIVE_FG : ITEM_TEXT,
                      whiteSpace: 'nowrap',
                      fontSize: 14,
                    }}
                  >
                    {label}
                  </Text>
                )}
              </Flex>
            );

            return collapsed ? (
              <Tooltip key={label} label={label} position="right" color="dark" withArrow>
                {item}
              </Tooltip>
            ) : (
              <Box key={label}>{item}</Box>
            );
          })}
        </Stack>

        {/* Footer */}
        <Box
          style={{
            height: 62,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <Text style={{ color: ITEM_TEXT, fontSize: 11 }}>
            © {new Date().getFullYear()}
          </Text>
        </Box>
      </Box>

      {/* Page content placeholder */}
      <Box style={{ flex: 1, padding: 24, background: '#F4F5F7' }}>
        <Text size="sm" c="dimmed">Page content area</Text>
      </Box>
    </Flex>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Expanded: Story = {
  name: 'Expanded — Jobs active',
  render: () => <SidebarShell collapsed={false} activeLabel="Jobs" />,
};

export const ExpandedDashboard: Story = {
  name: 'Expanded — Dashboard active',
  render: () => <SidebarShell collapsed={false} activeLabel="Dashboard" />,
};

export const ExpandedMessages: Story = {
  name: 'Expanded — Messages active',
  render: () => <SidebarShell collapsed={false} activeLabel="Messages" />,
};

export const Collapsed: Story = {
  name: 'Collapsed (icon-only)',
  render: () => <SidebarShell collapsed={true} activeLabel="Jobs" />,
};
