import React, { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as Enums from "@/utils/enums";
import { IconTrash } from "@tabler/icons";
import SectionTable from "@/PageComponents/SectionTable/SectionTable";
import { IconPlus } from "@tabler/icons-react";
import { Anchor, Box, Button, Flex, Menu, Text, useMantineTheme } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { SimpleColumnMapping } from "@/PageComponents/SimpleTable/SimpleTable";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import helper from "@/utils/helper";
import SCModal from "@/PageComponents/Modal/SCModal";
import ImageWithZoom from "@/PageComponents/Attachment/ImageWithZoom";
import permissionService from "@/services/permission/permission-service";
import Helper from "@/utils/helper";
import WarehouseTypeIcon from "@/PageComponents/Warehouse/WarehouseTypeIcon";

const addMissingIDs = (items: any[]) => {
    return items.map((x, i) => x.ID ? x : { ...x, ID: crypto.randomUUID() || 'item' + i })
}

const historyName = 'invoices'

const InvoiceSectionTable: FC<
    {
        descriptionColumnWidth?: string
        invoice: any;
        invoiceItems: any[];
        itemId: string;
        module: number;
        onDataUpdate: (newData: any[]/*, newSections: any[]*/) => void;
        addOptions: any[];
        onAddAction: (name: string) => void;
        onAddToSectionAction: (name: string, group: any) => void
        integration: boolean;
        companyTaxPercentage: number;
        onItemClicked: (item: any, index: number) => void
        onPredictedDefaultSectionPdfSettingsChanged?: (pdfSettings: { HideLineItems: boolean; DisplaySubtotal: boolean; }) => void
        customChildren?: ReactNode
        onColumnMappingLoaded?: (mapping: SimpleColumnMapping[]) => void
        userColumnConfig?: any[]
    }> = (props) => {

        const theme = useMantineTheme();
        const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();

        const [showImage, setShowImage] = useState<any>();

        useEffect(() => {
            featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
                setHasStockControl(!!feature);
            });
        }, []);

        const canUpdate = useMemo(() => props.invoice.InvoiceStatus === Enums.InvoiceStatus.Draft, [props.invoice.InvoiceStatus])

        const [currentData, setCurrentData] = useState(
            addMissingIDs(props.invoiceItems)
        )

        const [currentSections, setCurrentSections] = useState<any[]>([])

        const [savingItem, setSavingItem] = useState(false)
        /*
            /!** manage history of data and sections *!/
            const historyId = useMemo(() => historyName + (props.itemId || crypto?.randomUUID()), [props.itemId])
            const [history, setHistory] = useState<[data: any[], sections: any[]][]>(
                getSessionHistory(historyId) ?? [[
                addMissingIDs(props.invoiceItems),
                getSectionsFromTableData(props.invoiceItems, 'InventorySectionName', 'InventorySectionID', Enums.Module.Invoice, props.itemId)
            ]])

            useEffect(() => {
                setSessionHistory(historyId, history)
            }, [history])*/

        /*useEffect(() => {
            if(history.length === 0) {
                setHistory(p => {
                    p[p.length - 1] = [currentData, currentSections]
                    return p
                })
            }
        }, [currentData, currentSections]);*/

        // console.log('history', history)
        /*const handleUndo = () => {
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
            // setDebounced([currentData, currentSections])
            setDebounced(currentData)
        }, [currentData/*, currentSections*/])
        useEffect(() => {
            if (changed.current) {
                props.onDataUpdate(debounced)
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
            if (props.invoiceItems) {
                if (!cancelNextUpdate.current) {
                    const itemsWithIDs = addMissingIDs(props.invoiceItems)

                    // console.log('update quote items')
                    setCurrentData(itemsWithIDs)
                    /*props.invoiceItems.length !== currentData.length && // if length changed the data was modified form outside and history needs to be appended
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
        }, [props.invoiceItems])

        useEffect(() => {
            if (mapping.length) {
                props.onColumnMappingLoaded && props.onColumnMappingLoaded(mapping)
            }
        }, []);

        const handleDataUpdate = (newData/*, newSections*//*, updateHistory = true*/) => {
            setCurrentData(newData)
            // setCurrentSections(newSections)
            // props.onDataUpdate(newData, newSections)
            changed.current = true
            cancelNextUpdate.current = true
            // updateHistory && setHistory((p) => [...p, [newData, newSections]])
        }

        const handleInputChange = (key, item, newValue) => {
            if (key === 'Description' || key === 'InventoryDescription') {
                handleDataUpdate(
                    currentData.map(x => x.ID === item.ID ? ({ ...x, Description: newValue, InventoryDescription: newValue }) : x),
                    // currentSections
                )
            } else if (key === 'Quantity' || key === 'TaxPercentage' || key === 'LineDiscountPercentage' || key === 'UnitPriceExclusive') {
                const newItem = {
                    ...item,
                    [key]: newValue
                }
                if (newItem.LineDiscountPercentage < 0 || newItem.LineDiscountPercentage > 100) {
                    newItem.LineDiscountPercentage = newItem.LineDiscountPercentage < 0 ? 0 : 100
                }
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
                    currentData.map(x => x.ID === item.ID ? ({ ...x, ...newItem }) : x),
                    // currentSections
                )
            } else if (key === 'UnitPriceInclusive') {
                // Extract tax percentage from the item
                const taxPercentage = +item.TaxPercentage || 0;

                // Calculate the UnitPriceExclusive from UnitPriceInclusive by removing tax
                const newUnitPriceExclusive = newValue / (1 + (taxPercentage / 100));

                // Create a new item with updated values
                const newItem = {
                    ...item,
                    UnitPriceExclusive: Math.round(newUnitPriceExclusive * 10000) / 10000 // for maximum accuracy use 4 decimals - the DB can store floating point up to 4 decimals
                };

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
                // const newSections = group.items.length === 1 ? currentSections.filter(x => x.ID !== group.id) : currentSections
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

        const [hasManageCostingPermission] = useState(permissionService.hasPermission(Enums.PermissionName.ManageCosting));

        const mapping = useMemo(() => {
            return [
                ...((currentData ?? []).filter(x => x.Inventory?.ThumbnailUrl).length > 0 ? [{
                    key: 'ImageUrl',
                    label: '',
                    valueFunction: (item: any) => item.Inventory?.ThumbnailUrl && <img
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
                    key: 'InvoiceItemType',
                    label: 'Status',
                    type: 'status',
                    colorFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory ? (item.Integrated ? 'Green' : item.IntegrationMessage ? `Yellow` : undefined) : undefined),
                    valueFunction: (item: any) => (
                        item.InvoiceItemType === Enums.InvoiceItemType.Inventory && (item.Integrated ? 'Synced' : item.IntegrationMessage ? 'Error' : 'Not Synced'
                        ) || null),
                    showFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory),
                },
                {
                    key: 'Quantity',
                    label: 'Quantity',
                    typeFunction: (item) => item.InvoiceItemType === Enums.InvoiceItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    min: 0,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                    showFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory)
                },
                ...(hasStockControl && [{
                    key: 'Warehouse',
                    label: 'Warehouse',
                    alignRight: false,
                    valueFunction: (item: any) => {
                        return helper.isInventoryWarehoused(item.Inventory) ?
                            <Flex align={"center"} gap={'xs'}>
                                <WarehouseTypeIcon warehouse={item.Warehouse} />
                                <span style={item.Warehouse ? {} : { color: theme.colors.yellow[6], fontWeight: "bold" }} title={item.Warehouse?.Name}>{item.Warehouse?.Code ?? "Unallocated"}</span>
                            </Flex>
                            : <></>;
                    }
                }] || []),
                {
                    key: 'UnitPriceExclusive',
                    label: 'Price Excl',
                    alignRight: true,
                    typeFunction: (item) => item.InvoiceItemType === Enums.InvoiceItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    // min: 0,
                    currencyValue: true,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    showFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory),
                    columConfigOptions: {
                        allowShowToggle: true,
                        defaultShown: true,
                        disabled: true,
                    }
                },
                {
                    key: 'UnitPriceInclusive',
                    label: 'Price Incl',
                    alignRight: true,
                    typeFunction: (item) => item.InvoiceItemType === Enums.InvoiceItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    currencyValue: true,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    showFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory),
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
                        defaultShown: false,
                    }
                },
                {
                    key: 'LineDiscountPercentage',
                    label: 'Discount %',
                    alignRight: true,
                    typeFunction: (item) => item.InvoiceItemType === Enums.InvoiceItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    showFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory),
                    numberInputProps: {
                        min: 0,
                        max: 100
                    },
                    columConfigOptions: {
                        allowShowToggle: true,
                    }
                },
                {
                    key: 'TaxPercentage',
                    label: 'Tax Rate',
                    alignRight: true,
                    typeFunction: (item) => item.InvoiceItemType === Enums.InvoiceItemType.Inventory ? (canUpdate ? 'selectInput' : undefined) : undefined,
                    showFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory),
                    selectOptions: [
                        {
                            label: 'Standard Rate',
                            value: props.companyTaxPercentage + ''
                        },
                        {
                            label: props.companyTaxPercentage === 0 ? 'Default (No VAT)' : 'No VAT',
                            value: 0 + ''
                        },
                    ].filter(x => x.label !== 'Standard Rate' || props.companyTaxPercentage !== 0),
                    columConfigOptions: {
                        allowShowToggle: true,
                    }
                },
                {
                    key: 'LineTotalExclusive',
                    label: 'Total Excl',
                    currencyValue: true,
                    alignRight: true,
                    // type: canUpdate ? 'numberInput' : undefined,
                    min: 0,
                    columConfigOptions: {
                        allowShowToggle: true,
                        defaultShown: true,
                        disabled: true,
                    },
                    showFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory),
                },
                {
                    key: 'LineTotalInclusive',
                    label: 'Total Incl',
                    currencyValue: true,
                    alignRight: true,
                    min: 0,
                    showFunction: (item: any) => (item.InvoiceItemType === Enums.InvoiceItemType.Inventory),
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
                        defaultShown: false
                    }
                }
            ].filter(x => x.key === 'InvoiceItemType' ? props.integration : true) as SimpleColumnMapping[]
        }, [currentData, canUpdate, hasManageCostingPermission, props.companyTaxPercentage, props.descriptionColumnWidth, props.integration])

        useEffect(() => {
            if (mapping.length) {
                props.onColumnMappingLoaded && props.onColumnMappingLoaded(mapping)
            }
        }, [mapping]);

        return <>
            <Box pos={'relative'}>
                <SectionTable
                    userColumnConfig={props.userColumnConfig}
                    customChildren={props.customChildren}
                    onPredictedDefaultSectionPdfSettingsChanged={props.onPredictedDefaultSectionPdfSettingsChanged}
                    showNewBundleHint
                    data={currentData}
                    // history={history}
                    // onUndo={props.invoice?.InvoiceStatus === Enums.InvoiceStatus.Draft ? handleUndo : undefined}
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
                /* headingSubtotalValueFunction={(items: any[]) => {
                     let lineTotals = items.filter(x => x.InvoiceItemType === Enums.InvoiceItemType.Inventory).map(x => x.LineTotalExclusive);
                     return lineTotals.reduce((partialSum, a) => partialSum + a, 0);
                 }}*/
                // columnConfigModelName={'InvoiceDocument'}
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
export default InvoiceSectionTable
