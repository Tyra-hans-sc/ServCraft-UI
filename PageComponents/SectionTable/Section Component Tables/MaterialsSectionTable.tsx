import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as Enums from "@/utils/enums";
import { IconTrash } from "@tabler/icons";
import SectionTable, { getSectionsFromTableData } from "@/PageComponents/SectionTable/SectionTable";
import { IconPlus } from "@tabler/icons-react";
import {Anchor, Box, Button, Flex, useMantineTheme} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { useRouter } from "next/router";
import NewText from "@/PageComponents/Premium/NewText";
import ToastContext from "@/utils/toast-context";
import permissionService from "@/services/permission/permission-service";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import helper from "@/utils/helper";
import SCModal from "@/PageComponents/Modal/SCModal";
import ImageWithZoom from "@/PageComponents/Attachment/ImageWithZoom";
import WarehouseTypeIcon from "@/PageComponents/Warehouse/WarehouseTypeIcon";
import JobCostSummary from "@/PageComponents/JobInventory/JobCostSummary";

export const setSessionHistory = (uniqueKey: string, history: [data: any[], sections: any[]][]) => {
    // session history disabled atm
    // sessionStorage && sessionStorage.setItem(uniqueKey, JSON.stringify(history))
}
export const getSessionHistory: (uniqueKey: string) => [data: any[], sections: any[]][] | undefined = (uniqueKey) => {
    return undefined
    /*if(typeof sessionStorage !== 'undefined') {
        const history$ = sessionStorage.getItem(uniqueKey)
        try {
            return history$ && JSON.parse(history$) || undefined
        } catch (e) {
            return undefined
        }
    } else {
        return undefined
    }*/
}

// unique name for history storage item used in combination with itemId
const historyName = 'materials';

const MaterialsSectionTable: FC<
    {
        filteredJobInventory,
        hasAssets,
        onItemClicked,
        permissionToUpdateItems,
        inlineQuantityEditEnabled,
        onRemoveItem,
        handleQuantityChange,
        onAddItem
        onAddBundle
        // onCreateInvoice,
        // onCreatePurchaseOrder
        tableActionStates,
        onDataUpdate,
        itemId,
        onAddItemToSection,
        onAllocateMaterials,
        onUnallocateMaterials,
        isCreateJob: boolean
        jobIsOpen: boolean
        onSavingItems?: (isSaving: boolean) => void
    }> = (props) => {

        const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();

        const [showImage, setShowImage] = useState<any>();

        const [manageCostingPermission] = useState(permissionService.hasPermission(Enums.PermissionName.ManageCosting));

        const [currentData, setCurrentData] = useState(props.filteredJobInventory)
        // const [currentSections, setCurrentSections] = useState<any[]>([])
        const theme = useMantineTheme();

        const toast = useContext(ToastContext);

        const [invoicePermission] = useState(permissionService.hasPermission(Enums.PermissionName.Invoice));
        const [purchaseOrderPermission] = useState(permissionService.hasPermission(Enums.PermissionName.PurchaseOrder));

        /** force send data when leaving the page without saving*/
        const handleRouteChange = useCallback(() => {
            if (changed.current) {
                console.log('leaving page before saving, posting data changes')
                props.onDataUpdate(currentData/*, currentSections*/)
            }
        }, [currentData/*, currentSections*/])
        const router = useRouter()
        useEffect(() => {
            router.events.on('routeChangeStart', handleRouteChange)
            // If the component is unmounted, unsubscribe
            // from the event with the `off` method:
            return () => {
                router.events.off('routeChangeStart', handleRouteChange)
            }
        }, [router, handleRouteChange])

        const [savingItem, setSavingItem] = useState(false);
        const updateSavingItem = (val: boolean) => {
            setSavingItem(val);
            props.onSavingItems && props.onSavingItems(val);
        }

        /** manage history of data and sections */
        /*const historyId = useMemo(() => historyName + (props.itemId || crypto?.randomUUID()), [props.itemId])
        const [history, setHistory] = useState<[data: any[], sections: any[]][]>(
            getSessionHistory(historyId) ??
            [[
                props.filteredJobInventory,
                getSectionsFromTableData(props.filteredJobInventory, 'InventorySectionName', 'InventorySectionID', Enums.Module.JobCard, props.itemId)
            ]]
        )*/
        /*useEffect(() => {
            setSessionHistory(historyId, history)
        }, [history])*/
        /*const handleUndo = () => {
            if (history.length > 1) {
                const [data, sections] = history[history.length - 2]
                data && sections && console.log('updating data',
                    data, sections
                )
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
        const [debounced, setDebounced] = useDebouncedState(currentData, 1500)
        const changed = useRef(false)
        useEffect(() => {
            // setDebounced([currentData, currentSections])
            let dataDifferent = JSON.stringify(debounced) !== JSON.stringify(currentData);
            setSavingItem(dataDifferent);
            setDebounced(currentData)
        }, [currentData/*, currentSections*/])
        useEffect(() => {
            if (changed.current) {
                props.onDataUpdate(debounced)
                changed.current = false;
                let dataDifferent = JSON.stringify(debounced) !== JSON.stringify(currentData);
                updateSavingItem(dataDifferent);
            }
            else {
                updateSavingItem(false);
            }
        }, [debounced]);

        /** update current data when data changes externally - update only row version if data change was triggered with table data update internally*/
        const cancelNextUpdate = useRef(false)
        useEffect(() => {
            if (props.filteredJobInventory) {
                if (!cancelNextUpdate.current) {
                    setCurrentData(props.filteredJobInventory)
                    /*props.filteredJobInventory.length !== currentData.length && // if length changed the data was modified form outside and history needs to be appended
                    setHistory((p) => ([...p, [
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
                updateSavingItem(false)
            }
        }, [props.filteredJobInventory])

        const handleDataUpdate = (newData, newSections?, updateHistory = true) => {
            setCurrentData(newData)
            // setCurrentSections(newSections)
            // props.onDataUpdate(newData, newSections)
            changed.current = true
            cancelNextUpdate.current = true
            // updateHistory && setHistory((p) => [...p, [newData, newSections]])
        }

        const handleInputChange = (key, item, newValue) => {
            if (key === 'QuantityRequested' || key === 'Description' || key === 'UnitCostPrice') {
                // props.handleQuantityChange(item, newValue)
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
                // STOCK CONTROL ISQUANTITYTRACKED CHANGE
                if (helper.isInventoryWarehoused(item.Inventory) /*item.Inventory.IsQuantityTracked*/ && (item.QuantityAllocated !== 0 || item.QuantityUsed !== 0)) {
                    (toast as any).setToast({
                        message: "Cannot remove item as it is in progress or used",
                        show: true,
                        type: Enums.ToastType.error
                    });
                    return;
                }
                // const newSections = group.items.length === 1 ? currentSections.filter(x => x.ID !== group.id) : currentSections
                // setCurrentSections(newSections) // will be filtered out once update is complete and data is refreshed - dont do this prematurely
                // props.onRemoveItem(item, newSections)
                handleDataUpdate(currentData.filter(x => x.ID !== item.ID)/*, newSections*/)
            }
        }
        const handleSectionAction = (name, group) => {
            if (name === 'material') {
                props.onAddItemToSection(group)
            } else if (name === 'delete') {

                // STOCK CONTROL ISQUANTITYTRACKED CHANGE
                if ((group.items as any[]).some(x => helper.isInventoryWarehoused(x.Inventory) /*x.Inventory.IsQuantityTracked*/ && (x.QuantityUsed !== 0 || x.QuantityAllocated !== 0))) {
                    (toast as any).setToast({
                        message: "Cannot delete section as some items in it are in progress or used",
                        show: true,
                        type: Enums.ToastType.error
                    });
                    return;
                }


                handleDataUpdate(
                    currentData.filter(x => x.InventorySectionID !== group.id).map((x, i) => ({ ...x, LineNumber: i + 1 })),
                    // currentSections.filter(x => x.ID !== group.id)
                )
            }
        }


        const hasMaterials = useMemo(() => {
            return ((props.filteredJobInventory ?? []) as any[]).length > 0;
        }, [props.filteredJobInventory]);

        const hasMaterialsAllocated = useMemo(() => {
            return ((props.filteredJobInventory ?? []) as any[]).some(x => x.QuantityAllocated !== 0);
        }, [props.filteredJobInventory]);

        useEffect(() => {
            featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
                setHasStockControl(!!feature);
            });
        }, []);

        return <>
            <SectionTable
                data={currentData}
                // history={history}
                // onUndo={handleUndo}
                savingItem={savingItem}
                lineClamp={3}
                mapping={[
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
                        stylingProps: {
                            miw: 360,
                            darkerText: true
                        },
                        valueFunction: (item: any) => props.permissionToUpdateItems ? item.Description || item.InventoryDescription : <div style={{ maxWidth: 360 }}>{item.Description || item.InventoryDescription}</div>, // if description is blank, inherit from inventory
                        type: props.permissionToUpdateItems ? 'textInput' : '' // removed inline edit as not sure about validation on autosave
                    },
                    {
                        key: 'DynamicType',
                        label: 'Type',
                        type: 'stockItemType',
                        valueFunction: (item: any) => item.ProductID ? 'Asset' : Enums.getEnumStringValue(Enums.StockItemType, item.Inventory?.StockItemType)
                    },
                    ...(props.hasAssets && [{
                        key: 'ProductNumber',
                        label: 'Asset/Serial no.'
                    }] || []),
                    ...(manageCostingPermission ? [{
                        key: 'UnitCostPrice',
                        label: 'Unit Cost',
                        type: props.permissionToUpdateItems ? 'numberInput' : '', // removed inline edit as not sure about validation on autosave
                        currencyValue: true,
                        alignRight: true,
                        numberInputProps: {maw: 100},
                        customNumberProps: {
                            focusOnSelect: true,
                        },
                    }] : []),
                    {
                        key: 'QuantityRequested',
                        label: 'Quantity',
                        type: props.permissionToUpdateItems && props.inlineQuantityEditEnabled ? 'numberInput' : '',
                        // min: (item) => 0,
                        validationFunction: (value, item) =>
                            helper.isInventoryWarehoused(item.Inventory) ?
                                value !== 0 && (item.QuantityUsed ?? 0) <= value ? null : ' must be greater than ' + item.QuantityUsed :
                                value > 0 ? null : 'must be greater than 0',
                        alignRight: true,
                        numberInputProps: {maw: 100},
                        customNumberProps: {
                            focusOnSelect: true
                        },
                    },
                    // {
                    //     key: 'QuantityAllocated',
                    //     label: 'Reserved',
                    //     valueFunction: (item: any) => {
                    //         return item.Inventory.StockItemType === Enums.StockItemType.Service ? <></> : item.QuantityAllocated;
                    //     }
                    // },
                    ...(hasStockControl === true && [
                        ...(!props.isCreateJob ? [{
                            key: 'QuantityUsed',
                            label: 'Used',
                            valueFunction: (item: any) => {
                                return helper.isInventoryWarehoused(item.Inventory) ? item.QuantityUsed : <></>;
                            },
                            alignRight: true
                        },
                            // {
                            //     key: 'QuantityInvoiced',
                            //     label: 'Invoiced',
                            //     alignRight: true
                            // },
                            // {
                            //     key: 'QuantityInvoicedDraft',
                            //     label: 'Draft Invoiced ',
                            //     alignRight: true
                            // }
                        ] : []),
                        {
                            key: 'Warehouse',
                            label: 'Warehouse',
                            valueFunction: (item: any) => {
                                // STOCK CONTROL ISQUANTITYTRACKED CHANGE
                                return helper.isInventoryWarehoused(item.Inventory) ?
                                    <Flex align={"center"} gap={'xs'}>
                                        <WarehouseTypeIcon warehouse={item.Warehouse} />
                                        <span style={item.Warehouse ? {} : { color: theme.colors.yellow[6], fontWeight: "bold" }} title={item.Warehouse?.Name}>{item.Warehouse?.Code ?? "Unallocated"}</span>
                                    </Flex>
                                    : <></>;
                            }

                        }] || [])

                ]}
                controls={[
                    ...(props.permissionToUpdateItems ? [
                        {
                            name: 'delete',
                            // type: 'warning',
                            icon: <IconTrash />,
                            label: 'Remove',
                            activeLabel: 'Removing'
                        },
                    ] : [])
                ]}
                sectionControls={
                    props.permissionToUpdateItems ?
                        [
                            {
                                name: 'material',
                                icon: IconPlus,
                                label: 'Add Material / Service'
                            },
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
                // onReorderIndex={props.onReorder}
                onDataUpdate={handleDataUpdate}
                // onNewSection={setCurrentData}
                onAction={handleItemAction}
                canEdit={props.permissionToUpdateItems}
                stylingProps={{
                    compact: true,
                    rows: false,
                    darkerText: true
                }}
                onInputChange={handleInputChange}
                addButton={{
                    // label: 'Add Material / Service',
                    // callback: props.onAddItem,
                    customComponent: <Flex w={'100%'} gap={'md'}>

                        {props.jobIsOpen && props.permissionToUpdateItems && <>
                            <Button c={'scBlue'} onClick={props.onAddItem} size={'compact-sm'} variant={'transparent'} type={'button'} >
                                <IconPlus size={16} />
                                <Anchor size={'sm'}>
                                    Add Material / Service
                                </Anchor>
                            </Button>
                            <Button c={'scBlue'} onClick={() => { props.onAddBundle() }} size={'compact-sm'} variant={'transparent'} type={'button'} >
                                <IconPlus size={16} />
                                <Anchor size={'sm'}>
                                    Add Bundle{/* <NewText miw={20} />*/}
                                </Anchor>
                            </Button>
                        </>}

                        {/*{invoicePermission && !props.isCreateJob &&
                            <Button c={'scBlue'} disabled={savingItem} title={savingItem ? "Waiting for materials to save" : ""} onClick={() => { props.onCreateInvoice() }} size={'compact-sm'} variant={'transparent'} type={'button'} >
                                <IconPlus size={16} />
                                <Anchor size={'sm'}>
                                    Add Invoice
                                </Anchor>
                            </Button>}

                        {purchaseOrderPermission && !props.isCreateJob &&
                            <Button c={'scBlue'} disabled={savingItem} title={savingItem ? "Waiting for materials to save" : ""} onClick={() => { props.onCreatePurchaseOrder() }} size={'compact-sm'} variant={'transparent'} type={'button'} >
                                <IconPlus size={16} />
                                <Anchor size={'sm'}>
                                    Add Purchase Order
                                </Anchor>
                            </Button>}*/}

                        {/* {!props.isCreateJob && hasMaterials && !hasMaterialsAllocated && <Button c={'scBlue'} onClick={() => { props.onAllocateMaterials() }} size={'compact-sm'} variant={'light'} type={'button'} >
                            <Anchor size={'sm'}>
                                Put Materials In Progress
                            </Anchor>
                        </Button>}

                        {!props.isCreateJob && hasMaterials && hasMaterialsAllocated && <Button c={'scBlue'} onClick={() => { props.onUnallocateMaterials() }} size={'compact-sm'} variant={'light'} type={'button'} >
                            <Anchor size={'sm'}>
                                Remove Materials From In Progress
                            </Anchor>
                        </Button>} */}
                    </Flex>
                }}
                tableActionStates={props.tableActionStates}
                height={'100%'}
                sectionTitleKey={'InventorySectionName'}
                sectionIdKey={'InventorySectionID'}
                // sectionData={currentSections}
                itemId={props.itemId}
                module={Enums.Module.JobCard}
            // onConfirmInputUpdate={props.handleSaveNewQuantity}
            />
            {manageCostingPermission && (currentData?.length ?? 0) !== 0 && <Box pos={'relative'} h={35}>
                <Box pos={'absolute'} bottom={props.jobIsOpen && props.permissionToUpdateItems ? 45 : 20} right={25}>
                    <JobCostSummary items={currentData} />
                </Box>
            </Box>}
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
export default MaterialsSectionTable
