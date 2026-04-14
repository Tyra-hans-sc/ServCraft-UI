import { useMutation, useQuery } from '@tanstack/react-query'
import { FC, useEffect, useMemo, useState } from 'react'
import Fetch from "@/utils/Fetch";
import { Box, Flex, Loader, Text, Grid } from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import { showNotification } from "@mantine/notifications";
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

interface RecordSequence {
    ID: string;
    Module: number;
    SequenceKey: string | null;
    SequenceValue: number;
    OriginalValue: number;
    StoreID?: string | null;
    StoreName?: string | null;
    StoreCode?: string | null;
    StoreEmailAddress?: string | null;
    RowVersion: string;
}

interface LatestRecordResponse {
    RecordNumber: string;
}

const getSettingsOptions = async (module: number) => {
    const res = await Fetch.get({
        url: `/Option?module=${module}`,
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
        statusIfNull: true
    } as any);
    if (settingsRes.ResponseStatus === 200) {
        return settingsRes.Results
    } else {
        throw new Error(settingsRes.serverMessage || settingsRes.message || 'something went wrong');
    }
}

const getRecordSequence = async (module: number) => {
    const res = await Fetch.get({
        url: `/RecordSequence?module=${module}`,
    } as any)

    if (res) {
        return res as RecordSequence;
    } else {
        throw new Error(res?.serverMessage || res?.message || 'Failed to fetch record sequence');
    }
}

const getLatestRecordNumber = async (module: number): Promise<string> => {
    const res = await Fetch.get({
        url: `/RecordSequence/Latest?module=${module}`,
    } as any)

    console.log('RECORDRES', res);
    if (res && res.RecordNumber) {
        return res.RecordNumber;
    }
    return '';
}

const updateRecordSequence = async (recordSequence: RecordSequence) => {
    const res = await Fetch.put({
        url: '/RecordSequence',
        params: recordSequence,
        statusIfNull: true
    } as any);

    if (res) {
        return res as RecordSequence;
    } else {
        throw new Error(res?.serverMessage || res?.message || 'Failed to update record sequence');
    }
}

const getModuleName = (module: number): string => {
    const moduleNames: { [key: number]: string } = {
        0: 'Customer',
        1: 'Job',
        2: 'Query',
        3: 'Asset',
        5: 'Quote',
        14: 'Inventory',
        15: 'Invoice',
        17: 'Project',
        24: 'Purchase Order',
        40: 'Recurring Job',
    };
    return moduleNames[module] || 'Record';
}

const RecordSequenceSettings: FC<{ module: number }> = (props) => {
    const [options, setOptions] = useState<Option[]>([])
    const [localSequence, setLocalSequence] = useState<RecordSequence | null>(null)
    const [loadingItemIds, setLoadingItemIds] = useState<string[]>([])
    const [sequenceInputValue, setSequenceInputValue] = useState<string>('')
    const [sequenceError, setSequenceError] = useState<string | null>(null)
    const [prefixInputValues, setPrefixInputValues] = useState<{[key: string]: string}>({})
    const [latestRecordNumber, setLatestRecordNumber] = useState<string>('')

    const moduleName = getModuleName(props.module);

    const optionsQuery = useQuery(['settingsOptions', props.module], () => getSettingsOptions(props.module))

    // Update options when query data changes
    useEffect(() => {
        if (optionsQuery.data) {
            const prefixOptions = optionsQuery.data.filter(option =>
                option.GroupName.toLowerCase().includes('prefix')
            );
            setOptions(prefixOptions)

            const initialPrefixValues = prefixOptions.reduce((acc, option) => {
                acc[option.ID] = option.OptionValue;
                return acc;
            }, {} as {[key: string]: string});
            setPrefixInputValues(initialPrefixValues);
        }
    }, [optionsQuery.data])

    const prefixOptionsFromQuery = useMemo(() => {
        return optionsQuery.data?.filter(option =>
            option.GroupName.toLowerCase().includes('prefix')
        ) || [];
    }, [optionsQuery.data]);

    const sequenceQuery = useQuery(['recordSequence', props.module], () => getRecordSequence(props.module), {
        onError: (error: Error) => {
            console.error('Sequence error:', error);
        }
    })

    // Update sequence when query data changes
    useEffect(() => {
        if (sequenceQuery.data) {
            setLocalSequence(sequenceQuery.data)
            setSequenceInputValue((sequenceQuery.data.SequenceValue ?? 0).toString())
        }
    }, [sequenceQuery.data])

    const latestRecordQuery = useQuery(
        ['latestRecord', props.module],
        () => getLatestRecordNumber(props.module),
        {
            onError: (error: Error) => {
                console.error('Latest record error:', error);
            },
            retry: false
        }
    )

    // Update latest record number when query data changes
    useEffect(() => {
        if (latestRecordQuery.data !== undefined) {
            setLatestRecordNumber(latestRecordQuery.data);
        }
    }, [latestRecordQuery.data])

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

    const sequenceMutation = useMutation(['recordSequenceMutation'], (sequence: RecordSequence) => updateRecordSequence(sequence), {
        onSuccess: (data) => {
            setLocalSequence(data)
            setSequenceInputValue((data.SequenceValue ?? 0).toString())
            setLoadingItemIds(p => p.filter(x => x !== 'sequence'))
            sequenceQuery.refetch()
            latestRecordQuery.refetch()
        },
        onError: (error: Error) => {
            showNotification({
                title: 'Failed to update record sequence',
                message: error.message,
                color: 'yellow',
                autoClose: 3000
            })
            setLoadingItemIds(p => p.filter(x => x !== 'sequence'))
            sequenceQuery.refetch()
        },
        onMutate: () => {
            setLoadingItemIds(p => ([...p, 'sequence']))
        },
        retry: false
    })

    useEffect(() => {
        const itemsChanged = options.reduce((p: Option[], c) => {
            const originalOption = prefixOptionsFromQuery.find(x => x.ID === c.ID);
            return (c.OptionValue !== originalOption?.OptionValue) ? [...p, c] : [...p];
        }, [])

        if(itemsChanged.length > 0 && options.length > 0) {
            optionsMutation.mutate({options: itemsChanged, itemsChanged})
        }
    }, [options]);

    const optionsByGroupName: {[groupname: string] : Option[]} = useMemo(
        () => options.reduce((p, c: Option) => ({...p, [c.GroupName]: [...(p[c.GroupName] || []), c]}), {}) || {}
    ,[options])

    const prefixValue = useMemo(() => {
        const prefixOption = options[0];

        if (prefixOption && prefixInputValues[prefixOption.ID] !== undefined) {
            return prefixInputValues[prefixOption.ID];
        }

        return prefixOption?.OptionValue || '';
    }, [options, prefixInputValues]);

    const validateSequenceValue = (value: string): string | null => {
        const numValue = parseInt(value);

        if (isNaN(numValue)) {
            return 'Please enter a valid number';
        }

        if (numValue < 0) {
            return 'Current record number must be at least 0';
        }

        return null;
    }

    const handlePrefixInputChange = (value: string, optionId: string) => {
        setPrefixInputValues(prev => ({
            ...prev,
            [optionId]: value
        }));
    }

    const handleOptionUpdate = (newVal: string, optionId: string) => {
        setOptions((p) => p.map(x => x.ID === optionId ? {...x, OptionValue: newVal} : x))
    }

    const handleSequenceInputChange = (value: string) => {
        setSequenceInputValue(value);

        if (value.trim() === '') {
            const error = validateSequenceValue(value);
            setSequenceError(error);
        } else if (sequenceError) {
            setSequenceError(null);
        }
    }

    const handleSequenceUpdate = (value: string) => {
        if (!localSequence) return;

        const error = validateSequenceValue(value);
        if (error) {
            setSequenceError(error);
            showNotification({
                title: 'Invalid value',
                message: error,
                color: 'red',
                autoClose: 3000
            });
            return;
        }

        setSequenceError(null);

        const updatedSequence = {
            ...localSequence,
            SequenceValue: parseInt(value)
        };
        setLocalSequence(updatedSequence);
        sequenceMutation.mutate(updatedSequence);
    }

    const getNextRecordNumber = () => {
        const nextValue = (parseInt(sequenceInputValue) || 0) + 1;
        return `${prefixValue}${nextValue}`;
    }

    return (
        <Box
            p="md"
            style={{
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: '8px'
            }}
        >
            {/* Render prefix options */}
            {
                Object.entries(optionsByGroupName).map(([groupName, groupOptions]) => (
                    <Box key={'group' + groupName} mt={'sm'}>
                        <Text c={'scBlue.8'} mb={'sm'}>Prefix</Text>
                        <Box>
                            {
                                groupOptions.map((x, i) => (
                                    <ScTextControl
                                        mt={i === 0 ? 0 : 'sm'}
                                        key={x.ID}
                                        withAsterisk={x.IsRequired}
                                        readOnly={!x.IsEditable}
                                        label={"Enter " + x.OptionName + " prefix"}
                                        value={prefixInputValues[x.ID] ?? x.OptionValue}
                                        onChange={(e) => handlePrefixInputChange(e.currentTarget.value, x.ID)}
                                        onBlur={(e) => handleOptionUpdate(e.currentTarget.value, x.ID)}
                                        onKeyPress={e => {
                                            if(e.code === 'Enter') {
                                                e.preventDefault()
                                                handleOptionUpdate(e.currentTarget?.value, x.ID)
                                            }
                                        }}
                                        rightSection={loadingItemIds.includes(x.ID) ? <Loader type={'oval'} size={10} /> : undefined}
                                    />
                                ))
                            }
                        </Box>
                    </Box>
                ))
            }

            {/* Numbering settings section with new layout */}
            {localSequence && (
                <Box mt={'md'}>
                    <Text c={'scBlue.8'} mb={'sm'}>Numbering sequence</Text>
                    <Grid gutter="lg" align="flex-start">
                        {/* Left side: Your last [module] */}
                        <Grid.Col span={6} pl={8}>
                            <Flex direction={'column'} gap={'md'}>
                                <Box>
                                    <Text
                                        component="label"
                                        size="sm"
                                        fw={500} 
                                    >
                                        Your last {moduleName.toLowerCase()}:
                                    </Text>
                                    <Box
                                        mt={3}
                                        style={{
                                            minHeight: '36px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text c={'scBlue.7'} fw={700} size={'lg'}>
                                            {latestRecordQuery.isLoading ? (
                                                <Loader size={'sm'} />
                                            ) : (
                                                latestRecordNumber || 'No records yet'
                                            )}
                                        </Text>
                                    </Box>
                                </Box>
                            </Flex>
                        </Grid.Col>

                        {/* Right side: Set next number and preview */}
                        <Grid.Col span={6} px={0}>
                            <Flex direction={'column'} gap={'md'}>
                                <Box>
                                    <Text
                                        component="label"
                                        size="sm"
                                        fw={500}
                                    >
                                        Set your current {moduleName.toLowerCase()} number to:
                                    </Text>
                                    <ScTextControl
                                        type="number"
                                        value={sequenceInputValue}
                                        onChange={(e) => handleSequenceInputChange(e.currentTarget.value)}
                                        onBlur={(e) => handleSequenceUpdate(e.currentTarget.value)}
                                        onKeyPress={(e) => {
                                            if (e.code === 'Enter') {
                                                e.preventDefault();
                                                handleSequenceUpdate(e.currentTarget.value);
                                            }
                                        }}
                                        error={sequenceError}
                                        rightSection={loadingItemIds.includes('sequence') ? <Loader type={'oval'} size={10} /> : undefined}
                                    />
                                </Box>

                                <Box>
                                    <Text size={'sm'} fw={500} mb={5}>
                                        Your next {moduleName.toLowerCase()} will be:
                                    </Text>
                                    <Box
                                        p={'md'}
                                        style={{
                                            backgroundColor: 'var(--mantine-color-gray-0)',
                                            borderRadius: '8px',
                                            border: '1px solid var(--mantine-color-gray-3)',
                                            minHeight: '60px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text c={'scBlue.7'} fw={700} size={'lg'}>
                                            {getNextRecordNumber()}
                                        </Text>
                                    </Box>
                                </Box>
                            </Flex>
                        </Grid.Col>
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default RecordSequenceSettings;
