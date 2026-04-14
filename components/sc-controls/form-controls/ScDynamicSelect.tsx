'use client';
import { FC, ReactNode, forwardRef, useEffect, useMemo, useState, MouseEvent } from "react";
import {
    Box,
    CloseButton,
    Combobox, ComboboxProps,
    Flex, InputBase, InputBaseProps,
    Loader, Pill,
    PillsInput,
    PillsInputProps,
    ScrollArea,
    Text,
    TextInput, TextInputProps,
    useCombobox, Button, Divider
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {IconChevronDown} from "@tabler/icons";
import {shadows} from "@/theme";
import {useDebouncedValue} from "@mantine/hooks";
import {IconPlus} from "@tabler/icons-react";

export interface DynamicSelectOption {
    // Support for either 'value' or 'ID' as unique identifier
    value?: string;
    ID?: string;
    // Support for either 'label', 'Name', or 'Description' as display text
    label?: string;
    Name?: string;
    Description?: string;
    enabled?: boolean;
    required?: boolean;
    // Additional option properties can go here
    
}

export interface DynamicSelectProps<T extends DynamicSelectOption> extends Partial<Omit<ComboboxProps, 'children'>> {
    /** Unique key for caching and query purposes */
    queryKey: string | any[];

    /** Current selected value(s) */
    value: string | string[];

    /** Label for the input field */
    label?: React.ReactNode;

    /** Custom render function for option items */
    renderOption?: FC<{ option: T }>;

    /** Custom render function for selected value(s) */
    renderValue?: FC<{ value: T; onRemove: () => void }>;

    /** Whether the select allows multiple selections */
    multiSelect?: boolean;

    /** Function to fetch options - works with Tanstack useQuery */
    queryFn: (search: string) => Promise<any[]>;

    /** Placeholder for the search input */
    placeholder?: string;

    /** Called when selection changes */
    onChange: (values: string | string[], selectedItem?: any) => void;

    /** Additional props to pass to PillsInput */
    pillsInputProps?: Omit<PillsInputProps, 'children'>;

    /** Additional props to pass to InputBase (for single select mode) */
    textInputProps?: Omit<TextInputProps, 'value' | 'onChange'>;

    /** Debounce time for search in milliseconds */
    debounceTime?: number;

    /** Property to use as the option ID (defaults to "ID" or "value") */
    idProp?: string;

    /** Property to use as the display label (defaults to "Name", "Description", "label", or ID) */
    labelProp?: string;

    /** Automatically select the item if there's only one option available - also has effect of canBeEmpty */
    autoselect1Item?: boolean;

    /** Whether single select can be emptied (defaults to true) */
    canBeEmpty?: boolean;

    /** Ids to be excluded, filtered out locally and added to query payload as excludeIdList */
    excludedIds?: string[];
    
    /** Show a create button at the top of the dropdown */
    showCreateButton?: boolean;

    /** Text to display on the create button */
    createButtonText?: string;

    /** Callback function when create button is clicked */
    onCreateClick?: () => void;

    /** display validation errors */
    error?: string;

    required?: boolean;
}

// Helper function to get the ID value from an option
const getOptionId = (option: DynamicSelectOption, idProp?: string): string => {
    if (idProp && option[idProp] !== undefined) {
        return String(option[idProp]);
    }
    return String(option.ID || option.value || '');
};

// Helper function to get the display text from an option
const getOptionLabel = (option: DynamicSelectOption, labelProp?: string): string => {
    if (labelProp && option[labelProp] !== undefined) {
        return String(option[labelProp]);
    }
    return String(option.Name || option.Description || option.label || getOptionId(option));
};

// Default item renderer
const DefaultOption = forwardRef<HTMLDivElement, { option: DynamicSelectOption; labelProp?: string }>(
    ({ option, labelProp, ...others }, ref) => {
        return (
            <Box ref={ref} {...others}>
                <Flex align="center" gap={5}>
                    <Text size={'sm'}>
                        {getOptionLabel(option, labelProp)}
                    </Text>
                </Flex>
            </Box>
        );
    }
);

DefaultOption.displayName = 'DefaultOption';

// Default value renderer
const DefaultValue: FC<{
    value: DynamicSelectOption;
    onRemove: () => void;
    labelProp?: string;
}> = ({ value, onRemove, labelProp }) => {
    return (
        <Flex align="center" gap={5} style={{ padding: '2px 6px' }}>
            <Text size="sm">{getOptionLabel(value, labelProp)}</Text>
            <CloseButton
                onMouseDown={onRemove}
                variant="transparent"
                size={22}
                iconSize={14}
                tabIndex={-1}
            />
        </Flex>
    );
};

export default function ScDynamicSelect<T extends DynamicSelectOption>({
                                                                           queryKey,
                                                                           value,
                                                                           label,
                                                                           renderOption,
                                                                           renderValue,
                                                                           multiSelect = false,
                                                                           queryFn,
                                                                           placeholder = "Search...",
                                                                           onChange,
                                                                           pillsInputProps,
                                                                           textInputProps,
                                                                           debounceTime = 300,
                                                                           idProp,
                                                                           labelProp,
                                                                           autoselect1Item = false,
                                                                           canBeEmpty = true,
                                                                           excludedIds = [],
                                                                           showCreateButton = false,
                                                                           createButtonText = "Create New",
                                                                           onCreateClick,
                                                                           required,
                                                                           ...comboboxProps
                                                                       }: DynamicSelectProps<T>) {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const combobox = useCombobox({
        onOpenedChange: setDropdownOpen,
        onDropdownClose: () => {
            combobox.resetSelectedOption();
            setIsSearching(false); // Reset searching state when dropdown closes
            
            if (!multiSelect) {
                // For single select, restore the selected value's display text when closing
                const selectedOption = options.find(option =>
                    getOptionId(option, idProp) === (Array.isArray(value) ? value[0] : value));
                if (selectedOption) {
                    setSearch(getOptionLabel(selectedOption, labelProp));
                } else {
                    setSearch('');
                }
            } else {
                setSearch('');
            }
        },
        onDropdownOpen: () => {
            // Don't clear the search value initially, just set searching state to false
            // This way the display text remains but it doesn't filter the options
            setIsSearching(false);
        }
    });

    const [search, setSearch] = useState('');

    const [debouncedSearch] = useDebouncedValue(search, debounceTime || 300);

    /*const [debouncedSearch, setDebouncedSearch] = useState('');

    // Handle debouncing of search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, debounceTime);

        return () => {
            clearTimeout(handler);
        };
    }, [search, debounceTime]);*/
    
    const [firstDataLength, setFirstDataLength] = useState(0);

    const { data: options = [], isLoading, refetch } = useQuery({
        queryKey: [queryKey, isSearching ? debouncedSearch : ''],
        queryFn: () => queryFn(isSearching ? debouncedSearch : ''),
        staleTime: Infinity
    });

    // Update first data length when query data changes
    useEffect(() => {
        if (options && !firstDataLength) {
            setFirstDataLength(options.length);
        }
    }, [options])

    // self-restoration to find items that was added after data was queried
    useEffect(() => {
        if(value && options && !options.some(x => getOptionId(x, idProp) === value)) {
            refetch();
        }
    }, [value, options]);


    // Filter out options that are in the excludedIds list
    const filteredOptions = useMemo(() => {
        if (!excludedIds || excludedIds.length === 0) {
            return options;
        }
        return options.filter(option => {
            const optionId = getOptionId(option, idProp);
            return !excludedIds.includes(optionId);
        });
    }, [options, excludedIds, idProp]);

    // Convert value to array for internal use
    const selectedValues = useMemo(() => {
        return Array.isArray(value) ? value : value ? [value] : [];
    }, [value]);

    // Find selected options based on value
    const selectedOptions = useMemo(() => {
        return options.filter(option =>
            selectedValues.includes(getOptionId(option, idProp)));
    }, [options, selectedValues, idProp]);

    // Set initial search value for single select when options load or value changes
    useEffect(() => {
        if (!multiSelect && options.length > 0) {
            const selectedOption = options.find(option =>
                getOptionId(option, idProp) === (Array.isArray(value) ? value[0] : value));
            if (selectedOption && !combobox.dropdownOpened) {
                setSearch(getOptionLabel(selectedOption, labelProp));
            }
        }
    }, [options, value, multiSelect, idProp, labelProp, combobox.dropdownOpened]);



    // Handle selection of an option
    const handleOptionSelect = (optionValue: string) => {
        const option = options.find(opt => getOptionId(opt, idProp) === optionValue);
        // if (!option || option.enabled === false) return;

        if (multiSelect) {
            const newValues = selectedValues.includes(optionValue)
                ? selectedValues.filter(val => val !== optionValue)
                : [...selectedValues, optionValue];
            onChange(newValues, option);
        } else {
            onChange(optionValue, option);
            setSearch(getOptionLabel(option, labelProp));
            combobox.closeDropdown();
        }
    };

    // Automatically select the item if there is only one item
    useEffect(() => {
        if (autoselect1Item && firstDataLength === 1/* && (!value || value.length === 0)*/) {
            handleOptionSelect(options[0]?.ID || options[0]?.value);
        }
    }, [firstDataLength, autoselect1Item /*value, multiSelect*/]);

    // Handle removing a selected option
    const handleValueRemove = (valueToRemove: string) => {
        if (multiSelect) {
            onChange(selectedValues.filter(val => val !== valueToRemove));
        } else {
            onChange('');
            setSearch('');
        }
    };

    // Handle clearing value for single select mode
    const handleClear = (event: MouseEvent) => {
        event.stopPropagation();
        onChange(multiSelect ? [] : '');
        setSearch('');
        combobox.closeDropdown();
    };

    // Custom option renderer with label prop support
    const OptionComponent = renderOption ||
        (props => <DefaultOption {...props} labelProp={labelProp} />);

    // Custom value renderer with label prop support
    const ValueComponent = renderValue ||
        (props => <DefaultValue {...props} labelProp={labelProp} />);

    // Determine the right section content for single select
    const singleSelectRightSection = isLoading ? (
        <Loader size="xs" />
    ) : (
        !(autoselect1Item && firstDataLength === 1) && canBeEmpty && (search || (value && !Array.isArray(value) && value)) && !comboboxProps.disabled ? (
            <CloseButton
                onClick={handleClear}
                aria-label="Clear value"
                size="sm"
                iconSize={14}
            />
        ) : (
            <IconChevronDown
                             size={`1.3em`}
                             style={{
                                 transform: `rotate(${dropdownOpen ? '-180deg' : '0deg'})`,
                                 transition: '40ms ease-in-out',
                                 color: 'var(--mantine-color-gray-7)'
                             }}
            />
        )
    );

    const handleSearchChange = (event) => {
        const value = event.currentTarget.value;
        
        // Only set isSearching to true if user is actively modifying the search
        // (prevents it from triggering when dropdown opens)
        if (value !== search) {
            setIsSearching(true);
        }
        
        setSearch(value);
        combobox.updateSelectedOptionIndex();
    };

    return (
        <Box>
            <Combobox
                shadow={'md'}
                store={combobox}
                onOptionSubmit={handleOptionSelect}
                withinPortal={comboboxProps.withinPortal ?? true}
                {...comboboxProps}
            >
                {multiSelect ? (
                    // MultiSelect mode - use PillsInput
                    <Combobox.Target>
                        <PillsInput
                            label={label}
                            withAsterisk={required}
                            onClick={() => combobox.openDropdown()}
                            rightSection={isLoading ? <Loader size="xs" /> : null}
                            {...pillsInputProps}
                        >
                            <Flex gap={8} wrap="wrap">
                                {selectedOptions.map(option => (
                                    <Pill key={getOptionId(option, idProp)}>
                                        <ValueComponent
                                            value={option as T}
                                            onRemove={() => handleValueRemove(getOptionId(option, idProp))}
                                        />
                                    </Pill>
                                ))}
                                <Combobox.EventsTarget>
                                    <PillsInput.Field
                                        placeholder={selectedValues.length > 0 ? '' : placeholder}
                                        value={search}
                                        onChange={(e) => setSearch(e.currentTarget.value)}
                                        onFocus={() => combobox.openDropdown()}
                                        onBlur={() => combobox.closeDropdown()}
                                    />
                                </Combobox.EventsTarget>
                            </Flex>
                        </PillsInput>
                    </Combobox.Target>
                ) : (
                    // Single Select mode - use InputBase
                    <Combobox.Target>
                        <TextInput
                            label={label}
                            rightSection={singleSelectRightSection}
                            withAsterisk={required}
                            value={search}
                            onChange={handleSearchChange}
                            onClick={() => combobox.openDropdown()}
                            onFocus={() => combobox.openDropdown()}
                            onBlur={() => combobox.closeDropdown()}
                            placeholder={placeholder}
                            rightSectionPointerEvents="all"
                            disabled={comboboxProps.disabled}
                            {...textInputProps}
                        />
                        {/*<InputBase
                            label={label}
                            rightSection={singleSelectRightSection}
                            value={search}
                            onChange={(event) => {
                                combobox.openDropdown();
                                setSearch(event.currentTarget.value);
                                combobox.updateSelectedOptionIndex();
                            }}
                            onClick={() => combobox.openDropdown()}
                            onFocus={() => combobox.openDropdown()}
                            placeholder={placeholder}
                            rightSectionPointerEvents="all"
                            {...inputBaseProps}
                        />*/}
                    </Combobox.Target>
                )}

                <Combobox.Dropdown
                    style={{ boxShadow: shadows.combobox }}
                >
                    <Combobox.Options>
                        <ScrollArea.Autosize mah={200}>
                            {filteredOptions.length === 0 ? (
                                <Combobox.Empty>No options found</Combobox.Empty>
                            ) : (
                                filteredOptions.map((option) => (
                                    <Combobox.Option
                                        value={getOptionId(option, idProp)}
                                        key={getOptionId(option, idProp)}
                                        disabled={option.enabled === false}
                                        selected={selectedValues.includes(getOptionId(option, idProp))}
                                    >
                                        <OptionComponent option={option as T} />
                                    </Combobox.Option>
                                ))
                            )}
                        </ScrollArea.Autosize>
                    </Combobox.Options>

                    {showCreateButton && (
                        <>
                            <Divider mt={5} />
                            <Button
                                mt={5}
                                size={'compact-sm'}
                                variant="subtle"
                                color="dark.4"
                                fullWidth
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    combobox.closeDropdown();
                                    if (onCreateClick) onCreateClick();
                                }}
                                rightSection={<IconPlus size={15} />}
                            >
                                {createButtonText}
                            </Button>
                        </>
                    )}
                </Combobox.Dropdown>
            </Combobox>
        </Box>
    );
}