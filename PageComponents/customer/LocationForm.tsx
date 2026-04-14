import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {Box, Group, Loader, SimpleGrid, Textarea, Title, Button, Flex, MantineColor, Tooltip} from '@mantine/core';
import SCSwitch from '@/components/sc-controls/form-controls/sc-switch';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import ScTextControl from '@/components/sc-controls/form-controls/v2/sc-text-control';
import SCDropdownList from '@/components/sc-controls/form-controls/sc-dropdownlist';
import * as Enums from '@/utils/enums';
import Helper from '@/utils/helper';
import CustomerService from '@/services/customer/customer-service';
import Fetch from '@/utils/Fetch';
import PS from '@/services/permission/permission-service';
import { showNotification } from '@mantine/notifications';
import SCModal from '@/PageComponents/Modal/SCModal';
import {LocationDTO} from "@/interfaces/api/models";
import LocationLatLngControl from '@/PageComponents/customer/LocationLatLngControl';

// Combined props: manage-location modal interface + child-embedded interface
// Modal replacement props (from components/modals/location/manage-location.js):
// { isNew, location, module, moduleData, countries, onSave, onCancel, accessStatus, backButtonText }
// Embedded/child form props (pattern used in components/customer/LocationForm.tsx):
// { triggerFormSaveCounter, onSaveValues, onDirtyStateChange, onErrors }

type Props = {
  // manage-location interface
  isNew?: boolean;
  location?: LocationDTO;
  module?: any;
  moduleData?: any;
  countries?: any[];
  onSave?: (saved: any) => void;
  onCancel?: () => void;
  accessStatus?: any;
  backButtonText?: string;
  // child/embedded interface
  triggerFormSaveCounter?: number;
  onSaveValues?: (values: any) => void;
  onDirtyStateChange?: (dirty: boolean) => void;
  onErrors?: (errors: any) => void;
  // control whether to show modal chrome; default: infer from presence of onSave (modal)
  embedded?: boolean;
  defaultValues?: Partial<DefaultValues>;
};

type DefaultValues ={
    primaryToggle: {
        toggled?: boolean | ((locationType:any) => boolean),
        disabled?: boolean
        alwaysChecked?: boolean | ((locationType: any) => boolean),
        color?: MantineColor | ((locationType: any) => MantineColor|undefined),
        tooltipLabel?: string,
        primaryName?: string,
    }
}

const editCustomerPermission = PS.hasPermission(Enums.PermissionName.EditCustomer);

function LocationForm(props: Props) {
  const {
    isNew = true,
    location,
    module,
    moduleData,
    countries: countriesProp,
    onSave,
    onCancel,
    accessStatus,
    backButtonText,
    triggerFormSaveCounter,
    onSaveValues,
    onDirtyStateChange,
    onErrors,
    embedded,
    defaultValues
  } = props; 

    let defaultPrimaryName = defaultValues?.primaryToggle?.primaryName ? defaultValues.primaryToggle.primaryName : '';
  
  // Determine rendering mode: modal (replacement for manage-location) vs embedded child form
  const isModalMode = useMemo(() => {
    if (typeof embedded === 'boolean') return !embedded;
    // Heuristic: if onSave handler (from modal usage) exists, prefer modal behavior
    return typeof onSave === 'function';
  }, [embedded, onSave]);

  // Initial values: support both legacy manage-location naming (Description) and newer (LocationName)
  const initialValues = useMemo(() => {
    const name = location?.Description ?? defaultPrimaryName;
    const typeString = location?.LocationType != null ? Enums.getEnumStringValue(Enums.LocationType, location.LocationType) || 'Delivery' : 'Delivery';
    return {
      // Keep both keys to ease reuse (form-only convenience)
      Description: name,
      LocationName: name,
      AddressLine1: location?.AddressLine1 ?? '',
      AddressLine2: location?.AddressLine2 ?? '',
      AddressLine3: location?.AddressLine3 ?? '',
      AddressLine4: location?.AddressLine4 ?? '',
      AddressLine5: location?.AddressLine5 ?? '',
      Latitude: location?.Latitude ?? null,
      Longitude: location?.Longitude ?? null,
      // Type is string representation; LocationType is numeric enum used for saves
      Type: typeString,
      LocationType: location?.LocationType ?? (Enums.LocationType as any)[typeString] ?? Enums.LocationType.Delivery,
      Country: null,
      CountryID: location?.CountryID ?? null,
      CountryDescription: location?.CountryDescription ?? null,
      IsPrimary: location?.IsPrimary ?? false,
      IsActive: location?.IsActive ?? true,
      ID: location?.ID,
      RowVersion: location?.RowVersion,
    };
  }, [location,defaultPrimaryName]);

  const form = useForm({
    initialValues,
    validate: {
      Description: (x) =>
        Helper.validateInputStringOut({ value: x, controlType: Enums.ControlType.Text, required: true, customErrorText: 'Please specify Location Name' } as any),
      AddressLine1: (x) => {
        const baseError = Helper.validateInputStringOut({ value: x, controlType: Enums.ControlType.Text, required: true, customErrorText: 'Please specify Address Line 1' } as any) as any;
        if (baseError) return baseError as any;
        if ((x ?? '').length > 99) return 'Address Line 1 must be less than 100 characters';
        return null;
      },
      AddressLine2: (x) => {
        if ((x ?? '').length > 99) return 'Address Line 2 must be less than 100 characters';
        return null;
      },
      AddressLine3: (x) => {
        if ((x ?? '').length > 99) return 'Address Line 3 must be less than 100 characters';
        return null;
      },
      AddressLine4: (x) => {
        if ((x ?? '').length > 99) return 'Address Line 4 must be less than 100 characters';
        return null;
      },
      AddressLine5: (x) => {
        if ((x ?? '').length > 99) return 'Address Line 5 must be less than 100 characters';
        return null;
      },
      Type: (x) =>
        Helper.validateInputStringOut({ value: x, controlType: Enums.ControlType.Text, required: true, customErrorText: 'Please specify Location Type' } as any),
      Country: (x) =>
        Helper.validateInputStringOut({ value: x, controlType: Enums.ControlType.Text, required: true, customErrorText: 'Please specify Country' } as any),
    },
  });

  const [useCoords, setUseCoords] = useState<boolean>(() => (initialValues.Latitude != null && initialValues.Longitude != null));

  // Keep Description and LocationName in sync for cross-compatibility
  const syncNameFields = useCallback(
    (newName: string) => {
      if (form.values.LocationName !== newName) form.setFieldValue('LocationName', newName);
      if (form.values.Description !== newName) form.setFieldValue('Description', newName);
    },
    [form]
  );

  // Debounced form values for dirty calculation to avoid chatter
  const [debounced] = useDebouncedValue(form.values, 150);

  // Initial address textarea text: derive from initial values without trailing empty lines
  const initialAddressText = useMemo(() => {
    const lines = [
      initialValues.AddressLine1 ?? '',
      initialValues.AddressLine2 ?? '',
      initialValues.AddressLine3 ?? '',
      initialValues.AddressLine4 ?? '',
      initialValues.AddressLine5 ?? '',
    ];
    let lastNonEmpty = -1;
    for (let i = 0; i < lines.length; i++) {
      if ((lines[i] ?? '').length > 0) lastNonEmpty = i;
    }
    if (lastNonEmpty === -1) return '';
    return lines.slice(0, lastNonEmpty + 1).join('\n');
  }, [initialValues]);

  const [addressText, setAddressText] = useState<string>(initialAddressText);

  useEffect(() => {
    if (onDirtyStateChange) {
      const dirtyItems = Object.entries(form.values).filter(([key, value]) =>
        typeof value === 'string'
          ? (value || '').trim() !== (initialValues as any)[key]
          : typeof value === 'object'
          ? (value as any)?.ID !== (initialValues as any)[key]?.ID
          : value !== (initialValues as any)[key]
      );
      onDirtyStateChange(dirtyItems.length !== 0 && form.isDirty());
    }
  }, [initialValues, debounced, onDirtyStateChange, form]);

  // Countries
  const [countries, setCountries] = useState<any[]>(countriesProp ?? []);
  useEffect(() => {
    let mounted = true;
    const loadCountries = async () => {
      if (countriesProp && countriesProp.length) {
        setCountries(countriesProp);
        // Default selection logic will run below
      } else {
        const response = await CustomerService.getCountries();
        if (mounted && response) setCountries(response);
      }
    };
    loadCountries();
    return () => {
      mounted = false;
    };
  }, [countriesProp]);

  // Default country selection: prefer existing CountryID, else South Africa
  useEffect(() => {
    if (countries?.length) {
      if (!form.values.Country) {
        const existingId = initialValues.CountryID;
        if (existingId) {
          const match = countries.find((x) => x.ID === existingId);
          if (match) {
            form.setFieldValue('Country', match);
            form.setFieldValue('CountryID', match.ID);
            form.setFieldValue('CountryDescription', match.Description);
            return;
          }
        }
        const sa = countries.find((x) => x.Description === 'South Africa');
        if (sa) {
          form.setFieldValue('Country', sa);
          form.setFieldValue('CountryID', sa.ID);
          form.setFieldValue('CountryDescription', sa.Description);
        }
      }
    }
  }, [countries, form, initialValues.CountryID]);

  // External trigger (embedded use) to submit and bubble values
  const [saveCount, setSaveCount] = useState(0);
  useEffect(() => {
    if (triggerFormSaveCounter === undefined) return;
    if (saveCount !== 0) {
      handleEmbeddedSubmit(form.values);
    }
    setSaveCount((p) => p + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerFormSaveCounter]);

  const normalizePayload = (values: any) => {
    const locTypeNumber = (Enums.LocationType as any)[values.Type] ?? values.LocationType;
    const country = values.Country;
    return {
      ...values,
      Description: values.Description ?? values.LocationName ?? '',
      LocationName: values.LocationName ?? values.Description ?? '',
      Type: values.Type,
      LocationType: locTypeNumber,
      Country: country,
      CountryID: country?.ID ?? values.CountryID ?? null,
      CountryDescription: country?.Description ?? values.CountryDescription ?? null,
    };
  };

  const handleEmbeddedSubmit = (values: any) => {
    if (form.validate() && form.isValid()) {
      const payload = normalizePayload(values);
      onSaveValues && onSaveValues(payload);
    } else {
      onErrors && onErrors(form.errors);
    }
  };

  // Modal save (API persist) when used as manage-location replacement
  const [saving, setSaving] = useState(false);
  const canEdit = editCustomerPermission || module === Enums.Module.Supplier;
  const isPrimaryAlreadySet = useMemo(() => (!isNew && !!location?.IsPrimary) || false, [isNew, location]);

  const saveLocation = async () => {
    setSaving(true);
    const ok = form.validate() && form.isValid();
    if (!ok) {
      showNotification({ message: 'There are errors on the page', color: 'yellow.7', autoClose: 4000, withCloseButton: true });
      setSaving(false);
      return;
    }

    const values = normalizePayload(form.values);

    const paramsBase: any = {
      ID: values.ID,
      RowVersion: values.RowVersion,
      Description: values.Description,
      AddressLine1: values.AddressLine1,
      AddressLine2: values.AddressLine2,
      AddressLine3: values.AddressLine3,
      AddressLine4: values.AddressLine4,
      AddressLine5: values.AddressLine5,
      Latitude: values.Latitude ?? null,
      Longitude: values.Longitude ?? null,
      IsActive: values.IsActive,
      IsPrimary: values.IsPrimary,
      CountryID: values.CountryID,
      LocationType: values.LocationType,
    };

    const params =
      module === Enums.Module.Customer
        ? { ...paramsBase, CustomerID: moduleData?.ID }
        : { ...paramsBase, SupplierID: moduleData?.ID };

    try {
      const response = isNew
        ? await Fetch.post({ url: '/Location', params })
        : await Fetch.put({ url: '/Location', params });

      if (response?.ID) {
        showNotification({ title: 'Saved', message: 'Location saved successfully', color: 'scBlue', autoClose: 3000, withCloseButton: true });
        onSave && onSave(response);
      } else {
        showNotification({ message: 'Location failed to save', color: 'yellow.7', autoClose: 4000, withCloseButton: true });
        setSaving(false);
      }
    } catch (e) {
      showNotification({ message: 'Location failed to save', color: 'yellow.7', autoClose: 4000, withCloseButton: true });
      setSaving(false);
    }

    if (!isNew) setSaving(false);
  };

    const [alwaysChecked, setAlwaysChecked] = useState<boolean>(false)
    const [defaultToggleValue, setDefaultToggleState] = useState<boolean>(false)
    const [defaultPrimaryToggleColor, setDefaultPrimaryToggleColor] = useState<MantineColor | undefined>(undefined)

    useEffect(() => {
        if (typeof defaultValues?.primaryToggle?.alwaysChecked === 'function') {
            setAlwaysChecked(defaultValues.primaryToggle.alwaysChecked(form.values.Type))
        }
        else if (typeof defaultValues?.primaryToggle?.alwaysChecked === 'boolean') {
            setAlwaysChecked(defaultValues.primaryToggle.alwaysChecked)
        }
        if (typeof defaultValues?.primaryToggle?.toggled === 'function') {
            setDefaultToggleState(defaultValues.primaryToggle.toggled(form.values.Type))
        }
        else if (typeof defaultValues?.primaryToggle?.toggled === 'boolean') {
            setDefaultToggleState(defaultValues.primaryToggle.toggled)
        }
        if (typeof defaultValues?.primaryToggle?.color === 'function') {
            setDefaultPrimaryToggleColor(defaultValues.primaryToggle.color(form.values.Type))
        }
        else if (defaultValues?.primaryToggle?.color) {
            setDefaultPrimaryToggleColor(defaultValues.primaryToggle.color)
        }

    }, [form.values.Type])


  // UI form
  const formContent = (
    <Box style={{ maxWidth: 1020 }}>
    <Tooltip 
      openDelay={600}
                    label={defaultValues?.primaryToggle?.tooltipLabel}
                    color={'scBlue'}
                    disabled={defaultValues?.primaryToggle?.tooltipLabel === undefined}
                    position={'top-start'}>
                    <span>
        <SCSwitch
                label={'Primary'}
                checked={ alwaysChecked || defaultToggleValue || !!form.values.IsPrimary}
                onToggle={(checked: boolean) => {
                    if(!alwaysChecked){
                        form.setFieldValue('IsPrimary', checked);
                        if (checked) form.setFieldValue('IsActive', true); 
                    }
               }}
                color={defaultPrimaryToggleColor ? defaultPrimaryToggleColor : undefined}
                title={isPrimaryAlreadySet ? `Since this location is already set as primary, you can only set it as primary on another location.` : ''}
                disabled={defaultValues?.primaryToggle?.disabled ||  !canEdit || (!isNew && isPrimaryAlreadySet) }
            /></span>
            </Tooltip>
      <SimpleGrid
        spacing={{ base: 'lg', md: 'sm' }}
        verticalSpacing={0}
        cols={{ base: 1, md: 2 }}
      >
        <ScTextControl
          label={'Name/Description'}
          {...form.getInputProps('Description')}
          onChange={(e: any) => syncNameFields(e?.currentTarget?.value ?? e)}
          name={'Description'}
          withAsterisk
          disabled={!canEdit}
        />

        <SCDropdownList
          name="LocationType"
          options={Enums.getEnumItems(Enums.LocationType)}
          label="Type"
          required={true}
          {...form.getInputProps('Type')}
          onChange={(val: any) => {
            form.setFieldValue('Type', val);
            form.setFieldValue('LocationType', (Enums.LocationType as any)[val]);
          }}
          value={form.values.Type}
          disabled={!canEdit}
        />

        <Box>
          <Textarea
            mt={'sm'}
            label={'Physical Address'}
            value={addressText}
            onChange={(e) => {
              const split = e.currentTarget.value.split('\n').slice(0, 5);
              form.setFieldValue('AddressLine1', split[0] || '');
              form.setFieldValue('AddressLine2', split[1] || '');
              form.setFieldValue('AddressLine3', split[2] || '');
              form.setFieldValue('AddressLine4', split[3] || '');
              form.setFieldValue('AddressLine5', split[4] || '');
              setAddressText(split.join('\n'));
            }}
            error={
              form.errors?.AddressLine1 ||
              form.errors?.AddressLine2 ||
              form.errors?.AddressLine3 ||
              form.errors?.AddressLine4 ||
              form.errors?.AddressLine5
            }
            maxRows={5}
            minRows={4}
            autosize
            withAsterisk
            disabled={!canEdit}
          />
        </Box>

        <Box>
          <SCDropdownList
            name="Country"
            textField="Description"
            dataItemKey="ID"
            options={countries}
            label="Country"
            required={true}
            {...form.getInputProps('Country')}
            onChange={(x: any) => {
              form.setFieldValue('Country', x);
              form.setFieldValue('CountryID', x?.ID);
              form.setFieldValue('CountryDescription', x?.Description);
            }}
            value={form.values.Country}
            disabled={!canEdit}
          />
        </Box>
      </SimpleGrid>

        <Flex direction={'column'} gap={0} my={'lg'} w={'100%'}>
            <SCSwitch
                mb={0}
                label={'Use latitude / longitude'}
                checked={!!useCoords}
                onToggle={(checked: boolean) => {
                    setUseCoords(checked);
                    if (!checked) {
                        form.setFieldValue('Latitude', null);
                        form.setFieldValue('Longitude', null);
                    }
                }}
                disabled={!canEdit}
            />
            <LocationLatLngControl
                addressText={addressText}
                countryName={form.values.CountryDescription}
                initialLatitude={initialValues.Latitude as any}
                initialLongitude={initialValues.Longitude as any}
                disabled={!canEdit}
                useCoords={useCoords}
                onChange={({ latitude, longitude }) => {
                    form.setFieldValue('Latitude', latitude);
                    form.setFieldValue('Longitude', longitude);
                }}
            />
        </Flex>

      {/*<SimpleGrid
        spacing={{ base: 'lg', md: 'sm' }}
        verticalSpacing={0}
        cols={{ base: 1, md: 2 }}
      >*/}
        <Flex justify={{base: 'start', md: 'end'}} gap={40} mt={40}>
           {!isNew && (
                <SCSwitch
                    label={'Active'}
                    checked={!!form.values.IsActive}
                    onToggle={(checked: boolean) => form.setFieldValue('IsActive', checked)}
                    disabled={!canEdit || !!form.values.IsPrimary}
                />
            )}
        </Flex>
      {/*</SimpleGrid>*/}
    </Box>
  );

  if (!isModalMode) {
    // Embedded usage: just return the content
    return formContent;
  }

  // Modal mode (replacement for manage-location)
  return (
    <SCModal open={true} decor={'none'} onClose={() => {}} size={'lg'}>
      <div>
        {backButtonText && (
          <Group style={{ borderBottom: '1px solid var(--mantine-color-gray-1)', paddingBottom: 'var(--mantine-spacing-md)' }}>
            <Button variant={'subtle'} color={'gray.9'} onClick={onCancel}>
              {backButtonText}
            </Button>
          </Group>
        )}

        <Title my={'var(--mantine-spacing-lg)'} size={'md'} fw={600}>
          {isNew ? 'Add new location' : `Editing location ${form.values.Description ?? ''}`}
        </Title>

        {formContent}

        <Group mt={'5rem'} justify={'right'} gap={'xs'}>
          <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={onCancel}>
            Cancel
          </Button>
          {canEdit && (
            <Button
              color={'scBlue'}
              disabled={saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
              rightSection={saving && <Loader variant={'oval'} size={18} color={'white'} />}
              onClick={saveLocation}
            >
              {isNew ? 'Create' : 'Save'}
            </Button>
          )}
        </Group>
      </div>
    </SCModal>
  );
}

export default LocationForm;
