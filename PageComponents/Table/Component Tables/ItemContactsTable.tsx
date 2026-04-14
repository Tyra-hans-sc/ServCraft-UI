import React, { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ColumnMappingData, ScTableProps} from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import {
    IconEdit, IconPlus,
} from "@tabler/icons";
import {Button} from "@mantine/core";
import ManageContact from "@/components/modals/contact/manage-contact";

const ItemContactsTable: FC<{customerId?: string; supplierId?: string; module: number; canEdit?: boolean; accessStatus: any, moduleData: any, updateModuleData: () => void}> = (props) => {

    const columnMapping = useMemo<ColumnMappingData[]>(
        () => [
            {
                Label: 'Contact Name',
                ID: 'FullName',
                ColumnName: 'FullName',
                CellType: 'bold',
            },
            ...(props.module === Enums.Module.Supplier ? [
                {
                    Label: 'User Name',
                    ID: 'UserName',
                    ColumnName: 'UserName',
                }
            ] : []) as any,
            {
                Label: 'Email Address',
                ID: 'EmailAddress',
                ColumnName: 'EmailAddress',
            },
            {
                Label: 'Mobile Number',
                ID: 'MobileNumber',
                ColumnName: 'MobileNumber',
            },
            {
                Label: 'Designation',
                ID: 'DesignationDescription',
                ColumnName: 'DesignationDescription',
                CellType: 'Description',
            },
            {
                Label: 'Primary Contact',
                ID: 'IsPrimary',
                ColumnName: 'IsPrimary',
                CellType: 'icon',
            },
            ...(props.module === Enums.Module.Customer ? [
                {
                    Label: 'Accounting Contact',
                    ID: 'IsPrimaryAccount',
                    ColumnName: 'IsPrimaryAccount',
                    CellType: 'icon',
                }
            ] : []) as any

        ], [props.module]
    )

    const contactTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: columnMapping,
            tableDataEndpoint: props.module === Enums.Module.Supplier ? '/SupplierContact/GetContacts' : '/Contact/GetContacts',
            tableName: 'contacts1' + props.module,
            tableNoun: 'Contact',
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Active contacts',
                        filterName: 'IsActive',
                        defaultValue: true,
                        // default = inclusive for switch
                        inclusion: 'exclusive',
                        dataValueKey: 'IsActive',
                    },
                    {
                        label: '',
                        type: 'hidden',
                        filterName: props.customerId ? 'customerId' : 'supplierId',
                        defaultValue: props.customerId || props.supplierId
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "PopulateJobs",
                        defaultValue: false
                    }
                ],
                showIncludeDisabledOptionsToggle: false
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Edit Contact',
                    default: true,
                    conditionalDisable: () => (typeof props.canEdit !== 'undefined' ? !props.canEdit : false)
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',
            bypassGlobalState: true
        }
    ), [])


    const [triggerRefresh, triggerTableRefreshToggle] = useState(false)
    const [manageContact, setManageContact] = useState<any>(null)

    const onSavedContactData = () => {
        setManageContact(null);
        triggerTableRefreshToggle(p => !p);
    }


    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            setManageContact(item)
            // router.replace('/job/' + item.ID)
        }
    }, [])



    return (
        <>
            {
                !!manageContact &&
                <ManageContact isNew={!manageContact?.ID} contact={manageContact} module={props.module} moduleData={props.moduleData}
                               onSave={onSavedContactData} onCancel={() => setManageContact(null)} accessStatus={props.accessStatus}
                               backButtonText={null}
                />
            }
            <ScTable
                {...contactTableProps}
                onAction={onAction}
                forceDataRefreshFlipFlop={triggerRefresh}
            >
                {
                    (props.canEdit ?? true) &&
                    <Button
                        color={'scBlue'}
                        rightSection={<IconPlus size={14} />}
                        onClick={() => setManageContact({})}
                    >
                        Add {contactTableProps.tableNoun}
                    </Button>
                }
            </ScTable>
        </>
    )
}


export default ItemContactsTable
