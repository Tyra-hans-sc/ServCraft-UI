import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import SCDropdownList from '../../components/sc-controls/form-controls/sc-dropdownlist';

const STATUS_OPTIONS = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
  { id: 'pending', name: 'Pending review' },
  { id: 'archived', name: 'Archived' },
];

const GROUPED_OPTIONS = [
  { id: 'tech1', name: 'Alice Johnson', department: 'Electrical' },
  { id: 'tech2', name: 'Bob Smith', department: 'Electrical' },
  { id: 'tech3', name: 'Carol White', department: 'Plumbing' },
  { id: 'tech4', name: 'David Brown', department: 'Plumbing' },
  { id: 'tech5', name: 'Eve Davis', department: 'HVAC' },
];

/**
 * SCDropdownList is the standard single-select dropdown for ServCraft forms.
 * It wraps SCComboBox (Mantine-based) with consistent styling and behaviour.
 *
 * Options can be plain strings or objects — use `dataItemKey` and `textField`
 * to map object properties to value and display label.
 *
 * **Features:**
 * - Optional search filtering (`canSearch`)
 * - Optional clear button (`canClear`)
 * - Grouped options (`groupField`)
 * - Custom item rendering (`itemRenderMantine`)
 *
 * **States:** Default · With value · Searchable · Clearable · Grouped · Error · Disabled · ReadOnly · Required
 */
const meta: Meta<typeof SCDropdownList> = {
  title: 'Form Controls/SCDropdownList',
  component: SCDropdownList,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Field label' },
    placeholder: { control: 'text', description: 'Placeholder when no value is selected' },
    error: { control: 'text', description: 'Validation error message' },
    hint: { control: 'text', description: 'Helper text' },
    required: { control: 'boolean', description: 'Shows asterisk on label' },
    disabled: { control: 'boolean', description: 'Prevents interaction' },
    readOnly: { control: 'boolean', description: 'Shows value but prevents editing' },
    canSearch: { control: 'boolean', description: 'Adds a search filter to the dropdown list' },
    canClear: { control: 'boolean', description: 'Shows an × button to clear the selection' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof SCDropdownList>;

export const Default: Story = {
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    placeholder: 'Select a status…',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Click input to open the Mantine Combobox dropdown
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    // Options render in a Mantine portal outside canvasElement — query document.body
    const option = await within(document.body).findByText('Active');
    await expect(option).toBeVisible();
    await userEvent.click(option);
    // Input should now display the selected label
    await expect(input).toHaveValue('Active');
  },
};

export const WithValue: Story = {
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    value: STATUS_OPTIONS[0],
  },
};

export const Searchable: Story = {
  args: {
    label: 'Assign technician',
    options: GROUPED_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    canSearch: true,
    placeholder: 'Search technicians…',
  },
};

export const Clearable: Story = {
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    value: STATUS_OPTIONS[1],
    canClear: true,
  },
};

export const Grouped: Story = {
  name: 'Grouped options',
  args: {
    label: 'Assign technician',
    options: GROUPED_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    groupField: 'department',
    canSearch: true,
    placeholder: 'Select a technician…',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Priority',
    options: [
      { id: 'low', name: 'Low' },
      { id: 'medium', name: 'Medium' },
      { id: 'high', name: 'High' },
      { id: 'urgent', name: 'Urgent' },
    ],
    dataItemKey: 'id',
    textField: 'name',
    hint: 'Sets how quickly the job appears in the queue',
  },
};

export const WithError: Story = {
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    error: 'Please select a status to continue',
  },
};

export const Required: Story = {
  args: {
    label: 'Job type',
    options: [
      { id: 'install', name: 'Installation' },
      { id: 'service', name: 'Service' },
      { id: 'repair', name: 'Repair' },
    ],
    dataItemKey: 'id',
    textField: 'name',
    required: true,
    placeholder: 'Select job type…',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    value: STATUS_OPTIONS[0],
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Status',
    options: STATUS_OPTIONS,
    dataItemKey: 'id',
    textField: 'name',
    value: STATUS_OPTIONS[2],
    readOnly: true,
  },
};

export const StringOptions: Story = {
  name: 'Plain string options',
  args: {
    label: 'Country',
    options: ['Australia', 'New Zealand', 'United Kingdom', 'United States'],
    placeholder: 'Select country…',
  },
};
