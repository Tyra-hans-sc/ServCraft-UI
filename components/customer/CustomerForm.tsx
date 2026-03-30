import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import SCSwitch from '../sc-controls/form-controls/sc-switch';
import EmployeeSelector from '../selectors/employee/employee-selector';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import { Anchor, Flex, SimpleGrid, Space, Switch, Title, Tooltip } from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import { useForm } from "@mantine/form";
import Helper from "@/utils/helper";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import { useQuery } from '@tanstack/react-query';
import { FieldSetting, getFieldSettings } from '@/PageComponents/Settings/Field Settings/FieldSettings';
import CustomerService from "@/services/customer/customer-service";
import PS from "@/services/permission/permission-service";
import { useMediaQuery } from '@mantine/hooks';
import Link from "next/link";
import LocationForm from '@/PageComponents/customer/LocationForm';
import { IconQuestionCircle } from "@tabler/icons";

const editCustomerPermission = PS.hasPermission(Enums.PermissionName.EditCustomer);

const _userAdmin = PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin);

function CustomerForm({
  customer,
  accessStatus,
  triggerFormSaveCounter,
  onSaveValues,
  onDirtyStateChange,
  onErrors,
  showAddContactAndLocationForms,
  showTitle,
  showActiveToggle = true,
}) {


  /** fieldSettings Start */
  const customerFieldSettings = useQuery(['customerFieldSettings'], () => getFieldSettings(Enums.Module.Customer))
  const settingsBySystemName: { [fieldSystemName: string]: FieldSetting } = useMemo(() => {
    if (customerFieldSettings.data) {
      return customerFieldSettings.data.reduce((previousValue, currentValue) => ({
        ...previousValue,
        [currentValue.FieldSystemName]: { ...currentValue }
      }), {})
    } else {
      return {}
    }
  }, [customerFieldSettings.data])
  const isRequired = useCallback((name: string) => {
    // const systemName = getSystemNameForFormName(name)
    const systemName = name
    return settingsBySystemName.hasOwnProperty(systemName) ? isShown(name) && settingsBySystemName[systemName].IsRequired : false
  }, [settingsBySystemName])
  const isShown = useCallback((name: string) => {
    // const systemName = getSystemNameForFormName(name)
    const systemName = name
    return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive && (!!customer || !settingsBySystemName[systemName].HideOnCreate) : false
  }, [settingsBySystemName, customer])
  /** fieldSettings End */


  const [customerTypes, setCustomerTypes] = useState([]);
  const [industryTypes, setIndustryTypes] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);
  const [customerStatuses, setCustomerStatuses] = useState([]);

  const getCustomerTypes = async () => {
    const customerTypes = await Fetch.get({
      url: `/CustomerType`
    } as any);
    setCustomerTypes(customerTypes.Results ? customerTypes.Results : []);
  }
  const getIndustryTypes = async () => {
    const industryTypes = await Fetch.get({
      url: `/IndustryType`
    } as any);
    setIndustryTypes(industryTypes.Results ? industryTypes.Results : []);
  }

  const getMediaTypes = async () => {
    const mediaTypes = await Fetch.get({
      url: `/MediaType`
    } as any);
    setMediaTypes(mediaTypes.Results ? mediaTypes.Results : []);
  }

  const getCustomerStatuses = async () => {
    const statutes = await Fetch.get({
      url: `/CustomerStatus`
    } as any);
    setCustomerStatuses(statutes.Results ? statutes.Results : []);
  }

  useEffect(() => {
    getCustomerTypes();
    getIndustryTypes();
    getMediaTypes();
    getCustomerStatuses();
  }, []);


  // EMPLOYEE

  const initialValues = useMemo(() => ({
    CompanyNumber: customer?.CompanyNumber ?? null,
    CustomDate1: customer?.CustomDate1 ?? null,
    CustomDate2: customer?.CustomDate2 ?? null,
    CustomField1: customer?.CustomField1 ?? null,
    CustomField2: customer?.CustomField2 ?? null,
    CustomField3: customer?.CustomField3 ?? null,
    CustomField4: customer?.CustomField4 ?? null,
    CustomFilter1: customer?.CustomFilter1 ?? null,
    CustomFilter2: customer?.CustomFilter2 ?? null,
    CustomNumber1: customer?.CustomNumber1 ?? null,
    CustomNumber2: customer?.CustomNumber2 ?? null,
    CustomerCode: customer?.CustomerCode ?? '',
    CustomerExternalDocNumber: customer?.CustomerExternalDocNumber ?? null,
    CustomerName: customer?.CustomerName ?? '',
    CustomerStatus: customer?.CustomerStatus ?? null,
    CustomerType: customer?.CustomerType ?? null,
    DefaultDiscount: customer?.DefaultDiscount ?? 0,
    EmailAddress: customer?.EmailAddress ?? null,
    IndustryType: customer?.IndustryType ?? null,
    IsActive: customer?.IsActive ?? true,
    IsCompany: customer?.IsCompany ?? false,
    MediaType: customer?.MediaType ?? null,
    VATNumber: customer?.VATNumber ?? null,
    Employee: customer?.Employee ?? null,
    ...(showAddContactAndLocationForms && {
      Contacts: [{
        FirstName: '',
        LastName: '',
        EmailAddress: '',
        MobileNumber: '',
        Designation: '',
        IsActive: true,
      }]
    }),
    ...(showAddContactAndLocationForms && {
      Locations: [{
        LocationName: '',
        AddressLine1: '',
        AddressLine2: '',
        AddressLine3: '',
        AddressLine4: '',
        AddressLine5: '',
        LocationType: Enums.LocationType.Delivery,
        Type: 'Delivery',
        Country: '',
        CountryDescription: '',
        CountryID: '',
        IsActive: true,
      }]
    })
  }), [customer])


  const [addLocation, setAddLocation] = useState(false)
  const [address, setAddress] = useState('')
  const latestLocationRef = useRef<any>(null)
  const syncingRef = useRef(false)
  /*Countries*/
  const [countries, setCountries] = useState([]);
  const getCountries = async () => {
    const response = await CustomerService.getCountries();
    if (response) {
      setCountries(response);
      // Avoid setting default country on mount to prevent initial dirty state.
      if (addLocation) {
        const country = response.find(x => x.Description === 'South Africa');
        if (country) {
          form.setFieldValue("Locations.0.Country", country);
          form.setFieldValue("Locations.0.CountryID", country.ID);
          form.setFieldValue("Locations.0.CountryDescription", country.Description);
          form.resetDirty();
        }
      }
    }
  };
  useEffect(() => {
    getCountries()
  }, []);
  /*Countries End*/

  const form = useForm({
    initialValues: initialValues,
    validate: {
      CustomerName: (x, c) => {
        return Helper.validateInputStringOut({
          value: x,
          controlType: Enums.ControlType.Text,
          required: c.IsCompany || !showAddContactAndLocationForms,
          customErrorText: 'Please specify Customer Name'
        } as any)
      },
      CustomerCode: (x) => Helper.validateInputStringOut({
        value: x,
        controlType: Enums.ControlType.Text,
        required: false,
        customErrorText: 'Please specify Customer Code'
      } as any),
      CustomerType: (x) => isRequired('CustomerType') && !x?.ID ? 'Please specify Customer Type' : null,
      IndustryType: (x) => isRequired('IndustryType') && !x?.ID ? 'Please specify Industry Type' : null,
      MediaType: (x) => isRequired('MediaType') && !x?.ID ? 'Please specify Media Type' : null,
      CustomerStatus: (x) => isRequired('CustomerStatus') && !x?.ID ? 'Please specify Customer Status' : null,
      Employee: (x) => isRequired('AccountManager') && !x?.ID ? 'Please specify Account Manager' : null,
      CompanyNumber: (x) => Helper.validateInputStringOut({
        value: x,
        controlType: Enums.ControlType.Text,
        required: isRequired('CompanyRegNumber'),
        customErrorText: 'Please specify Company Registration Number'
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
      DefaultDiscount: (x) => Helper.validateInputStringOut({
        value: x,
        controlType: Enums.ControlType.Number,
        required: isRequired('DefaultDiscount'),
      } as any),
      VATNumber: (x) => Helper.validateInputStringOut({
        value: x,
        controlType: Enums.ControlType.Text,
        required: isRequired('CustomNumber2'),
      } as any),
      'Contacts.0': showAddContactAndLocationForms ? {
        FirstName: (x) => Helper.validateInputStringOut({
          value: x,
          controlType: Enums.ControlType.Text,
          required: true,
          customErrorText: 'Please specify First Name'
        } as any),
        LastName: (x) => Helper.validateInputStringOut({
          value: x,
          controlType: Enums.ControlType.Text,
          required: true,
          customErrorText: 'Please specify Last Name'
        } as any),
        EmailAddress: (x, c) => !x && !c.Contacts[0].MobileNumber ? 'Please specify an Email or Mobile Number' :
          Helper.validateInputStringOut({
            value: x,
            controlType: Enums.ControlType.Email
          } as any),
        MobileNumber: (x, c) => !x && !c.Contacts[0].EmailAddress ? 'Please specify an Email or Mobile Number' :
          Helper.validateInputStringOut({
            value: x,
            controlType: Enums.ControlType.ContactNumber
          } as any),
      } : {},
      'Locations.0': showAddContactAndLocationForms && addLocation ? {
        LocationName: (x) => Helper.validateInputStringOut({
          value: x,
          controlType: Enums.ControlType.Text,
          required: true,
          customErrorText: 'Please specify Location Name'
        } as any),
        AddressLine1: (x) => Helper.validateInputStringOut({
          value: x,
          controlType: Enums.ControlType.Text,
          required: true,
          customErrorText: 'Please specify Address Line 1'
        } as any),
        LocationType: (x) => Helper.validateInputStringOut({
          value: x,
          controlType: Enums.ControlType.Text,
          required: true,
          customErrorText: 'Please specify Location Type'
        } as any),
        Country: (x) => Helper.validateInputStringOut({
          value: x,
          controlType: Enums.ControlType.Text,
          required: true,
          customErrorText: 'Please specify Country'
        } as any),
      } : {}
    }
  });

  // Sync form state with latest props after successful save to clear dirty state
  useEffect(() => {
    // When initialValues (derived from customer) change, update form and reset dirty tracking
    if (!form) return;
    syncingRef.current = true;
    form.setValues(initialValues);
    form.resetDirty();
    if (onDirtyStateChange) {
      onDirtyStateChange(false);
    }
    // Allow dirty tracking again on next tick
    setTimeout(() => { syncingRef.current = false; }, 0);
  }, [initialValues]);

  const [formSaveCount, setFormSaveCount] = useState(0)
  useEffect(() => {
    if (formSaveCount !== 0) {
      handleSubmit(form.values)
    }
    setFormSaveCount(p => p + 1)
  }, [triggerFormSaveCounter]);

  const handleSubmit = (values) => {
    // console.log('submitting', values)
    try {
      if (form.validate() && form.isValid()) {
        // console.log('form is valid')
        const payload = {
          ...values,
          CustomerTypeID: values.CustomerType ? values.CustomerType.ID : null,
          IndustryTypeID: values.IndustryType ? values.IndustryType.ID : null,
          MediaTypeID: values.MediaType ? values.MediaType.ID : null,
          CustomerStatusID: values.CustomerStatus ? values.CustomerStatus.ID : null,
          EmployeeID: values.Employee ? values.Employee.ID : null,
        }
        if (showAddContactAndLocationForms) {
          if (!values.IsCompany) {
            payload.CustomerName = values.Contacts[0].FirstName + ' ' + values.Contacts[0].LastName
          }
          if (addLocation) {
            const rawLoc = latestLocationRef.current ?? values.Locations?.[0];
            if (rawLoc) {
              const normalized = { ...rawLoc } as any;

              // Ensure numeric enum only
              if (typeof normalized.LocationType !== 'number') {
                const typeKey = normalized.Type || normalized.LocationType;
                if (typeKey && (Enums as any).LocationType[typeKey] != null) {
                  normalized.LocationType = (Enums as any).LocationType[typeKey];
                }
              }

              // Ensure country primitives only
              if (!normalized.CountryID && normalized.Country?.ID) {
                normalized.CountryID = normalized.Country.ID;
              }
              if (!normalized.CountryDescription && normalized.Country?.Description) {
                normalized.CountryDescription = normalized.Country.Description;
              }

              // Hard sanitize: remove any non-primitive UI fields that could carry functions/nodes
              delete normalized.Country;
              delete normalized.Type;
              delete normalized.LocationName; // API uses Description
              delete normalized.__proto__;
              // Keep only known safe keys
              const safeLocation = {
                ID: normalized.ID ?? undefined,
                RowVersion: normalized.RowVersion ?? undefined,
                Description: normalized.Description ?? '',
                AddressLine1: normalized.AddressLine1 ?? '',
                AddressLine2: normalized.AddressLine2 ?? '',
                AddressLine3: normalized.AddressLine3 ?? '',
                AddressLine4: normalized.AddressLine4 ?? '',
                AddressLine5: normalized.AddressLine5 ?? '',
                Latitude: normalized.Latitude ?? null,
                Longitude: normalized.Longitude ?? null,
                CountryID: normalized.CountryID ?? null,
                CountryDescription: normalized.CountryDescription ?? null,
                LocationType: normalized.LocationType ?? Enums.LocationType.Delivery,
                IsPrimary: !!normalized.IsPrimary,
                IsActive: normalized.IsActive !== false,
              };

              payload.Locations = [safeLocation];
            } else {
              delete payload.Locations;
            }
          } else {
            delete payload.Locations
          }
        }
        onSaveValues && onSaveValues(payload)
      } else {
        // console.log('form is not valid', form.errors)
        onErrors && onErrors(form.errors)
      }
    } catch (e) {
      console.error(e)
    }
  }


  useEffect(() => {
    if (syncingRef.current) {
      return;
    }
    if (onDirtyStateChange) {
      const contactsInitial = (initialValues as any)?.Contacts?.[0] ?? {};
      const locationsInitial = (initialValues as any)?.Locations?.[0] ?? {};
      const dirtyItems = [
        ...Object.entries(form.values).filter(([key, value]) =>
          key !== 'Customers' && key !== 'Locations' && (
            typeof value === 'string'
              ? value.trim() !== (initialValues as any)[key]
              : typeof value === 'object'
                ? (value as any)?.ID !== (initialValues as any)[key]?.ID
                : value !== (initialValues as any)[key]
          )
        ),
        ...(showAddContactAndLocationForms
          ? Object.entries(form.values.Contacts?.[0] ?? {}).filter(([key, value]) =>
            typeof value === 'string'
              ? value.trim() !== (contactsInitial as any)[key]
              : typeof value === 'object'
                ? (value as any)?.ID !== (contactsInitial as any)[key]?.ID
                : value !== (contactsInitial as any)[key]
          )
          : []),
        ...(showAddContactAndLocationForms && addLocation
          ? Object.entries(form.values.Locations?.[0] ?? {}).filter(([key, value]) =>
            typeof value === 'string'
              ? value.trim() !== (locationsInitial as any)[key]
              : typeof value === 'object'
                ? (value as any)?.ID !== (locationsInitial as any)[key]?.ID
                : value !== (locationsInitial as any)[key]
          )
          : []),
      ];
      if (dirtyItems.length !== 0) {
        if (form.isDirty()) {
          onDirtyStateChange(true);
        }
      } else {
        onDirtyStateChange(false);
      }
    }
  }, [initialValues, form.values, showAddContactAndLocationForms, addLocation]);

  const md = useMediaQuery('(min-width: 62em)');

  useEffect(() => {
    if (form.values.IsCompany && !form.values.CustomerName) {
      form.getInputNode('CustomerName')?.focus()
    } else if (!form.values.IsCompany && !form.values.Contacts?.[0]?.FirstName) {
      form.getInputNode('Contacts.0.FirstName')?.focus()
      form.getInputNode('Contacts.0.FirstName')?.focus()
    } else {
      for (const key in form.values) {
        if (form.values.hasOwnProperty(key) && !form.values[key] && key !== 'CustomerCode' && form.getInputNode(key)) {
          form.getInputNode(key)?.focus()
          return
        }
        if (typeof form.values[key] === 'object' && Array.isArray(form.values[key])) {
          for (const name in form.values[key][0]) {
            if (form.values[key][0].hasOwnProperty(name) && !form.values[key][0][name] && form.getInputNode(key + '.0.' + name)) {
              // console.log('foxussing ', key)
              form.getInputNode(key + '.0.' + name)?.focus()
              return
            }
          }
        }
      }
    }
  }, [form.values.IsCompany]);

  return (
    <>

      {
        showTitle &&
        <Title
          my={'lg'}
          size={'lg'}
          fw={600}
        >
          {!!customer ? 'Edit Customer' : 'Create Customer'}
        </Title>
      }

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        style={{ maxWidth: 1020 }}
      >

        <SCSwitch
          onToggle={(checked) => form.setFieldValue('IsCompany', checked)}
          label="My customer is a company"
          checked={form.values.IsCompany}
          disabled={!editCustomerPermission}
        />


        <SimpleGrid spacing={{
          base: 'lg',
          md: 'sm'
        }}
          verticalSpacing={0}
          cols={{
            base: 1,
            md: 2
          }}
        >
          {
            (!showAddContactAndLocationForms || form.values.IsCompany) &&
            <ScTextControl
              label={form.values.IsCompany ? 'Company Name' : 'Customer Name'}
              {...form.getInputProps('CustomerName')}
              name={'CustomerName'}
              withAsterisk
              disabled={!editCustomerPermission}
            />
          }
          <ScTextControl
            label="Customer Code"
            placeholder={'Leave empty to generate'}
            {...form.getInputProps('CustomerCode')}
            name="CustomerCode"
            disabled={!editCustomerPermission}
            {...({ ['data-autofocus']: 'focus-when-in-create-mode' })}
          />
          {
            isShown('CustomerType') &&
            <SCDropdownList
              options={customerTypes}
              dataItemKey="ID"
              textField="Description"
              name="CustomerType"
              label="Customer Type"
              {...form.getInputProps('CustomerType')}
              required={isRequired('CustomerType')}
              // error={inputErrors.CustomerType}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('IndustryType') &&
            <SCDropdownList
              dataItemKey="ID"
              textField="Description"
              {...form.getInputProps('IndustryType')}
              required={isRequired('IndustryType')}
              // onChange={handleIndustryTypeChange}
              options={industryTypes}
              name="IndustryType"
              label="Industry Type"

              // error={inputErrors.CustomerType}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('MediaType') &&
            <SCDropdownList
              dataItemKey="ID"
              textField="Description"
              {...form.getInputProps('MediaType')}
              options={mediaTypes}
              name="MediaType"
              label="Media Type"
              required={isRequired('MediaType')}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('CustomerStatus') &&
            <SCDropdownList
              dataItemKey="ID"
              textField="Description"
              {...form.getInputProps('CustomerStatus')}
              disabled={!editCustomerPermission}
              options={customerStatuses}
              name="CustomerStatus"
              label="Customer Status"
              required={isRequired('CustomerStatus')}
            />
          }

          {
            isShown('VATNumber') &&
            <ScTextControl
              label="VAT Number"
              withAsterisk={isRequired('VATNumber')}
              {...form.getInputProps('VATNumber')}
              name={'VATNumber'}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('CompanyRegNumber') &&
            <ScTextControl
              label="Company Reg Number"
              withAsterisk={isRequired('CompanyRegNumber')}
              {...form.getInputProps('CompanyNumber')}
              name={'CompanyNumber'}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('AccountManager') &&
            <EmployeeSelector selectedEmployee={form.values.Employee}
              setSelectedEmployee={(emp) => form.setFieldValue('Employee', emp)}
              error={form.errors?.Employee}
              accessStatus={accessStatus} label="Account Manager"
              required={isRequired('AccountManager')}
              disabled={!editCustomerPermission}
              {...{} as any}
            />
          }

          {
            isShown('DefaultDiscount') &&
            <ScNumberControl
              label="Default Discount"
              withAsterisk={isRequired('DefaultDiscount')}
              {...form.getInputProps('DefaultDiscount')}
              name={'DefaultDiscount'}
              disabled={!editCustomerPermission}
            />
          }


          {/*CUSTOM ITEMS*/}
          {
            isShown('CustomField1') &&
            <ScTextControl
              label={settingsBySystemName['CustomField1'].DisplayName}
              withAsterisk={isRequired('CustomField1')}
              {...form.getInputProps('CustomField1')}
              name={'CustomField1'}
              disabled={!editCustomerPermission}
            />
          }
          {
            isShown('CustomField2') &&
            <ScTextControl
              label={settingsBySystemName['CustomField2'].DisplayName}
              withAsterisk={isRequired('CustomField2')}
              {...form.getInputProps('CustomField2')}
              name={'CustomField2'}
              disabled={!editCustomerPermission}
            />
          }


          {
            isShown('CustomField3') &&
            <ScTextControl
              label={settingsBySystemName['CustomField3'].DisplayName}
              withAsterisk={isRequired('CustomField3')}
              {...form.getInputProps('CustomField3')}
              name={'CustomField3'}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('CustomField4') &&
            <ScTextControl
              label={settingsBySystemName['CustomField4'].DisplayName}
              withAsterisk={isRequired('CustomField4')}
              {...form.getInputProps('CustomField4')}
              name={'CustomField4'}
              disabled={!editCustomerPermission}
            />
          }


          {
            isShown('CustomDate1') &&
            <SCDatePicker
              canClear
              label={settingsBySystemName['CustomDate1'].DisplayName}
              withAsterisk={isRequired('CustomDate1')}
              {...form.getInputProps('CustomDate1')}
              name={'CustomDate1'}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('CustomDate2') &&
            <SCDatePicker
              canClear
              label={settingsBySystemName['CustomDate2'].DisplayName}
              withAsterisk={isRequired('CustomDate2')}
              {...form.getInputProps('CustomDate2')}
              name={'CustomDate2'}
              disabled={!editCustomerPermission}
            />
          }


          {
            isShown('CustomFilter1') &&
            <SCSwitch
              label={settingsBySystemName['CustomFilter1'].DisplayName}
              checked={form.values['CustomFilter1']}
              onToggle={(checked) => form.setFieldValue('CustomFilter1', checked)}
              disabled={!editCustomerPermission}
            />
          }
          {
            isShown('CustomFilter2') &&
            <SCSwitch
              label={settingsBySystemName['CustomFilter2'].DisplayName}
              checked={form.values['CustomFilter2']}
              onToggle={(checked) => form.setFieldValue('CustomFilter2', checked)}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('CustomNumber1') &&
            <ScNumberControl
              label={settingsBySystemName['CustomNumber1'].DisplayName}
              withAsterisk={isRequired('CustomNumber1')}
              {...form.getInputProps('CustomNumber1')}
              name={'CustomNumber1'}
              disabled={!editCustomerPermission}
            />
          }

          {
            isShown('CustomNumber2') &&
            <ScNumberControl
              label={settingsBySystemName['CustomNumber2'].DisplayName}
              withAsterisk={isRequired('CustomNumber2')}
              {...form.getInputProps('CustomNumber2')}
              name={'CustomNumber2'}
              disabled={!editCustomerPermission}
            />
          }
        </SimpleGrid>
        {
          !!customer && showActiveToggle &&
          <Flex justify={'end'}>
            <SCSwitch
              label={'Active'}
              checked={form.values['IsActive']}
              onToggle={(checked) => form.setFieldValue('IsActive', checked)}
              disabled={!editCustomerPermission}
            />
          </Flex>
        }

        {
          _userAdmin &&
          <>
            <Space h={25}></Space>
            <Link href={'/settings/customer/manage'} style={{ textDecoration: 'none' }}>
              <Flex align={'center'} justify={'end'} c={'scBlue'} gap={5}>
                <IconQuestionCircle size={16} />
                <Anchor size={'sm'}>Not seeing what you need? &nbsp;Add additional fields here.</Anchor>
              </Flex>
            </Link>
          </>
        }

        {
          showAddContactAndLocationForms &&
          <>
            <Space h={10} />
            <Title
              mt={'sm'}
              mb={-5}
              size={'lg'}
              fw={600}
            >
              Primary Contact
            </Title>

            <SimpleGrid
              spacing={{
                base: 'lg',
                md: 'sm'
              }}
              verticalSpacing={0}
              cols={{
                base: 1,
                md: 2
              }}
            >
              <ScTextControl
                label={'First Name'}
                {...form.getInputProps('Contacts.0.FirstName')}
                name={'FirstName'}
                withAsterisk
                disabled={!editCustomerPermission}
                data-autofocus
              />
              <ScTextControl
                label={'Last Name'}
                {...form.getInputProps('Contacts.0.LastName')}
                name={'LastName'}
                withAsterisk
                disabled={!editCustomerPermission}
              />

              <ScTextControl
                label={'Email or mobile number'}
                type={'email'}
                placeholder={'Email'}
                {...form.getInputProps('Contacts.0.EmailAddress')}
                name={'EmailAddress'}
                withAsterisk
                disabled={!editCustomerPermission}
              />

              <ScTextControl
                label={md ? ' ' : undefined}
                mt={{ base: 'xs', md: 'sm' }}
                placeholder={'Mobile Number'}
                type={'tel'}
                {...form.getInputProps('Contacts.0.MobileNumber')}
                name={'MobileNumber'}
                onlyNumbers={true}
                disabled={!editCustomerPermission}
              />
            </SimpleGrid>
          </>
        }

        {
          showAddContactAndLocationForms && <>
            <Space h={10} />
            <Tooltip
              openDelay={600}
              label={'Optionally specify customer location (can be added later)'}
              color={'scBlue'}
              position={'top-start'}
            >
              <span>
                <Switch onChange={e => setAddLocation(e.currentTarget.checked)} checked={addLocation}
                  mt={'sm'}
                  mb={-5}
                  labelPosition={'left'}
                  styles={{ label: { fontSize: 17, fontWeight: 600, marginTop: -2 } }}
                  label={
                    <Title
                      size={'lg'}
                      fw={600}
                    >
                      Add Location
                    </Title>
                  }
                  disabled={!editCustomerPermission}
                />
              </span>
            </Tooltip>

            {
              addLocation &&
              <LocationForm
                embedded
                countries={countries}
                triggerFormSaveCounter={triggerFormSaveCounter}
                defaultValues={{
                  primaryToggle: {
                    toggled: true,
                    alwaysChecked: true,
                    color: 'var(--mantine-color-blue-1)',
                    tooltipLabel: 'The first delivery or postal location will default to the primary location.',
                    primaryName: 'Primary',
                  },
                }}
                onSaveValues={(loc) => {
                  latestLocationRef.current = loc;
                  form.setFieldValue('Locations.0', { ...(form.values.Locations?.[0] || {}), ...loc });
                }}
                onErrors={(errors) => {
                  // Child errors will be surfaced on parent submit via triggerFormSaveCounter
                }}
              />
            }

          </>
        }

      </form >
    </>
  );
}

export default CustomerForm;
