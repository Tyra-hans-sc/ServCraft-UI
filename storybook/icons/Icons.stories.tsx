import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AlertIcon from '../../PageComponents/Icons/AlertIcon';
import ContactIcon from '../../PageComponents/Icons/ContactIcon';
import CustomerIcon from '../../PageComponents/Icons/CustomerIcon';
import DiamondIcon from '../../PageComponents/Icons/DiamondIcon';
import LocationIcon from '../../PageComponents/Icons/LocationIcon';

/**
 * ServCraft brand icon set — SVG components used throughout the app for
 * entity identification and status indication.
 *
 * **Icons:**
 * - **AlertIcon** — warning / alert indicator; requires a `message` prop
 * - **ContactIcon** — person / contact entity
 * - **CustomerIcon** — business / customer entity
 * - **DiamondIcon** — premium feature or highlight
 * - **LocationIcon** — map pin / location entity
 *
 * All icons accept `color`, `size`, and `style` props.
 */
const meta: Meta<any> = {
  title: 'Icons/Brand Icons',
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color', description: 'Icon fill colour' },
    size: { control: 'number', description: 'Icon size in pixels' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const AllIcons: Story = {
  name: 'All brand icons',
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AlertIcon message="Sample alert message" />
        <span style={{ fontSize: 12, color: '#666' }}>AlertIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <ContactIcon size={32} color="#003ED0" />
        <span style={{ fontSize: 12, color: '#666' }}>ContactIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <CustomerIcon size={32} color="#003ED0" />
        <span style={{ fontSize: 12, color: '#666' }}>CustomerIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <DiamondIcon size={32} color="#003ED0" />
        <span style={{ fontSize: 12, color: '#666' }}>DiamondIcon</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <LocationIcon size={32} color="#003ED0" />
        <span style={{ fontSize: 12, color: '#666' }}>LocationIcon</span>
      </div>
    </div>
  ),
};

export const Alert: Story = {
  render: () => <AlertIcon message="Something needs your attention" />,
};

export const Contact: Story = {
  render: (args) => <ContactIcon size={args.size ?? 40} color={args.color ?? '#003ED0'} />,
};

export const Customer: Story = {
  render: (args) => <CustomerIcon size={args.size ?? 40} color={args.color ?? '#003ED0'} />,
};

export const Diamond: Story = {
  render: (args) => <DiamondIcon size={args.size ?? 40} color={args.color ?? '#003ED0'} />,
};

export const Location: Story = {
  render: (args) => <LocationIcon size={args.size ?? 40} color={args.color ?? '#003ED0'} />,
};
