import React, {FC, ReactNode} from "react";
import {rem, Switch, SwitchProps} from "@mantine/core";
import {IconCheck, IconX} from "@tabler/icons-react";


const SwitchWithIcons: FC<SwitchProps & {onIcon?: ReactNode; offIcon?: ReactNode}> = (props) => {


    return <>
        <Switch
            color="scBlue.1"
            // size="sm"
            thumbIcon={
                props.checked ? (
                    props.onIcon ||
                    <IconCheck
                        style={{ width: rem(12), height: rem(12) }}
                        color={'var(--mantine-color-scBlue-7)'}
                        // stroke={3}
                    />
                ) : (
                    props.offIcon ||
                    <IconX
                        style={{ width: rem(12), height: rem(12) }}
                        color={'var(--mantine-color-yellow-7)'}
                        // color={'red.6'}
                        // stroke={3}
                    />
                )
            }
            {...props}
            styles={{
                track: {width: 25},
                ...props.styles
            }}
        />
    </>
}

export default SwitchWithIcons