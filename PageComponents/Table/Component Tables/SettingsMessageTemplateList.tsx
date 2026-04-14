import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import Helper from "@/utils/helper";
import * as Enums from '@/utils/enums';
import { ResultResponse, SignatureTemplate } from "@/interfaces/api/models";


const SettingsMessageTemplateList: FC = () => {

    const messageTemplateTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Name',
                    Label: 'Name',
                    ID: 'name',
                    CellType: 'link',
                    Sortable: false,
                    MetaData: JSON.stringify({
                        href: '/settings/template/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                {
                    ColumnName: 'Subject',
                    Label: "Subject",
                    CellType: 'none',
                    ID: 'subject'
                },
                {
                    ColumnName: 'Module',
                    Label: 'Module',
                    CellType: 'status',
                    ID: 'module',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.Module,
                    })
                },
                {
                    ColumnName: 'CreatedDate',
                    Label: "Created",
                    CellType: "date",
                    ID: 'createdDate',
                },
                {
                    ColumnName: 'CreatedBy',
                    Label: "Created By",
                    CellType: "none",
                    ID: 'createdBy',
                },
                {
                    ColumnName: 'ModifiedDate',
                    Label: "Modified",
                    CellType: "date",
                    ID: 'ModifiedDate',
                },
                {
                    ColumnName: 'ModifiedBy',
                    Label: "Modified By",
                    CellType: "none",
                    ID: 'ModifiedBy',
                },
            ],
            tableDataEndpoint: '/Template/GetTemplates',
            tableName: 'templates',
            tableNoun: 'Message Template',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'ModuleList',
                        hardcodedOptions: Object.entries(Enums.Module)
                            .filter(x => [
                                    'Appointment',
                                    'Collection',
                                    'Customer',
                                    'Supplier',
                                    'Invoice',
                                    'JobCard',
                                    'Product',
                                    'Query',
                                    'Quote',
                                    'CustomerZone',
                                    'PurchaseOrder',
                                ].includes(x[0])
                            ).map(
                                ([l, v]) => ({
                                    label: Enums.getEnumStringValue(Enums.Module, v, true) || '',
                                    value: l
                                })
                            ).sort((a, b) => a.label < b.label ? -1 : 1),
                        label: 'Module',
                    }
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',
        }
    ), [])

    const router = useRouter()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({});

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/settings/template/' + item.ID)
        }
    }, [])

    // const [refreshToggle, setRefreshToggle] = useState(false)

    return (
        <>
            <ScTable
                {...messageTemplateTableProps}
                actionStates={actionStates}
                onAction={onAction}
                // forceDataRefreshFlipFlop={refreshToggle}
            >

                <Link
                    href={'/settings/template/create'}
                    onClick={() => Helper.nextLinkClicked('/settings/template/create')}
                >
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Template
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default SettingsMessageTemplateList