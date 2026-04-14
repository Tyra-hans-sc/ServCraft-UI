import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import SimpleTable from "@/PageComponents/SimpleTable/SimpleTable";
import * as Enums from "@/utils/enums";
import { IconTrash } from "@tabler/icons";
import permissionService from "@/services/permission/permission-service";
import { Anchor, Button, Flex, Menu } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import NewText from "@/PageComponents/Premium/NewText";
import SectionTable from "@/PageComponents/SectionTable/SectionTable";
import { useDebouncedState, useDidUpdate } from "@mantine/hooks";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import helper from "@/utils/helper";
import SCModal from "../Modal/SCModal";
import ImageWithZoom from "../Attachment/ImageWithZoom";


const addMissingIDs = (items: any[]) => {
    return items.map((x, i) => x.ID ? x : { ...x, ID: crypto.randomUUID() || 'item' + i })
}


const PurchasesSectionTable: FC<{
    purchaseOrder
    purchaseOrderItems,
    onDataUpdate,
    onItemClicked,
    tableActionStates,
    companyTaxPercentage,
    integration,
    addOptions,
    onAddAction,
    itemId,
    customChildren,
    onColumnMappingLoaded
    userColumnConfig
}> = (props) => {

    const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();

    const [showImage, setShowImage] = useState<any>();

    const canUpdate = useMemo(() => props.purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Draft, [props.purchaseOrder.PurchaseOrderStatus])

    const [hasManageCostingPermission] = useState(permissionService.hasPermission(Enums.PermissionName.ManageCosting));

    const [currentData, setCurrentData] = useState(
        addMissingIDs(props.purchaseOrderItems)
    )

    const [currentSections, setCurrentSections] = useState<any[]>([])

    const [savingItem, setSavingItem] = useState(false)

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

    useEffect(() => {
        featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
            setHasStockControl(!!feature);
        });
    }, []);

    /** update current data when data changes externally - update only row version if data change was triggered with table data update internally*/
    const cancelNextUpdate = useRef(false)
    useDidUpdate(() => {
        // console.log('po items changed, updating...', props.purchaseOrderItems, cancelNextUpdate.current)
        if (props.purchaseOrderItems) {
            if (!cancelNextUpdate.current) {
                const itemsWithIDs = addMissingIDs(props.purchaseOrderItems)

                // console.log('update po items', itemsWithIDs)
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
    }, [props.purchaseOrderItems])

    const handleDataUpdate = (newData/*, newSections, updateHistory = true*/) => {
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
                let subTotal = newItem.Quantity * (Math.round(newItem.UnitPriceExclusive * 100) / 100);
                let discount = subTotal * (newItem.LineDiscountPercentage / 100);
                let totalExclVat = subTotal - discount;
                newItem.LineTotalExclusive = Math.round(totalExclVat * 100) / 100;
            } else {
                newItem.LineTotalExclusive = 0;
            }

            handleDataUpdate(
                currentData.map(x => x.ID === item.ID ? ({ ...x, ...newItem }) : x)
            );
        } else if (key === 'Quantity' || key === 'TaxPercentage' || key === 'LineDiscountPercentage' || key === 'UnitPriceExclusive') {
            const newItem = {
                ...item,
                [key]: newValue
            }
            if (newItem.LineDiscountPercentage < 0 || newItem.LineDiscountPercentage > 100) {
                newItem.LineDiscountPercentage = newItem.LineDiscountPercentage < 0 ? 0 : 100
            }
            if (newItem.Quantity > 0) {
                let subTotal = newItem.Quantity * (Math.round(newItem.UnitPriceExclusive * 100) / 100);
                let discount = subTotal * (newItem.LineDiscountPercentage / 100);
                let totalExclVat = subTotal - discount;
                const taxPercentage = newItem.TaxPercentage || 0;
                let totalInclVat = totalExclVat * (1 + (taxPercentage / 100));

                newItem.LineTotalExclusive = Math.round(totalExclVat * 100) / 100;
                newItem.LineTotalInclusive = Math.round(totalInclVat * 100) / 100;

                // Calculate UnitPriceInclusive from UnitPriceExclusive
                newItem.UnitPriceInclusive = Math.round((newItem.UnitPriceExclusive * (1 + (taxPercentage / 100))) * 100) / 100;
            } else {
                newItem.LineTotalExclusive = 0;
                newItem.LineTotalInclusive = 0;
                newItem.UnitPriceInclusive = 0;
            }

            handleDataUpdate(
                currentData.map(x => x.ID === item.ID ? ({ ...x, ...newItem }) : x),
                // currentSections
            )
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
    /*const handleSectionAction = (name, group) => {
        if (name === 'delete') {
            handleDataUpdate(
                currentData.filter(x => x.InventorySectionID !== group.id).map((x, i) => ({ ...x, LineNumber: i + 1 })),
                // currentSections.filter(x => x.ID !== group.id)
            )
        } else {
            // props.onAddToSectionAction(name, group)
        }
    }*/

    const mapping = useMemo(() =>
            [
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
                    valueFunction: (item: any) => item.ProductID ? item.ProductNumber : item.InventoryCode,
                    linkAction: 'code'
                },
                {
                    key: 'Description',
                    label: 'Description',
                    // type: canUpdate ? 'textInput' : undefined,
                    typeFunction: (item) => item.InventoryID ? 'textInput' : 'textArea',
                    stylingProps: {
                        miw: '30vw',
                        darkerText: true
                    },
                    inputProps: {
                        width: '100%'
                    }
                },
                ...(props.integration ? [
                    {
                        key: 'ItemType',
                        label: 'Status',
                        type: 'status',
                        colorFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory ? (item.Integrated ? 'Green' : item.IntegrationMessage ? `Yellow` : undefined) : undefined),
                        valueFunction: (item: any) => (
                            item.InvoiceItemType === Enums.ItemType.Inventory && (item.Integrated ? 'Synced' : item.IntegrationMessage ? 'Error' : 'Not Synced'
                            ) || null),
                        showFunction: (item: any) => item.ItemType === Enums.ItemType.Inventory,
                    }
                ] : []) as any,
                {
                    key: 'Quantity',
                    label: 'Quantity',
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    min: 0,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                    showFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory)
                },
                ...(hasStockControl &&
                (props.purchaseOrder?.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Approved || props.purchaseOrder?.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Billed) ? [{
                    key: 'QuantityReceived',
                    label: 'Received',
                    alignRight: true,
                    showFunction: (item: any) => helper.isInventoryWarehoused(item.Inventory),
                    valueFunction: (item: any) => item.QuantityReceived ?? 0
                }] : []),
                {
                    key: 'UnitPriceExclusive',
                    label: 'Price Excl',
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    // min: 0,
                    currencyValue: true,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                    showFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory),
                    columConfigOptions: {
                        allowShowToggle: true,
                        disabled: true,
                        defaultShown: true
                    }
                },
                {
                    key: 'UnitPriceInclusive',
                    label: 'Price Incl',
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    currencyValue: true,
                    customNumberProps: {
                        focusOnSelect: true,
                    },
                    alignRight: true,
                    showFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory),
                    valueFunction: (item: any) => {
                        // Calculate UnitPriceInclusive from UnitPriceExclusive and TaxPercentage
                        const unitPriceExclusive = item.UnitPriceExclusive || 0;
                        const taxPercentage = item.TaxPercentage || 0;
                        const unitPriceInclusive = unitPriceExclusive * (1 + (taxPercentage / 100));
                        return unitPriceInclusive;
                    },
                    columConfigOptions: {
                        allowShowToggle: true,
                        disabled: true,
                        defaultShown: false
                    }
                },
                {
                    key: 'LineDiscountPercentage',
                    label: 'Discount %',
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (canUpdate ? 'numberInput' : undefined) : undefined,
                    customNumberProps: {
                        focusOnSelect: true
                    },
                    alignRight: true,
                    numberInputProps: {
                        min: 0,
                        max: 100
                    },
                    showFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory),
                    columConfigOptions: {
                        allowShowToggle: true,
                    }
                },
                {
                    key: 'TaxPercentage',
                    label: 'Tax Rate',
                    valueFunction: (item => item.TaxPercentage + ''),
                    typeFunction: (item) => item.ItemType === Enums.ItemType.Inventory ? (canUpdate ? 'selectInput' : undefined) : undefined,
                    showFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory),
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
                    alignRight: true,
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
                    showFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory),
                    columConfigOptions: {
                        allowShowToggle: true,
                        disabled: true,
                        defaultShown: true
                    }
                },
                {
                    key: 'LineTotalInclusive',
                    label: 'Total Incl',
                    currencyValue: true,
                    alignRight: true,
                    min: 0,
                    showFunction: (item: any) => (item.ItemType === Enums.ItemType.Inventory),
                    valueFunction: (item: any) => {
                        // Calculate LineTotalInclusive from LineTotalExclusive and TaxPercentage
                        const lineTotalExclusive = item.LineTotalExclusive || 0;
                        const taxPercentage = item.TaxPercentage || 0;
                        const lineTotalInclusive = lineTotalExclusive * (1 + (taxPercentage / 100));
                        return helper.roundToTwo(lineTotalInclusive * 100) / 100;
                    },
                    columConfigOptions: {
                        allowShowToggle: true,
                        defaultShown: false
                    }
                }
            ]
        , [currentData, canUpdate, hasManageCostingPermission, props.companyTaxPercentage, /*props.descriptionColumnWidth,*/ props.integration])

    useEffect(() => {
        props.onColumnMappingLoaded && props.onColumnMappingLoaded(mapping)
    }, [mapping]);

    return <>
        <SectionTable
            userColumnConfig={props.userColumnConfig}
            customChildren={props.customChildren}
            allowSections={false}
            onPredictedDefaultSectionPdfSettingsChanged={console.log}
            onSectionItem={console.log}
            sectionControls={[]}
            module={Enums.Module.PurchaseOrder}
            onDataUpdate={handleDataUpdate}
            data={currentData}
            height={'100%'}
            sectionTitleKey={'InventorySectionName'}
            sectionIdKey={'InventorySectionID'}
            // sectionData={currentSections}
            itemId={props.itemId}
            onAction={handleItemAction}
            canEdit={canUpdate && !!props.purchaseOrder.SupplierID}
            stylingProps={{
                compact: true,
                rows: false,
                darkerText: true,
            }}
            onInputChange={handleInputChange}
            mapping={mapping}
            controls={[
                ...(canUpdate ? [{
                    name: 'delete',
                    // type: 'warning',
                    icon: <IconTrash />,
                    label: 'Remove',
                    activeLabel: 'Removing'
                }] : [])
            ]}
            addButton={canUpdate ? {
                label: '',
                // callback: props.onAddItem,
                customComponent: <Flex w={'100%'} gap={'md'}>

                    {!!props.purchaseOrder.SupplierID ?

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
                                                {x.text} {x.newOption && <NewText h={12} />}
                                            </Menu.Item>
                                        )
                                    )
                                }
                            </Menu.Dropdown>
                        </Menu> : <div style={{ color: "orange", fontStyle: "italic", margin: "0.5rem 0 0.5rem -0.5rem" }}>Select a <span style={{ fontWeight: "bold" }}>supplier above</span> to add lines</div>
                    }
                </Flex>
            } : undefined}
        // columnConfigModelName={'PurchaseOrderDocument'}
        // tableActionStates={props.tableActionStates}
        // onConfirmInputUpdate={props.handleSaveNewQuantity}
        />

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

export default PurchasesSectionTable
