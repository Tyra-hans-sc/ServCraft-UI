import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ColumnMappingMetaData, ScTableProps} from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { useRouter } from "next/router";
import {
    IconEdit, IconPlus,
} from "@tabler/icons";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import {Button, Menu, Tooltip} from "@mantine/core";
import Helper from "@/utils/helper";
import {getEnumStringValue} from "@/utils/enums";
import {showNotification, updateNotification} from "@mantine/notifications";
import DownloadService from "@/utils/download-service";
import {useMediaQuery} from "@mantine/hooks";
import {IconEyeEdit, IconFilterStar, IconListDetails, IconTableExport} from "@tabler/icons-react";
import PS from '@/services/permission/permission-service';

const ItemJobsTable: FC<{itemId: string; customerId: string; module: number}> = (props) => {

    const jobTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Job, undefined),
            columnMappingModelName: Enums.ColumnMapping.Job,
            columMappingOverrideValues: {
                EmployeeName: {
                    MetaData: JSON.stringify({
                        multipleItems: {
                            keyName: 'EmployeeList',
                            itemLabelKey: 'FullName',
                            colorName: 'DisplayColor'
                        }
                    })
                },
                JobCardNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/job/',
                        slug: 'ID'
                    })
                },
                JobInvoices: {
                    CellType: 'statusList',
                    MetaData: JSON.stringify({
                        colourMappingValues: Enums.InvoiceStatusColor,
                        mappingValues: Enums.InvoiceStatus,
                        valueKey: 'InvoiceStatus',
                        display: 'InvoiceNumber',
                        link: {
                            href: '/invoice/',
                            slug: 'ID',
                        },
                        docNumName: "Invoice Number",
                        totalColumn: "InvoiceAmount"
                    } as ColumnMappingMetaData)
                },
                JobQueries: {
                    CellType: 'statusList',
                    MetaData: JSON.stringify({
                        colourMappingValues: undefined,
                        mappingValues: undefined,
                        valueKey: 'QueryStatus',
                        display: 'QueryCode',
                        link: {
                            href: '/query/',
                            slug: 'ID',
                        },
                        docNumName: "Query Code",
                        displayColorKeyName: "StatusColour"
                    } as ColumnMappingMetaData)
                },
                /*CustomerContactFullName: {
                    CellType: 'initials'
                },*/
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },
                CustomFilter1: {
                    CellType: 'icon'
                },
                CustomFilter2: {
                    CellType: 'icon'
                }
            },
            tableDataEndpoint: '/Job/GetJobs',
            tableName: 'jobs1' + props.module,
            tableNoun: 'Job',
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Closed Jobs',
                        filterName: 'IncludeClosed',
                        // default = inclusive for switch
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'switch',
                        label: 'Archived Jobs',
                        // defaultValue: true,
                        filterName: 'ShowArchived',
                        dataValueKey: 'IsArchived'
                    },
                    ...(props.module === Enums.Module.Customer ? [
                        {
                            label: '',
                            type: 'hidden',
                            filterName: 'CustomerIDList',
                            defaultValue: props.customerId ? [props.customerId] : []
                        },
                    ] : props.module === Enums.Module.Asset ? [
                        {
                            type: 'hidden',
                            filterName: 'productID',
                            label: "Item",
                            defaultValue: props.itemId
                        },
                    ] : [
                        {
                            type: 'hidden',
                            filterName: 'ItemId',
                            label: "Item",
                            defaultValue: props.itemId
                        },
                        {
                            type: 'hidden',
                            filterName: 'ModuleIDList',
                            label: "Module",
                            defaultValue: [getEnumStringValue(Enums.Module, props.module)]
                        },
                    ] as any),
                    /*{
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "PopulateJobs",
                        defaultValue: false
                    }*/
                ],
                showIncludeDisabledOptionsToggle: false
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Job',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',
            bypassGlobalState: true
        }
    ), [])

    const router = useRouter()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/job/' + item.ID)
        }
    }, [])


    const [exportBusyState, setExportBusyState] = useState(false)

    const exportPermission = PS.hasPermission(Enums.PermissionName.Exports);

    const [queryParams, setQueryParams] = useState({})


    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const handleNormalExport = async () => {
        handleExport()
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    // const queryClient = useQueryClient()
    /*const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [quoteTableProps.tableName, 'tableData'] })
    }*/

    const handleExport = async () => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await DownloadService.downloadFile('POST', '/Job/GetExportedJobs', { ...queryParams, exportAll: false }, false, false, "", "", null, false, (() => {
                updateNotification({
                    id: 'downloading-export',
                    loading: false,
                    message: 'Downloading Exported File',
                    autoClose: 2000,
                    color: 'scBlue'
                })
                setExportBusyState(false)
            }) as any)
        } catch (e) {
            setExportBusyState(false)
        }
    }

    const buttonIconMode = useMediaQuery('(max-width: 400px)');

    return (
        <>
            <ScTable
                {...jobTableProps}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
            >
                {exportPermission && props.module === Enums.Module.Customer && (
                    <Menu
                        shadow="md"
                        position={'bottom-end'}
                    >
                        <Menu.Target>
                            <Button
                                variant={'subtle'}
                                color={'gray.8'}
                                rightSection={!buttonIconMode && <IconTableExport size={15} />}
                                miw={buttonIconMode ? 'auto' : ''}
                                px={buttonIconMode ? 7 : ''}
                            >
                                {
                                    buttonIconMode ? <IconTableExport size={15} /> :
                                        'Export'
                                }
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Export to Excel</Menu.Label>
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={`Export ${jobTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                                <Menu.Item
                                    onClick={handleNormalExport}
                                    leftSection={<IconFilterStar size={14} />}
                                    disabled={exportBusyState}
                                >
                                    Export
                                </Menu.Item>
                            </Tooltip>
                            {/*<Tooltip events={{ hover: true, focus: true, touch: true }} label={`Export ${jobTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                                <Menu.Item
                                    onClick={handleDetailedExport}
                                    leftSection={<IconListDetails size={15} />}
                                    disabled={exportBusyState}
                                >
                                    Detailed Export
                                </Menu.Item>
                            </Tooltip>*/}
                        </Menu.Dropdown>

                    </Menu>
                )}


                <Link href={`/job/create?module=${props.module}&moduleID=${props.itemId}&customerID=${props.customerId}`} onClick={() => Helper.nextLinkClicked('/job/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add {jobTableProps.tableNoun}
                    </Button>
                </Link>
            </ScTable>
        </>
    )
}


export default ItemJobsTable
