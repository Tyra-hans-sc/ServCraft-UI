import { ActionIcon, Checkbox, Flex, Table } from "@mantine/core";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { SimpleColumnMapping, SimpleData } from "@/PageComponents/SimpleTable/SimpleTable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS, useCombinedRefs } from "@dnd-kit/utilities";
import styles from "./SectionTable.module.css";
import { TableAction, TableActionStates } from "@/PageComponents/Table/table-model";
import SectionTableSectionItem from "@/PageComponents/SectionTable/SectionTableSectionItem";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import DroppableRow from "@/PageComponents/SectionTable/DroppableRow";
import DraggableRow from "@/PageComponents/SectionTable/DraggableRow";
import SectionTableSectionHeading from "@/PageComponents/SectionTable/SectionTableSectionHeading";
import { IconCheck, IconChevronDown, IconMinus } from "@tabler/icons-react";
import { useInterval, useMediaQuery } from "@mantine/hooks";

const SectionTableSection: FC<{
    allowSections?: boolean
    data: SimpleData[]
    group: { id: string, items: any[], isSection: boolean }
    index: number
    mapping: SimpleColumnMapping[]
    onItemClicked?: (item: any, column: string) => void
    onReorder?: (newItems: any[]) => void
    onReorderIndex?: (event, previousIndex, nextIndex) => void
    onAction?: (actionName: string, actionItem: any, actionItemIndex: number, group: any) => void
    canEdit?: boolean
    controls?: TableAction[]
    stylingProps?: {
        compact?: boolean
        rows?: boolean
        darkerText?: boolean
    }
    tableActionStates?: TableActionStates
    onInputChange?: (name: string, item: any, value: number | '') => void
    showControlsOnHover?: boolean
    tableItemInputMetadataByKeyName?: { [itemID: string]: { [itemValueKeyName: string]: { disabled: boolean; loading: boolean } } }
    lastItem: boolean
    prevItemGroupId: string | undefined
    onCreateNewSection: (itemId: string) => void
    onUpdateGroup: (newGroup: any) => void
    onClearGroup: (group: any) => void
    sectionControls: any[]
    onSectionItem: (actionName: string, group: any) => void
    previousItemIsSection: boolean,
    useHideLineItemsPdfSetting?: boolean,
    useDisplaySubtotalsPdfSetting?: boolean,
    onItemsSelected: (items: any[]) => void
    selectedItems: any[]
    useSelectMode: boolean
    headingSubtotal?: number
    preferredInitialCollapsedState: boolean
    itemsSelectedFilter?: (items: any) => boolean
    lineClamp?: number
    sectionHeaderDisplayValueFunction?: (group: any) => string | React.ReactNode
}> = (props) => {

    /*const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: props.group.id,
    })*/

    /*const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }*/

    // const expandedLatestRef = useRef()

    const mobileView = useMediaQuery('(max-width: 1000px)')

    const [expandItems, setExpandItems] = useState(!props.preferredInitialCollapsedState)

    const { attributes: draggableattributes, listeners: draggablelisteners, setNodeRef: draggablesetNodeRef, transform: draggabletransform, active }
        = useDraggable({
            id: props.group.id,
            data: {
                groupId: props.group.id,
                groupIndex: props.index,
                group: props.group,
                type: 'group-item'
            }
        });
    const draggablestyle = {
        transform: CSS.Translate.toString(draggabletransform),
    };

    const [hoverOverCount, setHoverOverCount] = useState(0)
    const interval = useInterval(() => setHoverOverCount(p => p + 1), 500)
    const [temporaryExpandedState, setTemporaryExpandedState] = useState(false)

    useEffect(() => {
        if (active && expandItems) {
            if (active.id === props.group.id) {
                setExpandItems(false)
            }
        }/* else if (!active && hoverOverCount > 2) {
            setExpandItems(true)
        }*/
    }, [active]);


    const { setNodeRef: droppableNodeRef, over } = useDroppable({
        id: props.group.id,
        disabled: (!props.group.isSection || active?.data.current?.group?.isSection || active?.data.current?.groupId === props.group.id) && active?.id !== props.group.id /*!props.group.isSection*//* true*/,
        data: {
            groupId: props.group.id,
            groupIndex: props.index,
            group: props.group,
            type: 'group-item',
        }
    })

    useEffect(() => {
        if (!!over && over?.data.current?.groupId === props.group.id) {
            // console.log('start interval')
            if (!interval.active) {
                interval.start()
            }
        } else {
            if (!over && hoverOverCount) {
                setExpandItems(true)
            }
            if (interval.active) {
                interval.stop()
            }
            setHoverOverCount(0)
        }
    }, [over]);

    const combinedNodes = useCombinedRefs(/*setNodeRef, */draggablesetNodeRef, droppableNodeRef)

    const checked = useMemo(() => {

        if (props.itemsSelectedFilter) {
            return props.useSelectMode && props.group.items && props.group.items.filter(props.itemsSelectedFilter).length !== 0 &&
                props.group.items.filter(x => props.itemsSelectedFilter ? props.itemsSelectedFilter(x) : true).every(x => props.selectedItems.findIndex(y => x.ID === y.ID) !== -1);
        }

        return props.useSelectMode && props.group.items && props.group.items.length !== 0 &&
            props.group.items.every(x => props.selectedItems.findIndex(y => x.ID === y.ID) !== -1);
    }, [props.group.items, props.selectedItems]);

    const indeterminate = useMemo(() => {
        return props.useSelectMode && !checked &&
            props.group.items.some(x => props.selectedItems.findIndex(y => x.ID === y.ID) !== -1);
    }, [checked, props.selectedItems]);

    const handleGroupCheckChange = (e) => {
        props.onItemsSelected(
            e.currentTarget.checked ? [
                ...props.selectedItems,
                ...props.group.items.filter(x => !props.selectedItems.some(y => x.ID === y.ID))
            ] : [
                ...props.selectedItems.filter(x => !props.group.items.some(y => y.ID === x.ID))
            ]
        )
    }

    const handleItemCheckChange = (item) => {
        props.onItemsSelected(
            props.selectedItems.some(x => x.ID === item.ID) ? props.selectedItems.filter(x => x.ID !== item.ID) : [...props.selectedItems, item]
        )
    }

    const disabledSelect = props.group.isSection ? () => false : () => {
        var item = props.group.items[0];
        return disableItemSelect(item);
    };

    const disableItemSelect = (item: any) => {
        if (props.itemsSelectedFilter) {
            return !props.itemsSelectedFilter(item);
        }
        return false;
    }

    return (
        <>

            <DroppableRow id={'section-above-' + props.index}
                data={{
                    type: 'group-above',
                    groupIndex: props.index,
                    // groupId: props.group.id,
                }}
                colspan={props.mapping.length + 2}
                disabled={active?.id === props.group.id || active?.id === props.prevItemGroupId}
                groupId={props.group.id}
                // oneItemGroup={props.group.items.length === 1}
                sectionGroupBorder={props.group.isSection || props.previousItemIsSection}
            />


            {

                // master group row

                <tr
                    onDragEnd={() => setExpandItems(true)}
                    className={props.group.isSection && styles.sectionHeading || ''}
                    ref={combinedNodes}
                    style={{
                        ...draggablestyle,
                        ...(active?.id === props.group.id ? {
                            opacity: '.6'
                        } : {}),
                        ...((over?.id === props.group.id || over?.data.current?.groupId === props.group.id) && active?.data.current?.groupId !== props.group.id && {
                            backgroundColor: 'var(--mantine-color-scBlue-0)',
                        }),
                        cursor: props.group.isSection ? 'pointer' : 'default'
                    }}
                    onClick={() => setExpandItems(p => !p)}
                /*onMouseEnter={() => {
                    // console.log('mouse enter', props.group.id,  over?.id, over?.data.current?.groupId )
                    // if((over?.id === props.group.id || over?.data.current?.groupId === props.group.id) && active?.data.current?.groupId !== props.group.id) {
                    /!*if(!!active && active?.data.current?.groupId !== props.group.id) {
                        // console.log('start interval')
                        interval.start()
                    }*!/
                    // over?.id === props.group.id /!*&& active?.id !== props.group.id*!/ &&
                }}
                onMouseLeave={() => {
                    /!*if(interval.active) {
                        setHoverOverCount(0)
                        interval.stop()
                    }*!/
                }}*/
                >
                    <td style={{ width: 40 }}>
                        <Flex pos={'relative'} align={'center'}>
                            {
                                props.group.isSection &&
                                <Flex
                                    className={styles.sectionChevron}
                                >
                                    <ActionIcon
                                        variant={'transparent'}
                                        c={'gray'}
                                        ml={mobileView ? 7 : 0}
                                    >
                                        <IconChevronDown className={styles.ease + ' ' + (!expandItems ? styles.rotate90 : '')} size={'1em'} />
                                    </ActionIcon>
                                </Flex>
                            }

                            {
                                props.useSelectMode && <>
                                    <Checkbox
                                        onClick={e => e.stopPropagation()}
                                        mx={'auto'}
                                        ml={10}
                                        size={'xs'}
                                        color={'scBlue'}
                                        checked={checked}
                                        indeterminate={indeterminate}
                                        onChange={handleGroupCheckChange}
                                        disabled={disabledSelect()}
                                        icon={
                                            ({ indeterminate, className }) =>
                                                indeterminate ? <IconMinus className={className} strokeWidth={4} /> :
                                                    <IconCheck className={className} strokeWidth={4} />
                                        }
                                    /*icon={
                                        ({ indeterminate, className }) =>
                                            indeterminate ? <IconMinus className={className} strokeWidth={4} /> : <IconListCheck className={className} strokeWidth={4} />
                                    }*/
                                    />
                                </>
                            }

                            <Flex
                                align={'center'} className={mobileView ? '' : styles.dragHandle} c={'gray'}
                                ml={10}
                            >
                                {
                                    (props.canEdit ?? true) &&
                                    <ActionIcon variant={'transparent'} style={{ cursor: 'grab' }}
                                        {...((props?.canEdit ?? true) && draggableattributes)}
                                        {...((props?.canEdit ?? true) && draggablelisteners)}
                                    >
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill={'#afafaf'} height="16"
                                                width="14"
                                                viewBox="0 0 448 512"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setExpandItems(p => !p)
                                                }}
                                            >
                                                <path
                                                    d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z" />
                                            </svg>
                                        </>
                                    </ActionIcon>
                                }
                            </Flex>
                        </Flex>
                    </td>

                    {
                        !props.group.isSection ?
                            <SectionTableSectionItem
                                {...props}
                                item={props.group.items[0]}
                                onNewSection={() => props.onCreateNewSection(props.group.items[0])}
                            />
                            :
                            <SectionTableSectionHeading
                                sectionHeaderDisplayValueFunction={props.sectionHeaderDisplayValueFunction}
                                mainColumnSpan={props.mapping.length}
                                group={props.group}
                                onClearGroup={props.onClearGroup}
                                sectionControls={props.sectionControls}
                                onSectionItem={props.onSectionItem}
                                useHideLineItemsPdfSetting={props.useHideLineItemsPdfSetting}
                                useDisplaySubtotalsPdfSetting={props.useDisplaySubtotalsPdfSetting}
                                onUpdateGroup={props.onUpdateGroup}
                                canEdit={props.canEdit}
                                allowSections={props.allowSections}
                                headingSubtotal={props.headingSubtotal}
                                showSubtotal={typeof props.headingSubtotal === "number" && props.group.items.some(x => typeof x.LineTotalExclusive === "number")}
                            />
                    }
                </tr>
            }

            {
                (expandItems || (hoverOverCount > 0 && props.group.id !== active?.id)) &&
                props.group.isSection &&
                <SortableContext
                    items={props.group.items.map(x => ({ id: x.ID, ...x })) as any} // need to add a prop called id for dnd to work
                    strategy={verticalListSortingStrategy}
                >
                    {
                        props.group.items.map((x, i) => (
                            <DraggableRow
                                id={x.ID}
                                key={x.ID + 'row'}
                                colspan={props.mapping.length + 2}
                                lastItem={props.group.items.length === i + 1}
                                groupId={props.group.id}
                                groupIndex={props.index}
                                itemIndex={i}
                                group={props.group}
                                disableDrag={!!active && active.data.current?.groupId !== props.group.id}
                                canEdit={props.canEdit}
                                useSelectMode={props.useSelectMode}
                                selectedItems={props.selectedItems}
                                onItemCheckChange={() => handleItemCheckChange(x)}
                                disableSelect={disableItemSelect(x)}
                            >
                                <SectionTableSectionItem {...props} item={x} />
                            </DraggableRow>
                        ))
                    }
                </SortableContext>
            }

            {
                props.lastItem &&
                <DroppableRow id={'section-below-' + props.index}
                    data={{
                        type: 'group-below',
                        groupIndex: props.index,
                        // groupId: props.group.id,
                    }}
                    disabled={active?.id === props.group.id}
                    colspan={props.mapping.length + 2}
                    groupId={props.group.id}
                    sectionGroupBorder={props.group.isSection}
                />
            }

        </>
    );
}

export default SectionTableSection
