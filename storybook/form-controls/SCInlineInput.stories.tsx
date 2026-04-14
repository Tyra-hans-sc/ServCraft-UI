import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCInlineInput from '../../components/sc-controls/form-controls/sc-inline-input';

/**
 * SCInlineInput is an editable inline text field used inside table cells and
 * detail views where a label-less, borderless edit experience is needed.
 *
 * **Props:**
 * - `value` — controlled value
 * - `type` — `'text'` (default) or `'number'`
 * - `readOnly` — shows text without edit affordance
 * - `error` — shows red border with error state
 * - `width` — CSS width of the input
 * - `textAlign` — `'left'` (default) or `'right'`
 * - `autoFocus` — focuses on mount
 *
 * **Variants:** Default · ReadOnly · Error · Number · Right-aligned
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCInlineInput',
  component: SCInlineInput,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'number'], description: 'Input type' },
    readOnly: { control: 'boolean', description: 'Prevents editing' },
    error: { control: 'text', description: 'Error state message (turns border red)' },
    required: { control: 'boolean', description: 'Required state' },
    autoFocus: { control: 'boolean', description: 'Focus on mount' },
    textAlign: { control: 'select', options: ['left', 'right'], description: 'Text alignment' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Controlled = (args: any) => {
  const [value, setValue] = useState(args.value ?? '');
  return (
    <div style={{ width: 240 }}>
      <SCInlineInput
        ariaLabel={args.ariaLabel ?? 'Value'}
        {...args}
        name="demo"
        value={value}
        onChange={(e: any) => setValue(e.value)}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} value="Repair gutter" />,
};

export const Empty: Story = {
  render: (args) => <Controlled {...args} value="" />,
};

export const ReadOnly: Story = {
  render: (args) => <Controlled {...args} value="Read-only value" readOnly />,
};

export const WithError: Story = {
  render: (args) => <Controlled {...args} value="" error="This field is required" />,
};

export const NumberType: Story = {
  name: 'Number type',
  render: (args) => <Controlled {...args} type="number" value={42} />,
};

export const RightAligned: Story = {
  name: 'Right-aligned',
  render: (args) => <Controlled {...args} value="99.95" textAlign="right" />,
};
