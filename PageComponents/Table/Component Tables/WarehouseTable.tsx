import { ResultResponse, Warehouse } from '@/interfaces/api/models';
import { FC, useCallback, useMemo, useState } from 'react';
import { ScTableProps, TableActionStates } from '../table-model';
import * as Enums from '@/utils/enums';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import ScTable from '../ScTable';
import Link from 'next/link';
import { Button } from '@mantine/core';
import helper from '@/utils/helper';
import { useQuery } from '@tanstack/react-query';
import featureService from '@/services/feature/feature-service';
import constants from '@/utils/constants';
import permissionService from '@/services/permission/permission-service';
import storeService from '@/services/store/store-service';
import storage from '@/utils/storage';
import warehouseService from '@/services/warehouse/warehouse-service';

const WarehouseTable: FC<{ warehouseType: number }> = ({ warehouseType }) => {

    const [hasVanManagePermission] = useState(permissionService.hasPermission(Enums.PermissionName.VanManage));
    const isVan = useMemo(() => warehouseType === Enums.WarehouseType.Mobile, [warehouseType]);

    const [tableDataCount, setTableDataCount] = useState(0);
    const { data: canCreateInfo } = useQuery(['canCreateInfo', tableDataCount], warehouseService.mobileWarehouseCanCreate);

    const warehouseTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Code',
                    Label: 'Code',
                    ID: 'warehouseCode',
                    CellType: 'none',
                    Sortable: true,
                    Show: !isVan
                },
                {
                    ColumnName: 'Name',
                    Label: isVan ? 'Number Plate' : 'Name',
                    ID: 'warehouseName',
                    CellType: 'link',
                    Sortable: true,
                    MetaData: JSON.stringify({
                        href: '/settings/warehouse/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                // {
                //     ColumnName: 'WarehouseType',
                //     Label: "Type",
                //     CellType: 'status',
                //     ID: 'warehouseType',
                //     MetaData: JSON.stringify({
                //         mappingValues: {
                //             Van: Enums.WarehouseType.Mobile,
                //             ...Enums.WarehouseType
                //         }
                //     })
                // },
                {
                    ColumnName: 'StoreName',
                    Label: 'Store',
                    ID: 'warehouseStoreName',
                    CellType: 'none',
                    Sortable: true
                },
                {
                    ColumnName: 'EmployeeFullName',
                    Label: "Employee",
                    CellType: "employee",
                    ID: "warehouseEmployeeFullName",
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'EmployeeDisplayColor'
                    }),
                    Show: isVan
                },
                {
                    ColumnName: 'Description',
                    Label: 'Description',
                    ID: 'warehouseDescription',
                    CellType: 'none',
                    Sortable: true,
                    Show: !isVan
                },
                {
                    ColumnName: 'IsDefault',
                    Label: 'Default',
                    ID: 'warehouseIsDefault',
                    CellType: 'icon',
                    Sortable: true,
                    Show: !isVan
                },
                {
                    ColumnName: 'IsActive',
                    Label: 'Active',
                    ID: 'warehouseIsActive',
                    CellType: 'icon',
                    Sortable: true
                },
                {
                    ColumnName: 'CreatedDate',
                    Label: 'Created',
                    ID: 'warehouseCreatedDate',
                    CellType: 'date',
                    Sortable: true
                },
                {
                    ColumnName: 'CreatedBy',
                    Label: 'Created By',
                    ID: 'warehouseCreatedBy',
                    CellType: 'none',
                    Sortable: true
                },
                {
                    ColumnName: 'ModifiedDate',
                    Label: 'Modified',
                    ID: 'warehouseModifiedDate',
                    CellType: 'date',
                    Sortable: true
                },
                {
                    ColumnName: 'ModifiedBy',
                    Label: 'Modified By',
                    ID: 'warehouseModifiedBy',
                    CellType: 'none',
                    Sortable: true
                },
            ],
            tableDataEndpoint: '/Warehouse/GetWarehouses',
            tableName: `warehouses_${warehouseType}`,
            tableNoun: 'Warehouse',
            tableAltMultipleNoun: 'Warehouses',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'StoreIDs',
                        dataOptionValueKey: 'ID',
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => storeService.getStores(props.search ?? '', props.showAll ?? true, storage.getCookie(Enums.Cookie.employeeID)),
                        label: 'Store',
                        hiddenWhileLoading: true
                    },
                    {
                        filterName: "IncludeDisabled",
                        label: "Include Deactivated",
                        type: "switch"
                    },
                    {
                        filterName: "WarehouseType",
                        label: "Warehouse Type",
                        defaultValue: warehouseType,
                        type: "hidden"
                    }
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Warehouse',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',
            tableDataOnLoad(data) {
                setTableDataCount(data?.TotalResults || 0);
            },
        }
    ), [warehouseType])

    const router = useRouter()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({});

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/settings/warehouse/' + item.ID)
        }
    }, [])

    const [refreshToggle, setRefreshToggle] = useState(false)

    const addVan = () => {
        if (warehouseType !== Enums.WarehouseType.Mobile) {
            return;
        }
        router.push('/settings/warehouse/create');
    }

    return (
        <>
            <ScTable
                {...warehouseTableProps}
                actionStates={actionStates}
                onAction={onAction}
                forceDataRefreshFlipFlop={refreshToggle}
            >
                {warehouseType === Enums.WarehouseType.Mobile && hasVanManagePermission &&
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}
                        disabled={!(canCreateInfo?.CanCreate ?? false)}
                        title={canCreateInfo?.CanCreate ? '' : `You can only have up to ${canCreateInfo?.MaxCount} active vans`}
                        onClick={addVan}
                    >
                        Add Van
                    </Button>
                }
            </ScTable>
        </>
    )

};

export default WarehouseTable;