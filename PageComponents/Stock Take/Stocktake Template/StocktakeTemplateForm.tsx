import { useForm } from '@mantine/form';
import {
    TextInput,
    Textarea,
    Button,
    Grid,
    Stack,
    Group, Box, Checkbox, Flex, Loader, Text, Title
} from '@mantine/core';
import {EmployeeDto, StocktakeDto, StocktakeTemplateDto, StocktakeTemplateItemDto} from '../StockTake.model';
import warehouseService from "@/services/warehouse/warehouse-service";
import ScDynamicSelect from "@/components/sc-controls/form-controls/ScDynamicSelect";
import React, {useEffect, useState} from "react";
import * as Enums from "@/utils/enums";
import SCDatePicker from "@/components/sc-controls/form-controls/sc-datepicker";
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import Fetch from "@/utils/Fetch";
import Link from "next/link";
import {IconArrowRight, IconChevronLeft, IconDeviceFloppy} from "@tabler/icons-react";
import {Warehouse} from "@/interfaces/api/models";
import { DateTimePicker } from '@mantine/dates';
import dayjs from "dayjs";
import StocktakeTemplateInventoryTransferList
    , {
    InventoryTransferItem
} from "@/PageComponents/Stock Take/Stocktake Template/StocktakeTemplateInventoryTransferList";
import storageService from "@/utils/storage";
import helper from "@/utils/helper";

interface StocktakeFormProps {
    onSubmit: (values: Partial<StocktakeTemplateDto>) => void;
    onCancel?: () => void;
    submitting: boolean;
    // warehouses?: WarehouseDto[];
    initialValues?: Partial<StocktakeTemplateDto>;
    customTitle?: string;
    isCopyMode?: boolean;
    isNestedForm?: boolean;
}

export default function StocktakeTemplateForm({
                                  customTitle,
                                  onSubmit,
                                  onCancel,
                                  initialValues,
                                  submitting,
                                  isCopyMode,
                                    isNestedForm = false,
                              }: StocktakeFormProps) {

    const isNew = !initialValues?.ID;

    const form = useForm<Partial<StocktakeTemplateDto>>({
        initialValues: initialValues || {
            ID: helper.emptyGuid(),
            Name: '',
            Description: '',
            StocktakeTemplateItems: []
        },
        transformValues: (values) => {
            return {
                ...values,
            }
        },
        validate: {
            Name: (value) => !value ? 'Name is required' : null,
        }
    });

    const handleSubmit = (values) => {
        // console.log('submitting', values)
        if(form.isValid() && values.Name) { // triple safety, but should be overkill
            onSubmit(values);
        }
    };

    const manualSubmit = () => {
        if(!form.validate().hasErrors) {
            handleSubmit(form.getTransformedValues())
        }
    }

    const handleInventoryTransferItemsSelected = (items: InventoryTransferItem[]) => {
        form.setFieldValue('StocktakeTemplateItems', items)
    }

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} >

            {
                !isNew &&
                <Group mb="md">
                    {
                        (isCopyMode) ? <Button ml={'auto'} variant="outline" onClick={onCancel}>Cancel</Button> :
                            <Link href={'/inventory/list?tab=sttemplates'}><Button variant="outline" leftSection={<IconChevronLeft size={16} />}>Back to Templates</Button></Link>
                    }
                    {/*{
                        !isCopyMode &&
                        <Link style={{marginLeft: 'auto'}} href={'/stock-take/' + initialValues?.ID}><Button variant="outline" >View Stocktake</Button></Link>
                    }
                    <Button disabled={submitting} type={"submit"} color="scBlue" leftSection={submitting && <Loader size={17} /> || <IconDeviceFloppy size={19} />}>{isCopyMode ? 'Create Copy' : 'Save'}</Button>*/}
                    <Button ml={'auto'} disabled={submitting} type={isNestedForm ? "button" : "submit"} color="scBlue" leftSection={submitting && <Loader size={17} /> || <IconDeviceFloppy size={19} />}
                            onClick={isNestedForm ? manualSubmit : undefined}
                    >Save</Button>
                </Group>
            }


            <Stack gap="lg">
                {
                    customTitle &&
                    <Title order={4} c={'dark.6'} mt={'sm'}>{customTitle}</Title>
                }

                <Textarea
                    withAsterisk
                    autosize
                    rows={1}
                    maxRows={10}
                    // size={'lg'}
                    // miw={'100%'}
                    label="Stock Take Template Name"
                    placeholder="Descriptive name for items included in this stock take template."
                    {...form.getInputProps('Name')}
                />


                {/*<Textarea
                    autosize
                    rows={1}
                    maxRows={10}
                    miw={'100%'}
                    label="Name"
                    placeholder="Brief description of items included in this stock take template."
                    {...form.getInputProps('Description')}
                />*/}

            </Stack>

            <StocktakeTemplateInventoryTransferList
                template={initialValues}
                onSelectionChange={handleInventoryTransferItemsSelected}
            />



            {
                isNew &&
                <Group mt="xl">
                    <Button ml={'auto'} variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button disabled={submitting} type={isNestedForm ? "button" : "submit"} color="scBlue" rightSection={submitting && <Loader size={17} /> || <IconArrowRight size={19} />}
                            onClick={isNestedForm ? manualSubmit : undefined}
                    >
                        Create Template
                    </Button>
                </Group>
            }
        </form>
    );
}