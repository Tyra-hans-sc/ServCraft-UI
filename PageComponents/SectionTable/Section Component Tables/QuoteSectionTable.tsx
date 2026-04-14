import React, { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as Enums from "@/utils/enums";
import { IconTrash } from "@tabler/icons";
import SectionTable from "@/PageComponents/SectionTable/SectionTable";
import { IconPlus } from "@tabler/icons-react";
import { Anchor, Box, Button, Flex, Menu } from "@mantine/core";
import {useDebouncedState, useDidUpdate, useForceUpdate} from "@mantine/hooks";
import { SimpleColumnMapping } from "@/PageComponents/SimpleTable/SimpleTable";
import permissionService from "@/services/permission/permission-service";
import helper from "@/utils/helper";
import { ColumnMappingData } from "@/PageComponents/Table/table-model";
import SCModal from "@/PageComponents/Modal/SCModal";
import ImageWithZoom from "@/PageComponents/Attachment/ImageWithZoom";
import Helper from "@/utils/helper";

const addMissingIDs = (items: any[]) => {
    return items.map((x, i) => x.ID ? x : { ...x, ID: crypto.randomUUID() || 'item' + i })
}

const historyName = 'quotes'

const QuotesSectionTable: FC<
    {
        descriptionColumnWidth?: string
        quote: any;
        quoteItems: any[];
        itemId: string;
        module: number;
        onDataUpdate: (newData: any[], newSections: any[]) => void;
        addOptions: any[];
        onAddAction: (name: string) => void;
        onAddToSectionAction: (name: string, group: any) => void
        integration: boolean;
        companyTaxPercentage: number;
        onItemClicked: (item: any, index: number) => void
        onPredictedDefaultSectionPdfSettingsChanged?: (pdfSettings: { HideLineItems: boolean; DisplaySubtotal: boolean; }) => void
        onColumnMappingLoaded?: (mapping: SimpleColumnMapping[]) => void
        userColumnConfig?: ColumnMappingData[]
        customChildren?: ReactNode
    }> = (props) => {

        const canUpdate = useMemo(() => props.quote.QuoteStatus === Enums.QuoteStatus.Draft, [props.quote.QuoteStatus])

        const [hasManageCostingPermission] = useState(permissionService.hasPermission(Enums.PermissionName.ManageCosting));

        const [showImage, setShowImage] = useState<any>();

        const [currentData, setCurrentData] = useState(
            addMissingIDs(props.quoteItems)
        )

    /*useDidUpdate(() => {
        console.log('data updated', currentData)
    }, currentData)*/

        const [currentSections, setCurrentSections] = useState<any[]>([])

        const [savingItem, setSavingItem] = useState(false)

        /** manage history of data and sections */
        /*const historyId = useMemo(() => historyName + (props.itemId || crypto?.randomUUID()), [props.itemId])
        const [history, setHistory] = useState<[data: any[], sections: any[]][]>(
            getSessionHistory(historyId) ??
            [[
            addMissingIDs(props.quoteItems),
            getSectionsFromTableData(props.quoteItems, 'InventorySectionName', 'InventorySectionID', Enums.Module.Quote, props.itemId)
        ]])
        useEffect(() => {
            setSessionHistory(historyId, history)
        }, [history])
        /!*useEffect(() => {

            if(history.length === 0) {
                setHistory(p => {
                    p[p.length - 1] = [currentData, currentSections]
                    return p
                })
            }
        }, [currentData, currentSections]);*!/

        // console.log('history', history)
        const handleUndo = () => {
            if (history.length > 1) {
                const [data, sections] = history[history.length - 2]
                /!*data && sections && console.log('updating data',
                    data, sections
                )*!/
                data && sections && handleDataUpdate(
                    data/!*.map(x => {
                        const RowVersion = currentData.find((y: any) => x.ID === y.ID)?.RowVersion
                        return {...x, RowVersion}
                    })*!/,
                    sections,
                    false
                )
                setHistory(p => p.slice(0, -1))
            }
        }*/

        /** debounce all data updates and only trigger onUpdate callback when data was changed internally */
        const [debounced, setDebounced] = useDebouncedState([currentData, currentSections], 0)
        const changed = useRef(false)
        useEffect(() => {
            setDebounced([currentData, currentSections])
        }, [currentData, currentSections])
        useEffect(() => {
            if (changed.current) {
                props.onDataUpdate(debounced[0], debounced[1])
                changed.current = false
                setSavingItem(true)
            }
        }, [debounced]);
        /*useEffect(() => (
            () => {
                if (changed.current) {
                    props.onDataUpdate(currentData, currentSections)
                }
            }
        ), []);*/
        /** update current data when data changes externally - update only row version if data change was triggered with table data update internally*/
        const cancelNextUpdate = useRef(false)
        useEffect(() => {
            // console.log('quote items changed, updating...', props.quoteItems, cancelNextUpdate.current)
            if (props.quoteItems) {
                if (!cancelNextUpdate.current) {
                    const itemsWithIDs = addMissingIDs(props.quoteItems)

                    // console.log('update quote items')
                    setCurrentData(itemsWithIDs)
                    /*props.quoteItems.length !== currentData.length && // if length changed the data was modified form outside and history needs to be appended
                    setHistory((p) => ([...p, [
                        itemsWithIDs,
                        getSectionsFromTableData(itemsWithIDs, 'InventorySectionName', 'InventorySectionID', Enums.Module.JobCard, props.itemId)
                    ]]))*/
                } else {
                    cancelNextUpdate.current = false
                    /*setCurrentData( p =>
                        p.map(x => {
                            const RowVersion = props.quoteItems.find(y => y.ID === x.ID).RowVersion
                            return {...x, RowVersion}
                        })
                    )*/
                }
                setSavingItem(false)
            }
        }, [props.quoteItems])

        const handleDataUpdate = (newData/*, newSections, updateHistory = true*/) => {
            setCurrentData(newData)
            // setCurrentSections(newSections)
            // props.onDataUpdate(newData, newSections)
            changed.current = true
            cancelNextUpdate.current = true
            // updateHistory && setHistory((p) => [...p, [newData, newSections]])
        }

        const refresh = useForceUpdate()

        const handleInputChange = (key, item, newValue) => {
            if (key === 'Description' || key === 'InventoryDescription') {
                handleDataUpdate(
                    currentData.map(x => x.ID === item.ID ? ({ ...x, Description: newValue, InventoryDescription: newValue }) : x),
                    // currentSections
                )
            } else if (key === 'Quantity' || key === 'TaxPercentage' || key === 'LineDiscountPercentage' || key === 'UnitPriceExclusive' || key === 'UnitCostPrice' || key === 'UnitPriceMarkup') {

                /*if((key === 'UnitCostPrice' || key === 'UnitPriceExclusive') && newValue < 0) {
                    newValue = 0
                     Unit cost and price must not be limited to  > 0
                }*/

                const newItem = {
                    ...item,
                    [key]: newValue
                }
                if (newItem.LineDiscountPercentage < 0 || newItem.LineDiscountPercentage > 100) {
                    newItem.LineDiscountPercentage = newItem.LineDiscountPercentage < 0 ? 0 : 100
                }
                if (newItem.Quantity > 0) {
                    if (key === 'UnitPriceMarkup') {
                        if (newValue !== '') {
                            if (!+item.UnitCostPrice) {
                                // refresh()
                                // newItem.UnitPriceExclusive = 0
                                newItem.UnitPriceMarkup = item.UnitPriceMarkup === '' ? null : '' // needs to alternate to update input internal state with value change
                            }

                            if (+newItem.UnitCostPrice) {
                                newItem.UnitPriceExclusive = Math.round((newItem.UnitCostPrice + (newItem.UnitCostPrice * (newValue / 100))) * 10000) / 10000
                            }
                            /*if(typeof newItem.UnitCostPrice === 'number') {
                                if (newItem.UnitCostPrice) {
                                    newItem.UnitPriceExclusive = newItem.UnitCostPrice + (newItem.UnitCostPrice * (newValue / 100))
                                }
                            } else {
                                // newItem.UnitPriceExclusive = item.UnitPriceExclusive + (item.UnitPriceExclusive * (newValue / 100))
                            }*/
                        }

                    }

                    if (key === 'UnitCostPrice') {
                        if (!+newValue/* || !+item.UnitCostPrice*/) {
                            // newItem.UnitPriceExclusive = 0
                            newItem.UnitPriceMarkup = ''
                        } else if (!item.UnitCostPrice || item.UnitPriceMarkup === '') { // previous margin is undefined
                            const markup = Math.round((item.UnitPriceExclusive - newValue) * 10000 / newValue) / 100
                            newItem.UnitPriceMarkup = markup
                        } else if (item.UnitPriceExclusive && item.UnitCostPrice) {
                            const markup = (item.UnitPriceExclusive - item.UnitCostPrice) * 100 / item.UnitCostPrice
                            newItem.UnitPriceExclusive = Math.round((1 + (markup / 100)) * newValue * 10000)/10000
                        } else if (!item.UnitCostPrice || item.UnitCostPrice === 0) {
                            newItem.UnitPriceExclusive = newValue
                        }
                    }

                    if (key === 'UnitPriceExclusive') {
                        let buyPrice = item.UnitCostPrice ?? +(item.Inventory?.CostPrice ?? 0);
                        if (newValue !== '' && buyPrice) {
                            let sellPrice = newValue;
                            if (!!sellPrice && buyPrice === sellPrice) {
                                newItem.UnitPriceMarkup = 0;
                            } else if (buyPrice && typeof sellPrice !== "undefined") {
                                newItem.UnitPriceMarkup = Math.round((sellPrice / buyPrice - 1) * 10000) / 100;
                            } else {
                                newItem.UnitPriceMarkup = ''
                            }
                        }
                    }

                    // console.log('item changing', item, newItem, key, newValue)
                    const unitPrice = Math.round(newItem.UnitPriceExclusive * 10000) / 10000;
                    let subTotal = newItem.Quantity * unitPrice;
                    let discount = subTotal * (newItem.LineDiscountPercentage / 100);
                    let totalExclVat = subTotal - discount;
                    newItem.LineTotalExclusive = Math.round(totalExclVat * 10000) / 10000;
                } else {
                    newItem.LineTotalExclusive = 0;
                }

                handleDataUpdate(
                    currentData.map(x => x.ID === item.ID ? ({ ...x, ...newItem }) : x),
                    // currentSections
                )
            }
            // Add this to the handleInputChange function where other key conditionals are checked
            else if (key === 'UnitPriceInclusive') {
                // Extract tax percentage from the item
                const taxPercentage = +item.TaxPercentage || 0;

                // Calculate the UnitPriceExclusive from UnitPriceInclusive by removing tax
                const newUnitPriceExclusive = newValue / (1 + (taxPercentage / 100));

                // Create a new item with updated values
                const newItem = {
                    ...item,
                    UnitPriceExclusive: Math.round(newUnitPriceExclusive * 10000) / 10000
                };

                // Handle markup calculation, similar to existing UnitPriceExclusive calculation
                let buyPrice = item.UnitCostPrice ?? +(item.Inventory?.CostPrice ?? 0);
                if (newValue !== '' && buyPrice) {
                    let sellPrice = newItem.UnitPriceExclusive;
                    if (!!sellPrice && buyPrice === sellPrice) {
                        newItem.UnitPriceMarkup = 0;
                    } else if (buyPrice && typeof sellPrice !== "undefined") {
                        newItem.UnitPriceMarkup = Math.round((sellPrice / buyPrice - 1) * 10000) / 100;
                    } else {
                        newItem.UnitPriceMarkup = '';
                    }
                }

                // Calculate line total based on the new UnitPriceExclusive
                if (newItem.Quantity > 0) {
                    const unitPrice = Math.round(newItem.UnitPriceExclusive * 10000) / 10000;
                    let subTotal = newItem.Quantity * unitPrice;
                    let discount = subTotal * (newItem.LineDiscountPercentage / 100);
                    let totalExclVat = subTotal - discount;
                    newItem.LineTotalExclusive = Math.round(totalExclVat * 10000) / 10000;
                } else {
                    newItem.LineTotalExclusive = 0;
                }

                handleDataUpdate(
                    currentData.map(x => x.ID === item.ID ? ({ ...x, ...newItem }) : x)
                );
            } else {
                handleDataUpdate(
                    currentData.map(x => x.ID === item.ID ? ({ ...x, [key]: newValue }) : x),
                    // currentSections
                )
            }
        }

        const handleItemAction = (actionName: string, item: any, itemIndex: number, group: any) => {
            if (actionName === 'code') {
                props.onItemClicked(item, itemIndex)
            } else if (actionName === 'delete') {
                const newSections = group.items.length === 1 ? currentSections.filter(x => x.ID !== group.id) : currentSections
                // setCurrentSections(newSections) // will be filtered out once update is complete and data is refreshed - dont do this prematurely
                // props.onRemoveItem(item, newSections)
                handleDataUpdate(currentData.filter(x => x.ID !== item.ID)/*, newSections*/)
            }
        }
        const handleSectionAction = (name, group) => {
            if (name === 'delete') {
                handleDataUpdate(
                    currentData.filter(x => x.InventorySectionID !== group.id).map((x, i) => ({ ...x, LineNumber: i + 1 })),
                    // currentSections.filter(x => x.ID !== group.id)
                )
            } else {
                props.onAddToSectionAction(name, group)
            }
        }

        const calculateQuoteItemProfit = (quoteItem) => {
            // When cost is 0, Profit should equal LineTotalExclusive exactly.
            if (!quoteItem.Inventory || !quoteItem.Quantity || !quoteItem.UnitPriceExclusive) return "N/A";
            const round4 = (n) => Math.round((+n || 0) * 10000) / 10000;
            const qty = +quoteItem.Quantity || 0;
            const unitPrice = round4(+quoteItem.UnitPriceExclusive || 0);
            const lineDiscount = +quoteItem.LineDiscountPercentage || 0;
            const costPrice = +(quoteItem.UnitCostPrice ?? quoteItem.Inventory?.CostPrice ?? 0) || 0;

            // Mirror LineTotalExclusive calculation at 4-dec precision (no overall quote discount applied here)
            const subTotal = qty * unitPrice;
            const discount = subTotal * (lineDiscount / 100);
            const lineExcl = round4(subTotal - discount);
            const lineCost = round4(qty * costPrice);
            const profit = round4(lineExcl - lineCost);
            return profit;
        }

        const mapping = useMemo(() => {
            return [
                ...((currentData ?? []).filter(x => x.Inventory?.ThumbnailUrl).length > 0 ? [{
                    key: 'ImageUrl',
                    label: '',
                    valueFunction: (item: any) => item.Inventory?.ThumbnailUrl &&
                        <img
                            src={item.Inventory?.ThumbnailUrl}
                            style={{ height: 36, width: 36, borderRadius: 36, cursor: "pointer" }}
                            onClick={() => setShowImage(item)}
                        />
                }] : []),
                {
                    key: 'InventoryCode',
                    label: 'Code',
                    valueFunction: (item: any) => item.ProductID ? item.ProductNumber : item.InventoryCode ?? (canUpdate ? 'Edit' : ''),
                    linkAction: 'code'
                },
                {
                    key: 'Description',
                    keyFunction: (item) => item.InventoryID ? 'Description' : 'Description',
                    label: 'Description',
                    // type: canUpdate ? 'textInput' : undefined,
                    typeFunction: (item) => item.InventoryID ? 'textInput' : 'textArea',
                    stylingProps: {
                        miw: props.descriptionColumnWidth ?? '30vw',
                        darkerText: true
                    }
                },
                {
                    key: 'QuoteItemType',
                    label: 'Status',
                    type: 'status',
                    colorFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory ? (item.Integrated ? 'Green' : item.IntegrationMessage ? `Yellow` : undefined) : undefined),
                    valueFunction: (item: any) => (
                        item.QuoteItemType === Enums.QuoteItemType.Inventory && (item.Integrated ? 'Synced' : item.IntegrationMessage ? 'Error' : 'Not Synced'
                        ) || null),
                    showFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory),
                },
                {
                    key: 'Quantity',
                    label: 'Quantity',
                    typeFunction: (item) => item.QuoteItemType === Enums.QuoteItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    min: 0,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                    showFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory)
                },
                ...(hasManageCostingPermission ? [
                    {
                        key: 'UnitCostPrice',
                        label: 'Cost',
                        currencyValue: true,
                        customNumberProps: {
                            focusOnSelect: true
                        },
                        typeFunction: (item) => canUpdate && !!item.InventoryID ? 'numberInput' : undefined,
                        valueFunction: (item: any) => {
                            let costPrice = item.UnitCostPrice ?? +(item.Inventory?.CostPrice ?? 0);
                            return !!item.InventoryID ? costPrice : <></>;
                        },
                        columConfigOptions: {
                            allowShowToggle: true,
                            // allowReorder: true
                        },
                        // requiredFunction: item => item.QuoteItemType === Enums.QuoteItemType.Inventory
                    },
                    {
                        key: 'UnitPriceMarkup',
                        label: 'Markup %',
                        customNumberProps: {
                            focusOnSelect: true
                        },
                        required: false, // important to ensure clearing of values is possible without setting to 0
                        // min: -101,
                        alignRight: true,
                        typeFunction: (item) => canUpdate && !!item.InventoryID ? 'numberInput' : undefined,
                        valueFunction: (item: any) => {
                            if (item.QuoteItemType === Enums.QuoteItemType.Inventory) {
                                if (item.UnitCostPrice === 0) {
                                    return ''
                                } else if (typeof item.UnitPriceMarkup !== 'undefined') {
                                    return item.UnitPriceMarkup
                                } else {
                                    let buyPrice = item.UnitCostPrice ?? +(item.Inventory?.CostPrice ?? 0);
                                    let sellPrice = item.UnitPriceExclusive;
                                    if (typeof sellPrice !== "undefined" && buyPrice === sellPrice) {
                                        return 0;
                                    }
                                    if (buyPrice && typeof sellPrice !== "undefined") {
                                        return Math.round((sellPrice / buyPrice - 1) * 10000) / 100;
                                    } else {
                                        return ''
                                    }
                                }
                            } else {
                                return ''
                            }
                        },
                        columConfigOptions: {
                            allowShowToggle: true,
                            // allowReorder: true
                        }
                    }
                ] : []),
                {
                    key: 'UnitPriceExclusive',
                    label: 'Price Excl',
                    typeFunction: (item) => item.QuoteItemType === Enums.QuoteItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    // min: 0,
                    currencyValue: true,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    showFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory),
                    columConfigOptions: {
                        allowShowToggle: true,
                        disabled: true,
                        // allowReorder: true
                    },
                    // requiredFunction: item => item.QuoteItemType === Enums.QuoteItemType.Inventory
                },
                {
                    key: 'UnitPriceInclusive',
                    label: 'Price Incl',
                    typeFunction: (item) => item.QuoteItemType === Enums.QuoteItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    currencyValue: true,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    showFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory),
                    valueFunction: (item: any) => {
                        // Calculate UnitPriceInclusive from UnitPriceExclusive and TaxPercentage
                        const unitPriceExclusive = parseFloat(item.UnitPriceExclusive) || 0;
                        const taxPercentage = parseFloat(item.TaxPercentage) || 0;
                        const unitPriceInclusive = unitPriceExclusive * (1 + (taxPercentage / 100));
                        return unitPriceInclusive;
                    },
                    columConfigOptions: {
                        allowShowToggle: true,
                        disabled: true,
                        defaultShown: false
                    },
                },
                {
                    key: 'LineDiscountPercentage',
                    label: 'Discount %',
                    typeFunction: (item) => item.QuoteItemType === Enums.QuoteItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                    numberInputProps: {
                        min: 0,
                        max: 100
                    },
                    showFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory),
                    columConfigOptions: {
                        allowShowToggle: true,
                        // allowReorder: true
                    }
                },
                {
                    key: 'TaxPercentage',
                    label: 'Tax Rate',
                    typeFunction: (item) => item.QuoteItemType === Enums.QuoteItemType.Inventory ? (canUpdate ? 'selectInput' : undefined) : undefined,
                    showFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory),
                    selectOptions: [
                        {
                            label: 'Standard Rate',
                            value: props.companyTaxPercentage + ''
                        },
                        {
                            label: props.companyTaxPercentage === 0 ? 'Default (No VAT)' : 'No VAT',
                            value: 0 + ''
                        },
                    ].filter(x => x.label !== 'Standard Rate' || props.companyTaxPercentage !== 0), // filter out standard rate if it is 0
                    alignRight: true,
                    columConfigOptions: {
                        allowShowToggle: true,
                        // allowReorder: true
                    }
                },
                ...(hasManageCostingPermission ? [
                    {
                        key: 'Profit',
                        label: 'Profit',
                        currencyValue: true,
                        // type: canUpdate ? 'numberInput' : undefined,
                        valueFunction: (item: any) => {
                            let profit = calculateQuoteItemProfit(item);
                            let profitCheck = +profit;
                            let notANumber = isNaN(profitCheck);
                            let colour = notANumber ? "white" : profitCheck > 0 ? "green" : "orange";
                            return <span style={{ color: colour }}> {notANumber ? "" : helper.getCurrencyValue(profit)}</span>
                        },
                        columConfigOptions: {
                            allowShowToggle: true,
                            // allowReorder: true
                        }
                    }
                ] : []),
                {
                    key: 'LineTotalExclusive',
                    label: 'Total Excl',
                    currencyValue: true,
                    columConfigOptions: {
                        allowShowToggle: true,
                        defaultShown: true,
                        disabled: true,
                    },
                    // type: canUpdate ? 'numberInput' : undefined,
                    min: 0,
                    showFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory)
                },
                {
                    key: 'LineTotalInclusive',
                    label: 'Total Incl',
                    currencyValue: true,
                    min: 0,
                    showFunction: (item: any) => (item.QuoteItemType === Enums.QuoteItemType.Inventory),
                    valueFunction: (item: any) => {
                        if (!item || typeof item.LineTotalExclusive === 'undefined' || typeof item.TaxPercentage === 'undefined') {
                            return 0;
                        }

                        const lineTotalExclusive = parseFloat(item.LineTotalExclusive) || 0;
                        const taxPercentage = parseFloat(item.TaxPercentage) || 0;
                        const lineTotalInclusive = lineTotalExclusive * (1 + (taxPercentage / 100));
                        // Display value rounded once to 2 decimals (currencyValue prop will handle formatting)
                        return Helper.roundToTwo(lineTotalInclusive);
                    },
                    columConfigOptions: {
                        allowShowToggle: true,
                        defaultShown: false,
                    }
                },
            ].filter(x => x.key === 'QuoteItemType' ? props.integration : true) as SimpleColumnMapping[]
        }, [currentData, canUpdate, hasManageCostingPermission, props.companyTaxPercentage, props.descriptionColumnWidth, props.integration])

        useEffect(() => {
            if (mapping.length) {
                props.onColumnMappingLoaded && props.onColumnMappingLoaded(mapping)
            }
        }, [mapping]);

        return <>
            <Box pos={'relative'}>
                {/*<Box
                pos={'absolute'}
                top={-42}
            >
                <Alert color={'scBlue'} variant={'transparent'} icon={<Text c={'goldenrod'} fw={600} size={'10px'}>NEW</Text>}>
                    <Flex align={'center'} gap={5}><Text size={'sm'} mt={2} >Try our new Sections and Bundles when adding items below</Text></Flex>
                </Alert>
            </Box>*/}

                <SectionTable
                    // columnConfigModelName='QuoteDocument'
                    customChildren={props.customChildren}
                    userColumnConfig={props.userColumnConfig}
                    rerenderTableTriggerVal={props.descriptionColumnWidth}
                    onPredictedDefaultSectionPdfSettingsChanged={props.onPredictedDefaultSectionPdfSettingsChanged}
                    showNewBundleHint
                    data={currentData}
                    savingItem={savingItem}
                    mapping={mapping}
                    controls={canUpdate ? [
                        {
                            name: 'delete',
                            // type: 'warning',
                            icon: <IconTrash />,
                            label: 'Remove',
                            activeLabel: 'Removing'
                        },
                    ] : []}
                    sectionControls={
                        canUpdate ?
                            [
                                ...props.addOptions.map(x => ({
                                    name: x.link,
                                    icon: IconPlus,
                                    label: x.text
                                })).filter(x => x.name !== 'AddBundle'),
                                {
                                    name: 'ungroup'
                                },
                                {
                                    name: 'delete',
                                    icon: IconTrash,
                                    color: 'yellow.7',
                                    label: 'Delete Section'
                                }
                            ] : []}
                    onSectionItem={handleSectionAction}
                    onDataUpdate={handleDataUpdate}
                    onAction={handleItemAction}
                    canEdit={canUpdate}
                    stylingProps={{
                        compact: true,
                        rows: false,
                        darkerText: true
                    }}
                    onInputChange={handleInputChange}
                    addButton={canUpdate ? {
                        // label: 'Add Material / Service',
                        // callback: props.onAddItem,
                        customComponent: <Flex w={'100%'} gap={'md'}>
                            <Menu
                                shadow="md"
                            >
                                <Menu.Target>
                                    <Button c={'scBlue'} size={'compact-sm'} variant={'transparent'} type={'button'} >
                                        <IconPlus size={16} />
                                        <Anchor size={'sm'}>
                                            Add Line
                                        </Anchor>
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    {
                                        props.addOptions.map(
                                            (x, i) => (
                                                <Menu.Item key={x.text + i} onClick={() => props.onAddAction && props.onAddAction(x.link)}>
                                                    {x.text} {/*{x.newOption && <NewText h={12} />}*/}
                                                </Menu.Item>
                                            )
                                        )
                                    }
                                </Menu.Dropdown>
                            </Menu>
                        </Flex>
                    } : undefined}
                    // tableActionStates={props.tableActionStates}
                    height={'100%'}
                    sectionTitleKey={'InventorySectionName'}
                    sectionIdKey={'InventorySectionID'}
                    // sectionData={currentSections}
                    itemId={props.itemId}
                    module={Enums.Module.Quote}
                    useHideLineItemsPdfSetting
                    useDisplaySubtotalsPdfSetting
                    // onConfirmInputUpdate={props.handleSaveNewQuantity}
                    /*headingSubtotalValueFunction={(items: any[]) => {
                        const inclusivePricing = props.userColumnConfig?.find(x => x.ColumnName === 'LineTotalInclusive')?.Show;
                        let lineTotals = items.filter(x => x.QuoteItemType === Enums.QuoteItemType.Inventory).map(x => x.LineTotalExclusive);
                        return lineTotals.reduce((partialSum, a) => partialSum + a, 0);
                    }}*/
                />

            </Box>

            {showImage &&
                <SCModal
                    open={!!showImage}
                    showClose={true}
                    withCloseButton={true}
                    onClose={() => setShowImage(undefined)}
                    size={"auto"}>
                    <ImageWithZoom
                        attachment={{ ContentType: "image/jpeg", Url: showImage.Inventory?.ImageUrl ?? "", UrlThumb: showImage.Inventory?.ThumbnailUrl ?? "" }}
                    />
                </SCModal>
            }

        </>
    }
export default QuotesSectionTable
