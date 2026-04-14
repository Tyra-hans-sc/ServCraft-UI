import {useMantineTheme, Text, Avatar} from "@mantine/core"
import {FC, useMemo,} from "react";
import {scColourMapping} from "@/PageComponents/Table/table-helper";

const EmployeeAvatar:FC<{color?: string; label: string}> = ({color, label}) => {

    const mantineTheme = useMantineTheme()

    const mappings = useMemo(() => (scColourMapping), [mantineTheme])

    // const [nameSplit] = useState(name && name.trim().split(' ') || '')
    const nameSplit = useMemo(() => label && label.trim().split(' ') || '', [label])

    const parsedColour = useMemo(
        () => !color ? mantineTheme.colors.scBlue[5] : color?.startsWith('#') ? color : mappings[color], [color]
    )
    return <Avatar
        size={24} radius="xl"
        color={parsedColour}
        // bg={parsedColour + ' !important'}
    >
        <Text truncate={'end'} fw={500}>
            {label}
        </Text>
    </Avatar>

    /*<div style={{
        // color: `${mantineTheme.fn.darken(parsedColour, .5)}`,
        // backgroundColor: `${mantineTheme.fn.lighten(parsedColour, .7)}`,
        color: `#fff`, // nice style previously used
        // color: `${!color ? mantineTheme.colors.blue[0] : mantineTheme.fn.darken(parsedColour, .5)}`, // nice style previously used
        backgroundColor: mantineTheme.fn.lighten(parsedColour, .1), // legacy styles
        // backgroundColor: `${mantineTheme.fn.lighten(parsedColour, !color ? .2 : .7)}`, // nice style previously used
        minWidth: '1.4rem',
        height: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        cursor: 'default',
    }}>
        <Text truncate={'end'} fw={700}>
            {label}
        </Text>
    </div>*/
    /*
    *
    *
    <Avatar
        size={24} radius="xl"
        color={color}
        bg={parsedColour + ' !important'}
    >
        <Text truncate={'end'} fw={700}>
            {label}
        </Text>
    </Avatar>
    *
    * */
}

export default EmployeeAvatar
