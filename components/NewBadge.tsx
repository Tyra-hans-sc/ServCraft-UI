import {Badge, MantineSize, Text} from "@mantine/core";
import {FC} from "react";

const NewBadge: FC<{size?: MantineSize}> = ({size = 'lg'}) => {
    return <Badge color="yellow" size={size} radius="xs" px={6}>
        <Text fw={'bold'}>NEW</Text>
    </Badge>
}

export default NewBadge
