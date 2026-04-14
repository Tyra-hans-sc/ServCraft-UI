import {useMutation, useQuery} from '@tanstack/react-query'
import {FC, useEffect, useMemo, useState} from 'react'
import Fetch from "@/utils/Fetch";
import {isOptionGroupNameCoveredByFieldSettings} from "@/PageComponents/Settings/Field Settings/fieldSettingHelper";
import {Box, Loader, Text} from "@mantine/core";
import Form from "react-bootstrap/Form";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {showNotification} from "@mantine/notifications";
import ScCheckbox from "@/components/sc-controls/form-controls/sc-checkbox";

interface Option {
    CreatedBy: string;
    CreatedDate: string;
    Description: string | null;
    GroupName: string;
    ID: string;
    IsActive: boolean;
    IsEditable: boolean;
    IsRequired: boolean;
    ModifiedBy: string;
    ModifiedDate: string;
    Module: number;
    OptionName: string;
    OptionValue: string;
    RowVersion: string;
    SystemType: string;
    Unit: string | null;
}

const getSettingsOptions = async (module: number) => {
    const res = await Fetch.get({
        url: `/Option?module=${module}`,
        // ctx: ctx
    } as any)

    if (res?.HttpStatusCode === 200 && Array.isArray(res.Results)) {
        return res.Results as Option[];
    } else {
        throw new Error(res.serverMessage || res.message || 'something went wrong');
    }
}

const updateSettingsOptions = async (newSettings) => {
    const settingsRes = await Fetch.put({
        url: '/Option',
        params: newSettings,
        // toastCtx: toast,
        statusIfNull: true
    } as any);
    if (settingsRes.ResponseStatus === 200) {
        return settingsRes.Results
        /*const rowUpdate = await Fetch.get({
            url: `/Option?module=${Enums.Module.Asset}`
        })*/
        // setSettings(rowUpdate.Results);
    } else {
        throw new Error(settingsRes.serverMessage || settingsRes.message || 'something went wrong');
    }
}

const OptionSettings: FC<{module: number; refetchOptions?: number}> = (props) => {
    const [options, setOptions] = useState<Option[]>([])
    const [loadingItemIds, setLoadingItemIds] = useState<string[]>([])
    // const [debouncedOptions, cancel] = useDebouncedValue(options, 500)

    const optionsQuery = useQuery(['settingsOptions', props.module], () => getSettingsOptions(props.module), {
        onSuccess: (data) => {
            setOptions(data)
        }
    })

    // refetch needs to be carried out to ensure latest rowversion after fieldsetting updates
    useEffect(() => {
        if(props.refetchOptions) {
            optionsQuery.refetch()
        }
    }, [props.refetchOptions]);

    const optionsMutation = useMutation(['optionsMutation', options], ({options}: any) => updateSettingsOptions(options), {
        onSuccess: (data, {itemsChanged}) => {
            setLoadingItemIds(p => p.filter(x => !itemsChanged.some(y => y.ID === x)))
            optionsQuery.refetch()
        },
        onError: (error: Error, {itemsChanged}) => {
            showNotification({
                id: 'updateFieldOptionSetting' + itemsChanged[0].ID,
                title: 'Unable to update ' + itemsChanged[0].OptionName,
                message: error.message,
                color: 'yellow',
                loading: false,
                autoClose: 3000
            })
            setLoadingItemIds(p => (p.filter(x => !itemsChanged.some(y => y.ID === x))))
            optionsQuery.refetch()
        },
        onMutate: ({itemsChanged}) => {
            setLoadingItemIds(p => ([...p, ...itemsChanged.map(x => x.ID)]))
        },
        retry: false
    })
    useEffect(() => {
        // console.log('updating options', options)
        const itemsChanged = options.reduce((p: Option[], c) => ((c.OptionValue !== optionsQuery.data?.find(x => x.ID === c.ID)?.OptionValue) ? [...p, c] : [...p]), [])
        // console.log('options updated', {options, itemsChanged})
        if(itemsChanged.length > 0 && options.length > 0) {
            optionsMutation.mutate({options, itemsChanged})
        }
    }, [options]);

    const optionsByGroupName: {[groupname: string] : Option[]} = useMemo(
        () => optionsQuery.data?.reduce((p, c: Option) => ( isOptionGroupNameCoveredByFieldSettings(c.GroupName) ? p : {...p, [c.GroupName]: [...(p[c.GroupName] || []), c]}), {}) || {}
    ,[optionsQuery.data])

    const handleOptionUpdate = (newVal: string, optionId: string) => {
        setOptions((p) => p.map(x => x.ID === optionId ? {...x, OptionValue: newVal} : x))
    }

    return (
        <Form>
            {
                Object.entries(optionsByGroupName).map(([groupName, options]) => (
                    <Box key={'group' + groupName} mt={'sm'}>
                        <Text c={'scBlue.8'} mb={0}>{groupName}</Text>
                        {
                            options.map((x, i) => (
                                x.SystemType === 'System.String' ? <ScTextControl
                                    mx={'xs'}
                                    mt={i === 0 ? 5 : ''}
                                    key={x.ID}
                                    withAsterisk={x.IsRequired}
                                    readOnly={!x.IsEditable}
                                    label={x.OptionName}
                                    defaultValue={x.OptionValue}
                                    onBlur={(e) => handleOptionUpdate(e.currentTarget.value, x.ID)}
                                    onKeyPress={e => {
                                        // console.log(e.code)
                                        if(e.code === 'Enter') {
                                            e.preventDefault()
                                            handleOptionUpdate(e.currentTarget?.value, x.ID)
                                        }
                                        // e.code === 'Enter' && handleOptionUpdate(e, x.ID)
                                    }}

                                    rightSection={loadingItemIds.includes(x.ID) ? <Loader type={'oval'} size={10} /> : undefined}
                                /> :
                                x.SystemType === 'System.Boolean' ? <ScCheckbox
                                    key={x.ID}
                                    value={JSON.parse(x.OptionValue.toLowerCase())}
                                    onChange={(newVal) => handleOptionUpdate(JSON.stringify(newVal), x.ID)}
                                    hint={x.Description || undefined}
                                    label={x.OptionName}
                                /> : <></>
                            ))
                        }
                    </Box>
                ))
            }
        </Form>
    );
}

export default OptionSettings
