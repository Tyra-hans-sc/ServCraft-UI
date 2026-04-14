import { Button, Menu, Group, ActionIcon, rem, useMantineTheme } from '@mantine/core';
import { IconTrash, IconBookmark, IconCalendar, IconChevronDown } from '@tabler/icons-react';
import classes from './sc-split-button.module.css';
import { ReactNode, useMemo } from 'react';

export interface SCSplitButtonProps {
    items: SCSplitButtonItem[]
    disabled?: boolean
}

export interface SCSplitButtonItem {
    key: string
    label: string
    defaultItem?: boolean
    disabled?: boolean
    hidden?: boolean
    leftSection?: ReactNode
    rightSection?: ReactNode
    title?: string
    action?: () => void
}

export default function SCSplitButton({ items, disabled = false }: SCSplitButtonProps) {
    const theme = useMantineTheme();

    const defaultItem = useMemo(() => {
        let item = items.find(x => x.defaultItem === true && !x.hidden);
        if (!item) {
            item = items[0];
        }
        return item;
    }, [items]);

    const dropDownItems = useMemo(() => {
        let ddItems = items.filter(x => x.key !== defaultItem.key && !x.hidden);
        return ddItems;
    }, [items]);

    return (
        <Group wrap="nowrap" gap={0}>
            {defaultItem && <Button
                disabled={defaultItem.disabled || disabled}
                className={classes.button}
                onClick={defaultItem.action}
                leftSection={defaultItem.leftSection}
                rightSection={defaultItem.rightSection}
                title={defaultItem.title}
            >{defaultItem.label}
            </Button>}


            <Menu transitionProps={{ transition: 'scale-y' }} position="bottom-end" withinPortal shadow="sm">

                <Menu.Target>
                    <ActionIcon
                        aria-label="More options"
                        disabled={disabled}
                        variant="filled"
                        color={theme.primaryColor}
                        size={36}
                        className={classes.menuControl}
                    >
                        <IconChevronDown style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    </ActionIcon>
                </Menu.Target>

                {Array.isArray(dropDownItems) && dropDownItems.length > 0 && <Menu.Dropdown
                    mt={-4}
                    p={0}
                >

                    {dropDownItems.map((item, key) => {
                        return item.hidden ? <></> : <div title={item.title}><Menu.Item
                            key={key}
                            disabled={item.disabled || disabled}
                            onClick={item.action}
                            leftSection={item.leftSection}
                            rightSection={item.rightSection}
                        >
                            {item.label}
                        </Menu.Item>
                        </div>
                    })}

                    {/* 
                    <Menu.Item
                        leftSection={
                            <IconCalendar
                                style={{ width: rem(16), height: rem(16) }}
                                stroke={1.5}
                                color={theme.colors.blue[5]}
                            />
                        }
                    >
                        Schedule for later
                    </Menu.Item>
                    <Menu.Item
                        leftSection={
                            <IconBookmark
                                style={{ width: rem(16), height: rem(16) }}
                                stroke={1.5}
                                color={theme.colors.blue[5]}
                            />
                        }
                    >
                        Save draft
                    </Menu.Item>
                    <Menu.Item
                        leftSection={
                            <IconTrash
                                style={{ width: rem(16), height: rem(16) }}
                                stroke={1.5}
                                color={theme.colors.blue[5]}
                            />
                        }
                    >
                        Delete
                    </Menu.Item> */}
                </Menu.Dropdown>}


            </Menu>
        </Group>
    );
}
