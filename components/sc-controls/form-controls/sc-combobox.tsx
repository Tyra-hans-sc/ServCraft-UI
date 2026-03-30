'use client'

import React, { useState, useEffect, useRef, useCallback, forwardRef, ReactNode, useMemo, ChangeEvent } from 'react';
import NoSSR from "../../../utils/no-ssr";
import { colors, layout, shadows } from '../../../theme';
import { useOutsideClick } from 'rooks';
import useWindowSize from "../../../hooks/useWindowSize";
import SCHint from './sc-hint';
import Helper from '../../../utils/helper';
import { ScComboboxInputProps, ItemPropsMantine } from './sc-control-interfaces/sc-combobox-interfaces';
import { CloseButton, Combobox, Group, ScrollArea, Select, TextInput, useCombobox } from '@mantine/core';
import useInitialTimeout from '@/hooks/useInitialTimeout';

import styles from './inputStyles.module.css'
import useDebouncedCallback from "@restart/hooks/useDebouncedCallback";
import { useDidUpdate, useMediaQuery } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";

const useLegacy = false;
const mantineAddNewKey = "|||||Add New|||||";

function SCComboBox(inputProps: ScComboboxInputProps) {

    const { name, value, textField, dataItemKey, getOptions, options, label, hint,
        required = false, disabled = false, triggerRefresh, cascadeDependency, addOption,
        error, onChange, onChangeAcceptance, extraClasses, pageSize = 20, cypress, itemRender = null, valueRender = null,
        canClear = true, canSearch = true, resetValue, filter = undefined,
        itemRenderMantine = (item: any) => <>{item.label}</>,
        iconMantine, filterFunction, placeholder, groupField, hideSelected = false,
        onBlur, autoFocus = false, title
        , w, style, suppressInternalValueChange = false,
        forceBlurOnChange = false, readOnly = false, hoverLabelMode = false, mt = 'sm', hasNullKey,
        size = 'sm', hideDataItemKeys = false, dataItemKeyAsValue = false, cascadeDependencyKey,
        disableIDs, mantineComboboxProps
    } = inputProps;

    const mobileView = useMediaQuery('(max-width: 800px)')

    const [val, setVal] = useState<any>(value);
    const selectRef = useRef<HTMLInputElement>(null);
    const previousFilterValue = useRef<string | null>(null);
    const [dropdownOpenMantine, setDropdownOpenMantine] = useState<boolean>(false);
    const initialDebounce = useRef<any>(null);

    const initialTimeout = useInitialTimeout(500);

    useEffect(() => {
        setVal(value);
        setOpened(false);

        if (!value) {
            setSearchVal("");
            onFilterChangeMantine("");
        }
    }, [value, resetValue]);

    useEffect(() => {
        if (forceBlurOnChange && value && selectRef.current) {
            selectRef.current.blur()
        }
    }, [value, selectRef])

    const canCreateMantine = () => !!addOption && !disabled;

    const mapLabelMantine = () => {
        let valTemp = val;
        if (textField && val !== null && val !== undefined && val[textField] !== undefined) {
            valTemp = val[textField];
        }

        if (valTemp === null || valTemp === undefined) {
            return null;
        }

        return valTemp;
    };

    const triggerRefreshOriginal = useRef<any>(triggerRefresh);
    const cascadeDependencyOriginal = useRef<any>(cascadeDependency);

    const dataCaching = useRef<any[]>([]);

    const delay = 500;
    const [loading, setLoading] = useState<boolean>(false);
    const timeout = useRef<any>();

    //const [localOptions, setLocalOptions] = useState<any[]>([]);
    const [localOptions, setLocalOptions] = useState<any[]>([]);

    const [totalOptions, setTotalOptions] = useState(options ? options.length : 0);
    // const [filter, setFilter] = useState('');
    const filterRef = useRef('');

    const searchInputRef = useRef<HTMLInputElement>(null);

    const ref = useRef<HTMLDivElement>(null);
    const [opened, setOpened] = useState(false);
    const overRef = useRef(false);
    // const showMoreRef = useRef(false);

    useOutsideClick(ref, () => {
        // if (showMoreRef.current) {
        //     showMoreRef.current = false;
        // }
        // else 
        if (opened) {
            setOpened(false);
        }
    });

    // const [showing, setShowing] = useState(pageSize);
    const pageIndexRef = useRef(0);

    const showMore = async () => {
        //setOpened(true);
        // showMoreRef.current = true;
        // let temp = showing * 2;
        // setShowing(temp);

        if (getLocalOptions().length === totalOptions && totalOptions > 0) {
            return;
        }

        pageIndexRef.current++;

        try {
            await requestData(pageIndexRef.current, pageSize, filterRef.current);
        }
        catch (e) {
            console.log(e);
        }
        setOpened(true);
    };

    const resetCache = (caller) => {

        if (!initialTimeout) {
            return;
        }

        dataCaching.current = [];
        // setShowing(pageSize);
    };




    const requestData = async (skipIndex, take, filter) => {

        clearTimeout(initialDebounce.current);
        initialDebounce.current = setTimeout(() => {

            // console.log(name + " request data begin");
            setLoading(true);

            // console.log(name + " 1");

            if (Helper.isFunction(getOptions) && !disabled || inputProps.forceFetch) {

                // console.log(name + " 2");

                // console.log(name + " 3");
                getOptions && getOptions(skipIndex, take, filter).then((response) => {
                    // console.log(name + " 4", response.data);
                    let data = response.data;
                    let total = response.total;

                    data.forEach((element, index) => {
                        if (!dataCaching.current.some(x => x.ID === element.ID)) {
                            dataCaching.current.push(element);
                        }
                    });

                    if (!!filterFunction) {
                        dataCaching.current = dataCaching.current.filter(item => filterFunction(filterRef.current, item));
                    }

                    // console.log(name + " 5", dataCaching.current);
                    setLocalOptions(dataCaching.current);
                    setTotalOptions(total);

                    setLoading(false);
                    // console.log(name + " 6");


                }, err => {
                    console.log("getOptions err", err);
                    if (skipIndex === 0) {
                        setLocalOptions([]);
                        setTotalOptions(0);
                    }
                });
            } else {
                // console.log(name + " 7");
                if (Array.isArray(options)) {
                    // console.log(name + " 8");
                    let filteredData: any[] = [];

                    if (!Helper.isNullOrWhitespace(filter)) {
                        if (textField) {
                            filteredData = options.filter(x => {
                                return safeLowerCase(x[textField]).includes(safeLowerCase(filter));
                            });
                        } else {
                            filteredData = options.filter(x => {
                                return safeLowerCase(x).includes(safeLowerCase(filter));
                            });
                        }
                    } else {
                        filteredData = options;
                    }
                    // console.log(name + " 9");
                    setLocalOptions(filteredData);
                    setLoading(false);
                    // console.log(name + " 10");
                }
            }

        }, 50);


    };

    const safeLowerCase = (text: string | undefined): string => {
        let textProcessed = text ?? "";
        return textProcessed.toLowerCase();
    };

    useEffect(() => {
        // console.log(name + " []");
        if (getOptions) {
            // console.log(name + " [] getting options " + cascadeDependency?.ID);
            pageIndexRef.current = 0;
            requestData(pageIndexRef.current, pageSize, filterRef.current);
        }

        return () => {
            resetCache("[]:208");
        };
    }, []);

    useEffect(() => {
        // console.log(name + " [disabled]");
        if (getOptions) {
            // console.log(name + " [disabled] " + cascadeDependency?.ID);
            requestData(pageIndexRef.current, pageSize, filterRef.current);
        }

        return () => {
            resetCache("[disabled]:220");
        };
    }, [disabled]);

    useEffect(() => {
        // console.log(name + " [options]");
        if (Array.isArray(options)) {
            // console.log(name + " [options] " + options?.length);
            pageIndexRef.current = 0;
            requestData(pageIndexRef.current, pageSize, filterRef.current);
        }

        return () => {
            resetCache("[options]:233");
        };
    }, [options]);

    useEffect(() => {
        if (triggerRefreshOriginal.current === triggerRefresh) return;

        triggerRefreshOriginal.current = triggerRefresh;

        pageIndexRef.current = 0;
        requestData(pageIndexRef.current, pageSize, filterRef.current);

        return () => {
            resetCache("[triggerRefresh]:246");
        };
    }, [triggerRefresh]);

    useDidUpdate(() => {
        if (cascadeDependencyOriginal.current === cascadeDependency || !initialTimeout) {
            return;
        } else {

            cascadeDependencyOriginal.current = cascadeDependency;
            // console.log(name + " [cascadeDependency] " + cascadeDependency?.ID);

            /*onChange && onChange(null);
            setVal(null);*/
            // causing issues when setting controlled values

            if (!!cascadeDependencyKey && value) {
                if (value[cascadeDependencyKey] === cascadeDependency) {
                    return;
                }
            }

            handleChangeMantine(null)

            pageIndexRef.current = 0;

            requestData(pageIndexRef.current, pageSize, filterRef.current);

            return () => {
                resetCache("[cascadeDependency]:262");
            };
        }

    }, [cascadeDependency]);

    const onFilterChangeKendo = (event) => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            filterRef.current = event.filter.value;
            resetCache("onFilterChangeKendo:270");
            pageIndexRef.current = 0;
            requestData(pageIndexRef.current, pageSize, filterRef.current);
        }, delay);
        setLoading(true);
    };

    const compareStringsSafely = (a: string | null | undefined, b: string | null | undefined): boolean => {

        let aTemp = a ? a : "";
        let bTemp = b ? b : "";

        return a === b;
    }

    const onFilterChangeMantine = (event: string) => {


        if (compareStringsSafely(previousFilterValue.current, event)) {
            return;
        }

        previousFilterValue.current = event;

        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            filterRef.current = event;
            resetCache("onFilterChangeMantine:298");
            pageIndexRef.current = 0;
            requestData(pageIndexRef.current, pageSize, filterRef.current);
        }, delay);
        setLoading(true);
    };



    const handleChangeKendo = (event) => {
        const newValue = event.target.value;

        if (onChangeAcceptance) {
            if (!newValue) {
                onChange && onChange(newValue);
                setVal(newValue);
            } else {

                let { key, value, option } = onChangeAcceptance;

                if (option == "Equals" && newValue[key] == value) {
                    onChange && onChange(newValue);
                    setVal(newValue);
                } else {
                    setVal(null);
                    onChange && onChange(null);
                }
            }
        } else {
            onChange && onChange(newValue);
            setVal(newValue);
        }
    };

    let disableClick = false;

    const handleClick = () => {
        if (!opened && !disabled && !disableClick && overRef.current) {
            setOpened(true);
            disableClick = false;
        }
    };

    const addNew = (newValue: string | null) => {
        setOpened(false);
        disableClick = true;
        addOption && addOption.action(newValue);
    };

    const infiniteTimeout = useRef<any>();
    const onScroll = (event) => {

        let listHeight = event.target.children[0].getBoundingClientRect().height;
        let comboboxHeight = event.target.clientHeight;
        let scrollTop = event.target.scrollTop;
        let scrollBottom = comboboxHeight + scrollTop;

        let scrollWindowSize = 48;

        if (listHeight <= scrollBottom + scrollWindowSize) {
            if (!options) {
                clearTimeout(infiniteTimeout.current);
                infiniteTimeout.current = setTimeout(() => {
                    showMore();
                }, 75);

            }
        }
    };

    const getScrollers: () => Promise<HTMLCollectionOf<Element>> = async () => {
        return new Promise<HTMLCollectionOf<Element>>(async (resolve) => {
            let scrollers = document.getElementsByClassName("k-list-content");
            let waitTimeout = 50;
            let totalWait = 0;
            let waitLimit = 5000;
            while (scrollers.length === 0 && totalWait < waitLimit) {
                await Helper.waitABit(waitTimeout);
                scrollers = document.getElementsByClassName("k-list-content");
                totalWait += waitTimeout;
            }
            resolve(scrollers);
        });
    };

    useEffect(() => {

        getScrollers().then(scrollers => {
            // if opened, subscribe to scroll event
            // if closed, unsubscribe to scroll event
            if (scrollers.length > 0) {
                let scroller = scrollers[0];

                if (opened) {
                    scroller.addEventListener("scroll", onScroll);
                } else {
                    scroller.removeEventListener("scroll", onScroll);
                }
            }
        });

    }, [opened]);

    const footer = () => {
        return (
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <div style={{
                    display: "flex", flexDirection: "column", margin: "0.5rem 0 0.5rem 1rem", color: `${colors.bluePrimary}`,
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    cursor: "pointer"
                }}>
                    {addOption ?
                        <span onClick={() => addNew(null)}>{addOption.text}</span> : ''
                    }
                </div>
                {!options ?
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        margin: "0.5rem 1rem 0 0.5rem",
                        color: `${colors.blueGreyLight}`,
                        fontSize: "0.875rem"
                    }}
                    >
                        <span>Showing {(getLocalOptions() ? getLocalOptions().length : 0)} of {(totalOptions ?? 0)}</span>
                    </div> : ''
                }
            </div>
        );
    };

    const comboFilter = !!filter ? {
        filter: filter
    } : {};

    const renders = itemRender && valueRender ? {
        itemRender: itemRender,
        valueRender: valueRender
    } : itemRender ? {
        itemRender: itemRender
    } : valueRender ? {
        valueRender: valueRender
    } : {};

    const onMouseMove = useCallback((e) => {
        let rect = ref.current?.getBoundingClientRect();
        overRef.current = !!rect && (rect.y + rect.height) > e.clientY;
    }, [ref.current, overRef.current]);

    const windowSize = useWindowSize();

    const [popupWidth, setPopupWidth] = useState('100%');

    useEffect(() => {
        if (ref && ref.current) {
            let rect = ref.current.getBoundingClientRect();
            setPopupWidth(`${rect.width}px`);
        }
    }, [ref, windowSize]);


    const mapOptionToMantine = (opt: any): /*ItemPropsMantine*/ any => {
        if (dataItemKey && textField) {
            return opt ? {
                value: opt[dataItemKey] ?? null,
                label: opt[textField] ?? "",
                dataItem: opt,
                isCreate: false,
                group: groupField ? opt[groupField] : undefined
            } : {
                value: null,
                label: "",
                dataItem: {},
                isCreate: false,
                group: undefined
            };
        }
        return {
            value: opt,
            label: opt,
            dataItem: {},
            isCreate: false,
            group: undefined
        };
    };

    const getLocalOptions = () => {
        let opts = Helper.isFunction(getOptions) ? localOptions : Array.isArray(localOptions) && canSearch && (/*localOptions.length !== 0 || */!!searchVal) ? localOptions : Array.isArray(options) ? options : [];

        if (Array.isArray(hideDataItemKeys) && dataItemKey) {
            opts = opts.filter(x => !hideDataItemKeys.includes(x[dataItemKey]));
        }

        return opts;
    }
    // const mapLocalOptionsMantine = useMemo((): ItemPropsMantine[] => {
    const mapLocalOptionsMantine = (): {
        value: string
        label: string
        dataItem: any
        isCreate: boolean
    }[] => {
        const opts: ItemPropsMantine[] = getLocalOptions() ? getLocalOptions().map(opt => {
            return mapOptionToMantine(opt);
        }) : [];

        if (val) {
            const opt = mapOptionToMantine(val);
            if (!opts.find((x: any) => x.value === opt.value)) {
                opts.unshift(opt);
            }
        }

        if (canCreateMantine() && opts.findIndex(x => x.isCreate) === -1) {
            let filterText = previousFilterValue.current;

            if (mapLabelMantine() === filterText) {
                filterText = "";
            }

            opts.unshift({
                value: JSON.stringify({ key: mantineAddNewKey, text: filterText }),
                // label: `+ Add New${filterText ? ` "${filterText}"` : ""}`,
                label: `+ Add New`,
                dataItem: {},
                isCreate: true
            } as any);
        }

        return opts as any;
    };
    // }, [localOptions, val, dataItemKey, textField, cascadeDependency]);

    const mapValueMantine = useMemo(() => {
        let valTemp = val;
        if (dataItemKeyAsValue !== true && dataItemKey && val !== null && val !== undefined && val[dataItemKey] !== undefined) {
            valTemp = val[dataItemKey];
        }

        if (valTemp === null || valTemp === undefined) {
            return null;
        }
        return valTemp;
    }, [dataItemKey, val, dataItemKeyAsValue]);

    // function valueItemMantine({
    //     value,
    //     label,
    //     classNames,
    //     dataItem,
    //     ...others
    // }: ItemPropsMantine & { value: string } & { dataItem: any }) {
    //     return (
    //         <div {...others}>
    //             {itemRenderMantine({ value, label, dataItem })}
    //         </div>
    //     );
    // }
    /*
        const selectItemMantine = forwardRef<HTMLDivElement, ItemPropsMantine>(
            ({
                value,
                label,
                dataItem,
                isCreate,
                ...others
            }: /!*ItemPropsMantine*!/ any, ref) => {
                if (value === mapValueMantine && hideSelected) {
                    return <></>
                }
                return (
                    <div ref={ref} {...others}>
                        <Group wrap={'nowrap'} w={"100%"} h={"100%"} pos={"static"}>
                            <div style={{width: "calc(100% - 12px - 12px)", height: "100%"}}>
                                {
                                    isCreate ?
                                        <div>
                                            {false ? label : "+ Add New"}
                                        </div>
                                        : itemRenderMantine({
                                            value,
                                            label,
                                            dataItem
                                        } as any)
                                }
                            </div>
                        </Group>
                    </div>
                );
            }
        );
    */

    const getScrollersMantine: () => Promise<Element | null> = async () => {
        return new Promise<Element | null>(async (resolve) => {
            let scrollers = document.querySelector(".mantine-Select-dropdown-do-not-succeed-first-time");
            let waitTimeout = 50;
            let totalWait = 0;
            let waitLimit = 5000;
            while (!scrollers && totalWait < waitLimit) {
                await Helper.waitABit(waitTimeout);
                scrollers = document.querySelector(".mantine-Select-dropdown .mantine-ScrollArea-viewport");
                totalWait += waitTimeout;
            }
            resolve(scrollers);
        });
    };

    // const scrollersRef = useRef<any>(null);


    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const onScrollMantine = (pos) => {
        if (scrollContainerRef.current) {
            const target = scrollContainerRef.current



            let listHeight = target.children[0].getBoundingClientRect().height;
            let comboboxHeight = target.clientHeight;
            let scrollTop = target.scrollTop;
            let scrollBottom = comboboxHeight + scrollTop;

            let scrollWindowSize = 48;

            if (listHeight <= scrollBottom + scrollWindowSize) {
                if (!options) {
                    clearTimeout(infiniteTimeout.current);
                    infiniteTimeout.current = setTimeout(() => {
                        showMore();
                    }, 150);

                }
            }

        }
    };

    /* const onDropdownOpenMantine = () => {
         setDropdownOpenMantine(true);
         getScrollersMantine().then(scrollers => {
             if (scrollers) {
                 scrollers.addEventListener("scroll", onScrollMantine);
             }
         });
     };
 
     const onDropdownCloseMantine = () => {
         setDropdownOpenMantine(false);
     };*/

    const rightSectionMantine = (): ReactNode => {
        return <div style={{ display: "flex", position: "absolute" }} onClick={
            () => searchInputRef.current?.focus()
        }>
            <div >

                {mapValueMantine && !disabled && canClear ? <>
                    {/*<span style={{ pointerEvents: "all", cursor: "pointer" }}
                        onClick={() => handleChangeMantine(null)}>
                        <img src="/specno-icons/clear.svg" />
                    </span>*/}
                    <CloseButton
                        size={size}
                        onClick={(e) => {
                            handleChangeMantine(null)
                            e.stopPropagation()
                        }} />
                </> : <span style={{ pointerEvents: "none", paddingTop: "6px" }}>
                    <IconChevronDown
                        size={`1.3em`}
                        style={{
                            transform: `rotate(${dropdownOpenMantine ? '-180deg' : '0deg'})`,
                            transition: '40ms ease-in-out',
                            color: 'var(--mantine-color-gray-7)'
                        }}
                    />
                    {/*{dropdownOpenMantine ?
                        <img src="/specno-icons/chevron_up.svg" style={{ pointerEvents: "none" }} />
                        :
                        <img src="/specno-icons/chevron_down.svg" style={{ pointerEvents: "none" }} />
                    }*/}
                </span>}
            </div>

            {/* {!!addOption && !disabled ?
                <div style={{
                    cursor: "pointer",
                    marginTop: "1px",
                    paddingTop: "5px",
                    marginRight: "15px",
                    height: "29px",
                    background: "#0000000A",
                    borderLeft: "1px solid #ced4da",
                    borderTopRightRadius: "4px",
                    borderBottomRightRadius: "4px",
                    pointerEvents: "all"
                }} onClick={() => addOption && addOption.action()} title="Add New"  >
                    <span>
                        <img src="/specno-icons/add.svg" alt="Add New" />
                    </span>
                </div>
                : ""} */}

            <style jsx>{`
                :global(.mantine-Select-rightSection) {
                    width: 0px;
                    right: 16px;
                }
            `}</style>
        </div>;
    }

    const combobox = useCombobox({
        // defaultOpened: false,
        // opened: dropdownOpenMantine,
        onDropdownClose: () => combobox.resetSelectedOption(),
        onOpenedChange: (opened) => setDropdownOpenMantine(opened)
    });

    /*useEffect(() => {
        setDropdownOpenMantine(false)
    }, []);*/

    const [searchVal, setSearchVal] = useState(mapLabelMantine() || '');

    // CR LF ASCII input needs to be prevented when search is being updated - this is relevant for barcode scanners which inputs serial number quickly and then ends with down and new line
    const [preventOptionSelect, setPreventOptionSelect] = useState(false)
    const enableOptionSelect = useDebouncedCallback(() => { setPreventOptionSelect(false) }, 100)

    /*const handler = (event) => {
        if(preventOptionSelect) {
            // enter, down, home
            if(event.which === 13 || event.which === '36' || event.which === '40') {
                event.preventDefault()
            }
        }
    };
    useWindowEvent('keypress', handler);*/

    const handleSearchUpdated = (event: ChangeEvent<HTMLInputElement> | null, newVal: string) => {
        setSearchVal(newVal);
        onFilterChangeMantine(newVal)
        setPreventOptionSelect(true)
        enableOptionSelect()
    }
    const handleOptionSubmit = (newVal: string | number) => {
        if (!preventOptionSelect) {
            if (newVal) {
                const opt = getLocalOptions().find(x => mapOptionToMantine(x).value === newVal)

                /*if(!opt && mapOptionToMantine(value).value === newVal) { // a new item was added and set and current value does not exist in local options
                    setLocalOptions(p => [...p, value])
                }*/

                const option = mapOptionToMantine(opt ?? value)

                if (newVal === mantineAddNewKey) {
                    setSearchVal(option.label)
                }

                onFilterChangeMantine(option.label);
            }
            handleChangeMantine(newVal);
            combobox.closeDropdown();
        }
    }

    const handleChangeMantine = (event) => {

        const newValueKey = event;

        if (newValueKey === null && hasNullKey !== true) {
            setLocalOptions([])
            onChange && onChange(null);
            !suppressInternalValueChange && setVal(null);
            setSearchVal('')
            onFilterChangeMantine('')
            return;
        }

        if (newValueKey?.includes && newValueKey.includes(mantineAddNewKey)) {
            const textToAdd = JSON.parse(newValueKey).text;
            addNew && addNew(textToAdd);
            return;
        }

        let localOptions = getLocalOptions();
        const newValue = dataItemKey ? (newValueKey !== null || hasNullKey) && newValueKey !== undefined ? (localOptions.find(x => x[dataItemKey] === newValueKey) ?? (value[dataItemKey] === newValueKey && value)) : null : newValueKey;
        if (onChangeAcceptance) {
            if (newValue === null || newValue === undefined) {
                onChange && onChange(newValue);
                !suppressInternalValueChange && setVal(newValue);
            } else {

                let { key, value, option, action } = onChangeAcceptance;

                if (option == "Equals" && newValue[key] == value) {
                    onChange && onChange(newValue);
                    !suppressInternalValueChange && setVal(newValue);
                } else {
                    !suppressInternalValueChange && setVal(null);
                    onChange && onChange(null);
                    action && action(newValue);
                }
            }
        } else {
            onChange && onChange(newValue);
            !suppressInternalValueChange && setVal(newValue);
        }
    };

    const isItemDisabled = (dataItem) => {
        if (!dataItem || !Array.isArray(disableIDs)) return false;

        return disableIDs.includes(dataItem.ID);
    }

    const selectOptions = mapLocalOptionsMantine()
        .filter(x => !hideSelected || x.value !== mapValueMantine)
        .map(({
            value, label, dataItem, isCreate
        }) => (
            <Combobox.Option value={value} key={value} disabled={isItemDisabled(dataItem)} title={isItemDisabled(dataItem) ? "Item already used" : undefined}>
                {
                    /*if (value === mapValueMantine && hideSelected) {
                    return <></>*/
                }
                <Group wrap={'nowrap'} w={"100%"} h={"100%"} pos={"static"}>
                    <div style={{ width: "calc(100% - 12px - 12px)", height: "100%" }}>
                        {
                            isCreate ? (
                                <div>
                                    + Add New
                                </div>
                            ) :
                                itemRenderMantine({
                                    value,
                                    label,
                                    dataItem
                                } as any)
                        }
                    </div>
                </Group>
            </Combobox.Option>
        ))

    useEffect(() => {
        // console.log('trigger refresh', )
        textField && value && handleSearchUpdated(null, value[textField])
        combobox.resetSelectedOption()
    }, [textField, value]);

    useEffect(() => {
        // we need to wait for options to render before we can select first one
        if (!Helper.isNullOrUndefined(value)) {
            combobox.selectOption(mapLocalOptionsMantine().findIndex(x => x.value === mapValueMantine))
        } else if (!searchVal && canCreateMantine()) { // select add new option when opened
            combobox.selectFirstOption()
        } else if (!!searchVal) { // select second option if add option is shown
            const matchesAtTop = mapLocalOptionsMantine().findIndex(x => x.label.trim().toLowerCase().includes(searchVal.trim().toLowerCase())) === 1
            if (matchesAtTop) {
                combobox.selectOption(1)
            } else {
                combobox.resetSelectedOption()
            }
        } else { // default
            combobox.resetSelectedOption()
        }
    }, [searchVal/*, mapLocalOptionsMantine*/]);

    useEffect(() => {
        if (totalOptions === 1) {
            combobox.selectOption(canCreateMantine() ? 1 : 0)
        }
    }, [localOptions, totalOptions]);

    const preventFocusDropdownOpen = useRef(false)
    useEffect(() => {
        const item = mapLocalOptionsMantine().find(x => x.value === mapValueMantine)
        if (!item) {
            setSearchVal('')
        } else {
            // const item = mapLocalOptionsMantine().find(x => x.value === mapValueMantine)
            item && setSearchVal(item.label)
        }

        /** handle closing and blurring dropdown: value was changed externally, use ref to control if dd should be opened on focus, due to async timing*/
        preventFocusDropdownOpen.current = true
        if (combobox.dropdownOpened) {
            combobox.closeDropdown()
            searchInputRef.current?.blur()
        }
        setTimeout(() => {
            preventFocusDropdownOpen.current = false
        }, 100)

    }, [mapValueMantine]);

    const handleFocus = () => {
        if (!preventFocusDropdownOpen.current) {
            combobox.openDropdown()
        } else {
            searchInputRef.current?.blur()
        }
    }

    const handleBlur = () => {
        combobox.closeDropdown()
        if (searchVal !== mapOptionToMantine(val).label) {
            setSearchVal(mapOptionToMantine(val).label)
        }
    }

    return (
        <div className={`${'combobox-container'} ${extraClasses}`} ref={ref}
            onMouseMove={onMouseMove}
            onClick={handleClick}>
            {
                <NoSSR>
                    <Combobox
                        onOptionSubmit={(optionValue) => {
                            handleOptionSubmit(optionValue);
                        }}
                        store={combobox}
                        withinPortal={!mobileView}
                        shadow={'sm'}
                        size={size}
                        disabled={readOnly || disabled}
                        {...mantineComboboxProps}
                    >
                        <Combobox.Target>
                            <TextInput
                                title={title}
                                size={size}
                                // data-autofocus={autoFocus}
                                autoFocus={autoFocus}
                                ref={searchInputRef}
                                w={w}
                                // w={485}
                                mt={mt ?? 'var(--mantine-spacing-sm)'}
                                label={label}
                                placeholder={placeholder}
                                name={name}
                                disabled={disabled}
                                value={searchVal}
                                readOnly={!canSearch || readOnly}
                                onChange={(event) => {
                                    handleSearchUpdated(event, event.currentTarget.value)
                                    combobox.openDropdown();
                                }}
                                onClick={() => combobox.openDropdown()}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                rightSection={rightSectionMantine()}
                                leftSection={iconMantine}
                                error={error}
                                withAsterisk={required}
                                style={style}
                                classNames={
                                    hoverLabelMode && !error ?
                                        {
                                            input: styles.hoverStyleInput,
                                            wrapper: styles.hoverStyleWrapper,
                                            section: styles.hoverStyleSection,
                                            label: styles.label
                                        } : {}}                                
                            />
                        </Combobox.Target>

                        <Combobox.Dropdown style={{ boxShadow: shadows.combobox }}>
                            <Combobox.Options>
                                {selectOptions.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> :
                                    <ScrollArea.Autosize
                                        type="auto"
                                        mah={{ base: 200, md: 250 }}
                                        onScroll={onScrollMantine}
                                        onScrollPositionChange={onScrollMantine}
                                        viewportRef={scrollContainerRef}
                                    // ref={ref}
                                    >
                                        {selectOptions}
                                    </ScrollArea.Autosize>
                                }
                            </Combobox.Options>
                        </Combobox.Dropdown>
                    </Combobox>
                </NoSSR>
            }

            {hint && !error ?
                <SCHint value={hint} /> : ''
            }

            <style jsx>{`
                .combobox-container {                    
                    /* margin-top: 0.5rem; */
                }
                .combobox-container-placeholder {
                    margin-top: 24px;
                }
                .custom-label {
                    color: ${colors.labelGrey};
                    opacity: 0.75;
                    display: block;
                    font-size: 0.75rem;
                }
                .input-width {
                    width: ${layout.inputWidth};
                }

                .list-item {
                    padding: 0.5rem;
                    cursor: pointer;
                    width: calc(100% - 1rem);
                }

                .list-item.selected {
                    background: ${colors.bluePrimaryLight}20;
                }

                .list-item:hover {
                    background: rgba(0,0,0,0.1);
                }

                .list-item.selected:hover {
                    background: ${colors.bluePrimary}20;
                }

                {/* :global(.mantine-Select-dropdown) {
                    background: green;
                } */}

            `}</style>
        </div>
    );
}

export default SCComboBox;
