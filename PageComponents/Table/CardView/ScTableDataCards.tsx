import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
    ScTableDataComponentProps, ColHeadingProps,
    SortProps,
    ColumnMappingMetaData
} from "@/PageComponents/Table/table-model";
import {
    Anchor,
    Box,
    Card,
    Checkbox, Flex,
    Table, Text,
} from "@mantine/core";
import tableStyles from '../Table/ScTableData.module.css'
import ScTableHeading from "../Table/ScTableHeading";
import ScTableCell from "@/PageComponents/Table/Table/ScTableCell";
import ScTableActionCell from "@/PageComponents/Table/Table/ScTableActionCell";
import { useListState } from "@mantine/hooks";
import Image from "next/image";
import { IconCheck } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import CompanyService from "@/services/company-service";
import Link from "next/link";
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import ScStatusData from "@/PageComponents/Table/Table/ScStatusData";
import moment from "moment";
import { IconMapPin, IconTruckLoading } from "@tabler/icons-react";

import styles from './ScTableDataCards.module.css'

const ScTableDataCards: FC<ScTableDataComponentProps> = (props) => {
    // console.log('data', props.tableState)

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
            SortDirection: props.tableState?.SortDirection || ''
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

    const rows = props.tableData?.map((data, i) => (
        <Table.Tr
            key={'item' + i + data?.ID}
            style={{
                position: 'relative',
                // backgroundColor: selectedItems.findIndex(x => x.ID === data.ID) !== -1 && theme.colors.gray[1] || ''
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

            <Table.Td id={'actions'} className={tableStyles.actions}>
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
                <div className={tableStyles.tableContainer}

                    style={{
                        overflow: 'auto',
                        // maxWidth: '100vh',
                        maxHeight: props.height || 'auto',
                        minHeight: props.mih && props.tableData && props.tableData.length !== 0 && props.tableData.length * 42 < props.mih ? props.tableData.length * 42 : props.mih
                    }}
                >

                    <Flex
                        wrap={'wrap'}
                        justify={'start'}
                        // justify={'space-between'}
                        // justify={'center'}
                        gap={'lg'}
                    >
                        {
                            props.tableData && props.tableData.length !== 0 &&
                            props.tableData.map(
                                (item) =>
                                    <Link
                                        key={item.ID}
                                        href={props.cardMapping?.link?.href + item[props.cardMapping?.link?.slug || 'ID']}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Card
                                            className={`${styles.card} ${item[props.cardMapping?.active?.key ?? ''] ? '' : styles.disabled}`}
                                            my={'sm'}
                                            withBorder
                                            shadow="sm"
                                            w={250}
                                            maw={'100%'}
                                            h={150}
                                        >
                                            <Flex direction={'column'} gap={5}>
                                                <Flex>
                                                    {
                                                        props.cardMapping?.link?.key &&
                                                        <Link href={props.cardMapping?.link?.href + item[props.cardMapping?.link?.slug || 'ID']}
                                                            style={{ textDecoration: 'none' }}
                                                        >
                                                            <Anchor style={{...(!!item[props.cardMapping?.employee?.key ?? ""] ? {} : {color: "red"} )}}>
                                                                {item[props.cardMapping?.link?.key]} {item[props.cardMapping?.active?.key ?? 'IsActive'] ? 'Active' : '[Deactivated]'}
                                                            </Anchor>
                                                        </Link>
                                                    }

                                                    {
                                                        props.cardMapping?.status?.key &&
                                                        <Box ml={'auto'}>
                                                            <ScStatusData
                                                                value={(item[props.cardMapping?.status?.key])}
                                                                color={
                                                                    item[props.cardMapping?.status?.key] === 'full' ? 'Blue' :
                                                                        item[props.cardMapping?.status?.key] === 'good' ? 'Green' :
                                                                            item[props.cardMapping?.status?.key] === 'low' ? 'Orange' :
                                                                                item[props.cardMapping?.status?.key] === 'Counted' ? 'Green' :
                                                                                    item[props.cardMapping?.status?.key] === 'Uncounted' ? 'Orange' :
                                                                                        'Red'
                                                                }
                                                            // color={colorEnumEntry?.[0]}
                                                            />
                                                        </Box>
                                                    }
                                                </Flex>
                                                <Flex align={'center'} gap={3}>
                                                    {
                                                        props.cardMapping?.employee?.key &&
                                                        <>

                                                            <EmployeeAvatar
                                                                name={item[props.cardMapping?.employee?.key]}
                                                            />
                                                            <Text size={'sm'}>
                                                                {item[props.cardMapping?.employee?.key] ?? "Unassigned"}
                                                            </Text>
                                                        </>
                                                    }
                                                </Flex>
                                                {/*<Flex align={'center'} gap={3}>
                                                {
                                                    props.cardMapping?.status?.key &&
                                                    <>
                                                        <ScStatusData
                                                            value={(item[props.cardMapping?.status?.key])}
                                                            // color={colorEnumEntry?.[0]}
                                                        />
                                                    </>
                                                }
                                            </Flex>*/}

                                                <Flex align={'center'} gap={3} c={'gray.6'}>
                                                    {
                                                        props.cardMapping?.location?.key &&
                                                        <>
                                                            <IconMapPin size={16} />
                                                            {/*<Text size={'xs'}>
                                                            current location:
                                                        </Text>*/}
                                                            <Text size={'sm'} >
                                                                {item[props.cardMapping?.location?.key]}
                                                            </Text>
                                                        </>
                                                    }
                                                </Flex>

                                                <Flex align={'center'} gap={3} c={'gray.6'}>
                                                    {
                                                        props.cardMapping?.date?.key &&
                                                        <>
                                                            {/*<Text size={'xs'}>
                                                            Last resupply: <IconTruckLoading size={16} />
                                                        </Text>*/}
                                                            <IconTruckLoading size={16} />
                                                            <Text size={'sm'}>
                                                                {!!item[props.cardMapping?.date?.key] ? moment(item[props.cardMapping?.date?.key]).format('DD-MM-YYYY [a]t HH:mm') : ""}
                                                            </Text>
                                                        </>
                                                    }
                                                </Flex>
                                            </Flex>
                                        </Card>
                                    </Link>
                            )
                        }
                    </Flex>
                </div>
            </div>
        </>

    )
}

export default ScTableDataCards
