import { ActionIcon, Box, Flex, Menu, rem, Table, Text, TextInput, Tooltip } from "@mantine/core";
import styles from "@/PageComponents/SectionTable/SectionTable.module.css";
import { FC, useEffect, useMemo, useState } from "react";
import { IconDotsVertical } from "@tabler/icons";
import { IconCheck, IconEyeCheck, IconEyeOff, IconPdf, IconSum, IconSumOff, IconX } from "@tabler/icons-react";
import { useDebouncedState } from "@mantine/hooks";
import SwitchWithIcons from "@/PageComponents/Switch/SwitchWithIcons";
import helper from "@/utils/helper";


const SectionTableSectionHeading: FC<{
    group: any
    onUpdateGroup: (group: any) => void
    onClearGroup: (group: any) => void
    sectionControls: {
        name: string
        icon: any
        group: any
        label: string
        color: any
    }[]
    onSectionItem: (actionName: string, group: any) => void
    mainColumnSpan: number
    useHideLineItemsPdfSetting?: boolean,
    useDisplaySubtotalsPdfSetting?: boolean,
    canEdit?: boolean
    allowSections?: boolean
    headingSubtotal?: number
    showSubtotal?: boolean
    sectionHeaderDisplayValueFunction?: (group: any) => string | React.ReactNode
}> = (props) => {

    const [hideLineItems, setHideLineItems] = useState(props.group.hideLineItems)
    const [displaySubtotal, setDisplaySubtotal] = useState(props.group.displaySubtotal)

    const [debouncedState, setDebouncedState] = useDebouncedState(props.group.name, 2500)
    const [value, setValue] = useState(props.group.name)

    useEffect(() => {
        if (debouncedState !== props.group.name && props.group.name !== value) {
            props.onUpdateGroup({ ...props.group, name: debouncedState })
            setValue(debouncedState)
        }
    }, [debouncedState]);

    useEffect(() => {
        if (props.group.name !== value) {
            setValue(props.group.name);
            setDebouncedState(props.group.name)
        }
        if (props.group.hideLineItems !== hideLineItems) {
            setHideLineItems(props.group.hideLineItems);
        }
        if (props.group.displaySubtotal !== displaySubtotal) {
            setDisplaySubtotal(props.group.displaySubtotal);
        }
    }, [props.group]);

    const ungroup = <Menu.Item
        color="red"
        leftSection={<IconX style={{ width: rem(14), height: rem(14) }} />}
        onClick={() => props.onClearGroup(props.group)}
    >
        Ungroup Items
    </Menu.Item>

    return <>
        <Table.Td colSpan={props.mainColumnSpan - (props.showSubtotal ? 1 : 0)}>
            <Flex align={'center'} gap={5}>
                {
                    props.canEdit === false || props.allowSections === false ?
                        <Text size={'sm'} ml={10}>
                            {props.sectionHeaderDisplayValueFunction ? props.sectionHeaderDisplayValueFunction(props.group) : value}
                        </Text>
                        : <TextInput
                            // readOnly={props.canEdit === false}
                            variant="unstyled"
                            // autosize
                            // rows={1}
                            // maxRows={3}
                            value={value || ''}
                            styles={(theme, inputProps) => ({
                                root: { flexGrow: 1 },
                                input: {
                                    // width: 500,
                                    // textOverflow: 'ellipsis',
                                    // borderColor: inputProps.error ? theme.colors.yellow[7] : props.inputProps?.disabled ? 'transparent' : '',
                                    backgroundColor: inputProps.error ? 'white' : '',
                                    // color: props.stylingProps?.darkerText ? '' : 'gray',
                                    // cursor: props.inputProps?.disabled ? 'not-allowed' : props.inputProps?.loading ? 'progress' : ''
                                }
                            })}
                            placeholder={'Section Title'}
                            maxLength={400}
                            classNames={{
                                input: styles.dataInput
                            }}
                            /*onKeyPress={e => {
                                props.group.name !== value &&
                                e.code === 'Enter' && props.onUpdateGroupName(e.currentTarget.value)
                            }}*/
                            onChange={e => {
                                setValue(e.currentTarget.value)
                                setDebouncedState(e.currentTarget.value)
                            }}
                            onBlur={e =>
                                props.group.name !== value &&
                                props.onUpdateGroup({ ...props.group, name: e.currentTarget.value })
                            }
                            size={'sm'}
                            onClick={e => e.stopPropagation()}
                        // error={props.inputProps?.error}
                        // rightSection={props.inputProps?.loading ? <Loader type={'oval'} size={10} /> : undefined}
                        />
                }
            </Flex>
        </Table.Td>
        {
            props.showSubtotal && <Table.Td align="right">
                <Text style={{textOverflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'end'}} fw={'bold'} mr={10} size={'sm'} ta={'right'}>
                    {props.headingSubtotal === 0 ? '0.00' : helper.getCurrencyValue(props.headingSubtotal)}
                </Text>
            </Table.Td>
        }
        <Table.Td className={styles.actionCell} style={{ border: 'none' }}>
            <Flex align={'center'} justify={'center'} w={'100%'}>
                {
                    Array.isArray(props.sectionControls) && (
                        props.sectionControls.length > 0 || props.useDisplaySubtotalsPdfSetting || props.useHideLineItemsPdfSetting
                    ) &&
                    <Menu shadow="md" position={'right-start'}>
                    <Menu.Target>
                        <ActionIcon variant={'transparent'} size={'sm'} color={'dark.9'}
                            onClick={e => e.stopPropagation()}
                        >
                            <IconDotsVertical />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown onClick={e => e.stopPropagation()}>
                        {
                            (props.canEdit ?? true) &&
                            props.sectionControls.map(x => {
                                return x.name === 'ungroup' ? ungroup : <Menu.Item
                                    key={'sectionControl' + props.group.id + x.name}
                                    // color="red"
                                    leftSection={<x.icon style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => props.onSectionItem(x.name, props.group)}
                                    color={x.color}
                                >
                                    {x.label}
                                </Menu.Item>
                            })
                        }
                        {
                            (props.canEdit ?? true) &&
                            !props.sectionControls.some(x => x.name === 'ungroup') &&
                            ungroup
                        }
                        {
                            (props.useHideLineItemsPdfSetting || props.useDisplaySubtotalsPdfSetting) &&
                            <Box pb={5}>


                                {(props.canEdit ?? true) && <Menu.Divider />}

                                <Menu.Label>PDF Settings</Menu.Label>
                                {
                                    props.useHideLineItemsPdfSetting &&
                                    <Tooltip
                                        label={<Text size={'xs'}>Show Section Items on PDF </Text>}
                                        color={'scBlue'}
                                        openDelay={1000}
                                        closeDelay={0}
                                        events={{ hover: true, focus: true, touch: true }}
                                    >
                                        <div>
                                            <SwitchWithIcons
                                                mt={'5'}
                                                ml={10}
                                                checked={!hideLineItems}
                                                onChange={e => {
                                                    props.onUpdateGroup({
                                                        ...props.group,
                                                        hideLineItems: !e.currentTarget.checked,
                                                        // displaySubtotal: !e.currentTarget.checked ? displaySubtotal : false
                                                    })
                                                    setHideLineItems(!e.currentTarget.checked)
                                                    // !e.currentTarget.checked && setDisplaySubtotal(false)
                                                }}
                                                label={<Text size={'sm'}>Show Line Items</Text>}
                                                size={'sm'}
                                                styles={{
                                                    label: { paddingRight: 2 }
                                                }}
                                                labelPosition={'right'}
                                                onIcon={<IconEyeCheck
                                                    style={{ width: rem(12), height: rem(12) }}
                                                    color={'var(--mantine-color-scBlue-7)'}
                                                // stroke={3}
                                                />}
                                                offIcon={<IconEyeOff
                                                    style={{ width: rem(12), height: rem(12) }}
                                                    color={'var(--mantine-color-yellow-7)'}
                                                // color={'red.6'}
                                                // stroke={3}
                                                />}
                                                disabled={!(props.canEdit ?? true)}
                                            />
                                        </div>
                                    </Tooltip>
                                }
                                {
                                    props.useHideLineItemsPdfSetting && props.useDisplaySubtotalsPdfSetting && !hideLineItems &&
                                    <Tooltip
                                        label={<Text size={'xs'}>Display Subtotals on PDF </Text>}
                                        color={'scBlue'}
                                        openDelay={1000}
                                        closeDelay={0}
                                        events={{ hover: true, focus: true, touch: true }}
                                    >
                                        <div>
                                            <SwitchWithIcons
                                                mt={5}
                                                ml={10}
                                                checked={displaySubtotal}
                                                onChange={e => {
                                                    props.onUpdateGroup({
                                                        ...props.group,
                                                        displaySubtotal: e.currentTarget.checked
                                                    })
                                                    setDisplaySubtotal(e.currentTarget.checked)
                                                }}
                                                // label={<Flex h={'100%'} gap={3} align={'center'}><IconPdf  /> </Flex>}
                                                size={'sm'}
                                                styles={{
                                                    label: { paddingRight: 2 }
                                                }}
                                                label={<Text size={'sm'}>Display Subtotal</Text>}
                                                labelPosition={'right'}
                                                onIcon={<IconSum
                                                    style={{ width: rem(12), height: rem(12) }}
                                                    color={'var(--mantine-color-scBlue-7)'}
                                                // stroke={3}
                                                />}
                                                offIcon={<IconSumOff
                                                    style={{ width: rem(12), height: rem(12) }}
                                                    color={'var(--mantine-color-yellow-7)'}
                                                // color={'red.6'}
                                                // stroke={3}
                                                />}
                                                disabled={!(props.canEdit ?? true)}
                                            />
                                        </div>
                                    </Tooltip>
                                }
                            </Box>
                        }
                    </Menu.Dropdown>
                </Menu>}
            </Flex>
        </Table.Td>
    </>;


}

export default SectionTableSectionHeading