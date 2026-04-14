import React, { FC, useCallback, useMemo } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import { IconPlus } from "@tabler/icons-react";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import {getEnumStringValue} from "@/utils/enums";

const PurchasesTable: FC<{itemId: string; customerId: string; module: number}> = (props) => {

    const purchaseTableProps = useMemo<ScTableProps>(() => (
        {
            bypassGlobalState: true,
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.PurchaseOrder, undefined),
            columnMappingModelName: 'PurchaseOrderList',
            columMappingOverrideValues: {
                EmployeeFullName: {
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'EmployeeDisplayColor'
                    })
                },
                PurchaseOrderNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/purchase/',
                        slug: 'ID'
                    })
                },
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },
                PurchaseOrderStatus: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.PurchaseOrderStatus,
                        colourMappingValues: Enums.PurchaseOrderStatusColor
                    })
                },
                Module: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.Module,
                        // colourMappingValues: Enums.Status
                    })
                },
                PurchaseOrderSyncStatus: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.SyncStatus,
                        // colourMappingValues: Enums.Status
                    })
                },
            },
            tableDataEndpoint: '/PurchaseOrder/GetPurchaseOrders',
            tableName: 'itemPurchase' + props.module,
            tableNoun: 'Purchase Order',
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Include Cancelled',
                        filterName: 'IncludeCancelled',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "Populate Purchase Orders",
                        defaultValue: false
                    },
                    {
                        type: 'hidden',
                        filterName: 'ModuleIDList',
                        label: "Module",
                        defaultValue: [getEnumStringValue(Enums.Module, props.module)]
                    },
                    {
                        type: 'hidden',
                        filterName: 'ItemId',
                        label: "ItemId",
                        defaultValue: props.itemId
                    },
                ],
                showIncludeDisabledOptionsToggle: false
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Purchase Order',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'none'
        }
    ), [])

    const router = useRouter()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/purchase/' + item.ID)
        }
    }, [])


    return (
        <>
            <ScTable
                {...purchaseTableProps}
                onAction={onAction}
            >
                <Link
                    href={`/purchase/create?module=${props.module}&moduleID=${props.itemId}&customerID=${props.customerId}`}
                    onClick={() => Helper.nextLinkClicked('/purchase/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add {purchaseTableProps.tableNoun}
                    </Button>
                </Link>
            </ScTable>
        </>
    )
}


export default PurchasesTable
