import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import * as Enums from "@/utils/enums";
import SectionTable from "@/PageComponents/SectionTable/SectionTable";
import { useDebouncedState } from "@mantine/hooks";
import { useRouter } from "next/router";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";

const JobMaterialsSelectTable: FC<
    {
        filteredJobInventory
        itemId
        onSelectedItemsChanged: (allSelectedItems: any[]) => void
        blockFullyInvoicedSelection?: boolean
        module: number
        resetSelections?: number
    }> = (props) => {

        const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();

        useEffect(() => {
            featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
                setHasStockControl(!!feature);
            });
        }, []);

        const [currentData, setCurrentData] = useState(props.filteredJobInventory)
        const [currentSections, setCurrentSections] = useState<any[]>([])

        // Use resetSelections prop as a key for the SectionTable component
        // When resetSelections changes, the SectionTable will be re-mounted and its internal state will be reset

        /** force send data when leaving the page without saving*/
        const handleRouteChange = useCallback(() => {
            if (changed.current) {
                console.log('leaving page before saving, posting data changes')
            }
        }, [currentData, currentSections])
        const router = useRouter()
        useEffect(() => {
            router.events.on('routeChangeStart', handleRouteChange)
            // If the component is unmounted, unsubscribe
            // from the event with the `off` method:
            return () => {
                router.events.off('routeChangeStart', handleRouteChange)
            }
        }, [router, handleRouteChange])

        /** debounce all data updates and only trigger onUpdate callback when data was changed internally */
        // const [debounced, setDebounced] = useDebouncedState([currentData/*, currentSections*/], 1500)
        const [debounced, setDebounced] = useDebouncedState(currentData/*, currentSections*/, 1500)
        const changed = useRef(false)
        useEffect(() => {
            setDebounced(currentData/*, currentSections*/)
        }, [currentData/*, currentSections*/])
        useEffect(() => {
            if (changed.current) {
                changed.current = false
                // setSavingItem(true)
            }
        }, [debounced]);

        /** update current data when data changes externally - update only row version if data change was triggered with table data update internally*/
        const cancelNextUpdate = useRef(false)
        useEffect(() => {
            if (props.filteredJobInventory) {
                if (!cancelNextUpdate.current) {
                    setCurrentData(props.filteredJobInventory)
                    // props.filteredJobInventory.length !== currentData.length && // if length changed the data was modified form outside and history needs to be appended
                    /*setHistory((p) => ([...p, [
                        props.filteredJobInventory,
                        getSectionsFromTableData(props.filteredJobInventory, 'InventorySectionName', 'InventorySectionID', Enums.Module.JobCard, props.itemId)
                    ]]))*/
                } else {
                    cancelNextUpdate.current = false
                    /*setCurrentData( p =>
                        p.map(x => {
                            const RowVersion = props.filteredJobInventory.find(y => y.ID === x.ID).RowVersion
                            return {...x, RowVersion}
                        })
                    )*/
                }
                // setSavingItem(false)
            }
        }, [props.filteredJobInventory])

        const handleDataUpdate = (newData, /*newSections, updateHistory = true*/) => {
            setCurrentData(newData)
            // setCurrentSections(newSections)
            // props.onDataUpdate(newData, newSections)
            changed.current = true
            cancelNextUpdate.current = true
            // updateHistory && setHistory((p) => [...p, [newData, newSections]])
        }

        const handleInputChange = (key, item, newValue) => {
            if (key === 'QuantityRequested') {
                // props.handleQuantityChange(item, newValue)
                handleDataUpdate(
                    currentData.map(x => x.ID === item.ID ? ({ ...x, [key]: newValue }) : x)
                    /*,currentSections*/
                )
            }
        }

        const handleItemAction = (actionName: string, item: any, itemIndex: number, group: any) => {
            if (actionName === 'code') {
            } else if (actionName === 'delete') {
                // const newSections = group.items.length === 1 ? currentSections.filter(x => x.ID !== group.id) : currentSections
                // setCurrentSections(newSections) // will be filtered out once update is complete and data is refreshed - dont do this prematurely
                // props.onRemoveItem(item, newSections)
                handleDataUpdate(currentData.filter(x => x.ID !== item.ID)/*, newSections*/)
            }
        }
        const handleSectionAction = (name, group) => {
            if (name === 'material') {
            } else if (name === 'delete') {
                handleDataUpdate(
                    currentData.filter(x => x.InventorySectionID !== group.id).map((x, i) => ({ ...x, LineNumber: i + 1 })),
                    // currentSections.filter(x => x.ID !== group.id)
                )
            }
        }
        //.filter(x => props.blockFullyInvoicedSelection !== true || x.QuantityRequested > x.QuantityInvoiced)
        return <>
            <SectionTable
                key={`job-materials-select-table-${props.resetSelections}`}
                data={currentData}
                // history={history}
                // onUndo={handleUndo}
                // savingItem={savingItem}
                itemsSelected={props.onSelectedItemsChanged}
                itemsSelectedFilter={props.blockFullyInvoicedSelection ? (item: any) => {
                    if (props.module !== Enums.Module.Invoice && item?.QuantityRequested === undefined || item?.QuantityInvoiced === undefined || item?.QuantityInvoicedDraft === undefined) return true;
                    return !hasStockControl || item.QuantityRequested > (item.QuantityInvoiced + item.QuantityInvoicedDraft);
                } : undefined}
                lineClamp={3}
                mapping={[
                    {
                        key: 'InventoryCode',
                        label: 'Code',
                        valueFunction: (item: any) => item.ProductID ? item.ProductNumber : item.InventoryCode,
                        linkAction: 'code'
                    },
                    {
                        key: 'Description',
                        label: 'Description',
                        valueFunction: (item: any) => <div style={{maxWidth: "200px"}} title={item.Description || item.InventoryDescription}>{item.Description || item.InventoryDescription}</div>,
                        maxColumnWidth: 50
                    },
                    {
                        key: 'DynamicType',
                        label: 'Type',
                        type: 'stockItemType',
                        valueFunction: (item: any) => item.ProductID ? 'Asset' : Enums.getEnumStringValue(Enums.StockItemType, item.Inventory?.StockItemType)
                    },
                    {
                        key: 'QuantityRequested',
                        label: 'Qty',
                        min: 0,
                        alignRight: true,
                    },
                    ...(hasStockControl && props.module === Enums.Module.Invoice && [
                        {
                            key: 'QuantityInvoiced',
                            label: 'Invoiced',
                            min: 0,
                            valueFunction: (item) => item.QuantityInvoiced + item.QuantityInvoicedDraft,
                            alignRight: true,
                        },
                        {
                            key: 'Quantity',
                            label: 'Add to Invoice',
                            min: 0,
                            valueFunction: (item) => {
                                let diff = item.QuantityRequested - item.QuantityInvoiced - item.QuantityInvoicedDraft;
                                if (diff < 0) diff = 0;
                                return <div style={{ fontWeight: "bold", color: (diff > 0 ? "green" : "orange") }}>{diff}</div>
                            },
                            alignRight: true,
                        }
                    ] as any || []),
                    ...(hasStockControl && props.module === Enums.Module.Quote && [
                        {
                            key: 'QuantityQuoted',
                            label: 'Quoted',
                            min: 0,
                            valueFunction: (item) => item.QuantityQuoted,
                            alignRight: true,
                        }
                    ] as any || []),
                    ...(hasStockControl && props.module === Enums.Module.PurchaseOrder && [
                        {
                            key: 'QuantityOnPurchaseOrder',
                            label: 'Purchased',
                            min: 0,
                            valueFunction: (item) => item.QuantityOnPurchaseOrder,
                            alignRight: true,
                        }
                    ] as any || [])

                ]}
                controls={[]}
                sectionControls={[]}
                onSectionItem={handleSectionAction}
                // onReorderIndex={props.onReorder}
                onDataUpdate={handleDataUpdate}
                // onNewSection={setCurrentData}
                onAction={handleItemAction}
                canEdit={false}
                stylingProps={{
                    compact: true,
                    rows: false,
                    darkerText: true
                }}
                // height={'calc(50vh)'}
                height={'100%'}
                sectionTitleKey={'InventorySectionName'}
                sectionIdKey={'InventorySectionID'}
                // sectionData={currentSections}
                itemId={props.itemId}
                module={Enums.Module.JobCard}
            // onConfirmInputUpdate={props.handleSaveNewQuantity}
            />

        </>
    }
export default JobMaterialsSelectTable
