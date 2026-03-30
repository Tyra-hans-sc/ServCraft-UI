import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SCCarousel from '../../components/sc-controls/layout/sc-carousel';

/**
 * SCCarousel is an auto-playing content carousel used for featured content and
 * dashboard announcements. It cycles through children at a configurable interval.
 *
 * **Props:**
 * - `children` — slides to cycle through (each child is one slide)
 * - `interval` — milliseconds between slides (default: `5000`)
 * - `animation` — transition type, e.g. `'slide'` (default: `'slide'`)
 * - `autoPlay` — start cycling automatically (default: `true`)
 *
 * **Variants:** Default · Three slides · No autoplay
 */
const meta: Meta<any> = {
  title: 'Layout/SCCarousel',
  component: SCCarousel,
  tags: ['autodocs'],
  argTypes: {
    interval: { control: 'number', description: 'Time between slides in milliseconds' },
    autoPlay: { control: 'boolean', description: 'Auto-play the carousel' },
    animation: { control: 'text', description: 'Transition animation type' },
  },
};

export default meta;
type Story = StoryObj<any>;

const Slide = ({ bg, label }: { bg: string; label: string }) => (
  <div
    style={{
      background: bg,
      height: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    }}
  >
    <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{label}</span>
  </div>
);

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 500 }}>
      <SCCarousel {...args}>
        <Slide bg="#003ED0" label="Slide 1" />
        <Slide bg="#1a6dd0" label="Slide 2" />
        <Slide bg="#0059b3" label="Slide 3" />
      </SCCarousel>
    </div>
  ),
};

export const NoAutoPlay: Story = {
  name: 'No autoplay',
  render: (args) => (
    <div style={{ maxWidth: 500 }}>
      <SCCarousel {...args} autoPlay={false}>
        <Slide bg="#003ED0" label="Manual slide 1" />
        <Slide bg="#1a6dd0" label="Manual slide 2" />
      </SCCarousel>
    </div>
  ),
};

export const FastInterval: Story = {
  name: 'Fast interval (2s)',
  render: (args) => (
    <div style={{ maxWidth: 500 }}>
      <SCCarousel {...args} interval={2000}>
        <Slide bg="#003ED0" label="Slide A" />
        <Slide bg="#ff6b35" label="Slide B" />
        <Slide bg="#1a6dd0" label="Slide C" />
      </SCCarousel>
    </div>
  ),
};
