import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ActionIcon,
  Box,
  Burger,
  Divider,
  Flex,
  Menu,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconSearch,
  IconSettings,
  IconLogout,
  IconMessageOff,
  IconMessage,
  IconChevronDown,
  IconQuestionMark,
  IconClock,
} from '@tabler/icons-react';

/**
 * The ServCraft application header (`PageComponents/Layout/Navbar/ScNavbar.tsx`).
 *
 * The real navbar has ~15 context dependencies (router, subscription, timer, etc.)
 * and cannot be rendered in isolation. These stories show the **visual structure**
 * with static props.
 *
 * **Anatomy (left → right):**
 * - Burger (mobile only)
 * - Page title — `Text size="xxl" fw={600}` · `mr="auto"`
 * - Global search input
 * - Running-timer chip (coral background + border, when active)
 * - Help icon (`IconQuestionMark`) → Help Centre menu
 * - Settings icon (`IconSettings`)
 * - Vertical pipe divider
 * - Profile chip: initials circle (scBlue-7) + company name + chevron
 *
 * **Timer states:**
 * - **No timer** — chip is hidden entirely
 * - **Running (desktop)** — semi-transparent coral chip:
 *   `background: #f080805e · border: 2px solid lightcoral · color: white`
 * - **Running (mobile)** — animated conic-gradient progress ring with
 *   current hour count in the centre; only visible below 588 px viewport width
 *
 * **Profile dropdown:**
 * - Full name + email header
 * - Show / Hide Help Chat
 * - Logout
 * - Terms · Privacy · version footer
 *
 * Source: `PageComponents/Layout/Navbar/ScNavbar.tsx` +
 *         `PageComponents/Layout/Navbar/ProfileMenu.tsx` +
 *         `PageComponents/Layout/Navbar/AnimatedTimerButtonMobile.tsx`
 */
const meta: Meta = {
  title: 'Layout/AppHeader',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      options: {
        rules: {
          // Mantine v7 Menu.Target applies aria-expanded to its wrapper <div>
          // element — invalid on a non-interactive role. Library bug.
          'aria-allowed-attr': { enabled: false },
          // Mantine v7 Menu.Dropdown renders Box/Divider separators as direct
          // children of role="menu" — not valid menuitem children. Library bug.
          'aria-required-children': { enabled: false },
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Timer chip — desktop
// Matches ScNavbar.module.css: semi-transparent coral bg, lightcoral border,
// white text, 12px padding, 3px radius. Clickable → navigates to job timers.
// ---------------------------------------------------------------------------

function TimerChip({ label }: { label: string }) {
  return (
    <Tooltip label="J-00123 · click to open job timers" color="scBlue.7">
      <span
        style={{
          background: '#f080805e',
          border: '2px solid lightcoral',
          color: 'white',
          padding: '6px 12px',
          borderRadius: 3,
          marginRight: 8,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        {label}
      </span>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Mobile timer ring
// Matches AnimatedTimerButtonMobile.tsx: conic-gradient ring, white centre
// circle, hour count + IconClock inside. Shown below 588 px viewport width.
// Static representation — progress frozen at 60 %.
// ---------------------------------------------------------------------------

function MobileTimerRing({ hours = 2, progressPct = 60 }: { hours?: number; progressPct?: number }) {
  const SIZE = 36;
  const INNER = 16;
  return (
    <Tooltip label={`J-00123 · ${String(hours).padStart(2, '0')}:14:32`} color="scBlue.7">
      <div
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: '50%',
          background: `conic-gradient(var(--mantine-color-yellow-7) ${progressPct}%, var(--mantine-color-scBlue-7) 0%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {/* White inner circle */}
        <div
          style={{
            width: INNER,
            height: INNER,
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          <IconClock size={7} stroke={3.2} color="var(--mantine-color-scBlue-7)" />
          <Text style={{ fontSize: 7, fontWeight: 700, color: 'var(--mantine-color-scBlue-7)', lineHeight: 1 }}>
            {hours}
          </Text>
        </div>
      </div>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Shared header shell — mirrors ScNavbar.tsx JSX structure
// ---------------------------------------------------------------------------

interface HeaderProps {
  title?: string;
  showBurger?: boolean;
  showSearch?: boolean;
  timerState?: 'none' | 'running' | 'mobile';
  timerLabel?: string;
  showSettings?: boolean;
  userName?: string;
  companyName?: string;
  hasBorder?: boolean;
}

function AppHeaderShell({
  title = 'Dashboard',
  showBurger = false,
  showSearch = true,
  timerState = 'none',
  timerLabel = 'Running timer  00:14:32',
  showSettings = true,
  userName = 'Tyra Hans',
  companyName = 'ServCraft Demo',
  hasBorder = true,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hsShown, setHsShown] = useState(true);
  const initials = getInitials(userName);

  return (
    <nav
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid ' + (hasBorder ? 'lightgrey' : 'transparent'),
        ...(hasBorder ? { boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' } : {}),
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Burger (mobile) */}
      {showBurger && (
        <Burger
          size="sm"
          color="scBlue"
          opened={false}
          onClick={() => {}}
          aria-label="Toggle navigation"
        />
      )}

      {/* Page title — mr="auto" pushes everything else right */}
      <Box mr="auto">
        <Text size="xxl" fw={600} style={{ whiteSpace: 'nowrap' }}>
          {title}
        </Text>
      </Box>

      {/* Global search */}
      {showSearch && (
        <TextInput
          placeholder="Search…"
          leftSection={<IconSearch size={15} />}
          size="sm"
          radius="md"
          style={{ width: 220 }}
          styles={{
            input: {
              background: '#F4F5F7',
              border: '1px solid transparent',
            },
          }}
        />
      )}

      {/* Running timer — desktop chip (coral bg + border + white text) */}
      {timerState === 'running' && <TimerChip label={timerLabel} />}

      {/* Running timer — mobile ring (conic gradient, shown below 588 px) */}
      {timerState === 'mobile' && <MobileTimerRing hours={2} progressPct={60} />}

      {/* Help */}
      <Tooltip label="Help Centre" color="scBlue.7" events={{ hover: true, focus: true, touch: true }}>
        <ActionIcon variant="transparent" color="gray.7" mt={2} aria-label="Help Centre">
          <IconQuestionMark size={20} />
        </ActionIcon>
      </Tooltip>

      {/* Settings */}
      {showSettings && (
        <Tooltip label="Settings" color="scBlue.7" events={{ hover: true, focus: true, touch: true }}>
          <ActionIcon variant="transparent" color="gray.9" mt={2} aria-label="Settings">
            <IconSettings size={20} />
          </ActionIcon>
        </Tooltip>
      )}

      {/* Vertical pipe divider */}
      <Box style={{ height: 28, borderLeft: '1px solid var(--mantine-color-gray-2)' }} />

      {/* Profile menu */}
      <Box pr="md">
        <Menu
          opened={menuOpen}
          onChange={setMenuOpen}
          withArrow
          withinPortal
          position="bottom-end"
          arrowPosition="side"
          shadow="sm"
          transitionProps={{ transition: 'pop-top-right', duration: 100 }}
        >
          <Menu.Target>
            <Flex align="center" gap={5} style={{ cursor: 'pointer' }}>
              <Box
                p={5}
                style={{
                  backgroundColor: 'var(--mantine-color-scBlue-7)',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '.8rem',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  minWidth: 30,
                  textAlign: 'center',
                }}
              >
                {initials}
              </Box>
              <Text size="sm" lineClamp={1} style={{ maxWidth: 120 }}>
                {companyName}
              </Text>
              <IconChevronDown
                size={16}
                style={{
                  transform: menuOpen ? 'rotate(-90deg)' : 'rotate(0)',
                  transition: 'transform ease-out 100ms',
                  color: '#868E96',
                }}
              />
            </Flex>
          </Menu.Target>

          <Menu.Dropdown>
            <Box px={12} py={10}>
              <Text size="sm" fw={700}>{userName}</Text>
              <Text size="xs" c="dimmed">demo@servcraft.co.za</Text>
            </Box>
            <Divider />
            <Menu.Item
              leftSection={hsShown ? <IconMessageOff size={21} stroke={1.2} /> : <IconMessage size={21} stroke={1.2} />}
              onClick={() => setHsShown((s) => !s)}
            >
              {hsShown ? 'Hide' : 'Show'} Help Chat
            </Menu.Item>
            <Menu.Item leftSection={<IconLogout size={21} stroke={1.2} />} color="red">
              Logout
            </Menu.Item>
            <Divider />
            <Box px={12} py={8}>
              <Flex gap={8} align="center">
                <Text size="xs" c="dimmed" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Terms</Text>
                <Text size="xs" c="dimmed">·</Text>
                <Text size="xs" c="dimmed" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy</Text>
                <Text size="xs" c="dimmed">·</Text>
                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>v 2.32.11</Text>
              </Flex>
            </Box>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Default (no timer)',
  render: () => (
    <AppHeaderShell title="Dashboard" showSearch timerState="none" showSettings />
  ),
};

export const JobsPage: Story = {
  name: 'Jobs page (no border)',
  render: () => (
    <AppHeaderShell title="Jobs" showSearch timerState="none" showSettings hasBorder={false} />
  ),
};

export const WithRunningTimer: Story = {
  name: 'Timer — running (desktop)',
  render: () => (
    <AppHeaderShell
      title="Jobs"
      showSearch
      timerState="running"
      timerLabel="Running timer  00:14:32"
      showSettings
    />
  ),
};

export const WithLongTimer: Story = {
  name: 'Timer — long session (desktop)',
  render: () => (
    <AppHeaderShell
      title="Jobs"
      showSearch
      timerState="running"
      timerLabel="Running timer  02:45:09"
      showSettings
    />
  ),
};

export const MobileView: Story = {
  name: 'Mobile — no timer',
  render: () => (
    <div style={{ maxWidth: 375 }}>
      <AppHeaderShell
        title="Jobs"
        showBurger
        showSearch={false}
        showSettings={false}
        timerState="none"
      />
    </div>
  ),
};

export const MobileWithTimer: Story = {
  name: 'Mobile — timer running (ring)',
  render: () => (
    <div style={{ maxWidth: 375 }}>
      <AppHeaderShell
        title="Jobs"
        showBurger
        showSearch={false}
        showSettings={false}
        timerState="mobile"
      />
    </div>
  ),
};

export const ProfileMenuOpen: Story = {
  name: 'Profile — expanded',
  render: () => {
    function OpenMenu() {
      const [open, setOpen] = useState(true);
      const [hsShown, setHsShown] = useState(true);
      return (
        <div style={{ paddingBottom: 200 }}>
          <nav
            style={{
              backgroundColor: '#fff',
              borderBottom: '1px solid lightgrey',
              boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
              padding: '0 16px',
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Box style={{ height: 28, borderLeft: '1px solid var(--mantine-color-gray-2)' }} />
            <Box pr="md">
              <Menu opened={open} onChange={setOpen} withArrow withinPortal position="bottom-end" arrowPosition="side" shadow="sm">
                <Menu.Target>
                  <Flex align="center" gap={5} style={{ cursor: 'pointer' }}>
                    <Box
                      p={5}
                      style={{
                        backgroundColor: 'var(--mantine-color-scBlue-7)',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: '.8rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        minWidth: 30,
                        textAlign: 'center',
                      }}
                    >
                      TH
                    </Box>
                    <Text size="sm">ServCraft Demo</Text>
                    <IconChevronDown size={16} style={{ transform: 'rotate(-90deg)', color: '#868E96' }} />
                  </Flex>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box px={12} py={10}>
                    <Text size="sm" fw={700}>Tyra Hans</Text>
                    <Text size="xs" c="dimmed">demo@servcraft.co.za</Text>
                  </Box>
                  <Divider />
                  <Menu.Item
                    leftSection={hsShown ? <IconMessageOff size={21} stroke={1.2} /> : <IconMessage size={21} stroke={1.2} />}
                    onClick={() => setHsShown((s) => !s)}
                  >
                    {hsShown ? 'Hide' : 'Show'} Help Chat
                  </Menu.Item>
                  <Menu.Item leftSection={<IconLogout size={21} stroke={1.2} />} color="red">
                    Logout
                  </Menu.Item>
                  <Divider />
                  <Box px={12} py={8}>
                    <Flex gap={8} align="center">
                      <Text size="xs" c="dimmed" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Terms</Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Text size="xs" c="dimmed" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy</Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>v 2.32.11</Text>
                    </Flex>
                  </Box>
                </Menu.Dropdown>
              </Menu>
            </Box>
          </nav>
        </div>
      );
    }
    return <OpenMenu />;
  },
};
