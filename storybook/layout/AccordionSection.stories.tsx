import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AccordionSection from '../../PageComponents/AccordionSection';

/**
 * AccordionSection is a collapsible section wrapper used in settings and detail
 * pages. It wraps Mantine's Accordion with a labelled header.
 *
 * **Props:**
 * - `label` — section heading shown in the accordion trigger
 * - `initiallyOpen` — expanded on mount (default: `true`)
 * - `stayOpen` — prevents the section from being collapsed
 * - `chevron` — custom icon for the expand/collapse toggle
 * - `children` — content shown when the section is expanded
 *
 * **Variants:** Open (default) · Initially closed · Stay open · With rich content
 */
const meta: Meta<any> = {
  title: 'Layout/AccordionSection',
  component: AccordionSection,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Section heading' },
    initiallyOpen: { control: 'boolean', description: 'Open on first render' },
    stayOpen: { control: 'boolean', description: 'Prevents the section from collapsing' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: { label: 'Contact details', initiallyOpen: true },
  render: (args) => (
    <AccordionSection {...args}>
      <p style={{ margin: 0 }}>John Smith · john@example.com · 0412 345 678</p>
    </AccordionSection>
  ),
};

export const InitiallyClosed: Story = {
  name: 'Initially closed',
  args: { label: 'Advanced settings', initiallyOpen: false },
  render: (args) => (
    <AccordionSection {...args}>
      <p style={{ margin: 0 }}>These settings are hidden until the section is expanded.</p>
    </AccordionSection>
  ),
};

export const StayOpen: Story = {
  name: 'Always open (stayOpen)',
  args: { label: 'Required section', stayOpen: true, initiallyOpen: true },
  render: (args) => (
    <AccordionSection {...args}>
      <p style={{ margin: 0 }}>This section cannot be collapsed.</p>
    </AccordionSection>
  ),
};

export const StackedSections: Story = {
  name: 'Stacked sections',
  render: () => (
    <div>
      <AccordionSection label="Customer" initiallyOpen>
        <p style={{ margin: 0 }}>Acme Corp · Jane Doe · jane@acme.com</p>
      </AccordionSection>
      <AccordionSection label="Job details" initiallyOpen={false}>
        <p style={{ margin: 0 }}>Replace gutters · High priority · Due 30 Jun</p>
      </AccordionSection>
      <AccordionSection label="Notes" initiallyOpen={false}>
        <p style={{ margin: 0 }}>Call ahead before arrival.</p>
      </AccordionSection>
    </div>
  ),
};
