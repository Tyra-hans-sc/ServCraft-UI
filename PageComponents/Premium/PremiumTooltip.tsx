import {Flex, Tooltip} from "@mantine/core";
import {FC, PropsWithChildren} from "react";
import {IconCrown} from "@tabler/icons-react";

const PremiumTooltip: FC<PropsWithChildren> = (props) => {

    return <Tooltip events={{ hover: true, focus: true, touch: true }} color={'goldenrod'} openDelay={300} label={<span>
                     <Flex align={'center'}> Exclusive sneak peek at this early <IconCrown size={12} style={{marginInline: 5}}/> premium feature. </Flex>
                    <Flex align={'center'} style={{fontSize: 10}} mt={5}>
                      Additional licensing will be required to access this feature in the future
                    </Flex>
                </span>}>
        {props.children}
    </Tooltip>
}

export default PremiumTooltip
