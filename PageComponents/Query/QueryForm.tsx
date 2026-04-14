import React, {FC, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {FieldSetting, getFieldSettings} from "@/PageComponents/Settings/Field Settings/FieldSettings";
import * as Enums from "@/utils/enums";
import {
    getFormNameForSystemName,
    getSystemNameForFormName
} from "@/PageComponents/Settings/Field Settings/fieldSettingHelper";
import Time from "@/utils/time";
import {Anchor, Box, Button, Flex, Group, SimpleGrid, Space, Title} from "@mantine/core";
import CustomerContactLocationSelector from "@/components/selectors/customer/customer-contact-location-selector";
import InventorySelector from "@/components/selectors/inventory/inventory-selector";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import SCDatePicker from "@/components/sc-controls/form-controls/sc-datepicker";
import Link from "next/link";
import {IconQuestionCircle} from "@tabler/icons";
import {useForm} from "@mantine/form";
import Helper from "@/utils/helper";
import StoreSelector from "@/components/selectors/store/store-selector";
import Fetch from "@/utils/Fetch";
import Storage from "@/utils/storage";
import {showNotification} from "@mantine/notifications";
import SubscriptionContext from "@/utils/subscription-context";
import BillingService from "@/services/billing-service";
import PS from "@/services/permission/permission-service";
import QueryTypeSelector from "@/components/selectors/query/query-type-selector";
import QueryStatusSelector from "@/components/selectors/query/query-status-selector";
import EmployeeSelector from "@/components/selectors/employee/employee-selector";
import SCDropdownList from "@/components/sc-controls/form-controls/sc-dropdownlist";
import SCTextArea from "@/components/sc-controls/form-controls/sc-textarea";
import SCSwitch from "@/components/sc-controls/form-controls/sc-switch";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import ConfirmAction from "@/components/modals/confirm-action";
import Router, {useRouter} from "next/router";
import InventoryItemModal from "@/PageComponents/Inventory/InventoryItemModal";

const _userAdmin = PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin);

const queryPriorities = Enums.getEnumItems(Enums.QueryPriority, false);

const queryPost = async (params, put: boolean) => {
    const req = put ? Fetch.put : Fetch.post
    const res =  await req({
        url: `/Query`,
        params,
    } as any)

    if(res?.Query?.ID || res?.ID) {
        return res
    } else {
        throw new Error(res.serverMessage || res.message || 'something went wrong')
    }
}

const QueryForm: FC<{
    query?: any
    job?: any
    module?: number
    moduleID?: string
    customerID?: number
    onCustomerChange?: (newCustomer: any) => void
    hideSaveAndCancel?: boolean
    // triggerSave?: number
    onSubmitState?: (state: 'success' | 'error') => void
    setSubmitState?: 'onSubmit' | 'none'
    onSaved?: (query: any) => void
    onClose?: () => void
}> = (props) => {

    const subscriptionContext = useContext(SubscriptionContext);
    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
    const [hasCreditsAvailable, setHasCreditsAvailable] = useState<any>();

    const [showCreateNewInventory, setShowCreateNewInventory] = useState(false);

    const getAccessStatus = async () => {
        const [subscriptionInfo, message] = await BillingService.getSubcriptionInfo(subscriptionContext);
        if (subscriptionInfo) {
            setHasCreditsAvailable(subscriptionInfo.SMSCreditsPurchased - (subscriptionInfo.SMSCreditsUsed ? subscriptionInfo.SMSCreditsUsed : 0) > 0);
            setAccessStatus(subscriptionInfo.AccessStatus);
        }
    };

    const querySettings = useQuery(['assetFieldSettings'], () => getFieldSettings(Enums.Module.Query))
    const settingsBySystemName: { [fieldSystemName: string]: FieldSetting } = useMemo(() => {
        if (querySettings.data) {
            return querySettings.data.reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue.FieldSystemName]: {...currentValue}
            }), {})
        } else {
            return {}
        }
    }, [querySettings.data])
    const isRequired = useCallback((name: string) => {
        const systemName = getSystemNameForFormName(name)
        return settingsBySystemName.hasOwnProperty(systemName) ? isShown(name) && settingsBySystemName[systemName].IsRequired : false
    }, [settingsBySystemName])

    const isShown = useCallback((name: string) => {
        const systemName = getSystemNameForFormName(name)
        return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive && (!!props.query || !settingsBySystemName[systemName].HideOnCreate) : false
    }, [settingsBySystemName, props.query])

    const formInitialValues = useMemo(() => {
        return {
            CustomerID: props.query ? props.query?.CustomerID : props.job?.CustomerID || null,
            CustomerContactID: props.query ? props.query?.CustomerContactID : props.job?.CustomerContactID || null,
            LocationID: props.query ? props.query?.LocationID : props.job?.LocationID || null,
            InventoryID: props.query?.Inventory?.ID || null,
            QueryTypeID: props.query ? props.query.QueryTypeID : null,
            QueryStatusID: props.query ? props.query.QueryStatusID : null,
            Priority: props.query ? props.query?.Priority : null, // Enums.QueryPriority[selectedQueryPriority],
            Reference: props.query ? props.query.Reference : '',
            Description: props.query ? props.query.Description : '',
            EmployeeID: props.query ? props.query.EmployeeID : null,
            // Date: Time.today(),
            FollowupDate: props.query ? props.query.FollowupDate : null,
            // ClientDate: props.query ? props.query.ClientDate : Time.today(),
            SendEmail: props.query ? props.query.SendEmail : true,
            SendSMS: props.query ? props.query.SendSMS : true,
            StoreID: props.query ? props.query.StoreID : null,
            IsDraft: props.query ? props.query.IsDraft : true,
            CustomField1: props.query?.CustomField1 || '',
            CustomField2: props.query?.CustomField2 || '',
            CustomField3: props.query?.CustomField3 || '',
            CustomField4: props.query?.CustomField4 || '',
            CustomFilter1: props.query?.CustomFilter1 || false,
            CustomFilter2: props.query?.CustomFilter2 || false,
            CustomDate1: props.query?.CustomDate1 /*&& dayjs(props.query?.CustomDate1).utc(true).toDate()*/ || null,
            CustomDate2: props.query?.CustomDate2 /*&& dayjs(props.query?.CustomDate2).utc(true).toDate()*/ || null,
            CustomNumber1: props.query?.CustomNumber1 || null,
            CustomNumber2: props.query?.CustomNumber2 || null,
        }
    }, [props.query, props.job])

    const form = useForm({
        initialValues: formInitialValues,
        validate: {
            StoreID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isMultiStore
            } as any),
            FollowupDate: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Date,
                required: true
            } as any),
            InventoryID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('InventoryID')
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
            QueryTypeID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true
            } as any),
            QueryStatusID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true
            } as any),
            Priority: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Number,
                required: true
            } as any),
            Description: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true
            } as any),
            EmployeeID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true
            } as any),
            CustomField1: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('CustomField1'),
            } as any),
            CustomField2: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('CustomField2'),
            } as any),
            CustomField3: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: isRequired('CustomField3'),
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
            } as any)
        }
    })

    useEffect(() => {
        // in order to update form state when item is updated from outside with uncontrolled values like isDraft so that isDirty calculation remains relevant
        if(formInitialValues) {
            form.setValues(formInitialValues)
        }
    }, [formInitialValues]);

    const isDirty = useRef(false)

    // const [isDirty, setIsDirty] = useState(false)
    // console.log(isDirty)
    useEffect(() => {
        const ignore = ['StoreID']

        const dirtyItems = Object.entries(form.values).filter(([key, value]) =>
            !ignore.includes(key) && (typeof value === 'string' ? value.trim() !== formInitialValues[key] : value !== formInitialValues[key])
        )
        // console.log('dirty items', dirtyItems, 'form values', form.values, 'initial values', formInitialValues, 'og data', props.query)
        if(dirtyItems.length !== 0) {
            if(form.isDirty()) {
                isDirty.current = true
                // setIsDirty(true)
            }
        } else {
            isDirty.current = false
            // setIsDirty(false)
        }
    }, [formInitialValues, form.values]);

    const scrollToErrors = () => {
        // console.log('scroll')
        setTimeout(() => {
            const errors = Object.entries(form.validate().errors)

            if(errors.length !== 0) {
                props.onSubmitState && props.onSubmitState('error')

                const [, error] = errors[0]

                showNotification({
                    id: 'fieldErrors',
                    title: 'There are errors on the page',
                    message: error,
                    color: 'yellow',
                    autoClose: 2000
                })

                // const el = document.getElementsByName(itemName)
                const el = document.querySelectorAll('[data-error]')
                if (el.length !== 0) {
                    el[0]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    })
                }
            }
        }, 100)
    }

    /** Confirm Options*/
    const router = useRouter()
    const navUrl = useRef('')
    const saveAndNavigate = (url: string) => {
        navUrl.current = url
        handleSubmit(form.values)
    }
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
    Helper.preventRouteChange(isDirty.current, (x) => isDirty.current = x, setConfirmOptions, saveAndNavigate, true);

    // console.log(form.values, form.errors)

    const [selectedQueryType, setSelectedQueryType] = useState<any>(props.query?.QueryType ?? null);
    const [selectedQueryStatus, setSelectedQueryStatus] = useState<any>(props.query?.QueryStatus ?? null);

    const [selectedCustomer, setSelectedCustomer] = useState<any>(props.query?.Customer ?? null);
    const [canChangeCustomer, setCanChangeCustomer] = useState(true);
    const [selectedCustomerName, setCustomerName] = useState('');

    const [selectedContact, setSelectedContact] = useState<any>(props.query?.Contact ?? null);
    const [selectedLocation, setSelectedLocation] = useState<any>(props.query?.Location ?? null);

    const [selectedEmployee, setSelectedEmployee] = useState<any>(props.query?.Employee ?? null);

    const [selectedQueryPriority, setSelectedQueryPriority] = useState<any>(!!props.query ? Enums.getEnumStringValue(Enums.QueryPriority, props.query.Priority) : null);

    const [selectedInventory, setSelectedInventory] = useState<any>(props.query?.Inventory ?? null);

    const selectCustomer = async (id) => {
        if (id) {
            const customer = await Fetch.get({
                url: `/Customer/${id}`,
            } as any);
            setSelectedCustomer(customer);
            setCustomerName(customer.CustomerName);
            setSelectedContact(customer.Contacts ? customer.Contacts[0] : undefined);
            setSelectedLocation(customer.Locations ? customer.Locations[0] : undefined);
        }
    };

    useEffect(() => {
        if(selectedQueryType?.ID) {
            form.setFieldValue('QueryTypeID', selectedQueryType.ID)
        } else {
            form.setFieldValue('QueryTypeID', null)
        }
    }, [selectedQueryType]);
    useEffect(() => {
        if(selectedQueryStatus?.ID) {
            form.setFieldValue('QueryStatusID', selectedQueryStatus.ID)
        } else {
            form.setFieldValue('QueryStatusID', null)
        }
    }, [selectedQueryStatus]);

    useEffect(() => {
        if(selectedQueryPriority) {
            form.setFieldValue('Priority', Enums.QueryPriority[selectedQueryPriority])
        } else {
            form.setFieldValue('Priority', null)
        }
    }, [selectedQueryPriority]);

    useEffect(() => {
        if(selectedInventory) {
            form.setFieldValue('InventoryID', selectedInventory?.ID)
        } else {
            form.setFieldValue('InventoryID', null)
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

    useEffect(() => {
        if(selectedEmployee?.ID) {
            form.setFieldValue('EmployeeID', selectedEmployee.ID)
        } else {
            form.setFieldValue('EmployeeID', null)
        }
    }, [selectedEmployee]);

    useEffect(() => {
        if (props.module) {
            if (props.module === Enums.Module.Customer) {
                selectCustomer(props.module);
            }
            else if (props.module === Enums.Module.Quote) {
                // selectCustomer(props.customerID);
                setCanChangeCustomer(false);
                // setItemID(props.moduleID);
                // setModule(props.module);
            }
            else if (props.module === Enums.Module.JobCard) {
                // selectCustomer(props.customerID);
                setCanChangeCustomer(false);
                // setItemID(props.moduleID);
                // setModule(props.module);
                if (!!props.job.Store) {
                    setSelectedStore(props.job.Store);
                }
            }
        }
        getAccessStatus();
    }, []);

    useEffect(() => {
        if(props.customerID) {
            selectCustomer(props.customerID)
        }
    }, [props.customerID]);


    // STORES
    const [isMultiStore, setIsMultiStore] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(props.query?.Store ?? null);

    /*   const getStore = async () => {
           const storesResult = await Fetch.get({
               url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
           });
           setIsMultiStore(storesResult.TotalResults > 1);
       };*/
    const { data: storesData } = useQuery(['stores'], () => Fetch.get({
        url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
    } as any))

    useEffect(() => {
        if (storesData) {
            setIsMultiStore(storesData.TotalResults > 1);
            if(storesData.TotalResults === 1 && !selectedStore) {
                setSelectedStore(storesData.Results[0])
                form.setFieldValue('StoreID', storesData.Results[0]?.ID)
            }
        }
    }, [storesData, selectedStore, form])

    /*useEffect(() => {
        if (selectedEmployee && !Helper.isEmptyObject(selectedEmployee)) {
            setSelectedEmployee(null);
            form.setFieldValue('EmployeeID', null)
            showNotification({
                message: 'Employee has been cleared',
                autoClose: 2000,
            });
        }

        if(selectedStore?.ID) {
            form.setFieldValue('StoreID', selectedStore.ID)
        }
    }, [selectedStore]);*/

    const clearEmployee = (store) => {
        if (selectedEmployee && !Helper.isEmptyObject(selectedEmployee)) {
            setSelectedEmployee(null);
            form.setFieldValue('EmployeeID', null)
            showNotification({
                message: 'Employee has been cleared',
                autoClose: 2000,
            });
        }

        if(store?.ID) {
            form.setFieldValue('StoreID', store.ID)
        }
    }

    const queryMutation = useMutation(['query'], (payload) => queryPost(payload, !!props.query), {
        onSuccess: (data) => {
            if(navUrl.current) {
                Helper.nextRouter(Router.push, navUrl.current);
            } else if(!props.query) { // isNew
                Helper.nextRouter(Router.push, '/query/[id]', `/query/${data.Query.ID}`);
            }
            props.onSubmitState && props.onSubmitState('success')
            props.onSaved && props.onSaved(data)
            showNotification({
                id: 'createQuery',
                message: 'Query successfully ' + (!!props.query ? 'updated' : 'created'),
                loading: false,
                autoClose: 2000
            })
        },
        onError: (error: Error) => {
            const message = `Query could not be  ${!props.query ? 'created' : 'updated'}`
            showNotification({
                id: 'createQuery',
                message: error?.message || message,
                color: 'yellow',
                loading: false,
                autoClose: 3000
            });
            isDirty.current = true
            props.onSubmitState && props.onSubmitState('error')
        }
    })

    const handleSubmit = (values: any, e?: any, copy?: boolean) => {
        isDirty.current = false

        if(form.isValid()) {
            // console.log('submitting ', values)
            queryMutation.mutate({
                Query: {
                    ...(props.query),
                    ...values,
                    Date: Time.today(),
                    ClientDate: Time.today(),
                },
                ItemID: props.moduleID || null,
                Module: typeof props.module !== 'undefined' ? +props.module : null/* && !isNaN(+props.module) ? props.module : module*/
            } as any)
        } else {
            navUrl.current = ''
            // onNewStatus && onNewStatus('none')
            /*if (!isDirty && !form.validate().hasErrors && !hideSaveAndCancel) {
                // onInventorySaved(inventory);
            }*/

            scrollToErrors();
        }
    }

    useEffect(() => {
        if(props.setSubmitState === 'onSubmit') {
            handleSubmit(form.values)
        }
    }, [props.setSubmitState])

    return (
        <>

            <Title
                size={'lg'}
                fw={600}
            >
                {props.query && 'Edit Query Details' || 'Create Query'}
            </Title>

            {isMultiStore ?
                <div className="">
                    {/* <h3>Store</h3> */}
                    <StoreSelector
                        accessStatus={accessStatus}
                        error={form.getInputProps('Store').error}
                        // options={stores}
                        required={true}
                        setSelectedStore={(e) => {
                            setSelectedStore(e);
                            form.setFieldValue('StoreID', e.ID)
                            clearEmployee(e)
                        }}
                        selectedStore={selectedStore}
                        cypress={undefined}
                    />

                </div> : ''
            }

            <form
                onSubmit={form.onSubmit(handleSubmit)}
            >
                <Box>
                    {/*<LoadingOverlay visible={assetFieldSettings.isLoading}/>*/}

                    <CustomerContactLocationSelector
                        isNew={!props.query}
                        selectedCustomer={selectedCustomer}
                        setSelectedCustomer={(customer) => {
                            setSelectedCustomer(customer)
                            props.onCustomerChange && props.onCustomerChange(customer)
                            form.setFieldValue('CustomerID', customer ? customer.ID : null)
                        }}
                        canChangeCustomer={canChangeCustomer}
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
                        // hideLocation={!isShown('LocationID')}
                        inputErrors={{
                            Customer: form.errors.CustomerID,
                            Contact: form.errors.CustomerContactID,
                            Location: form.errors.LocationID,
                        }}
                        iconMode
                        sendEmail={form.values.SendEmail}
                        setSendEmail={x => form.setFieldValue('SendEmail', x)}
                        sendSMS={form.values.SendSMS}
                        setSendSMS={x => form.setFieldValue('SendSMS', x)}
                        {...{} as any}
                    />

                    <SimpleGrid
                        spacing={{
                            sm: 'sm',
                            base: 'lg'
                        }}
                        verticalSpacing={0}
                        cols={{
                            sm: 2,
                            base: 1
                        }}
                    >
                        <QueryTypeSelector
                            accessStatus={accessStatus}
                            error={form.errors.QueryTypeID as string || ''}
                            placeholder="Select query type"
                            required={true}
                            selectedQueryType={selectedQueryType}
                            setSelectedQueryType={(e) => {
                                setSelectedQueryType(e);
                            }}
                            canClear={false}
                            ignoreAddOption={false}
                        />

                        <div className="status">

                            <QueryStatusSelector
                                accessStatus={accessStatus}
                                canClear={false}
                                error={form.errors.QueryStatusID as string || ''}
                                ignoreAddOption={false}
                                placeholder="Select query status"
                                queryType={selectedQueryType}
                                required={true}
                                selectedQueryStatus={selectedQueryStatus}
                                setSelectedQueryStatus={setSelectedQueryStatus}
                            />

                        </div>

                        <EmployeeSelector
                            accessStatus={accessStatus}
                            selectedEmployee={selectedEmployee}
                            setSelectedEmployee={setSelectedEmployee}
                            error={form.errors.EmployeeID}
                            storeID={form.values.StoreID}
                            required={true}
                        />

                        {
                            isShown('Reference') &&
                            <ScTextControl
                                label={'Reference'}
                                withAsterisk={isRequired('Reference')}
                                {...form.getInputProps(getFormNameForSystemName('Reference'))}
                            />
                        }


                        <SCDatePicker
                            canClear
                            label={'Follow up date'}
                            withAsterisk
                            {...form.getInputProps(getFormNameForSystemName('FollowupDate'))}
                        />

                        <SCDropdownList
                            label="Priority"
                            options={queryPriorities}
                            placeholder="Select required priority"
                            required={true}
                            onChange={(e) => {
                                setSelectedQueryPriority(e);
                            }}
                            value={selectedQueryPriority}
                            error={form.errors.Priority as string || ''}
                        />

                        {isShown('InventoryID') &&
                            <InventorySelector
                                onCreateNewInventoryItem={() => setShowCreateNewInventory(true)}
                                selectedInventory={selectedInventory}
                                setSelectedInventory={setSelectedInventory}
                                accessStatus={accessStatus}
                                error={form.getInputProps('InventoryID').error}
                                // setInventoryChanged={null}
                                // cypress={null}
                                ignoreIDs={[]}
                                isRequired={isRequired('InventoryID')}
                                {...form.getInputProps('InventoryID')}
                            />
                        }


                    </SimpleGrid>

                    <SCTextArea
                        width={'100%'}
                        label="Description of the query"
                        {...form.getInputProps('Description')}
                        required={true}
                        customProps={{
                            w: '100% !important',
                            maw: '100%'
                        }}
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
                        <Link href={'/settings/query/manage'} style={{textDecoration: 'none'}}>
                            <Flex align={'center'} justify={'end'} c={'scBlue'} gap={5}>
                                <IconQuestionCircle size={16}/>
                                <Anchor size={'sm'}>Not seeing what you need? &nbsp;Add additional fields here.</Anchor>
                            </Flex>
                        </Link>
                    </>
                }


                {
                    !props.hideSaveAndCancel &&
                    <Group mt={'4rem'} justify={'right'} gap={'xs'}>
                        <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                            props.onClose && props.onClose()
                        }}>
                            Cancel
                        </Button>
                        <Button
                            type={'submit'}
                            // type={'button'}
                            onClick={scrollToErrors}
                            // disabled={isLoading}
                            // rightSection={isLoading && <Loader variant={'oval'} size={14} ml={5} color={'gray.5'}/>}
                        >
                            {!props.query && 'Create' || 'Save'}
                        </Button>
                    </Group>
                }
            </form>


            <InventoryItemModal
                show={showCreateNewInventory}
                onInventorySave={(x) => {
                    setShowCreateNewInventory(false)
                    setSelectedInventory(x)
                }}
                onClose={() => setShowCreateNewInventory(false)}
                accessStatus={accessStatus}
                isNew
                backLabel={props.query && 'Edit Query Details' || 'Create Query'}
            />

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

        </>
    )
}

export default QueryForm

/* const [itemID, setItemID] = useState();
 const [module, setModule] = useState();

 const subscriptionContext = useContext(SubscriptionContext);
 const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
 const [selectedInventory, setSelectedInventory] = useState();

 const getAccessStatus = async () => {
     const [subscriptionInfo, message] = await BillingService.getSubcriptionInfo(subscriptionContext);
     if (subscriptionInfo) {
         setHasCreditsAvailable(subscriptionInfo.SMSCreditsPurchased - (subscriptionInfo.SMSCreditsUsed ? subscriptionInfo.SMSCreditsUsed : 0) > 0);
         setAccessStatus(subscriptionInfo.AccessStatus);
     }
 };

 useEffect(() => {
     if (props.module) {
         if (props.module == Enums.Module.Customer) {
             selectCustomer(props.moduleID);
         }
         else if (props.module == Enums.Module.Quote) {
             selectCustomer(props.customerID);
             setCanChangeCustomer(false);
             setItemID(props.moduleID);
             setModule(props.module);
         }
         else if (props.module == Enums.Module.JobCard) {
             selectCustomer(props.customerID);
             setCanChangeCustomer(false);
             setItemID(props.moduleID);
             setModule(props.module);
             if (!!props.job.Store) {
                 setSelectedStore(props.job.Store);
             }
         }
     }
     getAccessStatus();
     getStore();
 }, []);

 useEffect(() => {
     if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
         Helper.nextRouter(Router.replace, "/");
     }
 }, [accessStatus]);

 const selectCustomer = async (id) => {
     if (id) {
         const customer = await Fetch.get({
             url: `/Customer/${id}`,
         });
         setSelectedCustomer(customer);
         setCustomerName(customer.CustomerName);
         setSelectedContact(customer.Contacts ? customer.Contacts[0] : undefined);
         setSelectedLocation(customer.Locations ? customer.Locations[0] : undefined);
     }
 };

 const toast = useContext(ToastContext);

 // STORES

 const [isMultiStore, setIsMultiStore] = useState(false);
 const [selectedStore, setSelectedStore] = useState();

 const getStore = async () => {
     const storesResult = await Fetch.get({
         url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
     });
     setIsMultiStore(storesResult.TotalResults > 1);
 };

 useEffect(() => {
     if (selectedEmployee && !Helper.isEmptyObject(selectedEmployee)) {
         setSelectedEmployee(null);
         toast.setToast({
             message: 'Employee has been cleared',
             show: true,
             type: Enums.ToastType.success
         });
     }
 }, [selectedStore]);


 // CUSTOMER

 const [canChangeCustomer, setCanChangeCustomer] = useState(true);
 const [selectedCustomer, setSelectedCustomer] = useState();
 const [selectedCustomerName, setCustomerName] = useState('');

 const [selectedCustomerQueries, setCustomerQueries] = useState([]);
 const [customerQueriesPage, setCustomerQueriesPage] = useState(0);
 const [querySearching, setQuerySearching] = useState(false);
 const [canLoadMoreQueries, setCanLoadMoreQueries] = useState(true);

 // CONTACTS
 const [selectedContact, setSelectedContact] = useState();

 const [sendEmail, setSendEmail] = useState(true);
 const [sendSMS, setSendSMS] = useState(true);
 const [hasCreditsAvailable, setHasCreditsAvailable] = useState();

 const firstContactUpdate = useRef(true);

 useEffect(() => {
     if (firstContactUpdate.current) firstContactUpdate.current = false;
     else setFormIsDirty(true);
 }, [selectedContact]);

 // LOCATIONS

 const [selectedLocation, setSelectedLocation] = useState();

 const firstLocationUpdate = useRef(true);

 useEffect(() => {
     if (firstLocationUpdate.current) firstLocationUpdate.current = false;
     else setFormIsDirty(true);
 }, [selectedLocation]);

 const [queryDesc, setQueryDesc] = useState('');

 const [queryReference, setQueryReference] = useState('');

 const handleQueryReferenceChange = (e) => {
     setQueryReference(e.value);
     setFormIsDirty(true);
 };

 const [selectedQueryType, setSelectedQueryType] = useState();

 const [formIsDirty, setFormIsDirty] = useState(false);
 const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());


 const [selectedQueryStatus, setSelectedQueryStatus] = useState();

 const handleQueryStatusChange = (e) => {
     setSelectedQueryStatus(e);
     setFormIsDirty(true);
 };



 const [queryFollowUpDate, setFollowUpDate] = useState(Time.now());

 const handleQueryFollowUpDateChangeSC = (e) => {
     console.log(e);
     setFollowUpDate(e.value);
     setFormIsDirty(true);
 };

 const handleInventoryChange = (inventory) => {
     setSelectedInventory(inventory);
     setFormIsDirty(true);
 };

 const [queryPriorities, setQueryPriorities] = useState(props.queryPriorities);
 const [selectedQueryPriority, setSelectedQueryPriority] = useState();

 const [selectedEmployee, setSelectedEmployee] = useState();

 const assignEmployee = (employee) => {
     setSelectedEmployee(employee);
     setFormIsDirty(true);
 };

 const [submitting, setSubmitting] = useState(false);

 const handleQueryDescChange = (e) => {
     setQueryDesc(e.value);
     setFormIsDirty(true);
 };

 async function getCustomerQueries(currentQueries, page) {

     if(selectedCustomer?.ID) {
         setQuerySearching(true);
         const queries = await Fetch.get({
             url: `/Query?customerID=${selectedCustomer.ID}&includeClosed=True&pageSize=5&pageIndex=${page}`
         });

         let newQueries = [];
         newQueries.push(...currentQueries);
         newQueries.push(...queries.Results);
         setCustomerQueries(newQueries);
         setQuerySearching(false);

         if (queries.ReturnedResults < 5) {
             setCanLoadMoreQueries(false);
         } else if (newQueries.length == queries.TotalResults) {
             setCanLoadMoreQueries(false);
         }
     } else {
         // not sure if good
         // setCustomerQueries([]);
     }
 }

 function loadMoreQueries() {
     setCustomerQueriesPage(customerQueriesPage + 1);
     getCustomerQueries(selectedCustomerQueries, customerQueriesPage + 1);
 }

 const firstCustomerUpdate = useRef(true);

 useEffect(() => {
     setCustomerQueriesPage(0);
     setCanLoadMoreQueries(true);
     if (selectedCustomer !== undefined) {
         getCustomerQueries([], 0);
     }
     setCustomerName(selectedCustomer ? selectedCustomer.CustomerName : '');

     if (firstCustomerUpdate.current) firstCustomerUpdate.current = false;
     else setFormIsDirty(true);
 }, [selectedCustomer]);

 const [inputErrors, setInputErrors] = useState({});

 const validate = () => {

     let validationItems = [];
     validationItems = [
         { key: 'Customer', value: selectedCustomer, required: true, type: Enums.ControlType.Select },
         { key: 'Contact', value: selectedContact, required: true, type: Enums.ControlType.Select },
         { key: 'QueryType', value: selectedQueryType, required: true, type: Enums.ControlType.Select },
         { key: 'QueryStatus', value: selectedQueryStatus, required: true, type: Enums.ControlType.Select },
         { key: 'QueryPriority', value: selectedQueryPriority, required: true, type: Enums.ControlType.Select },
         { key: 'FollowupDate', value: queryFollowUpDate, required: true, type: Enums.ControlType.Date },
         { key: 'Description', value: queryDesc, required: true, type: Enums.ControlType.Text },
         { key: 'Employee', value: selectedEmployee, required: true, type: Enums.ControlType.Custom },
     ];

     if (isMultiStore) {
         validationItems = [...validationItems,
             { key: 'Store', value: selectedStore, required: true, type: Enums.ControlType.Select }
         ];
     }

     const { isValid, errors } = Helper.validateInputs(validationItems);
     setInputErrors(errors);
     return isValid;
 };

 const submitQuery = async () => {
     setSubmitting(true);

     let isValid = validate();

     if (isValid) {

         let queryContactID = selectedContact ? selectedContact.ID : null;
         let queryLocationID = selectedLocation ? selectedLocation.ID : null;

         let params = {
             Query: {
                 CustomerID: selectedCustomer.ID,
                 CustomerContactID: queryContactID,
                 LocationID: queryLocationID,
                 QueryTypeID: selectedQueryType.ID,
                 QueryStatusID: selectedQueryStatus.ID,
                 FollowupDate: Time.toISOString(queryFollowUpDate),
                 Priority: Enums.QueryPriority[selectedQueryPriority],
                 Reference: queryReference,
                 Description: queryDesc,
                 EmployeeID: selectedEmployee.ID,
                 Date: Time.today(),
                 ClientDate: Time.today(),
                 SendEmail: sendEmail,
                 SendSMS: sendSMS,
                 StoreID: selectedStore ? selectedStore.ID : null,
                 IsDraft: true,
                 InventoryID: selectedInventory ? selectedInventory.ID : null
             }
         };

         if (itemID && module) {
             params = {
                 ...params,
                 ItemID: itemID,
                 Module: !isNaN(parseInt(module)) ? parseInt(module) : module
             };
         }

         const queryPost = await Fetch.post({
             url: `/Query`,
             params: params,
             toastCtx: toast
         });

         if (queryPost && queryPost.Query && queryPost.Query.ID) {
             Helper.mixpanelTrack(constants.mixPanelEvents.createQuery, {
                 "queryID": queryPost.Query.ID
             });
             setFormIsDirty(false);
             await Helper.waitABit();
             Helper.nextRouter(Router.push, '/query/[id]', `/query/${queryPost.Query.ID}`);
         } else {
             setSubmitting(false);
         }
     } else {
         toast.setToast({
             message: 'There are errors on the page',
             show: true,
             type: Enums.ToastType.error
         });
         setSubmitting(false);
     }

     return isValid;
 };

 Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, submitQuery);

 return (
     <div className="manage-container">
         <div className="row">
             <div className="title">
                 <Breadcrumbs currPage={{ text: 'Create a Query', link: '/query/create', type: 'create' }} />
             </div>
         </div>
         <div className="split">
             <div className="column">
                 {isMultiStore ?
                     <div className="">
                         {/!* <h3>Store</h3> *!/}
                         <StoreSelector
                             accessStatus={accessStatus}
                             error={inputErrors.Store}
                             // options={stores}
                             required={true}
                             setSelectedStore={(e) => {
                                 setSelectedStore(e);
                                 setFormIsDirty(true);
                             }}
                             selectedStore={selectedStore}
                         />

                     </div> : ''
                 }

                 <CustomerContactLocationSelector isNew={true}
                                                  selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} canChangeCustomer={canChangeCustomer}
                                                  selectedContact={selectedContact} setSelectedContact={setSelectedContact}
                                                  selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                                                  hasSMSCreditsAvailable={hasCreditsAvailable} sendEmail={sendEmail} setSendEmail={setSendEmail} sendSMS={sendSMS} setSendSMS={setSendSMS}
                                                  inputErrors={inputErrors} accessStatus={accessStatus} sendFromContact={true} iconMode
                 />

                 <div className="">
                     <h3>Query Details</h3>

                     <QueryTypeSelector
                         accessStatus={accessStatus}
                         error={inputErrors.QueryType}
                         placeholder="Select query type"
                         required={true}
                         selectedQueryType={selectedQueryType}
                         setSelectedQueryType={(e) => {
                             setSelectedQueryType(e);
                             setFormIsDirty(true);
                         }}
                         canClear={false}
                         ignoreAddOption={false}
                     />

                     <div className="status">

                         <QueryStatusSelector
                             accessStatus={accessStatus}
                             canClear={false}
                             error={inputErrors.QueryStatus}
                             ignoreAddOption={false}
                             placeholder="Select query status"
                             queryType={selectedQueryType}
                             required={true}
                             selectedQueryStatus={selectedQueryStatus}
                             setSelectedQueryStatus={handleQueryStatusChange}
                         />

                     </div>

                     <EmployeeSelector
                         selectedEmployee={selectedEmployee}
                         setSelectedEmployee={assignEmployee}
                         error={inputErrors.Employee}
                         storeID={(selectedStore ? selectedStore.ID : null)}
                         required={true}
                     />

                     <SCInput
                         label="Reference"
                         onChange={handleQueryReferenceChange}
                         required={false}
                         value={queryReference}
                         error={inputErrors.Reference}
                     />

                     <SCDatePicker
                         label="Follow up date"
                         required={true}
                         value={queryFollowUpDate}
                         error={inputErrors.FollowupDate}
                         changeHandler={handleQueryFollowUpDateChangeSC}
                     />

                     <SCDropdownList
                         label="Priority"
                         options={queryPriorities}
                         placeholder="Select required priority"
                         required={true}
                         onChange={(e) => {
                             setSelectedQueryPriority(e);
                             setFormIsDirty(true);
                         }}
                         value={selectedQueryPriority}
                         error={inputErrors.QueryPriority}
                     />

                     {props.showInventory ?
                         <InventorySelector
                             accessStatus={accessStatus}
                             error={inputErrors.Inventory}
                             selectedInventory={selectedInventory}
                             setSelectedInventory={handleInventoryChange}
                             isRequired={false}
                         /> : ""}

                     <SCTextArea
                         label="Description of the query"
                         onChange={handleQueryDescChange}
                         required={true}
                         value={queryDesc}
                         error={inputErrors.Description}
                     />

                 </div>
                 <div className="">

                     <Button text="Create Query" extraClasses="fit-content" onClick={submitQuery} disabled={submitting} />
                 </div>
             </div>
             <QueryHistory
                 canLoadMoreQueries={canLoadMoreQueries}
                 customer={selectedCustomerName}
                 queries={selectedCustomerQueries}
                 querySearching={querySearching}
                 loadMoreQueries={loadMoreQueries}
             />
         </div>

         <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

         <style jsx>{`
     .column {
       display: flex;
       flex-direction: column;
       width: 100%;
     }
     .column-margin {
       margin-left: 24px;
     }
     .button-container {
       flex-shrink: 0;
       width: 10rem;
     }
     .button-container :global(.button){
       margin-top: 0.5rem;
     }

     .row {
       display: flex;
       justify-content: space-between;
     }
     .cancel-link {
       color: ${colors.bluePrimary};
       cursor: pointer;
       font-size: 0.875rem;
     }
   `}</style>
     </div>
 );*/


/*CreateQuery.getInitialProps = async function (ctx) {

    const { module, moduleID, customerID } = ctx.query;


    let showInventory = false;
    let optionValue = await Fetch.get({
        url: `/Option/GetByOptionName?name=Query Show Inventory`,
        ctx: ctx
    } as any);
    if (optionValue) {
        showInventory = (optionValue);
    }

    const queryPriorities = Enums.getEnumItems(Enums.QueryPriority, false);

    let job = {};
    if (module == Enums.Module.JobCard && moduleID) {
        job = await Fetch.get({
            url: `/Job/${moduleID}`,
            ctx: ctx,
        } as any);
    }

    return {
        queryPriorities: queryPriorities,
        module: module,
        moduleID: moduleID,
        customerID: customerID,
        showInventory: showInventory,
        job: job
    };
};*/

// export default withAuthSync(CreateQuery, "/query");