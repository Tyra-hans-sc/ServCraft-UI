import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { filterBy } from '@progress/kendo-data-query';
import SCHint from './sc-hint';
import {
    Box,
    CloseButton,
    Combobox,
    Group,
    Pill,
    PillsInput,
    ScrollArea,
    useCombobox,
    Text, PillsInputProps
} from '@mantine/core';
import { ItemPropsMantine, SCMultiselectInputProps } from './sc-control-interfaces/sc-multiselect-interfaces';
import { shadows } from '@/theme';

const useLegacy = false;

interface MultiSelectStateObject {
    data: any[];
    skip: number;
    total: number;
}

function SCMultiSelect(inputProps: SCMultiselectInputProps & PillsInputProps) {

    const {
        name, availableOptions, selectedOptions, textField, dataItemKey, onChange, placeholder, label, hint, error,
        required = false, disabled = false, extraClasses, itemRender = null, valueRender = null,
        itemRenderMantine = (item) => <>{item.label}</>,
        valueRenderMantine = (item) => <>{item.label}</>,
        groupField, mt = 'var(--mantine-spacing-sm)',
        readonlyValues = [],
        ...pillInputProps
    } = inputProps;

    const [disabledLocal, setDisabledLocal] = useState(false);
    const [dropdownOpenMantine, setDropdownOpenMantine] = useState<boolean>(false);

    useEffect(() => {
        setDisabledLocal(disabled);
    }, [disabled]);

    const [filteredOptions, setFilteredOptions] = useState<any>([]);
    let pageSize = 10;

    const initialMultiSelectState = {
        data: [],
        total: 0,
        skip: 0,
    };

    const [multiSelectState, setMultiSelectState] = useState<MultiSelectStateObject>(initialMultiSelectState);

    useEffect(() => {
        if (availableOptions) {
            setFilteredOptions(availableOptions);
            setMultiSelectState({
                ...multiSelectState,
                data: availableOptions.slice(0, 10),
                total: availableOptions.length
            });
        }
    }, [availableOptions]);

    const handleChange = (e) => {
        const value = e.target.value;
        onChange && onChange(value);
    };

    const handleChangeMantine = (e: any[]) => {
        const opts = e.map(val => {
            let found = availableOptions?.find(x => (dataItemKey && x[dataItemKey ?? ""] === val) || (!dataItemKey && x === val));
            if (!found && Array.isArray(selectedOptions)) {
                found = selectedOptions.find(x => x && ((dataItemKey && x[dataItemKey ?? ""] === val) || (!dataItemKey && x === val)));
            }

            if (!found) {
                console.warn(`SCMultiSelect: value "${val}" not found in options`);
            }
            return found;
        });
        onChange && onChange(opts.filter(x => x !== undefined));
    };

    const onFilterChange = (event) => {
        let filter = event.filter;
        let filteredData = filterBy((availableOptions ?? []).slice(), filter);
        setFilteredOptions(filteredData);

        const data = filteredData.slice(0, pageSize);
        setMultiSelectState({ data: data, skip: 0, total: filteredData.length });
    };

    const pageChange = (event) => {
        const skip = event.page.skip;
        const take = event.page.take;

        const data = filteredOptions.slice(skip, skip + take);
        setMultiSelectState({ ...multiSelectState, data: data, skip: skip });
    };

    const getPopupHeight = () => {
        let height = 200;

        if (availableOptions) {
            let numberOptions = availableOptions.length;
            if (numberOptions <= 5) {
                height = numberOptions * 40;
            }
        }

        return `${height}px`;
    };

    const renders = itemRender && valueRender ? {
        itemRender: itemRender,
        valueRender: valueRender
    } : itemRender ? {
        itemRender: itemRender
    } : valueRender ? {
        valueRender: valueRender
    } : {};


    const mapLocalOptionsMantine = (options: any[] | undefined = availableOptions): ItemPropsMantine[] => {
        if (!options && !availableOptions && Array.isArray(selectedOptions)) {
            options = selectedOptions;
        }
        const opts: ItemPropsMantine[] = Array.isArray(options) ? options.map(opt => {
            if (dataItemKey && textField) {
                return opt ? {
                    value: opt[dataItemKey] ? opt[dataItemKey] : null,
                    label: opt[textField] ? opt[textField] : "",
                    dataItem: opt,
                    group: groupField ? opt[groupField] : undefined
                } :
                    {
                        value: null,
                        label: "",
                        dataItem: {},
                        group: (groupField && opt) ? opt[groupField] : undefined
                    };
            }
            return {
                value: opt,
                label: opt,
                dataItem: {},
                group: undefined
            };
        }) : [];

        return opts;
    };

    const mapSelectedOptionsMantine = (): any[] => {
        const opts: any[] = Array.isArray(selectedOptions) ? mapLocalOptionsMantine(selectedOptions).map(opt => {
            return opt.value;
        }) : [];

        return opts;
    };


    function valueItemMantine({
        value,
        label,
        onRemove,
        classNames,
        dataItem,
        ...others
    }: any & { value: string } & { dataItem: any }) {
        return (
            <div {...others}>
                <Box
                    style={(theme) => ({
                        display: 'flex',
                        cursor: 'default',
                        alignItems: 'center',
                        backgroundColor: theme.white,
                        border: `1px solid ${theme.colors.gray[4]}`,
                        paddingLeft: "0.3rem",
                        paddingTop: "0.1rem",
                        paddingBottom: "0.1rem",
                        borderRadius: 4,
                        fontSize: "0.8rem"
                    })}
                >
                    {valueRenderMantine({ value, label, dataItem })}
                    <CloseButton
                        onMouseDown={onRemove}
                        variant="transparent"
                        size={22}
                        iconSize={14}
                        tabIndex={-1}
                    />
                </Box>
            </div>
        );
    }

    /*const selectItemMantine = forwardRef<HTMLDivElement, ItemPropsMantine>(
        ({value, label, dataItem, ...others}: ItemPropsMantine, ref) => (
            <div ref={ref} {...others}>
                <Group wrap={'nowrap'}>
                    <div>
                        {itemRenderMantine({value, label, dataItem})}
                    </div>
                </Group>
            </div>
        )
    );
*/
    const onDropdownOpenMantine = () => {
        setDropdownOpenMantine(true);
    };

    const onDropdownCloseMantine = () => {
        setDropdownOpenMantine(false);
    };

    const rightSectionMantine = (): ReactNode => {
        return <div style={{ display: "flex", position: "absolute" }}
            onClick={() => pillsInputFieldRef.current?.focus()}
        >
            <div style={{ paddingTop: "6px" }}>

                <span style={{ pointerEvents: "none" }}>
                    {dropdownOpenMantine ?
                        <img src="/specno-icons/chevron_up.svg" style={{ pointerEvents: "none" }} />
                        :
                        <img src="/specno-icons/chevron_down.svg" style={{ pointerEvents: "none" }} />
                    }
                </span>
            </div>


            <style jsx>{`
              :global(.mantine-MultiSelect-rightSection) {
                width: 0px;
                right: 16px;
              }
            `}</style>
        </div>;
    }

    const combobox = useCombobox({
        onDropdownClose: () => {
            combobox.resetSelectedOption();
            onDropdownCloseMantine();
        },
        onDropdownOpen: () => {
            combobox.updateSelectedOptionIndex('active');
            onDropdownOpenMantine();
        },
    });

    const [search, setSearch] = useState('');
    const [value, setValue] = useState<string[]>([]);

    useEffect(() => {

    }, [search]);

    const handleValueSelect = (val: string) => {
        // console.log(val)
        handleChangeMantine([...mapSelectedOptionsMantine(), val])
        setSearch('')
        /*setValue((current) => {
                const newVal = current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
                onChange(newVal)
                return newVal
            }
        );*/
    }

    const pillsInputFieldRef = useRef<HTMLInputElement>(null)

    const handleValueRemove = (val: string) => {
        /*setValue((current) => {
                const newVal = current.filter((v) => v !== val)
                onChange(newVal)
                return newVal
            }
        );*/
    }

    const handleClear = () => {
        /*setValue([])
        onChange([])*/
    }

    const localOptionsMantine = mapLocalOptionsMantine();

    const values = mapSelectedOptionsMantine().map(val => {
        const fromAvailable = localOptionsMantine.find(x => x.value === val);
        if (fromAvailable) return fromAvailable;

        const fromSelected = Array.isArray(selectedOptions) ? selectedOptions.find(x => x && ((dataItemKey && x[dataItemKey] === val) || (!dataItemKey && x === val))) : null;
        if (fromSelected && typeof fromSelected === 'object') {
            return mapLocalOptionsMantine([fromSelected])[0];
        }

        return { value: val, label: val, dataItem: fromSelected || {} };
    }).map(({
            value,
            label,
            dataItem,
        }, i) => {
            let isReadonly = readonlyValues?.includes(value) === true;
            return (
                <Box
                    key={label + i}
                    maw={450}
                    onClick={(e) => pillsInputFieldRef.current?.disabled && e.stopPropagation()}
                    style={{
                        display: 'flex',
                        cursor: 'default',
                        alignItems: 'center',
                        backgroundColor: pillsInputFieldRef.current?.disabled ? 'var(--mantine-color-white)' : 'var(--mantine-color-gray-0)',
                        border: `1px solid ${pillsInputFieldRef.current?.disabled ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-4)'}`,
                        paddingLeft: "0.3rem",
                        paddingTop: "0.1rem",
                        paddingBottom: "0.1rem",
                        borderRadius: 4,
                        fontSize: "0.8rem",
                        // pointerEvents: pillsInputFieldRef.current?.disabled ? 'none' : 'all'
                    }}
                >
                    <Text
                        lineClamp={2}
                        truncate={'end'}
                        size={'sm'}
                    >
                        {valueRenderMantine({ value, label, dataItem })}
                    </Text>

                    <CloseButton
                        disabled={isReadonly || pillsInputFieldRef.current?.disabled}
                        onClick={() => {
                            handleChangeMantine(mapSelectedOptionsMantine().filter(x => x !== value))
                        }}
                        variant="transparent"
                        size={22}
                        iconSize={14}
                        tabIndex={-1}
                        opacity={isReadonly ? 0 : 1}
                    />


                </Box>
            );
        });

    // console.log('local options', mapLocalOptionsMantine())

    const selectOptions = mapLocalOptionsMantine()
        .filter(({ value, label }) => !mapSelectedOptionsMantine().includes(value) && (label.toLowerCase().trim().includes(search.toLowerCase()) || value.toLowerCase().trim().includes(search.toLowerCase())))
        .map(({
            value, label, dataItem
        }) => (
            <Combobox.Option value={value} key={value}>
                <Group wrap={'nowrap'}>
                    <div>
                        {itemRenderMantine({ value, label, dataItem })}
                    </div>
                </Group>
            </Combobox.Option>
        ));

    useEffect(() => {
        // we need to wait for options to render before we can select first one
        if (!!search) { // select second option if add option is shown
            combobox.selectOption(mapLocalOptionsMantine().findIndex(x => x.label.trim().toLowerCase().includes(search.trim().toLowerCase())));
        } else { // default
            combobox.resetSelectedOption()
        }
    }, [search]);

    return (
        <div className={`multiselect-container ${extraClasses ?? ''}`}>
            {
                <Combobox store={combobox}
                    onOptionSubmit={handleValueSelect}
                    shadow={'sm'}
                    withinPortal
                >
                    <Combobox.DropdownTarget>
                        <PillsInput
                            mt={mt}
                            onClick={() => !disabledLocal && combobox.openDropdown()}
                            rightSection={rightSectionMantine()}
                            // onChange={console.log}
                            label={label}
                            required={required}
                            disabled={disabledLocal}
                            error={error}
                            {...pillInputProps}
                        // maw={`${Math.round(1 / (multiSelectFilters.length) * 100)}%`}
                        >
                            <Pill.Group>
                                {values}
                                <Combobox.EventsTarget>
                                    <PillsInput.Field
                                        ref={pillsInputFieldRef}
                                        onFocus={() => combobox.openDropdown()}
                                        onBlur={() => combobox.closeDropdown()}
                                        value={search}
                                        placeholder={placeholder}
                                        onChange={(event) => {
                                            combobox.updateSelectedOptionIndex();
                                            setSearch(event.currentTarget.value);
                                        }}
                                        onKeyDown={(event) => {
                                            const temp = mapSelectedOptionsMantine()
                                            if (event.key === 'Backspace' && search.length === 0 && temp.length !== 0) {
                                                event.preventDefault();

                                                let idx = temp.length - 1;
                                                while (idx >= 0 && Array.isArray(readonlyValues) && readonlyValues.includes(temp[idx])) {
                                                    idx--;
                                                }

                                                if (idx < 0) return;
                                                temp.splice(idx, 1);
                                                // temp.length = temp.length - 1
                                                handleChangeMantine(temp)
                                            }
                                        }}
                                    />
                                </Combobox.EventsTarget>
                            </Pill.Group>
                        </PillsInput>
                    </Combobox.DropdownTarget>

                    <Combobox.Dropdown style={{ boxShadow: shadows.combobox }}>
                        <Combobox.Options>
                            {selectOptions.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> :
                                <ScrollArea.Autosize
                                    type="auto"
                                    mah={{ md: 300 }}
                                >
                                    {selectOptions}
                                </ScrollArea.Autosize>
                            }
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
                /*<MultiSelect
                    mt={mt} ✔
                    data={mapLocalOptionsMantine()} ✔
                    value={mapSelectedOptionsMantine()} ✔
                    label={label} ✔
                    required={required} ✔
                    disabled={disabledLocal} ✔
                    onChange={handleChangeMantine}
                    error={error} ✔
                    searchable ✔
                    // valueComponent={valueItemMantine}
                    // itemComponent={selectItemMantine}
                    comboboxProps={{
                        withinPortal: true,
                    }} ✔
                    rightSection={rightSectionMantine()} ✔
                    onDropdownOpen={onDropdownOpenMantine} ✔
                    onDropdownClose={onDropdownCloseMantine} ✔
                    placeholder={placeholder} ✔
                />*/
            }
            {hint && !error ?
                <SCHint value={hint} /> : ''
            }

            <style jsx>{`
              ${useLegacy ? `
                .multiselect-container {
                    margin-top: 0.25rem;
                }` : ""}
              .no-margin {
                margin-top: 0;
              }

              .width-override {
                width: 300px;
              }
            `}</style>
        </div>
    );
}

export default SCMultiSelect;
