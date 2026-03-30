import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCModal from '../../components/sc-controls/layout/sc-modal';

/**
 * SCModal is the standard modal dialog for ServCraft. It wraps content in a
 * centred overlay with a title and optional dismiss button.
 *
 * **Props:**
 * - `title` — modal heading
 * - `onDismiss` — called when the close button or backdrop is clicked
 * - `minWidth` — minimum modal width (default: `"38rem"`)
 * - `maxWidth` — maximum modal width (unconstrained by default)
 * - `children` — modal body content
 *
 * **Variants:** Default · Wide · No dismiss · With form content
 */
const meta: Meta<any> = {
  title: 'Layout/SCModal',
  component: SCModal,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Modal heading' },
    minWidth: { control: 'text', description: 'Minimum modal width (CSS value)' },
    maxWidth: { control: 'text', description: 'Maximum modal width (CSS value)' },
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Trigger = (args: any) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Open modal
      </button>
      {open && (
        <SCModal {...args} onDismiss={() => setOpen(false)}>
          {args.children ?? (
            <p style={{ margin: 0 }}>
              Modal content goes here. This is the standard ServCraft modal container.
            </p>
          )}
        </SCModal>
      )}
    </>
  );
};

export const Default: Story = {
  render: (args) => <Trigger {...args} title="Confirm action" />,
};

export const Wide: Story = {
  render: (args) => <Trigger {...args} title="Edit details" minWidth="56rem" />,
};

export const NoDismiss: Story = {
  name: 'No dismiss button',
  render: (args) => (
    <Trigger
      {...args}
      title="Processing…"
      onDismiss={undefined}
      children={<p style={{ margin: 0 }}>Please wait while we process your request.</p>}
    />
  ),
};
