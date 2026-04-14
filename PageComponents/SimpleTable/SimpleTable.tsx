import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
    ActionIcon,
    Anchor,
    Box,
    Button,
    Drawer,
    Flex,
    Loader,
    NumberInputProps,
    Table,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import styles from './SimpleTable.module.css';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import SimpleTableRow from "@/PageComponents/SimpleTable/SimpleTableRow";
import {ColumnMappingData, TableAction, TableActionStates } from "@/PageComponents/Table/table-model";
import { IconPlus } from "@tabler/icons";
import userConfigService from "@/services/option/user-config-service";
import {IconArrowUp, IconDots, IconDotsVertical, IconLayoutColumns } from "@tabler/icons-react";
import ScColCheckbox from "../Table/Table Columns/ScColCheckbox";
import {useIntersection} from "@mantine/hooks";

export interface SimpleColumnMapping {
    key: string;
    keyFunction?: (item: any) => string;
    colorKey?: string;
    colorFunction?: (item: any) => string | undefined;
    // function to obtain a value or nested value - otherwise use key
    valueFunction?: (item: any) => string | null | ReactNode;
    label: string | ReactNode;
    type?: 'status' | 'numberInput' | 'textInput' | 'textArea' | 'checkInput' | 'selectInput' | 'stockItemType';
    typeFunction?: (item: any) => 'status' | 'numberInput' | 'textInput' | 'textArea' | 'checkInput' | 'selectInput' | undefined;
    selectOptions?: { value: string; label: string }[]
    // set this for check inputs to show the opposite to use with opposite labels  - only visual effect, the values emitted on change will not change
    inverseDepictedValue?: boolean;
    // link action emits action event when item is clicked - item will be styled as a link
    linkAction?: string;
    // Minimum value for number inputs. Can be a fixed number or computed per row item.
    min?: number | ((item: any) => number);
    // Optional custom validator: return a string message to indicate invalid, or null when valid
    validationFunction?: (item: any, value: any) => string | null;
    tooltip?: string;
    linkHrefFunction?: (x: any) => string
    // get the placeholder for a given input
    placeholderFunction?: (x: any) => string
    // max length limits characters on inputs
    maxLength?: number
    hintIcon?: (item) => { icon: ReactNode; text: string } | null
    inputProps?: {
        disabled?: boolean,
        disabledFunction?: (item: any) => boolean | undefined,
        loading?: boolean,
        error?: string | null,
        readOnly?: boolean,
        max?: number,
        width?: number
    },
    numberInputProps?: NumberInputProps
    customNumberProps?: {
        focusOnSelect?: boolean;
    }
    currencyValue?: boolean
    alignRight?: boolean
    alignCenter?: boolean
    stylingProps?: {
        compact?: boolean
        rows?: boolean
        darkerText?: boolean,
        miw?: string | number,
    }
    hide?: boolean
    showFunction?: (item: any) => boolean
    columnWidth?: number | string
    minColumnWidth?: number | string
    maxColumnWidth?: number | string
    rowLimit?: number | false
    required?: boolean,
    requiredFunction?: (item: any) => boolean,
    columConfigOptions?: {
        allowShowToggle: boolean
        allowReorder?: boolean
        defaultShown?: boolean
        disabled?: boolean
    }
    sortable?: boolean
}
export type SimpleVal = number | string | { color?: null | string; value: null | string }
export interface SimpleData { [key: string]: SimpleVal | any }

export interface ColumnDisplayMetaData {
    hiddenColumnKeys: string[]
}

/*export interface ActionControls {
    color?: 'blue' | 'yellow'
    icon: ReactNode
    name: string
    enabled?: boolean
    label: string
}*/

export interface SortProps {
    SortExpression: string;
    SortDirection: 'ascending' | 'descending' | '';
}

const SimpleTable: FC<{
    data: SimpleData[]
    mapping: SimpleColumnMapping[]
    showTotals?: boolean
    footerRow?: (string | number | ReactNode)[]
    height?: any
    width?: any
    minHeight?: any
    onItemClicked?: (item: any, column: string) => void
    onReorder?: (newItems: any[]) => void
    onReorderIndex?: (event: any, previousIndex: number, nextIndex: number) => void
    uniqueIdKey?: string
    onAction?: (actionName: string, actionItem: any, actionItemIndex: number) => void
    canEdit?: boolean
    controls?: TableAction[]
    stylingProps?: {
        compact?: boolean
        rows?: boolean
        darkerText?: boolean
        rowBorders?: boolean
    }
    onInputChange?: (name: string, item: any, value: number | '') => void
    addButton?: {
        label: string
        callback?: () => void
        customComponent?: ReactNode
    }
    tableActionStates?: TableActionStates
    showControlsOnHover?: boolean
    // specify input props for specific items
    tableItemInputMetadataByKeyName?: {
        [itemID: string]: { [itemValueKeyName: string]: { disabled: boolean; loading: boolean; error?: string | null } }
    }
    // this creates a first column with width 50px, used to align cost and materials table columns because materials are sortable
    firstColumnOffset?: boolean
    // onConfirmInputUpdate?: (item: any) => void
    columnDisplaySettings?: {
        configurationType: number // enums.configurationtype
        configurationSection: number // enums.configurationsection
        metaDataKey: string // make sure it is unique
    }
    title?: ReactNode
    cellVAlign?: "top" | "bottom" | "baseline" | "middle"
    onLoadMore?: () => void
    isLoading?: boolean
    hasMore?: boolean
    onSort?: (sortProps: SortProps) => void
    initialSort?: SortProps
    tableRef?: any
    userColumnConfig?: ColumnMappingData[]
}> = (props) => {

    const iconSize = 18;
    const [uKey] = useState(props.uniqueIdKey || 'ID')

    const [activeId, setActiveId] = useState(null);
    const [sort, setSort] = useState<SortProps>(props.initialSort || { SortExpression: '', SortDirection: '' });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [orderedData, setOrderedData] = useState(props.data)
    useEffect(() => {
        // console.log('data updated', props.data)
        setOrderedData(props.data)
    }, [props.data]);

    //#region columnDisplaySettings

    const [showColumns, setShowColumns] = useState(false);
    const [userConfigColumnDisplaySettings, setUserConfigColumnDisplaySettings] = useState<any>();
    const [columnDisplayMetaData, setColumnDisplayMetaData] = useState<ColumnDisplayMetaData>({ hiddenColumnKeys: [] });
    // const [userColMappingConfig, setUserColMappingConfig] = useState<ColumnMappingData[]>(props.userColumnConfig ?? []);

    // useEffect(() => {
    //     setUserColMappingConfig(props.userColumnConfig ?? []);
    // }, [props.userColumnConfig]);

    const initialColumnDisplaySettings = useRef<any>();
    useEffect(() => {
        if (!props.columnDisplaySettings || JSON.stringify(initialColumnDisplaySettings.current) === JSON.stringify(props.columnDisplaySettings)) return;
        initialColumnDisplaySettings.current = props.columnDisplaySettings;
        initializeColumnDisplaySettings();
    }, [props.columnDisplaySettings]);

    const getColumnDisplayUserConfig = async () => {
        if (!props.columnDisplaySettings) return null;
        return  await userConfigService.getSettings(props.columnDisplaySettings.configurationSection, props.columnDisplaySettings.configurationType, undefined);
        // return settings;
    }

    const applyColumnDisplayUserConfig = (userConfig = userConfigColumnDisplaySettings) => {
        if (!props.columnDisplaySettings) return;

        let temp = userConfigService.getMetaDataValue(userConfig, props.columnDisplaySettings.metaDataKey) as ColumnDisplayMetaData;
        const _columnDisplayMetaData: ColumnDisplayMetaData = temp ? temp : {
            hiddenColumnKeys: []
        };

        setColumnDisplayMetaData(_columnDisplayMetaData);
    };

    const initializeColumnDisplaySettings = async () => {
        let settings = await getColumnDisplayUserConfig();
        setUserConfigColumnDisplaySettings(settings);

        applyColumnDisplayUserConfig(settings);
    }

    const isColumnHidden = (columnMapping: SimpleColumnMapping) => {
        if (!columnDisplayMetaData) return false;

        return columnDisplayMetaData.hiddenColumnKeys.includes(columnMapping.key);
    }

    const handleColumnDisplayChanged = (key: string) => {
        let newMetaData = JSON.parse(JSON.stringify(columnDisplayMetaData)) as ColumnDisplayMetaData;

        let idx = newMetaData.hiddenColumnKeys.indexOf(key);
        if (idx > -1) {
            newMetaData.hiddenColumnKeys.splice(idx, 1);
        }
        else {
            newMetaData.hiddenColumnKeys.push(key);
        }

        updateColumnDisplaySettings(newMetaData);
    }

    const updateColumnDisplaySettings = (newMetaData: ColumnDisplayMetaData) => {
        if (!props.columnDisplaySettings) return;

        let newConfig = JSON.parse(JSON.stringify(userConfigColumnDisplaySettings));
        userConfigService.setMetaDataValue(newConfig, props.columnDisplaySettings.metaDataKey, newMetaData);

        setUserConfigColumnDisplaySettings(newConfig);
        applyColumnDisplayUserConfig(newConfig);

        userConfigService.saveConfigDebounced(newConfig, undefined);
    }

    const hideAllColumns = () => {
        return !!props.columnDisplaySettings && !userConfigColumnDisplaySettings;
    }

    //#endregion columnDisplaySettings

    function handleDragStart(event) {
        const { active } = event;
        setActiveId(active.id);
        // console.log('drag start', event)
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setOrderedData((items) => {
                const oldIndex = items.findIndex(x => x[uKey] === active.id);
                const newIndex = items.findIndex(x => x[uKey] === over.id);
                // console.log('moving from ', oldIndex, newIndex)
                const newItems = arrayMove(items, oldIndex, newIndex)
                // console.log('new Order:', items, newItems)
                !!props.onReorder && props.onReorder(newItems)
                !!props.onReorderIndex && props.onReorderIndex(event, oldIndex, newIndex)
                return newItems;
            })
        }
        setActiveId(null)
    }

    // Add intersection observer for infinite scroll
    const { ref: loadMoreRef, entry } = useIntersection({
        threshold: 0.5,
    });

    useEffect(() => {
        if (entry?.isIntersecting && props.onLoadMore && !props.isLoading && props.hasMore) {
            props.onLoadMore();
        }
    }, [entry?.isIntersecting, props.onLoadMore, props.isLoading, props.hasMore]);


    const filteredMapping = useMemo(() => {
        const userColMappingConfig = props.userColumnConfig ?? [];
        return props.mapping
            .filter(x => userColMappingConfig.length === 0 || (userColMappingConfig.find(y => y.ColumnName === x.key)?.Show ?? true))
            .sort((a, b) => (userColMappingConfig.find(y => y.ColumnName === a.key)?.Order || 0) - (userColMappingConfig.find(y => y.ColumnName === b.key)?.Order || 0));
    }, [props.userColumnConfig, props.mapping]);

    return <>
        <div className={styles.tableContainer} ref={props.tableRef}
            style={{
                overflow: 'auto',
                // maxWidth: '100vh',
                maxHeight: props.height ?? 430,
                minHeight: props.minHeight ?? 'auto',
                maxWidth: props.width ?? 'auto'
            }}
        >

            <Flex align={"end"}>
                {props.title}
                {props.columnDisplaySettings && <Box ml={!!props.title ? "lg" : 0}>

                    <Button
                        variant={'subtle'}
                        color={'gray'}
                        bg={showColumns && 'gray.1' || ''}
                        miw={'auto'}
                        px={''}
                        onClick={() => setShowColumns((x) => !x)}
                    >
                        <IconDots />
                    </Button>
                </Box>}

            </Flex>

            <Table
                className={
                    styles.mantineTable +
                    (props.stylingProps?.compact ? ' ' + styles.compact : '') +
                    (props.stylingProps?.rows ? ' ' + styles.striped : '')
                }
                withRowBorders={!props.stylingProps?.rows && props.stylingProps?.rowBorders !== false}
            >
                <Table.Thead>
                    <Table.Tr>
                        {
                            !!(props.onReorder || props.onReorderIndex || props.firstColumnOffset) && <th style={{ width: '50px' }}></th>
                        }
                        {
                            filteredMapping.filter(x => x.hide !== true && !isColumnHidden(x) && !hideAllColumns()).map(
                                (x, i) =>
                                    <Table.Th
                                        key={'simp' + i + 'col'}
                                        maw={x.maxColumnWidth}
                                        w={x.columnWidth}
                                        miw={x.minColumnWidth}
                                        style={{
                                            // width: Math.round(100 / props.mapping.length) + '%',
                                            cursor: x.sortable === true ? 'pointer' : 'default'
                                        }}
                                        onClick={() => {
                                            if (x.sortable === true) {
                                                const newSort: SortProps = {
                                                    SortExpression: x.key,
                                                    SortDirection: sort.SortExpression === x.key
                                                        ? sort.SortDirection === 'ascending'
                                                            ? 'descending'
                                                            : 'ascending'
                                                        : 'ascending'
                                                };
                                                setSort(newSort);
                                                props.onSort && props.onSort(newSort);
                                            }
                                        }}
                                    >
                                        <Tooltip label={x.tooltip ?? x.label} color={'scBlue'} openDelay={1000}
                                            events={{ hover: true, focus: true, touch: true }}
                                        >
                                            <Flex pos={'relative'} align="center" justify={(x.alignRight || x.currencyValue) ? 'flex-end' : x.alignCenter ? 'center' : 'flex-start'}>
                                                <Text
                                                    size={'sm'}
                                                    lineClamp={1}
                                                    fw={600}
                                                    style={{
                                                        wordBreak: 'break-word',
                                                        textAlign: (x.alignRight || x.currencyValue) ? 'end' : x.alignCenter ? 'center' : 'start'
                                                    }}
                                                    c={props.stylingProps?.darkerText ? 'gray.9' : 'gray.7'}
                                                >
                                                    {x.label}
                                                </Text>

                                                <span style={{position: 'relative', height: 19, width: 1}}>
                                                    <span style={{position: 'absolute', top: '-20%', transform: 'translate(-20%, 0%)'}} >
                                                    {
                                                        x.sortable === true && sort.SortExpression === x.key &&
                                                        <ActionIcon variant={'transparent'} pos={'absolute'} color={'gray'}>
                                                            <IconArrowUp size={14} style={{
                                                                transition: '500ms cubic-bezier(.49,.5,0,1.39)',
                                                                transform: sort.SortDirection === 'ascending' ? 'rotate(180deg)' : ''
                                                            }}/>
                                                        </ActionIcon>
                                                    }
                                                    </span>
                                                </span>
                                                {/*{x.sortable === true && sort.SortExpression === x.key && (
                                                    <Text ml={5} size="sm" fw={600}>
                                                        {sort.SortDirection === 'ascending' ? '↑' : '↓'}
                                                    </Text>
                                                )}*/}
                                            </Flex>
                                        </Tooltip>
                                    </Table.Th>
                            )
                        }
                        {props.controls && props.controls.length !== 0 && <Table.Th />}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                    >
                        <SortableContext
                            items={orderedData.map(x => ({ id: x.ID, ...x })) as any} // need to add a prop called id for dnd to work
                            strategy={verticalListSortingStrategy}
                        >
                            {
                                orderedData.map(
                                    (item, i) => (
                                        <SimpleTableRow
                                            key={(item[uKey] || 'simpleData' + i) as string}
                                            {...props}
                                            mapping={filteredMapping}
                                            item={item}
                                            index={i}
                                            columnDisplayMetaData={columnDisplayMetaData}
                                            useBlankRowsToImprovePerformance={orderedData.length > 100}
                                        />
                                    )
                                )
                            }
                        </SortableContext>
                    </DndContext>

                    {/* Intersection observer target */}
                    {props.hasMore && (
                        <Table.Tr>
                            <Table.Td colSpan={(filteredMapping.filter(x => x.hide !== true && !isColumnHidden(x) && !hideAllColumns()).length) + 2} align="center">
                                <Box ref={loadMoreRef} p="sm">
                                    {props.isLoading && <Loader size="sm" color="scBlue" />}
                                </Box>
                            </Table.Td>
                        </Table.Tr>
                    )}
                    {
                        !!props.addButton &&
                        <Table.Tr className={styles.addRow}>
                            {
                                (!!props.onReorderIndex || !!props.onReorder) &&
                                <Table.Td />
                            }
                            <Table.Td colSpan={filteredMapping.length}>
                                {
                                    props.addButton.customComponent ??
                                    <Flex w={'100%'} c={'scBlue'} align={'center'} gap={3} onClick={props.addButton.callback} >
                                        <IconPlus size={16} />
                                        <Anchor size={'sm'}>
                                            {props.addButton.label}
                                        </Anchor>
                                    </Flex>
                                }
                            </Table.Td>
                            {
                                !!props.controls && props.controls.length !== 0 &&
                                <Table.Td />
                            }
                        </Table.Tr>
                    }
                </Table.Tbody>

                {
                    props.footerRow &&
                    <Table.Tfoot>
                        <Table.Tr>
                            {
                                props.footerRow.map(
                                    (x, i) => hideAllColumns() || isColumnHidden(filteredMapping[i]) ? <></> :
                                        <Table.Td key={'simp' + i + 'col'}
                                            style={{
                                                minWidth: Math.round(100 / filteredMapping.length) + '%'
                                            }}
                                            maw={filteredMapping[i].maxColumnWidth} w={filteredMapping[i].columnWidth} miw={filteredMapping[i].minColumnWidth}
                                        >

                                            <Text
                                                size={'sm'}
                                                lineClamp={1}
                                                style={{ wordBreak: 'break-word' }}
                                                fw={500}
                                                c={'gray.7'}
                                                ta={filteredMapping[i].alignRight ? 'right' : undefined}
                                            >
                                                {x}
                                            </Text>
                                        </Table.Td>
                                )
                            }
                            <td />
                        </Table.Tr>
                    </Table.Tfoot>
                }
            </Table>

            <Drawer
                title={<Title order={4} c={'dimmed'}>
                    <Flex align={'center'} gap={5}>
                        <IconLayoutColumns size={20} />
                        Columns
                    </Flex>
                </Title>}
                opened={showColumns}
                onClose={() => setShowColumns(false)}
                size={'md'}
                position={'right'}
            >

                {filteredMapping.map((mapping, i) => (
                    <ScColCheckbox
                        draggable={false}
                        key={i}
                        value={{
                            id: mapping.key,
                            key: mapping.key,
                            label: mapping.label as any,
                            checked: !isColumnHidden(mapping),
                            disabled: mapping.required
                        }}
                        onChange={(event) => {
                            if (event.currentTarget) {
                                handleColumnDisplayChanged(mapping.key);
                                // props.onChange(
                                //     props.columnMapping.map(x => (
                                //         x.ID === val.id ? { ...x, Show: event.currentTarget?.checked } : { ...x }
                                //     )))
                                // setItems(p =>
                                //     p.map(
                                //         (x) => x.id === val.id ? { ...x, checked: event.currentTarget?.checked } : { ...x }
                                //     )
                                // )
                            }

                        }}
                    />
                ))}

            </Drawer>

        </div>

    </>
}

export default SimpleTable