import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Button, Flex, Stack, Text, TextInput, Textarea, Badge, Group, Divider } from '@mantine/core';
import SCModal from '../../PageComponents/Modal/SCModal';

/**
 * SCModal is the production modal for ServCraft (`PageComponents/Modal/SCModal.tsx`).
 *
 * Built on Mantine `Modal` with a scBlue blurred overlay and an optional
 * right-hand decorative panel.
 *
 * **Key props:**
 * - `open` — controls visibility
 * - `onClose` — called on backdrop click or Escape key
 * - `size` — Mantine size or number (default: `'xl'`)
 * - `headerSection` — slot above the scrollable body
 * - `footerSection` — slot below the body (right-aligned)
 * - `headerSectionBackButtonText` — shows a bordered Back button at the top
 * - `decor` — `'none'` (default) · `'ServCraft'` · `'Industries&JobCount'`
 * - `withCloseButton` — renders an absolute `×` button top-right
 * - `p` — body padding (default: `'lg'`)
 *
 * **Overlay:** `scBlue[5]` colour, `blur: 10`, `opacity: 0.55`
 *
 * **Transition:** `pop`, 100 ms
 */
const meta: Meta<any> = {
  title: 'Layout/SCModal',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'text', description: 'Modal width (Mantine size or px number)' },
    decor: {
      control: 'select',
      options: ['none', 'ServCraft', 'Industries&JobCount'],
      description: 'Right-panel decoration',
    },
  },
};

export default meta;
type Story = StoryObj<any>;

// ---------------------------------------------------------------------------
// Trigger helper
// ---------------------------------------------------------------------------

function Trigger({
  label = 'Open modal',
  children,
  ...modalProps
}: { label?: string; children?: React.ReactNode } & React.ComponentProps<typeof SCModal>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <SCModal {...modalProps} open={open} onClose={() => setOpen(false)}>
        {children}
      </SCModal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Default',
  render: () => (
    <Trigger label="Open modal" size="md">
      <Text size="sm">
        Modal content goes here. This is the standard ServCraft modal — centred,
        with a scBlue blurred overlay and a pop transition.
      </Text>
    </Trigger>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Open the modal by clicking the trigger button
    await userEvent.click(canvas.getByRole('button', { name: /open modal/i }));
    // Modal renders in a Mantine portal — check document.body.
    // Mantine's 'pop' transition takes 100ms; waitFor handles timing variance.
    const dialog = await within(document.body).findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible(), { timeout: 500 });
    // Escape key must close the modal
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument()
    );
  },
};

export const WithHeader: Story = {
  name: 'With header section',
  render: () => (
    <Trigger
      label="Open modal"
      size="md"
      headerSection={
        <Flex
          px="lg"
          py="sm"
          align="center"
          justify="space-between"
          style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
        >
          <Text fw={700} size="md">Edit job details</Text>
          <Badge color="blue" variant="light">In Progress</Badge>
        </Flex>
      }
    >
      <Stack gap="sm">
        <TextInput label="Job title" placeholder="e.g. Geyser replacement" />
        <TextInput label="Customer" placeholder="Search customers…" />
        <Textarea label="Notes" placeholder="Optional notes…" rows={3} />
      </Stack>
    </Trigger>
  ),
};

export const WithFooter: Story = {
  name: 'With footer actions',
  render: () => (
    <Trigger
      label="Open modal"
      size="md"
      footerSection={
        <>
          <Button variant="subtle" color="gray">Cancel</Button>
          <Button>Save changes</Button>
        </>
      }
    >
      <Stack gap="sm">
        <TextInput label="Job title" placeholder="e.g. Geyser replacement" />
        <TextInput label="Customer" placeholder="Search customers…" />
      </Stack>
    </Trigger>
  ),
};

export const WithBackButton: Story = {
  name: 'With back button',
  render: () => (
    <Trigger
      label="Open modal"
      size="md"
      headerSectionBackButtonText="Back to options"
    >
      <Text size="sm">
        When <code>headerSectionBackButtonText</code> is set a bordered Back
        button appears above the content. Clicking it calls <code>onClose</code>.
      </Text>
    </Trigger>
  ),
};

export const WithCloseButton: Story = {
  name: 'With close button (×)',
  render: () => (
    <Trigger
      label="Open modal"
      size="md"
      withCloseButton
    >
      <Text size="sm">
        An absolute-positioned <code>×</code> CloseButton appears top-right
        when <code>withCloseButton</code> is true.
      </Text>
    </Trigger>
  ),
};

export const DecorServCraft: Story = {
  name: 'Decor — ServCraft panel',
  render: () => (
    <Trigger
      label="Open modal"
      size="xl"
      decor="ServCraft"
      footerSection={
        <>
          <Button variant="subtle" color="gray">Cancel</Button>
          <Button>Get started</Button>
        </>
      }
    >
      <Stack gap="md">
        <Text fw={700} size="lg">Welcome to ServCraft</Text>
        <Text size="sm" c="dimmed">
          The scBlue right panel with the ServCraft logo and tagline is used for
          onboarding and authentication modals.
        </Text>
        <TextInput label="Email address" placeholder="you@company.co.za" />
        <TextInput label="Password" type="password" placeholder="••••••••" />
      </Stack>
    </Trigger>
  ),
};

export const DecorStats: Story = {
  name: 'Decor — Industries & job count panel',
  render: () => (
    <Trigger
      label="Open modal"
      size="xl"
      decor="Industries&JobCount"
      footerSection={
        <>
          <Button variant="subtle" color="gray">Cancel</Button>
          <Button>Continue</Button>
        </>
      }
    >
      <Stack gap="md">
        <Text fw={700} size="lg">Join ServCraft</Text>
        <Text size="sm" c="dimmed">
          The right panel shows trust stats (20+ industries, 1M+ jobs completed)
          used on sign-up / trial flows.
        </Text>
        <TextInput label="Company name" placeholder="Your company" />
        <TextInput label="Email address" placeholder="you@company.co.za" />
      </Stack>
    </Trigger>
  ),
};

export const Wide: Story = {
  name: 'Wide modal (size xl)',
  render: () => (
    <Trigger
      label="Open modal"
      size="xl"
      headerSection={
        <Flex
          px="lg"
          py="sm"
          align="center"
          justify="space-between"
          style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
        >
          <Text fw={700}>Job summary</Text>
        </Flex>
      }
      footerSection={
        <>
          <Button variant="subtle" color="gray">Discard</Button>
          <Button>Save</Button>
        </>
      }
    >
      <Stack gap="sm">
        <Group grow>
          <TextInput label="Job #" value="J-00423" readOnly />
          <TextInput label="Customer" value="Acme Corp" readOnly />
        </Group>
        <Group grow>
          <TextInput label="Start date" value="15 June 2025" readOnly />
          <TextInput label="End date" value="17 June 2025" readOnly />
        </Group>
        <Textarea label="Description" value="Replace kitchen geyser — 150L" rows={3} readOnly />
      </Stack>
    </Trigger>
  ),
};
