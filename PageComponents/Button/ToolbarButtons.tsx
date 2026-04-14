import React, { FC, ReactElement } from "react";
import {
    ActionIcon, ActionIconProps,
    Box, Button,
    ButtonProps,
    ColorSwatch,
    ColorSwatchProps,
    Flex,
    FlexProps, Loader,
    Text,
    Tooltip
} from "@mantine/core";
import MenuButton, { MenuButtonProps } from "@/PageComponents/Button/MenuButton";
import { TablerIconsProps } from "@tabler/icons-react";
import { useViewportSize } from "@mantine/hooks";


interface ToolbarButtons {
    buttonGroups: ({
        show: boolean,
        type?: 'indicator' | 'menu' | 'button' | 'custom',
        tooltip?: string
        text?: string
        icon?: ReactElement<TablerIconsProps>
        isBusy?: boolean
        breakpoint?: number
        hideIcon?: boolean
    } & ((ButtonProps) | MenuButtonProps | ColorSwatchProps))[][]
}

const ToolbarButtons: FC<ToolbarButtons & FlexProps> = ({ buttonGroups, ...flexProps }) => {

    const { width } = useViewportSize()

    return <Flex ml={'auto'} gap={'sm'} align={'center'} wrap={'wrap'} justify={'end'} {...flexProps}>
        {
            buttonGroups.map(
                (bg, i) => bg.some(x => x.show ?? true) && <Flex key={'toolButtonGroup' + i} gap={5}>
                    {
                        bg.map(
                            ({
                                show,
                                type,
                                tooltip,
                                text,
                                icon,
                                isBusy,
                                breakpoint,
                                hideIcon,
                                ...itemProps
                            }, j) => (
                                (show ?? true) && (
                                    type === 'indicator' ?
                                        <Tooltip
                                            key={'toolbarItem' + i + '-' + j}
                                            label={tooltip || ''}
                                            disabled={!tooltip}
                                            color={'scBlue'}
                                            events={{ hover: true, focus: true, touch: true }}
                                        >
                                            <ColorSwatch
                                                component="button"
                                                onClick={() => {
                                                }}
                                                size={28}
                                                style={{ color: '#fff', cursor: 'pointer' }}
                                                {...itemProps as ColorSwatchProps}
                                            >
                                                <Text size={'xs'} fw={600}>
                                                    {text}&nbsp;
                                                    {icon && <Box pos={'absolute'} right={4} top={3}
                                                        style={{ borderRadius: '50%' }}>
                                                        {React.cloneElement(icon, { /*color: 'var(--mantine-color-yellow-7)',*/
                                                            size: 8,
                                                            stroke: 3.2, ...icon.props
                                                        })}
                                                    </Box>}
                                                </Text>

                                            </ColorSwatch>
                                        </Tooltip> :
                                        type === 'menu' ?
                                            <MenuButton
                                                key={'toolbarItem' + i + '-' + j}
                                                text={text}
                                                icon={icon && React.cloneElement(icon, { /*color: 'var(--mantine-color-yellow-7)',*/
                                                    size: 16, ...icon.props
                                                })}
                                                iconMode={typeof breakpoint === 'number' && breakpoint >= width}
                                                isBusy={isBusy}
                                                title={tooltip}
                                                {...itemProps as MenuButtonProps}
                                            /> :
                                            type === 'button' ?

                                                (!breakpoint || breakpoint < width) ?
                                                    <Button
                                                        key={'toolbarItem' + i + '-' + j}
                                                        leftSection={!hideIcon && (isBusy ?
                                                            <Loader
                                                                size={16}
                                                                color={
                                                                    (itemProps as ButtonProps).variant && (itemProps as ButtonProps).variant !== 'filled' ? 'scBlue' : 'white'
                                                                }
                                                            /> :
                                                            icon && React.cloneElement(icon, { /*color: 'var(--mantine-color-yellow-7)',*/
                                                                size: 22, ...icon.props
                                                            }))}
                                                        {...itemProps as ButtonProps}
                                                        title={tooltip}
                                                    >
                                                        {itemProps.children}
                                                        {text}
                                                    </Button> :
                                                    <Tooltip
                                                        key={'toolbarItem' + i + '-' + j}
                                                        label={text ?? (typeof itemProps.children?.[0] === 'string' ? itemProps.children[0] : '')}
                                                        disabled={!text && typeof itemProps.children?.[0] !== 'string'}
                                                        color={'scBlue'}
                                                        events={{ hover: true, focus: true, touch: true }}
                                                    >
                                                        <ActionIcon
                                                            size={'lg'}
                                                            {...itemProps as ActionIconProps}
                                                        >
                                                            {isBusy ? <Loader size={16}
                                                                color={!(itemProps as ActionIconProps).variant || (itemProps as ActionIconProps).variant === 'filled' ? 'white' : (itemProps as ActionIconProps).color ?? 'scBlue'} /> : icon}
                                                        </ActionIcon>
                                                    </Tooltip> :
                                                <>
                                                    {itemProps.children}
                                                </>
                                )
                            ))
                    }
                </Flex>
            )
        }
    </Flex>;
}

export default ToolbarButtons
