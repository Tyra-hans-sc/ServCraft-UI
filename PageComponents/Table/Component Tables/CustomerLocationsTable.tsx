import React, { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ColumnMappingMetaData, ScTableProps} from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import {
    IconEdit, IconPlus,
} from "@tabler/icons";
import {Button} from "@mantine/core";
// import ManageLocation from "@/components/modals/location/manage-location";
import {useQuery} from "@tanstack/react-query";
import CustomerService from "@/services/customer/customer-service";
import LocationForm from "@/PageComponents/customer/LocationForm";
import { LocationDTO } from "@/interfaces/api/models";



const CustomerLocationsTable: FC<{customerId?: string; supplierId?: string; module: number; canEdit?: boolean; accessStatus: any, moduleData: any, updateModuleData: () => void}> = (props) => {

    const [customerLocations, setCustomerLocations] = useState<LocationDTO[]>([]);

    const locationTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    Label: 'Description',
                    ID: 'Description',
                    ColumnName: 'Description',
                    CellType: 'none',
                }, {
                    Label: 'Type',
                    ID: 'LocationType',
                    ColumnName: 'LocationType',
                    CellType: 'status',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.LocationType,
                    } as ColumnMappingMetaData)
                },
                {
                    Label: 'Address',
                    ID: 'LocationDisplay',
                    ColumnName: 'LocationDisplay',
                    CellType: 'none',
                },
                {
                    Label: 'Country',
                    ID: 'CountryDescription',
                    ColumnName: 'CountryDescription',
                    CellType: 'none',
                },
                {
                    Label: 'Primary Location',
                    ID: 'IsPrimary',
                    ColumnName: 'IsPrimary',
                    CellType: 'icon',
                }
            ],
            tableDataEndpoint: '/Location/GetLocations',
            tableName: 'locations1' + props.module,
            tableNoun: 'Location',
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Active locations',
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
                    label: 'Edit Location',
                    default: true,
                    conditionalDisable: () => (typeof props.canEdit !== 'undefined' ? !props.canEdit : false)
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',
            bypassGlobalState: true,
            tableDataOnLoad: (res) => {setCustomerLocations(res.Results as LocationDTO[]);}
        }
    ), [])


    const [triggerRefresh, triggerTableRefreshToggle] = useState(false)
    const [manageLocation, setManageLocation] = useState<any>(null)

    const onSavedLocationData = () => {
        setManageLocation(null);
        triggerTableRefreshToggle(p => !p);
    }


    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            setManageLocation(item)
            // router.replace('/job/' + item.ID)
        }
    }, [])


    const countries = useQuery(['countries'], () => CustomerService.getCountries())
    return (
        <>
            {
                !!manageLocation &&
                (<LocationForm
                    backButtonText={undefined} isNew={!manageLocation?.ID} location={manageLocation}
                    module={props.module} moduleData={props.moduleData}
                    countries={countries.data}
                    defaultValues={{
                        primaryToggle: {
                            alwaysChecked: (locationType) => {
                                return !customerLocations.some(location => location.LocationType == Enums.LocationType[locationType])
                            },
                            color: (locationType) => !customerLocations.some(location => location.LocationType == Enums.LocationType[locationType]) ?
                                'var(--mantine-color-blue-1)' : undefined,
                        }
                    }}
                    onSave={onSavedLocationData} onCancel={() => setManageLocation(null)} accessStatus={props.accessStatus}
                />
                /*||
                <ManageLocation backButtonText={null} isNew={!manageLocation?.ID} location={manageLocation}
                                module={props.module} moduleData={props.moduleData}
                                countries={countries.data}
                                onSave={onSavedLocationData} onCancel={() => setManageLocation(null)} accessStatus={props.accessStatus}
                />*/)

}
            <ScTable
                {...locationTableProps}
                onAction={onAction}
                forceDataRefreshFlipFlop={triggerRefresh}
            >
                {
                    (props.canEdit ?? true) &&
                    <Button
                        color={'scBlue'}
                        rightSection={<IconPlus size={14} />}
                        onClick={() => setManageLocation({})}
                    >
                        Add {locationTableProps.tableNoun}
                    </Button>
                }
            </ScTable>
        </>
    )
}


export default CustomerLocationsTable
