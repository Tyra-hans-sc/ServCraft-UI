import React, { useState, useRef, useEffect, useContext } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import SCMultiSelect from '../sc-controls/form-controls/sc-multiselect';
import DashboardService from '../../services/dashboard-service';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import { useWindowEventListener } from "rooks";
import {Box, CloseButton, Flex, Portal, TextInput} from "@mantine/core";
import Storage from "@/utils/storage";
import {IconSearch} from "@tabler/icons";
import SCModal from "@/PageComponents/Modal/SCModal";
import {useDebouncedValue, useFocusTrap, useMergedRef} from "@mantine/hooks";
import {useQuery} from "@tanstack/react-query";

function SearchModal({ show, setShow, incomingValue, forceShow }) {

    // const mobileView = useMediaQuery('(max-width: 800px)');


    const [sideBarState] = useState(Storage.getCookie(Enums.Cookie.servSidebarState))

    // const searchRef = useRef();
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue] = useDebouncedValue(searchValue, 500)

    const firstSearch = useRef(true);

    useEffect(() => {
        setSearchValue(incomingValue);
        if (incomingValue.length > 2) {
            firstSearch.current = false
        }
    }, [incomingValue]);

    const mouseIsOverRef = useRef(true);

    /*const onMouseOver = () => {
        mouseIsOverRef.current = true;
    };

    const onMouseOut = () => {
        mouseIsOverRef.current = false;
    };*/

    useWindowEventListener("click", () => {
        if (mouseIsOverRef.current === false) {
            setShow(false);
        }
    });

    const [availableModules, setAvailableModules] = useState(DashboardService.getGlobalSearchAvailableCategories());

    const allSelection = 'All';

    const [selectedModules, setSelectedModules] = useState([allSelection]);

    const handleModuleChange = (values) => {
        let selectedValues = values;

        if (selectedModules.includes(allSelection)) {
            selectedValues = selectedValues.filter(x => x !== allSelection);
        } else {
            if (selectedValues.includes(allSelection)) {
                selectedValues = selectedValues.filter(x => x === allSelection);
            } else if (selectedValues.length === availableModules.length - 1) {
                selectedValues = [allSelection];
            }
        }

        setSelectedModules(selectedValues);
    };

    /*useEffect(() => {
        triggerSearch();
    }, [selectedModules]);*/

    /*useEffect(() => {
        if (searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchRef.current]);*/

    // const [searchResultsOld, setSearchResults] = useState();
    // const [searchingOld, setSearching] = useState(false);
    const searchCount = useRef(0);


    const {isFetching: searching, data: searchResults} = useQuery(
        [debouncedSearchValue, selectedModules],
        async () => {
            return await (DashboardService.getGlobalSearchResults(debouncedSearchValue, selectedModules)).then(
                (data) => {
                    if (data.Results) {
                        return data.Results
                    } else {
                        throw new Error(data?.serverMessage || data?.message || 'No Results in response')
                    }
                }
            )
        },
        {
            enabled: debouncedSearchValue.length > 2
        }
    )
    /*const triggerSearch = async () => {
        if (searchValue.length > 2) {
            searchCount.current++;
            firstSearch.current = false;
            setSearching(true);
            try {
                const globalResults = await DashboardService.getGlobalSearchResults(searchValue, selectedModules);
                setSearchResults(globalResults.Results);
                
            } catch { }
            finally {
                searchCount.current--;
                if (searchCount.current < 0) searchCount.current = 0;
                setSearching(false);
            }
        } else {
            setSearchResults(undefined);
        }
    };*/

    // const timerRef = useRef(null);

    /*useEffect(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            triggerSearch();
        }, 1000);
    }, [searchValue]);*/

    const closeButtonClick = () => {
        closeModal();
    };

    const closeModal = () => {
        setSelectedModules([allSelection]);
        setSearchValue('');
        setShow(false);
    };

    const clearButtonClick = () => {
        closeModal();
    };

    const [rowMouseOverIndex, setRowMouseOverIndex] = useState(-1);

    const onRowHover = (rowIndex, mouseOver = true) => {
        if (mouseOver) {
            setRowMouseOverIndex(rowIndex);
        } else {
            setRowMouseOverIndex(-1);
        }
    };

    const getIconSrc = (rowIndex, module) => {
        let src = '/sc-icons/';
        switch (module) {
            case Enums.Module.JobCard:
                src += 'jobs-';
                break;
            case Enums.Module.Customer:
                src += 'customers-';
                break;
            case Enums.Module.Asset:
                src += 'assets-';
                break;
            case Enums.Module.Inventory:
                src += 'inventory-';
                break;
            case Enums.Module.Query:
                src += 'queries-';
                break;
            case Enums.Module.Quote:
                src += 'quotes-';
                break;
            case Enums.Module.Invoice:
                src += 'invoices-';
                break;
            case Enums.Module.PurchaseOrder:
                src += 'purchases-';
                break;
        }

        let color = rowIndex === rowMouseOverIndex ? 'light' : 'dark';
        return src + color + '.svg';
    };

    const formatResultText = (text) => {

        if (!text) {
            return <span>-</span>;
        }

        text = text.trim();

        if (text && text.length > 0 && text != '-') {
            let textLower = text.toLowerCase();
            let searchLower = searchValue.toLowerCase();

            if (textLower.startsWith(searchLower)) {
                let boldBit = text.substring(0, searchLower.length);
                let postfix = text.substring(searchLower.length);

                return <span><b>{boldBit}</b>{postfix}</span>;
            } else if (textLower.includes(searchLower)) {
                let index = textLower.indexOf(searchLower);
                let lastIndex = index + searchLower.length;
                let prefix = text.substring(0, index);
                let boldBit = text.substring(index, lastIndex);
                let postfix = text.substring(lastIndex);

                return <span>{prefix}<b>{boldBit}</b>{postfix}</span>;
            } else {
                return <span>{text}</span>;
            }
        } else {
            return <span>-</span>;
        }
    };

    const navigate = (id, module) => {

        closeModal();

        let link = '';

        switch (module) {
            case Enums.Module.JobCard:
                link = '/job/';
                break;
            case Enums.Module.Customer:
                link = '/customer/';
                break;
            case Enums.Module.Asset:
                link = '/asset/';
                break;
            case Enums.Module.Inventory:
                link = '/inventory/';
                break;
            case Enums.Module.Query:
                link = '/query/';
                break;
            case Enums.Module.Quote:
                link = '/quote/';
                break;
            case Enums.Module.Invoice:
                link = '/invoice/';
                break;
            case Enums.Module.PurchaseOrder:
                link = '/purchase/';
                break;
        }

        Helper.nextRouter(Router.replace, link + '[id]', link + id);
    };

    const focusTrapRef = useFocusTrap();

    const searchModalContent = <>

        <div className='fixed-content-container'>
            <Flex w={'100%'} justify={'apart'} align={'start'} gap={'sm'} pos={'relative'}>
                <Flex w={'100%'} align={'start'} gap={'sm'} style={{position: 'relative'}} wrap={'wrap'}>
                    <TextInput
                        // autoFocus
                        disabled={searchCount.current > 0}
                        name={Helper.newGuid() + "-autocomplete-off"}
                        ref={focusTrapRef}
                        onChange={(e) => setSearchValue(e.currentTarget.value)}
                        value={searchValue}
                        placeholder={"Search here..."}
                        // w={'calc(100% - 600px)'}
                        // miw={250}
                        maw={400}
                        // maw={'calc(100% - 50%)'}
                        mt={0}
                        /*onChange={(event) =>
                            handleSearchChange(event.currentTarget.value)
                        }*/
                        icon={<IconSearch size={16}/>}
                        variant={'filled'}
                        rightSection={searchValue && !forceShow && <CloseButton onClick={clearButtonClick}/>}
                        style={{flexGrow: 1}}
                    />

                    <SCMultiSelect
                        mt={0}
                        availableOptions={availableModules}
                        selectedOptions={selectedModules}
                        onChange={handleModuleChange}
                        // extraClasses="no-margin width-override"
                        // w={'80%'}
                        // maw={'500px'}
                        // miw={'auto'}
                        w={'100%'}
                        style={{flexGrow: 0}}
                    />

                </Flex>


                <CloseButton ml={'auto'} style={{alignSelf: 'start'}} onClick={closeButtonClick}/>

            </Flex>
        </div>

        <div className='scrollable-content-container'>

            <div className='search-content-container'>

                <div className='results-container'>

                    <div className='table' style={{maxHeight: '65vh', maxWidth: 'calc(100vw - 100px)'}}>
                        {debouncedSearchValue.length > 2 && searchResults ?
                            searchResults.map((item, index) => {
                                return (
                                    <div className='table-row-container' key={index}
                                         onMouseOver={() => onRowHover(index, true)}
                                         onMouseLeave={() => onRowHover(index, false)}
                                         onClick={() => navigate(item.ID, item.Module)}>
                                        <div className='table-row'>
                                            <div className='icon'>
                                                <img src={`${getIconSrc(index, item.Module)}`}/>
                                            </div>
                                            <div className='fit'>
                                                {Enums.getEnumStringValue(Enums.Module, item.Module, true)}
                                            </div>
                                            <div className='display'>
                                                {formatResultText(item.Display1)}
                                            </div>
                                            <div className='display'>
                                                {formatResultText(item.Display2)}
                                            </div>
                                            <div className='display'>
                                                {formatResultText(item.Display3)}
                                            </div>
                                            <div className='display'>
                                                {formatResultText(item.Display4)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                            :
                            <>

                            </>
                        }

                    </div>

                </div>
            </div>
            {searchResults && searchResults.length == 0 ?
                <div className='no-results' style={{paddingInline: 30}}>
                    <img src="/sc-icons/alert.svg" alt="alert"/>
                    Your search returned no results. Please adjust your search term or clear your filters.
                </div> : ''
            }

            <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
                <div className="loader"></div>
            </div>
        </div>


        {/*<ScrollArea.Autosize mah={'70vh'} h={'100%'} mih={'20vh'} pt={'sm'} offsetScrollbars>
            {searchResults ?
                searchResults.map((item, index) => {
                    return (
                        <div className='table-row-container' key={index} onMouseOver={() => onRowHover(index, true)}
                             onMouseLeave={() => onRowHover(index, false)}
                             onClick={() => navigate(item.ID, item.Module)}>
                            <div className='table-row'>
                                <div className='icon'>
                                    <img src={`${getIconSrc(index, item.Module)}`}/>
                                </div>
                                <div className='fit'>
                                    {Enums.getEnumStringValue(Enums.Module, item.Module, true)}
                                </div>
                                <div className='display'>
                                    {formatResultText(item.Display1)}
                                </div>
                                <div className='display'>
                                    {formatResultText(item.Display2)}
                                </div>
                                <div className='display'>
                                    {formatResultText(item.Display3)}
                                </div>
                                <div className='display'>
                                    {formatResultText(item.Display4)}
                                </div>
                            </div>
                        </div>
                    )
                })
                :
                <>

                </>
            }

            {
                searchResults && searchResults.length === 0 ?
                    <Center py={60}>
                        <img src="/sc-icons/alert.svg" alt="alert"/>
                        Your search returned no results. Please adjust your search term or clear your filters.
                    </Center> : ''
            }

        </ScrollArea.Autosize>

        <div style={{position: 'relative'}}>

            <LoadingOverlay visible={searchCount.current > 0} loaderProps={{color: 'scBlue'}}/>

        </div>*/}


        <style jsx>{`
            .search-modal-container {
                background-color: ${colors.white};
                border-radius: ${layout.cardRadius};
                box-shadow: 8px 16px 32px rgb(0 0 0 / 40%), 0px 4px 6px rgb(0 0 0 / 12%);
                left: ${sideBarState === 'collapsed' ? '60px' : '180px'};
                min-height: 200px;

                position: absolute;
                top: 0;
                //width: 80%;
                //max-width: 800px;
                z-index: 8;
            }

            .fixed-content-container {
                display: flex;
                margin: 0.45rem 1rem 1rem 1rem;
            }

            .scrollable-content-container {
                overflow-y: auto;
                min-height: 200px;
                max-height: 500px;
                width: 100%;
                position: relative;
            }

            .close-button {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                cursor: pointer;
            }

            .search-content-container {
                display: flex;
                flex-direction: column;
                margin: 0 1rem 1rem 1rem;
            }

            .inputs {
                display: flex;
                width: 100%;
            }

            .action {
                align-items: center;
                display: flex;
                justify-content: center;
                width: 36px;
                position: absolute;
                right: 0;
                top: ${!Helper.isNullOrWhitespace(searchValue) ? '0.25rem' : '0.55rem'};
            }

            .action img {
                height: ${!Helper.isNullOrWhitespace(searchValue) ? '' : '13px'};
            }

            .clear {
                cursor: pointer;
            }

            input {
                background-color: ${colors.backgroundGrey};
                border-radius: ${layout.bigRadius};
                border: ${colors.darkPrimary} 1px solid;
                box-shadow: none;
                color: ${colors.subHeading};
                font-size: 14px;
                height: 28px;
                outline: none;
                font-family: ${fontFamily};
                width: 300px;
                padding-left: 1.1rem;
            }

            .input-search {
                display: flex;
                width: 300px;
                position: relative;
            }

            .module-select {
                display: flex;
                width: 300px;
                margin-left: 1rem;
            }

            .results-container {
                display: flex;
                margin-left: 1rem;
                margin-right: 1rem;
                position: relative;
            }

            .table {
                border-collapse: collapse;
                width: 100%;
                margin-top: 1rem;
                results-container
            }

            .table-row {
                border-bottom: 1px solid ${colors.globalSearchOverlay};
                height: 2.5rem;
                text-align: left;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                margin-left: 2rem;
                margin-right: 2rem;
                background-color: ${colors.white};
            }

            .table-row:hover {
                border-bottom: 1px solid var(--mantine-color-scBlue-7);
            }

            .table-row-container {
                margin-left: -2rem;
                margin-right: -2rem;
            }

            .table-row-container:nth-child(odd) > .table-row {
                background-color: ${colors.background};
            }

            .table-row-container:hover, .table-row:hover {
                color: ${colors.white};
                cursor: pointer;
                background-color: var(--mantine-color-scBlue-7) !important;
            }

            .table-row-container:hover > .table-row {
                color: ${colors.white};
                cursor: pointer;
                background-color: var(--mantine-color-scBlue-7) !important;
                border-bottom: 1px solid var(--mantine-color-scBlue-7);
            }

            div.icon {
                width: 2rem;
                padding-right: 1rem;
            }

            div.display {
                width: 20%;
                padding-left: 1rem;
                padding-right: 1rem;

                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

                font-size: 14px;
            }

            div.fit {
                width: 130px;
                font-size: 14px;
            }

        `}</style>

    </>

    return (
        <>
            {show && (!firstSearch.current || forceShow) ?
                <>
                    {
                        forceShow ?
                            <SCModal open={show} onClose={() => setShow(false)} modalProps={{
                                fullScreen: true
                            }}>

                                {searchModalContent}

                    </SCModal> :
                            <Portal>
                                <Box
                                    style={{
                                        backgroundColor: `${colors.white}`,
                                        borderRadius: `${layout.cardRadius}`,
                                        boxShadow: '8px 16px 32px rgb(0 0 0 / 40%), 0px 4px 6px rgb(0 0 0 / 12%)',
                                        right: 0,
                                        // left: `'${sideBarState === 'collapsed' ? '60px' : '180px'}'`,
                                        minHeight: '200px',
                                        position: 'absolute',
                                        top: 0,
                                        width: '80%',
                                        maxWidth: 800,
                                        zIndex: 150,
                                    }}
                                    className='search-modal-container'
                                >
                                    {searchModalContent}

                                </Box>
                            </Portal>
                    }
                </>
                : ''
            }
        </>
    )
}

export default SearchModal;
