import { useForm } from '@mantine/form';
import {
    TextInput,
    Textarea,
    Button,
    Grid,
    Stack,
    Group, Box, Checkbox, Flex, Loader, Text, Title
} from '@mantine/core';
import { EmployeeDto, StocktakeDto, StocktakeTemplateDto, StocktakeTemplateItemDto } from './StockTake.model';
import warehouseService from "@/services/warehouse/warehouse-service";
import ScDynamicSelect from "@/components/sc-controls/form-controls/ScDynamicSelect";
import React, { useEffect, useMemo, useState } from "react";
import * as Enums from "@/utils/enums";
import SCDatePicker from "@/components/sc-controls/form-controls/sc-datepicker";
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import Fetch from "@/utils/Fetch";
import Link from "next/link";
import { IconArrowRight, IconChevronLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { Warehouse } from "@/interfaces/api/models";
import { DateTimePicker } from '@mantine/dates';
import dayjs from "dayjs";
import ScStockTakeItemTemplateSelector from "@/PageComponents/Stock Take/ScStockTakeItemTemplateSelector";
import StocktakeTypeSelector from '@/components/selectors/stocktake/stocktake-type-selector';
import SCNumericInput from '@/components/sc-controls/form-controls/sc-numeric-input';
import ScNumberControl from '@/components/sc-controls/form-controls/v2/sc-number-control';
import stockService from '@/services/stock/stock-service';
import Storage from "@/utils/storage";
import PS from "@/services/permission/permission-service";

interface StocktakeFormProps {
    onSubmit: (values: Partial<StocktakeDto>) => void;
    onCancel?: () => void;
    submitting: boolean;
    // warehouses?: WarehouseDto[];
    initialValues?: Partial<StocktakeDto>;
    customTitle?: string;
    isCopyMode?: boolean;
    forWarehouseID?: string;
    capturer?: any;
}

const getAllWarehouses = async (searchphrase: string) => {
    const warehouseResults = await warehouseService.getWarehouses(100, undefined, searchphrase);

    if (!warehouseResults.Results) {
        throw new Error((warehouseResults as any)?.serverMessage || (warehouseResults as any)?.message || 'Something went wrong')
    }

    return warehouseResults.Results;
};

const getEmployees = async (searchphrase: string) => {
    /*const res = await Fetch.post({
        url: `/Employee/GetEmployees`,
        params: {
            SearchPhrase: searchphrase,
            PageIndex: 0,
            PageSize: 100,
            SortExpression: "Description",
            SortDirection: "ascending",
            StoreIDList: [
                warehouseId
            ],
            IncludeDisabled: false,
            PopulateGeoLocation: false
        }
    });*/

    const res = await Fetch.post({
        url: `/Employee/GetEmployees`,
        params: {
            SearchPhrase: searchphrase,
            // StoreIDList: [warehouseId],
            PermissionIDList: [], // [Enums.PermissionName.StockTakeManager, Enums.PermissionName.StockTake],
            PageSize: 100,
            PageIndex: 0,
            SortExpression: "FullName",
            SortDirection: "ascending",
            IncludeDisabled: false,
            PopulateGeoLocation: false,
            HasLogin: true
        }
    });

    if (!res.Results) {
        throw new Error((res as any)?.serverMessage || (res as any)?.message || 'Something went wrong')
    }

    return res.Results;
};

const getManagerEmployees = async (searchphrase: string) => {
    /*const res = await Fetch.post({
        url: `/Employee/GetEmployees`,
        params: {
            SearchPhrase: searchphrase,
            PageIndex: 0,
            PageSize: 100,
            SortExpression: "Description",
            SortDirection: "ascending",
            StoreIDList: [
                warehouseId
            ],
            IncludeDisabled: false,
            PopulateGeoLocation: false
        }
    });*/

    const res = await Fetch.post({
        url: `/Employee/GetEmployees`,
        params: {
            SearchPhrase: searchphrase,
            // StoreIDList: [warehouseId],
            PermissionIDList: [Enums.PermissionName.StockTakeManager],
            PageSize: 100,
            PageIndex: 0,
            SortExpression: "FullName",
            SortDirection: "ascending",
            IncludeDisabled: false,
            PopulateGeoLocation: false,
            HasLogin: true
        }
    });

    if (!res.Results) {
        throw new Error((res as any)?.serverMessage || (res as any)?.message || 'Something went wrong')
    }

    return res.Results;
};

export default function StocktakeForm({
    customTitle,
    onSubmit,
    onCancel,
    initialValues,
    submitting,
    isCopyMode,
    forWarehouseID = '',
    capturer = null
}: StocktakeFormProps) {

    const isNew = !initialValues?.ID;

    const [autofillNameWarehouseValue, setAutofillNameWarehouseValue] = useState<string>('');

    const form = useForm<Partial<StocktakeDto & { AssignedEmployee: any }>>({
        initialValues: initialValues && { ...initialValues, ScheduledDate: initialValues?.ScheduledDate ? new Date(initialValues?.ScheduledDate) : new Date() } || {
            Name: '',
            Description: '',
            AssignedEmployeeFullName: capturer?.FullName || '',
            AssignedEmployeeID: capturer?.ID || '',
            // AssignedManagerEmployeeFullName: !PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin) ? Storage.getCookie(Enums.Cookie.servFullName) : '',
            AssignedManagerEmployeeFullName: Storage.getCookie(Enums.Cookie.servFullName),
            // AssignedManagerEmployeeID: !PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin) ? Storage.getCookie(Enums.Cookie.employeeID) : '',
            AssignedManagerEmployeeID: Storage.getCookie(Enums.Cookie.employeeID),
            Status: Enums.StocktakeStatus.Draft,
            ScheduledDate: new Date(),
            CompletedDate: null,
            StocktakeTemplateID: null,
            StocktakeTemplateName: '',
            Notes: '',
            WarehouseID: forWarehouseID,
            StocktakeType: undefined,
            ValidityPeriodHours: 48
        },
        transformValues: (values) => {
            return {
                ...values,
                Notes: values.Notes || '',
                Description: values.Description || '',
                ScheduledDate: dayjs(values.ScheduledDate as Date).format('YYYY-MM-DDTHH:mm:00')
            }
        },
        validate: {
            Name: (value) => !value ? 'Name is required' : null,
            WarehouseID: (value) => !value ? 'Warehouse is required' : null,
            StocktakeTemplateID: (value) => {
                return !stockService.isTemplateRequired(form.getInputProps('StocktakeType').value) ? null :
                    (
                        !value ? 'Item template is required' :
                            initialValues?.StocktakeTemplateID && value !== initialValues?.StocktakeTemplateID && initialValues.Status !== Enums.StocktakeStatus.Pending ? 'Item template cannot be changed after counting has stated' : null
                    )
            },
            AssignedEmployeeID: (value) => !value ? 'Assigned capturer is required' : null,
            AssignedManagerEmployeeID: (value) => !value ? 'Assigned manager is required' : null,
            StocktakeType: (value) => !value && value !== 0 ? "Type is required" : null,
            ValidityPeriodHours: (value) => isNaN(parseFloat((value ?? '').toString())) ? "Validity Period is required" : null,
            ScheduledDate: (value) => !value ? 'Scheduled start date is required' : null
        }
    });



    const handleSubmit = (values) => {
        // console.log('submitting')
        onSubmit(values);
    };

    const [shouldAutofill] = useState(!initialValues?.Name || initialValues.Name?.includes('(' + initialValues.AssignedEmployeeFullName + ')'));

    useEffect(() => {
        if (autofillNameWarehouseValue && form.values.AssignedEmployeeFullName) {
            const autofillNameTemplateValue = form.values.StocktakeTemplateName;

            if ((shouldAutofill && !form.isDirty('Name')) || !form.values.Name) {
                const formattedDate = form.values.ScheduledDate ? 'on ' + dayjs(form.values.ScheduledDate as Date).format('D MMM') : '';
                const employeeName = form.values.AssignedEmployeeFullName ? '(' + form.values.AssignedEmployeeFullName + ')' : '';
                const templateName = autofillNameTemplateValue ? autofillNameTemplateValue + ' for' : '';
                form.setFieldValue('Name', `${templateName} ${autofillNameWarehouseValue} ${formattedDate} ${employeeName}`, { forceUpdate: true })
                form.resetDirty({ 'Name': '' })
            }
        }
    }, [autofillNameWarehouseValue, form.values.StocktakeTemplateName, form.values.AssignedEmployeeFullName, form.values.ScheduledDate]);

    // useEffect(() => {
    //     console.log('form values', form.values)
    // }, [form.values]);

    /*const [stockSelectMode, setStockSelectMode] = useState<string[]>(['all']);

    const handleStockSelectModeChange = (value: string[]) => {
        setStockSelectMode((value[value.length - 1] !== 'all' && value.includes('all')) ? value.filter(x => x !== 'all') : value.includes('all') ? ['all'] : value);
    }*/

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} >
            {
                !isNew &&
                <Group mb="md">
                    {
                        (isCopyMode) ? <Button ml={'auto'} variant="outline" onClick={onCancel}>Cancel</Button> :
                            <Link href={'/inventory/list?tab=stocktake'}><Button variant="outline" leftSection={<IconChevronLeft size={16} />}>Back to Stock Takes</Button></Link>
                    }
                    {
                        !isCopyMode &&
                        <Link style={{ marginLeft: 'auto' }} href={'/stock-take/' + initialValues?.ID}><Button variant="outline" >View Stocktake</Button></Link>
                    }
                    <Button disabled={submitting} type={"submit"} color="scBlue" leftSection={submitting && <Loader size={17} /> || <IconDeviceFloppy size={19} />}>{isCopyMode ? 'Create Copy' : 'Save'}</Button>
                </Group>
            }

            <Stack gap="lg">
                {
                    customTitle &&
                    <Title order={4} c={'dark.6'} mt={'sm'}>{customTitle}</Title>
                }

                {/*<Grid>
                    <Grid.Col span={6}>
                        <TextInput
                            autoFocus
                            miw={'100%'}
                            label="Name"
                            placeholder="Enter stock take name"
                            withAsterisk
                            {...form.getInputProps('Name')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <ScDynamicSelect
                            labelProp={'Name'}
                            withAsterisk
                            autoselect1Item
                            label="Item Template"
                            queryKey="stocktakeTemplate"
                            queryFn={getStockItemTemplates}
                            placeholder="Search item templates"
                            multiSelect={false}
                            {...form.getInputProps('StockTakeTemplateID') as any}
                        />
                    </Grid.Col>
                </Grid>*/}

                <Grid>
                    <Grid.Col span={4}>
                        <ScDynamicSelect
                            labelProp={'Code'}
                            withAsterisk
                            autoselect1Item
                            label="Warehouse"
                            queryKey="Warehouse Select"
                            queryFn={getAllWarehouses}
                            placeholder="Search warehouses"
                            multiSelect={false}
                            renderOption={({ option }: { option: Warehouse }) => <>
                                <Flex gap={'xs'} align={'center'}>
                                    <Flex direction={'column'}>
                                        <Text size={'sm'} fw={600}>{option?.Code}</Text>
                                        <Text size={'sm'}>{option?.Name}</Text>
                                    </Flex>
                                </Flex>
                            </>}
                            {...form.getInputProps('WarehouseID') as any}
                            onChange={(x, warehouse: Warehouse | undefined) => {
                                if (warehouse && warehouse?.EmployeeID) {
                                    form.setFieldValue('AssignedEmployeeID', warehouse?.EmployeeID)
                                    // console.log('employee selected', warehouse?.EmployeeFullName)
                                    form.setFieldValue('AssignedEmployeeFullName', warehouse?.EmployeeFullName)
                                }
                                setAutofillNameWarehouseValue(warehouse?.Code || '')
                                form.setFieldValue('WarehouseID', x as string)
                            }
                            }
                        />

                        {/*<WarehouseSelector
                            mt={0}
                            selectedWarehouse={form.values.Warehouse}
                            setSelectedWarehouse={x => {
                                form.setFieldValue('Warehouse', x);
                                form.setFieldValue('WarehouseID', x?.ID || '');
                            }}
                            filterByEmployee={false}
                            onSuppressSave={() => {}} // handle properly
                        />*/}
                    </Grid.Col>
                    <Grid.Col span={4}>
                        {/*<EmployeeSelector
                            mt={0}
                            selectedEmployee={form.values.AssignedEmployee}
                            setSelectedEmployee={(emp) => {
                                form.setFieldValue('AssignedEmployee', emp)
                                form.setFieldValue('AssignedEmployeeID', emp?.ID || '')
                            }}
                            storeID={(form.values.WarehouseID ? form.values.WarehouseID : null)}
                            {...{} as any}
                        />*/}
                        <ScDynamicSelect
                            label={'Assigned Manager'}
                            queryKey={'managerEmployees'}
                            queryFn={getManagerEmployees}
                            placeholder="Search managers"
                            multiSelect={false}
                            autoselect1Item
                            withAsterisk
                            labelProp={'FullName'}
                            renderOption={({ option }: { option: EmployeeDto }) => <>
                                <Flex gap={'xs'} align={'center'}>
                                    <EmployeeAvatar name={option.FullName} color={option.DisplayColor} />
                                    <Flex direction={'column'}>
                                        <Text size={'sm'} fw={600}>{option?.FullName}</Text>
                                        <Text size={'sm'}>{option?.EmailAddress}</Text>
                                    </Flex>
                                </Flex>
                            </>}
                            /*textInputProps={{
                                leftSection: <EmployeeAvatar name={form.values.AssignedEmployeeFullName || ''}  />,
                            }}*/
                            {...form.getInputProps('AssignedManagerEmployeeID') as any}
                            onChange={(x, emp: EmployeeDto | undefined) => {
                                form.setFieldValue('AssignedManagerEmployeeFullName', emp?.FullName || '')
                                form.setFieldValue('AssignedManagerEmployeeID', x as string)
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        {/*<EmployeeSelector
                            mt={0}
                            selectedEmployee={form.values.AssignedEmployee}
                            setSelectedEmployee={(emp) => {
                                form.setFieldValue('AssignedEmployee', emp)
                                form.setFieldValue('AssignedEmployeeID', emp?.ID || '')
                            }}
                            storeID={(form.values.WarehouseID ? form.values.WarehouseID : null)}
                            {...{} as any}
                        />*/}
                        <ScDynamicSelect
                            label={'Assigned Capturer'}
                            queryKey={'employees'}
                            queryFn={getEmployees}
                            placeholder="Search employees"
                            multiSelect={false}
                            autoselect1Item
                            withAsterisk
                            labelProp={'FullName'}
                            renderOption={({ option }: { option: EmployeeDto }) => <>
                                <Flex gap={'xs'} align={'center'}>
                                    <EmployeeAvatar name={option.FullName} color={option.DisplayColor} />
                                    <Flex direction={'column'}>
                                        <Text size={'sm'} fw={600}>{option?.FullName}</Text>
                                        <Text size={'sm'}>{option?.EmailAddress}</Text>
                                    </Flex>
                                </Flex>
                            </>}
                            /*textInputProps={{
                                leftSection: <EmployeeAvatar name={form.values.AssignedEmployeeFullName || ''}  />,
                            }}*/
                            {...form.getInputProps('AssignedEmployeeID') as any}
                            onChange={(x, emp: EmployeeDto | undefined) => {
                                form.setFieldValue('AssignedEmployeeFullName', emp?.FullName || '')
                                form.setFieldValue('AssignedEmployeeID', x as string)
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <DateTimePicker
                            dropdownType={'modal'}
                            modalProps={{
                                overlayProps: {
                                    color: "var(--mantine-color-scBlue-3)",
                                    blur: 10,
                                    opacity: .55
                                }
                            }}
                            valueFormat="DD MMMM, YYYY hh:mm A"
                            label="Scheduled Start Date"
                            placeholder="Pick date and time"
                            clearable
                            minDate={new Date()}
                            withAsterisk
                            {...form.getInputProps('ScheduledDate')}
                        />
                        {/*<SCDatePicker
                            mt={0}
                            label="Scheduled Start Date"
                            placeholder="yyyy/mm/dd"
                            clearable
                        />*/}
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <StocktakeTypeSelector
                            required={true}
                            disabled={initialValues?.Status && initialValues?.Status !== Enums.StocktakeStatus.Pending}
                            selectedStocktakeType={form.values.StocktakeType}
                            setSelectedStocktakeType={(type) => {
                                form.setFieldValue('StocktakeType', type);
                            }}
                            {...form.getInputProps('StocktakeType') as any}
                        />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <ScStockTakeItemTemplateSelector
                            labelProp={'Name'}
                            {...(!stockService.isTemplateRequired(form.getInputProps('StocktakeType').value) ? { withAsterisk: false } : { withAsterisk: true })}
                            autoselect1Item
                            label="Item Template"
                            placeholder={initialValues?.Status && initialValues?.Status !== Enums.StocktakeStatus.Pending ? "None" : "Search item templates"}
                            multiSelect={false}
                            {...form.getInputProps('StocktakeTemplateID') as any}
                            onChange={(x, template: StocktakeTemplateDto | undefined) => {
                                form.setFieldValue('StocktakeTemplateID', template?.ID ?? null) // null is better than empty string - nullable guids != empty strings
                                form.setFieldValue('StocktakeTemplateName', template?.Name || '')
                            }}
                            disabled={isNaN(+form.values.StocktakeType) || (initialValues?.Status && initialValues?.Status !== Enums.StocktakeStatus.Pending)}
                        />
                    </Grid.Col>



                    <Grid.Col span={4}>
                        <ScNumberControl
                            label="Validity Period (h)"
                            withAsterisk={true}
                            mt={0}
                            min={0}
                            {...form.getInputProps('ValidityPeriodHours')}
                            name={'ValidityPeriodHours'}
                            disabled={initialValues?.Status && initialValues?.Status !== Enums.StocktakeStatus.Pending && initialValues?.Status !== Enums.StocktakeStatus.Counting && initialValues?.Status !== Enums.StocktakeStatus.CountingComplete}

                        />
                        {/* <SCNumericInput
                            required={true}
                            format={Enums.NumericFormat.Integer}
                            disabled={initialValues?.Status && initialValues?.Status !== Enums.StocktakeStatus.Pending}
                            selectedStocktakeType={form.values.StocktakeType}
                            label={"Validity Period (h)"}
                            min={0}
                            name={"ValidityPeriodHours"}
                            value={form.getInputProps('ValidityPeriodHours').value}
                            error={form.getInputProps('ValidityPeriodHours').error}
                            onChange={(val) => {
                                form.setFieldValue('ValidityPeriodHours', val.value);
                            }}
                            {...form.getInputProps('ValidityPeriodHours') as any}
                        /> */}
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <TextInput
                            autoFocus
                            miw={'100%'}
                            label="Name"
                            placeholder="Enter stock take name"
                            withAsterisk
                            {...form.getInputProps('Name')}
                        />
                    </Grid.Col>

                </Grid>
                <Textarea
                    autosize
                    rows={1}
                    maxRows={10}
                    miw={'100%'}
                    label="Description"
                    placeholder="Description will be visible on lists and details"
                    {...form.getInputProps('Description')}
                />
                {/*
                <Textarea
                    autosize
                    rows={3}
                    maxRows={10}
                    miw={'100%'}
                    label="Notes"
                    placeholder="Additional notes will be visible on the details section"
                    minRows={3}
                    {...form.getInputProps('Notes')}
                />*/}

                {/*<Box>
                   <Text fw={'bolder'} size={'md'}>
                       Stock Item Selection:
                   </Text>

                    <Checkbox.Group
                        value={stockSelectMode} onChange={handleStockSelectModeChange}
                        label="Stocktake items to include"
                        description="Select specific items to include in this stock take. If no items are selected, all items will be included."
                        withAsterisk
                    >
                        <Group mt="xs">
                            <Checkbox value="all" label="Everything" />
                            <Checkbox value="filtered" label="Specify Filters"  />
                            <Checkbox value="custom" label="Select Items Manually" />
                        </Group>
                    </Checkbox.Group>

                    <Flex direction={{base: 'column', md: 'row'}} gap={'md'}>

                        {
                            stockSelectMode.includes('filtered') &&
                            <Box style={{flex: 1}}>
                                <StockTakeInventoryFilter
                                    warehouseId={form.values.WarehouseID}
                                />
                            </Box>

                        }

                        {
                            stockSelectMode.includes('custom') &&
                            <Box style={{flex: 1}}>
                                <StockTakeInventorySelect
                                    warehouseId={form.values.WarehouseID}
                                />
                            </Box>
                        }

                    </Flex>


                </Box>*/}
            </Stack>

            {
                isNew &&
                <Group mt="xl">
                    <Button ml={'auto'} variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button disabled={submitting} type={"submit"} color="scBlue" rightSection={submitting && <Loader size={17} /> || <IconArrowRight size={19} />}>Create</Button>
                </Group>
            }

        </form>
    );
}