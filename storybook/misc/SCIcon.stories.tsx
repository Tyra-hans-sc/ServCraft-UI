import type { Meta, StoryObj } from '@storybook/react';
import SCIcon from '../../components/sc-controls/misc/sc-icon';

/**
 * SCIcon renders an SVG icon from the `/public/icons/` directory. Pass the
 * filename without extension as `name`.
 *
 * **Props:**
 * - `name` — SVG filename (without `.svg`) from `/public/icons/`
 * - `height` — icon height (default: `"1.5rem"`)
 * - `folder` — subdirectory under `/public/` (default: `"icons"`)
 * - `onClick` — makes the icon interactive (adds pointer cursor)
 *
 * **Available icons** include: `alert-triangle`, `appointments`, `archive`,
 * `arrow-left`, `building`, `calendar-plus`, `check-green`, and many more
 * in `/public/icons/`.
 *
 * **Variants:** Default · Larger · Clickable · Custom folder
 */
const meta: Meta<any> = {
  title: 'Misc/SCIcon',
  component: SCIcon,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text', description: 'SVG filename (without .svg) from /public/icons/' },
    height: { control: 'text', description: 'Icon height (CSS value)' },
    folder: { control: 'text', description: 'Subdirectory under /public/ (default: icons)' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    name: 'alert-triangle',
    height: '1.5rem',
  },
};

export const Larger: Story = {
  args: {
    name: 'appointments',
    height: '2.5rem',
  },
};

export const Clickable: Story = {
  args: {
    name: 'archive',
    height: '1.5rem',
    onClick: () => {},
  },
};

export const CalendarIcon: Story = {
  name: 'Calendar icon',
  args: {
    name: 'calendar-plus',
    height: '2rem',
  },
};

export const CheckIcon: Story = {
  name: 'Check icon',
  args: {
    name: 'check-green',
    height: '1.5rem',
  },
};
