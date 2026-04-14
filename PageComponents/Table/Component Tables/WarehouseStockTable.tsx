import { FC, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps } from "@/PageComponents/Table/table-model";
import { Button, Flex, Group, Menu, Tooltip, } from "@mantine/core";
import {
    IconEdit,
} from "@tabler/icons";
import * as Enums from '@/utils/enums';
import ManageInventoryWarehouseStockDrawer from "@/PageComponents/Inventory/ManageInventoryWarehouseStockDrawer";
import InventoryItemDrawer from "@/PageComponents/Inventory/InventoryItemDrawer";
import { IconFilterOff, IconFilterStar, IconLayoutSidebarRightExpand, IconTableExport } from "@tabler/icons-react";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";
import { showNotification, updateNotification } from "@mantine/notifications";
import DownloadService from "@/utils/download-service";
import WarehouseTypeIcon from "@/PageComponents/Warehouse/WarehouseTypeIcon";

const WarehouseStockTable: FC = () => {

    const [selectedInventory, setSelectedInventory] = useState<any>(null)
    const [selectedStock, setSelectedStock] = useState<any>(null)

    const onAction = (action, item) => {
        if (action === 'open') {
            setSelectedStock(item)
            setSelectedInventory(null)
        } else if (action === 'openInventory') {
            setSelectedInventory(item?.Inventory)
            setSelectedStock(null)
        }
    }

    const [refreshData, setRefreshData] = useState(false)

    const [queryParams, setQueryParams] = useState({})

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));
    const buttonIconMode = useMediaQuery('(max-width: 500px)');
    const [exportBusyState, setExportBusyState] = useState(false)

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
            await DownloadService.downloadFile('POST', '/WarehouseStock/GetExportedStock', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
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

    const warehouseStockTableProps = useMemo<ScTableProps>(() => (
        {
            columnMappingModelName: "WarehouseStockList",
            columMappingOverrideValues: {
                InventoryCode: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/inventory/',
                        slug: 'InventoryID',
                        triggerAction: 'openInventory'
                    }),
                    /*MetaData: JSON.stringify({
                        triggerAction: 'openInventory'
                    } as ColumnMappingMetaData)*/
                },
                WarehouseCode: {
                    DisplayValueFunction: (x) => <Flex align={"center"} gap={'xs'}>
                        <WarehouseTypeIcon warehouse={x?.Warehouse} />
                        <span>{x?.Warehouse?.Code}</span>
                    </Flex>,

                },
                StockItemTypeString: {
                    CellType: 'stockItemType',
                },
            },
            openColumnSettings: {
                text: "Open",
                triggerAction: "open"
            },
            module: Enums.Module.Inventory, // this is intentional as it depends on inventory category/subcategory for the filters (server side already handles column mappings manually)
            tableDataEndpoint: '/WarehouseStock/GetWarehouseStocks',
            tableName: 'warehouseStock',
            tableNoun: 'Stock',
            tableAltMultipleNoun: 'Stock',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'WarehouseIDs',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Code'],
                        queryPath: '/Warehouse/GetUserWarehouses',
                        label: 'Warehouse'
                    },
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
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconLayoutSidebarRightExpand />,
                    label: 'Edit Stock',
                    default: true
                }/*,
                {
                    type: 'default',
                    name: 'openInventory',
                    icon: <IconEditCircle />,
                    label: 'Open Inventory',
                    default: true
                }*/
            ],
            bottomRightSpace: true,
            selectMode: 'single',
            onAction: onAction,
        }
    ), [])

    // const router = useRouter()
    // const onAction = useCallback((name: string, item: any) => {
    //     if (name === 'open') {
    //         router.replace('/warehouseStock/' + item.ID)
    //     }
    // }, [])

    return (
        <>

            <ManageInventoryWarehouseStockDrawer
                warehouseStockItem={selectedStock}
                onClose={() => setSelectedStock(null)}
                onSaved={() => {
                    setSelectedStock(null)
                    setRefreshData(p => !p)
                }}
            />

            <InventoryItemDrawer
                inventory={selectedInventory}
                show={!!selectedInventory}
                isNew={!selectedInventory}
                onClose={() => setSelectedInventory(null)}
                onInventorySave={() => {
                    setSelectedInventory(null)
                    setRefreshData(p => !p)
                }}
                onInventorySavedRefreshOnly={() => {
                    setRefreshData(p => !p)
                }}
                onSetInventory={setSelectedInventory}
            />

            <ScTable
                {...warehouseStockTableProps}
                forceDataRefreshFlipFlop={refreshData}
                onTableQueryStateChanged={handleQueryParmsChanged}
            // onAction={onAction}
            >
                <Group gap={5}>
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
                <Flex align={'center'} gap={'sm'}>

                    {/* <Tooltip label={`Your package allows for a maximum of ${maxCount ?? 0} warehouseStock`} color={'goldenrod'}>
                        <IconCrown size={18} color={'goldenrod'} style={{cursor: 'help'}} />
                    </Tooltip>

               */}


                </Flex>
            </ScTable>
        </>
    )
}


export default WarehouseStockTable
