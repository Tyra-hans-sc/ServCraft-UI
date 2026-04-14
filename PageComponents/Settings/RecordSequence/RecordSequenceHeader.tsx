import { Box, Text, Title } from "@mantine/core";
import { FC } from "react";

const RecordSequenceHeader: FC = () => {
    return (
        <Box>
            {/* Main heading */}
            <Title order={3} c={'scBlue.8'} mt={'sm'}>Prefix and Numbering settings</Title>
            {/* Subheading */}
            <Text size={'sm'} mb={'md'}>
                Control how your record numbers are generated
            </Text>
        </Box>
    );
}

export default RecordSequenceHeader;
