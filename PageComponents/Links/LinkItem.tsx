import React, { FC, useEffect, useRef, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import constants from "@/utils/constants";
import Fetch from "@/utils/Fetch";
import { useOutsideClick } from "rooks";
import {
    ActionIcon,
    Anchor,
    Combobox,
    Flex,
    useCombobox,
    Text,
    ScrollArea,
    Tooltip,
    Loader,
    Box,
    Skeleton, MantineSize
} from "@mantine/core";
import { IconLinkMinus, IconLinkPlus, IconSquarePlus, IconSquareX } from "@tabler/icons-react";
import Link from "next/link";
import * as enums from '@/utils/enums';
import styles from './Link.module.css';
import { IconLink } from "@tabler/icons";
import { shadows } from "@/theme";

const moduleConfig = {
    [enums.Module.JobCard]: {
        url: `/Job/GetJobs`,
        basePath: '/job/',
        singular: 'Job',
        plural: 'Jobs',
        titleKey: 'JobCardNumber',
        descriptionKey: 'CustomerName',
        customerIdList: true
    },
    [enums.Module.Query]: {
        url: `/Query`,
        basePath: '/query/',
        singular: 'Query',
        plural: 'Queries',
        titleKey: 'QueryCode',
        descriptionKey: 'CustomerName',
        requestMethod: 'GET'
    },
    [enums.Module.Project]: {
        url: `/Project`,
        basePath: '/project/',
        singular: 'Project',
        plural: 'Projects',
        titleKey: 'ProjectNumber',
        descriptionKey: 'CustomerName',
        requestMethod: 'GET'
    },
}

const LinkItem: FC<{
    lockdown?: boolean // not used currently
    customerID?: string
    setSelected: (newSelectedJob: any) => void
    selectedItem: any
    // dropdownDirection: string
    // newParent?: any
    module: number
    blacklist?: any[]
    disabledItems?: any[]
    inlineMode?: boolean
    error?: string | null
    miw?: number
    onItemsLoaded?: (items: any[]) => void
    additionalQueryParams?: { [paramName: string]: any }
    size?: { label?: MantineSize, actionIcon?: MantineSize }
    storeID?: string
    customerOptional?: boolean
}> = (props) => {

    const [config] = useState(moduleConfig[props.module])

    const [items, setItems] = useState([{}]);
    const [inputFocus, setInputFocus] = useState(false);
    const [searching, setSearching] = useState(false);
    const [search, setSearch] = useState('');
    const debounce = useDebounce();

    const [loadingInitialData, setLoadingInitialData] = useState(true)

    const [lastSearch, setLastSearch] = useState('')

    async function getItemsForCustomer(customerChange) {
        debounce.deferProceed(constants.debounceSearchPeriod, async function () {
            setSearching(true);
            const items = await (config.requestMethod === 'GET' ? Fetch.get : Fetch.post)({
                url: config.url,
                params: {
                    searchPhrase: search,
                    includeClosed: false,
                    pageSize: 20,
                    ...(config.customerIdList ? {
                        customerIDList: props.customerID ? [props.customerID] : null
                    } : {
                        customerID: props.customerID ? props.customerID : null,
                    }),
                    storeIDList: props.storeID ? [props.storeID] : [],
                    ...props.additionalQueryParams
                }
            } as any);
            const filteredItems = items.Results
                .filter(x => !props.blacklist || !props.blacklist.some(y => {
                    return x.ID === y.ID
                }));
            setItems(filteredItems);
            setLoadingInitialData(false);
            if (props.onItemsLoaded) {
                props.onItemsLoaded(filteredItems);
            }
            if (customerChange) {
                // setHasJobs(jobs.TotalResults > 0);
            }
            setSearching(false);
            setLastSearch(search);
        });
    }

    useEffect(() => {
        getItemsForCustomer(false);
    }, [props.blacklist]);

    const oldSearch = useRef(search);
    useEffect(() => {
        let changed = oldSearch.current !== search;
        oldSearch.current = search;

        if (changed) {
            getItemsForCustomer(false);
        }
    }, [search]);

    const oldCustomerID = useRef(props.customerID);
    const oldStoreID = useRef(props.storeID)
    useEffect(() => {
        let changed = oldCustomerID.current !== props.customerID || oldStoreID.current !== props.storeID;
        oldCustomerID.current = props.customerID;
        oldStoreID.current = props.storeID;

        if ((props.customerID || props.customerOptional === true) && changed) {
            setItems([{}]);
            getItemsForCustomer(true);
        }
    }, [props.customerID, props.storeID]);

    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, () => {
        if (inputFocus) {
            setInputFocus(false);
        }
    });

    const handleSearchChange = (e) => {
        setSearch(e.currentTarget.value);
    }

    const combobox = useCombobox({
        onDropdownClose: () => {
            /*!props.inlineMode && */combobox.resetSelectedOption();
            combobox.focusTarget();
            setSearch('');
        },

        onDropdownOpen: () => {
            combobox.focusSearchInput();
            const idx = !!props.selectedItem ? items.findIndex((x: any) => x.ID === props.selectedItem.ID) : -1
            idx > -1 && combobox.selectOption(idx)
        },
    });

    useEffect(() => {
        if (props.inlineMode) {
            const idx = !!props.selectedItem ? items.findIndex((x: any) => x.ID === props.selectedItem.ID) : -1
            idx > -1 && combobox.selectOption(idx)
        }
    }, [props.selectedItem, props.inlineMode, items])

    const secondaryTextFor = (itm: any) => itm?.[config.descriptionKey] || '';

    const comboboxOptions = <>
        <Box style={
            props.inlineMode && props.error ?
                {
                    outline: '2px solid var(--mantine-color-yellow-5)',
                    outlineOffset: '5px',
                    borderRadius: '.5rem'
                } : /*props.inlineMode ? {border: '1px solid lightgrey', borderRadius: '.5rem'} :*/ {}
        }>
            <Combobox.Search
                placeholder={'Search ' + config.plural.toLowerCase()}
                onChange={handleSearchChange}
                // onFocus={handleSearchFocus}
                // onBlur={handleSearchBlur}
                value={search}
                styles={props.inlineMode ? {
                    // wrapper: {borderRadius: '.5rem'},
                    input: { borderRadius: '.5rem .5rem', width: '100%', border: '1px solid lightgrey', marginBottom: 5 },
                } : {}}
                // leftSection={searching && <Loader size={12} /> || <IconSearch size={16}/>}
                variant={'filled'}
                color={'gray.7'}
            /*styles={{
                input: {
                    border: '1px solid lightgrey',
                    width: '100%'
                }
            }}*/
            // rightSection={search && <CloseButton onClick={() => setSearch('')}/>}
            />
            <Combobox.Options>
                <ScrollArea.Autosize
                    mah={250}
                    type={'scroll'}
                >
                    {
                        loadingInitialData && ['x', 'x', 'x'].map((x, i) => <Skeleton key={'loader-linkOption' + i} width={'100%'} height={30} my={2} />)
                    }
                    {
                        items.length > 0 ?
                            items.map((j: any, i) => (
                                <Combobox.Option
                                    key={module + 'job-link-item' + i + j.ID} value={j.ID}
                                    className={styles.option}
                                    disabled={props.disabledItems && props.disabledItems.some(x => x.ID === j.ID)}
                                >
                                    {/*<div className={`initial ${searching ? 'hidden' : ''}`}>{Helper.getInitials(j.CustomerName)}</div>*/}
                                    <Flex wrap={'wrap'} align={'center'} justify={'space-between'} my={2}>
                                        <Text
                                            size={'sm'}
                                            fw={600}
                                            className={styles.optionTitle}
                                        >
                                            {j[config.titleKey]}
                                        </Text>
                                        <Text size={'sm'} lineClamp={1}>{secondaryTextFor(j)}</Text>
                                    </Flex>
                                </Combobox.Option>
                            )) :
                            <Combobox.Empty >{searching ? <Loader size={14} /> : !!lastSearch ? (lastSearch + ' not found') : `No ${config.plural} Available`}</Combobox.Empty>
                    }
                </ScrollArea.Autosize>
            </Combobox.Options>
        </Box>
        {
            props.inlineMode &&
            <Text size={'sm'} c={'yellow.5'} mt={'xs'} ml={'auto'}>{props.error}</Text>
        }
    </>


    return (

        <Flex gap={25} align={'center'} miw={0}>
            <Combobox
                store={combobox}
                width={props.miw || 250}
                styles={{
                    options: {
                        width: props.miw,
                        maxWidth: '100%'
                    },
                    search: {
                        width: props.miw,
                        maxWidth: '100%'
                    }
                }}
                position="bottom-start"
                onOptionSubmit={(val) => {
                    const idx = items.findIndex((x: any) => x.ID === val)
                    props.setSelected(items[idx]);
                    combobox.selectOption(idx)
                    combobox.closeDropdown()
                }}
                shadow={'xs'}
            >

                {
                    props.inlineMode ? <Combobox.EventsTarget>
                        <Box>
                            {
                                /*!!props.selectedItem && props.selectedItem.hasOwnProperty(config.titleKey) ?  // selected item is sometimes an empty object
                                    <Link href={config.basePath + props.selectedItem.ID} target={'_blank'} referrerPolicy={'no-referrer'}>
                                        <Anchor size={'sm'}>
                                            {props.selectedItem[config.titleKey] + ' - ' + props.selectedItem[config.descriptionKey]}
                                        </Anchor>
                                    </Link> :
                                    <Anchor size={'sm'} onClick={() => combobox.toggleDropdown()} >
                                        {'Link ' + config.singular}
                                    </Anchor>*/
                            }
                        </Box>
                    </Combobox.EventsTarget> :
                        <Combobox.Target>
                            <Box miw={0} style={{ flex: 1 }}>
                                {
                                    !!props.selectedItem && props.selectedItem.hasOwnProperty(config.titleKey) ?  // selected item is sometimes an empty object
                                        <Link href={config.basePath + props.selectedItem.ID}>
                                            <Anchor size={props.size?.label ?? 'sm'} fw={'600'} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '100%' }}>
                                                {`${props.selectedItem[config.titleKey]}${secondaryTextFor(props.selectedItem) ? ' - ' + secondaryTextFor(props.selectedItem) : ''}`}
                                            </Anchor>
                                        </Link> :
                                        <Anchor fw={'600'} c={props.lockdown ? 'dimmed' : 'scBlue'} size={props.size?.label ?? 'sm'} onClick={() => !props.lockdown && combobox.toggleDropdown()}>
                                            {'Link ' + config.singular}
                                        </Anchor>
                                }
                            </Box>
                        </Combobox.Target>
                }

                {
                    !props.inlineMode && (
                        (!props.selectedItem || !props.selectedItem?.hasOwnProperty(config.titleKey)) && // selected item is sometimes an empty object
                        <Tooltip label={'Add Link'} color={'scBlue'}
                            events={{ hover: true, focus: true, touch: true }}
                        >
                            <ActionIcon
                                disabled={props.lockdown}
                                size={props.size?.actionIcon ?? 'xs'} variant={'outline'} onClick={() => combobox.openDropdown()} >
                                {/*<IconSquarePlus />*/}
                                <IconLinkPlus />
                            </ActionIcon>
                        </Tooltip> ||
                        <Tooltip label={'Remove Link'} color={'yellow'}
                            events={{ hover: true, focus: true, touch: true }}
                        >
                            <ActionIcon
                                disabled={props.lockdown}
                                size={props.size?.actionIcon ?? 'xs'} color={'red'} variant={'outline'} onClick={() => {
                                    props.setSelected(null)
                                }}>
                                {/*<IconSquareX/>*/}
                                <IconLinkMinus />
                            </ActionIcon>
                        </Tooltip>
                    )

                }

                {
                    props.inlineMode ? <Flex direction={'column'}>
                        {comboboxOptions}
                    </Flex> :
                        <Combobox.Dropdown style={{ boxShadow: shadows.combobox }}>
                            {comboboxOptions}
                        </Combobox.Dropdown>
                }


            </Combobox>
        </Flex>
    );
}

export default LinkItem;


