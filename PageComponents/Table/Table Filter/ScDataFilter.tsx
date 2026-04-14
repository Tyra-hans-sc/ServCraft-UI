'use client';
import {FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    filterSelectOption,
    ScFilterOptionDateRangeProps,
    ScFilterOptionMultiselectProps, ScFilterOptionPriceRangeProps,
    ScFilterOptionSwitchProps,
    ScTableFilterComponentProps
} from "@/PageComponents/Table/table-model";
import {
    Box, Checkbox,
    CloseButton,
    Flex, NumberInput, TextInput,
} from "@mantine/core";
import {useQueries, useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {useForm} from "@mantine/form";
import {DatePickerInput, DatePickerValue} from "@mantine/dates";
import Time from "@/utils/time";
import {constructFilterInitialValue, sortFilterOptions} from "@/PageComponents/Table/table-helper";
import ScFilterMultiselect from "@/PageComponents/Table/Table Filter/ScFilterMultiselect";
import {FieldSetting, getFieldSettings} from "@/PageComponents/Settings/Field Settings/FieldSettings";
import {getSystemNameForFormName} from "@/PageComponents/Settings/Field Settings/fieldSettingHelper";
import {useDidUpdate, useMediaQuery} from "@mantine/hooks";
import { getLsFilterState as getLsFs, setLsFilterState as setLsFs, parseQueryToFilter, mergeFilterState } from "@/utils/filter-state";

const ScDataFilter: FC<ScTableFilterComponentProps> = (props) => {

    const mobileView = useMediaQuery('(max-width: 600px)');
    const rememberState = !!props.rememberState;
    const initializedRef = useRef(false);

    const fieldSettings = useQuery(['fieldSettings', props.module], () => getFieldSettings(props.module as number), {
        enabled: typeof props.module !== 'undefined'
    })
    const settingsBySystemName: {[fieldSystemName: string]: FieldSetting} = useMemo(() => {
        if(fieldSettings.data) {
            return fieldSettings.data.reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue.FieldSystemName]: {...currentValue}
            }), {})
        } else {
            return {}
        }
    }, [fieldSettings.data])
    const isShown = useCallback((name: string) => {
        const systemName = getSystemNameForFormName(name)
        return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive : false
    }, [settingsBySystemName])
    useEffect(() => {
        if(Object.keys(settingsBySystemName).length !== 0) {
            multiSelectFilters.forEach(x => {
                if(x.fieldSettingSystemName && !isShown(x.fieldSettingSystemName) && props.initialValues?.[x.filterName]?.length !== 0) {
                    form.setFieldValue(x.filterName, [])
                }
            })
        }
    }, [settingsBySystemName]);

    const [filterOptions, setFilterOptions] = useState<{ [key: string]: filterSelectOption }>(
        props.optionConfig.options.reduce((a, b) => (
            (b.type === 'multiselect' || !b.type) && !!b.hardcodedOptions ? {...a, [b.filterName]: b.hardcodedOptions.map(x => ({
                    value: x.value,
                    enabled: x.enabled ?? true,
                    label: x.label,
                    group: x.group,
                    parentVal: x.parentVal ?? undefined,
                    useInitials: x.useInitials ?? false,
                    color: x.color,
                }))} : {...a}
        ), {})
    )

    const optionsToFetch = useMemo(
        () => props.optionConfig.options.filter(x => (x.type === 'multiselect' || !x.type) && (!!x.queryPath || !!x.queryFunction)) as ScFilterOptionMultiselectProps[],
        [props.optionConfig.options]
    )

    const updateFilterOption = useCallback((data: any[], filterConfig: ScFilterOptionMultiselectProps) => {
        const optionValueKey = filterConfig.dataOptionValueKey || 'ID'
        const optionLabelKey = filterConfig.dataOptionLabelKey || ['Name']
        if (data.length > 0 && data[0][optionValueKey]) {
            setFilterOptions(x => ({
                ...x,
                [filterConfig.filterName]: data.map((d) => ({
                    // ...d,
                    color: filterConfig.dataOptionColorKey ? d[filterConfig.dataOptionColorKey] : undefined,
                    group: filterConfig.dataOptionGroupingKey ? d[filterConfig.dataOptionGroupingKey] : undefined,
                    parentVal: filterConfig.dataOptionSiblingFilterName && filterConfig.dataOptionSiblingKey ? d[filterConfig.dataOptionSiblingKey] : undefined,
                    value: d[optionValueKey] || '',
                    useInitials: filterConfig.filterName.toLowerCase().includes('employee'),
                    enabled: d.IsActive ?? true,
                    label: d[optionLabelKey[0]] || d[optionLabelKey[1]] || d[optionLabelKey[2]] || d[optionLabelKey[3]] || d[optionLabelKey[4]] || ''
                }))
            }))
        }
    }, [])

    const filterQueries = useQueries({
        queries: optionsToFetch
            .map((filterConfig) =>
                ({
                    queryKey: filterConfig.queryUniqueKeys ?? ['tableFilter', props.tableName, filterConfig.filterName],
                    queryFn: (props) => (
                        filterConfig.queryFunction ? filterConfig.queryFunction(props) :
                            Fetch.get({
                                url: filterConfig.queryPath,
                                params: filterConfig.queryParams
                            } as any)
                    ),
                    onError: console.error,
                    placeholderData: (prev) => prev,
                    refetchOnMount: false,
                    refetchOnWindowFocus: false

                })
            ),
    })

    // Update filter options when query data changes (replaces deprecated onSuccess callback)
    useEffect(() => {
        filterQueries.forEach((query, index) => {
            if (query.data?.Results) {
                const filterConfig = optionsToFetch[index]
                const sorted = filterConfig.orderByKey ? sortFilterOptions(query.data.Results, filterConfig.orderByKey) : query.data.Results
                updateFilterOption(sorted, filterConfig)
            }
        })
    }, [filterQueries.map(q => q.data).join(','), updateFilterOption, optionsToFetch])

    const [controlDateValues, setControlDateValues] = useState(
        (props.optionConfig.options.filter(x => x.type === 'dateRange') as ScFilterOptionDateRangeProps[])
            .reduce(
                (prev, x) => ({
                    ...prev,
                    [x.filterName[0]]: (props.initialValues?.[x.filterName[0]] || props.initialValues?.[x.filterName[1]]) ? [
                            props.initialValues?.[x.filterName[0]] ? Time.parseDate(props.initialValues?.[x.filterName[0]].substring(0, 10)) : null,
                            props.initialValues?.[x.filterName[1]] ? Time.parseDate(props.initialValues?.[x.filterName[1]].substring(0, 10)) : null
                        ] :
                        x.defaultValue || [null, null]
                }), {}
            )
    )
    const onDateValueChange = (v: DatePickerValue<'range'>, x: ScFilterOptionDateRangeProps) => {
        setControlDateValues(prev => {
            /** don't clear date on outside click (emits [null, null] when only one date is selected)*/
            const ogDate = prev[x.filterName[0]]
            const newDateValue = ogDate[0] && !ogDate[1] && v && !v[0] ? {
                ...prev
            } : {
                ...prev,
                [x.filterName[0]]: v
            }
            form.setFieldValue(x.filterName[0], newDateValue[x.filterName[0]][0] ? Time.getDate(newDateValue[x.filterName[0]][0]) + 'T00:00:00' : null)
            form.setFieldValue(x.filterName[1], newDateValue[x.filterName[0]][1] ? Time.getDate(newDateValue[x.filterName[0]][1]) + 'T23:59:59' : null)

            return newDateValue;
        })
    }


    const [controlPriceValues, setControlPriceValues] = useState(
        (props.optionConfig.options.filter(x => x.type === 'priceRange') as ScFilterOptionPriceRangeProps[])
            .reduce(
                (prev, x) => ({
                    ...prev,
                    [x.filterName[0]]: x.defaultValue
                }), {}
            )
    )

    const onPriceValueChange = (v: [number | null, number | null], x: ScFilterOptionPriceRangeProps) => {
        setControlPriceValues(prev => {
            // Don't clear price on outside click (similar to date handler)
            /*const ogPrice = prev[x.filterName[0]]
            if(v[0] === null && v[1] === null && (ogPrice?.[0] !== null || ogPrice?.[1] !== null)) {
                return prev
            }*/

            // Update form values directly
            form.setFieldValue(x.filterName[0], v[0])
            form.setFieldValue(x.filterName[1], v[1])

            return {
                ...prev,
                [x.filterName[0]]: v
            }
        })

        console.log('form values updated', form.values)
    }

    const priceRangeFilters = useMemo(
        () => (props.optionConfig.options.filter(x => x.type === 'priceRange') as ScFilterOptionPriceRangeProps[]),
        [props.optionConfig.options]
    )



    const form = useForm({
        initialValues: constructFilterInitialValue(props.optionConfig, props.initialValues)
    })

    // initial restore from localStorage and URL query params (optional)
    useEffect(() => {
        if (!rememberState || initializedRef.current) return;
        try {
            const defaults = constructFilterInitialValue(props.optionConfig, undefined);
            const lsState = getLsFs(props.tableName);
            const queryState = parseQueryToFilter(props.optionConfig);
            const merged = mergeFilterState(defaults, props.initialValues || {}, lsState, queryState);

            // set form values
            form.setValues(merged);

            // sync date range controls from merged
            setControlDateValues(
                (props.optionConfig.options.filter(x => x.type === 'dateRange') as ScFilterOptionDateRangeProps[])
                    .reduce(
                        (prev, x) => ({
                            ...prev,
                            [x.filterName[0]]: (merged?.[x.filterName[0]] || merged?.[x.filterName[1]]) ? [
                                    merged?.[x.filterName[0]] ? Time.parseDate((merged?.[x.filterName[0]] as string).substring(0, 10)) : null,
                                    merged?.[x.filterName[1]] ? Time.parseDate((merged?.[x.filterName[1]] as string).substring(0, 10)) : null
                                ] :
                                x.defaultValue || [null, null]
                        }), {}
                    )
            )

            // sync price range controls from merged
            setControlPriceValues(
                (props.optionConfig.options.filter(x => x.type === 'priceRange') as ScFilterOptionPriceRangeProps[])
                    .reduce(
                        (prev, x) => ({
                            ...prev,
                            [x.filterName[0]]: (typeof merged?.[x.filterName[0]] === "number" || typeof merged?.[x.filterName[1]] === "number") ? [
                                (merged as any)[x.filterName[0]] ?? null,
                                (merged as any)[x.filterName[1]] ?? null
                            ] : x.defaultValue || [null, null]
                        }), {}
                    )
            )

            initializedRef.current = true;
            // emit onChange with merged to kick off data load
            props.onChange && props.onChange(merged)
        } catch (e) {
            initializedRef.current = true;
        }
    }, [rememberState, props.tableName, props.optionConfig])

    // if filter has been updated from parent component, update form values; mainly important for clearing or when setting from auth config
    const skipNextParentInitRef = useRef(true)

    useEffect(() => {
        if(props.initialValues) {
            if (rememberState && initializedRef.current && skipNextParentInitRef.current) {
                // skip the very first parent-driven init to preserve LS/URL precedence
                skipNextParentInitRef.current = false;
                return;
            }
            const filtered =
            Object.entries(props.initialValues).filter(
                ([key, value], i) => (form.values.hasOwnProperty(key) && form.values[key] !== value)
            )

            // set date ranges
            if(!!props.optionConfig) {
                setControlDateValues(
                    (props.optionConfig.options.filter(x => x.type === 'dateRange') as ScFilterOptionDateRangeProps[])
                        .reduce(
                            (prev, x) => ({
                                ...prev,
                                [x.filterName[0]]: (props.initialValues?.[x.filterName[0]] || props.initialValues?.[x.filterName[1]]) ? [
                                        props.initialValues?.[x.filterName[0]] ? Time.parseDate(props.initialValues?.[x.filterName[0]].substring(0, 10)) : null,
                                        props.initialValues?.[x.filterName[1]] ? Time.parseDate(props.initialValues?.[x.filterName[1]].substring(0, 10)) : null
                                    ] :
                                    x.defaultValue || [null, null]
                            }), {}
                        )
                )

                setControlPriceValues(
                    (props.optionConfig.options.filter(x => x.type === 'priceRange') as ScFilterOptionPriceRangeProps[])
                        .reduce(
                            (prev, x) => ({
                                ...prev,
                                [x.filterName[0]]: (typeof props.initialValues?.[x.filterName[0]] === "number" || typeof props.initialValues?.[x.filterName[1]] === "number") ? [
                                    props.initialValues[x.filterName[0]] ?? null,
                                    props.initialValues[x.filterName[1]] ?? null
                                ] : x.defaultValue || [null, null]
                            }), {}
                        )
                )


            }

            if(filtered.length !== 0) {
                form.setValues(props.initialValues)
            }
        }
    }, [props.initialValues])

    // using did update to avoid overriding hidden filter or unnecessary updates when mounting
    useDidUpdate(() => {
        // ignore tabs filter value when filter changes (old state interference)
        const tabsName = props.optionConfig.options.find(x => x.type === 'tabs')?.filterName

        // restore values of filters when the filter asynchronously gets hidden - ensuring filter values are not kept active once filter is hidden
        const restoredHiddenValues = props.optionConfig.options.reduce((acc, x) => {
            if (x.hidden) {
                if (x.type === 'dateRange') {
                    acc[x.filterName[0]] = x.defaultValue && x.defaultValue[0] || null;
                    acc[x.filterName[1]] = x.defaultValue && x.defaultValue[1] || null;
                } else if (x.type === 'hidden') {
                    acc[x.filterName] = x.defaultValue;
                } else {
                    acc[x.filterName as string] = !x.type || x.type === 'multiselect' || x.type === 'tabs'
                        ? x.defaultValue || []
                        : x.type === 'switch'
                            ? x.defaultValue || false
                            : '';
                }
            }
            return acc;
        }, {...form.values});
        
        if(!tabsName) {
            // persist to localStorage if enabled
            if (rememberState && props.tableName) {
                try { setLsFs(props.tableName, restoredHiddenValues as any) } catch {}
            }
            props.onChange && props.onChange(restoredHiddenValues)
        } else {
            const newFilterVal = {...restoredHiddenValues}
            delete newFilterVal[tabsName as string]
            if (rememberState && props.tableName) {
                try { setLsFs(props.tableName, newFilterVal as any) } catch {}
            }
            props.onChange && props.onChange(newFilterVal)
            // ignored tabs filter
        }
    }, [form.values])

    const multiSelectFilters = useMemo(
        () => (props.optionConfig.options.filter(x => (!x.type || x.type === 'multiselect')) as ScFilterOptionMultiselectProps[]),
        [props.optionConfig.options]
    )

    const dateRangeFilters = useMemo(
        () => (props.optionConfig.options.filter(x => x.type === 'dateRange') as ScFilterOptionDateRangeProps[]), [props.optionConfig.options]
    )

    const switches = props.optionConfig.options
        .filter(x => x.type === 'switch' && !x.hidden).length !== 0 && <Flex gap={5} align={'start'} justify={'start'} direction={'column'}>
        {(props.optionConfig.options
            .filter(x => x.type === 'switch') as ScFilterOptionSwitchProps[])
            .map((x, i) => (
                    <Checkbox
                        size={'xs'}
                        key={'filterSwitch' + i}
                        color={'scBlue'}
                        label={x.label}
                        defaultChecked={form.values[x.filterName]}
                        checked={form.values[x.filterName]}
                        {...form.getInputProps(x.filterName)}
                        style={{
                            '.mantine-Switch-track': {
                                maxWidth: '1.8rem'
                            },
                            '.mantine-Switch-label': {
                                paddingLeft: '.5rem'
                            },
                            '.mantine-Checkbox-label': {
                                paddingLeft: '.5rem'
                            }
                        }}
                    />
                )
            )
        }

        {
            // props.additionalHintSection
        }

    </Flex>

    // no results effect
   /* useEffect(() => {
        const noFilters = !(props.optionConfig.options.filter(x => x.type === 'switch').length !== 0) &&
            !(dateRangeFilters.length !== 0) &&
            !(multiSelectFilters.filter(x => (filterOptions[x.filterName]?.length !== 1 || x.showForSingleItem && filterOptions[x.filterName]?.length !== 0)
                && (!x.hiddenWhileLoading || (filterOptions[x.filterName]?.length > 1 || x.showForSingleItem && filterOptions[x.filterName]?.length !== 0)) &&
                (!x.fieldSettingSystemName || isShown(x.fieldSettingSystemName))).length !== 0)
    }, []);*/

    return (
        <>
            {
                (
                    props.optionConfig.options.filter(x => x.type === 'switch').length !== 0 ||
                    dateRangeFilters.length !== 0 ||
                    priceRangeFilters.length !== 0 ||
                    multiSelectFilters.filter(x => (filterOptions[x.filterName]?.length !== 1 || x.showForSingleItem && filterOptions[x.filterName]?.length !== 0)
                        && (!x.hiddenWhileLoading || (filterOptions[x.filterName]?.length > 1 || x.showForSingleItem && filterOptions[x.filterName]?.length !== 0)) &&
                        (!x.fieldSettingSystemName || isShown(x.fieldSettingSystemName))).length !== 0
                ) &&
                <Flex gap={8} mt={8} wrap={'wrap'} style={{zIndex: 10}} {...props.flexProps}>
                    {multiSelectFilters.filter(x => (filterOptions[x.filterName]?.length !== 1 || x.showForSingleItem && filterOptions[x.filterName]?.length !== 0)
                        && (!x.hiddenWhileLoading || (filterOptions[x.filterName]?.length > 1 || x.showForSingleItem && filterOptions[x.filterName]?.length !== 0)) &&
                        (!x.fieldSettingSystemName || isShown(x.fieldSettingSystemName)) && !x.hidden).map(
                        (x, i) =>
                            (
                                <ScFilterMultiselect
                                    data={
                                        filterOptions[x.filterName]
                                            ?.filter(
                                                y => ((y.enabled || props.showDisabledFilterOptions) && (!x.dataOptionSiblingFilterName || form.values[x.dataOptionSiblingFilterName]?.length === 0 || form.values[x.dataOptionSiblingFilterName]?.includes(y.parentVal))) || form.values[x.filterName]?.includes(y.value)
                                            ) || []
                                    }
                                    searchPlaceholder={/*'Search ' + */x.label}
                                    formVal={/*(props.initialValues || []) as string[] */form.values[x.filterName]}
                                    onClear={() => form.setFieldValue(x.filterName, [])}
                                    isLoading={filterQueries[optionsToFetch.findIndex(o => o.filterName === x.filterName)]?.isFetching}
                                    key={props.tableName + 'filterSelect' + i}
                                    {...form.getInputProps(x.filterName)}
                                    // onChange={(newVal) => form.setFieldValue(x.filterName, newVal)}
                                    maw={/*props.singleSelectMode ? (mobileView ? '100%' : '') : */`${Math.round(1 / (multiSelectFilters.filter(x => (filterOptions[x.filterName]?.length !== 1 || x.showForSingleItem && filterOptions[x.filterName]?.length !== 0)
                                        && (!x.hiddenWhileLoading || (filterOptions[x.filterName]?.length > 1 || x.showForSingleItem && filterOptions[x.filterName]?.length !== 0)) &&
                                        (!x.fieldSettingSystemName || isShown(x.fieldSettingSystemName))).length) * 100) - 1}%`}
                                    style={{flexGrow: props.singleSelectMode ? 1 : undefined}}
                                    miw={100}
                                    filterMetaData={x}
                                    onUnassignedChange={(unassigned: boolean) => x.unassignedOption ? form.setFieldValue(x.unassignedOption, unassigned) : null}
                                    initialUnassignedValue={x.unassignedOption ? form.values[x.unassignedOption] ?? undefined : undefined}
                                    singleSelectMode={props.singleSelectMode}
                                />
                            )
                    )}

                    {/* Price Range Filters */}
                    {
                        priceRangeFilters
                            .filter(x => !x.hidden)
                            .map((filter, i) => {
                                return (
                                    <Box key={`price-range-${i}`} mb="md"
                                         style={{flexGrow: props.singleSelectMode ? 1 : undefined}}
                                    >
                                        {/*<Flex align="center" justify="space-between" mb={8}>
                                            <Box>{filter.label || filter.filterName[0]}</Box>
                                            {
                                                controlPriceValues[filter.filterName[0]] &&
                                                (controlPriceValues[filter.filterName[0]][0] !== null ||
                                                    controlPriceValues[filter.filterName[0]][1] !== null) && (
                                                    <CloseButton
                                                        onClick={() => {
                                                            // Update form values directly when clearing
                                                            form.setFieldValue(filter.filterName[0], null);
                                                            form.setFieldValue(filter.filterName[1], null);

                                                            setControlPriceValues(prev => ({
                                                                ...prev,
                                                                [filter.filterName[0]]: [null, null]
                                                            }))
                                                        }}
                                                        size="sm"
                                                    />
                                                )
                                            }
                                        </Flex>*/}
                                        <Flex gap={8}>
                                            <NumberInput
                                                step={100}
                                                style={{ flex: 1 }}
                                                min={0}
                                                max={controlPriceValues[filter.filterName[0]]?.[1] === null ? undefined : controlPriceValues[filter.filterName[0]]?.[1]}
                                                // fixedDecimalScale
                                                thousandSeparator={' '}
                                                decimalScale={2}
                                                placeholder="Min Cost"
                                                value={controlPriceValues[filter.filterName[0]]?.[0] === null ? '' : controlPriceValues[filter.filterName[0]]?.[0]}
                                                onChange={(value) => {
                                                    const min = value === '' ? null : value as number;
                                                    const max = controlPriceValues[filter.filterName[0]]?.[1] ?? null;
                                                    onPriceValueChange([min, max], filter);
                                                }}
                                                allowNegative={false}
                                                hideControls
                                                rightSection={
                                                    form.values?.[filter.filterName[0]] !== null &&
                                                    <CloseButton
                                                        onClick={() => {
                                                            // Clear values for both min and max
                                                            // form.setFieldValue(filter.filterName[0], null);
                                                            form.setFieldValue(filter.filterName[0], null);

                                                            setControlPriceValues((prev) => ({
                                                                ...prev,
                                                                [filter.filterName[0]]: [null, prev[filter.filterName[0]]?.[1] ?? null]
                                                            }));
                                                        }}
                                                        size="sm"
                                                    />
                                                }
                                                
                                            />
                                            <NumberInput
                                                step={100}
                                                style={{ flex: 1 }}
                                                min={controlPriceValues[filter.filterName[0]]?.[0] ?? 0}
                                                thousandSeparator={' '}
                                                decimalScale={2}
                                                placeholder="Max Cost"
                                                value={controlPriceValues[filter.filterName[0]]?.[1] === null ? '' : controlPriceValues[filter.filterName[0]]?.[1]}
                                                onChange={(value) => {
                                                    const min = controlPriceValues[filter.filterName[0]]?.[0] ?? null;
                                                    const max = value === '' ? null : value as number;
                                                    onPriceValueChange([min, max], filter);
                                                }}
                                                allowNegative={false}
                                                hideControls

                                                rightSection={
                                                    form.values?.[filter.filterName[1]] !== null &&
                                                    <CloseButton
                                                        onClick={() => {
                                                            // Clear values for both min and max
                                                            // form.setFieldValue(filter.filterName[0], null);
                                                            form.setFieldValue(filter.filterName[1], null);
                                                            setControlPriceValues((prev) => ({
                                                                ...prev,
                                                                [filter.filterName[0]]: [prev[filter.filterName[0]]?.[0] ?? null, null]
                                                            }));
                                                        }}
                                                        size="sm"
                                                    />
                                                }
                                            />
                                        </Flex>
                                    </Box>
                                )
                            })
                    }




                    {dateRangeFilters.map(
                        (x, i) =>
                            !x.hidden &&
                            <Box
                                key={'dateRangeFilter' + x.filterName[0] + x.filterName[1] + i}
                                maw={'100%'}
                                w={!controlDateValues[x.filterName[0]][0] && 165 || 'max-content'}
                                style={{flexGrow: props.singleSelectMode ? 1 : undefined}}
                            >
                                <DatePickerInput
                                    // label={<Text size={12}>{x.label}</Text>}
                                    placeholder={x.placeholder || `Start and End Dates`}
                                    numberOfColumns={mobileView ? 1 : 2}
                                    type={'range'}
                                    allowSingleDateInRange={true}
                                    valueFormat={'D MMM, YYYY'}
                                    rightSection={form.values[x.filterName[0]] !== null && <CloseButton
                                        // variant={'transparent'}
                                        size={'sm'}
                                        onMouseDown={() => {
                                            setControlDateValues((prev) => ({...prev, [x.filterName[0]]: [null, null]}))
                                            form.setFieldValue(x.filterName[0], null)
                                            form.setFieldValue(x.filterName[1], null)
                                        }} />}
                                    value={controlDateValues[x.filterName[0]]}
                                    onChange={(v) => onDateValueChange(v, x)}
                                    dropdownType={'popover'}
                                    popoverProps={
                                        {withinPortal: true}
                                    }/*
                                classNames={{
                                    day: dateStyles.day
                                }}*/
                                />
                            </Box>
                    )}

                    {switches}

                </Flex>
            }

        </>
    )
}

export default ScDataFilter
