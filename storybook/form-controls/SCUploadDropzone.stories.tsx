import type { Meta, StoryObj } from '@storybook/react';
import SCUploadDropzone from '../../components/sc-controls/form-controls/sc-upload-dropzone';

/**
 * SCUploadDropzone is a drag-and-drop file upload area. It accepts a file type
 * hint and optional note, and fires `onChange` when files are selected.
 *
 * **Props:**
 * - `hint` — primary instruction text (e.g. "Upload a photo")
 * - `note` — secondary note (e.g. file size limits)
 * - `multiple` — allow selecting multiple files (default: `false`)
 * - `uploading` — shows a loading state
 * - `onChange` — called with the file input event
 * - `onDelete` — called when the uploaded file is removed
 *
 * **Variants:** Default · With note · Uploading · Multiple files
 */
const meta: Meta<any> = {
  title: 'Form Controls/SCUploadDropzone',
  component: SCUploadDropzone,
  tags: ['autodocs'],
  argTypes: {
    hint: { control: 'text', description: 'Primary instruction text inside the drop zone' },
    note: { control: 'text', description: 'Secondary note (e.g. file type or size limits)' },
    multiple: { control: 'boolean', description: 'Allow multiple file selection' },
    uploading: { control: 'boolean', description: 'Shows a loading/uploading state' },
    onChange: { action: 'file-selected' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    hint: 'Upload a photo',
  },
};

export const WithNote: Story = {
  name: 'With note',
  args: {
    hint: 'Upload attachment',
    note: 'Accepted formats: JPG, PNG, PDF · Max 10 MB',
  },
};

export const Multiple: Story = {
  args: {
    hint: 'Upload files',
    note: 'You can select multiple files',
    multiple: true,
  },
};

export const Uploading: Story = {
  args: {
    hint: 'Upload attachment',
    uploading: true,
  },
};
