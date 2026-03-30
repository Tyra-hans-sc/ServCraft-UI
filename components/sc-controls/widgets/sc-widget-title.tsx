import { Group, Text } from "@mantine/core";
import { FC, ReactNode } from "react";

const SCWidgetTitle: FC<{
    title: string
    leftIcon?: ReactNode
}> = ({ title = "", leftIcon }) => {

    return (<>
        <Group color={'scBlue'} mb={'var(--mantine-spacing-lg)'} gap={'xs'}>
            {leftIcon}
            <Text size={'lg'} color={'scBlue'} fw={'bolder'}>
                {title}
            </Text>
        </Group>
    </>);
};

export default SCWidgetTitle;