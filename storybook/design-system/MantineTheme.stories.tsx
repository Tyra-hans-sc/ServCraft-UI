import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useMantineTheme, Box, Text, Stack, Group, Badge } from '@mantine/core';

/**
 * ServCraft's Mantine theme extends the default Mantine theme with a custom
 * colour palette, spacing scale, and font sizes. All values come from
 * `theme/mantineTheme.ts`.
 *
 * The theme is applied globally via `MantineProvider` in `.storybook/preview.tsx`
 * so every story already inherits it.
 *
 * For the full Mantine theming API see
 * [Mantine docs → Theme](https://mantine.dev/theming/theme-object/).
 */
const meta: Meta = {
  title: 'Design System/Mantine Theme',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// scBlue colour scale
// ---------------------------------------------------------------------------

const scBlueSwatches = [
  { index: 0, hex: '#e9f1ff', label: 'Lightest tint' },
  { index: 1, hex: '#d0deff', label: 'Light tint' },
  { index: 2, hex: '#9eb9fc', label: '' },
  { index: 3, hex: '#6893fb', label: '' },
  { index: 4, hex: '#000000', label: 'Reserved (black)' },
  { index: 5, hex: '#265dfa', label: '' },
  { index: 6, hex: '#003ED0', label: 'Primary brand blue' },
  { index: 7, hex: '#0038c0', label: 'Hover / dark' },
  { index: 8, hex: '#0025b9', label: '' },
  { index: 9, hex: '#001c88', label: 'Darkest shade' },
];

function SwatchRow() {
  return (
    <Stack gap="xs">
      <Text size="sm" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        scBlue — primary colour
      </Text>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {scBlueSwatches.map(({ index, hex, label }) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                background: hex,
                border: hex === '#ffffff' ? '1px solid #e5e7eb' : undefined,
              }}
            />
            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
              [{index}]
            </Text>
            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace', fontSize: 10 }}>
              {hex}
            </Text>
            {label && (
              <Text size="xs" c="dimmed" style={{ fontSize: 10, textAlign: 'center', maxWidth: 60 }}>
                {label}
              </Text>
            )}
          </div>
        ))}
      </div>
      <Text size="xs" c="dimmed">
        Usage: <code style={{ fontFamily: 'monospace', background: '#f4f5f7', padding: '1px 5px', borderRadius: 4 }}>color="scBlue"</code> ·{' '}
        <code style={{ fontFamily: 'monospace', background: '#f4f5f7', padding: '1px 5px', borderRadius: 4 }}>var(--mantine-color-scBlue-6)</code>
      </Text>
    </Stack>
  );
}

export const ColourPalette: Story = {
  name: 'Colour palette',
  render: () => <SwatchRow />,
};

// ---------------------------------------------------------------------------
// Spacing scale
// ---------------------------------------------------------------------------

const spacingTokens: { name: string; value: string; px: number }[] = [
  { name: 'xs', value: 'rem(10)', px: 10 },
  { name: 'sm', value: 'rem(12)', px: 12 },
  { name: 'md', value: 'rem(14)', px: 14 },
  { name: 'lg', value: 'rem(16)', px: 16 },
  { name: 'xl', value: 'rem(18)', px: 18 },
];

export const Spacing: Story = {
  name: 'Spacing scale',
  render: () => (
    <Stack gap="md">
      <Text size="sm" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        Spacing
      </Text>
      {spacingTokens.map(({ name, value, px }) => (
        <Group key={name} gap="md" align="center">
          <Text size="sm" fw={600} style={{ minWidth: 24, fontFamily: 'monospace' }}>
            {name}
          </Text>
          <div style={{ width: px * 4, height: px * 2, background: '#003ED0', borderRadius: 3 }} />
          <Text size="sm" c="dimmed">
            {px}px · <code style={{ fontFamily: 'monospace', background: '#f4f5f7', padding: '1px 4px', borderRadius: 3 }}>{value}</code>
          </Text>
          <Badge variant="light" color="blue" size="xs">
            p="{name}" · gap="{name}" etc.
          </Badge>
        </Group>
      ))}
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// Font sizes
// ---------------------------------------------------------------------------

const fontSizeTokens: { name: string; px: number; note?: string }[] = [
  { name: 'sm', px: 13, note: 'Helper text, captions' },
  { name: 'md', px: 16, note: 'Body / default' },
  { name: 'lg', px: 18 },
  { name: 'xl', px: 20 },
  { name: 'xxl', px: 22, note: 'Section headings' },
  { name: 'xxxl', px: 26, note: 'Page headings' },
];

export const FontSizes: Story = {
  name: 'Font sizes',
  render: () => (
    <Stack gap="lg">
      <Text size="sm" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        Font sizes — Proxima Nova
      </Text>
      {fontSizeTokens.map(({ name, px, note }) => (
        <Group key={name} gap="md" align="baseline">
          <Text
            style={{
              fontSize: px,
              fontWeight: 500,
              minWidth: 200,
              lineHeight: 1.2,
            }}
          >
            Aa — size="{name}"
          </Text>
          <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
            {px}px
          </Text>
          {note && (
            <Text size="xs" c="dimmed">
              {note}
            </Text>
          )}
        </Group>
      ))}
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// Typography specimen
// ---------------------------------------------------------------------------

export const Typography: Story = {
  name: 'Typography specimen',
  render: () => (
    <Stack gap="xl" style={{ maxWidth: 600 }}>
      <div>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.06em', marginBottom: 6 }}>
          Font family
        </Text>
        <Text style={{ fontSize: 20 }}>
          Proxima Nova — <em>ABCDEFGHIJKLMNOPQRSTUVWXYZ</em>
        </Text>
        <Text style={{ fontSize: 16, color: '#525866' }}>
          abcdefghijklmnopqrstuvwxyz · 0123456789 · ., : ; ! ? @ # &amp;
        </Text>
      </div>
      <div>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.06em', marginBottom: 12 }}>
          Weight samples
        </Text>
        <Stack gap="xs">
          <Text fw={400} style={{ fontSize: 16 }}>400 Regular — the quick brown fox jumps over the lazy dog</Text>
          <Text fw={500} style={{ fontSize: 16 }}>500 Medium — the quick brown fox jumps over the lazy dog</Text>
          <Text fw={600} style={{ fontSize: 16 }}>600 Semibold — the quick brown fox jumps over the lazy dog</Text>
          <Text fw={700} style={{ fontSize: 16 }}>700 Bold — the quick brown fox jumps over the lazy dog</Text>
        </Stack>
      </div>
    </Stack>
  ),
};
