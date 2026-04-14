import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Flex, Text } from '@mantine/core';
import SCMultiSelect from '../../components/sc-controls/form-controls/sc-multiselect';

const TECH_OPTIONS = [
  { id: 'tech1', name: 'Alice Johnson' },
  { id: 'tech2', name: 'Bob Smith' },
  { id: 'tech3', name: 'Carol White' },
  { id: 'tech4', name: 'David Brown' },
  { id: 'tech5', name: 'Eve Davis' },
  { id: 'tech6', name: 'Frank Miller' },
];

const GROUPED_OPTIONS = [
  { id: 'tech1', name: 'Alice Johnson', department: 'Electrical' },
  { id: 'tech2', name: 'Bob Smith', department: 'Electrical' },
  { id: 'tech3', name: 'Carol White', department: 'Plumbing' },
  { id: 'tech4', name: 'David Brown', department: 'Plumbing' },
  { id: 'tech5', name: 'Eve Davis', department: 'HVAC' },
];

/**
 * SCMultiSelect allows selecting multiple values from a searchable list. Each
 * selected item appears as a removable pill inside the input.
 *
 * Use `availableOptions` for the full list of choices and `selectedOptions`
 * for the current selection. Use `dataItemKey` and `textField` to map
 * object properties to value and label.
 *
 * The `onChange` callback receives the full array of selected option objects.
 *
 * Use `readonlyValues` to lock specific pills (e.g. mandatory selections that
 * can't be removed by the user).
 *
 * **States:** Default · With selection · Grouped · With readonly values · Error · Disabled · Required
 */
const meta: Meta<typeof SCMultiSelect> = {
  title: 'Form Controls/SCMultiSelect',
  component: SCMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    placeholder: { control: 'text', description: 'Placeholder text when nothing is selected' },
    hint: { control: 'text', description: 'Helper text below the input' },
    error: { control: 'text', description: 'Validation error message' },
    required: { control: 'boolean', description: 'Shows asterisk on label' },
    disabled: { control: 'boolean', description: 'Prevents all interaction' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof SCMultiSelect>;

export const Default: Story = {
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    placeholder: 'Select technicians…',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Click the search input to open the options list
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    // Options render in a Mantine portal — use ownerDocument.body to stay
    // within the Storybook iframe rather than the outer page document.
    const portalRoot = canvasElement.ownerDocument.body;
    const option = await within(portalRoot).findByText('Alice Johnson');
    await expect(option).toBeVisible();
    await userEvent.click(option);
    // The selected pill should appear inside the canvas
    await expect(canvas.getByText('Alice Johnson')).toBeInTheDocument();
  },
};

export const WithSelection: Story = {
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [TECH_OPTIONS[0], TECH_OPTIONS[2]],
    dataItemKey: 'id',
    textField: 'name',
  },
};

export const ManySelections: Story = {
  name: 'Many selections (pills wrap)',
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: TECH_OPTIONS.slice(0, 4),
    dataItemKey: 'id',
    textField: 'name',
  },
};

export const Grouped: Story = {
  name: 'Grouped options',
  args: {
    label: 'Assign technicians',
    availableOptions: GROUPED_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    groupField: 'department',
    placeholder: 'Select technicians…',
  },
};

export const WithReadonlyValues: Story = {
  name: 'With locked selection',
  args: {
    label: 'Team members',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [TECH_OPTIONS[0], TECH_OPTIONS[1]],
    dataItemKey: 'id',
    textField: 'name',
    readonlyValues: ['tech1'],
  },
};

export const WithHint: Story = {
  args: {
    label: 'CC recipients',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    hint: 'These team members will receive a copy of the report',
  },
};

export const WithError: Story = {
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    error: 'At least one technician must be assigned',
  },
};

export const Required: Story = {
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [],
    dataItemKey: 'id',
    textField: 'name',
    required: true,
    placeholder: 'Select at least one…',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Assign technicians',
    availableOptions: TECH_OPTIONS,
    selectedOptions: [TECH_OPTIONS[0], TECH_OPTIONS[2]],
    dataItemKey: 'id',
    textField: 'name',
    disabled: true,
  },
};

// ---------------------------------------------------------------------------
// Avatar options
// ---------------------------------------------------------------------------

const SC_COLOUR_MAP: Record<string, string> = {
  emp1: '#003ED0',
  emp2: '#51ca68',
  emp3: '#725ae0',
  emp4: '#f06101',
  emp5: '#fa2e50',
};

const EMPLOYEE_OPTIONS = [
  { id: 'emp1', name: 'Alice Johnson', color: SC_COLOUR_MAP.emp1 },
  { id: 'emp2', name: 'Bob Smith',     color: SC_COLOUR_MAP.emp2 },
  { id: 'emp3', name: 'Carol White',   color: SC_COLOUR_MAP.emp3 },
  { id: 'emp4', name: 'Dave Okafor',   color: SC_COLOUR_MAP.emp4 },
  { id: 'emp5', name: 'Sara Patel',    color: SC_COLOUR_MAP.emp5 },
];

function EmployeeCircle({ id, name }: { id: string; name: string }) {
  const color = SC_COLOUR_MAP[id] ?? '#003ED0';
  const initials = name
    .trim()
    .split(' ')
    .filter((w) => w.length)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
  return (
    <Flex align="center" gap={8}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: color,
          color: '#fff',
          fontSize: 9,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <Text size="sm">{name}</Text>
    </Flex>
  );
}

export const WithAvatars: Story = {
  name: 'With avatar options (employees)',
  render: () => {
    const [selected, setSelected] = React.useState<typeof EMPLOYEE_OPTIONS>([]);
    return (
      <SCMultiSelect
        label="Assign technicians"
        availableOptions={EMPLOYEE_OPTIONS}
        selectedOptions={selected}
        dataItemKey="id"
        textField="name"
        placeholder="Select technicians…"
        onChange={setSelected}
        itemRenderMantine={({ dataItem }) => (
          <EmployeeCircle id={dataItem?.id ?? ''} name={dataItem?.name ?? ''} />
        )}
        valueRenderMantine={({ dataItem }) => (
          <EmployeeCircle id={dataItem?.id ?? ''} name={dataItem?.name ?? ''} />
        )}
      />
    );
  },
};

export const GroupedWithDepartments: Story = {
  name: 'Grouped — with department headers',
  render: () => {
    const [selected, setSelected] = React.useState<typeof GROUPED_OPTIONS>([]);
    return (
      <SCMultiSelect
        label="Assign technicians"
        availableOptions={GROUPED_OPTIONS}
        selectedOptions={selected}
        dataItemKey="id"
        textField="name"
        groupField="department"
        placeholder="Select technicians…"
        onChange={setSelected}
      />
    );
  },
};
