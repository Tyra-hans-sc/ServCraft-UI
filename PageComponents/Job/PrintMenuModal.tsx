import { FC } from "react";
import { Modal, Box, Text, UnstyledButton, Stack, Flex } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import styles from './PrintMenuModal.module.css';

interface PrintTemplate {
  text: string;
  link: string;
}

interface PrintMenuModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectTemplate: () => void;
  onSelectLabel: () => void;
  templates: PrintTemplate[];
}

const PrintMenuModal: FC<PrintMenuModalProps> = ({
  opened,
  onClose,
  onSelectTemplate,
  onSelectLabel,
  templates,
}) => {
  const displayTemplates = templates.slice(0, 3);
  const remainingCount = Math.max(0, templates.length - 3);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Flex align="center" gap="sm">
          <IconPrinter size={20} />
          <Text>Print</Text>
        </Flex>
      }
      size="md"
      centered
    >
      <Stack gap="md" p={4}>
        {/* Print Template Option */}
        <UnstyledButton
          onClick={onSelectTemplate}
          className={styles.printOption}
        >
          <Flex align="center" gap="lg">
            <Box style={{ flex: 1 }}>
              <Text size="lg" fw={600} mb="xs">
                Print template
              </Text>
              <Stack gap={2}>
                {displayTemplates.map((template, index) => (
                  <Text key={index} size="sm" c="dimmed" lineClamp={1}>
                    {template.text}
                  </Text>
                ))}
                {remainingCount > 0 && (
                  <Text size="sm" c="dimmed" fw={500}>
                    +{remainingCount} more
                  </Text>
                )}
              </Stack>
            </Box>
            <Box className={styles.iconContainer}>
              <img 
                src="/print/job-template.svg" 
                alt="Print template" 
                className={styles.svgIcon}
              />
            </Box>
          </Flex>
        </UnstyledButton>

        {/* Print Label Option */}
        <UnstyledButton
          onClick={onSelectLabel}
          className={styles.printOption}
        >
          <Flex align="center" gap="lg">
            <Box style={{ flex: 1 }}>
              <Text size="lg" fw={600} mb="xs">
                Print job label
              </Text>
              <Text size="sm" c="dimmed">
                For tagging packages or scanning jobs on-site
              </Text>
            </Box>
            <Box className={styles.iconContainer}>
              <img 
                src="/print/job-label.svg" 
                alt="Print job label" 
                className={styles.svgIcon}
              />
            </Box>
          </Flex>
        </UnstyledButton>
      </Stack>
    </Modal>
  );
};

export default PrintMenuModal;