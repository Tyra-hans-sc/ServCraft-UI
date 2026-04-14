import {FC} from "react";
import {IconCrown} from "@tabler/icons-react";
import {Flex, Text} from "@mantine/core";


const PremiumIcon: FC = () => {
    return <Flex align={'center'} direction={'column'}>
        {/*<span style={{transform: 'scale(.7)', height: 20}}>*/}
        {/*    <DiamondIcon color={'goldenRod'} />*/}
        {/*</span>*/}
        <IconCrown size={15} color={'goldenrod'} />
        <Text c={'goldenrod'} size={'9px'}>(beta)</Text>
    </Flex>
}

export default PremiumIcon