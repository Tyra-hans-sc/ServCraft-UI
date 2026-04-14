import React, {FC, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
    Anchor,
    Box,
    Button,
    Flex,
    Group,
    Loader,
    LoadingOverlay,
    SimpleGrid,
    Space,
    Title
} from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {FormErrors, useForm} from "@mantine/form";
import * as Enums from '../../utils/enums';
import {useMutation, useQuery} from "@tanstack/react-query";
import SCSwitch from "@/components/sc-controls/form-controls/sc-switch";
import Time from "@/utils/time";
import PageContext from "@/utils/page-context";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import WarrantyIndicator from "@/components/product/warranty-indicator";
import {showNotification, updateNotification} from "@mantine/notifications";
import Fetch from "@/utils/Fetch";
import InventoryService from "@/services/inventory/inventory-service";
import InventorySelector from "@/components/selectors/inventory/inventory-selector";
import InventoryItemModal from "@/PageComponents/Inventory/InventoryItemModal";
import Helper from "@/utils/helper";
import SCDatePicker from "@/components/sc-controls/form-controls/sc-datepicker";
import {FieldSetting, getFieldSettings} from "@/PageComponents/Settings/Field Settings/FieldSettings";
import {
    getFormNameForSystemName,
    getSystemNameForFormName
} from "@/PageComponents/Settings/Field Settings/fieldSettingHelper";
import CustomerContactLocationSelector from "@/components/selectors/customer/customer-contact-location-selector";
import Router from "next/router";
import Link from "next/link";
import {IconQuestionCircle} from "@tabler/icons";
import PS from "@/services/permission/permission-service";
import Storage from '@/utils/storage';
import StoreSelector from "@/components/selectors/store/store-selector";

/*
interface CustomFieldMeta {
    fieldLabel1: any
    fieldLabel2: any
    fieldLabel3: any
    fieldLabel4: any
    dateFieldLabel1: any
    dateFieldLabel2: any
    filterFieldLabel1: any
    filterFieldLabel2: any
    numberFieldLabel1: any
    numberFieldLabel2: any
    field1Required: any
    field2Required: any
    serialNumberRequired: any
    invoiceNumberRequired: any
    locationRequired: any
}
*/

interface FormState {
    inputErrors: FormErrors,
    submitState: 'none' | 'onSubmit' | 'loading' | 'error' | 'success',
    navToRoute?: string
}

const _userAdmin = PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin);

const AssetForm: FC<{
    onClose?: () => void
    editAsset?: any
    assetCreated: (data: any) => void
    assetCreatedAndCopied?: (data: any) => void
    accessStatus?: any
    job?: any,
    formState?: FormState,
    setFormState?: (newState: FormState) => void
    assetPageMode?: boolean
    onFormTouched?: (touched: boolean) => void
    hideSaveAndCancel?: boolean
    onCustomerChange?: (customer: any) => void
    customerID?: string
}> = (props) => {


    // STORES
    const [isMultiStore, setIsMultiStore] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(props.editAsset?.Store || props.job?.Store || null);

    const storesQuery = useQuery(['stores'], () => Fetch.get({
        url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
    } as any))

    // Update store state when query data changes
    useEffect(() => {
        if (storesQuery.data) {
            const res = storesQuery.data
            setIsMultiStore(res.TotalResults > 1);
            if(res.TotalResults === 1 && !selectedStore) {
                setSelectedStore(res.Results[0])
                form.setFieldValue('StoreID', res.Results[0]?.ID)
            }
        }
    }, [storesQuery.data])

    const selectCustomer = async (id: string) => {
        if (id) {
            const customer = await Fetch.get({
                url: `/Customer/${id}`,
            });
            console.warn('Testing Get****', customer)
            setSelectedCustomer(customer);
        }
    };

    const assetFieldSettings = useQuery(['assetFieldSettings'], () => getFieldSettings(Enums.Module.Asset))
    const settingsBySystemName: {[fieldSystemName: string]: FieldSetting} = useMemo(() => {
        if(assetFieldSettings.data) {
            return assetFieldSettings.data.reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue.FieldSystemName]: {...currentValue}
            }), {})
        } else {
            return {}
        }
    }, [assetFieldSettings.data])
    const isRequired = useCallback((name: string) => {
        const systemName = getSystemNameForFormName(name)
        return settingsBySystemName.hasOwnProperty(systemName) ? isShown(name) && settingsBySystemName[systemName].IsRequired : false
    }, [settingsBySystemName])

    const isShown = useCallback((name: string) => {
        const systemName = getSystemNameForFormName(name)
        return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive && (!!props.editAsset || !settingsBySystemName[systemName].HideOnCreate) : false
    }, [settingsBySystemName, props.editAsset])
    /*const validateOptionalFields = useCallback((values: any) => {
        const validationResult = assetFieldSettings.data?.reduce((p, config) => {
            const result = Helper.validateInputStringOut({
                value: values[getFormNameForSystemName(config.FieldSystemName)],
                required: config.IsRequired
            } as any)
            form.setFieldError(getFormNameForSystemName(config.FieldSystemName), result)
            return {
                ...p,
                [getFormNameForSystemName(config.FieldSystemName)]: result
            }
        }, {})

        // set form state input errors for when form submit is handled form outside
        if(props.setFormState && props.formState && validationResult) {
            props.setFormState({
                ...props.formState,
                inputErrors: validationResult
            })
        }

        return validationResult && !Object.entries(validationResult).some(([, result]) => result !== null)
        // Object.entries(validationResult).forEach([item])
    }, [assetFieldSettings.data])*/

    /*const formCustomFields = useMemo(() => {
        return {
            initialValues: {

            },
            validate: {

            }
        }
    }, [settingsBySystemName])*/


    // dayjs.extend(utc)

    const pageContext = useContext(PageContext);
    const [selectedInventory, setSelectedInventory] = useState<any>();
    const [selectedCustomer, setSelectedCustomer] = useState<any>(props.editAsset?.Customer || props.job?.Customer);
    const [selectedContact, setSelectedContact] = useState<any>(props.editAsset?.Contact || props.job?.Contact);
    const [selectedLocation, setSelectedLocation] = useState<any>(props.editAsset?.Location || props.job?.Location);

    const onSelectedInventoryChanged = (inventory) => {
        setSelectedInventory(inventory);
        form.setFieldValue('InventoryID', inventory?.ID)
        form.setFieldValue('PurchaseAmount', inventory?.ListPrice)
        form.setFieldValue('WarrantyPeriod', inventory?.WarrantyPeriod)
    }

    const selectedInventoryQuery = useQuery(['selectedInventory', props.editAsset?.InventoryID], () => InventoryService.getInventory(props.editAsset.InventoryID), {
        enabled: !!props.editAsset
    });

    // Update selected inventory when query data changes
    useEffect(() => {
        if (selectedInventoryQuery.data) {
            setSelectedInventory(selectedInventoryQuery.data)
        }
    }, [selectedInventoryQuery.data])

    const [showCreateNewInventory, setShowCreateNewInventory] = useState(false);

    useEffect(() => {
        console.log('***TEST***', props)
        if (props.customerID) {
            selectCustomer(props.customerID);
        }
    }, [props.customerID]);

    useEffect(() => {
        if(props.editAsset?.Inventory) {
            setSelectedInventory(props.editAsset?.Inventory)
        }
    }, [props.editAsset]);


    useEffect(() => {
        if(selectedInventory?.ID) {
            form.setFieldValue('InventoryID', selectedInventory.ID);
        }
    }, [selectedInventory]);

    useEffect(() => {
    if(selectedCustomer?.ID) {
        form.setFieldValue('CustomerID', selectedCustomer.ID)
    } else {
        form.setFieldValue('CustomerID', null)
    }
}, [selectedCustomer]);

useEffect(() => {
    if(selectedContact?.ID) {
        form.setFieldValue('CustomerContactID', selectedContact.ID)
    } else {
        form.setFieldValue('CustomerContactID', null)
    }
}, [selectedContact]);

useEffect(() => {
    if(selectedLocation?.ID) {
        form.setFieldValue('LocationID', selectedLocation.ID)
    } else {
        form.setFieldValue('LocationID', null)
    }
}, [selectedLocation]);

    const formInitialValues = useMemo(() => {
        return {
            StoreID: props.editAsset ? props.editAsset.StoreID : props.job?.StoreID || null,
            CustomerID: props.editAsset ? props.editAsset?.CustomerID : props.job?.CustomerID,
            CustomerContactID: props.editAsset ? props.editAsset?.CustomerContactID : props.job?.CustomerContactID,
            LocationID: props.editAsset ? props.editAsset?.LocationID : props.job?.LocationID,
            InventoryID: props.editAsset?.Inventory?.ID || null,
            InventoryDescription: props.editAsset?.InventoryDescription || '',
            PurchaseDate: props.editAsset?.PurchaseDate /*&& dayjs(props.editAsset?.PurchaseDate).utc(true).toDate()*/ || Time.toISOString(Time.now()),
            PurchaseAmount: props.editAsset?.PurchaseAmount || 0,
            InvoiceNumber: props.editAsset?.InvoiceNumber || '',
            SerialNumber: props.editAsset?.SerialNumber || '',
            CustomField1: props.editAsset?.CustomField1 || '',
            CustomField2: props.editAsset?.CustomField2 || '',
            CustomField3: props.editAsset?.CustomField3 || '',
            CustomField4: props.editAsset?.CustomField4 || '',
            CustomFilter1: props.editAsset?.CustomFilter1 || false,
            CustomFilter2: props.editAsset?.CustomFilter2 || false,
            CustomDate1: props.editAsset?.CustomDate1 /*&& dayjs(props.editAsset?.CustomDate1).utc(true).toDate()*/ || null,
            CustomDate2: props.editAsset?.CustomDate2 /*&& dayjs(props.editAsset?.CustomDate2).utc(true).toDate()*/ || null,
            CustomNumber1: props.editAsset?.CustomNumber1 || null,
            CustomNumber2: props.editAsset?.CustomNumber2 || null,
            WarrantyPeriod: props.editAsset?.WarrantyPeriod || 0,
            LastServicedDate: props.editAsset?.LastServicedDate  || Time.toISOString(Time.now()),
            ProductNumber: props.editAsset?.ProductNumber || '',
        }
    }, [props.editAsset, props.job])

    const form = useForm({
        initialValues: formInitialValues,
        validate: {
            StoreID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isMultiStore
            } as any),
            InventoryID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true
            } as any),
            CustomerID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true
            } as any),
            CustomerContactID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true
            } as any),
            LocationID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('LocationID')
            } as any),
            PurchaseDate: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Date,
                required: true
            } as any),
            PurchaseAmount: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Number,
                required: isRequired('PurchaseAmount'),
                greaterThanOrEquals: 0
            } as any),
            WarrantyPeriod: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Number,
                required: isRequired('WarrantyPeriod'),
                greaterThanOrEquals: 0
            } as any),
            CustomField1: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: /*settingsBySystemName['CustomTextField1'].IsRequired*/ isRequired('CustomField1'),
            } as any),
            CustomField2: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('CustomField2'),
            } as any),
            CustomField3: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: /*settingsBySystemName['CustomTextField1'].IsRequired*/ isRequired('CustomField3'),
            } as any),
            CustomField4: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('CustomField4'),
            } as any),
            CustomNumber1: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Number,
                required: isRequired('CustomNumber1'),
            } as any),
            CustomNumber2: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Number,
                required: isRequired('CustomNumber2'),
            } as any),
            CustomDate1: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Date,
                required: isRequired('CustomDate1')
            } as any),
            CustomDate2: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Date,
                required: isRequired('CustomDate2')
            } as any),
            SerialNumber: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('SerialNumber'),
            } as any),
            InvoiceNumber: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('InvoiceNumber'),
            } as any)
        }
    });


    /*const handleSetFormTouched = useCallback(() => {
        const touchedItems = Object.entries(form.values).filter(([key, value]) =>
            (!props.editAsset ? value !== formInitialValues[key] : props.editAsset[key] !== value)
        )
        if(touchedItems.length !== 0) {
            if(form.isDirty()) {
                props.onFormTouched && props.onFormTouched(true)
            }
        } else {
            props.onFormTouched && props.onFormTouched(false)
        }
    }, [props.onFormTouched])*/

    useEffect(() => {
        const touchedItems = Object.entries(form.values).filter(([key, value]) =>
            (!props.editAsset ? value !== formInitialValues[key] : props.editAsset[key] !== value)
        )
        // console.log('touched items', touchedItems, formInitialValues, form.values)
        if(touchedItems.length !== 0) {
            if(form.isDirty()) {
                props.onFormTouched && props.onFormTouched(true)
            }
        } else {
            props.onFormTouched && props.onFormTouched(false)
        }
    }, [form.values, props.editAsset])

    // console.log('form', form)

    /*const getInitialFormValue = useCallback((name: string) => {
        return props.editAsset?.[getFormNameForSystemName(name)] ?? (
            name === 'LastServicedDate' ? Time.toISOString(Time.now()) :
                name === 'WarrantyPeriod' ? 0 :
                    name.startsWith('CustomText') ? '' :
                        name.startsWith('CustomCheckbox') ? false :
                            // name.startsWith('CustomText') ? '' :
                                null
        )
    }, [])*/


    /*useEffect(() => {
        const initialValues = Object.entries(settingsBySystemName).reduce((p, [name, setting]) => ({
            ...p,
            [getFormNameForSystemName(name)]: getInitialFormValue(name)
        }), {})
        form.setValues({
            ...form.values,
            ...initialValues
        })
        /!*form.validateField({

        })*!/
        // console.log('initial form values', initialValues)
    }, [settingsBySystemName]);*/

    // const [customFieldMeta, setCustomFieldMeta] = useState<CustomFieldMeta>();

    /*const customFieldQuery = useQuery(['assetCustomFields', Enums.Module.Asset], () => OptionService.getCustomFields(Enums.Module.Asset), {
        refetchOnMount: 'always',
    });
    const productCustomFieldQuery = useQuery<CustomFieldMeta>(['assetProductCustomFields', customFieldQuery.data], () => OptionService.getProductCustomFields(customFieldQuery.data), {
        enabled: customFieldQuery.isSuccess /!*&& customFieldQuery.data.length > 0*!/,
        refetchOnMount: 'always',
        onSuccess: (data) => {
            if(typeof data === 'object' && !data.hasOwnProperty('length')) {
                setCustomFieldMeta(data)
            }
        }
    });*/

    // console.log(customFieldMeta, settingsBySystemName, form.set)

    const saveAsset = async (values: any) => {
       const res = (!props.editAsset && await Fetch.post({
           url: `/Product`,
           params: {
               ...values,
               InventoryID: selectedInventory?.ID || null
           }
       } as any)) || await Fetch.put({
           url: `/Product`,
           params: {
               ...props.editAsset,
               ...values,
               InventoryID: selectedInventory?.ID || null,
           }
        } as any);

       if(res.ID) {
           return res
       } else {
           throw new Error(res.serverMessage || res.message || 'something went wrong')
       }
    }

    const {isLoading, mutate} = useMutation<any>(['asset', 'createOrEdit'], ({values, copy}: any) => saveAsset(values), {
        onSuccess: async (data, {copy}: any) => {
            updateNotification({
                id: 'createAsset',
                message: `Successfully ${props.editAsset ? 'updated' : 'created'} asset ${data?.Name || form.values.InventoryDescription} ${copy ? ' and copied data' : ''}`,
                color: 'scBlue',
                loading: false,
                autoClose: 2000
            });
            if(copy) {
                props.assetCreatedAndCopied && props.assetCreatedAndCopied(data)
                form.setValues(copy)
                form.setFieldValue('SerialNumber', '')
                form.setFieldValue('ProductNumber', '')
            } else {
                props.assetCreated(data);
            }
            if(props.formState?.navToRoute) {
                Helper.nextRouter(Router.push, props.formState?.navToRoute)
            } else {
                props.formState && props.setFormState && props.setFormState({
                    ...props.formState,
                    submitState: 'success'
                })
            }
        },
        onError: (err: any) => {
            /*console.error(err)
            console.log(err, err?.message)*/
            const message = `Asset could not be ${props.editAsset ? 'updated' : 'created'}`;
            updateNotification({
                id: 'createAsset',
                title: err.message && message,
                message: err.message || message,
                color: 'yellow',
                loading: false,
                autoClose: 3000
            });
            props.formState && props.setFormState && props.setFormState({
                ...props.formState,
                submitState: 'error'
            })
            props.onFormTouched && props.onFormTouched(true)
        },
        onMutate: () => {
            showNotification({
                id: 'createAsset',
                message: `${props.editAsset ? 'Updating' : 'Creating'} Asset`,
                color: 'scBlue',
                loading: true,
                autoClose: false
            });
            props.onFormTouched && props.onFormTouched(false)
            props.formState && props.setFormState && props.setFormState({
                ...props.formState,
                submitState: 'loading'
            })
        }
    });

    const handleSubmit = (values: any, e?: any, copy?: boolean) => {
        /*const valid = validateOptionalFields(values)
        console.log('form optional field validation:', valid)*/
        // console.log(validateOptionalFields)
        // const defaultValuesValid = form.validate()
        // form.validate()
        if(copy) {
            form.validate()
            Helper.waitABit()
        }

        if(form.isValid()) {
            mutate({values, copy} as any)
        } else {
            props.formState && props.setFormState && props.setFormState({
                submitState: 'none',
                inputErrors: form.errors
            })
        }
    }

    const handleError = () => {
        console.error('some error')
    }

    useEffect(() => {
        if(props.formState && props.formState.submitState === 'onSubmit') {
            form.validate()
            handleSubmit(form.values)
        }
    }, [props.formState]);

    /*const validateForm = () => {
        const validationErrors = validate().errors;
        for(const key in validationErrors) {
            if(form.values.hasOwnProperty(key) && validationErrors.hasOwnProperty(key)) {
                form.setFieldError(key, validationErrors[key])
            }
        }
    }

    const validate = () => {

        const inputs = form.values;

        let validationItems = [
            { key: 'PurchaseDate', value: inputs.PurchaseDate, required: true, type: Enums.ControlType.Date },
            { key: 'PurchaseAmount', value: inputs.PurchaseAmount, required: true, type: Enums.ControlType.Number },
            { key: 'WarrantyPeriod', value: inputs.WarrantyPeriod, required: true, type: Enums.ControlType.Number },
            { key: 'Inventory', value: selectedInventory, required: true, type: Enums.ControlType.Select },
        ];

        if (customFieldMeta?.field1Required) {
            validationItems = [...validationItems,
                { key: 'CustomField1', value: inputs.CustomField1, required: true, type: Enums.ControlType.Text }];
        }

        if (customFieldMeta?.field2Required) {
            validationItems = [...validationItems,
                { key: 'CustomField2', value: inputs.CustomField2, required: true, type: Enums.ControlType.Text }];
        }

        if (customFieldMeta?.serialNumberRequired) {
            validationItems = [...validationItems,
                { key: 'SerialNumber', value: inputs.SerialNumber, required: true, type: Enums.ControlType.Text }];
        }

        if (customFieldMeta?.invoiceNumberRequired) {
            validationItems = [...validationItems,
                { key: 'InvoiceNumber', value: inputs.InvoiceNumber, required: true, type: Enums.ControlType.Text }];
        }

        return Helper.validateInputs(validationItems);
    };*/

    return <>

        <Title
            // my={'var(--mantine-spacing-lg)'}
            size={'lg'}
            fw={600}
        >
            {props.editAsset && 'Edit Customer Asset' || 'Create Customer Asset'}
        </Title>

        <form
            onSubmit={form.onSubmit(handleSubmit, handleError)}
        >

            <Box>
                <LoadingOverlay visible={assetFieldSettings.isLoading} />

                {isMultiStore ?
                    <div>
                        <StoreSelector
                            accessStatus={props.accessStatus}
                            error={form.getInputProps('StoreID').error}
                            // options={stores}
                            required={true}
                            setSelectedStore={(e) => {
                                setSelectedStore(e);
                                form.setFieldValue('StoreID', e?.ID || null)
                            }}
                            selectedStore={selectedStore}
                            cypress={undefined}
                        />
                    </div> : ''
                }

                <CustomerContactLocationSelector
                    isNew={props.assetPageMode ? !props.editAsset : true}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={(customer) => {
                        setSelectedCustomer(customer)
                        props.onCustomerChange && props.onCustomerChange(customer)
                        form.setFieldValue('CustomerID', customer ? customer.ID : null)
                    }}
                    canChangeCustomer={!props.job/* && !props.editAsset*/}
                    selectedContact={selectedContact}
                    setSelectedContact={(contact) => {
                        setSelectedContact(contact)
                        contact !== null && form.setFieldValue('CustomerContactID', contact ? contact.ID : null)
                    }}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={(location) => {
                        setSelectedLocation(location)
                        location !== null && form.setFieldValue('LocationID', location ? location.ID : null)
                    }}
                    locationRequired={isRequired('LocationID')}
                    hideLocation={!isShown('LocationID')}
                    // hasSMSCreditsAvailable={hasCreditsAvailable}
                    // sendEmail={sendEmail}
                    // setSendEmail={setSendEmail}
                    // sendSMS={sendSMS}
                    // setSendSMS={setSendSMS}
                    inputErrors={{
                        Customer: form.errors.CustomerID,
                        Contact: form.errors.CustomerContactID,
                        Location: form.errors.LocationID,
                    }}
                    // accessStatus={accessStatus}
                    // sendFromContact={true}
                    iconMode
                    /*onCustomersLoaded={(x) => {
                        if( selectedCustomer?.ID !== form.values['CustomerID'] ) {
                            const selected = x.find(y => y.ID === form.values['CustomerID'])
                            selected && setSelectedCustomer(selected)
                        }
                    }}
                    onContactsLoaded={(x) => {
                        if( selectedContact?.ID !== form.values['CustomerContactID'] ) {
                            const selected = x.find(y => y.ID === form.values['CustomerContactID'])
                            selected && setSelectedContact(selected)
                        }
                    }}
                    onLocationsLoaded={(x) => {
                        if( selectedLocation?.ID !== form.values['LocationID'] ) {
                            const selected = x.find(y => y.ID === form.values['LocationID'])
                            selected && setSelectedLocation(selected)
                        }
                    }}*/
                    {...{} as any}
                />

                <InventorySelector
                    onCreateNewInventoryItem={() => setShowCreateNewInventory(true)}
                    selectedInventory={selectedInventory}
                    setSelectedInventory={onSelectedInventoryChanged}
                    accessStatus={props.accessStatus}
                    error={form.getInputProps('InventoryID').error}
                    setInventoryChanged={undefined}
                    cypress={undefined}
                    ignoreIDs={[]}
                    isRequired
                    {...form.getInputProps('InventoryID')}
                />

                <SimpleGrid
                    spacing={{
                        sm: 'var(--mantine-spacing-sm)',
                        base: 'var(--mantine-spacing-lg)'
                    }}
                    verticalSpacing={0}
                    cols={{
                        sm: 2,
                        base: 1
                    }}
                >

                    <ScTextControl
                        label={`Asset/Serial Number`}
                        description={!props.editAsset && 'Leave blank to auto generate'}
                        barcodeScannerSafe
                        {...form.getInputProps('ProductNumber')}
                    />

                    {/*<WarrantyIndicator purchaseDate={form.values.PurchaseDate} warrantyPeriod={form.values.WarrantyPeriod} />*/}

                    {
                        // isShown('PurchaseDate') &&
                        <SCDatePicker
                            // locale={'en-ZA'}
                            label={'Purchase Date'}
                            withAsterisk//={isRequired('PurchaseDate')}
                            {...form.getInputProps('PurchaseDate')}
                            icon={
                                // form.values.PurchaseDate && form.values.WarrantyPeriod > 0 &&
                                <WarrantyIndicator purchaseDate={form.values.PurchaseDate} warrantyPeriod={form.values.WarrantyPeriod} />
                            }
                        />
                    }

                    {
                        isShown('WarrantyPeriod') &&
                        <ScNumberControl
                            label={'Warranty Period'}
                            withAsterisk={isRequired('WarrantyPeriod')}
                            min={0}
                            decimalScale={0}
                            {...form.getInputProps('WarrantyPeriod')}
                        />
                    }

                    {
                        isShown('PurchaseAmount') &&
                        <ScNumberControl
                            label={'Purchase Amount'}
                            withAsterisk={isRequired('PurchaseAmount')}
                            min={0}
                            decimalScale={2}
                            thousandSeparator={' '}
                            fixedDecimalScale
                            hideControls
                            {...form.getInputProps('PurchaseAmount')}
                        />
                    }

                    {
                        isShown('InvoiceNumber') &&
                        <ScTextControl
                            label={'Invoice Number'}
                            withAsterisk={isRequired('InvoiceNumber')}
                            {...form.getInputProps(getFormNameForSystemName('InvoiceNumber'))}
                        />
                    }

                    {
                        isShown('OtherNumber') &&
                        <ScTextControl
                            label={'Other Number'}
                            withAsterisk={isRequired('OtherNumber')}
                            barcodeScannerSafe
                            {...form.getInputProps(getFormNameForSystemName('OtherNumber'))}
                        />
                    }

                    {
                        isShown('LastServicedDate') &&
                        <SCDatePicker
                            label={'Last Serviced Date'}
                            withAsterisk={isRequired('LastServicedDate')}
                            {...form.getInputProps(getFormNameForSystemName('LastServicedDate'))}
                        />
                    }
                </SimpleGrid>

                <SimpleGrid
                    spacing={{
                        sm: 'var(--mantine-spacing-sm)',
                        base: 'var(--mantine-spacing-lg)'
                    }}
                    verticalSpacing={0}
                    cols={{
                        sm: 2,
                        base: 1
                    }}
                    // my={0}
                >
                    {
                        /*(assetFieldSettings.isFetching)
                        && ['40', '42', '50', '60', '60', '40', '70', '50', '55', '40'].map(
                            (x, i) => <Stack key={'loader' + i} gap={0}>
                                <Skeleton width={+x} mt={'var(--mantine-spacing-xs)'} mb={5} height={16}/>
                                <Skeleton width={'100%'} height={34}/>
                            </Stack>
                        ) ||*/ <>

                        {
                            /*assetFieldSettings.data?.map(x => (
                                <Box key={x.ID}>
                                    {
                                        x.FieldSystemName.startsWith('CustomCheckbox')
                                    }
                                </Box>
                            ))*/
                        }
                        {
                            isShown('CustomField1') &&
                            <ScTextControl
                                label={settingsBySystemName[getSystemNameForFormName('CustomField1')].DisplayName}
                                withAsterisk={isRequired('CustomField1')}
                                {...form.getInputProps('CustomField1')}
                            />
                        }
                        {
                            isShown('CustomField2') &&
                            <ScTextControl
                                label={settingsBySystemName[getSystemNameForFormName('CustomField2')].DisplayName}
                                withAsterisk={isRequired('CustomField2')}
                                {...form.getInputProps('CustomField2')}
                            />
                        }


                        {
                            isShown('CustomField3') &&
                            <ScTextControl
                                label={settingsBySystemName[getSystemNameForFormName('CustomField3')].DisplayName}
                                withAsterisk={isRequired('CustomField3')}
                                {...form.getInputProps('CustomField3')}
                            />
                        }

                        {
                            isShown('CustomField4') &&
                            <ScTextControl
                                label={settingsBySystemName[getSystemNameForFormName('CustomField4')].DisplayName}
                                withAsterisk={isRequired('CustomField4')}
                                {...form.getInputProps('CustomField4')}
                            />
                        }


                        {
                            isShown('CustomDate1') &&
                            <SCDatePicker
                                canClear
                                label={settingsBySystemName[getSystemNameForFormName('CustomDate1')].DisplayName}
                                withAsterisk={isRequired('CustomDate1')}
                                {...form.getInputProps('CustomDate1')}
                            />
                        }

                        {
                            isShown('CustomDate2') &&
                            <SCDatePicker
                                canClear
                                label={settingsBySystemName[getSystemNameForFormName('CustomDate2')].DisplayName}
                                withAsterisk={isRequired('CustomDate2')}
                                {...form.getInputProps('CustomDate2')}
                            />
                        }


                        {
                            isShown('CustomFilter1') &&
                            <SCSwitch
                                label={settingsBySystemName[getSystemNameForFormName('CustomFilter1')].DisplayName}
                                checked={form.values['CustomFilter1']}
                                onToggle={(checked) => form.setFieldValue('CustomFilter1', checked)}
                            />
                        }
                        {
                            isShown('CustomFilter2') &&
                            <SCSwitch
                                label={settingsBySystemName[getSystemNameForFormName('CustomFilter2')].DisplayName}
                                checked={form.values['CustomFilter2']}
                                onToggle={(checked) => form.setFieldValue('CustomFilter2', checked)}
                            />
                        }

                        {
                            isShown('CustomNumber1') &&
                            <ScNumberControl
                                label={settingsBySystemName[getSystemNameForFormName('CustomNumber1')].DisplayName}
                                withAsterisk={isRequired('CustomNumber1')}
                                {...form.getInputProps('CustomNumber1')}
                            />
                        }

                        {
                            isShown('CustomNumber2') &&
                            <ScNumberControl
                                label={settingsBySystemName[getSystemNameForFormName('CustomNumber2')].DisplayName}
                                withAsterisk={isRequired('CustomNumber2')}
                                {...form.getInputProps('CustomNumber2')}
                            />
                        }


                    </>
                    }
                </SimpleGrid>

            </Box>

            {
                _userAdmin &&
                <>
                    <Space h={25}></Space>
                    <Link href={'/settings/asset/manage'} style={{textDecoration: 'none'}}>
                        <Flex align={'center'} justify={'end'} c={'scBlue'} gap={5}>
                            <IconQuestionCircle size={16} />
                            <Anchor size={'sm'}>Not seeing what you need? &nbsp;Add additional fields here.</Anchor>
                        </Flex>
                    </Link>
                </>
            }


            {
                !props.hideSaveAndCancel &&
                <Group mt={'2rem'} justify={'right'} gap={'xs'}>
                    <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                        props.onClose && props.onClose()
                    }}>
                        Cancel
                    </Button>
                    {
                        props.assetCreatedAndCopied &&
                        <Button
                            onClick={() => handleSubmit(form.values, undefined, true)}
                            variant={'outline'}
                            rightSection={isLoading && <Loader variant={'oval'} size={14} ml={5} color={'gray.7'}/>}
                            disabled={isLoading}
                        >
                            Create & Copy
                        </Button>
                    }
                    <Button
                        type={'submit'}
                        // type={'button'}
                        // onClick={handleSubmit}
                        disabled={isLoading}
                        rightSection={isLoading && <Loader variant={'oval'} size={14} ml={5} color={'gray.5'} />}
                    >
                        {!props.editAsset && 'Create' || 'Save'}
                    </Button>
                </Group>
            }
        </form>

        <InventoryItemModal
            show={showCreateNewInventory}
            onInventorySave={(x) => {
                setShowCreateNewInventory(false)
                onSelectedInventoryChanged(x)
            }}
            onClose={() => setShowCreateNewInventory(false)}
            accessStatus={props.accessStatus}
            isNew
            backLabel={props.editAsset && 'Edit Customer Asset' || 'Create Customer Asset'}
        />
    </>
}

export default AssetForm;
