import {FC} from "react";
import {Box, BoxProps, Flex, Text} from "@mantine/core";


const BetaText: FC<BoxProps> = (props) => {
    return <Box display={'inline-flex'} pos={'relative'} w={23} h={14} {...props}>
        <Flex align={'center'} direction={'column'} pos={'absolute'}>
            <Text c={props.c || 'violet.7'} fw={600} size={'9px'}>BETA</Text>
        </Flex>
    </Box>
}

export default BetaText
