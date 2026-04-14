import { Box, Button, Flex, Select, Textarea, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { attachmentTypeOptions } from '@/components/shared-views/attachments';
import { Attachment } from '@/interfaces/api/models';
import React, { useMemo } from "react";
import { AttachmentType } from "@/utils/enums";
import moment from "moment";

interface AttachmentFormProps {
  attachment: Attachment;
  onSubmit: (values: Partial<Attachment>) => void;
  onClose: () => void;
  readOnly?: boolean;
}

function getReadableContentType(contentType: string): string {
  const contentTypeMap = {
    'application/pdf': 'PDF Document',
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'text/plain': 'Plain Text File',
    'application/msword': 'Microsoft Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Microsoft Word Document (DOCX)',
    'application/vnd.ms-excel': 'Microsoft Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Microsoft Excel Spreadsheet (XLSX)',
    'application/vnd.ms-powerpoint': 'Microsoft PowerPoint Presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Microsoft PowerPoint Presentation (PPTX)',
    'audio/mpeg': 'MP3 Audio File',
    'video/mp4': 'MP4 Video File',
    'application/zip': 'ZIP Archive',
    'application/x-rar-compressed': 'RAR Archive'
  };

  return contentTypeMap[contentType] || contentType;
}


const AttachmentForm: React.FC<AttachmentFormProps> = ({ attachment, onSubmit, onClose, readOnly }) => {
  const form = useForm({
    initialValues: {
      AttachmentType: attachment.AttachmentType + '' || '',
      Description: attachment.Description || '',
    },
    transformValues: ({ AttachmentType, Description }) => ({
      Description: Description.trim(),
      AttachmentType: +AttachmentType
    }),
    validate: {
      AttachmentType: (value) => (!value ? 'Please specify a file type' : !value ? 'Attachment type is required' : null),
      Description: (value) =>
        !value.trim() ? 'Please provide a file description' : value.length > 200 ? 'File name must not exceed 200 characters' : null,
    },
  });

  const fileDetailsMapping = useMemo(() => ([
    {
      label: 'File Size',
      value: attachment.DisplayFileSize,
    },
    {
      label: 'Content Type',
      value: getReadableContentType(attachment.ContentType || '')
    },
    {
      label: 'Created By',
      value: attachment.CreatedBy,
    },
    {
      label: 'Created On',
      value: moment(attachment.CreatedDate).format('D MMMM, YYYY - hh:mm a'),
    }
  ]), [attachment])

  const handleSubmit = (values: Partial<Attachment>) => {
    onSubmit(values)
  };

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(handleSubmit)}
      w={500}
      maw={'100%'}
    >

      <Textarea
        label="File Name"
        placeholder="Enter file name"
        withAsterisk
        maxRows={8}
        rows={2}
        autosize
        maxLength={200}
        readOnly={readOnly}
        {...form.getInputProps('Description')}
      />

      <Select
        label="Attachment Type"
        placeholder="Select attachment type"
        data={attachmentTypeOptions}
        withAsterisk
        readOnly={readOnly}
        {...form.getInputProps('AttachmentType')}
        mt={'md'}
      />


      <Flex direction={'column'} gap={'xs'} mt={'lg'} mb={'xl'} p={'md'} style={{ border: '1px solid var(--mantine-color-gray-4)', borderRadius: 4 }}>
        {
          fileDetailsMapping.map(({ label, value }, i) => (
            <Flex key={i + label}>
              <Text size={'sm'} w={90}>{label}</Text>
              <Text c={'dimmed'} size={'sm'}>{value}</Text>
            </Flex>
          ))
        }
      </Flex>


      {readOnly !== true &&
        <Flex justify={'end'} gap={'sm'}>
          <Button type={'button'} variant={'outline'} onClick={onClose}>Cancel</Button>
          <Button type={'submit'} disabled={!form.isDirty()}>Save Changes</Button>
        </Flex>
      }

    </Box>
  );
};

export default AttachmentForm;