'use client';
import {FC, useEffect, useMemo, useRef, useState} from "react";
import {
    Box,
    CloseButton, ColorSwatch,
    Combobox, darken, Divider, Flex, lighten, Loader, Pill, PillsInput, PillsInputProps, rem,
    ScrollArea, Text, useCombobox, useMantineTheme,
} from "@mantine/core";
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import { scColourMapping } from "../table-helper";
import {ScFilterOptionMultiselectProps} from "@/PageComponents/Table/table-model";
import { shadows } from "@/theme";

/*const Value = ({
                   value,
                   label,
                   onRemove,
                   classNames,
                   color,
                   useInitials,
                   ...others
               }: any & { value: string; useInitials: boolean }) => {

    const mantineTheme = useMantineTheme()

    const mappings = useMemo(() => (scColourMapping), [])

    const [parsedColour] = useState(!color ? mantineTheme.colors.gray[5] : color?.startsWith('#') ? color : mappings[color]
    )
    return (
        <Box {...others}>
            <Box
                style={(theme) => ({
                    display: 'flex',
                    cursor: 'default',
                    alignItems: 'center',
                    color: darken(parsedColour, .2),
                    backgroundColor: lighten(parsedColour, .8),
                    border: `${rem(1)} solid ${
                            parsedColour // theme.fn.darken(parsedColour, .2)
                    }`,
                    paddingLeft: theme.spacing.sm,
                    borderRadius: theme.radius.sm,
                    ...(useInitials && {
                        color: darken(parsedColour, .3),
                        backgroundColor: theme.colors.gray[1],
                        border: `${rem(1)} solid ${darken(theme.colors.gray[1], .2)}`,
                        paddingLeft: 3,
                    })
                })}
            >
                <Flex align={'center'} justify={'start'} gap={5} >
                    {useInitials && <EmployeeAvatar color={color} name={label} size={.8}/>}
                    <Box style={{lineHeight: 1, fontSize: rem(12)}}>{label}</Box>
                </Flex>
                <CloseButton
                    onMouseDown={onRemove}
                    variant={'transparent'}
                    size={22}
                    iconSize={14}
                    tabIndex={-1}
                    style={{color: 'inherit'}}
                />
            </Box>
        </Box>
    )
}

const Item = forwardRef<HTMLDivElement, SelectItemProps & {useInitials: boolean; enabled: boolean | undefined}>(
    ({ label, value, color, useInitials, enabled = true, ...others }, ref
    ) => {
        return (
            <Box ref={ref} {...others} >
                <Flex align="center" gap={5}>
                    {
                        useInitials && typeof label === 'string' ? <EmployeeAvatar name={label} color={color}/> :
                            color && <ColorSwatch key={color} color={color} size={12} mr={3}/>
                    }
                    {useInitials }
                    <Text color={!enabled ? 'dimmed' : ''} miw={'max-content'}>{label} {!enabled && '(disabled)'}</Text>
                </Flex>
            </Box>
        )
    })*/

interface ScFilterDataOption {
    value: string;
    enabled?: boolean;
    label: string;
    group?: string | undefined;
    useInitials?: boolean | undefined;
    color?: string | undefined;
}

const ScFilterMultiselect: FC<{
    formVal: string[];
    data: ScFilterDataOption[];
    searchPlaceholder: string;
    onClear: () => void;
    onChange: (newVal: string[]) => void;
    // onChange: (string[]) => void;
    isLoading: boolean;
    filterMetaData: ScFilterOptionMultiselectProps;
    onUnassignedChange: (unassigned: boolean) => void;
    initialUnassignedValue: boolean;
    singleSelectMode?: boolean
} & PillsInputProps> =
    ({formVal, onClear, onChange, isLoading, data, searchPlaceholder,
         filterMetaData, onUnassignedChange, initialUnassignedValue, singleSelectMode,
         ...pillprops}) => {

        const theme = useMantineTheme();

        const pillInputFieldRef = useRef<HTMLInputElement>(null)
        const viewportRef = useRef<HTMLDivElement>(null);

        const combobox = useCombobox({
            onDropdownClose: () => combobox.resetSelectedOption(),
            onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
        });

        const [search, setSearch] = useState('');
        const [value, setValue] = useState<string[]>([]);

        const [unassigned, setUnassigned] = useState(initialUnassignedValue);
        useEffect(() => {
            if(initialUnassignedValue !== unassigned) {
                setUnassigned(initialUnassignedValue)
            }
        }, [initialUnassignedValue]);

        const handleValueSelect = (val: string) => {
            if(singleSelectMode) {
               combobox.closeDropdown()
            }
            if(val === 'unassigned') {
                setUnassigned(true)
                onUnassignedChange(true)
            } else {
                setValue((current) => {
                        const newVal = current?.includes(val) ? current?.filter((v) => v !== val) : [...current, val]
                        onChange(newVal)
                        setSearch('')
                        return newVal
                    }
                )
            }
        };

        const handleValueRemove = (val: string) =>
            setValue((current) => {
                    const newVal = current.filter((v) => v !== val)
                    onChange(newVal)
                    return newVal
                }
            );

        const handleClear = () => {
            setValue([])
            setSearch('')
            setUnassigned(false)
            onUnassignedChange(false)
            onChange([])
        }

        useEffect(() => {
            setValue(formVal)
        }, [formVal]);

        const values = data.filter(item => value?.includes(item.value)).map((item) => {

            const parsedColour = !item.color ? theme.colors.gray[5] : (item.color?.startsWith('#') || item.color?.startsWith('var(--')) ? item.color : scColourMapping[item.color]

            return (
                /*<Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
                    {item}
                </Pill>*/
                <Box
                    key={item.value}
                    style={(theme) => ({
                        display: 'flex',
                        cursor: 'default',
                        alignItems: 'center',
                        color: darken(parsedColour || 'scBlue', .2),
                        backgroundColor: lighten(parsedColour || 'scBlue', .8),
                        border: `${rem(1)} solid ${
                            parsedColour // theme.fn.darken(parsedColour, .2)
                        }`,
                        // paddingLeft: theme.spacing.sm,
                        borderRadius: theme.radius.sm,
                        paddingLeft: 5,
                        ...(item.useInitials && {
                            color: darken(parsedColour, .3),
                            backgroundColor: theme.colors.gray[1],
                            border: `${rem(1)} solid ${darken(theme.colors.gray[1], .2)}`,
                        })
                    })}
                >
                    <Flex align={'center'} justify={'start'} gap={5}>
                        {item.useInitials && <EmployeeAvatar color={item.color} name={item.label} size={.8}/>}
                        <Box style={{lineHeight: 1, fontSize: rem(12)}}>{item.label}</Box>
                    </Flex>
                    <CloseButton
                        onMouseDown={() => handleValueRemove(item.value)}
                        variant={'transparent'}
                        size={22}
                        iconSize={14}
                        tabIndex={-1}
                        style={{color: 'inherit'}}
                    />
                </Box>

            )
        });

        const options = useMemo(() => {
            const noGroup = 'xxx-default-xxx'

            const groups: { [key: string]: ScFilterDataOption[] } = {
                [noGroup]: []
            }

            data.forEach((item) => {
                if (!value?.includes(item.value) && item.label.toLowerCase().includes(search.trim().toLowerCase())) {
                    let group = groups[item.group || noGroup]
                    if (group) {
                        group.push(item)
                    } else {
                        groups[item.group || noGroup] = [item]
                    }
                }
            })

            return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(
                ([groupName, items], i) => (
                    /*groupName !== noGroup && */<Combobox.Group label={groupName !== noGroup ? groupName : ''}
                                                                 key={'groupItem' + i + groupName}
                    >
                        {
                            items.map(
                                (item) => (
                                    <Combobox.Option value={item.value} key={item.value}
                                                     active={value?.includes(item.value)}>
                                        <Flex align="center" gap={5}>
                                            {
                                                item.useInitials && typeof item.label === 'string' ?
                                                    <EmployeeAvatar name={item.label} color={item.color}/> :
                                                    item.color &&
                                                    <ColorSwatch key={item.color} color={item.color} size={12} mr={3}/>
                                            }
                                            {item.useInitials}
                                            <Text size={'sm'} truncate={'end'} c={!item.enabled ? 'dimmed' : ''}
                                                // miw={'max-content'}
                                            >
                                                {item.label} {!item.enabled && '(disabled)'}
                                            </Text>
                                        </Flex>
                                    </Combobox.Option>
                                )
                            )
                        }
                    </Combobox.Group>
                )
            )
        }, [value, search, data])

        return (
            <>
                <Combobox store={combobox} onOptionSubmit={handleValueSelect}
                          shadow={'md'}
                          withinPortal
                >
                    <Combobox.DropdownTarget>
                        <PillsInput
                            onClick={() => combobox.openDropdown()}
                            {...pillprops}
                            rightSection={
                                <Box onClick={() => pillInputFieldRef.current?.focus()}>
                                    {
                                        (value?.length === 0 && !search && !unassigned) ? (
                                                isLoading ? <Loader size={14}/> : <Combobox.Chevron />
                                            ) :
                                            <CloseButton
                                                size={'sm'}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleClear()
                                                }}
                                            />
                                    }
                                </Box>
                            }
                        >
                            <ScrollArea.Autosize
                                style={{overflowX: 'hidden'}}
                                mah={215}
                                variant={'show'}
                                type={'auto'}
                            >
                                <Pill.Group>
                                    {
                                        unassigned && (
                                            <Box
                                                style={(theme) => ({
                                                    display: 'flex',
                                                    cursor: 'default',
                                                    alignItems: 'center',
                                                    color: 'var(--mantine-color-gray-6)',
                                                    border: `${rem(1)} dotted var(--mantine-color-gray-5)`,
                                                    // paddingLeft: theme.spacing.sm,
                                                    borderRadius: theme.radius.sm,
                                                    paddingLeft: 5,
                                                    // backgroundColor: `var(--mantine-color-gray-1)`,
                                                    backgroundColor: lighten(`var(--mantine-color-gray-1)`, .8),
                                                    /*...(item.useInitials && {
                                                        color: darken(parsedColour, .3),
                                                        backgroundColor: theme.colors.gray[1],
                                                        border: `${rem(1)} solid ${darken(theme.colors.gray[1], .2)}`,
                                                    })*/
                                                })}
                                            >
                                                <Flex align={'center'} justify={'start'} gap={5}>
                                                    {<EmployeeAvatar color={''} name={''} size={.8} altIcon={filterMetaData.unassignedOptionMeta?.icon} />}
                                                    <Box style={{lineHeight: 1, fontSize: rem(12)}}>{filterMetaData.unassignedOptionMeta?.label || 'Unassigned'}</Box>
                                                </Flex>
                                                <CloseButton
                                                    onMouseDown={() => {
                                                        setUnassigned(false)
                                                        onUnassignedChange(false)
                                                    }}
                                                    variant={'transparent'}
                                                    size={22}
                                                    iconSize={14}
                                                    tabIndex={-1}
                                                    style={{color: 'inherit'}}
                                                />
                                            </Box>
                                        )
                                    }
                                    {values}
                                    <Combobox.EventsTarget>
                                        <PillsInput.Field
                                            miw={10}
                                            ref={pillInputFieldRef}
                                            onFocus={() => combobox.openDropdown()}
                                            onBlur={() => combobox.closeDropdown()}
                                            value={search}
                                            placeholder={values?.length === 0 ? searchPlaceholder : undefined}
                                            onChange={(event) => {
                                                combobox.updateSelectedOptionIndex();
                                                setSearch(event.currentTarget.value);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Backspace' && search.length === 0) {
                                                    event.preventDefault();
                                                    handleValueRemove(value[value.length - 1]);
                                                }
                                            }}
                                        />
                                    </Combobox.EventsTarget>
                                </Pill.Group>
                            </ScrollArea.Autosize>
                        </PillsInput>
                    </Combobox.DropdownTarget>

                    <Combobox.Dropdown style={{boxShadow: shadows.combobox}}>
                        <Combobox.Options>
                            <ScrollArea
                                // offsetScrollbars
                                type="auto"
                                h={data.length > 11 ? {base: 200, sm: 300, md: 350} : '100%'}
                                viewportRef={viewportRef}
                                // w={(ref.current?.offsetWidth || 350) - 12 + 'px'}
                            >
                                {
                                    (filterMetaData.unassignedOptionMeta?.label ?? 'unassigned').includes(search.trim().toLowerCase()) && !unassigned && !!filterMetaData.unassignedOption && <>
                                        <Combobox.Option value={'unassigned'} >
                                            <Flex align="center" gap={5}>
                                                <EmployeeAvatar name={''} color={''} altIcon={filterMetaData.unassignedOptionMeta?.icon}/>
                                                <Text size={'sm'} truncate={'end'} c={''}
                                                    // miw={'max-content'}
                                                >
                                                    {filterMetaData.unassignedOptionMeta?.label || 'Unassigned'}
                                                </Text>
                                            </Flex>
                                        </Combobox.Option>
                                        <Divider color={'gray.2'} my={0} />
                                    </>
                                }
                                {options.length > 0 ? options :
                                    <Combobox.Empty>{isLoading ? 'Loading...' : 'Nothing found...'}</Combobox.Empty>}
                            </ScrollArea>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
                {/*<MultiSelect
            ref={ref}
            // itemComponent={Item}
            // valueComponent={Value}
            rightSection={
                rightSection
            }
            searchable
            maxDropdownHeight={400}
            nothingFoundMessage={'no data'}
            {...multiSelectProps}
            data={['test', '111']}
            styles={{
                input: {
                    paddingRight: '3rem',
                    // width: !multiSelectProps.value || multiSelectProps.value.length === 0 ? 165 : ''
                },
                dropdown: {
                    width: 'max-content !important',
                    minWidth: `${ref.current?.parentElement?.parentElement?.offsetWidth || 300}px !important`,
                    maxWidth: `350px !important`,
                }
            }}
        />*/}
            </>)
    }

export default ScFilterMultiselect
