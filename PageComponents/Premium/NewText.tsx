import {FC} from "react";
import {IconCrown} from "@tabler/icons-react";
import {Box, BoxProps, Flex, FlexProps, Text} from "@mantine/core";


const NewText: FC<BoxProps> = (props: BoxProps) => {
    return <Box display={'inline-flex'} pos={'relative'} w={14} h={14} {...props}>
        <Flex align={'center'} direction={'column'} pos={'absolute'}>
            <Text c={'goldenrod'} fw={600} size={'8px'}>NEW</Text>
        </Flex>
    </Box>
}

export default NewText