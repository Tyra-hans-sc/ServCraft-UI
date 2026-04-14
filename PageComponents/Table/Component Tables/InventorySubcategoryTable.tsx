import { FC, useCallback, useMemo } from "react";
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

const InventorySubcategoryTable: FC = () => {

    const inventorySubcategoryTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.InventorySubcategory, undefined),
            staticColumnMapping: [
                {
                    ColumnName: 'Description',
                    Label: 'Name',
                    ID: 'subcatName',
                    CellType: 'link',
                    Sortable: false,
                    MetaData: JSON.stringify({
                        href: '/inventory-subcategory/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                {
                    ColumnName: 'InventoryCategoryDescription',
                    Label: 'Inventory Category',
                    CellType: 'status',
                    ID: 'subcatAccCode'
                },
                {
                    ColumnName: 'Code',
                    Label: 'Account Code',
                    ID: 'subcatAccCode'
                },
                {
                    ColumnName: 'ModifiedBy',
                    Label: 'Updated By',
                    ID: 'subcatUpdatedBy'
                },
                {
                    ColumnName: 'ModifiedDate',
                    CellType: 'date',
                    Label: 'Updated Date',
                    ID: 'subcatUpdatedDate',
                },
                {
                    ColumnName: 'IsActive',
                    CellType: 'icon',
                    Label: 'Active',
                    ID: 'subcatIsActive',
                }
            ],
            tableDataEndpoint: '/InventorySubcategory/GetInventoryCategories',
            tableName: 'subcategory',
            tableNoun: 'Subcategory',
            tableAltMultipleNoun: 'Subcategories',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'CategoryIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        queryPath: '/InventoryCategory/false',
                        label: 'Category'
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
                    }
                ],
                showIncludeDisabledOptionsToggle: true
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Subcategory',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single'
        }
    ), [])

    const router = useRouter()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/inventory-subcategory/' + item.ID)
        }
    }, [])

    return (
        <>
            <ScTable
                {...inventorySubcategoryTableProps}
                onAction={onAction}
            >
                <Link href={'/inventory-subcategory/create'} onClick={() => Helper.nextLinkClicked('/inventory-subcategory/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add {inventorySubcategoryTableProps.tableNoun}
                    </Button>
                </Link>
            </ScTable>
        </>
    )
}

export default InventorySubcategoryTable
