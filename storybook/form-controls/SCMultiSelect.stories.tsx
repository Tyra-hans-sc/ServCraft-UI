import type { Meta, StoryObj } from '@storybook/react';
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
