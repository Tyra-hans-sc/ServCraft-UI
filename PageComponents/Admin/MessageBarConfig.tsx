import { useContext, useMemo, useState } from 'react';
import { Box, Button, Card, Fieldset, Flex, Select, Text, TextInput } from '@mantine/core';
import SCMessageBarContext from '@/utils/contexts/sc-message-bar-context';
import * as Enums from '@/utils/enums';

const typeOptions = [
  { value: 'Warning', label: 'Warning' },
  { value: 'Error', label: 'Error' },
];

const MessageBarConfig = () => {
  const messageBarContext: any = useContext(SCMessageBarContext);

  const [message, setMessage] = useState('');
  const [type, setType] = useState<string>('Warning');

  const disabled = useMemo(() => !message || !type, [message, type]);

  const onShow = () => {
    if (!messageBarContext) return;
    // map selection to enum
    const enumType = type === 'Error' ? Enums.MessageBarType.Error : Enums.MessageBarType.Warning;
    messageBarContext.setMessageBarType?.(enumType);
    messageBarContext.setMessage?.(message);
    messageBarContext.setIsActive?.(true);
  };

  const onHide = () => {
    if (!messageBarContext) return;
    messageBarContext.setIsActive?.(false);
    messageBarContext.setMessage?.('');
  };

  return (
    <Card>
      <Fieldset legend="Global Message Bar">
        <Flex direction={{ base: 'column', sm: 'row' }} gap="sm" align="flex-end">
          <Box style={{ minWidth: 220 }}>
            <Select
              label="Type"
              value={type}
              onChange={(val) => setType(val || 'Warning')}
              data={typeOptions}
              allowDeselect={false}
              checkIconPosition="right"
            />
          </Box>
          <Box style={{ flex: 1, minWidth: 280 }}>
            <TextInput
              label="Message"
              placeholder="Enter message to display in the global bar"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
            />
          </Box>
          <Flex gap="sm">
            <Button onClick={onShow} disabled={disabled} color={'blue.6'}>
              Show message
            </Button>
            <Button variant="default" onClick={onHide}>
              Hide
            </Button>
          </Flex>
        </Flex>
      </Fieldset>
    </Card>
  );
};

export default MessageBarConfig;
