import React, { FC, useMemo, useState } from "react";
import tabStyles from "@/PageComponents/Table/Table Filter/ScTabFilter.module.css";
import { Button, Tabs } from "@mantine/core";
import { ScTableProps } from "@/PageComponents/Table/table-model";
import * as Enums from "@/utils/enums";
import ScTable from "@/PageComponents/Table/ScTable";
import storeService from "@/services/store/store-service";
import storage from "@/utils/storage";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import helper from "@/utils/helper";
import permissionService from "@/services/permission/permission-service";
import warehouseService from "@/services/warehouse/warehouse-service";

export interface MockVanStockItem {
    ID: string
    NumberPlate: string
    EmployeeName: string
    StockStatus: 'full' | 'good' | 'low' | 'empty'
    LastStockTakeDate: string
    Location: string
}

const VanStockList: FC = () => {

    const onAction = (action, item) => {
        console.log(action, item)
    }

    const getMultiStore = async () => {
        let isMultiS = await storeService.isMultiStore(storage.getCookie(Enums.Cookie.employeeID));
        return isMultiS;
    };

    const [tableDataCount, setTableDataCount] = useState(0);

    const { data: canCreateInfo } = useQuery(['canCreateInfo', tableDataCount], warehouseService.mobileWarehouseCanCreate);

    const { data: isMultiStore } = useQuery(['isMultiStore'], getMultiStore);
    const [isVanManager] = useState<boolean>(permissionService.hasPermission(Enums.PermissionName.VanManage));

    const vanStockTableProps = useMemo<ScTableProps>(() => (
        {
            // staticColumnMapping: [
            //     {
            //         ColumnName: 'Code',
            //         Label: 'Code',
            //         ID: 'code',
            //         CellType: 'link',
            //         Sortable: false,
            //         MetaData: JSON.stringify({
            //             href: '/van/',
            //             slug: 'ID'
            //         }),
            //         IsRequired: true
            //     },
            //     {
            //         ColumnName: 'MobileDashboardEmployeeFullName',
            //         Label: 'Employee Name',
            //         ID: 'empname',

            //     },
            //     {
            //         ColumnName: 'MobileDashboardStockStatus',
            //         Label: 'Stock Status',
            //         CellType: 'status',
            //         ID: 'sstatus',

            //     },
            //     {
            //         ColumnName: 'MobileDashboardLastStocktakeDate',
            //         CellType: 'date',
            //         Label: 'Last Stock Take',
            //         ID: 'lstocktake',

            //     },
            //     {
            //         ColumnName: 'MobileDashboardLocation',
            //         CellType: 'bold',
            //         Label: 'Location',
            //         ID: 'loco',
            //     },
            //     {
            //         ColumnName: 'IsActive',
            //         Label: 'Active',
            //         ID: 'isActive',
            //         CellType: 'icon'
            //     },
            // ],
            module: Enums.Module.VanStock,
            tableDataEndpoint: '/Warehouse/Dashboard',
            tableName: 'vanStock',
            tableNoun: 'Van Stock',
            tableAltMultipleNoun: 'Van Stock',
            tableFilterMetaData: {
                options: isVanManager ? [
                    {
                        type: 'switch',
                        label: 'Include Disabled',
                        filterName: 'IncludeDisabled',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsActive'
                    },
                    ...(isMultiStore ? [
                        {
                            filterName: 'StoreIDs',
                            dataOptionValueKey: 'ID',
                            orderByKey: 'IsDefault',
                            queryFunction: (props) => storeService.getStores('', true, storage.getCookie(Enums.Cookie.employeeID)),
                            label: 'Store',
                            hiddenWhileLoading: true
                        }] : []),
                    {
                        filterName: 'EmployeeIDs',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['FullName', 'EmailAddress', 'UserName'],
                        queryPath: '/Employee/GetEmployees',
                        label: 'Employee',
                        dataOptionColorKey: 'DisplayColor',
                    }
                ] : []
            },
            cardMapping: {
                link: {
                    key: 'Code',
                    href: '/van/',
                    slug: 'ID'
                },
                // location: {
                //     key: 'MobileDashboardLocation'
                // },
                status: {
                    key: 'MobileDashboardStockStatus'
                },
                employee: {
                    key: 'MobileDashboardEmployeeFullName'
                },
                date: {
                    key: 'MobileDashboardLastStocktakeDate'
                },
                active: {
                    key: 'IsActive'
                }
            },
            useMapView: false,
            bottomRightSpace: true,
            selectMode: 'single',
            onAction: onAction,
            tableDataOnLoad(data) {
                setTableDataCount(data?.TotalResults || 0);
            },
        }
    ), [isMultiStore])


    return <>
        <ScTable
            {...vanStockTableProps}
        >
            {isVanManager && <Link href={'/van/create'} onClick={() => helper.nextLinkClicked('/van/create')}>
                <Button disabled={!(canCreateInfo?.CanCreate ?? false)}
                    title={canCreateInfo?.CanCreate ? '' : `You can only have up to ${canCreateInfo?.MaxCount} active vans`}
                    color={'scBlue'} rightSection={<IconPlus size={14} />}>
                    Add Van
                </Button>
            </Link>}
        </ScTable>
    </>
}

export default VanStockList
