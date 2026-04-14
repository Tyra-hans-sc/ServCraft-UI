import { FC } from "react";
import { Modal, Box, Text, Group, ActionIcon, Button, Stack, Divider } from '@mantine/core';
import { IconEye, IconPrinter } from '@tabler/icons-react';

interface PrintTemplate {
  text: string;
  link: string;
}

interface PrintTemplateModalProps {
  opened: boolean;
  onClose: () => void;
  onBack: () => void;
  templates: PrintTemplate[];
  onPrint: (link: string) => void;
  onPreview: (link: string) => void;
  isPrinting: boolean;
}

const PrintTemplateModal: FC<PrintTemplateModalProps> = ({
  opened,
  onClose,
  onBack,
  templates,
  onPrint,
  onPreview,
  isPrinting,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select Document"
      size="md"
      centered
    >
      <Stack gap="xs">
        {templates.map((template, index) => (
          <Box key={index}>
            <Group
              justify="space-between"
              p="md"
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 'var(--mantine-radius-md)',
                transition: 'all 0.2s ease',
              }}
              className="hover-card"
            >
              <Text size="sm" fw={500}>
                {template.text}
              </Text>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color="scBlue"
                  onClick={() => onPreview(template.link)}
                  disabled={isPrinting}
                  title="Preview in browser"
                >
                  <IconEye size={18} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="scBlue"
                  onClick={() => onPrint(template.link)}
                  disabled={isPrinting}
                  title="Print"
                >
                  <IconPrinter size={18} />
                </ActionIcon>
              </Group>
            </Group>
          </Box>
        ))}
      </Stack>

      <Divider my="md" />

      <Group justify="space-between">
        <Button variant="subtle" onClick={onBack}>
          Back
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </Group>

      <style jsx>{`
        :global(.hover-card:hover) {
          background-color: var(--mantine-color-scBlue-0);
          border-color: var(--mantine-color-scBlue-7) !important;
        }
      `}</style>
    </Modal>
  );
};

export default PrintTemplateModal;