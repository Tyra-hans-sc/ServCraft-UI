import { Box, Flex, Text } from "@mantine/core";
import { IconBulb } from "@tabler/icons-react";
import { FC } from "react";

const RecordSequenceHint: FC = () => {
    return (
        <Box
            p={'md'}
            style={{
                backgroundColor: 'var(--mantine-color-blue-0)',
                borderRadius: '8px',
                border: '1px solid var(--mantine-color-blue-2)'
            }}
        >
            <Flex align={'center'} gap={'xs'} mb={'sm'}>
                <IconBulb size={20} color={'var(--mantine-color-scBlue-6)'} />
                <Text fw={600} c={'scBlue.6'}>Hint</Text>
            </Flex>

            <Box pl={'xs'}>
                <Text size={'sm'} component="ul" style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>If you choose a number lower than your existing sequence, the next record number may shift and increment past earlier numbers.</li>
                    <li>To use leading zeros, include a whole number before them. (e.g. 10000xxx).</li>
                </Text>
            </Box>
        </Box>
    );
}

export default RecordSequenceHint;
