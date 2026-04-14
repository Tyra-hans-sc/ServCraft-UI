import React, { useState, useEffect, useContext, useRef, FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Storage from '../../../utils/storage';
import { Box, Flex, Button as MantineButton, Title, Text } from '@mantine/core';
import SimpleTable from '@/PageComponents/SimpleTable/SimpleTable';
import { useQuery } from '@tanstack/react-query';
import { TableAction } from '@/PageComponents/Table/table-model';
import { IconPlus, IconX } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';


export const getUnitsOfMeasurements = async () => {
    const res = await Fetch.post({
        url: '/unitofmeasurement/getUnitOfMeasurements',
        caller: location?.pathname,
        params: {
        }
    } as any)
    if (res && Array.isArray(res.Results)) {
        return res.Results as UnitOfMeasurement[]; // 
    } else {
        throw new Error(res.serverMessage || res.message || 'something went wrong');
    }
}

export interface UnitOfMeasurement {
    CreatedBy: string,
    CreatedDate: string,
    Name: string,
    ID: string,
    IsActive: boolean,
    ModifiedBy: string,
    ModifiedDate: string,
    RowVersion: string,
}

const InventoryUnitTable: FC = () => {

    const router = useRouter()

    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
    const getAccessStatus = () => {
        let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
        if (subscriptionInfo) {
            setAccessStatus(subscriptionInfo.AccessStatus);
        }
    }

    const [unitsOfMeasurement, setUnitsOfMeasurement] = useState<UnitOfMeasurement[]>([])

    const unitOfMeasurementQuery = useQuery(['unitOfMeasurement'], () => getUnitsOfMeasurements(), {
        onError: console.error
    })

    // Update units of measurement when query data changes
    useEffect(() => {
        if (unitOfMeasurementQuery.data) {
            setUnitsOfMeasurement(unitOfMeasurementQuery.data.filter(x => x.IsActive))
        }
    }, [unitOfMeasurementQuery.data])

    useEffect(() => {
        getAccessStatus();
    }, []);

    useEffect(() => {
        if (accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
            Helper.nextRouter(router.replace, "/");
        }
    }, [accessStatus]);

    const tableControls = useMemo<TableAction[]>(() => {
        return unitOfMeasurementQuery.data && [
            {
                label: 'Remove',
                activeLabel: 'Removing',
                name: 'remove',
                type: 'warning',
                icon: <IconX />
            }
        ] || []
    }, [unitOfMeasurementQuery.data])

    async function newUnit() {

        if (unitsOfMeasurement.find(unit => unit.Name === '')) {
            showNotification({
                id: 'newUnit',
                title: 'Failed to add unit',
                message: 'Unsaved blank unit already esists',
                color: 'yellow',
                loading: false,
                autoClose: 3000
            })
            return;
        }

        const newUnit = {
            Name: '',
            IsActive: true,
            ID: null,
            CreatedBy: null,
            CreatedDate: null,
            ModifiedBy: null,
            ModifiedDate: null,
            RowVersion: null
        } as any;

        setUnitsOfMeasurement([...unitsOfMeasurement, newUnit]);
    }

    const handleUnitChange = async (key, item, value) => {

        if (key === 'Name' && value === '') {
            showNotification({
                id: 'updateFieldSetting' + item.ID + key,
                title: 'Failed to update unit',
                message: 'Name cannot be blank',
                color: 'yellow',
                loading: false,
                autoClose: 3000
            })
            return;
        }

        const unitToUpdate = unitsOfMeasurement.find(unit => unit.ID === item.ID);

        if (unitToUpdate) {
            const updatedUnit = { ...unitToUpdate, [key]: value };


            try {
                const response = await Fetch.post({
                    url: '/unitofmeasurement',
                    caller: location?.pathname,
                    params: updatedUnit
                } as any);

                if (!response || response.error || response.serverMessage) {
                    showNotification({
                        id: 'updateFieldSetting' + item.ID + key,
                        title: 'Failed to update unit of measurement',
                        message: response.serverMessage || 'something went wrong',
                        color: 'yellow',
                        loading: false,
                        autoClose: 3000
                    })

                    const refreshUnits = unitsOfMeasurement.map(unit =>
                        unit.ID === item.ID ? updatedUnit : unit)

                    setUnitsOfMeasurement(refreshUnits?.filter(x => x.IsActive));

                    return;
                }

                const reposonseUnit = response;

                const updatedUnits = unitsOfMeasurement.map(unit =>
                    unit.ID === item.ID ? reposonseUnit : unit
                );
                setUnitsOfMeasurement(updatedUnits?.filter(x => x.IsActive));

                showNotification({
                    id: 'updateFieldSetting' + item.ID + key,
                    title: 'Unit of measurement updated successfully',
                    message: response.message,
                    color: 'green',
                    loading: false,
                    autoClose: 3000
                })

            } catch (error) {
                console.error('Failed to update unit of measurement', error);
            }


        }
    }



    const handleAction = async (name, item, actionItemIndex) => {
        if (name === 'remove') {


            if (item.ID === null) {
                setUnitsOfMeasurement(unitsOfMeasurement.filter(x => x.ID !== null && x.IsActive));

                return;
            }

            const unitToDelete = unitsOfMeasurement.find(unit => unit.ID === item.ID);

            if (unitToDelete) {

                try {
                    const response = await Fetch.destroy({
                        url: `/UnitOfMeasurement?id=${item.ID}`,
                        caller: location?.pathname
                    } as any);

                    if (!response || response.error || response.serverMessage) {
                        showNotification({
                            id: 'removeFieldSetting' + item.ID + name,
                            title: 'Failed to remove unit of measurement',
                            message: response.serverMessage || "something went wrong",
                            color: 'yellow',
                            loading: false,
                            autoClose: 3000
                        })
                        return;
                    }

                    setUnitsOfMeasurement(unitsOfMeasurement?.filter(x => x.ID !== item.ID && x.IsActive));

                } catch (error) {
                    showNotification({
                        id: 'removeFieldSetting' + item.ID + name,
                        title: 'Failed to remove unit of measurement',
                        message: 'Failed to remove unit of measurement',
                        color: 'yellow',
                        loading: false,
                        autoClose: 3000
                    })
                }
            }
        }
    }

    return (
        <>
            <Text c={'scBlue.8'} mb={0} mt={'sm'}>Units</Text>
            <Box p={'sm'}>
                <SimpleTable
                    stylingProps={{ compact: false, darkerText: true, rows: false }}
                    data={unitsOfMeasurement}
                    height={'100%'}
                    onInputChange={handleUnitChange}
                    mapping={[
                        {
                            label: 'Name',
                            type: 'textInput',
                            key: 'Name',
                            placeholderFunction: () => 'Enter Unit Name *',
                            maxLength: 42
                        }
                    ]}
                    controls={tableControls}
                    onAction={handleAction}
                    showControlsOnHover={false}
                    addButton={{
                        customComponent:
                            <Box>
                                <MantineButton
                                    rightSection={<IconPlus height={16} />}
                                    onClick={newUnit}
                                >
                                    Add New Unit of Measurement
                                </MantineButton>
                            </Box>,
                        label: '',
                    }}
                />
            </Box>
        </>
    )
}

export default InventoryUnitTable;