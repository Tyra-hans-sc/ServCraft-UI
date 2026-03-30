import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCInlineTextarea from '../../components/sc-controls/form-controls/sc-inline-textarea';

/**
 * SCInlineTextarea is a compact, label-less multiline input used for inline
 * editing of notes and descriptions inside table rows and detail panels.
 *
 * **Props:**
 * - `value` — controlled value
 * - `onChange` — called with `{ name, value }`
 * - `textAlign` — `'left'` (default) or `'right'`
 * - `width` — CSS width (default: `'100%'`)
 * - `autoFocus` — focuses on mount
 *
 * **Variants:** Default · Right-aligned · Custom width
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCInlineTextarea',
  component: SCInlineTextarea,
  tags: ['autodocs'],
  argTypes: {
    textAlign: { control: 'select', options: ['left', 'right'], description: 'Text alignment' },
    width: { control: 'text', description: 'CSS width of the textarea' },
    autoFocus: { control: 'boolean', description: 'Focuses on mount' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Controlled = (args: any) => {
  const [value, setValue] = useState(args.value ?? '');
  return (
    <div style={{ width: 300 }}>
      <SCInlineTextarea
        {...args}
        name="notes"
        value={value}
        onChange={(e: any) => setValue(e.value)}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => (
    <Controlled {...args} value="Replace broken gutter section on north-facing wall." />
  ),
};

export const Empty: Story = {
  render: (args) => <Controlled {...args} value="" />,
};

export const CustomWidth: Story = {
  name: 'Custom width',
  render: (args) => (
    <Controlled {...args} value="Short note" width="180px" />
  ),
};
