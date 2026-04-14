import {FC, useCallback, useState} from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ScTableProps, TableActionStates} from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import {Button} from "@mantine/core";
import {useRouter} from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import {IconEyeEdit, IconPlus} from "@tabler/icons-react";
import {useQueryClient} from "@tanstack/react-query";
import ScDataPreview, {ScDataPreviewProps} from "@/PageComponents/Table/ScDataPreview";
import Link from "next/link";
import Helper from "@/utils/helper";

const projectsTableProps: ScTableProps = {
    columnMappingModelName: Enums.ColumnMapping.Project,
    columMappingOverrideValues: {
        EmployeeFullName: {
            MetaData: JSON.stringify({
                multipleItems: {
                    keyName: 'Employee',
                    itemLabelKey: 'FullName',
                    colorName: 'DisplayColor'
                }
            })
        },
        ProjectNumber: {
            CellType: 'link',
            MetaData: JSON.stringify({
                href: '/project/',
                slug: 'ID'
            })
        },
        IsClosed: {
            InverseLogic: true
        }
    },
    tableDataEndpoint: '/Project/GetProjects',
    tableName: 'jobs3',
    tableNoun: 'Project',
    actions: [
        {
            type: 'default',
            name: 'open',
            icon: <IconEdit />,
            label: 'Open Project',
            default: true
        }/*,
        {
            type: 'default',
            name: 'preview',
            icon: <IconEyeEdit />,
            label: 'Preview Project'
        }*/
    ],
    bottomRightSpace: true,
}
/*const previewDataProps: ScDataPreviewProps[] = [
    {
        type: 'text',
        label: 'Customer',
        key: 'CustomerName'

    },
    {
        type: 'text',
        label: 'Contact',
        key: 'CustomerContactFullName'

    },
    {
        type: 'text',
        label: 'Description',
        key: 'Description'

    },
    {
        type: 'text',
        label: 'Items',
        key: 'InventoryDescription'

    },
    {
        type: 'text',
        label: 'Job Type',
        key: 'JobTypeName'

    },
    {
        type: 'date',
        label: 'Start Date',
        key: 'StartDate'

    },
    {
        type: 'employee',
        label: 'Assigned Employees',
        key: 'Employees'

    }
]*/

const ProjectsTable: FC = () => {

    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({});

    const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/project/' + item.ID)
        } else if (name === 'preview') {
            setShownPreviewItem(item)
        }
    }, [])



    return (
        <>
            {/*<ScDataPreview
                config={previewDataProps}
                data={shownPreviewItem}
                onClose={() => setShownPreviewItem(null)}
                onOpen={() => onAction('open', shownPreviewItem)}
            />*/}

            <ScTable
                {...projectsTableProps}
                actionStates={actionStates}
                onAction={onAction}
            >

                <Link href={'/project/create'} onClick={() => Helper.nextLinkClicked('/project/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Project
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default ProjectsTable