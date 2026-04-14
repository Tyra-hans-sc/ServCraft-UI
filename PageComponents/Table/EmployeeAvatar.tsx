import {Tooltip, useMantineTheme, Text, Box} from "@mantine/core"
import {FC, ReactNode, useMemo, useState} from "react";
import {scColourMapping} from "@/PageComponents/Table/table-helper";
import {IconUserOff} from "@tabler/icons";
import {IconUser} from "@tabler/icons";

const EmployeeAvatar:FC<{color?: string; name: string, size?: number, useUnassignedMode?: boolean, altIcon?: ReactNode}> = ({color, name, size, useUnassignedMode = true, altIcon}) => {

    const mantineTheme = useMantineTheme()

    const mappings = useMemo(() => (scColourMapping), [mantineTheme])

    // const [nameSplit] = useState(name && name.trim().split(' ') || '')
    const nameSplit = useMemo(() => {
        const split = name && name.trim().split(' ').filter((x, i, a) => !x.match(/^[!@#$%^&*(),.?":{}|<>]/)) || ''
        return split.length !== 0 ? split : '??'
    }, [name])

    const parsedColour = useMemo(
        () => !color ? 'var(--mantine-color-scBlue-7)' : color?.startsWith('#') ? color : mappings[color], [color]
    )
    return (name || !useUnassignedMode) && <Tooltip events={{ hover: true, focus: true, touch: true }} label={name} color={parsedColour} py={4} disabled={!name}>
            <div style={{
                // color: `${mantineTheme.fn.darken(parsedColour, .5)}`,
                // backgroundColor: `${mantineTheme.fn.lighten(parsedColour, .7)}`,
                color: `#fff`, // nice style previously used
                // color: `${!color ? mantineTheme.colors.blue[0] : mantineTheme.fn.darken(parsedColour, .5)}`, // nice style previously used
                backgroundColor: parsedColour, // legacy styles
                // backgroundColor: `${mantineTheme.fn.lighten(parsedColour, !color ? .2 : .7)}`, // nice style previously used
                minWidth: '1.4rem',
                height: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                cursor: 'default',
                transform: `scale(${size || 1})`
            }}>
                {
                    name && nameSplit && nameSplit.length > 1 &&
                    <Text size={'xs'}>
                        {nameSplit[0][0]?.toUpperCase()}{nameSplit[nameSplit.length - 1][0]?.toUpperCase()}
                    </Text> ||
                    <IconUser size={14}/>
                }
            </div>
        </Tooltip> ||
        <Tooltip events={{ hover: true, focus: true, touch: true }} color={'gray.4'} label={'Not Assigned'}>
            <Box style={(t) => (
                {
                    color: `#fff`, // nice style previously used
                    backgroundColor: t.colors.gray[4], // legacy styles
                    minWidth: '1.4rem',
                    height: '1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    cursor: 'default',
                    transform: `scale(${size || 1})`
                }
            )}>
                {altIcon ?? <IconUserOff size={14}/>}
            </Box>
        </Tooltip>
}

export default EmployeeAvatar
