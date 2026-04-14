import {FC} from "react";
import {IconCrown} from "@tabler/icons-react";
import {Box, BoxProps, Flex, FlexProps, Text} from "@mantine/core";


const PremiumNewIcon: FC<BoxProps> = (props: BoxProps) => {
    return <Box pos={'relative'} w={16} h={16} bottom={4} {...props}>
        <Flex align={'center'} direction={'column'} pos={'absolute'}>
            {/*<span style={{transform: 'scale(.7)', height: 20}}>*/}
            {/*    <DiamondIcon color={'goldenRod'} />*/}
            {/*</span>*/}
            <IconCrown size={15} color={'goldenrod'} />
            <Text c={'goldenrod'} fw={600} size={'8px'}>NEW</Text>
        </Flex>
    </Box>
}

export default PremiumNewIcon