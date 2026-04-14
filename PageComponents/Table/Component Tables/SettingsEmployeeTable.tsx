import { FC, useCallback, useMemo, useState } from "react";
import {Button, Flex, Tooltip} from "@mantine/core";
import { useRouter } from "next/router";
import {
    IconEdit,
} from "@tabler/icons";
import {IconChessKing, IconPlus, IconUserStar} from "@tabler/icons-react";
import Link from "next/link";
import Helper from "../../../utils/helper";
import {ScTableProps, TableActionStates} from "@/PageComponents/Table/table-model";
import ScTable from "@/PageComponents/Table/ScTable";
import {Employee} from "@/interfaces/api/models";

const SettingsEmployeeTable: FC = () => {

    const employeeTableProps = useMemo<ScTableProps>(() => (
        {
            columnMappingModelName: 'EmployeeList',
            columMappingOverrideValues: {
                'FullName': {
                    // Label: 'Name',
                    Width: 220,
                    CellType: 'employee',
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'DisplayColor',
                        href: '/settings/employee/',
                        slug: 'ID'
                    }),
                    DisplayValueFunction: (x: Employee) => <Flex align={'center'} gap={5}><span>{x.FullName}</span>  {x.Owner && <Tooltip label="Owner" withArrow position="right" color={'goldenrod'} radius="sm" withinPortal><IconUserStar size={16} color={'var(--mantine-color-scBlue-9)'} /></Tooltip>}</Flex>,
                },
                /*'UserName': {
                    // CellType: 'initials',
                },
                'EmailAddress': {
                    // CellType: 'employee',
                },
                'MobileNumber': {
                    CellType: 'none',
                },*/
                'SendEmail': {
                    CellType: 'icon',
                },
                'SendSMS': {
                    CellType: 'icon',
                },
                /*'ModifiedBy': {
                    CellType: "none",
                },
                'ModifiedDate': {
                    CellType: "date",
                },*/
                'AuthUserIsActive': {
                    CellType: 'icon',
                }
            },
            tableDataEndpoint: '/Employee/GetEmployees',
            tableName: 'employees',
            tableNoun: 'Employee',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'IncludeDisabled',
                        label: 'Include disabled employees',
                        type: 'switch',
                    }
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Edit',
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
            router.replace('/settings/employee/' + item.ID)
        }
    }, [])

    return (
        <>
            <ScTable
                {...employeeTableProps}
                actionStates={actionStates}
                onAction={onAction}
            >
                <Link
                    href={'/settings/employee/create'}
                    onClick={() => Helper.nextLinkClicked('/settings/employee/create')}
                >
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Employee
                    </Button>
                </Link>
            </ScTable>
        </>
    )
}

export default SettingsEmployeeTable
