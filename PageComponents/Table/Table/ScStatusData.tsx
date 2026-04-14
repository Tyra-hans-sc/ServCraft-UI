import { FC, useMemo, useState, CSSProperties } from "react";
import { lighten, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { scColourMapping } from "@/PageComponents/Table/table-helper";

const ScStatusData: FC<{ value: string; color?: string; shrink?: boolean; showTooltipDelay?: number, onActionLinkClick?: () => void, extraStyles?: CSSProperties }> = ({
    value,
    color,
    shrink,
    showTooltipDelay,
    onActionLinkClick,
    extraStyles
}) => {

    // const [clr] = useState(color ?? value.substring(value.lastIndexOf(',') + 1).trim())
    // console.log(clr)
    // const [val] = useState(!!color ? value : value.substring(0, value.lastIndexOf(',')))

    const mantineTheme = useMantineTheme()

    const mappings = useMemo(() => scColourMapping, [])

    // const parsedColour = () => (!clr ? mantineTheme.colors.gray[5] : clr?.startsWith('#') ? clr : mappings[clr])

    /*const [parsedColour] = useState(
        !color ? mantineTheme.colors.gray[6] : color?.startsWith('#') ? color : mappings[color] ?? mantineTheme.colors.gray[6]
    )*/
    const parsedColour = useMemo(() => {

        if (!color) return mantineTheme.colors.gray[6];
        if (color.startsWith("#") || color.startsWith('var(--')) return color;
        let mappedColor = mappings[color];
        if (!mappedColor) mappedColor = mantineTheme.colors.gray[6];

        return mappedColor;


        //return !color ? mantineTheme.colors.gray[6] : color?.startsWith('#') ? color : mappings[color] ?? mantineTheme.colors.gray[6]
    }, [color])

    const status = useMemo(() => (
        <Text
            onClick={onActionLinkClick}
            size={'xs'}
            px={7}
            lineClamp={1}
            py={3}
            style={(theme) => ({
                // border: `.5px solid ${/*theme.colors.gray[5]*/  theme.fn.darken(parsedColour, .2)}`,
                backgroundColor: lighten(parsedColour, .8),
                color: parsedColour,// theme.fn.darken(parsedColour, .2),
                borderRadius: 5,
                // whiteSpace: 'nowrap',
                textAlign: 'center',
                wordBreak: 'break-all',
                cursor: !!onActionLinkClick ? "pointer" : "default",
                ...extraStyles
            })}
        >
            {value !== ', ' && value || 'N/A'}
        </Text>
    ), [value, parsedColour])

    return (
        typeof showTooltipDelay === 'undefined' ? status :
            <Tooltip events={{ hover: true, focus: true, touch: true }} openDelay={showTooltipDelay} color={parsedColour} label={value} disabled={!value}>
                {status}
            </Tooltip>
    )
}

export default ScStatusData
