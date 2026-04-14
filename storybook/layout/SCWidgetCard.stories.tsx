import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, Stack, Title } from '@mantine/core';
import SCWidgetCard from '../../components/sc-controls/widgets/new/sc-widget-card';

/**
 * SCWidgetCard is the base container for all dashboard widgets. It wraps
 * Mantine's Card with a consistent shadow, padding (24px), and border radius (8px).
 *
 * Pass any content as `children`. Provide `onDismiss` to show a close button
 * in the top-right corner (used for dismissible dashboard tiles).
 *
 * **Props:**
 * - `background` — any CSS colour or Mantine colour key (default: `"white"`)
 * - `height` — card height (default: `"100%"`)
 * - `dismissHidden` — hides the close button without removing the handler
 * - `cardProps` — forwarded to the underlying Mantine Card
 *
 * **Variants:** Default · Coloured · With dismiss button · Custom height
 */
const meta: Meta<typeof SCWidgetCard> = {
  title: 'Layout/SCWidgetCard',
  component: SCWidgetCard,
  tags: ['autodocs'],
  argTypes: {
    background: { control: 'color', description: 'Card background colour' },
    height: { control: 'text', description: 'Card height (CSS value or number in px)' },
    dismissHidden: { control: 'boolean', description: 'Hide the dismiss button' },
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof SCWidgetCard>;

export const Default: Story = {
  render: (args) => (
    <SCWidgetCard {...args}>
      <Stack gap="xs">
        <Title order={5}>Widget title</Title>
        <Text size="sm" c="dimmed">Widget content goes here. This card provides the standard container for all dashboard widgets.</Text>
      </Stack>
    </SCWidgetCard>
  ),
};

export const WithDismissButton: Story = {
  name: 'With dismiss button',
  render: (args) => (
    <SCWidgetCard {...args} onDismiss={() => {}}>
      <Stack gap="xs">
        <Title order={5}>Dismissible widget</Title>
        <Text size="sm" c="dimmed">Click the × in the top right to dismiss this widget.</Text>
      </Stack>
    </SCWidgetCard>
  ),
};

export const ColouredBackground: Story = {
  name: 'Coloured background',
  args: {
    background: '#003ED0',
  },
  render: (args) => (
    <SCWidgetCard {...args} onDismiss={() => {}}>
      <Stack gap="xs">
        <Title order={5} c="white">Featured widget</Title>
        <Text size="sm" c="rgba(255,255,255,0.8)">The close button colour adapts to light/dark backgrounds automatically.</Text>
      </Stack>
    </SCWidgetCard>
  ),
};

export const LightBlueBackground: Story = {
  name: 'Light blue background',
  args: {
    background: '#e9f1ff',
  },
  render: (args) => (
    <SCWidgetCard {...args}>
      <Stack gap="xs">
        <Title order={5}>Info widget</Title>
        <Text size="sm">Used for informational or promotional dashboard tiles.</Text>
      </Stack>
    </SCWidgetCard>
  ),
};

export const FixedHeight: Story = {
  name: 'Fixed height (200px)',
  args: {
    height: 200,
  },
  render: (args) => (
    <SCWidgetCard {...args}>
      <Stack gap="xs">
        <Title order={5}>Fixed height widget</Title>
        <Text size="sm" c="dimmed">This widget has a fixed height of 200px.</Text>
      </Stack>
    </SCWidgetCard>
  ),
};
