import { FC, useCallback, useEffect, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import Storage from '@/utils/storage';
import * as Enums from '@/utils/enums';
import StoreService from '@/services/store/store-service';
import { Button, Group, Loader, Menu, Text, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconArchive, IconArchiveOff, IconCheckbox,
    IconEdit,
    IconFilterOff, IconSquareCheck,
    IconTableExport
} from "@tabler/icons";
import { IconEyeEdit, IconFilterStar, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { getActionId } from "@/PageComponents/Table/table-helper";
import DownloadService from "@/utils/download-service";
import ScDataPreview, { ScDataPreviewProps } from "@/PageComponents/Table/ScDataPreview";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";
import jobService from "@/services/job/job-service";
import ConfirmAction from "@/components/modals/confirm-action";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import warehouseService from "@/services/warehouse/warehouse-service";


const previewDataProps: ScDataPreviewProps[] = [
    {
        type: 'text',
        label: 'Customer',
        key: 'CustomerName'

    },
    {
        type: 'text',
        label: 'Contact',
        key: 'CustomerContactFullName'

    },
    {
        type: 'text',
        label: 'Description of the job',
        key: 'Description'

    },
    {
        type: 'text',
        label: 'Items',
        key: 'InventoryDescription'

    },
    {
        type: 'text',
        label: 'Job Type',
        key: 'JobTypeName'

    },
    {
        type: 'date',
        label: 'Start Date',
        key: 'StartDate'

    },
    {
        type: 'employee',
        label: 'Assigned Employees',
        key: 'EmployeeList'

    }
]

const JobsTable: FC = () => {

    const [archivePermission] = useState(PS.hasPermission(Enums.PermissionName.ArchiveJob));
    const [closePermission] = useState(PS.hasPermission(Enums.PermissionName.CloseJob));
    const { data: hasVanStock } = useQuery(['hasVanStock'], () => featureService.getFeature(constants.features.VAN_STOCK));

    const jobTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Job, undefined),
            columnMappingModelName: Enums.ColumnMapping.Job,
            noVisibleItemsMessage: 'No open Jobs',
            noVisibleItemsSecondaryMessage: 'View all Jobs to see your existing ones.',
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
            tableName: 'jobs1',
            tableNoun: 'Job',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'EmployeeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['FullName', 'EmailAddress', 'UserName'],
                        queryPath: '/Employee/GetEmployees',
                        label: 'Employee',
                        dataOptionColorKey: 'DisplayColor',
                        unassignedOption: 'showUnassignedEmployees'
                    },
                    {
                        filterName: 'JobStatusIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        dataOptionColorKey: 'DisplayColor',
                        dataOptionGroupingKey: 'WorkflowName',
                        queryPath: '/JobStatus',
                        showIncludeDisabledToggle: true,
                        label: 'Job Status',
                        // defaultValue: ["8c2aca98-c499-45f2-8cd6-6d83eee1bb75", "bf92b39a-3d34-4b1e-b63e-fb95a5b686f1"],
                        queryParams: {
                            onlyActive: 'false'
                        },
                        type: 'multiselect'
                    },
                    {
                        filterName: 'JobTypeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Name'],
                        dataOptionGroupingKey: 'WorkflowName',
                        queryPath: '/JobType',
                        label: 'Job Type'
                    },
                    {
                        filterName: 'StoreIDList',
                        dataOptionValueKey: 'ID',
                        // queryPath: '/Store/GetEmployeeStores',
                        /*queryParams: {
                            employeeId: Storage.getCookie(Enums.Cookie.employeeID)
                        },*/
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => StoreService.getStores(props.search ?? '', props.showAll ?? true, Storage.getCookie(Enums.Cookie.employeeID)),
                        label: 'Store',
                        hiddenWhileLoading: true
                    },
                    {
                        filterName: 'WarehouseIDList',
                        dataOptionValueKey: 'ID',
                        // queryPath: '/Store/GetEmployeeStores',
                        /*queryParams: {
                            employeeId: Storage.getCookie(Enums.Cookie.employeeID)
                        },*/
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => warehouseService.getWarehouses(1000, undefined, props.search ?? '', Enums.WarehouseType.Mobile),
                        label: 'Van',
                        hiddenWhileLoading: true,
                        hidden: !hasVanStock
                    },
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
                    {
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "PopulateJobs",
                        defaultValue: false
                    }
                ],
                showIncludeDisabledOptionsToggle: true
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Job',
                    default: true,
                },
                {
                    type: 'default',
                    name: 'preview',
                    icon: <IconEyeEdit />,
                    label: 'Preview Job'
                },
                {
                    type: 'warning',
                    name: 'archive',
                    icon: <IconArchive />,
                    label: 'Archive Job',
                    activeLabel: 'Archiving Job',
                    conditionalShow: {
                        key: 'IsArchived',
                        equals: false
                    },
                    showFunction: () => PS.hasPermission(Enums.PermissionName.ArchiveJob)
                },
                {
                    type: 'default',
                    name: 'archive',
                    icon: <IconArchiveOff />,
                    label: 'Restore Archive',
                    activeLabel: 'Restoring Job',
                    conditionalShow: {
                        key: 'IsArchived',
                        equals: true
                    },
                    showFunction: () => PS.hasPermission(Enums.PermissionName.ArchiveJob)
                },
                {
                    type: 'warning',
                    name: 'close',
                    icon: <IconSquareCheck />,
                    label: 'Close Job',
                    activeLabel: 'Complete Job',
                    conditionalShow: {
                        key: 'IsClosed',
                        equals: false
                    },
                    showFunction: () => PS.hasPermission(Enums.PermissionName.CloseJob)
                },
                {
                    type: 'default',
                    name: 'close',
                    icon: <IconCheckbox />,
                    label: 'Reopen Job',
                    activeLabel: 'Opening Job',
                    conditionalShow: {
                        key: 'IsClosed',
                        equals: true
                    },
                    showFunction: () => PS.hasPermission(Enums.PermissionName.CloseJob)
                }
            ],
            bottomRightSpace: true,
            queryParamNames: {
                statusID: {
                    type: 'option',
                    filterName: 'JobStatusIDList'
                },
                employeeUnassigned: {
                    type: 'unassignedOption',
                    filterName: 'showUnassignedQueryTypes'
                }
            },
            selectMode: !closePermission && !archivePermission ? 'none' : 'bulk'
        }
    ), [closePermission, archivePermission, hasVanStock])

    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    const [exportBusyState, setExportBusyState] = useState(false)

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const [queryParams, setQueryParams] = useState({});

    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    const [hasStockControl, setHasStockControl] = useState(false);

    useEffect(() => {
        featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
            setHasStockControl(!!feature);
        })
    }, []);

    const closeJobMutation = useMutation(
        [jobTableProps.tableName, 'closejobitem'],
        ({ item }) => Fetch.get({
            url: `/Job/${!item.IsClosed ? 'Close' : 'Open'}?id=${item.ID}`
        } as any),
        {
            onSuccess: (data, { item, name }) => {
                updateNotification({
                    id: 'a' + name + item.JobCardNumber,
                    loading: false,
                    message: <Group justify={'apart'}>
                        <Text>{'Successfully ' + (item.IsClosed ? 'Reopened' : 'Closed') + ' Job ' + item.JobCardNumber}</Text>
                        <Button size={'xs'} color={'scBlue'} onClick={() => undoClose(data)}>Undo</Button>
                    </Group>,
                    autoClose: true,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'success' }))
            },
            onError: (error, { item, name }: any) => {
                updateNotification({
                    id: 'a' + name + item.JobCardNumber,
                    loading: false,
                    message: 'Unable to ' + (item.IsClosed ? 'Reopen' : 'Close') + ' Job' + item.JobCardNumber,
                    autoClose: true,
                    color: 'yellow.7'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'error' }))
            },
            onMutate: ({ item, name }: any) => {
                showNotification({
                    id: 'a' + name + item.JobCardNumber,
                    loading: true,
                    message: (item.IsClosed ? 'Reopening' : 'Closing') + ' Job ' + item.JobCardNumber,
                    autoClose: false,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'loading' }))
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )

    const undoArchive = useCallback((item: any) => {
        onAction('archive', item)
        updateNotification({
            id: 'archive-' + item.JobCardNumber,
            loading: true,
            message: item.IsArchived ? 'Restoring' : 'Archiving' + ' Job ' + item.JobCardNumber,
            autoClose: false,
            color: 'scBlue'
        })
    }, [])

    const undoClose = useCallback((item: any) => {
        onAction('close', item)
        updateNotification({
            id: 'a' + 'close' + item.JobCardNumber,
            loading: true,
            message: item.IsClosed ? 'Reopening' : 'Closing' + ' Job ' + item.JobCardNumber,
            autoClose: false,
            color: 'scBlue'
        })
    }, [])

    const archiveJobMutation = useMutation(
        [jobTableProps.tableName, 'archivejobitem'],
        ({ item }) => Fetch.get({
            url: '/Job/Archive?id=' + item.ID
        } as any),
        {
            onSuccess: (data, { item, name }) => {
                updateNotification({
                    id: 'archive-' + item.JobCardNumber,
                    loading: false,
                    message: <Group justify={'apart'}>
                        <Text>{'Successfully ' + (item.IsArchived ? 'Restored' : 'Archived') + ' Job ' + item.JobCardNumber}</Text>
                        <Button size={'xs'} color={'scBlue'} onClick={() => undoArchive(data)}>Undo</Button>
                    </Group>,
                    autoClose: 8000,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'success' }))
            },
            onError: (error, { item, name }: any) => {
                updateNotification({
                    id: 'archive-' + item.JobCardNumber,
                    loading: false,
                    message: 'Unable to ' + (item.IsArchived ? 'Restore' : 'Archive') + ' Job',
                    autoClose: true,
                    color: 'yellow.7'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'error' }))
            },
            onMutate: ({ item, name }: any) => {
                showNotification({
                    id: 'archive-' + item.JobCardNumber,
                    loading: true,
                    message: item.IsArchived ? 'Restoring' : 'Archiving' + ' Job ' + item.JobCardNumber,
                    autoClose: false,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'loading' }))
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )

    const archiveSelectMutation = useMutation(
        [jobTableProps.tableName, 'archiveSelected'],
        ({ items }) => Fetch.post({
            url: '/Job/ArchiveToggle',
            params: items
        } as any),
        {
            onSuccess: (data, { items }) => {
                updateNotification({
                    id: 'archiveAllItems',
                    loading: false,
                    message: 'Successfully Archived Jobs',
                    autoClose: 8000,
                    color: 'scBlue'
                })
            },
            onError: (error, { items }: any) => {
                updateNotification({
                    id: 'archiveAllItems',
                    loading: false,
                    message: 'Unable to archive jobs',
                    autoClose: true,
                    color: 'yellow.7'
                })
            },
            onMutate: ({ items }: any) => {
                showNotification({
                    id: 'archiveAllItems',
                    loading: true,
                    message: 'Archiving Jobs',
                    autoClose: false,
                    color: 'scBlue'
                })
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )

    const executeCloseSelectedMutation = async (items) => {

        const doExecuteCloseSelectedMutation = async (markAsUsed) => {
            return new Promise(async (resolve, reject) => {
                Fetch.post({
                    url: `/Job/OpenToggle?markAsUsed=${markAsUsed}`,
                    params: items
                } as any).then((result) => {
                    resolve(result);
                }).catch(e => {
                    reject(e);
                });
            });
        }

        return new Promise(async (resolve, reject) => {

            if (hasStockControl && !selectedItemsAllClosed) {
                let mustConfirmMarkAsUsed = await jobService.getMarkAsUsedOnClosedOptionValue();
                if (mustConfirmMarkAsUsed) {
                    setConfirmOptions({
                        ...Helper.initialiseConfirmOptions(),
                        display: true,
                        heading: "Mark materials as used?",
                        text: "Your job preferences allow for closing jobs to mark materials as used. Do you want to mark materials linked to these jobs as used when closing?",
                        confirmButtonText: "Mark as Used",
                        discardButtonText: "Don't Mark as Used",
                        onConfirm: () => {
                            doExecuteCloseSelectedMutation(true).then(result => resolve(result), e => reject(e));
                        },
                        onDiscard: () => {
                            doExecuteCloseSelectedMutation(false).then(result => resolve(result), e => reject(e));
                        },
                        showDiscard: true,
                        showCancel: false
                    });
                }
                else {
                    doExecuteCloseSelectedMutation(false).then(result => resolve(result), e => reject(e));
                }
            }
            else {
                doExecuteCloseSelectedMutation(false).then(result => resolve(result), e => reject(e));
            }

        });
    };

    const closeSelectedMutation = useMutation(
        [jobTableProps.tableName, 'closeSelected'],
        ({ items }) => executeCloseSelectedMutation(items),
        {
            onSuccess: (data, { items }) => {
                updateNotification({
                    id: 'closeSelectedItems',
                    loading: false,
                    message: selectedItemsAllClosed ? 'Successfully Opened Jobs' : 'Successfully Closed Jobs',
                    autoClose: 8000,
                    color: 'scBlue'
                })
            },
            onError: (error, { items }: any) => {
                updateNotification({
                    id: 'closeSelectedItems',
                    loading: false,
                    message: 'Unable to close or open selected jobs',
                    autoClose: true,
                    color: 'yellow.7'
                })
            },
            onMutate: ({ items }: any) => {
                showNotification({
                    id: 'closeSelectedItems',
                    loading: true,
                    message: selectedItemsAllClosed ? 'Opening Jobs' : 'Closing Jobs',
                    autoClose: false,
                    color: 'scBlue'
                })
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )

    const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/job/' + item.ID)
        } else if (name === 'close') {
            closeJobMutation.mutate({ item, name })
            // queryClient.invalidateQueries({queryKey: [jobTableProps.tableName, 'tableData']})
        } else if (name === 'archive') {
            archiveJobMutation.mutate({ item, name })
            // queryClient.invalidateQueries({queryKey: [jobTableProps.tableName, 'tableData']})
        } else if (name === 'preview') {
            setShownPreviewItem(item)
        } else if (name === "openitem") {
            router.replace(item)
        } else {
            showNotification(
                {
                    id: 'comingSoon',
                    message: 'Coming Soon...',
                    color: 'scBlue'
                }
            )
        }
    }, [])


    // const [filterCount, setFilterCount] = useState<number>(1)

    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
        // setFilterCount(getActiveFilterCount(jobTableProps.tableFilterMetaData?.options || [], newParams))
    }

    const handleFilteredExport = async () => {
        handleExport(false)
    }
    const handleFullExport = async () => {
        handleExport(true)
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [jobTableProps.tableName, 'tableData'] })
    }

    const handleExport = async (exportAll: boolean) => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await DownloadService.downloadFile('POST', '/Job/GetExportedJobs', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
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

    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const selectedItemsAllClosed = useMemo(() => selectedItems.filter(x => x.IsClosed).length === selectedItems.length, [selectedItems])
    const selectedItemsAllArchived = useMemo(() => selectedItems.filter(x => x.IsArchived).length === selectedItems.length, [selectedItems])

    const handleArchiveSelected = () => {
        archiveSelectMutation.mutate(
            { items: [...selectedItems.filter(x => selectedItemsAllArchived ? x.IsArchived : !x.IsArchived).map(x => x.ID)] }
        )
    }

    const handleCloseSelected = () => {
        closeSelectedMutation.mutate(
            { items: [...selectedItems.filter(x => selectedItemsAllClosed ? x.IsClosed : !x.IsClosed).map(x => x.ID)] }
        )
    }

    const buttonIconMode = useMediaQuery('(max-width: 400px)');

    // State to trigger showing all jobs (including closed and archived)
    const [showAllJobsTrigger, setShowAllJobsTrigger] = useState(0)

    const handleShowAllJobs = () => {
        setShowAllJobsTrigger(prev => prev + 1)
    }

    const noItemsActionButton = (
        <Link href={'/job/create'} onClick={() => Helper.nextLinkClicked('/job/create')}>
            <Button color={'scBlue'} size="md" rightSection={<IconPlus size={16} />}>
                Create your first Job
            </Button>
        </Link>
    )

    const noVisibleItemsActionButton = (
        <Button color={'scBlue'} size="md" onClick={handleShowAllJobs}>
            View all Jobs
        </Button>
    )

    return (
        <>
            <ScDataPreview
                config={previewDataProps}
                data={shownPreviewItem}
                onClose={() => setShownPreviewItem(null)}
                onOpen={() => onAction('open', shownPreviewItem)}
            />

            <ScTable
                {...jobTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
                onSelected={setSelectedItems}
                noItemsAction={noItemsActionButton}
                noVisibleItemsAction={noVisibleItemsActionButton}
                showAllItemsTrigger={showAllJobsTrigger}
            >
                {
                    selectedItems.length !== 0 &&
                    <Group gap={'xs'}>
                        {
                            archivePermission &&
                            <Button
                                variant={'outline'}
                                color={'yellow.7'}
                                leftSection={archiveSelectMutation.isLoading ? <Loader color={'scBlue'} size={15} /> : <IconArchive />}
                                disabled={archiveSelectMutation.isLoading}
                                onClick={handleArchiveSelected}
                            >
                                {selectedItemsAllArchived ? 'Unarchive Selected' : 'Archive Selected'}
                            </Button>
                        }
                        {
                            closePermission &&
                            <Button
                                variant={'outline'}
                                color={'scBlue.6'}
                                leftSection={closeSelectedMutation.isLoading ? <Loader color={'scBlue'} size={15} /> : <IconSquareCheck />}
                                disabled={closeSelectedMutation.isLoading}
                                onClick={handleCloseSelected}
                            >
                                {selectedItemsAllClosed ? 'Reopen Selected' : 'Close Selected'}
                            </Button>
                        }
                    </Group>
                }

                {exportPermission && (
                    <Menu
                        shadow="md"
                        position={'bottom-end'}
                    // width={200}
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
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={'Only export items that appear in your current filter'} color={'scBlue'}>
                                <Menu.Item
                                    onClick={handleFilteredExport}
                                    leftSection={<IconFilterStar size={14} />}
                                    disabled={exportBusyState}
                                >
                                    Filtered Export
                                </Menu.Item>
                            </Tooltip>
                            <Menu.Item
                                onClick={handleFullExport}
                                leftSection={<IconFilterOff size={15} />}
                                disabled={exportBusyState}
                            >
                                Full Export
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}

                <Link href={'/job/create'} onClick={() => Helper.nextLinkClicked('/job/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Job
                    </Button>
                </Link>

            </ScTable>

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />
        </>
    )
}


export default JobsTable