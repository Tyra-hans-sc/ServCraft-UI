import {Group, rem, Text} from "@mantine/core";
import { FC, ReactNode } from "react";

const SCWidgetTitle: FC<{
    title: string | ReactNode
    leftIcon?: ReactNode
    size?: number | string
    marginBottom?: number | string
    marginTop?: number | string
    color?: string
}> = ({ title = "", leftIcon, size = 18, marginBottom = "var(--mantine-spacing-lg)", color = 'black', marginTop = 0 }) => {

    return (<>
        <Group color={color} mt={marginTop} mb={marginBottom} gap={'xs'}>
            {leftIcon}
            <Text size={typeof size === 'number' ? rem(size) : size} c={color} fw={'bolder'}>
                {title}
            </Text>
        </Group>
    </>);
};

export default SCWidgetTitle;