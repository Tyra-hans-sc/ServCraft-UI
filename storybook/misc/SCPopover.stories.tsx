import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCPopover from '../../components/sc-controls/popover/sc-popover';

/**
 * SCPopover is a confirmation popover anchored to a target element. It displays
 * a title, body message, and a confirm/cancel button pair.
 *
 * **Props:**
 * - `show` — controls visibility
 * - `setShow` — called to close the popover
 * - `position` — anchor position (e.g. `'bottom'`, `'top'`)
 * - `anchor` — ref to the anchor element
 * - `title` — popover heading
 * - `body` — popover body content (string or ReactNode)
 * - `confirmText` — label for the confirm button
 * - `onClick` — called with `true` (confirm) or `false` (cancel)
 *
 * **Variants:** Bottom · Confirm destructive action
 */
const meta: Meta<any> = {
  title: 'Misc/SCPopover',
  component: SCPopover,
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'], description: 'Popover position relative to anchor' },
    title: { control: 'text', description: 'Popover heading' },
    body: { control: 'text', description: 'Popover body message' },
    confirmText: { control: 'text', description: 'Confirm button label' },
    onClick: { action: 'confirmed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const PopoverDemo = (args: any) => {
  const [show, setShow] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
      <button
        ref={anchorRef}
        onClick={() => setShow(true)}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        {args.title ?? 'Show popover'}
      </button>
      <SCPopover
        {...args}
        show={show}
        setShow={setShow}
        anchor={anchorRef}
        onClick={(confirmed: boolean) => {
          setShow(false);
          args.onClick?.(confirmed);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => (
    <PopoverDemo
      {...args}
      title="Delete item"
      body="Are you sure you want to delete this item? This cannot be undone."
      confirmText="Delete"
      position="bottom"
    />
  ),
};

export const ArchiveConfirm: Story = {
  name: 'Archive confirmation',
  render: (args) => (
    <PopoverDemo
      {...args}
      title="Archive job"
      body="This job will be moved to the archive and hidden from active views."
      confirmText="Archive"
      position="bottom"
    />
  ),
};
