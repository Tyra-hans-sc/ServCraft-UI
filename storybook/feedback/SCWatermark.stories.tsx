import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCWatermark from '../../components/sc-controls/misc/sc-watermark';

/**
 * SCWatermark overlays a diagonal text watermark on its containing element.
 * Used on printed documents and PDF previews to mark them as drafts or samples.
 *
 * **Props:**
 * - `text` — watermark text (default: `"SAMPLE"`)
 * - `rotation` — CSS rotation (default: `"-25deg"`)
 *
 * The component renders with `position: absolute` — wrap it in a `position: relative`
 * container so it overlays the correct area.
 *
 * **Variants:** Default · Custom text · Custom rotation
 */
const meta: Meta<any> = {
  title: 'Feedback/SCWatermark',
  component: SCWatermark,
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text', description: 'Watermark text' },
    rotation: { control: 'text', description: 'CSS rotation angle (e.g. -25deg)' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Wrapper = ({ children }: any) => (
  <div
    style={{
      position: 'relative',
      width: 400,
      height: 240,
      border: '1px solid #eee',
      borderRadius: 8,
      padding: 24,
      overflow: 'hidden',
    }}
  >
    <p style={{ color: '#333', margin: 0 }}>
      Invoice #INV-00542<br />
      Customer: Acme Corp<br />
      Total: $1,250.00
    </p>
    {children}
  </div>
);

export const Default: Story = {
  render: (args) => (
    <Wrapper>
      <SCWatermark {...args} />
    </Wrapper>
  ),
};

export const Draft: Story = {
  args: { text: 'DRAFT' },
  render: (args) => (
    <Wrapper>
      <SCWatermark {...args} />
    </Wrapper>
  ),
};

export const Void: Story = {
  args: { text: 'VOID', rotation: '-30deg' },
  render: (args) => (
    <Wrapper>
      <SCWatermark {...args} />
    </Wrapper>
  ),
};
