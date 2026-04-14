import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, Box, Flex, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconUserOff } from '@tabler/icons-react';

/**
 * ServCraft has two avatar implementations used across the app:
 *
 * ---
 *
 * **EmployeeAvatar** (`PageComponents/Table/EmployeeAvatar.tsx`)
 * The primary avatar for jobs, appointments, and table rows.
 * - Size: `1.4rem × 1.4rem` (22.4 px)
 * - Background: colour-coded per employee (default `scBlue-7 #003ED0`)
 * - Text: white initials (first + last name)
 * - Has a tooltip with the employee's full name
 * - `useUnassignedMode`: renders a grey avatar with `IconUserOff` when no employee is assigned
 * - Colours come from `scColourMapping` in `table-helper.ts`
 *
 * **DataAvatar** (`PageComponents/Table/DataAvatar.tsx`)
 * Mantine Avatar wrapper used in table cell rendering.
 * - Size: `24 px`
 * - Background: `scBlue[5]` (`#5A7FDB`)
 * - Text: white, `fw={500}`
 *
 * ---
 *
 * **Stacking / overflow:** Multiple employees on a job/appointment are rendered
 * with `Avatar.Group`. Overflow uses a white badge with scBlue text to match
 * the rest of the UI.
 */
const meta: Meta<any> = {
  title: 'Layout/SCAvatar',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

// ---------------------------------------------------------------------------
// Colour palette — matches scColourMapping in table-helper.ts
// ---------------------------------------------------------------------------

const scColourMapping: Record<string, string> = {
  Red:       '#fa2e50',
  Orange:    '#f06101',
  Yellow:    '#fdc840',
  Green:     '#51ca68',
  Cyan:      '#00d1ea',
  Blue:      '#5a84e0',
  Purple:    '#725ae0',
  Black:     '#4f4f4f',
  Grey:      '#818181',
  LightGrey: '#bcbcbc',
};

const SC_BLUE_7 = '#003ED0'; // scBlue-7 — EmployeeAvatar default
const SC_BLUE_5 = '#5A7FDB'; // scBlue-5 — DataAvatar default

// ---------------------------------------------------------------------------
// EmployeeAvatar — visual replica
// Matches EmployeeAvatar.tsx exactly: 1.4rem circle, white text, tooltip.
// ---------------------------------------------------------------------------

function EmployeeAvatar({
  name,
  color,
  size = 1,
}: {
  name?: string;
  color?: string;
  size?: number;
}) {
  const parsedColor = !color
    ? SC_BLUE_7
    : color.startsWith('#')
    ? color
    : scColourMapping[color] ?? SC_BLUE_7;

  const nameSplit = name
    ? name.trim().split(' ').filter((w) => !w.match(/[!@#$%^&*(),.?":{}|<>]/))
    : [];

  const initials =
    nameSplit.length > 1
      ? `${nameSplit[0][0]?.toUpperCase()}${nameSplit[nameSplit.length - 1][0]?.toUpperCase()}`
      : null;

  const avatarStyle: React.CSSProperties = {
    color: '#fff',
    backgroundColor: name ? parsedColor : 'var(--mantine-color-gray-4)',
    minWidth: '1.4rem',
    height: '1.4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'default',
    transform: `scale(${size})`,
    fontSize: 10,
    fontWeight: 600,
  };

  return (
    <Tooltip
      label={name || 'Not Assigned'}
      color={name ? parsedColor : 'gray.4'}
      events={{ hover: true, focus: true, touch: true }}
    >
      <div style={avatarStyle}>
        {name && initials ? (
          <span>{initials}</span>
        ) : (
          <IconUserOff size={14} />
        )}
      </div>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Stories — EmployeeAvatar
// ---------------------------------------------------------------------------

export const EmployeeAvatarSingle: Story = {
  name: 'EmployeeAvatar — single (default)',
  render: () => (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Default scBlue-7 background · white initials · tooltip on hover
      </Text>
      <Group gap="sm">
        <EmployeeAvatar name="Alice Johnson" />
        <EmployeeAvatar name="Tom Smith" />
        <EmployeeAvatar name="Mary-Kate Olsen" />
      </Group>
    </Stack>
  ),
};

export const EmployeeAvatarColors: Story = {
  name: 'EmployeeAvatar — colour variants',
  render: () => (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        All colours from <code>scColourMapping</code> in <code>table-helper.ts</code>.
        Assigned via <code>displayColorKeyName</code> column mapping in job / appointment tables.
      </Text>
      <Group gap="sm" wrap="wrap">
        {Object.entries(scColourMapping).map(([colorKey, hex]) => (
          <Stack key={colorKey} gap={4} align="center">
            <EmployeeAvatar name="Alice Johnson" color={colorKey} />
            <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>{colorKey}</Text>
          </Stack>
        ))}
      </Group>
    </Stack>
  ),
};

export const EmployeeAvatarUnassigned: Story = {
  name: 'EmployeeAvatar — unassigned',
  render: () => (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        When no employee is assigned (<code>useUnassignedMode=true</code>), renders
        a grey avatar with <code>IconUserOff</code>.
      </Text>
      <Group gap="sm">
        <EmployeeAvatar />
        <EmployeeAvatar name="Alice Johnson" />
      </Group>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// Stories — DataAvatar (Mantine Avatar, table cells)
// ---------------------------------------------------------------------------

export const DataAvatarSingle: Story = {
  name: 'DataAvatar — table cell (24 px)',
  render: () => (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Used in table cell rendering via <code>DataAvatar.tsx</code>. Mantine
        Avatar, size 24 px, <code>scBlue[5]</code> background by default.
      </Text>
      <Group gap="sm">
        {['AJ', 'TS', 'MO'].map((label) => (
          <Avatar
            key={label}
            size={24}
            radius="xl"
            style={{ '--avatar-bg': SC_BLUE_5, '--avatar-color': '#fff', fontWeight: 500, fontSize: 10 } as React.CSSProperties}
          >
            {label}
          </Avatar>
        ))}
      </Group>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// Stories — Stacked / grouped (Avatar.Group)
// Used when multiple employees are assigned to a job or appointment.
// ---------------------------------------------------------------------------

const teamMembers = [
  { name: 'Alice Johnson',  color: SC_BLUE_7 },
  { name: 'Tom Smith',      color: scColourMapping.Green },
  { name: 'Maria Chen',     color: scColourMapping.Purple },
  { name: 'Dave Okafor',    color: scColourMapping.Orange },
  { name: 'Sara Patel',     color: scColourMapping.Red },
];

export const StackedGroup: Story = {
  name: 'Stacked group (2–3 employees)',
  render: () => (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Mantine <code>Avatar.Group</code> — avatars overlap. Used when a job or
        appointment has 2–3 assigned employees.
      </Text>
      <Avatar.Group spacing="sm">
        {teamMembers.slice(0, 3).map(({ name, color }) => (
          <Tooltip key={name} label={name} color="dark">
            <Avatar
              size={32}
              radius="xl"
              style={{ '--avatar-bg': color, '--avatar-color': '#fff', fontWeight: 600, fontSize: 12 } as React.CSSProperties}
            >
              {name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </Avatar>
          </Tooltip>
        ))}
      </Avatar.Group>
    </Stack>
  ),
};

export const StackedWithOverflow: Story = {
  name: 'Stacked with +N overflow',
  render: () => (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        5 employees assigned — show first 3, overflow badge for the remaining 2.
        White badge with scBlue text to stay on-brand.
      </Text>
      <Avatar.Group spacing="sm">
        {teamMembers.slice(0, 3).map(({ name, color }) => (
          <Tooltip key={name} label={name} color="dark">
            <Avatar
              size={32}
              radius="xl"
              style={{ '--avatar-bg': color, '--avatar-color': '#fff', fontWeight: 600, fontSize: 12 } as React.CSSProperties}
            >
              {name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </Avatar>
          </Tooltip>
        ))}
        <Tooltip
          label={teamMembers.slice(3).map((m) => m.name).join(', ')}
          color="dark"
        >
          <Avatar
            size={32}
            radius="xl"
            style={{
              '--avatar-bg': '#ffffff',
              '--avatar-color': SC_BLUE_7,
              fontWeight: 700,
              fontSize: 12,
              border: '1.5px solid #dee2e6',
            } as React.CSSProperties}
          >
            +{teamMembers.length - 3}
          </Avatar>
        </Tooltip>
      </Avatar.Group>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// Stories — In context (jobs / appointments table row)
// ---------------------------------------------------------------------------

const jobRows = [
  { job: 'J-00423', customer: 'Acme Corp',       assignees: [teamMembers[0]], status: 'In Progress' },
  { job: 'J-00424', customer: 'BuildRight Ltd',   assignees: [teamMembers[1], teamMembers[2]], status: 'Pending' },
  { job: 'J-00425', customer: 'FastFix Plumbing', assignees: teamMembers.slice(0, 5), status: 'Complete' },
  { job: 'J-00426', customer: 'SunSet Homes',     assignees: [], status: 'Pending' },
];

const STATUS_COLORS: Record<string, string> = {
  'In Progress': '#1971c2',
  Pending:       '#e67700',
  Complete:      '#2f9e44',
};

export const JobsTableContext: Story = {
  name: 'In context — Jobs table rows',
  render: () => (
    <Stack gap={0}>
      <Text size="xs" c="dimmed" mb={12}>
        Simulated Jobs table rows showing how avatars render for single, multiple,
        and unassigned states.
      </Text>

      {/* Table header */}
      <Flex
        style={{
          background: '#F4F5F7',
          borderBottom: '1px solid #dee2e6',
          padding: '8px 12px',
        }}
        gap="md"
      >
        <Text size="xs" fw={700} style={{ width: 80 }}>Job #</Text>
        <Text size="xs" fw={700} style={{ flex: 1 }}>Customer</Text>
        <Text size="xs" fw={700} style={{ width: 100 }}>Assigned</Text>
        <Text size="xs" fw={700} style={{ width: 90 }}>Status</Text>
      </Flex>

      {/* Rows */}
      {jobRows.map(({ job, customer, assignees, status }) => (
        <Flex
          key={job}
          align="center"
          gap="md"
          style={{
            padding: '10px 12px',
            borderBottom: '1px solid #f1f3f5',
            background: '#fff',
          }}
        >
          <Text size="sm" style={{ width: 80 }}>{job}</Text>
          <Text size="sm" style={{ flex: 1 }}>{customer}</Text>

          {/* Avatar cell */}
          <Box style={{ width: 100 }}>
            {assignees.length === 0 ? (
              <EmployeeAvatar />
            ) : assignees.length === 1 ? (
              <EmployeeAvatar name={assignees[0].name} color={assignees[0].color} />
            ) : (
              <Avatar.Group spacing="xs">
                {assignees.slice(0, 3).map(({ name, color }) => (
                  <Tooltip key={name} label={name} color="dark">
                    <Avatar
                      size={24}
                      radius="xl"
                      style={{ '--avatar-bg': color, '--avatar-color': '#fff', fontWeight: 600, fontSize: 10 } as React.CSSProperties}
                    >
                      {name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
                {assignees.length > 3 && (
                  <Tooltip label={assignees.slice(3).map((a) => a.name).join(', ')} color="dark">
                    <Avatar
                      size={24}
                      radius="xl"
                      style={{
                        '--avatar-bg': '#ffffff',
                        '--avatar-color': SC_BLUE_7,
                        fontWeight: 700,
                        fontSize: 10,
                        border: '1.5px solid #dee2e6',
                      } as React.CSSProperties}
                    >
                      +{assignees.length - 3}
                    </Avatar>
                  </Tooltip>
                )}
              </Avatar.Group>
            )}
          </Box>

          <Box style={{ width: 90 }}>
            <Text
              size="xs"
              fw={600}
              style={{ color: STATUS_COLORS[status] ?? '#868e96' }}
            >
              {status}
            </Text>
          </Box>
        </Flex>
      ))}
    </Stack>
  ),
};

export const SizeVariants: Story = {
  name: 'Size variants (EmployeeAvatar scale)',
  render: () => (
    <Stack gap="lg">
      <Text size="xs" c="dimmed">
        EmployeeAvatar uses <code>transform: scale(n)</code> on its base
        <code>1.4rem</code> container. DataAvatar uses an explicit px size.
      </Text>
      {([0.8, 1, 1.25, 1.5, 2] as const).map((scale) => (
        <Group key={scale} gap="sm" align="center">
          <EmployeeAvatar name="Alice Johnson" size={scale} />
          <Text size="xs" c="dimmed">scale={scale} ({Math.round(22.4 * scale)}px)</Text>
        </Group>
      ))}
    </Stack>
  ),
};
