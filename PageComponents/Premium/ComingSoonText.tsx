import {FC} from "react";
import {IconCrown} from "@tabler/icons-react";
import {Box, BoxProps, Flex, FlexProps, Text} from "@mantine/core";


const ComingSoonText: FC<BoxProps> = (props: BoxProps) => {
    return <Box display={'inline-flex'} pos={'relative'} w={38} h={14} {...props}>
        <Flex align={'center'} direction={'column'} pos={'absolute'}  >
            <Text c={'scBlue.5'} fw={600} size={'9px'}>Coming Soon</Text>
        </Flex>
    </Box>
}

export default ComingSoonText