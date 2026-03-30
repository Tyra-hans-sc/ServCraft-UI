import React, {useState, useEffect, useMemo} from 'react';
import * as Enums from '../../utils/enums';
import {Box, SimpleGrid, Textarea} from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {useForm} from "@mantine/form";
import Helper from "@/utils/helper";
import {useDebouncedValue} from "@mantine/hooks";
import CustomerService from "@/services/customer/customer-service";
import SCDropdownList from "@/components/sc-controls/form-controls/sc-dropdownlist";

function LocationForm({
                           location,
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
    LocationName: location?.LocationName ?? '',
    AddressLine1: location?.AddressLine1 ?? '',
    AddressLine2: location?.AddressLine2 ?? '',
    AddressLine3: location?.AddressLine3 ?? '',
    AddressLine4: location?.AddressLine4 ?? '',
    AddressLine5: location?.AddressLine5 ?? '',
    LocationType: location?.LocationType ?? 'Delivery',
    Country: location?.Country ?? '',
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
  }), [location])

  const form = useForm({
    initialValues: initialValues,
    validate: {
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
    }
  });

  console.log('location form', form.values)

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
      onSaveValues && onSaveValues({...values, LocationType: Enums.LocationType[values.LocationType]})
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


  /*Countries*/
  const [countries, setCountries] = useState([]);
  const getCountries = async () => {
    const response = await CustomerService.getCountries();
    if(response) {
      setCountries(response);
      form.setFieldValue("Country", response.find(x => x.Description === 'South Africa'))
    }
  };
  useEffect(() => {
    getCountries()
  }, []);
  /*Countries End*/

  const [address, setAddress] = useState('')

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
                label={"Name/Description"}
                {...form.getInputProps('LocationName')}
                name={'LocationName'}
                withAsterisk
            />


            <SCDropdownList
                name="LocationType"
                options={Enums.getEnumItems(Enums.LocationType)}
                label="Type"
                required={true}
                {...form.getInputProps('LocationType')}
            />

            <Box>
              <Textarea
                  mt={'sm'}
                  label={'Physical Address'}
                  {...form.getInputProps('AddressLine1')}
                  value={address}
                  onChange={
                    e => {
                      const split = e.currentTarget.value.split('\n')
                      console.log('split', split)
                      form.setFieldValue('AddressLine1', split[0] || '')
                      form.setFieldValue('AddressLine2', split[1] || '')
                      form.setFieldValue('AddressLine3', split[2] || '')
                      form.setFieldValue('AddressLine4', split[3] || '')
                      form.setFieldValue('AddressLine5', split[4] || '')
                      split.length < 6 && setAddress(e.currentTarget.value)
                    }
                  }
                  maxRows={5}
                  minRows={4}
                  autosize
                  withAsterisk
              />
              {/*<ScTextControl
                  label={"Address Line 1"}
                  {...form.getInputProps('AddressLine1')}
                  name={'AddressLine1'}
                  withAsterisk
              />

              <ScTextControl
                  label={'Address Line 2'}
                  {...form.getInputProps('AddressLine2')}
                  name={'AddressLine2'}
              />
              <ScTextControl
                  label={'Address Line 3'}
                  {...form.getInputProps('AddressLine3')}
                  name={'AddressLine3'}
              />
              <ScTextControl
                  label={'Address Line 4'}
                  {...form.getInputProps('AddressLine4')}
                  name={'AddressLine4'}
              />
              <ScTextControl
                  label={'Address Line 5'}
                  {...form.getInputProps('AddressLine5')}
                  name={'AddressLine5'}
              />*/}
            </Box>

            <SCDropdownList
                name="Country"
                textField="Description"
                dataItemKey="ID"
                options={countries}
                label="Country"
                required={true}
                {...form.getInputProps('Country')}
            />
          </SimpleGrid>
        </form>
      </>
  );
}

export default LocationForm;
