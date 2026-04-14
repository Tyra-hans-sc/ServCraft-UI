import {useMutation, useQuery} from '@tanstack/react-query'
import {FC, useCallback, useEffect, useMemo, useState} from 'react'
import Fetch from "@/utils/Fetch";
import {Box, Flex, Loader, Text} from "@mantine/core"; // Added Text here
import SCComboBox from "@/components/sc-controls/form-controls/sc-combobox";
import SimpleTable from "@/PageComponents/SimpleTable/SimpleTable";
import {IconChartTreemap, IconInputAi, IconX} from "@tabler/icons-react";
import {TableAction, TableActionStates} from "@/PageComponents/Table/table-model";
import {showNotification} from "@mantine/notifications";
import OptionSettings from "@/PageComponents/Settings/Field Settings/OptionSettings";
import {useForceUpdate} from "@mantine/hooks";
import RecordSequenceSettings from "@/PageComponents/Settings/RecordSequence/RecordSequenceSettings";
import RecordSequenceHeader from '../RecordSequence/RecordSequenceHeader';
import RecordSequenceHint from '../RecordSequence/RecordSequenceHint';

interface Field {
    CascadeFromSystemName: string | null
    DisplayName: string
    DisplayOrder: number
    Module: number
    PermanentField: boolean
    Renamable: boolean
    SystemName: string
    SystemType: "System.String" | "System.DateTime" | "System.Boolean" | "System.Decimal"
}

export interface FieldSetting {
    CreatedBy: string,
    CreatedDate: string,
    Description: string,
    DisplayName: string,
    DisplayOrder: number,
    FieldSystemName: string,
    HideOnCreate: boolean,
    ID: string,
    IsActive: boolean,
    IsRequired: boolean,
    ModifiedBy: string,
    ModifiedDate: string,
    Module: number,
    RowVersion: string,
}

const getFields = async (module: number) => {
    const res = await Fetch.post({
        url: '/field/getFields?module=' + module,
        caller: location?.pathname,
        params: {
            module
        }
    } as any)

    if (res && Array.isArray(res)) {
        return res as Field[];
    } else {
        throw new Error(res.serverMessage || res.message || 'something went wrong');
    }
}

export const getFieldSettings = async (module: number) => {
    const res = await Fetch.post({
        url: '/field/getFieldSettings?module=' + module,
        caller: location?.pathname,
        params: {
            module
        }
    } as any)

    if (res && Array.isArray(res)) {
        return res as FieldSetting[];
    } else {
        throw new Error(res.serverMessage || res.message || 'something went wrong');
    }
}

const updateFieldSettings = async (fields: FieldSetting[]) => {
    const res = await Fetch.post({
        url: '/field',
        caller: location?.pathname,
        params: fields
    } as any)

    if(res.serverMessage || res.message) {
        throw new Error(res.serverMessage || res.message || 'something went wrong');
    }
    return res
}

export const getCustomerFieldDisplayNames = (fieldSettings: FieldSetting[]) => {
    const fieldMap: { [key: string]: string } = {};

    fieldSettings.forEach(field => {
      fieldMap[field.FieldSystemName] = field.DisplayName || field.FieldSystemName;
    });

    return {
      // Text fields
      fieldLabel1: fieldMap['CustomField1'] || 'CustomField1',
      fieldLabel2: fieldMap['CustomField2'] || 'CustomField2',
      fieldLabel3: fieldMap['CustomField3'] || 'CustomField3',
      fieldLabel4: fieldMap['CustomField4'] || 'CustomField4',
      
      // Filter fields
      filterFieldLabel1: fieldMap['CustomFilter1'] || 'CustomFilter1',
      filterFieldLabel2: fieldMap['CustomFilter2'] || 'CustomFilter2',
      
      // Date fields
      dateFieldLabel1: fieldMap['CustomDate1'] || 'CustomDate1',
      dateFieldLabel2: fieldMap['CustomDate2'] || 'CustomDate2',
      
      // Number fields
      numberFieldLabel1: fieldMap['CustomNumber1'] || 'CustomNumber1',
      numberFieldLabel2: fieldMap['CustomNumber2'] || 'CustomNumber2'
    };
  };

const FieldSettings: FC<{module: number}> = (props) => {
    const forceUpdate = useForceUpdate();
    // counter to refresh options as rowVersionNumber needs to be reobtained after fieldSetting updates due to transactions on api
    const [refreshOptions, setRefreshOptions] = useState(0);

    const [addedFields, setAddedFields] = useState<FieldSetting[]>([])

    const fieldsQuery = useQuery(['fields', props.module], () => getFields(props.module))
    const fieldSettingsQuery = useQuery(['fieldSettings', props.module], () => getFieldSettings(props.module), {
        // onSettled: forceUpdate
        onError: console.error
    })

    // Update added fields when query data changes
    useEffect(() => {
        if (fieldSettingsQuery.data) {
            setAddedFields(fieldSettingsQuery.data.filter(x => x.IsActive).sort((a, b) => a.FieldSystemName > b.FieldSystemName ? 1 : -1))
        }
    }, [fieldSettingsQuery.data])

    const fieldsToAdd = useMemo(() => {
        return fieldsQuery.data?.map(x => {
            const currentSetting = fieldSettingsQuery.data?.find(y => y.FieldSystemName === x.SystemName)
            // console.log('current setting', currentSetting)
            return currentSetting || {
                FieldSystemName: x.SystemName,
                IsRequired: true,
                HideOnCreate: false,
                IsActive: false,
                DisplayName: x.DisplayName,
                Module: x.Module,
                Description: '',
                // CreatedBy: 'Client',
                ID: 'custom-' + crypto?.randomUUID()
            }
        }).filter(x => !x.IsActive).sort((a, b) => a.FieldSystemName > b.FieldSystemName ? 1 : -1)
    }, [fieldsQuery.data, fieldSettingsQuery.data])

    /*const addedFields = useMemo(() => {
        return fieldSettingsQuery.data?.filter(x => x.IsActive).sort((a, b) => a.FieldSystemName > b.FieldSystemName ? 1 : -1) || []
    }, [fieldSettingsQuery.data])*/

    const [inputProps, setInputProps] = useState({})
    const [actionStates, setActionStates] = useState<TableActionStates>({})
    const [addingItemState, setAddingItemState] = useState(false)
    const [addItemValue, setAddItemValue] = useState<null | FieldSetting>(null)

    const fieldsMutation = useMutation(['fieldMutation'], ({name, item}: any) => updateFieldSettings([item]), {
        onSuccess: (data, {name, name2, item}) => {
            inputProps[item.ID]?.[name] && setInputProps(p => {
                p[item.ID][name].loading = false
                if(name2) { p[item.ID][name2].loading = false } // setting additional field loading
                return p;
            })
            if (name === 'IsActive') {
                if( item.IsActive === false) {
                    setActionStates(p => ({...p, ['remove' + item.ID]: 'success'}))
                    setTimeout(() => {
                        setActionStates(p => ({...p, ['remove' + item.ID]: 'none'}))
                    }, 500)
                } else if(item.IsActive) {
                    setAddingItemState(false)
                    setAddItemValue(null)
                }
            }
        },
        onSettled: () => {
            fieldSettingsQuery.refetch();
            setRefreshOptions(p => p + 1);
        },
        onMutate: ({name, name2, item}) => {
            inputProps[item.ID]?.[name] && setInputProps(p => {
                p[item.ID][name].loading = true
                if(name2) { p[item.ID][name2].loading = true } // setting additional field loading
                return p;
            })
            if(name === 'IsActive') {
                if(item.IsActive === false) {
                    setActionStates(p => ({...p, ['remove' + item.ID]: 'loading'}))
                } else if(item.IsActive) {
                    setAddingItemState(true)
                }
            }
        },
        onError: (error: Error, {name, name2, item}) => {
            console.error(error)
            inputProps[item.ID]?.[name] && setInputProps(p => {
                p[item.ID][name].loading = false
                p[item.ID][error].error = error
                if(name2) { p[item.ID][name2].loading = false } // setting additional field loading
                return p;
            })
            if (name === 'IsActive') {
                if(item.IsActive === false) {
                    setActionStates(p => ({...p, ['remove' + item.ID]: 'error'}))
                    setTimeout(() => {
                        setActionStates(p => ({...p, ['remove' + item.ID]: 'none'}))
                    }, 500)
                } else if(item.IsActive) {
                    setAddingItemState(false)
                    setAddItemValue(null)
                }
            }
            showNotification({
                id: 'updateFieldSetting' + item.ID + name,
                title: 'Unable to update ' + item.FieldSystemName,
                message: error.message,
                color: 'yellow',
                loading: false,
                autoClose: 3000
            })
        },
    })

    useEffect(() => {
        if(fieldSettingsQuery.data?.length && fieldsQuery.data?.length) {
            const updatedInputProps = fieldSettingsQuery.data.reduce((p, x) => {
                const meta = fieldsQuery.data.find(y => y.SystemName === x.FieldSystemName)
                return {
                    ...p,
                    [x.ID]: {
                        DisplayName: {
                            disabled: !meta?.Renamable,
                            // loading:
                        },
                        IsRequired: {
                            // disabled: false,
                            // loading: true
                        },
                        HideOnCreate: {
                            disabled: x.IsRequired
                            // disabled: false,
                            // loading:
                        }
                    }
                }
            }, {})
            setInputProps(updatedInputProps)
        }
    }, [fieldSettingsQuery.data, fieldsQuery.data]);

    const handleAddItem = (item) => {
        const cloned = {...item}
        if(cloned.ID.startsWith('custom')) {
            delete cloned.ID
        }
        setAddItemValue(item)
        fieldsMutation.mutate({
            name: 'IsActive',
            item: {...cloned, IsActive: true}
        })
    };

    const handleFieldUpdate = useCallback((name: string, item: any, value: string | number | boolean) => {

    // cascade from dependency field property handling:
      if(actionStates['remove' + item.ID] !== 'loading' && !inputProps[item.ID]?.[name]?.loading) {
          if((name === 'IsRequired' || name === 'IsActive') && value === true || name === 'HideOnCreate' && value === false) { // this is a special condition where hide on create must be true if the field is required
              const dependencyName = fieldsQuery.data?.find(x => x.SystemName === item.FieldSystemName)?.CascadeFromSystemName
              if (!!dependencyName) {
                  const dependencySetting = [...(fieldSettingsQuery.data || []), ...(fieldsToAdd || [])].find(x => x.FieldSystemName === dependencyName)
                  // meant to also update cascader item  to same value of dependant if relevant
                  if(dependencySetting && ((name !== 'HideOnCreate' && !dependencySetting[name]) || (name === 'HideOnCreate' && dependencySetting[name]))) {
                      handleFieldUpdate(name, {...dependencySetting}, value)
                  }
              }
          } else if((name === 'IsRequired' || name === 'IsActive') && value === false || name === 'HideOnCreate' && value === true) {
              const dependantName = fieldsQuery.data?.find(x =>  x.CascadeFromSystemName === item.FieldSystemName)?.SystemName
              if(!!dependantName) {
                  const dependencySetting = [...(fieldSettingsQuery.data || []), ...(fieldsToAdd || [])].find(x => x.FieldSystemName === dependantName)
                  if(dependencySetting && ((name !== 'HideOnCreate' && dependencySetting[name]) || (name === 'HideOnCreate' && !dependencySetting[name]))) {
                      handleFieldUpdate(name, {...dependencySetting}, value)
                  } else if(dependencySetting && name === 'IsActive') { // special case exception: sometimes when adding cascade dependency item and removing it and updating it again the added fields are not current no matter what causing cascaded dependency item to not remove item - bug is being fixed by always removing cascaded item no matter what the current active state is thought to be
                      handleFieldUpdate(name, {...dependencySetting}, value)
                  }
              }
          }

          if(name === 'DisplayName') { // prevent submitting empty display names and show an error
              if (!((value + '').trim())) {
                  setInputProps(p => {
                      p[item.ID].DisplayName.error = 'Please proved a display name'
                      return p
                  })
                  forceUpdate()
                  return
              } else {
                  setInputProps(p => {
                      p[item.ID].DisplayName.error = null
                      return p
                  })
              }
          }

          if(name === 'IsRequired') { // disable hide on create when isRequired is set
              if (value === true) {
                  setInputProps(p => {
                      p[item.ID].HideOnCreate.disabled = true
                      return p
                  })
              } else if (value === false) {
                  setInputProps(p => {
                      p[item.ID].HideOnCreate.disabled = false
                      return p
                  })
              }
          }

          if(name === 'IsRequired' && value === true && item.HideOnCreate) { // this is a special condition where hide on create must be true if the field is required
              const newItemWithHideOnCreate = {
                  ...item,
                  [name]: value,
                  HideOnCreate: false
              }
              setTimeout(() => {
                  fieldsMutation.mutate({name, name2: 'HideOnCreate', item: newItemWithHideOnCreate})
              }, 1)
          } else if(name === 'IsActive' && value === true) {
              handleAddItem(item)
          } else {
              fieldsMutation.mutate({name, item: {...item, [name]: value}})
          }
        }
    }, [fieldSettingsQuery.data, refreshOptions, addedFields, fieldsToAdd, inputProps, actionStates])

    const tableControls = useMemo<TableAction[]>(() => {
        return fieldsQuery.data && [
            {
                label: 'Remove',
                disabledLabel: 'This is a permanent field and can not be removed',
                activeLabel: 'Removing',
                name: 'remove',
                type: 'warning',
                icon: <IconX />,
                conditionalDisable: (x: FieldSetting) => {
                    const meta = fieldsQuery.data?.find(y => y.SystemName === x.FieldSystemName)
                    // console.log(x, meta, meta?.PermanentField)
                    return meta?.PermanentField ?? false
                }
            }
        ] || []
    }, [fieldsQuery.data])

    return (
        <>
            <Text c={'scBlue.8'} mb={0} mt={'sm'}>Field Settings</Text>
            <Text size={'sm'} c={'dimmed'} mb={0}>Configure or add fields with custom settings such as renaming, making required, or displaying on the create pages according to your preferences.</Text>
            <Box p={'sm'}>
                <SimpleTable
                    stylingProps={{compact: false, darkerText: true, rows: false}}
                    data={addedFields}
                    height={'100%'}
                    // onReorder={(items) => console.log('new order', items)}
                    onInputChange={handleFieldUpdate}
                    onAction={(actionName, actionItem, actionItemIndex) => actionName === 'remove' && handleFieldUpdate('IsActive', actionItem, false) /*handleRemoveItem(actionItem)*/}
                    mapping={[
                        {
                            label: 'Name',
                            type: 'textInput',
                            key: 'DisplayName',
                            placeholderFunction: (x) => (x.FieldSystemName) + ' *',
                            maxLength: 42
                        },
                        {
                            label: 'System Name',
                            type: 'status',
                            key: 'FieldSystemName',
                            hintIcon: (item) => {
                                const field = fieldsQuery?.data?.find(x => x.SystemName === item.FieldSystemName)
                                return field?.CascadeFromSystemName ? ({
                                    icon: <span><IconChartTreemap size={14} color={'var(--mantine-color-green-7)'} /></span>,
                                    text: 'Field is dependent on ' + field?.CascadeFromSystemName
                                }) : null
                            }
                        },
                        {
                            label: 'Required',
                            type: 'checkInput',
                            key: 'IsRequired'
                        },
                        {
                            label: 'Show on Create',
                            type: 'checkInput',
                            key: 'HideOnCreate',
                            inverseDepictedValue: true
                        }
                    ]}
                    tableItemInputMetadataByKeyName={inputProps}
                    controls={tableControls}
                    tableActionStates={actionStates}
                    showControlsOnHover={false}
                    addButton={{
                        customComponent:
                            <Box
                                // p={'sm'}
                            >
                                <SCComboBox
                                    mt={0}
                                    canSearch
                                    // label={'Select a field to add'}
                                    placeholder={'Select a field to add'}
                                    options={fieldsToAdd}
                                    value={addItemValue}
                                    onChange={/*handleAddItem*/ (item) => handleFieldUpdate('IsActive', item, true)}
                                    dataItemKey={"ID"} // data item key needs to be specified in order for options to be treated as objects
                                    textField={"DisplayName"}
                                    disabled={addingItemState}
                                    iconMantine={addingItemState && <Loader size={12}/>}
                                    itemRenderMantine={(x) => <Flex
                                        justify={'space-between'}
                                        align={'center'}
                                    >
                                        <Text size={'sm'}>{x.dataItem.DisplayName}</Text>
                                        <Text size={'xs'} fw={'bolder'}>({x.dataItem.FieldSystemName})</Text>
                                    </Flex>}
                                />
                            </Box>,
                        label: '',
                    }}
                />
            </Box>
            

            <Box mt="xl">
                <RecordSequenceHeader />
            </Box>
            <Flex gap="lg" mt="md">
                <Box style={{ flex: 1 }}>
                    <RecordSequenceSettings module={props.module} />
                </Box>
                <Box style={{ flex: 1 }}>
                    <RecordSequenceHint />
                </Box>
            </Flex>

        </>
    );
}

export default FieldSettings