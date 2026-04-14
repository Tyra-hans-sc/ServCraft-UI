import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    Anchor,
    Box,
    Button,
    Flex,
    Group,
    Loader,
    LoadingOverlay,
    SimpleGrid,
    Space,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import InventoryCategorySelector from "@/components/selectors/inventory/inventory-category-selector";
import InventorySubcategorySelector from "@/components/selectors/inventory/inventory-subcategory-selector";
import SupplierSelector from "@/components/selectors/supplier/supplier-selector";
import SCSwitch from "@/components/sc-controls/form-controls/sc-switch";
import { useForm } from "@mantine/form";
import * as Enums from "@/utils/enums";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import SCDropDownList from '../../components/sc-controls/form-controls/sc-dropdownlist';
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import Fetch from "@/utils/Fetch";
import Helper from "@/utils/helper";
import constants from "@/utils/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { showNotification, updateNotification } from "@mantine/notifications";
import CreateNewCategoryModal from "@/PageComponents/Inventory/CreateNewCategoryModal";
import CreateNewSubcategoryModal from "@/PageComponents/Inventory/CreateNewSubcategoryModal";
import CreateNewSupplierModal from "@/PageComponents/Inventory/CreateNewSupplierModal";
import { FieldSetting, getFieldSettings } from "@/PageComponents/Settings/Field Settings/FieldSettings";
import {
    getFormNameForSystemName,
    getSystemNameForFormName
} from "@/PageComponents/Settings/Field Settings/fieldSettingHelper";
import SCDatePicker from "@/components/sc-controls/form-controls/sc-datepicker";
import ConfirmAction from "@/components/modals/confirm-action";
import { useRouter } from "next/router";
import PS from "@/services/permission/permission-service";
import Link from "next/link";
import { IconQuestionCircle } from "@tabler/icons";
import UnitSelector from "../Selectors/UnitSelector";
import permissionService from "@/services/permission/permission-service";
import stockService from "@/services/stock/stock-service";
import { WarehouseStock } from "@/interfaces/api/models";
import integrationService from "@/services/integration-service";
import SimpleTable from "../SimpleTable/SimpleTable";
import featureService from "@/services/feature/feature-service";
import ToastContext from "@/utils/toast-context";
import StockTransactionHistory from "@/PageComponents/Inventory/StockTransactionHistory";
import { useDidUpdate, useElementSize } from "@mantine/hooks";
import InventoryService from "@/services/inventory/inventory-service";
import BetaText from "@/PageComponents/Premium/BetaText";
import time from "@/utils/time";
import ItemDisplayImages from "../Attachment/ItemDisplayImages";

const _userAdmin = PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin);

const InventoryItemForm: FC<{
    isNew?: boolean
    inventory?: any
    onInventorySaved: (data) => void
    onInventorySavedRefreshOnly?: (data) => void
    onClose: () => void
    accessStatus?: any
    isService?: boolean
    triggerSaveCounter?: any
    onNewStatus?: (status: 'loading' | 'error' | 'success' | 'none') => void
    hideSaveAndCancel?: boolean
    hideTitle?: boolean
    onSetInventory?: (inventory: any) => void
    validateAndCloseCounter?: number
    forceFetchLatestData?: boolean
    onImageUploaded?: () => void
    isNestedForm?: boolean
}> = ({ isNew, inventory: inputInventory, onInventorySaved, onClose, accessStatus, isService, triggerSaveCounter, onNewStatus,
    hideSaveAndCancel, hideTitle, onSetInventory, onInventorySavedRefreshOnly, onImageUploaded,
    validateAndCloseCounter, forceFetchLatestData, isNestedForm = false }) => {


        const preventNextDirtyState = useRef(false)
        const [inventory, setInventory] = useState(inputInventory);

        const [editStockLevelsPermission] = useState(permissionService.hasPermission(Enums.PermissionName.WarehouseStockEditLevels));
        const [viewStockTransactionsPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionsView));

        const { data: inventoryData, isFetching, refetch: refreshInventory } = useQuery(
            ['inventory', inventory?.ID],
            () => InventoryService.getInventory(inventory?.ID),
            {
                enabled: !!forceFetchLatestData && !!inventory?.ID,
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                refetchOnMount: true,
            }
        )

        useEffect(() => {
            if (inventoryData) {
                setInventory(inventoryData)
            }
        }, [inventoryData])

        const [costPricePermission] = useState(permissionService.hasPermission(Enums.PermissionName.InventoryCostPrice));

        /** fieldSettings Start */
        const inventoryFieldSettings = useQuery(['inventoryFieldSettings'], () => getFieldSettings(Enums.Module.Inventory))
        const settingsBySystemName: { [fieldSystemName: string]: FieldSetting } = useMemo(() => {
            if (inventoryFieldSettings.data) {
                return inventoryFieldSettings.data.reduce((previousValue, currentValue) => ({
                    ...previousValue,
                    [currentValue.FieldSystemName]: { ...currentValue }
                }), {})
            } else {
                return {}
            }
        }, [inventoryFieldSettings.data])
        const isRequired = useCallback((name: string) => {
            const systemName = getSystemNameForFormName(name)
            return settingsBySystemName.hasOwnProperty(systemName) ? isShown(name) && settingsBySystemName[systemName].IsRequired : false
        }, [settingsBySystemName])
        const isShown = useCallback((name: string) => {
            const systemName = getSystemNameForFormName(name)
            return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive && (!!inventory || !settingsBySystemName[systemName].HideOnCreate) : false
        }, [settingsBySystemName, inventory])
        /** fieldSettings End */

        const toast = useContext(ToastContext);

        const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
        const [selectedInventoryCategory, setSelectedInventoryCategory] = useState<any>(null);
        const [selectedInventorySubcategory, setSelectedInventorySubcategory] = useState<any>(null);

        useEffect(() => {

            getWarehouseStockForInventory()

            /*
            doesnt fix issue
            if(inventory?.InventorySubcategory?.ID !== selectedInventorySubcategory?.ID) {
                form.setFieldValue('InventorySubcategoryDescription', inventory.InventorySubcategoryDescription)
                setSelectedInventorySubcategory(inventory.InventorySubcategory)
            }*/
        }, [inventory]);

        const [warehouseStock, setWarehouseStock] = useState<WarehouseStock[]>([]);
        const [inputErrors, setInputErrors] = useState<any>({});
        const [integration, setIntegration] = useState<any>();

    const { data: hasVanStock } = useQuery(['hasVanStock'], () => featureService.getFeature(constants.features.VAN_STOCK));

    const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();

        const { data: supplierData } = useQuery(['supplier', inventory?.SupplierID], () => Fetch.get({
            url: `/Supplier/${inventory.SupplierID}`
        } as any), {
            enabled: !!inventory?.SupplierID
        })

        useEffect(() => {
            if (supplierData) {
                setSelectedSupplier(supplierData)
                form.setFieldValue('SupplierName', supplierData?.Name || null)
            }
        }, [supplierData])
        const { data: categoryData } = useQuery(['category', inventory?.InventoryCategoryID], () => Fetch.get({
            url: `/InventoryCategory?id=${inventory.InventoryCategoryID}`
        } as any), {
            enabled: !!inventory?.InventoryCategoryID,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false
        })

        useEffect(() => {
            if (categoryData) {
                setSelectedInventoryCategory(categoryData)
                form.setFieldValue('InventoryCategoryDescription', categoryData?.Description || null)
            }
        }, [categoryData])
        const { data: subcategoryData } = useQuery(['subcategory', inventory?.InventorySubcategoryID], () => Fetch.get({
            url: `/InventorySubcategory?id=${inventory.InventorySubcategoryID}`
        } as any), {
            enabled: !!inventory?.InventorySubcategoryID,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false
        })

        useEffect(() => {
            if (subcategoryData) {
                setSelectedInventorySubcategory(subcategoryData)
                form.setFieldValue('InventorySubcategoryDescription', subcategoryData?.Description || null)
            }
        }, [subcategoryData])
        const { data: unitData } = useQuery(['unit', inventory?.UnitOfMeasurementID], () => Fetch.get({
            url: `/UnitOfMeasurement?id=${inventory.UnitOfMeasurementID}`
        } as any), {
            enabled: !!inventory?.UnitOfMeasurementID
        })

        useEffect(() => {
            if (unitData) {
                form.setFieldValue('UnitOfMeasurementName', unitData?.Name || null)
                form.setFieldValue('UnitOfMeasurementID', unitData?.ID || null)
            }
        }, [unitData])

        const initialValues = useMemo(() => ({
            Code: isNew ? '' : inventory.Code,
            Description: isNew ? '' : inventory.Description,
            InventoryCategoryDescription: isNew ? '' : inventory.InventoryCategoryDescription,
            InventorySubcategoryDescription: isNew ? '' : inventory.InventorySubcategoryDescription,
            StockItemTypeDescription: isNew ? isService ? Enums.getEnumStringValue(Enums.StockItemType, Enums.StockItemType.Service) : '' : Enums.getEnumStringValue(Enums.StockItemType, inventory.StockItemType),
            WarrantyPeriod: isNew ? 0 : inventory.WarrantyPeriod,
            Quantity: isNew ? 0 : inventory.Quantity,
            SupplierName: isNew ? '' : inventory.SupplierName,
            UnitOfMeasurementName: isNew ? '' : inventory.UnitOfMeasurementName,
            AdditionalInformation: isNew ? false : inventory.AdditionalInformation,
            IsSerializable: isNew ? false : inventory.IsSerializable,
            CostPrice: isNew ? 0 : inventory.CostPrice,
            ListPrice: isNew ? 0 : inventory.ListPrice,
            CommissionPercentage: isNew ? 0 : inventory.CommissionPercentage,
            BinLocation: isNew ? '' : inventory.BinLocation,
            CustomText1: isNew ? '' : inventory.CustomText1,
            CustomText2: isNew ? '' : inventory.CustomText2,
            CustomText3: isNew ? '' : inventory.CustomText3,
            CustomText4: isNew ? '' : inventory.CustomText4,
            CustomBoolean1: isNew ? false : inventory.CustomBoolean1,
            CustomBoolean2: isNew ? false : inventory.CustomBoolean2,
            CustomDate1: isNew ? null : inventory.CustomDate1,
            CustomDate2: isNew ? null : inventory.CustomDate2,
            CustomNumber1: isNew ? null : inventory.CustomNumber1,
            CustomNumber2: isNew ? null : inventory.CustomNumber2,
            WebForm: isNew ? false : inventory.WebForm,
            IsActive: isNew ? true : inventory.IsActive,
            IsQuantityTracked: isNew ? true : inventory.IsQuantityTracked,
            PrimaryDisplayImageID: isNew ? null : inventory.PrimaryDisplayImageID
        }), [isNew, inventory])

        const form = useForm({
            initialValues: initialValues,
            validate: {
                BinLocation: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: isRequired('BinLocation'),
                    customErrorText: 'Specify bin location'
                } as any),
                Description: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: 'Specify inventory description'
                } as any),
                InventoryCategoryDescription: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: isRequired('InventoryCategory'), // using form name directly
                    customErrorText: 'Specify inventory category'
                } as any),
                InventorySubcategoryDescription: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: isRequired('InventorySubcategory'), // using form name directly
                    customErrorText: 'Specify inventory subcategory'
                } as any),
                StockItemTypeDescription: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: 'Specify stock item type'
                } as any),
                SupplierName: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: isRequired('SupplierName'),
                    customErrorText: 'Specify supplier name'
                } as any),
                UnitOfMeasurementName: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: isRequired('UnitOfMeasurement'),
                    customErrorText: 'Specify unit name'
                } as any),
                WarrantyPeriod: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: isRequired('WarrantyPeriod'),
                    greaterThanOrEquals: 0
                } as any),
                Quantity: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: true,
                    // greaterThanOrEquals: 0
                } as any),
                CostPrice: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: true,
                    greaterThanOrEquals: 0
                } as any),
                ListPrice: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: true,
                    greaterThanOrEquals: 0
                } as any),
                CommissionPercentage: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: true,
                    greaterThanOrEquals: 0
                } as any),
                CustomText1: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: /*settingsBySystemName['CustomTextField1'].IsRequired*/ isRequired('CustomText1'),
                } as any),
                CustomText2: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: isRequired('CustomText2'),
                } as any),
                CustomText3: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: /*settingsBySystemName['CustomTextField1'].IsRequired*/ isRequired('CustomText3'),
                } as any),
                CustomText4: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: isRequired('CustomText4'),
                } as any),
                CustomNumber1: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: isRequired('CustomNumber1'),
                } as any),
                CustomNumber2: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: isRequired('CustomNumber2'),
                } as any),
                CustomDate1: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Date,
                    required: isRequired('CustomDate1')
                } as any),
                CustomDate2: (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Date,
                    required: isRequired('CustomDate2')
                } as any),
                //IsQuantityTracked: (x) => !x && inventory?.HasStockTransactions === true ? "Quantity must be tracked for this item" : null

            }
        });

        const [markup, setMarkup] = useState<number | string>();
        useEffect(() => {
            if(initialValues.CostPrice && initialValues.ListPrice){
                setMarkup(`${Math.round((initialValues.ListPrice / initialValues.CostPrice-1) * 10000) /100}`); 
            } else {
                setMarkup(``);
            }
        }, [initialValues.CostPrice, initialValues.ListPrice]);

        const handleMarkupChange = (number: number | string) => {
            const unitCostPrice = form.values.CostPrice;
            typeof number === 'number' && form.setFieldValue('ListPrice', unitCostPrice + (unitCostPrice * (+number / 100)))
            setMarkup(number)
        }

        const getWarehouseStockForInventory = async () => {
            let stock = await stockService.getWarehouseStockForInventory(inventory?.ID ?? Helper.emptyGuid());
            setWarehouseStock(stock);
        };

        const getIntegration = async () => {
            let int = await integrationService.getIntegration();
            setIntegration(int);
        }

        useEffect(() => {
            featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
                let localHasStockControl = !!feature;
                setHasStockControl(localHasStockControl);
                quantityIsTrackedCheck(localHasStockControl);
            });
            getIntegration();
            getWarehouseStockForInventory();
        }, []);

        /** Confirm Options*/
        const router = useRouter()
        const navUrl = useRef('')
        const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

        const saveInventoryItem = async (params) => {
            const res = isNew && await Fetch.post({
                url: `/Inventory`,
                params: params,
            } as any) || await Fetch.put({
                url: `/Inventory`,
                params: params
            } as any);

            if (res.ID) {
                return res;
            } else {
                throw new Error(res.serverMessage || res.message || 'Something went wrong');
            }
        }

        const [isDirty, setIsDirty] = useState(false)

        const { isLoading, mutate, status } = useMutation(['createInventoryItem'], saveInventoryItem, {
            onSuccess: (data) => {
                Helper.mixpanelTrack(isNew ? constants.mixPanelEvents.createInventory : constants.mixPanelEvents.editInventory, {
                    'inventoryID': data.ID
                } as any);

                if (isNew || (inputInventory?.ID === inventory?.ID)) { // if the inventory wasn't changed and saved as a result of that...
                    onInventorySaved(data);  // onInventorySaved closes a view
                } else {
                    onInventorySavedRefreshOnly && onInventorySavedRefreshOnly(data)
                }

                setIsDirty(false);

                updateNotification({
                    id: 'createInventoryMessage',
                    message: `Inventory item successfully ${isNew ? 'created' : 'updated'}`,
                    color: 'scBlue',
                    loading: false,
                    autoClose: 2000
                });
            },
            onSettled: (data) => {
                if (navUrl.current) {
                    Helper.nextRouter(router.push, navUrl.current)
                }

                if (inputInventory?.ID !== inventory?.ID) {
                    setInventory(inputInventory)
                } else {
                    setInventory(data)
                }
                getWarehouseStockForInventory();

            },
            onError: (err: any) => {
                const message = `Inventory item could not be  ${isNew ? 'created' : 'updated'}`
                updateNotification({
                    id: 'createInventoryMessage',
                    message: err?.message || message,
                    color: 'yellow',
                    loading: false,
                    autoClose: 3000
                });
                setIsDirty(true)
                if (!!inputInventory) {
                    refreshInventory()
                }
            },
            onMutate: () => {
                showNotification({
                    id: 'createInventoryMessage',
                    message: `${isNew ? 'Creating' : 'Updating'} inventory item`,
                    color: 'scBlue',
                    loading: true,
                    autoClose: false
                });
                setIsDirty(false)
            }
        });

        const confirmInventoryCloseOrUpdate = useCallback((event: 'close' | 'update') => {
            if (isDirty && !isLoading) {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    display: true,
                    showCancel: true,
                    onCancel: () => {
                        if (event === 'update') {
                            onSetInventory && onSetInventory(inventory)
                        }
                    },
                    showDiscard: true,
                    onDiscard: () => {
                        if (event === 'update') {
                            setInventory(inputInventory)
                        } else if (event === 'close') {
                            onClose && onClose()
                        }
                    },
                    heading: "Save Changes?",
                    text: isNew ? 'Would you like to save your changes?' : `Would you like to save your changes to ${inventory.Description}?`,
                    confirmButtonText: "Save",
                    onConfirm: () => {
                        handleSubmit()
                    }
                })
            }
        }, [isDirty, form.values, isLoading])

        useEffect(() => {
            if ((inventory && inputInventory && inventory.ID !== inputInventory.ID) && isDirty) {
                confirmInventoryCloseOrUpdate('update')
            } else {
                preventNextDirtyState.current = true
                setInventory(inputInventory)
            }
        }, [inputInventory]);

        useDidUpdate(() => {
            if (validateAndCloseCounter && isDirty) { // will be 0 | undefined initially so will not fire on init
                confirmInventoryCloseOrUpdate('close')
            } else {
                onClose && onClose()
            }
        }, [validateAndCloseCounter]);


        useEffect(() => {
            if (!preventNextDirtyState.current) {
                const dirtyItems = Object.entries(form.values).filter(([key, value]) =>
                    (typeof value === 'string' ? value.trim() !== initialValues[key] : value !== initialValues[key]) && key !== 'UnitOfMeasurementID'
                )
                // console.log('dirty items', dirtyItems, form.values, initialValues, inventory)
                if (dirtyItems.length !== 0) {
                    if (form.isDirty()) {
                        setIsDirty(true)
                    }
                } else {
                    setIsDirty(false)
                }
            } else {
                setTimeout(
                    () => preventNextDirtyState.current = false, 100
                )
            }
        }, [initialValues, form.values]);

        useEffect(() => {
            // console.log(form.values, 'updated')
            form.setValues(initialValues)
        }, [initialValues])

        const handleWarehouseStockQuantityChange = (warehouseStockItem: WarehouseStock, value: number | '', trackingAccountingValue) => {
            let warehouseStockTemp = [...warehouseStock.map(x => ({ ...x }))];
            let idx = warehouseStockTemp.findIndex(x => x.WarehouseID === warehouseStockItem.WarehouseID);
            value = +(value ?? 0);
            let oldValue = warehouseStockTemp[idx].QuantityOnHand ?? 0;
            let diff = value - oldValue;

            warehouseStockTemp[idx].QuantityOnHand = value;

            // if tracking accounting value, rebalance the levels using delta
            if (trackingAccountingValue && warehouseStockItem.Warehouse?.IsDefault !== true) {
                idx = warehouseStockTemp.findIndex(x => x.Warehouse?.IsDefault === true);
                warehouseStockTemp[idx].QuantityOnHand = (warehouseStockTemp[idx].QuantityOnHand ?? 0) - diff;
            }

            setWarehouseStock(warehouseStockTemp);
            setIsDirty(true);
        }

        const validateStock = () => {
            let errors: any = {};
            let isValid = true;
            warehouseStock.forEach(whs => {
                if (typeof whs.QuantityOnHand !== "number") {
                    isValid = false;
                    errors[`Quantity_${whs.WarehouseID}`] = "Quantity is required";
                }
            });

            setInputErrors(errors);

            return isValid;
        };

        const handleSubmit = (v = form.values) => {
            if (!form.validate().hasErrors && validateStock() && isDirty) {
                let setStockItemType = Enums.StockItemType[v.StockItemTypeDescription];
                const params = {
                    ...(inventory || {}),
                    ...v,
                    InventoryCategoryID: /*isShown('InventoryCategory') &&*/ selectedInventoryCategory ? selectedInventoryCategory?.ID : null,
                    InventorySubcategoryID: /*isShown('InventorySubcategory') &&*/ selectedInventorySubcategory ? selectedInventorySubcategory?.ID : null,
                    SupplierID: /*isShown('Supplier') &&*/ selectedSupplier ? selectedSupplier.ID : null,
                    StockItemType: setStockItemType,
                    WarehouseStock: editStockLevelsPermission ? warehouseStock : null,
                    IsQuantityTracked: /*setStockItemType === Enums.StockItemType.Service ? false :*/ v.IsQuantityTracked
                };
                mutate(params)
            } else {
                navUrl.current = ''
                onNewStatus && onNewStatus('none')
                if (!isDirty && !form.validate().hasErrors && !hideSaveAndCancel) {
                    onInventorySaved(inventory);
                }
                scrollToErrors();
            }
        }

        const manualSubmit = () => {
            if(!form.validate().hasErrors && validateStock()) {
                handleSubmit(form.getTransformedValues())
            }
        }

        useEffect(() => {
            // console.log('errors', form.errors)
        }, [form.errors]);

        const accountingQuantityDisabled = useMemo(() => {
            // disable if no integration or integration is not live
            if (!integration || integration?.Status !== Enums.IntegrationStatus.Live) return true;

            // disable if not quickbooks, or if quickbooks and created after 2024-09-25 00:00:00
            return integration.Partner !== Enums.IntegrationPartner.QuickBooks || time.parseDate(integration.CreatedDate).valueOf() > time.parseDate("2024-09-25 00:00:00").valueOf();
        }, [integration]);

        const scrollToErrors = () => {
            // console.log('scroll')
            setTimeout(() => {
                const errors = Object.entries(form.validate().errors)

                if (errors.length !== 0) {
                    const [itemName, error] = errors[0]

                    showNotification({
                        id: 'fieldErrors',
                        title: 'There are errors on the page',
                        message: error,
                        color: 'yellow',
                        autoClose: 2000
                    })

                    // const el = document.getElementsByName(itemName)
                    const el = document.querySelectorAll('[data-error]')
                    if (el.length !== 0) {
                        el[0]?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        })
                    }
                }
            }, 100)
        }


        const saveAndNavigate = (url: string) => {
            navUrl.current = url
            handleSubmit(form.values)
        }
        Helper.preventRouteChange(isDirty, setIsDirty, setConfirmOptions, saveAndNavigate, true);

        useEffect(() => {
            if (isDirty) {
                handleSubmit(form.values)
            } else {
                onNewStatus && onNewStatus('none')
            }
        }, [triggerSaveCounter])

        useEffect(() => {
            if (onNewStatus) {
                if (status === 'success' || status === 'loading' || status === 'error') {
                    onNewStatus(status)
                } else {
                    onNewStatus('none')
                }
            }
        }, [status]);

        const calculateIsServiceType = (stockItemType = form.values.StockItemTypeDescription) => {
            return stockItemType === Enums.getEnumStringValue(Enums.StockItemType, Enums.StockItemType.Service);
        }

        const isServiceType = useMemo(() => {
            return calculateIsServiceType();
        }, [form.values.StockItemTypeDescription])


        const lastKnownStockItemType = useRef(form.values.StockItemTypeDescription);

        useEffect(() => {

            if (calculateIsServiceType()) {
                form.setFieldValue("IsQuantityTracked", false);
            }
            else if (calculateIsServiceType(lastKnownStockItemType.current) || !lastKnownStockItemType.current) {
                form.setFieldValue("IsQuantityTracked", true);
            }
            lastKnownStockItemType.current = form.values.StockItemTypeDescription;
        }, [form.values.StockItemTypeDescription]);

        /** Confirm Options End*/
        // console.log(form, form.values)

        // const [stockItemTypes] = useState(Enums.getEnumItems(Enums.StockItemType).filter(x => inventory?.HasStockTransactions !== true || x !== Enums.getEnumStringValue(Enums.StockItemType, Enums.StockItemType.Service)));
        const stockItemTypes = useMemo(
            () => Enums.getEnumItems(Enums.StockItemType).filter(x => inventory?.HasStockTransactions !== true || x !== Enums.getEnumStringValue(Enums.StockItemType, Enums.StockItemType.Service)),
            [inventory]
        );

        const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
        const [showCreateSubcategoryModal, setShowCreateSubcategoryModal] = useState(false);
        const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);

        // console.log('form value', form.values);
        const onCreateNewInventorySubcategory = () => {
            if (selectedInventoryCategory?.ID) {
                setShowCreateSubcategoryModal(true)
            } else {
                showNotification({
                    message: 'Please select a category first',
                    color: 'scBlue'
                })
            }
        }

        const quantityIsTrackedCheck = (localHasStockControl) => {
            if (localHasStockControl && inventory?.HasStockTransactions === true && !form.values.IsQuantityTracked) {
                form.setFieldValue('IsQuantityTracked', true);
                (toast as any).setToast({
                    message: 'Quantity Tracking switched on, as inventory has stock transactions. Please save the inventory.',
                    show: true,
                });
            }
        }

        const onPrimaryDisplayImageUpdate = async (attachmentID: string | null) => {

            let result = await Fetch.put({
                url: `/Inventory/${inventory.ID}/PrimaryDisplayImage/${attachmentID}`,
                toastCtx: toast
            })

            if (result.ID) {
                form.setFieldValue('PrimaryDisplayImageID', attachmentID);
                form.setFieldValue("RowVersion", result.RowVersion);
                form.setDirty({ PrimaryDisplayImageID: false, RowVersion: false });
                onInventorySaved({
                    ...result,
                    PrimaryDisplayImageID: attachmentID,
                    RowVersion: result.RowVersion
                });
            }
        }

        const warehouseStockWarehouse = useMemo(() => {
            return warehouseStock.filter(x => x.Warehouse?.WarehouseType === Enums.WarehouseType.Warehouse)
                .sort((a, b) => (a.Warehouse?.Code ?? '') > (b.Warehouse?.Code ?? '') ? 1 : -1);
        }, [warehouseStock]);

        const warehouseStockMobile = useMemo(() => {
            return warehouseStock.filter(x => x.Warehouse?.WarehouseType === Enums.WarehouseType.Mobile)
                .sort((a, b) => (a.Warehouse?.Code ?? '') > (b.Warehouse?.Code ?? '') ? 1 : -1);
        }, [warehouseStock]);

        const { height, ref } = useElementSize()

    return <>

        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions}/>

        {
            !hideTitle &&
            <Title
                my={'var(--mantine-spacing-lg)'}
                size={'lg'}
                fw={600}
            >
                {isNew && 'Create Inventory Item' || 'Edit Inventory Item'}
            </Title>
        }

        <form onSubmit={form.onSubmit(handleSubmit)}>

            <LoadingOverlay
                visible={isFetching} zIndex={1000} overlayProps={{radius: "sm", blur: 2}}
            />

            <Box ref={ref}>

                {!isNew &&
                    <ItemDisplayImages
                        itemID={inventory?.ID}
                        module={Enums.Module.Inventory}
                        onPrimaryDisplayImageUpdate={onPrimaryDisplayImageUpdate}
                        primaryDisplayImageID={form.values.PrimaryDisplayImageID}
                        onImageUploaded={onImageUploaded}
                    />
                }

                <SimpleGrid spacing={{
                    base: 'lg',
                    md: 'sm'
                }}
                            verticalSpacing={0}
                            cols={{
                                base: 1,
                                md: 2
                            }}
                >


                    <ScTextControl
                        label="Inventory code"
                        description="Leave blank to auto generate"
                        {...form.getInputProps('Code')}
                        name={'Code'}
                    />
                    <ScTextControl
                        label="Description"
                        withAsterisk
                        {...form.getInputProps('Description')}
                        name={'Description'}
                        tabIndex={0}
                    />
                    {
                        isShown('InventoryCategory') &&
                        <InventoryCategorySelector
                            onCreateNewCategory={() => setShowCreateCategoryModal(true)}
                            accessStatus={accessStatus}
                            error={form.getInputProps('InventoryCategoryDescription').error}
                            required={isRequired('InventoryCategory')}
                            // selectedCategory={selectedInventoryCategory}
                            selectedCategory={selectedInventoryCategory}
                            setSelectedCategory={(e) => {
                                setSelectedInventoryCategory(e);
                                // handleInputChange({name: "InventoryCategoryDescription", value: e ? e.Description : null});
                                form.setFieldValue('InventoryCategoryDescription', e?.Description || null)
                                if (!isShown('InventorySubcategory') && inventory?.InventorySubcategoryID) { // clearing subcategory when it's out of context and category changes
                                    setSelectedInventorySubcategory(null);
                                    form.setFieldValue('InventorySubcategoryDescription', null)
                                }
                            }}
                            {...form.getInputProps('InventoryCategoryDescription')}
                            name={'InventoryCategoryDescription'}
                            pageSize={10}
                            cypress={null}
                            disabled={false}
                        />
                    }

                    {
                        isShown('InventorySubcategory') &&
                        <Tooltip label={'Please select an inventory category first'}
                                 events={{hover: true, focus: true, touch: true}}
                                 color={'scBlue.8'}
                                 inline
                                 openDelay={250}
                                 disabled={!!selectedInventoryCategory}
                                 offset={-15}
                            // offset={-70}
                            // offset={-110}
                        >
                            <div>
                                <InventorySubcategorySelector
                                    onCreateNewInventorySubcategory={onCreateNewInventorySubcategory}
                                    accessStatus={accessStatus}
                                    error={form.getInputProps('InventorySubcategoryDescription').error}
                                    // hint={!selectedInventoryCategory && 'Please select a category first'}
                                    required={isRequired('InventorySubcategory')}
                                    selectedCategory={selectedInventoryCategory}
                                    selectedSubcategory={selectedInventorySubcategory}
                                    setSelectedSubcategory={(e) => {
                                        // console.log('setting subcategory', e)
                                        setSelectedInventorySubcategory(e);
                                        form.setFieldValue('InventorySubcategoryDescription', e?.Description || null)
                                    }}
                                    disabled={!selectedInventoryCategory}
                                    cypress={null}
                                    pageSize={10}
                                    name={'InventorySubcategoryDescription'}
                                />
                            </div>

                        </Tooltip>
                    }

                    <SCDropDownList
                        options={stockItemTypes}
                        // error={inputErrors.StockItemTypeDescription}
                        disabled={isService}
                        label="Stock Item Type"
                        required={true}
                        // name="StockItemTypeDescription"
                        {...form.getInputProps('StockItemTypeDescription')}
                        name={'StockItemTypeDescription'}
                    />


                    {
                        isShown('Supplier') &&
                        <SupplierSelector
                            onCreateNewSupplier={() => setShowCreateSupplierModal(true)}
                            accessStatus={accessStatus}
                            required={isRequired('Supplier')}
                            selectedSupplier={selectedSupplier}
                            setSelectedSupplier={(e) => {
                                setSelectedSupplier(e);
                                form.setFieldValue('SupplierName', e?.Name || e)
                            }}
                            error={form.getInputProps('SupplierName').error}
                        />
                    }

                    {
                        isShown('UnitOfMeasurement') &&
                        <UnitSelector
                            withAsterisk={isRequired('UnitOfMeasurement')}
                            {...form.getInputProps('UnitOfMeasurementName')}
                            mt={'sm'}
                            label={'Units'}
                            onItemSelected={(e) => {
                                form.setFieldValue('UnitOfMeasurementName', e?.Name || '')
                                form.setFieldValue('UnitOfMeasurementID', e?.ID || '')
                            }}
                            onChange={() => {

                            }}
                        />
                    }

                    {
                        isShown('WarrantyPeriod') &&
                        <ScNumberControl
                            name={'WarrantyPeriod'}
                            label="Warranty period"
                            withAsterisk={isRequired('WarrantyPeriod')}
                            {...form.getInputProps('WarrantyPeriod')}
                            // onChange={handleInputChange}
                            // value={inputs.WarrantyPeriod}
                            // error={inputErrors.WarrantyPeriod}
                            min={0}
                            // format={Enums.NumericFormat.Integer}
                            decimalScale={0}
                            // removeTrailingZeros
                            hideControls
                        />
                    }

                    {hasStockControl === false && <ScNumberControl
                        label="Quantity"
                        name="Quantity"
                        withAsterisk
                        {...form.getInputProps('Quantity')}
                        // onChange={handleInputChange}
                        // value={inputs.Quantity}
                        // error={inputErrors.Quantity}
                        // min={0}
                        // format={Enums.NumericFormat.Decimal}
                        decimalScale={2}
                        // removeTrailingZeros
                        hideControls
                    />
                    }

                    {costPricePermission && <ScNumberControl
                        label="Cost Price"
                        // name="CostPrice"
                        withAsterisk
                        // onChange={handleInputChange}
                        // value={inputs.CostPrice}
                        // error={inputErrors.CostPrice}
                        {...form.getInputProps('CostPrice')}
                        onChange={v => {
                            form.getInputProps('CostPrice').onChange(v)
                            if (v === 0) {
                                // do nothing as margin calc is invalid and list price should not change at this point
                            } else if (+v && !!Number(markup)) {
                                form.setFieldValue('ListPrice', (1 + (Number(markup) / 100)) * +v)
                            }
                        }}
                        name={'CostPrice'}
                        // format={Enums.NumericFormat.Currency}
                        decimalScale={2}
                        thousandSeparator={' '}
                        fixedDecimalScale
                        // min={0}
                        hideControls
                    />}

                    {
                        costPricePermission &&
                        <ScNumberControl
                            label="Markup %"
                            // name="CostPrice"
                            placeholder={typeof markup === 'string'? markup : undefined}
                            onChange={handleMarkupChange}
                            value={typeof markup === 'number'? markup : undefined}
                            name={'CostPrice'}
                            decimalScale={2}
                            thousandSeparator={' '}
                            // min={-100}
                            hideControls
                        />
                    }

                    <ScNumberControl
                        label="List Price"
                        // name="ListPrice"
                        withAsterisk
                        {...form.getInputProps('ListPrice')}
                        onChange={v => {
                            form.getInputProps('ListPrice').onChange(v)
                            typeof v === 'number' &&
                            setMarkup(v === 0 ? -100 : form.values.CostPrice ?`${Math.round((v / form.values.CostPrice - 1) * 10000) / 100}`: ``)
                        }}
                        name={'ListPrice'}
                        decimalScale={2}
                        thousandSeparator={' '}
                        fixedDecimalScale
                        // min={0}
                        hideControls
                    />


                    {
                        isShown('CommissionPercentage') &&
                        <ScNumberControl
                            label="Commission Percentage"
                            // name="CommissionPercentage"
                            withAsterisk={isRequired('CommissionPercentage')}
                            {...form.getInputProps('CommissionPercentage')}
                            name={'CommissionPercentage'}
                            // onChange={handleInputChange}
                            // value={inputs.CommissionPercentage}
                            // error={inputErrors.CommissionPercentage}
                            // format={Enums.NumericFormat.Percentage}
                            decimalScale={2}
                            // removeTrailingZeros
                            min={0}
                            hideControls
                        />
                    }

                    {
                        isShown('BinLocation') &&
                        <ScTextControl
                            label="Bin Location"
                            withAsterisk={isRequired('BinLocation')}
                            {...form.getInputProps('BinLocation')}
                            name={'BinLocation'}
                            // onChange={handleInputChange}
                            // name="BinLocation"
                            // value={inputs.BinLocation}
                            // error={inputErrors.BinLocation}
                        />
                    }

                    {
                        isShown('WebForm') &&
                        <SCSwitch label="Web Form Searchable" checked={form.values.WebForm}
                                  onToggle={(checked) => form.setFieldValue('WebForm', checked)}
                        />
                    }

                    {/*CUSTOM ITEMS*/}
                    {
                        isShown('CustomText1') &&
                        <ScTextControl
                            label={settingsBySystemName[getSystemNameForFormName('CustomText1')].DisplayName}
                            withAsterisk={isRequired('CustomText1')}
                            {...form.getInputProps('CustomText1')}
                            name={'CustomText1'}
                        />
                    }
                    {
                        isShown('CustomText2') &&
                        <ScTextControl
                            label={settingsBySystemName[getSystemNameForFormName('CustomText2')].DisplayName}
                            withAsterisk={isRequired('CustomText2')}
                            {...form.getInputProps(getFormNameForSystemName('CustomText2'))}
                            name={'CustomText2'}
                        />
                    }


                    {
                        isShown('CustomText3') &&
                        <ScTextControl
                            label={settingsBySystemName[getSystemNameForFormName('CustomText3')].DisplayName}
                            withAsterisk={isRequired('CustomText3')}
                            {...form.getInputProps(getFormNameForSystemName('CustomText3'))}
                            name={'CustomText3'}
                        />
                    }

                    {
                        isShown('CustomText4') &&
                        <ScTextControl
                            label={settingsBySystemName[getSystemNameForFormName('CustomText4')].DisplayName}
                            withAsterisk={isRequired('CustomText4')}
                            {...form.getInputProps(getFormNameForSystemName('CustomText4'))}
                            name={'CustomText4'}
                        />
                    }


                    {
                        isShown('CustomDate1') &&
                        <SCDatePicker
                            canClear
                            label={settingsBySystemName[getSystemNameForFormName('CustomDate1')].DisplayName}
                            withAsterisk={isRequired('CustomDate1')}
                            {...form.getInputProps(getFormNameForSystemName('CustomDate1'))}
                            name={'CustomDate1'}
                        />
                    }

                    {
                        isShown('CustomDate2') &&
                        <SCDatePicker
                            canClear
                            label={settingsBySystemName[getSystemNameForFormName('CustomDate2')].DisplayName}
                            withAsterisk={isRequired('CustomDate2')}
                            {...form.getInputProps(getFormNameForSystemName('CustomDate2'))}
                            name={'CustomDate2'}
                        />
                    }


                    {
                        isShown('CustomBoolean1') &&
                        <SCSwitch
                            label={settingsBySystemName[getSystemNameForFormName('CustomBoolean1')].DisplayName}
                            checked={form.values['CustomBoolean1']}
                            onToggle={(checked) => form.setFieldValue('CustomBoolean1', checked)}
                        />
                    }
                    {
                        isShown('CustomBoolean2') &&
                        <SCSwitch
                            label={settingsBySystemName[getSystemNameForFormName('CustomBoolean2')].DisplayName}
                            checked={form.values['CustomBoolean2']}
                            onToggle={(checked) => form.setFieldValue('CustomBoolean2', checked)}
                        />
                    }

                    {
                        isShown('CustomNumber1') &&
                        <ScNumberControl
                            label={settingsBySystemName[getSystemNameForFormName('CustomNumber1')].DisplayName}
                            withAsterisk={isRequired('CustomNumber1')}
                            {...form.getInputProps('CustomNumber1')}
                            name={'CustomNumber1'}
                        />
                    }

                    {
                        isShown('CustomNumber2') &&
                        <ScNumberControl
                            label={settingsBySystemName[getSystemNameForFormName('CustomNumber2')].DisplayName}
                            withAsterisk={isRequired('CustomNumber2')}
                            {...form.getInputProps('CustomNumber2')}
                            name={'CustomNumber2'}
                        />
                    }

                    {hasStockControl && !!form.values.StockItemTypeDescription && (!isServiceType || form.values.IsQuantityTracked) &&
                        <SCSwitch
                            label={"Quantity Tracking"}
                            checked={form.values['IsQuantityTracked']}
                            onToggle={(checked) => form.setFieldValue('IsQuantityTracked', checked)}
                            disabled={isServiceType || (/*inventory?.HasStockTransactions === true && */inventory?.IsQuantityTracked)}
                        />}

                    {
                        !isNew && !!inventory && hideSaveAndCancel /* hides on job page */ &&
                        <SCSwitch label={'Active'} checked={form.values.IsActive}
                                  onToggle={(checked) => form.setFieldValue('IsActive', checked)}
                        />
                    }

                </SimpleGrid>


                {
                    _userAdmin &&
                    <>
                        <Space h={25}></Space>
                        <Link href={'/settings/inventory/manage'} style={{textDecoration: 'none'}}>
                            <Flex align={'center'} justify={'end'} c={'scBlue'} gap={5}>
                                <IconQuestionCircle size={16}/>
                                <Anchor size={'sm'}>Not seeing what you need? &nbsp;Add additional fields here.</Anchor>
                            </Flex>
                        </Link>
                    </>
                }


                {hasStockControl === true &&
                    <div style={{maxWidth: 520}}>

                        {!isNew && integration?.Status === Enums.IntegrationStatus.Live &&
                            <ScNumberControl
                                label="Accounting Quantity"
                                name="Quantity"
                                withAsterisk
                                {...form.getInputProps('Quantity')}
                                // onChange={handleInputChange}
                                // value={inputs.Quantity}
                                // error={inputErrors.Quantity}
                                // min={0}
                                // format={Enums.NumericFormat.Decimal}
                                decimalScale={2}
                                // removeTrailingZeros
                                hideControls
                                disabled={accountingQuantityDisabled}
                            />
                        }

                        {form.values.IsQuantityTracked && form.values.StockItemTypeDescription && <>
                            {/* <Title
                                my={'var(--mantine-spacing-lg)'}
                                size={'lg'}
                                fw={600}
                            >
                                Stock Levels
                            </Title> */}

                            <Text size={'sm'} c={'dimmed'} mb={"md"} mt={"md"}>{isNew ?
                                "Capture any initial stock levels you may have on hand" :
                                ""
                            }</Text>
                        </>}


                        {form.values.IsQuantityTracked && form.values.StockItemTypeDescription && <>
                            <SimpleTable
                                data={warehouseStockWarehouse}
                                mapping={[{
                                    key: "WarehouseID",
                                    label: <>Warehouse</>,
                                    valueFunction: (whs) => whs.Warehouse?.Code ?? "Unknown"
                                }, {
                                    key: "QuantityOnHand",
                                    label: isNew ? "Initial Quantity on Hand" : "Quantity on Hand",
                                    type: editStockLevelsPermission ? "numberInput" : undefined,
                                    min: undefined,
                                    alignRight: true,
                                    customNumberProps: {
                                        focusOnSelect: true
                                    },

                                }]}
                                stylingProps={
                                    {
                                        darkerText: true,
                                        compact: true,
                                        rowBorders: false
                                    }
                                }
                                width={'100%'}
                                canEdit={true}
                                onInputChange={(name, item, value) => name === "QuantityOnHand" ? handleWarehouseStockQuantityChange(item, value, false) : () => {
                                }}
                                footerRow={(warehouseStock?.length ?? 0) > 1 ? [
                                    <span key={'arrayJSXItemNeedsAKey'}
                                          style={{fontWeight: "bold"}}>WAREHOUSE TOTAL</span>,
                                    <span key={'arrayJSXItemsNeedsKeys'} style={{
                                        fontWeight: "bold",
                                        marginRight: '0.3rem'
                                    }}>{warehouseStockWarehouse.map(x => x.QuantityOnHand).reduce((prev, current) => (prev ?? 0) + (current ?? 0), 0)}</span>
                                ] : []}
                            />

                            <Space h={'1rem'}></Space>

                            {
                                hasVanStock &&
                                <SimpleTable
                                    data={warehouseStockMobile}
                                    mapping={[{
                                        key: "WarehouseID",
                                        label: <>Van <BetaText/></>,
                                        valueFunction: (whs) => whs.Warehouse?.Code ?? "Unknown"
                                    }, {
                                        key: "QuantityOnHand",
                                        label: isNew ? "Initial Quantity on Hand" : "Quantity on Hand",
                                        type: editStockLevelsPermission ? "numberInput" : undefined,
                                        min: undefined,
                                        alignRight: true,
                                        customNumberProps: {
                                            focusOnSelect: true
                                        },

                                    }]}
                                    stylingProps={
                                        {
                                            darkerText: true,
                                            compact: true,
                                            rowBorders: false
                                        }
                                    }
                                    width={'100%'}
                                    canEdit={true}
                                    onInputChange={(name, item, value) => name === "QuantityOnHand" ? handleWarehouseStockQuantityChange(item, value, false) : () => {
                                    }}
                                    footerRow={(warehouseStock?.length ?? 0) > 1 ? [
                                        <span key={'arrayJSXItemNeedsAKey'}
                                              style={{fontWeight: "bold"}}>VAN TOTAL</span>,
                                        <span key={'arrayJSXItemsNeedsKeys'} style={{
                                            fontWeight: "bold",
                                            marginRight: '0.3rem'
                                        }}>{warehouseStockMobile.map(x => x.QuantityOnHand).reduce((prev, current) => (prev ?? 0) + (current ?? 0), 0)}</span>
                                    ] : []}
                                />
                            }

                            <Flex justify={'space-between'} align={'center'} mt={'md'}>
                                <span key={'arrayJSXItemNeedsAKey'} style={{fontWeight: "bold"}}>GRAND TOTAL</span>
                                <span key={'arrayJSXItemsNeedsKeys'} style={{
                                    fontWeight: "bold",
                                    marginRight: '2rem'
                                }}>{warehouseStock.map(x => x.QuantityOnHand).reduce((prev, current) => (prev ?? 0) + (current ?? 0), 0)}</span>
                            </Flex>
                        </>}
                    </div>
                }

                {
                    !hideSaveAndCancel && (
                        <>
                            <Group mt={'3rem'} justify={'right'} gap={'xs'}>
                                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                                    onClose()
                                }}>
                                    Cancel
                                </Button>
                                <Button color={'scBlue'} type={isNestedForm ? 'button' : 'submit'}
                                        onClick={isNestedForm ? manualSubmit : scrollToErrors} // not working well with modal
                                        rightSection={isLoading && <Loader variant={'oval'} size={18} color={'white'}/>}
                                >
                                    {isNew ? 'Create' : 'Save'}
                                </Button>
                            </Group>

                            {isNew && (
                                <Space h={75}/>
                            )}

                        </>
                    )
                }
            </Box>

            {
                form.values.IsQuantityTracked && hasStockControl === true && !isNew && viewStockTransactionsPermission &&
                <Box mt={'sm'}>
                    <StockTransactionHistory inventoryId={inventory.ID} warehouseId={''}
                                             maxHeight={hideSaveAndCancel ? '370px' : `calc(100vh - ${height}px - 135px)`}/>
                </Box>
            }

        </form>

        <CreateNewCategoryModal show={showCreateCategoryModal}
                                onClose={() => setShowCreateCategoryModal(false)}
                                inventoryCategoryCreated={
                                    (e: any) => {
                                        setSelectedInventoryCategory(e);
                                        form.setFieldValue('InventoryCategoryDescription', e?.Description || e);
                                        setShowCreateCategoryModal(false);
                                    }
                                }
                                backButtonText={isNew ? 'Create Inventory Item' : 'Edit Inventory Item'}
        />

        <CreateNewSubcategoryModal
            show={showCreateSubcategoryModal}
            onClose={() => setShowCreateSubcategoryModal(false)}
            inventorySubcategoryCreated={
                (e: any) => {
                    setSelectedInventorySubcategory(e);
                    form.setFieldValue('InventorySubcategoryDescription', e?.Description || e);
                    setShowCreateSubcategoryModal(false);
                }
            }
            defaultInventoryCategory={selectedInventoryCategory}
            backButtonText={isNew ? 'Create Inventory Item' : 'Edit Inventory Item'}
        />

        <CreateNewSupplierModal
            show={showCreateSupplierModal}
            onClose={() => setShowCreateSupplierModal(false)}
            supplierCreated={
                (e) => {
                    setSelectedSupplier(e);
                    form.setFieldValue('SupplierName', e?.Name || e);
                    setShowCreateSupplierModal(false);
                }
            }
            isNew
            supplier={selectedSupplier}
            backButtonText={isNew ? 'Create Inventory Item' : 'Edit Inventory Item'}
        />

    </>;
    }

export default InventoryItemForm;
