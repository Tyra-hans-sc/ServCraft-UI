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

const allowedModules = [
    Enums.Module.JobCard,
    Enums.Module.Query,
    Enums.Module.Quote,
    Enums.Module.Invoice,
    Enums.Module.CustomerZone,
    Enums.Module.PurchaseOrder,
]

const SettingsTriggerList: FC = () => {


    const signatureTemplatesTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Name',
                    Label: 'Name',
                    ID: 'name',
                    CellType: 'link',
                    Sortable: false,
                    MetaData: JSON.stringify({
                        href: '/settings/trigger/',
                        slug: 'ID'
                    }),
                    IsRequired: true
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
                    ColumnName: 'RuleName',
                    Label: "Rule",
                    CellType: 'status',
                    ID: 'rule'
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
            tableDataEndpoint: '/Trigger/GetTriggers',
            tableName: 'triggers',
            tableNoun: 'Trigger',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'ModuleList',
                        hardcodedOptions: Object.entries(Enums.Module)
                            .filter(x => {
                                return allowedModules.includes(x[1])
                            })
                            .map(
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
            router.replace('/settings/trigger/' + item.ID)
        }
    }, [])

    // const [refreshToggle, setRefreshToggle] = useState(false)

    return (
        <>
            <ScTable
                {...signatureTemplatesTableProps}
                actionStates={actionStates}
                onAction={onAction}
                // forceDataRefreshFlipFlop={refreshToggle}
            >

                <Link href={'/settings/trigger/create'} onClick={() => Helper.nextLinkClicked('/settings/trigger/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Trigger
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default SettingsTriggerList