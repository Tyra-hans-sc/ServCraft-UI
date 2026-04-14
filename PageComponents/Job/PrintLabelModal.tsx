import { FC, useState } from "react";
import { Modal, Box, Text, Group, ActionIcon, Button, Flex, NumberInput } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';

interface PrintLabelModalProps {
  opened: boolean;
  onClose: () => void;
  onBack: () => void;
  onPrint: (quantity: number) => void;
  isPrinting: boolean;
}

const PrintLabelModal: FC<PrintLabelModalProps> = ({
  opened,
  onClose,
  onBack,
  onPrint,
  isPrinting,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, 99));
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handlePrint = () => {
    console.log('PrintLabelModal: Printing', quantity, 'labels');

    if (quantity >= 1 && quantity <= 99) {
      onPrint(quantity);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Print Job Labels"
      size="sm"
      centered
    >
      <Box>
        <Text size="sm" c="dimmed" mb="lg">
          How many job labels do you want to print?
        </Text>

        <Flex justify="center" align="center" gap="md" mb="xl">
          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            onClick={handleDecrement}
            disabled={quantity <= 1 || isPrinting}
          >
            <IconMinus size={20} />
          </ActionIcon>

          <NumberInput
            value={quantity}
            onChange={(val) => {
              const newVal = Number(val);
              if (!isNaN(newVal)) {
                setQuantity(newVal);
              }
            }}
            min={1}
            max={99}
            size="md"
            w={100}
            hideControls
            styles={{
              input: {
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: 600,
              },
            }}
            disabled={isPrinting}
          />

          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            onClick={handleIncrement}
            disabled={quantity >= 99 || isPrinting}
          >
            <IconPlus size={20} />
          </ActionIcon>
        </Flex>

        <Group justify="space-between" mt="xl">
          <Button variant="subtle" onClick={onBack} disabled={isPrinting}>
            Back
          </Button>
          <Button 
            onClick={handlePrint} 
            loading={isPrinting}
            disabled={quantity < 1 || quantity > 99 || isPrinting}
          >
            {isPrinting ? 'Printing...' : 'Print Labels'}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default PrintLabelModal;