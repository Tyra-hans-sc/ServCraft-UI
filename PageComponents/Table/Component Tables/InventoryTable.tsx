import React, { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Group, Menu, Text, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconEdit,
    IconFilterOff,
    IconTableExport, IconTableImport
} from "@tabler/icons";
import {IconFilterStar, IconLayoutSidebarRightExpand, IconPlus} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import IntegrationService from '../../../services/integration-service';
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import ScDataImportModal from "@/PageComponents/Table/ScDataImportModal";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";
import InventoryItemDrawer from "@/PageComponents/Inventory/InventoryItemDrawer";
import helper from "@/utils/helper";

const InventoryTable: FC = () => {


    const [selectedInventory, setSelectedInventory] = useState<any>(null)
    const [createNew, setCreateNew] = useState(false)
    const [refresToggle, setRefreshToggle] = useState(false)

    const {data: integration} = useQuery(['integration', 'customer'], () => IntegrationService.getIntegration())

    const inventoryTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Inventory, undefined),
            module: Enums.Module.Inventory,
            columnMappingModelName: Enums.ColumnMapping.Inventory,
            columMappingOverrideValues: {
                Code: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/inventory/',
                        slug: 'ID',
                        triggerAction: 'openDrawer'
                    })
                },
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },
                StockItemType: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.StockItemType
                    }),
                    CellType: 'stockItemType',
                },
                InventorySyncStatus: {
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
                InventorySyncMessage: {
                    IsHidden: !integration
                },
                InventoryCategory: {
                    ColumnName: 'InventoryCategoryDescription'
                },
                InventorySubcategory: {
                    ColumnName: 'InventorySubcategoryDescription'
                },
                UnitOfMeasurement: {
                    ColumnName: 'UnitOfMeasurementName'
                },
                CustomBoolean1: {
                    CellType: 'icon'
                },
                CustomBoolean2: {
                    CellType: 'icon'
                },
                StockQuantity: {
                    DisplayValueFunction: (item) => item.IsQuantityTracked ? item.StockQuantity : '-'
                },
                IsQuantityTracked: {
                    // DisplayValueFunction: (item) => helper.isInventoryWarehoused(item),
                    CellType: 'icon'
                }
            },
            tableDataEndpoint: '/Inventory/GetInventories',
            tableName: 'inventory',
            tableNoun: 'Inventory',
            tableAltMultipleNoun: 'Inventory',
            thumbnailPropertyName: "ThumbnailUrl",
            imagePropertyName: "ImageUrl",
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'CategoryIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        queryPath: '/InventoryCategory/false',
                        label: 'Category',
                        fieldSettingSystemName: 'InventoryCategory'
                    },
                    {
                        filterName: 'SubcategoryIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        queryPath: '/InventorySubcategory/GetOnlyActive',
                        showIncludeDisabledToggle: true,
                        label: 'Subcategory',
                        // defaultValue: ["8c2aca98-c499-45f2-8cd6-6d83eee1bb75", "bf92b39a-3d34-4b1e-b63e-fb95a5b686f1"],
                        queryParams: {
                            onlyActive: 'false'
                        },
                        type: 'multiselect',
                        dataOptionSiblingFilterName: 'CategoryIDList',
                        dataOptionSiblingKey: 'InventoryCategoryID',
                        dataOptionGroupingKey: 'InventoryCategoryDescription',
                        fieldSettingSystemName: 'InventorySubcategory'
                    },
                    {
                        filterName: 'SupplierIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Name'],
                        queryPath: '/Supplier/IncludeDisabled/true',
                        label: 'Supplier',
                        fieldSettingSystemName: 'Supplier'
                    },
                    {
                        filterName: 'StockItemTypeIDList',
                        label: 'Item Type',
                        hardcodedOptions: [
                            {
                                label: 'Part',
                                value: 'Part'
                            },
                            {
                                label: 'Product',
                                value: 'Product'
                            },
                            {
                                label: 'Service',
                                value: 'Service'
                            }
                        ]
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
                        hidden: !integration
                    },
                    {
                        type: 'switch',
                        label: 'Include Disabled',
                        filterName: 'IncludeClosed',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "Populate Inventory",
                        defaultValue: false
                    },
                    {
                        type: "hidden",
                        filterName: "PopulateThumbnails",
                        label: "Populate Thumbnails",
                        defaultValue: true
                    }
                ],
                showIncludeDisabledOptionsToggle: true
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Inventory',
                    default: true
                },
                {
                    type: 'default',
                    name: 'openDrawer',
                    icon: <IconLayoutSidebarRightExpand />,
                    label: 'View Inventory',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single'
        }
    ), [integration])

    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    const [showImportModal, setShowImportModal] = useState(false)

    const [exportBusyState, setExportBusyState] = useState(false)

    const [queryParams, setQueryParams] = useState({})

    const [isMasterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/inventory/' + item.ID)
        } else if (name === 'openDrawer') {
            setSelectedInventory(item)
        }
    }, [])

    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const handleFilteredExport = async () => {
        handleExport(false)
    }
    const handleFullExport = async () => {
        handleExport(true)
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
            await DownloadService.downloadFile('POST', '/Inventory/GetExportedInventory', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
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

    const buttonIconMode = useMediaQuery('(max-width: 500px)');

    /** recently added items */
    const [recentlyAdded, setRecentlyAdded] = useState<any[]>([])

    return (
        <>
            <InventoryItemDrawer
                inventory={selectedInventory}
                show={!!selectedInventory || createNew}
                isNew={createNew}
                onClose={() => {
                    setSelectedInventory(null)
                    setCreateNew(false)
                    setRefreshToggle(p => !p)
                }}
                onInventorySave={(item) => {
                    if(createNew) {
                        setRecentlyAdded(p => ([item, ...p]))
                    }
                    setSelectedInventory(null)
                    setCreateNew(false)
                    setRefreshToggle(p => !p)
                }}
                onInventorySavedRefreshOnly={(item) => {
                    setRefreshToggle(p => !p)
                    if(recentlyAdded.some(x => x.ID === item.ID)) {
                        setRecentlyAdded(recentlyAdded.map(x => x.ID === item.ID ? {...item} : x))
                    }
                }}
                onSetInventory={setSelectedInventory}
            />

            <ScDataImportModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                tableNoun={inventoryTableProps.tableNoun || ''}
                tableAltMultipleNoun={inventoryTableProps.tableAltMultipleNoun}
                importType={Enums.ImportType.Inventory}
            />

            <ScTable
                {...inventoryTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refresToggle}
                recentlyAdded={recentlyAdded}
            >
                <Group gap={5}>
                    {isMasterOfficeAdminPermission && (
                        <Button
                            variant={'subtle'}
                            color={'gray.8'}
                            rightSection={!buttonIconMode && <IconTableImport size={15} />}
                            miw={buttonIconMode ? 'auto' : ''}
                            px={buttonIconMode ? 7 : ''}
                            onClick={() => setShowImportModal(true)}
                        >
                            {
                                buttonIconMode ? <IconTableImport size={15} /> :
                                    'Import'
                            }
                        </Button>
                    )}
                    {exportPermission && (
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
                </Group>

                <Button
                    color={'scBlue'}
                    rightSection={<IconPlus size={14} />}
                    onClick={() => setCreateNew(true)}
                >
                    Add {inventoryTableProps.tableNoun}
                </Button>


            </ScTable>
        </>
    )
}


export default InventoryTable