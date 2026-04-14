import { ActionIcon, Button, Loader, Menu, Tooltip } from "@mantine/core";
import React, { FC, PropsWithChildren, ReactNode, useRef, useState } from "react";
import { IconCaretDownFilled } from "@tabler/icons-react";
import Link from "next/link";

export type MenuOptionItem = {
    link: string;
    text: string;
    disabled?: boolean;
    tooltip?: string;
}

export type GroupedMenuOption = {
    label?: string;
    items: MenuOptionItem[];
}

export type MenuButtonProps = PropsWithChildren<{
    extraClasses?: string, /*"wide-print"*/
    title?: string, /*{applicableDocuments.length === 0 ? "Documents not available" : ""}*/
    disabled?: boolean, /*{applicableDocuments.length === 0}*/
    text?: string, /*"Print"*/
    action?: (href: string) => void, /*{(link) => exportDocument(link)}*/
    legacyOptions?: MenuOptionItem[], /*{applicableDocuments}*/
    groupedOptions?: GroupedMenuOption[],
    isBusy?: boolean, /*{isGenerating}*/
    legacyHeightAndMargin?: boolean
    iconMode?: boolean
    icon?: ReactNode
}>

const MenuButton: FC<MenuButtonProps> = (props) => {


    const [open, setOpen] = useState(false)

    return <>
        <Menu
            shadow="md"
            opened={open}
            onChange={setOpen}
        >
            <Menu.Target>
                <Tooltip label={props.title || (props.iconMode ? props.text : '')} disabled={!props.title && !props.iconMode} color={'scBlue'}
                    events={{ hover: true, focus: !!props.iconMode, touch: !!props.iconMode }}
                >
                    {
                        props.iconMode ?
                            <ActionIcon size={'lg'}>
                                {props.isBusy ? <Loader size={16} color={'gray.0'} /> : props.icon}
                            </ActionIcon>
                            :
                            <Button
                                styles={{
                                    root: props.legacyHeightAndMargin ? {
                                        height: 40,
                                        marginLeft: '.5rem'
                                    } : {}
                                }}
                                c={'white'}
                                className={props.extraClasses}
                                rightSection={props.isBusy ? <Loader size={16} color={'gray.0'} /> :
                                    <IconCaretDownFilled
                                        size={12}
                                        style={{
                                            rotate: open ? '-90deg' : '0deg',
                                            transition: '200ms ease-in-out'
                                        }}
                                    />
                                }
                            >
                                {
                                    props.text
                                }
                            </Button>
                    }
                </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
                {props.legacyOptions?.map((x, i) => (
                    props.action ?
                        <Menu.Item style={{cursor: x.disabled ? "not-allowed" : "initial"}} opacity={x.disabled ? 0.4 : 1} title={x.tooltip} key={x.text + i} onClick={(e) => !x.disabled && props.action && props.action(x.link)}>
                            {x.text}
                        </Menu.Item> : (
                            <Link key={'link' + x.text + i} href={x.link} style={{ textDecoration: 'none' }}>
                                <Menu.Item key={x.text + i}>
                                    {x.text}
                                </Menu.Item>
                            </Link>
                        )
                ))}
                {props.groupedOptions?.map((group, gi) => (
                    <React.Fragment key={'grp-' + gi}>
                        {gi > 0 && <Menu.Divider />}
                        {group.label && <Menu.Label>{group.label}</Menu.Label>}
                        {group.items.map((x, i) => (
                            props.action ?
                                <Menu.Item style={{ cursor: x.disabled ? "not-allowed" : "initial" }} opacity={x.disabled ? 0.4 : 1} title={x.tooltip} key={x.text + i} onClick={() => !x.disabled && props.action && props.action(x.link)}>
                                    {x.text}
                                </Menu.Item> : (
                                    <Link key={'link' + x.text + i} href={x.link} style={{ textDecoration: 'none' }}>
                                        <Menu.Item key={x.text + i}>
                                            {x.text}
                                        </Menu.Item>
                                    </Link>
                                )
                        ))}
                    </React.Fragment>
                ))}
                {props.children}
            </Menu.Dropdown>
        </Menu>
    </>;
}

export default MenuButton
