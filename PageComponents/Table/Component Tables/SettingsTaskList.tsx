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

const SettingsTaskTemplateList: FC = () => {

    const taskTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Name',
                    Label: 'Name',
                    ID: 'name',
                    CellType: 'link',
                    Sortable: false,
                    MetaData: JSON.stringify({
                        href: '/settings/task/',
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
                        mappingValues: {
                            JobCard: Enums.Module.JobCard,
                            Query: Enums.Module.Query
                        },
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
            tableDataEndpoint: '/TaskTemplate/GetTaskTemplates',
            tableName: 'tasks',
            tableNoun: 'Task',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'ModuleList',
                        hardcodedOptions: Object.entries({
                            JobCard: Enums.Module.JobCard,
                            Query: Enums.Module.Query
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
            router.replace('/settings/task/' + item.ID)
        }
    }, [])

    // const [refreshToggle, setRefreshToggle] = useState(false)

    return (
        <>
            <ScTable
                {...taskTableProps}
                actionStates={actionStates}
                onAction={onAction}
                // forceDataRefreshFlipFlop={refreshToggle}
            >

                <Link
                    href={'/settings/task/create'}
                    onClick={() => Helper.nextLinkClicked('/settings/task/create')}
                >
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Task
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default SettingsTaskTemplateList