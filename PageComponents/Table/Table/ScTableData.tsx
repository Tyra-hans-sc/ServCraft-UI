import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
    ScTableDataComponentProps, ColHeadingProps,
    SortProps,
    ColumnMappingMetaData
} from "@/PageComponents/Table/table-model";
import {
    Center,
    Checkbox, Flex,
    Table,
} from "@mantine/core";
import styles from './ScTableData.module.css'
import ScTableHeading from "./ScTableHeading";
import ScTableCell from "@/PageComponents/Table/Table/ScTableCell";
import ScTableActionCell from "@/PageComponents/Table/Table/ScTableActionCell";
import { useListState } from "@mantine/hooks";
import Image from "next/image";
import { IconCheck, IconMinus } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import CompanyService from "@/services/company-service";
import ImageWithZoom from "@/PageComponents/Attachment/ImageWithZoom";
import SCModal from "@/PageComponents/Modal/SCModal";

const ScTableData: FC<ScTableDataComponentProps> = (props) => {
    // console.log('data', props.tableState)


    const [showImage, setShowImage] = useState<any>();

    const columns = useMemo(() => (
        props.columnMapping ? props.columnMapping.filter(x => (x.IsHidden !== true) && (x.Show ?? true)) :
            (props.tableData && props.tableData[0] ? Object.keys(props.tableData[0]).map((x) => ({
                CellType: "none",
                ColumnName: x,
                ID: x + 'col',
                Label: x
            })) : [])
    ), [props.columnMapping])

    const shownColumnHeadings = useMemo(() => {
        let headings = (props.columnMapping && props.columnMapping.sort(
            (a, b) => ((typeof a.Order === 'number' && typeof b.Order === 'number') ? (a.Order - b.Order) : !b.Order && a.Order ? -1 : b.Order && !a.Order ? 1 : 0)
        )
            .filter(x => (x.IsHidden !== true) && (typeof x.Show === 'undefined' || x.Show))
            .map(x => ({
                name: x.ColumnName,
                sortable: x.Sortable,
                label: x.Label,
                width: x.UserWidth ?? x.Width ?? x.MaxWidth ?? 'auto'
            })) || []) as ColHeadingProps[];

        if (props.openColumnSettings) {
            headings.unshift({
                label: "",
                name: "OpenColumn",
                sortable: false,
                width: 'fit-content'
            });
        }

        return headings;
    }, [props.columnMapping, props.openColumnSettings])

    const [sortProps, setSortProps] = useState<SortProps>(
        {
            SortExpression: props.tableState?.SortExpression || '',
            // SortExpression: props.tableState?.SortExpression || null,
            SortDirection: props.tableState?.SortDirection || ''
            // SortDirection: props.tableState?.SortDirection || null
        }
    )
    useEffect(() => {
        props.onSort && props.onSort(sortProps)
    }, [sortProps])

    const onSort = useCallback((colName: string) => {
        // keep sorted
        setSortProps((prev) => ({
            SortDirection: prev.SortExpression === colName && prev.SortDirection === 'ascending' ? 'descending' : 'ascending',
            SortExpression: colName
        }))
        // clear on 3rd click
        /*setSortProps((prev) => ({
            SortDirection: prev.SortExpression === colName ? (prev.SortDirection === 'ascending' ? 'descending' : prev.SortDirection === 'descending' ? null : 'ascending') : 'ascending',
            SortExpression: prev.SortExpression === colName && prev.SortDirection === 'descending' ? null : colName
        }))*/
    }, [])

    const onUpdateWidth = useCallback((width, col) => {
        props.columnMapping && props.onUpdateColMapping(props.columnMapping.map(
            x => (
                x.ColumnName === col.name ? {
                    ...x,
                    UserWidth: width === 'auto' ? 'auto' : Math.round(width)
                } : { ...x }
            )
        ))
    }, [props.columnMapping])

    const headings = shownColumnHeadings.map(
        (col, i) =>
            <ScTableHeading
                key={'heading' + i}
                col={col}
                onSort={onSort}
                sortProps={sortProps}
                onUpdateWidth={(w) => onUpdateWidth(w, col)}
            />
        // <th key={'heading' + i}>{col.label}</th>
    )

    const [selectedItems, selectedHandlers] = useListState<any>([]);
    const onItemChecked = (checked, item: any) => {
        if (!checked) {
            selectedHandlers.remove(
                selectedItems.findIndex(x => x?.ID === item.ID)
            )
        } else {
            selectedHandlers.append(item)
        }
    }
    const handleAllCheckChange = (e) => {
        selectedHandlers.setState(e.currentTarget.checked ? props.tableData || [] : [])
    }

    useEffect(() => {
        props.onSelected && props.onSelected(selectedItems)
    }, [selectedItems])

    useEffect(() => {
        if (props.selectMode === 'none') {
            selectedHandlers.setState([])
        }
    }, [props.selectMode])

    useEffect(() => {
        props.tableData && selectedItems.length !== 0 && selectedHandlers.setState(prevState => (props.tableData || []).filter(y => prevState.findIndex(x => x.ID === y.ID) !== -1))
    }, [props.tableData]);

    const [currencySymbol, setCurrencySymbol] = useState(typeof localStorage === 'undefined' ? '' : localStorage.getItem('currencySymbol') ?? '')

    const currencyQuery = useQuery(['currencySymbol'], () => CompanyService.getCurrencySymbol(), {
        enabled: /*!currencySymbol && */props.columnMapping?.some(x => x.CellType === 'currency') && !localStorage.getItem('currencySymbol')
    })

    // Update currency symbol when query data changes
    useEffect(() => {
        if (currencyQuery.data) {
            setCurrencySymbol(currencyQuery.data ?? 'R')
            localStorage.setItem('currencySymbol', currencyQuery.data ?? 'R')
        }
    }, [currencyQuery.data])

    /** map recent items to the start of the list if it is not present **/
    const recentItemsNotIncluded = props.recentlyAdded ? props.recentlyAdded.filter(x => !props.tableData?.some(y => y.ID === x.ID)) : []
    const rowsWithRecentItems = [
        ...recentItemsNotIncluded.map(x => ({ ...x, recentItem: true })),
        ...(props.tableData || [])?.map((x) => props.recentlyAdded?.some(y => y.ID === x.ID) ? { ...x, recentItem: true } : x)
    ]

    const rows = rowsWithRecentItems?.map((data, i) => (
        <Table.Tr
            key={'item' + i + data?.ID}
            className={data.ID === props.activeItemId ? styles.activeRow : ''}
            style={{
                position: 'relative',
                // backgroundColor: selectedItems.findIndex(x => x.ID === data.ID) !== -1 && theme.colors.gray[1] || ''
                backgroundColor: data.recentItem ? 'rgba(233,241,255,0.75)' : ''
            }}
        >

            {
                props.selectMode === 'bulk' &&
                <Table.Td>
                    <Checkbox
                        checked={selectedItems.findIndex(x => x.ID === data.ID) !== -1}
                        size={'sm'}
                        color={'scBlue'}
                        onChange={(e) => onItemChecked(e.currentTarget.checked, data)}
                        icon={
                            ({ className }) =>
                                <IconCheck className={className} strokeWidth={4} style={{ zIndex: 0 }} />
                        }
                    />
                </Table.Td>
            }

            {props.thumbnailPropertyName &&
                <Table.Td>
                    {data[props.thumbnailPropertyName] &&
                        <><img
                            src={data[props.thumbnailPropertyName]}
                            style={{ height: 36, width: 36, borderRadius: 36, cursor: "pointer" }}
                            onClick={() => setShowImage(data)} />
                        </>
                    }
                </Table.Td>
            }

            {props.openColumnSettings &&
                <Table.Td>
                    <ScTableCell data={{ ...data, _OpenColumn: props.openColumnSettings.text }} col={{
                        ColumnName: "_OpenColumn",
                        Label: "",
                        ID: "openColumn",
                        CellType: "link",
                        MetaData: JSON.stringify({
                            triggerAction: props.openColumnSettings.triggerAction
                        } as ColumnMappingMetaData)

                    }}
                        onAction={props.onAction}
                        currencySymbol=""
                    />
                </Table.Td>}

            {
                columns.map(
                    (col, j) => {
                        return (
                            <Table.Td
                                key={'col-' + i + '-' + j + data?.ID}
                            >
                                {(!col.DisplayValueFunction || col.DisplayValueFunction(data) || true) ? <ScTableCell data={data} col={col} currencySymbol={currencySymbol} onAction={props.onAction} /> : <></>}

                            </Table.Td>
                        )
                    }
                )
            }

            <Table.Td />

            <Table.Td id={'actions'} className={styles.actions + ' ' + (props.showControlsOnHover === false ? styles.show : '')}>
                <ScTableActionCell actions={props.actions} states={props.actionStates} data={data}
                    onAction={(name) => props.onAction && props.onAction(name, data)} />
            </Table.Td>
        </Table.Tr>
    ))

    const nodata = (
        <tr>
            <td colSpan={columns.length + 2}>
                {
                    <div style={{ position: 'relative', minHeight: '100%' }}>
                        <Flex direction={'column'} align={'center'} justify={'center'} gap={5} mih={300}>
                            <Image width={100} height={100} src={props.tableIconPath || '/sc-icons/jobs-icon.svg'} alt="Job Folder" style={{ marginInline: 'auto' }} />
                            {props.noResultsSection}
                        </Flex>
                    </div>
                }
            </td>
        </tr>
    )


    return (
        <>
            <div
            // ref={ref}
            >
                <div className={styles.tableContainer}

                    style={{
                        overflow: 'auto',
                        // maxWidth: '100vh',
                        maxHeight: props.height || 'auto',
                        minHeight: props.mih && props.tableData && props.tableData.length !== 0 && props.tableData.length * 42 < props.mih ? props.tableData.length * 42 : props.mih
                    }}
                >
                    <Table
                        className={styles.mantineTable}
                    // size={13}
                    // withBorder
                    // highlightOnHover
                    /*style={{
                        borderCollapse: 'collapse',
                    }}*/
                    >

                        <Table.Thead>
                            {
                                props.tableData && props.tableData.length !== 0 &&
                                <Table.Tr>
                                    {
                                        props.selectMode === 'bulk' &&
                                        <Table.Th
                                            style={{
                                                width: 40,
                                                minWidth: 40,
                                                maxWidth: 40,
                                            }}
                                        >
                                            <Center>
                                                <Checkbox
                                                    mx={'auto'}
                                                    ml={10}
                                                    size={'sm'}
                                                    color={'scBlue'}
                                                    checked={props.tableData && props.tableData.length !== 0 && props.tableData.every(x => selectedItems.findIndex(y => x.ID === y.ID) !== -1)}
                                                    indeterminate={props.tableData && selectedItems.length !== props.tableData.length && props.tableData.some(x => selectedItems.findIndex(y => x.ID === y.ID) !== -1)}
                                                    onChange={handleAllCheckChange}
                                                    icon={
                                                        ({ indeterminate, className }) =>
                                                            indeterminate ? <IconMinus className={className} strokeWidth={4} /> : <IconCheck className={className} strokeWidth={4} />
                                                    }
                                                /*icon={
                                                    ({ indeterminate, className }) =>
                                                        indeterminate ? <IconMinus className={className} strokeWidth={4} /> : <IconListCheck className={className} strokeWidth={4} />
                                                }*/
                                                />
                                            </Center>
                                        </Table.Th>
                                    }
                                    {props.thumbnailPropertyName &&
                                        <Table.Th>

                                        </Table.Th>
                                    }
                                    {headings}
                                    <Table.Th />
                                    <Table.Th />
                                </Table.Tr>
                            }
                        </Table.Thead>

                        <Table.Tbody>
                            {
                                props.tableData && props.tableData.length === 0 ? nodata
                                    : rows
                            }
                        </Table.Tbody>

                    </Table>
                </div>
            </div>

            {showImage &&
                <SCModal
                    open={!!showImage}
                    showClose={true}
                    withCloseButton={true}
                    onClose={() => setShowImage(undefined)}
                    size={"auto"}>
                    <ImageWithZoom
                        attachment={{ ContentType: "image/jpeg", Url: showImage[props.imagePropertyName ?? ""], UrlThumb: showImage[props.thumbnailPropertyName ?? ""] }}
                    />
                </SCModal>
            }
        </>

    )
}

export default ScTableData
