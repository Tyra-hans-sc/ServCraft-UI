import { FC, useCallback, useMemo } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps } from "@/PageComponents/Table/table-model";
import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import Helper from "@/utils/helper";

const InventoryCategoriesTable: FC = () => {

    const inventoryCategoryTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Description',
                    Label: 'Name',
                    ID: 'categoryDesc',
                    CellType: 'link',
                    Sortable: false,
                    MetaData: JSON.stringify({
                        href: '/inventory-category/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                {
                    ColumnName: 'Code',
                    Label: 'Account Code',
                    ID: 'categoryAccCode'
                },
                {
                    ColumnName: 'ModifiedBy',
                    Label: 'Updated By',
                    ID: 'catUpdatedBy'
                },
                {
                    ColumnName: 'ModifiedDate',
                    CellType: 'date',
                    Label: 'Updated Date',
                    ID: 'catUpdatedDate',
                },
                {
                    ColumnName: 'IsActive',
                    CellType: 'icon',
                    Label: 'Active',
                    ID: 'catIsActive',
                }
            ],
            tableDataEndpoint: '/InventoryCategory/GetInventoryCategories',
            tableName: 'category',
            tableNoun: 'Category',
            tableAltMultipleNoun: 'Categories',
            tableFilterMetaData: {
                options: [
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
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Category',
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
            router.replace('/inventory-category/' + item.ID)
        }
    }, [])

    return (
        <>
            <ScTable
                {...inventoryCategoryTableProps}
                onAction={onAction}
            >
                <Link href={'/inventory-category/create'} onClick={() => Helper.nextLinkClicked('/inventory-category/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add {inventoryCategoryTableProps.tableNoun}
                    </Button>
                </Link>
            </ScTable>
        </>
    )
}


export default InventoryCategoriesTable
