import { useAtom } from 'jotai';
import { Button, Card, Fieldset, Flex, Text } from '@mantine/core';
import { forceInitialSetupAtom } from '@/utils/atoms';

const InitialSetupConfig = () => {
  const [forceInitialSetup, setForceInitialSetup] = useAtom(forceInitialSetupAtom);

  return (
    <Card>
      <Fieldset legend="Initial Setup Configuration">
        <Flex direction="column" gap="sm">
          <Text size="sm">
            Toggle this to force the initial setup modal to appear. This is primarily for testing purposes - refresh to close.
          </Text>
          <Flex gap="sm">
            <Button 
              onClick={() => setForceInitialSetup(true)} 
              disabled={forceInitialSetup}
              color="blue.6"
            >
              Force Initial Setup
            </Button>
          </Flex>
        </Flex>
      </Fieldset>
    </Card>
  );
};

export default InitialSetupConfig;
