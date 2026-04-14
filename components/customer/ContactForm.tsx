import React, {useState, useEffect, useMemo} from 'react';
import * as Enums from '../../utils/enums';
import {Box, SimpleGrid} from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {useForm} from "@mantine/form";
import Helper from "@/utils/helper";
import {useDebouncedValue} from "@mantine/hooks";
import SCComboBox from "@/components/sc-controls/form-controls/sc-combobox";
import CustomerService from "@/services/customer/customer-service";

function ContactForm({
                           contact,
                           triggerFormSaveCounter,
                           onSaveValues,
                           onDirtyStateChange,
                           onErrors,
                         }) {


  // console.log('contact', contact)

  /** fieldSettings Start */
  /*const contactFieldSettings = useQuery(['contactFieldSettings'], () => getFieldSettings(Enums.Module.contact))
  const settingsBySystemName: { [fieldSystemName: string]: FieldSetting } = useMemo(() => {
    if (contactFieldSettings.data) {
      return contactFieldSettings.data.reduce((previousValue, currentValue) => ({
        ...previousValue,
        [currentValue.FieldSystemName]: { ...currentValue }
      }), {})
    } else {
      return {}
    }
  }, [contactFieldSettings.data])
  const isRequired = useCallback((name: string) => {
    // const systemName = getSystemNameForFormName(name)
    const systemName = name
    return settingsBySystemName.hasOwnProperty(systemName) ? isShown(name) && settingsBySystemName[systemName].IsRequired : false
  }, [settingsBySystemName])
  const isShown = useCallback((name: string) => {
    // const systemName = getSystemNameForFormName(name)
    const systemName = name
    return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive && (!!contact || !settingsBySystemName[systemName].HideOnCreate) : false
  }, [settingsBySystemName, contact])*/
  /** fieldSettings End */




  const initialValues = useMemo(() => ({
    FirstName: contact?.FirstName ?? '',
    LastName: contact?.LastName ?? '',
    EmailAddress: contact?.EmailAddress ?? '',
    MobileNumber: contact?.MobileNumber ?? '',
    Designation: contact?.Designation ?? '',
    IsActive: true,
    /*CustomDate1: contact?.CustomDate1 ?? null,
    CustomDate2: contact?.CustomDate2 ?? null,
    CustomField1: contact?.CustomField1 ?? null,
    CustomField2: contact?.CustomField2 ?? null,
    CustomField3: contact?.CustomField3 ?? null,
    CustomField4: contact?.CustomField4 ?? null,
    CustomFilter1: contact?.CustomFilter1 ?? null,
    CustomFilter2: contact?.CustomFilter2 ?? null,
    CustomNumber1: contact?.CustomNumber1 ?? null,
    CustomNumber2: contact?.CustomNumber2 ?? null,*/
  }), [contact])

  const form = useForm({
    initialValues: initialValues,
    validate: {
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
      EmailAddress: (x, c) => Helper.validateInputStringOut({
        value: x,
        controlType: Enums.ControlType.Email,
        required: !c.MobileNumber,
        customErrorText: 'Please specify an Email or Mobile Number'
      } as any),
      MobileNumber: (x, c) => Helper.validateInputStringOut({
        value: x,
        controlType: Enums.ControlType.ContactNumber,
        required: !c.EmailAddress,
        customErrorText: 'Please specify an Email or Mobile Number'
      } as any),
    }
  });

  console.log('contact form', form.values)


  const [formSaveCount, setFormSaveCount] = useState(0)
  useEffect(() => {
    if(formSaveCount !== 0) {
      handleSubmit(form.values)
    }
    setFormSaveCount(p => p + 1)
  }, [triggerFormSaveCounter]);

  const handleSubmit = (values) => {
    // console.log('submitting', values)
    if(form.validate() && form.isValid()) {
      // console.log('form is valid', values)
      onSaveValues && onSaveValues(values)
    } else {
      // console.log('form is not valid')
      onErrors && onErrors(form.errors)
    }
  }

  const debouncedFormValues = useDebouncedValue(form.values, 150)

  useEffect(() => {
    if(onDirtyStateChange) {
      const dirtyItems = Object.entries(form.values).filter(([key, value]) =>
          typeof value === 'string' ? value.trim() !== initialValues[key] :
              typeof value === 'object' ? value?.ID !== initialValues[key]?.ID :
                  value !== initialValues[key]
      )
      // console.log('dirty items', dirtyItems, form.values, initialValues, customer)
      if (dirtyItems.length !== 0) {
        if (form.isDirty()) {
          onDirtyStateChange(true)
        }
      } else {
        onDirtyStateChange(false)
      }
    }
  }, [initialValues, debouncedFormValues]);


  /*Designations*/
  const [designations, setDesignations] = useState([]);
  const getDesignations = async () => {
    let response = await CustomerService.getDesignations();
    setDesignations(response.Results);
  };
  useEffect(() => {
    getDesignations()
  }, []);
  /*const designationChange = async (value) => {
    setSelectedDesignation(value);
  };*/
  /*Designations End*/

  return (
      <>
        <form
            onSubmit={form.onSubmit(handleSubmit)}
            style={{maxWidth: 1020}}
        >
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
            <ScTextControl
                label={'First Name'}
                {...form.getInputProps('FirstName')}
                name={'FirstName'}
                withAsterisk
            />
            <ScTextControl
                label={'Last Name'}
                {...form.getInputProps('LastName')}
                name={'LastName'}
                withAsterisk
            />

            <ScTextControl
                label={'Email or mobile number'}
                type={'email'}
                placeholder={'Email'}
                {...form.getInputProps('EmailAddress')}
                name={'EmailAddress'}
                withAsterisk

            />

            <ScTextControl
                label={' '}
                placeholder={'Mobile Number'}
                type={'tel'}
                {...form.getInputProps('MobileNumber')}
                name={'MobileNumber'}
            />


            {/*<SCComboBox
                label="Designation"
                name="Designation"
                textField="Description"
                dataItemKey="ID"
                options={designations}
                placeholder=""
                {...form.getInputProps('Designation')}
            />*/}
          </SimpleGrid>
        </form>
      </>
  )
}

export default ContactForm;
