import { FC, useCallback, useEffect, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Group, Loader, Menu, Text, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconArchive, IconArchiveOff,
    IconEdit,
    IconFilterOff,
    IconTableExport, IconTableImport
} from "@tabler/icons";
import { IconAddressBook, IconFilterStar, IconHomeMove, IconPlus, IconUser } from "@tabler/icons-react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import IntegrationService from '../../../services/integration-service';
import Fetch from "@/utils/Fetch";
import { getActionId } from "@/PageComponents/Table/table-helper";
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import ScDataImportModal from "@/PageComponents/Table/ScDataImportModal";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";

const CustomersTable: FC = () => {

    const {data: integration} = useQuery(['integration', 'customer'], () => IntegrationService.getIntegration())

    const customerTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Customer, undefined),
            columnMappingModelName: Enums.ColumnMapping.Customer,
            columMappingOverrideValues: {
                CustomerCode: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/customer/',
                        slug: 'ID'
                    })
                },
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },
                CustomerSyncStatus: {
                    IsHidden: !integration,
                    MetaData: JSON.stringify({
                        mappingValues: Enums.SyncStatus,
                        colourMappingValues:{
                            [Enums.SyncStatusColor.Never]: Enums.SyncStatus.Never,
                            [Enums.SyncStatusColor.Pending]: Enums.SyncStatus.Pending,
                            [Enums.SyncStatusColor.Synced]: Enums.SyncStatus.Synced,
                            [Enums.SyncStatusColor.Failed]: Enums.SyncStatus.Failed,
                            [Enums.SyncStatusColor.NotSyncable]: Enums.SyncStatus.NotSyncable,
                            [Enums.SyncStatusColor.Delete]: Enums.SyncStatus.Delete,
                            [Enums.SyncStatusColor.Deleted]: Enums.SyncStatus.Deleted,
                        }
                    })
                },
                CustomerSyncMessage: {
                    IsHidden: !integration
                },
                CustomFilter1: {
                    CellType: 'icon'
                },
                CustomFilter2: {
                    CellType: 'icon'
                }
            },
            tableDataEndpoint: '/Customer/GetCustomers',
            tableName: 'customers',
            tableNoun: 'Customer',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'CustomerGroupIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        queryPath: '/CustomerGroup',
                        label: 'Customer Group',
                        hiddenWhileLoading: true
                    },
                    {
                        filterName: 'CustomerStatusIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        queryPath: '/CustomerStatus',
                        label: 'Customer Status',
                        showForSingleItem: true
                    },
                    {
                        filterName: 'CustomerTypeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        queryPath: '/CustomerType',
                        label: 'Customer Type',
                        showForSingleItem: true
                    },
                    {
                        filterName: 'SyncStatusList',
                        hardcodedOptions: Object.entries(Enums.SyncStatus).map(
                            ([l, v]) => ({
                                label: l,
                                value: l,
                                color: Enums.SyncStatusColor[l]
                            })
                        ),
                        label: 'Accounting',
                        dataOptionColorKey: 'color',
                        dataOptionValueKey: 'value',
                        hidden: !integration
                    },
                    {
                        type: 'switch',
                        label: 'Inactive Customers',
                        filterName: 'IncludeClosed',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'switch',
                        label: 'Archived Customers',
                        filterName: 'ShowArchived',
                        dataValueKey: 'IsArchived'
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "PopulateCustomers",
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
                    label: 'Open Customer',
                    default: true
                },
                {
                    type: 'warning',
                    name: 'archive',
                    icon: <IconArchive />,
                    label: 'Archive Customer',
                    activeLabel: 'Archiving Customer',
                    conditionalShow: {
                        key: 'IsArchived',
                        equals: false
                    }
                },
                {
                    type: 'default',
                    name: 'archive',
                    icon: <IconArchiveOff />,
                    label: 'Restore Archive',
                    activeLabel: 'Restoring Customer',
                    conditionalShow: {
                        key: 'IsArchived',
                        equals: true
                    }
                }
            ],
            bottomRightSpace: true,
            selectMode: 'bulk'
        }
    ), [integration])

    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    const [showImportModal, setShowImportModal] = useState(false)
    const [importType, setImportType] = useState(Enums.ImportType.Customer);

    const [exportBusyState, setExportBusyState] = useState(false)

    const [isMasterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const tableNounMapping = {
        [Enums.ImportType.Customer]: 'Customer',
        [Enums.ImportType.CustomerContact]: 'Contact'
    };

    const [queryParams, setQueryParams] = useState({})

    const undoArchive = useCallback((item: any) => {
        onAction('archive', item)
        updateNotification({
            id: 'archive-' + item.CustomerCode,
            loading: true,
            autoClose: false,
            color: 'scBlue',
            message: item.IsArchived ? 'Restoring' : 'Archiving' + ` ${customerTableProps.tableNoun} ` + item.CustomerCode
        })
    }, [])

    const archiveItemMutation = useMutation(
        [customerTableProps.tableName, 'archiveCustomeritem'],
        ({ item }) => Fetch.put({
            url: '/Customer/Archive?id=' + item.ID
        } as any),
        {
            onSuccess: (data, { item, name }) => {
                updateNotification({
                    id: 'archive-' + item.CustomerCode,
                    loading: false,
                    message: <Group justify={'apart'}>
                        <Text>{'Successfully ' + (item.IsArchived ? 'Restored' : 'Archived') + ` ${customerTableProps.tableNoun} ` + item.CustomerCode}</Text>
                        <Button size={'xs'} color={'scBlue'} onClick={() => undoArchive(data)}>Undo</Button>
                    </Group>,
                    autoClose: 8000,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'success' }))
            },
            onError: (error, { item, name }: any) => {
                updateNotification({
                    id: 'archive-' + item.CustomerCode,
                    loading: false,
                    message: 'Unable to ' + (item.IsArchived ? 'Restore' : 'Archive') + ` ${customerTableProps.tableNoun}`,
                    autoClose: true,
                    color: 'yellow.7'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'error' }))
            },
            onMutate: ({ item, name }: any) => {
                showNotification({
                    id: 'archive-' + item.CustomerCode,
                    loading: true,
                    message: item.IsArchived ? 'Restoring' : 'Archiving' + ` ${customerTableProps.tableNoun} ` + item.CustomerCode,
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

    const [selectedItems, setSelectedItems] = useState<any[]>([])

      


    const archiveSelectMutation = useMutation(
        [customerTableProps.tableName, 'archiveSelected'],
        ({ items }) => Fetch.post({
            url: '/Customer/ArchiveToggle',
            params: items
        } as any),
        {
            onSuccess: (data, { items }) => {
                updateNotification({
                    id: 'archiveAllItems',
                    loading: false,
                    message: `Successfully Archived ${customerTableProps.tableNoun}s`,
                    autoClose: 8000,
                    color: 'scBlue'
                })
            },
            onError: (error, { items }: any) => {
                updateNotification({
                    id: 'archiveAllItems',
                    loading: false,
                    message: `Unable to archive ${customerTableProps.tableNoun}s`,
                    autoClose: true,
                    color: 'yellow.7'
                })
            },
            onMutate: ({ items }: any) => {
                showNotification({
                    id: 'archiveAllItems',
                    loading: true,
                    message: `Archiving ${customerTableProps.tableNoun}s`,
                    autoClose: false,
                    color: 'scBlue'
                })
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )

    const selectedItemsAllArchived = useMemo(() => selectedItems.filter(x => x.IsArchived).length === selectedItems.length, [selectedItems])

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/customer/' + item.ID)
        } else if (name === 'archive') {
            archiveItemMutation.mutate({ item, name })
        }
    }, [])

    /*const getIntegration = async () => {
        let integration = await IntegrationService.getIntegration();
        setIntegration(integration);
    };*/

    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const handleFilteredExport = async () => {
        handleExport(false)
    }
    const handleFullExport = async () => {
        handleExport(true)
    }

    const handleOpenImportModal = (type) => {
        setImportType(type);
        setShowImportModal(true);
    };

    const [refreshToggle, setRefreshToggle] = useState(false)

    const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [customerTableProps.tableName, 'tableData'] })
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
            await DownloadService.downloadFile('POST', '/Customer/GetExportedCustomers', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
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

    const handleContactExport = async () => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await DownloadService.downloadFile('POST', '/Customer/GetExportedContacts', null, false, false, "", "", null, false, (() => {
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

    const handleLocationExport = async () => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await DownloadService.downloadFile('POST', '/Customer/GetExportedLocations', null, false, false, "", "", null, false, (() => {
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

    const handleArchiveSelected = () => {
        archiveSelectMutation.mutate(
            { items: [...selectedItems.filter(x => selectedItemsAllArchived ? x.IsArchived : !x.IsArchived).map(x => x.ID)] }
        )
    }

    const buttonIconMode = useMediaQuery('(max-width: 400px)');

    return (
        <>

            <ScDataImportModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                tableNoun={tableNounMapping[importType] || ''}
                importType={importType}
            />

            <ScTable
                {...customerTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
                onSelected={setSelectedItems}
            >
                {
                    selectedItems.length !== 0 &&
                    <Group gap={'xs'}>
                        <Button
                            variant={'outline'}
                            color={'yellow.7'}
                            leftSection={archiveSelectMutation.isLoading ? <Loader color={'scBlue'} size={15} /> : <IconArchive />}
                            disabled={archiveSelectMutation.isLoading}
                            onClick={handleArchiveSelected}
                        >
                            {selectedItemsAllArchived ? 'Unarchive Selected' : 'Archive Selected'}
                        </Button>
                    </Group>
                }

                <Group gap={5}>
                    {isMasterOfficeAdminPermission && (
                        <Menu>
                            <Menu.Target>
                                <Button
                                    variant={'subtle'}
                                    color={'gray.8'}
                                    rightSection={!buttonIconMode && <IconTableImport size={15} />}
                                    miw={buttonIconMode ? 'auto' : ''}
                                    px={buttonIconMode ? 7 : ''}
                                >
                                    {
                                        buttonIconMode ? <IconTableImport size={15} /> :
                                            'Import'
                                    }
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    onClick={() => handleOpenImportModal(Enums.ImportType.Customer)}
                                    leftSection={<IconUser size={14} />}
                                    disabled={exportBusyState}
                                >
                                    Customer Import
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() => handleOpenImportModal(Enums.ImportType.CustomerContact)}
                                    leftSection={<IconAddressBook size={14} />}
                                    disabled={exportBusyState}
                                >
                                    Contact Import
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
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
                                <Menu.Item
                                    onClick={handleContactExport}
                                    leftSection={<IconAddressBook size={15} />}
                                    disabled={exportBusyState}
                                >
                                    Contact Export
                                </Menu.Item>
                                <Menu.Item
                                    onClick={handleLocationExport}
                                    leftSection={<IconHomeMove size={15} />}
                                    disabled={exportBusyState}
                                >
                                    Location Export
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
                </Group>

                <Link href={'/customer/create'} onClick={() => Helper.nextLinkClicked('/customer/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Customer
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default CustomersTable