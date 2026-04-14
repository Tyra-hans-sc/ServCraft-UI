import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ScDrawer from '../../PageComponents/Drawer/ScDrawer';

/**
 * ScDrawer is the standard slide-in side panel used for detail views, edit
 * forms, and secondary navigation throughout ServCraft.
 *
 * It extends Mantine's Drawer with a title area, optional fullscreen expand
 * button, and an optional link to the full page view.
 *
 * **Props:**
 * - `opened` — controls drawer visibility
 * - `onClose` — called when the drawer is closed
 * - `title` — drawer heading
 * - `size` — drawer width (default: `530`)
 * - `showFullscreenExpandButton` — adds an expand-to-fullscreen toggle
 * - `linkToFullPage` — URL for a "View full page" link button
 * - `children` — drawer body content
 *
 * **Variants:** Default · With fullscreen button · With full-page link · Wide
 */
const meta: Meta<any> = {
  title: 'Layout/ScDrawer',
  component: ScDrawer,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Drawer heading' },
    size: { control: 'number', description: 'Drawer width in pixels' },
    showFullscreenExpandButton: { control: 'boolean', description: 'Show expand to fullscreen button' },
    linkToFullPage: { control: 'text', description: 'URL for a "View full page" link' },
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Trigger = (props: any) => {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <button onClick={() => setOpened(true)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Open drawer
      </button>
      <ScDrawer {...props} opened={opened} onClose={() => setOpened(false)}>
        <div style={{ padding: '0 8px' }}>
          {props.children ?? (
            <>
              <p><strong>Customer:</strong> Acme Corp</p>
              <p><strong>Job #:</strong> J-00123</p>
              <p><strong>Status:</strong> In Progress</p>
              <p><strong>Assigned to:</strong> Alice Johnson</p>
              <p><strong>Description:</strong> Replace broken gutter on north-facing wall.</p>
            </>
          )}
        </div>
      </ScDrawer>
    </>
  );
};

export const Default: Story = {
  render: (args) => <Trigger {...args} title="Job details" />,
};

export const WithFullscreenButton: Story = {
  name: 'With fullscreen expand button',
  render: (args) => <Trigger {...args} title="Job details" showFullscreenExpandButton />,
};

export const Wide: Story = {
  render: (args) => <Trigger {...args} title="Edit job" size={800} />,
};

export const WithFullPageLink: Story = {
  name: 'With full page link',
  render: (args) => (
    <Trigger {...args} title="Invoice #INV-0054" linkToFullPage="/invoices/54" />
  ),
};
