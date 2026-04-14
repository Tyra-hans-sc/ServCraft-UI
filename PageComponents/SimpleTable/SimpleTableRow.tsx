import { Box, Flex, Table } from "@mantine/core";
import SimpleTableCell from "@/PageComponents/SimpleTable/SimpleTableCell";
import { FC, useEffect, useState } from "react";
import { ColumnDisplayMetaData, SimpleColumnMapping, SimpleData } from "@/PageComponents/SimpleTable/SimpleTable";
import { useSortable } from "@dnd-kit/sortable";
import {CSS, useCombinedRefs} from "@dnd-kit/utilities";
import ScTableActionCell from "@/PageComponents/Table/Table/ScTableActionCell";
import styles from "./SimpleTable.module.css";
import { TableAction, TableActionStates } from "@/PageComponents/Table/table-model";
import { useIntersection } from "@mantine/hooks";

const SimpleTableRow: FC<{
    data: SimpleData[]
    item: any
    index: number
    mapping: SimpleColumnMapping[]
    onItemClicked?: (item: any, column: string) => void
    onReorder?: (newItems: any[]) => void
    onReorderIndex?: (event, previousIndex, nextIndex) => void
    onAction?: (actionName: string, actionItem: any, actionItemIndex: number) => void
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
    firstColumnOffset?: boolean
    columnDisplayMetaData: ColumnDisplayMetaData
    cellVAlign?: "top" | "bottom" | "baseline" | "middle",
    useBlankRowsToImprovePerformance?: boolean
}> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: props.item.ID,
    })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const isColumnHidden = (columnMapping: SimpleColumnMapping) => {
        if (!columnDisplayMetaData) return false;

        return columnDisplayMetaData.hiddenColumnKeys.includes(columnMapping.key);
    }

    const [columnDisplayMetaData, setColumnDisplayMetaData] = useState<ColumnDisplayMetaData>(props.columnDisplayMetaData);

    useEffect(() => {
        setColumnDisplayMetaData(props.columnDisplayMetaData);
    }, [props.columnDisplayMetaData]);
    
    // Add intersection observer for row visibility
    const { ref, entry } = useIntersection({
        threshold: 0,
        rootMargin: '500px', // Consider rows 500px outside viewport
    });

    const combined = useCombinedRefs(ref, setNodeRef)
    
    // Track if row is in view
    const isInView = entry?.isIntersecting;

    useEffect(() => {
        // console.log(entry, ref, isInView);
    }, [entry, ref, isInView]);
    
    // If row is not in view, render a simplified placeholder row
    if (entry && !isInView && props.useBlankRowsToImprovePerformance) {
        const colSpan = props.mapping.filter(x => x.hide !== true && !isColumnHidden(x)).length + 
                       (props.controls && props.controls.length !== 0 ? 1 : 0) + 
                       ((props.onReorder || props.onReorderIndex || props.firstColumnOffset) ? 1 : 0);
        
        return (
            <Table.Tr ref={combined} id={`placeholder-row-${props.index}`} data-row-id={props.item.ID}>
                <Table.Td colSpan={colSpan} />
            </Table.Tr>
        );
    }

    return (<Table.Tr
        ref={combined}
        style={style}
    >
        {
            !!(props.onReorder || props.onReorderIndex) && <Table.Td
                {...attributes}
                {...listeners}
            >
                <Flex align={'center'} className={styles.dragHandle} c={'gray'} style={{ marginLeft: 10, cursor: 'grab' }} >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={'#afafaf'} height="16" width="14" viewBox="0 0 448 512"><path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z" /></svg>
                </Flex>
                {/*<IconGripHorizontal color={'gray'} style={{marginLeft: 5, cursor: 'grab'}} />*/}
            </Table.Td>
        }
        {
            !(props.onReorder || props.onReorderIndex) && props.firstColumnOffset &&
            <Table.Td />
        }
        {
            props.mapping.filter(x => x.hide !== true && !isColumnHidden(x)).map(
                ({ key, valueFunction, colorFunction, type, linkAction,
                    min, linkHrefFunction, colorKey, placeholderFunction, hintIcon, ...others }, j) => {

                    const typeToCheck = others.typeFunction ? others.typeFunction(props.item) : type

                    return (
                        <Table.Td key={'simp' + (props.item?.ID || props.item?.id) + 'row' + j + 'col'}
                                  align={props.mapping[j].alignRight ? "right" : props.mapping[j].alignCenter ? "center" : undefined}
                                  valign={props.cellVAlign}
                            // maw={'40vw' /* || type === 'numberInput' || linkAction || linkHrefFunction ? 'max-content'*/}
                                  maw={others.maxColumnWidth} w={others.columnWidth} miw={others.minColumnWidth}
                        >
                            <Box
                                // w={others.alignRight ? '100%' : 'max-content'}
                                w={(others.alignRight || typeToCheck === "textArea" || typeToCheck === "textInput") ? "100%" : "max-content"}
                                // w={type !== 'textInput' && 'max-content' || '100%'}
                                maw={'100%'}
                                style={{ cursor: props.onItemClicked && type === 'status' ? 'pointer' : 'default' }}
                                onClick={() => props.onItemClicked && props.onItemClicked(props.item, key)}
                            >
                                <SimpleTableCell data={valueFunction ? valueFunction(props.item) : props.item[key]} type={typeToCheck}
                                                 onActionLinkClick={!linkAction ? undefined : (() => { props.onAction && props.onAction(linkAction, props.item, props.index) })}
                                                 linkHref={linkHrefFunction ? linkHrefFunction(props.item) : undefined}
                                                 canEdit={props.canEdit ?? true}
                                                 stylingProps={props.stylingProps}
                                                 onValueChange={(newVal) => props.onInputChange && props.onInputChange(key, props.item, newVal)}
                                                 min={typeof min === 'function' ? min(props.item) : min}
                                                 color={colorFunction ? colorFunction(props.item) : colorKey && props.item[colorKey]}
                                                 inputProps={props.tableItemInputMetadataByKeyName?.[props.item.ID]?.[key]}
                                                 placeholder={!placeholderFunction ? undefined : placeholderFunction(props.item)}
                                                 hintIcon={hintIcon && hintIcon(props.item) || undefined}
                                                 item={props.item}
                                                 shown
                                                 lineClamp={others.rowLimit === false ? 20 : !others.rowLimit ? 2 : others.rowLimit}
                                                 {...others}
                                    // onConfirmInputUpdate={() => !!props.onConfirmInputUpdate && props.onConfirmInputUpdate(props.item)}
                                />
                            </Box>
                        </Table.Td>
                    )
                }
            )
        }
        {
            props.controls && props.controls.length !== 0 &&
            <Table.Td className={styles.actions + ' ' + (props.showControlsOnHover === false ? styles.show : '')}>
                <ScTableActionCell
                    disableTabbing
                    tooltipShowDelay={500}
                    mih={0}
                    actions={props.controls}
                    data={props.item}
                    onAction={(actionName) => !!props.onAction && props.onAction(actionName, props.item, props.index)}
                    // alwaysShowIcons={true}
                    actionIconPropsOverride={{
                        // variant: 'transparent',
                        // color: 'gray',
                        size: 'xs',
                    }}
                    states={props.tableActionStates}
                />
            </Table.Td>
        }
    </Table.Tr>)
}

export default SimpleTableRow