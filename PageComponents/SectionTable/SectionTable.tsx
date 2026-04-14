import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {Alert, Anchor, Box, Button, Checkbox, Drawer, Flex, rem, Table, Text, Tooltip} from "@mantine/core";
import styles from './SectionTable.module.css';
import {
    closestCorners,
    DndContext, DragEndEvent,
    KeyboardSensor,
    PointerSensor, useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {ColumnMappingData, TableAction, TableActionStates} from "@/PageComponents/Table/table-model";
import { IconCheck, IconMinus, IconPlus } from "@tabler/icons";
import SectionTableSection from "@/PageComponents/SectionTable/SectionTableSection";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { IconDeviceFloppy} from "@tabler/icons-react";
import { SimpleColumnMapping } from "@/PageComponents/SimpleTable/SimpleTable";
import ScColumnMappingButton from "./ScColumnMappingButton";

export type SimpleVal = number | string | { color?: null | string; value: null | string }
export interface SimpleData { [key: string]: SimpleVal | any }

export const getSectionsFromTableData = (data: any[], sectionNameKey: string, sectionIdKey: string, module: number, itemId: string) => {
    const sections: { [groupId: string]: any } = data.reduce((p, c, i, a) =>
        c[sectionIdKey] ? ({
            ...p,
            [c[sectionIdKey]]: [{ ...c }]
        }) :
            ({
                ...p
            })
        , {})

    return Object.entries(sections)
        .map(([k, x]) => {
            return ({
                ID: x[0][sectionIdKey],
                Name: x[0][sectionNameKey] || null,
                IsActive: true,
                FromBundleID: x[0]?.FromBundleID || null,
                HideLineItems: x[0]?.HideLineItems || false,
                DisplaySubtotal: x[0]?.DisplaySubtotal || false,
                Module: module,
                ItemID: itemId,
            })
        })
}

export const getDefaultSectionObject = (id: string, module: number, itemId: string, providedName?: string, bestPredictedDefaultPdfSettingValues?: { HideLineItems: boolean; DisplaySubtotal: boolean; }) => {
    return {
        ID: id,
        IsActive: true,
        Name: providedName || '',
        FromBundleID: null,
        HideLineItems: bestPredictedDefaultPdfSettingValues?.HideLineItems ?? false,
        DisplaySubtotal: bestPredictedDefaultPdfSettingValues?.DisplaySubtotal ?? false,
        Module: module,
        ItemID: itemId,
    }
}

export const getGroupedItems = (orderedData: any[], sectionNameKey: string, sectionIdKey: string, useInclusiveTotal: boolean = false) => {
    const groupedBySectionID: { [groupId: string]: any } = orderedData.reduce((p, c, i, a) =>
        p.hasOwnProperty(c.groupId) ? ({ ...p, [c.groupId]: [...p[c.groupId], { ...c }] }) :
            ({
                ...p,
                [c.groupId]: [{ ...c }]
            })
        , {})
    return Object.entries(groupedBySectionID).sort(([, [a]], [, [b]]) => a.LineNumber > b.LineNumber ? 1 : -1)
        .map(([k, x]) => {
            return ({
                id: x[0].groupId,
                name: x[0][sectionNameKey] || null,
                items: x,
                isSection: !!x[0][sectionIdKey],
                hideLineItems: x[0]?.HideLineItems || false,
                displaySubtotal: x[0]?.DisplaySubtotal || false,
                fromBundleId: x[0]?.FromBundleID || null,
                subTotal: x.filter(y => !isNaN(+y.LineTotalExclusive)).map(y => useInclusiveTotal ? (y.LineTotalExclusive * (1 + y.TaxPercentage / 100)) : y.LineTotalExclusive).reduce((p, c) => p + c, 0)
            })
        })
}

const expandedMaxSectionThreshold = 2
const expandedMaxItemThreshold = 15

const SectionTable: FC<{
    allowSections?: boolean
    data: SimpleData[]
    mapping: SimpleColumnMapping[]
    showTotals?: boolean
    footerRow?: (string | number)[]
    height?: any
    width?: any
    minHeight?: any
    onItemClicked?: (item: any, column: string) => void
    // onReorder?: (newItems: any[]) => void
    // on data update is called in real time to manipulate the data as needed when making changes
    onDataUpdate: (newItems: any[]) => void
    // onDebouncedDataUpdated will reflect the latest changes after a set interval if changes was made - used to debounce interactions to the server
    // onDebouncedDataUpdated?: (data: any[], sections: any[]) => void
    // debounceTimeout?: number
    // onReorderIndex?: (event: any, previousIndex: number, nextIndex: number) => void
    uniqueIdKey?: string
    onAction?: (actionName: string, actionItem: any, actionItemIndex: number, group: any) => void
    canEdit?: boolean
    controls?: TableAction[]
    sectionControls: any[]
    sectionTitleKey: string;
    sectionIdKey: string;
    // sectionData: any[];
    stylingProps?: {
        compact?: boolean
        rows?: boolean
        darkerText?: boolean
        clearHeader?: boolean
    }
    onInputChange?: (name: string, item: any, value: number | '') => void
    addButton?: {
        label?: string
        callback?: () => void
        customComponent?: ReactNode
    }
    tableActionStates?: TableActionStates
    showControlsOnHover?: boolean
    // specify input props for specific items
    tableItemInputMetadataByKeyName?: { [itemID: string]: { [itemValueKeyName: string]: { disabled: boolean; loading: boolean; error?: string | null } } }
    module: number
    itemId: string
    onSectionItem: (actionName: string, group: any) => void
    savingItem?: boolean
    history?: [data: any[], sections: any[]][]
    onUndo?: () => void
    useHideLineItemsPdfSetting?: boolean,
    useDisplaySubtotalsPdfSetting?: boolean,
    // when specified, normal drag controls will become checkboxes for selection
    itemsSelected?: (items: any[]) => void
    itemsSelectedFilter?: (item: any) => boolean
    // onConfirmInputUpdate?: (item: any) => void
    headingSubtotalValueFunction?: (itemsInSection: any[]) => number | undefined
    showNewBundleHint?: boolean
    onPredictedDefaultSectionPdfSettingsChanged?: (pdfSettings: { HideLineItems: boolean; DisplaySubtotal: boolean; }) => void
    lineClamp?: number
    rerenderTableTriggerVal?: any
    columnConfigModelName?: string;
    userColumnConfig?: ColumnMappingData[]
    customChildren?: ReactNode;
    sectionHeaderDisplayValueFunction?: (group: any) => string | React.ReactNode
}> = (props) => {

    const [uKey] = useState(props.uniqueIdKey || 'ID')
    const [sectionNameKey] = useState(props.sectionTitleKey)
    const [sectionIdKey] = useState(props.sectionIdKey)

    // Determines if section total values should be calculating including/excluding VAT
    const useInclusiveValues = useMemo(() => {
        return props.userColumnConfig?.some(x => x.ColumnName === 'LineTotalInclusive' && x.Show) || false
    }, [props.userColumnConfig])

    // const [collapsedSectionIDs, setCollapsedSectionIDs] = useState<string[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // add group id to data to avoid assigning new gid to items when reordering
    /*const dataWithGroupIds = useMemo(() => (
        props.data.map((x, i) => (
            // !x.SectionID ? {...x, groupId: crypto?.randomUUID() || 'sectionForItem' + i + x.ID} : {...x}
            { ...x, groupId: x[sectionIdKey] || crypto?.randomUUID() || 'sectionForItem' + i + x.ID }
        )).sort((a: any, b: any) => (a.LineNumber > b.LineNumber ? 1 : a.LineNumber === b.LineNumber ? 0 : -1))
    ), [props.data])*/
    const [orderedData, setOrderedData] = useState(
        props.data.map((x, i) => (
            // !x.SectionID ? {...x, groupId: crypto?.randomUUID() || 'sectionForItem' + i + x.ID} : {...x}
            { ...x, groupId: x[sectionIdKey] || crypto?.randomUUID() || 'sectionForItem' + i + x.ID }
        )).sort((a: any, b: any) => (a.LineNumber > b.LineNumber ? 1 : a.LineNumber === b.LineNumber ? 0 : -1))
    )
    const [groupedData, setGroupedData] = useState(getGroupedItems(orderedData, sectionNameKey, sectionIdKey, useInclusiveValues))
    const [sectionData, setSectionData] = useState(
        groupedData.filter(x => x.isSection).map((x) => ({
            ID: x.id,
            IsActive: true,
            Name: x.name,
            FromBundleID: x.fromBundleId,
            HideLineItems: x.hideLineItems,
            DisplaySubtotal: x.displaySubtotal,
            Module: props.module,
            ItemID: props.itemId,
        }))
    )

    const [preferredSectionCollapsedState, setPreferredSectionCollapsedState] = useState(orderedData.length > expandedMaxItemThreshold && sectionData.length > expandedMaxSectionThreshold)

    const dataChangedInternally = useRef(false)

    useEffect(() => {
        // console.log('data updated', dataWithGroupIds)
        if (!dataChangedInternally.current) {
            const orderedDataWithUid = props.data.map((x, i) => (
                // !x.SectionID ? {...x, groupId: crypto?.randomUUID() || 'sectionForItem' + i + x.ID} : {...x}
                { ...x, groupId: x[sectionIdKey] || crypto?.randomUUID() || 'sectionForItem' + i + x.ID }
            )).sort((a: any, b: any) => (a.LineNumber > b.LineNumber ? 1 : a.LineNumber === b.LineNumber ? 0 : -1))
            setOrderedData(orderedDataWithUid)
            const groupedData = getGroupedItems(orderedDataWithUid, sectionNameKey, sectionIdKey, useInclusiveValues)
            setGroupedData(groupedData)
            const sectionData = groupedData.filter(x => x.isSection).map((x) => ({
                ID: x.id,
                IsActive: true,
                Name: x.name,
                FromBundleID: x.fromBundleId,
                HideLineItems: x.hideLineItems,
                DisplaySubtotal: x.displaySubtotal,
                Module: props.module,
                ItemID: props.itemId,
            }))
            setSectionData(sectionData)
            setPreferredSectionCollapsedState(orderedData.length > expandedMaxItemThreshold && sectionData.length > expandedMaxSectionThreshold)
        }
        dataChangedInternally.current = false
    }, [props.data, useInclusiveValues]);

    /*const groupedData = useMemo(() => {
        const groupedBySectionID: { [groupId: string]: any } = orderedData.reduce((p, c, i, a) =>
            p.hasOwnProperty(c.groupId) ? ({ ...p, [c.groupId]: [...p[c.groupId], { ...c }] }) :
                ({
                    ...p,
                    [c.groupId]: [{ ...c }]
                })
            , {})
        return Object.entries(groupedBySectionID).sort(([, [a]], [, [b]]) => a.LineNumber > b.LineNumber ? 1 : -1)
            .map(([k, x]) => {
                return ({
                    id: x[0].groupId,
                    name: x[0][sectionNameKey] || null,
                    items: x,
                    isSection: !!x[0][sectionIdKey],
                    hideLineItems: x[0]?.HideLineItems || false,
                    displaySubtotal: x[0]?.DisplaySubtotal || false,
                    fromBundleId: x[0]?.FromBundleID || null,
                })
            })
    }, [orderedData])*/

    /*const sectionData = useMemo(() => {
        return groupedData.filter(x => x.isSection).map((x) => ({
            ID: x.id,
            IsActive: true,
            Name: x.name,
            FromBundleID: x.fromBundleId,
            HideLineItems: x.hideLineItems,
            DisplaySubtotal: x.displaySubtotal,
            Module: props.module,
            ItemID: props.itemId,
        }))
    }, [groupedData])*/

    // const [debouncedData, setDebouncedData] = useDebouncedState<[data: any[], sections: any[]]>([props.data, sectionData], props.debounceTimeout || 500)
    // const triggerDebouncedUpdate = useRef(false)

    /*useEffect(() => {
        setDebouncedData([orderedData, sectionData])
    }, [orderedData, sectionData]);*/

    /*useEffect(() => {
        if(triggerDebouncedUpdate.current) {
            props.onDebouncedDataUpdated && props.onDebouncedDataUpdated(debouncedData[0], debouncedData[1])
            console.log('debounced update', debouncedData[0], debouncedData[1])
        }
        triggerDebouncedUpdate.current = false
    }, [debouncedData]);*/


    const handleUpdate = (data, sections?) => {
        const orderedDataWithUid = data.map((x, i) => (
            // !x.SectionID ? {...x, groupId: crypto?.randomUUID() || 'sectionForItem' + i + x.ID} : {...x}
            { ...x, groupId: x[sectionIdKey] || crypto?.randomUUID() || 'sectionForItem' + i + x.ID }
        )).sort((a: any, b: any) => (a.LineNumber > b.LineNumber ? 1 : a.LineNumber === b.LineNumber ? 0 : -1))
        setOrderedData(orderedDataWithUid)
        const groupedData = getGroupedItems(orderedDataWithUid, sectionNameKey, sectionIdKey, useInclusiveValues)
        setGroupedData(groupedData)
        const sectionData = groupedData.filter(x => x.isSection).map((x) => ({
            ID: x.id,
            IsActive: true,
            Name: x.name,
            FromBundleID: x.fromBundleId,
            HideLineItems: x.hideLineItems,
            DisplaySubtotal: x.displaySubtotal,
            Module: props.module,
            ItemID: props.itemId,
        }))
        setSectionData(sectionData)
        setPreferredSectionCollapsedState(orderedData.length > expandedMaxItemThreshold && sectionData.length > expandedMaxSectionThreshold)
        if (!!props.onDataUpdate) {
            dataChangedInternally.current = true
            props.onDataUpdate(data)
            // triggerDebouncedUpdate.current = true
        }
    }

    function handleDragStart(event) {
        // console.log('drag start', event)
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        // console.log('drag end', 'active', active, 'over', over)

        if (active && over && active.id !== over.id) {

            let oldIndex = -1 // orderedData.findIndex(x => x[uKey] === active.id || x[uKey] === active.data.current.itemId);
            // let newIndex = -1 // orderedData.findIndex(x => x[uKey] === over.id || x[uKey] === over.data.current.itemId) + 1;

            let sectionName = ''
            let sectionId = ''
            let displaySubtotal = false
            let hideLineItems = false
            let fromBundleId = null

            let transferringItems: any[] = []
            // let newItems = []

            let itemId = over.data.current?.itemId || over.data.current?.group?.items[0]?.[uKey]

            if (/*!!over.data.current?.itemId*/ over.data.current?.type === 'group-item' || over.data.current?.type === 'row-above' || over.data.current?.type === 'row-below') { // dragged into group
                // const itemId = over.data.current?.itemId || over.data.current?.group.items[0]?.[uKey]
                // newIndex = orderedData.findIndex(x => x[uKey] === itemId) + (over.data.current?.type === 'row-below' ? 1 : 0)
                sectionName = groupedData[over.data.current?.groupIndex]?.name
                sectionId = groupedData[over.data.current?.groupIndex]?.id
                displaySubtotal = groupedData[over.data.current?.groupIndex]?.displaySubtotal
                hideLineItems = groupedData[over.data.current?.groupIndex]?.hideLineItems
                fromBundleId = groupedData[over.data.current?.groupIndex]?.fromBundleId

            } else if (over.data.current?.type === 'group-above' || over.data.current?.type === 'group-below') { // dragged above or below another section
                // retain current active item group data
                // sectionName = active.data.current?.itemId ? null : groupedData[active.data.current?.groupIndex]?.name
                const item = active.data.current?.itemId && orderedData.find((x: any) => x.ID === active.data.current?.itemId)

                sectionName = active.data.current?.itemId ? null : groupedData[active.data.current?.groupIndex]?.name
                displaySubtotal = active.data.current?.itemId ? item.DisplaySubtotal : groupedData[active.data.current?.groupIndex]?.displaySubtotal
                hideLineItems = active.data.current?.itemId ? item.HideLineItems : groupedData[active.data.current?.groupIndex]?.hideLineItems
                fromBundleId = active.data.current?.itemId ? null : groupedData[active.data.current?.groupIndex]?.fromBundleId
                // sectionId = active.data.current?.itemId ? (crypto?.randomUUID() || 'unknown') : groupedData[active.data.current?.groupIndex]?.id
                sectionId = active.data.current?.itemId ? null : active.data.current?.group ? (active.data.current?.group.items[0][sectionIdKey] || null) : null



                itemId = over.data.current?.type === 'group-above' ? groupedData[over.data.current?.groupIndex].items[0][uKey] : orderedData[orderedData.length - 1][uKey]
            } else if (active.data.current?.itemId) {
                // active item is row item: group must match dropped group or new group must be created
                sectionName = (!!over.data.current?.itemId || over.data.current?.type === 'row-above' || over.data.current?.type === 'row-below') ? groupedData[over.data.current?.groupIndex]?.name : null
                sectionId = (!!over.data.current?.itemId || over.data.current?.type === 'row-above' || over.data.current?.type === 'row-below') ? groupedData[over.data.current?.groupIndex]?.id : null
                displaySubtotal = (!!over.data.current?.itemId || over.data.current?.type === 'row-above' || over.data.current?.type === 'row-below') ? groupedData[over.data.current?.groupIndex]?.displaySubtotal : false
                hideLineItems = (!!over.data.current?.itemId || over.data.current?.type === 'row-above' || over.data.current?.type === 'row-below') ? groupedData[over.data.current?.groupIndex]?.hideLineItems : false
                fromBundleId = (!!over.data.current?.itemId || over.data.current?.type === 'row-above' || over.data.current?.type === 'row-below') ? groupedData[over.data.current?.groupIndex]?.fromBundleId : null
            }

            /* else if(over.data.current?.type === 'group-item') { // merging groups

            }*/


            if (active.data.current?.type === 'group-item') { // dragging group item
                // console.log('group data', active.data.current)
                const overItemId = active.data.current?.itemId || active.data.current?.group.items[0]?.[uKey]
                oldIndex = orderedData.findIndex(x => x[uKey] === overItemId)
                transferringItems = active.data.current?.group.items.map(x => (
                    {
                        ...x,
                        [sectionIdKey]: sectionId,
                        [sectionNameKey]: sectionName,
                        HideLineItems: hideLineItems,
                        DisplaySubtotal: displaySubtotal,
                        FromBundleID: fromBundleId,
                    }
                ))
            } else if (active.data.current?.itemId) { // dragging line item
                oldIndex = orderedData.findIndex(x => x[uKey] === active.data.current?.itemId)
                transferringItems = [{
                    ...orderedData.find(x => x[uKey] === active.data.current?.itemId),
                    [sectionNameKey]: sectionName,
                    [sectionIdKey]: sectionId,
                    HideLineItems: hideLineItems,
                    DisplaySubtotal: displaySubtotal,
                    FromBundleID: fromBundleId,
                }]
            }

            const filtered = orderedData.filter(x => !transferringItems.some(y => x[uKey] === y[uKey]))
            const index = active.data.current?.itemId === itemId ? orderedData.findIndex(x => x[uKey] === itemId) : filtered.findIndex(x => x[uKey] === itemId) + (
                (over.data.current?.groupIndex === active.data.current?.groupIndex && over.data.current?.itemIndex > active.data.current?.itemIndex) ||
                    (over.data.current?.type === 'row-below' || over.data.current?.type === 'group-below') ? 1 : 0
            )

            const newItems = [
                ...filtered.slice(0, index),
                ...transferringItems,
                ...filtered.slice(index)
            ].map((x, i) => (
                { ...x, LineNumber: i + 1 }
            ))

            if (index !== -1) {
                // !!props.onReorder && props.onReorder(newItems)
                // !!props.onReorderIndex && props.onReorderIndex(event, oldIndex, index)
                handleUpdate(
                    newItems,
                    // sectionData.map(x => ({ ...x, IsActive: newItems.some(y => y[sectionIdKey] === x.ID) }))
                )
            }


            // console.log('dragged completed --> ', 'active', active, 'over', over, 'oldIndex', oldIndex, 'newIndex', index, 'itemId', itemId, 'filtered', filtered, 'newItems', newItems, 'transferringItems', transferringItems, 'sectionName', sectionName, 'sectionId', sectionId)
        }
    }
    /*
    
        const { setNodeRef } = useDroppable({
            id: 't-body',
        });
    */

    const handleCreateNewSection = (item) => {
        handleUpdate(
            orderedData.map(x => x[uKey] === item[uKey] ? { ...x, [sectionIdKey]: item.groupId, FromBundleID: null, ...bestPredictedDefaultPdfSettingValues } : x),
            // [...sectionData, getDefaultSectionObject(item.groupId, props.module, props.itemId, '', bestPredictedDefaultPdfSettingValues)]
        )
    }

    const handleClearSection = (group) => {
        handleUpdate(
            orderedData.map(x => x[sectionIdKey] === group.id ? { ...x, [sectionIdKey]: null, [sectionNameKey]: null, FromBundleID: null } : x),
            // sectionData.map(x => x.ID === group.id ? {...x, IsActive: false} : x)
            // sectionData.filter(x => x.ID !== group.id)
        )
    }

    const handleUpdateGroup = (group: any) => {
        handleUpdate(
            orderedData.map(
                x =>
                    x[sectionIdKey] === group.id ?
                        {
                            ...x,
                            [sectionNameKey]: group.name,
                            HideLineItems: group.hideLineItems,
                            DisplaySubtotal: group.displaySubtotal,
                        }
                        : x
            ),
            /*sectionData.map(x => (
                x.ID === group.id ? {
                    ...x,
                    Name: group.name,
                    HideLineItems: group.hideLineItems,
                    DisplaySubtotal: group.displaySubtotal,
                } : x
            ))*/
        )
    }

    const [selectedItems, setSelectedItems] = useState<any[]>([])

    const indeterminate = useMemo(() => {

        if (props.itemsSelectedFilter) {
            return props.itemsSelected && props.data && selectedItems.length !== props.data.filter(props.itemsSelectedFilter).length
                && props.data.filter(props.itemsSelectedFilter).some(x => selectedItems.findIndex(y => x.ID === y.ID) !== -1);
        }

        return props.itemsSelected && props.data && selectedItems.length !== props.data.length && props.data.some(x => selectedItems.findIndex(y => x.ID === y.ID) !== -1);
    }, [props.data, selectedItems])

    const checked = useMemo(() => {
        if (props.itemsSelectedFilter) {
            return props.itemsSelected && props.data && props.data.filter(props.itemsSelectedFilter).length !== 0
                && props.data.filter(props.itemsSelectedFilter).every(x => selectedItems.findIndex(y => x.ID === y.ID) !== -1);
        }

        return props.itemsSelected && props.data && props.data.length !== 0 && props.data.every(x => selectedItems.findIndex(y => x.ID === y.ID) !== -1);
    }, [props.data, selectedItems]);

    const onSelectAllItems = (e) => {

        const allData = (props.itemsSelectedFilter ? props.data?.filter(props.itemsSelectedFilter) : props.data) ?? [];

        setSelectedItems(e.currentTarget.checked ? allData : [])
        props.itemsSelected && props.itemsSelected(e.currentTarget.checked ? allData : [])
    }
    const handleItemsSelected = (items: any[]) => {

        if (props.itemsSelectedFilter) {
            items = items.filter(props.itemsSelectedFilter);
        }

        setSelectedItems(items)
        props.itemsSelected && props.itemsSelected(items)
    }

    const [globalHideLineItemsChecked, setGlobalHideLineItemsChecked] = useState(orderedData.length !== 0 && orderedData.filter((x: any) => !!x.InventorySectionID).every((x: any) => x.HideLineItems));

    const globalHideLineItemsIndeterminate = useMemo(() => {
        const filtered = orderedData.filter((x: any) => !!x.InventorySectionID)
        return (
            !filtered.every((x: any) => x.HideLineItems) && filtered.some((x: any) => x.HideLineItems)
        )
    }, [orderedData])

    const [globalDisplaySubtotalChecked, setGlobalDisplaySubtotalChecked] = useState(orderedData.length !== 0 && orderedData.filter((x: any) => !!x.InventorySectionID).every((x: any) => x.DisplaySubtotal))

    useEffect(() => {
        if (orderedData.length !== 0) {
            setGlobalHideLineItemsChecked(orderedData.filter((x: any) => !!x.InventorySectionID).every((x: any) => x.HideLineItems))
            setGlobalDisplaySubtotalChecked(orderedData.filter((x: any) => !!x.InventorySectionID).every((x: any) => x.DisplaySubtotal))
        }
    }, [orderedData]);

    const globalDisplaySubtotalIndeterminate = useMemo(() => {
        const filtered = orderedData.filter((x: any) => !!x.InventorySectionID)
        return (
            !filtered.every((x: any) => x.DisplaySubtotal) && filtered.some((x: any) => x.DisplaySubtotal)
        )
    }, [orderedData])

    const handleGlobalHideLineItemsChange = (checked: boolean) => {
        setGlobalHideLineItemsChecked(checked)
        handleUpdate(
            orderedData.map(
                x => ({
                    ...x,
                    HideLineItems: checked,
                })
            )/*,
            sectionData.map(x => ({
                ...x,
                HideLineItems: checked,
            }))*/
        );
    }

    const handleGlobalDisplaySubtotalChange = (checked: boolean) => {
        setGlobalDisplaySubtotalChecked(checked)
        handleUpdate(
            orderedData.map(
                x => ({
                    ...x,
                    DisplaySubtotal: checked,
                })
            )/*,
            sectionData.map(x => ({
                ...x,
                DisplaySubtotal: checked,
            }))*/
        );
    }

    const bestPredictedDefaultPdfSettingValues = useMemo(() => ({
        HideLineItems:
            globalHideLineItemsIndeterminate ? sectionData.filter(x => x.HideLineItems) > sectionData.filter(x => !x.HideLineItems) :
                globalHideLineItemsChecked,
        DisplaySubtotal:
            globalDisplaySubtotalIndeterminate ? sectionData.filter(x => x.DisplaySubtotal) > sectionData.filter(x => !x.DisplaySubtotal) :
                globalDisplaySubtotalChecked,
    }), [sectionData, globalHideLineItemsIndeterminate, globalHideLineItemsChecked, globalDisplaySubtotalIndeterminate, globalDisplaySubtotalChecked]);

    useEffect(() => {
        props.onPredictedDefaultSectionPdfSettingsChanged && props.onPredictedDefaultSectionPdfSettingsChanged(bestPredictedDefaultPdfSettingValues)
    }, [bestPredictedDefaultPdfSettingValues.HideLineItems, bestPredictedDefaultPdfSettingValues.DisplaySubtotal]);

    const [userColMappingConfig, setUserColMappingConfig] = useState<ColumnMappingData[]>(props.userColumnConfig ?? [])
    useEffect(() => {
        setUserColMappingConfig(props.userColumnConfig ?? [])
    }, [props.userColumnConfig]);

    const mapping = useMemo(() =>
        props.mapping
            .filter(x => userColMappingConfig.length === 0 || (userColMappingConfig.find(y => y.ColumnName === x.key)?.Show ?? true))
            .sort((a, b) => (userColMappingConfig.find(y => y.ColumnName === a.key)?.Order || 0) - (userColMappingConfig.find(y => y.ColumnName === b.key)?.Order || 0))
    , [userColMappingConfig, props.mapping])

    const tableHeadAndBody = useMemo(() => (<>
        <Table.Thead>
            <Table.Tr>
                {
                    /*!!(props.onReorder || props.onReorderIndex) &&*/
                    <Table.Th
                        className={styles.actionCell}
                        maw={40}
                    // h={21}
                    >
                        {/*<span style={{position: "absolute", left: 10, bottom: 4}}>
                                {
                                    props.savingItem &&
                                    <span className={styles.savingFlicker}>
                                        <Tooltip label={'Saving Data...'} color={'scBlue'}>
                                            <IconDeviceFloppy color={'var(--mantine-color-scBlue-6)'} size={18}/>
                                        </Tooltip>
                                    </span>
                                }
                                </span>*/}
                        {
                            props.itemsSelected ? <>
                                <Checkbox
                                    size={'xs'}
                                    mx={'auto'}
                                    ml={10}
                                    color={'scBlue'}
                                    checked={checked}
                                    indeterminate={indeterminate}
                                    onChange={onSelectAllItems}
                                    icon={
                                        ({ indeterminate, className }) =>
                                            indeterminate ? <IconMinus className={className} strokeWidth={4} /> : <IconCheck className={className} strokeWidth={4} />
                                    }
                                />
                            </> :
                                props.savingItem &&
                                <Flex align={'center'} h={'100%'} w={'100%'} justify={'center'}>
                                    <Tooltip label={'Saving Data...'} color={'scBlue'}>
                                        <IconDeviceFloppy color={'var(--mantine-color-yellow-7)'} size={17} />
                                    </Tooltip>
                                </Flex>
                            /*<span className={styles.savingFlicker}
                                  style={{
                                      // marginTop: 5,
                                      position: 'relative'
                                  }}
                            >
                                <span style={{position: 'absolute', left: 30, top: -9 }}>
                                    <Tooltip label={'Saving Data...'} color={'scBlue'}>
                                        <IconDeviceFloppy color={'var(--mantine-color-scBlue-6)'} size={20}/>
                                    </Tooltip>
                                </span>
                            </span>*/
                            /*<span style={{marginLeft: 10}}>
                                <Tooltip label={'Saving Data...'} color={'scBlue'}>
                                    <IconDeviceFloppy color={'var(--mantine-color-scBlue-6)'} size={17}/>
                                </Tooltip>
                            </span>*/
                        }
                    </Table.Th>
                }
                {
                    mapping.map(
                        (x, i) =>
                            <Table.Th key={'simp' + i + 'col'}
                            // width: Math.round(100 / mapping.length) + '%',
                            >
                                <Tooltip events={{ hover: true, focus: false, touch: true }} label={x.tooltip ?? x.label} color={'scBlue'} openDelay={1000}>
                                    <Text
                                        size={'sm'}
                                        lineClamp={1}
                                        fw={600}
                                        style={{
                                            wordWrap: 'break-word',  // Enables breaking words to wrap to the next line
                                            wordBreak: 'keep-all',   // Attempts to keep whole words on the same line unless space is unavailable
                                            whiteSpace: 'normal',    // Allows wrapping behavior for multi-line text
                                            textAlign: (x.alignRight || x.currencyValue) ? 'end' : 'start'
                                        }}
                                        pr={x.alignRight || x.currencyValue ? 13 : 0}
                                        c={props.stylingProps?.darkerText ? 'gray.9' : 'gray.7'}
                                    >
                                        {x.label}
                                    </Text>
                                </Tooltip>
                            </Table.Th>
                    )
                }
                <Table.Th
                    className={styles.actionCell + (props.history && props.history.length > 1 || props.savingItem ? ' ' + styles.backgroundTransparent60 : styles.backgroundTransparent)}
                // miw={40}
                >
                    <Flex align={'center'} justify={'center'}
                        // pos={'absolute'}
                        // top={6}
                        // right={5}
                        h={21}
                    // gap={1}
                    >
                        {
                            /*props.savingItem &&
                            <span className={styles.savingFlicker}
                                  style={{
                                      // marginTop: 5,
                                      position: 'relative'
                                  }}
                            >
                                <span style={{position: 'absolute', left: 30, top: -9 }}>
                                    <Tooltip label={'Saving Data...'} color={'scBlue'}>
                                        <IconDeviceFloppy color={'var(--mantine-color-scBlue-6)'} size={20}/>
                                    </Tooltip>
                                </span>
                            </span>*/
                            /*<Tooltip label={'Saving Data...'} color={'scBlue'}>
                                <IconDeviceFloppy color={'var(--mantine-color-scBlue-6)'} size={20}/>
                            </Tooltip>*/
                        }
                        {
                            // REMOVED UNDO FOR NOW?  Why ?? :'(
                            // props.history && props.history.length > 1 && props.onUndo &&
                            // <Tooltip label={'Undo'} color={'scBlue'} openDelay={400}>
                            //     <ActionIcon variant={'transparent'} onClick={props.onUndo}>
                            //         <IconArrowBackUp />
                            //     </ActionIcon>
                            // </Tooltip>
                        }
                    </Flex>
                </Table.Th>
            </Table.Tr>
        </Table.Thead>
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
            <Table.Tbody
            // ref={setNodeRef}
            >
                {
                    groupedData.map(
                        (group, i) => (
                            <SectionTableSection
                                key={(group.id + 'section') as string}
                                {...props}
                                mapping={mapping}
                                group={group}
                                index={i}
                                lastItem={i === groupedData.length - 1}
                                prevItemGroupId={groupedData[i - 1]?.id}
                                onCreateNewSection={handleCreateNewSection}
                                onUpdateGroup={(newGroup) => handleUpdateGroup(newGroup)}
                                onClearGroup={handleClearSection}
                                previousItemIsSection={groupedData[i - 1]?.isSection}
                                onItemsSelected={handleItemsSelected}
                                selectedItems={selectedItems}
                                useSelectMode={!!props.itemsSelected}
                                headingSubtotal={group.subTotal}
                                preferredInitialCollapsedState={!group.isSection || preferredSectionCollapsedState}
                                itemsSelectedFilter={props.itemsSelectedFilter}
                                lineClamp={props.lineClamp}
                            />
                        )
                    )
                }
            </Table.Tbody>
        </DndContext>
    </>), [groupedData, props.canEdit, selectedItems, mapping, props.rerenderTableTriggerVal])

    const table = useMemo(() => (
        <Table
            className={
                styles.mantineTable +
                (props.stylingProps?.compact ? ' ' + styles.compact : '') +
                (props.stylingProps?.rows ? ' ' + styles.striped : '')
            }
            withRowBorders={!props.stylingProps?.rows}
        >
            {tableHeadAndBody}

            {
                !!props.addButton &&
                <Table.Tr className={styles.addRow} style={{ borderBottom: 0 }}>
                    {
                        // (!!props.onReorderIndex || !!props.onReorder) &&
                        <Table.Td />
                    }
                    <Table.Td colSpan={mapping.length - 1}>
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

            {
                props.footerRow &&
                <Table.Tfoot>
                    <Table.Tr>
                        {
                            props.footerRow.map(
                                (x, i) =>
                                    <Table.Td key={'simp' + i + 'col'}
                                        style={{
                                            minWidth: Math.round(100 / mapping.length) + '%'
                                        }}
                                    >

                                        <Text
                                            size={'sm'}
                                            lineClamp={1}
                                            style={{ wordBreak: 'break-word' }}
                                            fw={500}
                                            c={'gray.7'}
                                        >
                                            {x}
                                        </Text>
                                    </Table.Td>
                            )
                        }
                    </Table.Tr>
                </Table.Tfoot>
            }
        </Table>
    ), [groupedData, props.canEdit, selectedItems, props.addButton?.customComponent, mapping])

    return <>
        <div className={styles.tableContainer}
            style={{
                overflow: 'auto',
                maxHeight: props.height ?? 430,
                minHeight: props.minHeight ?? 'auto',
                maxWidth: props.width ?? 'auto'
            }}
        >
            {
                (!!props.customChildren || props.columnConfigModelName || props.useDisplaySubtotalsPdfSetting || props.useHideLineItemsPdfSetting) &&
                <Flex align={'center'} direction={{base: 'row', md: 'row-reverse'}} justify={{base: 'start', md: 'end'}} mb={{ base: 0}} >
                    {/*{
                        <Alert display={{ base: 'none', md: 'block' }} color={'scBlue'} variant={'transparent'} icon={<Text c={'goldenrod'} fw={600} size={'10px'}>NEW</Text>}>
                            <Flex align={'center'} gap={5}><Text size={'sm'} mt={2} >Try our new Sections and Bundles when adding items below</Text></Flex>
                        </Alert>
                    }*/}

                    {
                        props.customChildren
                    }

                    {
                        props.columnConfigModelName &&
                        <ScColumnMappingButton
                            size={'sm'}
                            tableName={props.columnConfigModelName}
                            columnMappingModelName={props.columnConfigModelName}
                            mapping={props.mapping}
                            onColumnMappingLoaded={setUserColMappingConfig}
                        />
                    }

                    {
                        (props.useDisplaySubtotalsPdfSetting || props.useHideLineItemsPdfSetting)/* && showGlobalPdfSettingCheckboxes*/ &&
                        <Flex ml={{ base: 20/*, md: 'auto'*/ }} mr={'sm'} align={'center'} pos={'initial'}>
                            <Text size={'sm'} mt={3} fw={600} >PDF Options :</Text>
                            {
                                props.useHideLineItemsPdfSetting &&
                                <Tooltip
                                    events={{ hover: true, focus: true, touch: true }}
                                    label={<Text size={'xs'}>Show line items for Sections on PDF </Text>}
                                    color={'scBlue'}
                                    openDelay={1000}
                                    closeDelay={0}
                                >
                                    <div>
                                        <Checkbox
                                            mb={-3}
                                            size={'xs'}
                                            ml={10}
                                            checked={!globalHideLineItemsChecked}
                                            indeterminate={globalHideLineItemsIndeterminate}
                                            onChange={e => {
                                                handleGlobalHideLineItemsChange(!e.currentTarget.checked)
                                            }}
                                            label={<Text size={'sm'}>Show line items for Sections</Text>}
                                            styles={{
                                                label: { paddingLeft: 10 }
                                            }}
                                            labelPosition={'right'}
                                            disabled={!(props.canEdit ?? true)}
                                        />
                                    </div>
                                </Tooltip>
                            }
                            {
                                props.useDisplaySubtotalsPdfSetting &&
                                <Tooltip
                                    label={<Text size={'xs'}>Display subtotals on PDF </Text>}
                                    color={'scBlue'}
                                    openDelay={1000}
                                    closeDelay={0}
                                    events={{ hover: true, focus: true, touch: true }}
                                >
                                    <div>
                                        <Checkbox
                                            mb={-3}
                                            ml={'sm'}
                                            checked={globalDisplaySubtotalChecked}
                                            indeterminate={globalDisplaySubtotalIndeterminate}
                                            onChange={e => {
                                                handleGlobalDisplaySubtotalChange(e.currentTarget.checked)
                                            }}
                                            size={'xs'}
                                            styles={{
                                                label: { paddingLeft: 10 }
                                            }}
                                            label={<Text size={'sm'}>Display subtotals</Text>}
                                            labelPosition={'right'}
                                            disabled={!(props.canEdit ?? true) || (globalHideLineItemsChecked && !globalHideLineItemsIndeterminate)}
                                        />
                                    </div>
                                </Tooltip>
                            }
                        </Flex>
                    }

                </Flex>
            }

            {table}

        </div>

    </>
}

export default SectionTable
