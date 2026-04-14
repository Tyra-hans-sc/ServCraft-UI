import React, {FC, useEffect, useState} from "react";
import { Button, Group, Loader, Title } from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import { useForm } from "@mantine/form";
import {useMutation, useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { showNotification, updateNotification } from "@mantine/notifications";
import {getUnitsOfMeasurements, UnitOfMeasurement} from "@/PageComponents/Settings/Inventory/InventoryUnitTable";


export interface UnitResponse {
    Name: string
    ID: string
    IsActive: boolean
    CreatedBy: string
    CreatedDate: string
    ModifiedBy: string
    ModifiedDate: string
    RowVersion: string
}

const CreateNewUnitForm: FC<{
    isNew?: boolean
    onClose: () => void
    unitCreated: (data: UnitResponse) => void
    unit?: any,

}> = (props) => {

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

    const form = useForm({
        initialValues: {
            Name: props?.isNew ? '' : props?.unit.Name,
            RowVersion: props?.isNew ? '' : props?.unit.RowVersion,
        },
        validate: {
            Name: (x) => !x ? 'Specify Unit Name' : unitsOfMeasurement.some(y => y.Name === x) ? 'The unit name already exists' : null
        }
    });

    const saveUnit = async (values) => {
        const res = (props.isNew && await Fetch.post({
            url: `/UnitOfMeasurement`,
            params: values,
        } as any)) || await Fetch.post({
            url: `/UnitOfMeasurement`,
            params: {
                ...props.unit,
                ...values
            },
        } as any);

        if (res.ID) {
            form.setValues(res);
            return res;
        } else {
            throw new Error(res.serverMessage || res.message || 'Something went wrong');
        }
    }

    const { isLoading, mutate } = useMutation<UnitResponse>(['category', 'create'], saveUnit, {
        onSuccess: (data) => {
            updateNotification({
                id: 'createUnit',
                message: `Successfully created unit: ${data?.Name}`,
                color: 'scBlue',
                loading: false
            });

            props.unitCreated(data);
        },
        onError: (err: any) => {

            updateNotification({
                id: 'createUnit',
                message: err?.message || 'Unit could not be created',
                color: 'red',
                loading: false
            });
        },
        onMutate: () => {
            showNotification({
                id: 'createUnit',
                message: 'Creating unit',
                color: 'scBlue',
                loading: true
            });
        }
    });

    const handleSubmit = (values) => {
        if (form.validate() && form.isValid()) {
            mutate(values)
        }
    }

    return <>

        <Title
            my={'var(--mantine-spacing-lg)'}
            size={'lg'}
            fw={600}
        >
            {props.isNew && 'Create Unit' || 'Edit Unit'}
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
            <ScTextControl
                label={'Name'}
                withAsterisk
                {...form.getInputProps('Name')}
            />

            <Group mt={'5rem'} justify={'right'} gap={'xs'}>
                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                    props.onClose()
                }}>
                    Cancel
                </Button>
                <Button color={'scBlue'} type={'button'}
                        onClick={() => handleSubmit(form.values)}
                    rightSection={isLoading && <Loader variant={'oval'} size={18} color={'white'} />}
                >
                    {props.isNew && 'Create' || 'Save'}
                </Button>
            </Group>
        </form>
    </>
}

export default CreateNewUnitForm;
