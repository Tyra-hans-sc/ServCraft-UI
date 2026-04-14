import { StockTransaction, ReplaceWithModel, Warehouse, StockTransactionLine } from '@/interfaces/api/models';
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Enums from '@/utils/enums';
import styles from './ManageStockTransactionForm.module.css';
import { useForm } from '@mantine/form';
import Helper from '@/utils/helper';
import { showNotification } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import ToastContext from '@/utils/toast-context';
import { useRouter } from 'next/router';
import stockTransactionService from '@/services/stock-transaction/stock-transaction-service';
import { ActionIcon, Button, Flex, Grid, Loader, ScrollArea, SimpleGrid, Space, Text, Title } from '@mantine/core';
import SubscriptionContext from '@/utils/subscription-context';
import WarehouseSelector from '@/components/selectors/warehouse/warehouse-selector';
import SupplierSelector from '@/components/selectors/supplier/supplier-selector';
import EmployeeSelector from '@/components/selectors/employee/employee-selector';
import Time from '@/utils/time';
import SCDatePicker from '@/components/sc-controls/form-controls/sc-datepicker';
import SCInput from '@/components/sc-controls/form-controls/sc-input';
import SCTextArea from '@/components/sc-controls/form-controls/sc-textarea';
import SCDropdownList from '@/components/sc-controls/form-controls/sc-dropdownlist';
import ConfirmAction from '@/components/modals/confirm-action';
import { colors, layout } from '@/theme';
import SCNumericInput from '@/components/sc-controls/form-controls/sc-numeric-input';
import InventorySelector from '@/components/selectors/inventory/inventory-selector';
import PurchaseOrderSelector from '@/components/selectors/purchases/purchase-order-selector';
import SupplierService from '@/services/supplier/supplier-service';
import purchaseOrderService from '@/services/purchase/purchase-order-service';
import warehouseService from '@/services/warehouse/warehouse-service';
import SimpleTable, { SimpleColumnMapping } from '../SimpleTable/SimpleTable';
import { IconCross, IconDeviceFloppy, IconEye, IconFileCheck, IconPrinter, IconSwitch, IconSwitchHorizontal, IconX } from '@tabler/icons-react';
import employeeService from '@/services/employee/employee-service';
import storage from '@/utils/storage';
import helper from '@/utils/helper';
import { useDidUpdate, useElementSize, useViewportSize } from '@mantine/hooks';
import SCSplitButton from '@/components/sc-controls/form-controls/sc-split-button';
import ToolbarButtons from '../Button/ToolbarButtons';
import constants from '@/utils/constants';
import downloadService from '@/utils/download-service';

export interface StockTransactionFormComponentProps {
    stockTransaction: StockTransaction,
    onClose: (navigateToOtherStockTransactionID?: string) => void
    onSaved: (stockTransaction: StockTransaction) => void
    isNew?: boolean
    stockTransactionType?: number
    caller?: string
    onCancel?: Function
    purchaseOrderID?: string
    show?: boolean
    heading?: string
    initialValues?: StockTransaction
}

const ManageStockTransactionForm: FC<{
    stockTransaction?: StockTransaction
    isNew: boolean
    stockTransactionType: number
    caller?: string
    onCancel?: (navigateToOtherStockTransactionID?: string) => void
    purchaseOrderID?: string
    onSaved?: (stockTransaction: StockTransaction) => void
    validateAndCloseCounter?: number
    hideHeading?: boolean,
    initialValues?: StockTransaction
}> = (props) => {

    const toastCtx = useContext(ToastContext);
    const router = useRouter();
    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
    const subscriptionContext = useContext<any>(SubscriptionContext);
    const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState(props.isNew ? props.initialValues?.SourceWarehouse : props.stockTransaction?.SourceWarehouse);
    const [selectedDestinationWarehouse, setSelectedDestinationWarehouse] = useState(props.isNew ? props.initialValues?.DestinationWarehouse : props.stockTransaction?.DestinationWarehouse);
    const [selectedSupplier, setSelectedSupplier] = useState(props.isNew ? props.initialValues?.Supplier : props.stockTransaction?.Supplier);
    const [selectedEmployee, setSelectedEmployee] = useState(props.isNew ? props.initialValues?.Employee : props.stockTransaction?.Employee);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(props.isNew ? props.initialValues?.PurchaseOrder : props.stockTransaction?.PurchaseOrder);

    const [isPrinting, setIsPrinting] = useState(false);

    const suppressDirtyIfNew = useRef<any>(props.isNew);

    const currentStatusRef = useRef(props.stockTransaction?.StockTransactionStatus);
    const formRef = useRef<any>();

    const updateSelectedDestinationWarehouse = (warehouse: Warehouse | null | undefined) => {
        setSelectedDestinationWarehouse(warehouse as any);
        Helper.formSetFieldValue(form, "DestinationWarehouseID", warehouse?.ID);

        if (suppressDirtyIfNew.current) {
            resetFormDirty();
        }
    }

    const updateSelectedSourceWarehouse = (warehouse: Warehouse | null | undefined) => {
        setSelectedSourceWarehouse(warehouse as any);
        Helper.formSetFieldValue(form, "SourceWarehouseID", warehouse?.ID);

        if (suppressDirtyIfNew.current) {
            resetFormDirty();
        }
    }

    const updateSelectedSupplier = (supplier: ReplaceWithModel | null | undefined) => {
        setSelectedSupplier(supplier);
        Helper.formSetFieldValue(form, "SupplierID", supplier?.ID);
    }

    const updateSelectedPurchaseOrder = async (purchaseOrder: ReplaceWithModel | null | undefined) => {

        let purchaseOrderStockTransaction: StockTransaction | undefined;

        if (!!purchaseOrder) {
            purchaseOrder = await purchaseOrderService.getPurchaseOrder(purchaseOrder.ID);

            let purchaseOrderStockTransactions = (await stockTransactionService.searchStockTransactions({
                pageIndex: 0,
                includeDisabled: false,
                pageSize: 50,
                stockTransactionTypes: [form.values.StockTransactionType as number],
                itemIDs: [purchaseOrder.ID]
            } as any)).Results as StockTransaction[];

            purchaseOrderStockTransaction = purchaseOrderStockTransactions.find(x => x.StockTransactionStatus === Enums.StockTransactionStatus.Draft);
        }

        if (purchaseOrderStockTransaction) {
            setSelectedPurchaseOrder(purchaseOrderStockTransaction);

            setConfirmOptions({
                ...Helper.initialiseConfirmOptions(),
                display: true,
                heading: `${Enums.getEnumStringValue(Enums.StockTransactionType, form.values.StockTransactionType, true)} already exists for ${purchaseOrder.PurchaseOrderNumber}`,
                text: `Discard changes and open ${purchaseOrderStockTransaction.StockTransactionNumber}?`,
                confirmButtonText: "Open",
                onConfirm: () => {
                    if (props.onCancel) {
                        props.onCancel(purchaseOrderStockTransaction?.ID);
                    }
                    else {
                        Helper.nextRouter(router.push, "/stocktransaction/[id]", `/stocktransaction/${purchaseOrderStockTransaction?.ID}`);
                    }
                },
                onCancel: () => {
                    setSelectedPurchaseOrder(null)
                    Helper.formSetFieldValue(form, "PurchaseOrderID", null);
                    Helper.formSetFieldValue(form, "PurchaseOrder", null);
                }
            });
        }
        else {
            setSelectedPurchaseOrder(purchaseOrder)
            Helper.formSetFieldValue(form, "PurchaseOrderID", purchaseOrder?.ID);
            Helper.formSetFieldValue(form, "PurchaseOrder", purchaseOrder);

            if (!!purchaseOrder && purchaseOrder.ID !== selectedPurchaseOrder?.ID) {

                if (formSettings.supplier) {
                    const supplier = await SupplierService.getSupplier(purchaseOrder.SupplierID);
                    updateSelectedSupplier(supplier);
                }

                promptToPopulateFromPurchaseOrder(purchaseOrder);
            }
        }
    }

    const promptToPopulateFromPurchaseOrder = (purchaseOrder: ReplaceWithModel) => {
        setConfirmOptions({
            ...Helper.initialiseConfirmOptions(),
            display: true,
            confirmButtonText: "Confirm",
            heading: "Use purchase order lines?",
            text: "Any outstanding lines from the purchase order will be added",
            onConfirm: () => {
                populateFromPurchaseOrder(purchaseOrder);
            }
        });
    }

    const calculateAverageCost = (poItems) => {
        let totalCostPrice = poItems.reduce((prevVal, item) => {
            return prevVal + item.UnitPriceExclusive * (1 - (item.LineDiscountPercentage / 100)) * (item.Quantity - item.QuantityReceived);
        }, 0);
        let totalQuantity = poItems.reduce((prevVal, item) => {
            return prevVal + (item.Quantity ?? 0) - (item.QuantityReceived ?? 0);
        }, 0);
        let unitCostPrice = totalCostPrice / totalQuantity;

        return {
            totalCostPrice,
            totalQuantity,
            unitCostPrice
        };
    }

    const populateFromPurchaseOrder = async (purchaseOrder: ReplaceWithModel) => {

        const poItemsToAddResult = await purchaseOrderService.getPurchaseOrderUnallocatedItems(purchaseOrder?.ID);
        const poItemsToAdd = poItemsToAddResult.Results?.sort((a, b) => a.LineNumber - b.LineNumber) ?? [];

        // const existing = prepareStockLines(); // removed - if purchase order changes, restart the grv line items

        let stLinesToAdd: StockTransactionLine[] = [];

        let poItemGroups = helper.groupBy(poItemsToAdd, 'InventoryID');

        Object.keys(poItemGroups).forEach(inventoryID => {
            let poItems = poItemGroups[inventoryID];

            let {
                totalCostPrice,
                totalQuantity,
                unitCostPrice
            } = calculateAverageCost(poItems);

            stLinesToAdd.push({
                InventoryID: inventoryID,
                Inventory: poItems[0].Inventory,
                Quantity: totalQuantity,
                UnitCostPrice: unitCostPrice
            })
        });

        addLine(stLinesToAdd);
    }

    const updateSelectedEmployee = (employee: ReplaceWithModel | null | undefined) => {
        setSelectedEmployee(employee);
        Helper.formSetFieldValue(form, "EmployeeID", employee?.ID);
    }

    const prepopulateFromPurchaseOrder = async () => {
        if (!props.isNew) return;

        if (!!props.purchaseOrderID && formSettings.purchaseOrder) {

            const po = await purchaseOrderService.getPurchaseOrder(props.purchaseOrderID);

            if (formSettings.supplier) {
                setSelectedSupplier(po.Supplier);
                Helper.formSetFieldValue(form, "SupplierID", po.SupplierID);
                await Helper.waitABit();
            }

            setSelectedPurchaseOrder(po);
            Helper.formSetFieldValue(form, "PurchaseOrderID", po.ID);

            populateFromPurchaseOrder(po);

            const employee = await employeeService.getEmployee(storage.getCookie(Enums.Cookie.employeeID));
            updateSelectedEmployee(employee);

            resetFormDirty();
        }
    };


    const resetFormDirty = async () => {

        helper.formResetDirty(form);
        // this will check if a new stock transaction is still preloading data (indirectly through a timer), and will do a final clear dirty state on the form once done loading
        while (suppressDirtyIfNew.current) {
            await helper.waitABit(10);
        }
        // start the form in a clean state even though it is new, as we have not modified default values yet
        helper.formResetDirty(form);
    }


    useEffect(() => {
        setAccessStatus(subscriptionContext?.subscriptionInfo?.AccessStatus);
        setTimeout(() => {
            suppressDirtyIfNew.current = false;
        }, 2000);
    }, []);

    const prevPurchaseOrderID = useRef<string | undefined>();
    useEffect(() => {
        if (prevPurchaseOrderID.current === props.purchaseOrderID) return;
        prepopulateFromPurchaseOrder();
        prevPurchaseOrderID.current = props.purchaseOrderID;
    }, [props.purchaseOrderID]);

    const form = useForm<StockTransaction>({
        initialValues: !!props.initialValues ? {
            ...props.initialValues,
        } : !props.isNew || props.stockTransaction ? {
            ...props.stockTransaction
        } : {
            // inital values if a create
            ID: Helper.newGuid(),
            IsActive: true,
            Date: Time.toISOString(Time.now()),
            StockTransactionStatus: Enums.StockTransactionStatus.Draft,
            StockTransactionType: props.stockTransactionType,
            StockTransactionLines: [],
            TotalPriceExcluding: 0,
            TotalPriceIncluding: 0,
            TotalTax: 0
        } as StockTransaction,
        validate: {
            "Comment": (x) => formSettings.commentsRequired === true && Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true,
                customErrorText: `Comment is required`
            } as any),
            "SourceWarehouseID": (x) => formSettings.sourceWarehouse?.required &&
                Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: `${formSettings.destinationWarehouse?.label} is required`
                } as any),
            "DestinationWarehouseID": (x) => formSettings.destinationWarehouse?.required &&
                Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: `${formSettings.destinationWarehouse.label} is required`
                } as any),
            "SupplierID": (x) => formSettings.supplier?.required &&
                Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: `${formSettings.supplier.label} is required`
                } as any),
            "PurchaseOrderID": (x) => formSettings.purchaseOrder?.required &&
                Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: `${formSettings.purchaseOrder.label} is required`
                } as any),
            "EmployeeID": (x) => formSettings.employee?.required &&
                Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true,
                    customErrorText: `${formSettings.employee.label} is required`
                } as any),
            "StockTransactionLines": (lines) => {
                if (Array.isArray(lines) && lines.length > 0 && lines.some(x => !x.InventoryID)) return "Lines must have inventory linked"
                if (currentStatusRef.current === Enums.StockTransactionStatus.Complete) {
                    if (!Array.isArray(lines) || lines.filter(x => x.Quantity !== 0).length === 0) return "Items are required with non zero quantities";

                    switch (props.stockTransactionType) {
                        case Enums.StockTransactionType.GRV:
                            const invalidGRV = lines.some(x => !x.InventoryID);
                            return invalidGRV ? "All inventory fields are required" : null;
                        // const invalidGRV = lines.some(x => !x.InventoryID || !x.Quantity);
                        // return invalidGRV ? "All inventory and quantity fields are required" : null;
                        case Enums.StockTransactionType.Adjustment:
                            const invalidAdj = lines.some(x => !x.InventoryID || !x.Quantity);
                            return invalidAdj ? "All inventory and quantity fields are required" : null;
                        case Enums.StockTransactionType.Transfer:
                            const invalidTx = lines.some(x => !x.InventoryID || !x.Quantity);
                            return invalidTx ? "All inventory and quantity fields are required" : null;
                    }
                    return "Validation not implemented";
                }
                return null;
            }
        }
    });


    // todo: find a way to make the save work with this hook (new hook?)
    Helper.preventRouteChange(form.isDirty(), () => Helper.formResetDirty(form), setConfirmOptions, undefined);

    const typeText = useMemo(() => {
        return Enums.getEnumStringValue(Enums.StockTransactionType, props.stockTransactionType, true);
    }, [props.stockTransactionType]);

    const statusOptions = useMemo(() => {
        return Enums.getEnumItemsVD(Enums.StockTransactionStatus, true, false)
    }, []);

    const submitStockTransaction = async (stockTransaction: StockTransaction) => {
        return stockTransactionService.saveStockTransaction(stockTransaction, props.isNew, toastCtx, props.caller);
    }

    const saveStockTransactionMutation = useMutation(["stockTransaction", "save", form.values.ID], submitStockTransaction as any, {
        onSuccess: async (data: StockTransaction) => {
            if (data.ID) {
                form.setValues(data);

                currentStatusRef.current = data.StockTransactionStatus;

                // showNotification({
                //     message: `${typeText} saved successfully`,
                //     id: `stockTransaction_save_${form.values.ID}`
                // });

                Helper.formResetDirty(form);

                if (props.onSaved) {
                    props.onSaved(data);
                }
                else if (props.isNew) {
                    await Helper.waitABit();
                    Helper.nextRouter(router.push, "/stocktransaction/[id]", `/stocktransaction/${data.ID}`);
                }
            }
        }
    });

    const isDisabled = useMemo(() => {
        return accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess;
    }, [accessStatus]);

    const isReadOnly = useMemo(() => {
        const status = form.getInputProps("StockTransactionStatus").value;
        return status === Enums.StockTransactionStatus.Complete || status === Enums.StockTransactionStatus.Cancelled;
    }, [form]);

    const handleSubmit = (stockTransaction: StockTransaction) => {
        if (!form.validate()) return;

        // cleanup of object to avoid submitting validation and superfluous properties
        let stSubmitObject = JSON.parse(JSON.stringify(stockTransaction)) as StockTransaction;
        stSubmitObject.StockTransactionLines?.forEach(x => {
            let extraKeys = Object.keys(x).filter(key => key.indexOf("_") === 0);
            extraKeys.forEach(key => {
                delete x[key];
            });
        })

        saveStockTransactionMutation.mutate(stSubmitObject as any);
    }

    const formSettings = useMemo(() => {
        let settings: {
            sourceWarehouse?: { required: boolean, label: string, canClear: boolean, readOnly: boolean, filterByStore: boolean },
            destinationWarehouse?: { required: boolean, label: string, canClear: boolean, readOnly: boolean, filterByStore: boolean },
            supplier?: { required: boolean, label: string, canClear: boolean, readOnly: boolean },
            employee?: { required: boolean, label: string, canClear: boolean, readOnly: boolean },
            showUnitCostPrice?: boolean,
            showPurchaseOrderAvailable?: boolean,
            purchaseOrder?: { required: boolean, label: string, canClear: boolean, readOnly: boolean, hideFullyReceived: boolean },
            showQuantityAvailable?: boolean,
            quantityLabel?: string,
            commentsRequired?: boolean,
            quantityAvailableLabel?: string,
            quantityAvailableTitle?: string
        } = {};

        switch (props.stockTransactionType) {

            case Enums.StockTransactionType.GRV:
                settings = {
                    destinationWarehouse: {
                        required: true,
                        label: "Warehouse",
                        canClear: true,
                        readOnly: false,
                        filterByStore: false
                    },
                    supplier: {
                        required: true,
                        label: "Supplier",
                        canClear: !props.purchaseOrderID,
                        readOnly: props.isNew && !!props.purchaseOrderID
                    },
                    employee: {
                        required: false,
                        label: "Person Responsible",
                        canClear: true,
                        readOnly: false
                    },
                    purchaseOrder: {
                        required: !!props.purchaseOrderID,
                        label: "Purchase Order",
                        canClear: !props.purchaseOrderID,
                        readOnly: !!props.purchaseOrderID,
                        hideFullyReceived: true
                    },
                    showPurchaseOrderAvailable: true,
                    quantityLabel: "Received"
                };
                break;

            case Enums.StockTransactionType.Adjustment:
                settings = {
                    destinationWarehouse: {
                        required: true,
                        label: "Warehouse",
                        canClear: true,
                        readOnly: false,
                        filterByStore: false
                    },
                    employee: {
                        required: false,
                        label: "Person Responsible",
                        canClear: true,
                        readOnly: false
                    },
                    showQuantityAvailable: true,
                    quantityLabel: "Adjust By",
                    commentsRequired: false,
                    quantityAvailableLabel: "QOH",
                    quantityAvailableTitle: "Quantity on hand in the warehouse"
                };
                break;

            case Enums.StockTransactionType.Generic:
            case Enums.StockTransactionType.Initial:
                settings = {
                    destinationWarehouse: {
                        readOnly: true,
                        canClear: false,
                        label: "Warehouse",
                        required: true,
                        filterByStore: false
                    },
                    quantityLabel: "Quantity"
                };
                break;

            case Enums.StockTransactionType.Return:
                settings = {
                    destinationWarehouse: {
                        readOnly: true,
                        canClear: false,
                        label: "Warehouse",
                        required: true,
                        filterByStore: false
                    },
                    quantityLabel: "Returned"
                };
                break;

            case Enums.StockTransactionType.Used:
                settings = {
                    sourceWarehouse: {
                        readOnly: true,
                        canClear: false,
                        label: "Warehouse",
                        required: true,
                        filterByStore: false
                    },
                    quantityLabel: "Used"
                };
                break;

            case Enums.StockTransactionType.Transfer:
                settings = {
                    sourceWarehouse: {
                        required: true,
                        label: "Source Warehouse",
                        canClear: true,
                        readOnly: false,
                        filterByStore: false
                    },
                    destinationWarehouse: {
                        required: true,
                        label: "Destination Warehouse",
                        canClear: true,
                        readOnly: false,
                        filterByStore: false
                    },
                    employee: {
                        required: true,
                        label: "Person Responsible",
                        canClear: true,
                        readOnly: false
                    },
                    showQuantityAvailable: true,
                    quantityAvailableLabel: "Qty at Source"
                }
                break;
        }

        return settings;
    }, [props.stockTransactionType, props.stockTransaction, props.initialValues]);

    const prepareStockLines: () => StockTransactionLine[] = () => {
        let lines = form.getInputProps("StockTransactionLines").value as StockTransactionLine[];

        return lines?.filter(x => x.IsActive).sort((a, b) => (a.LineNumber ?? 0) - (b.LineNumber ?? 0)) ?? [];
    };

    const addLine = (extraPropsList: StockTransactionLine[] = [{}]) => {
        const lines: StockTransactionLine[] = prepareStockLines();
        let lineNumber: number = lines.length > 0 ? (lines[lines.length - 1]?.LineNumber ?? 0) + 1 : 1;

        extraPropsList.forEach(extraProps => {
            lines.push({
                ID: Helper.newGuid(),
                IsActive: true,
                LineNumber: lineNumber,
                Quantity: 0,
                StockTransactionID: props.stockTransaction?.ID,
                UnitCostPrice: 0,
                UnitPrice: 0,
                TotalPrice: 0,
                ...extraProps
            });
            lineNumber++;
        });

        Helper.formSetFieldValue(form, "StockTransactionLines", lines);
    };

    const removeLine = (line) => {
        if (isReadOnly || isDisabled) return;
        let lines: StockTransactionLine[] = prepareStockLines();
        lines = lines.filter(x => x.ID !== line.ID);
        Helper.formSetFieldValue(form, "StockTransactionLines", lines);
    }

    const updateLine = (id, key, value) => {
        const lines: StockTransactionLine[] = prepareStockLines();
        let line = lines.find(x => x.ID == id) ?? {};
        line[key] = value;
        Helper.formSetFieldValue(form, "StockTransactionLines", lines);
    }

    const getIgnoreIDs = (line: StockTransactionLine) => {
        const allActiveLines = prepareStockLines();
        let inventoryIDs = allActiveLines.filter(x => !!x.InventoryID).map(x => x.InventoryID);
        if (!!line.InventoryID) {
            inventoryIDs = inventoryIDs.filter(x => x !== line.InventoryID);
        }
        return inventoryIDs;
    }

    const canAddLine = () => {
        const cnt = prepareStockLines().filter(x => !x.InventoryID).length;
        return cnt === 0;
    };

    const disablePurchaseOrderSelector = () => {
        return (form.values.StockTransactionLines?.length ?? 0) > 0;
    };

    const getPurchaseOrderTooltip = () => {
        let tooltip: string | undefined = undefined;

        if (disablePurchaseOrderSelector() && form.values.StockTransactionStatus === Enums.StockTransactionStatus.Draft) {
            if (!!selectedPurchaseOrder) {
                tooltip = "Delete all line items to link to a different purchase order";
            }
            else {
                tooltip = "Delete all line items to link to a purchase order";
            }
        }

        return tooltip;
    }

    const useBothWarehouses = useMemo(() => {
        return form.getInputProps("StockTransactionType").value === Enums.StockTransactionType.Transfer;
    }, [form]);

    const disableAddLine = () => {
        if (useBothWarehouses) {
            return !form.getInputProps("DestinationWarehouseID").value || !form.getInputProps("SourceWarehouseID").value;
        }
        return !form.getInputProps("DestinationWarehouseID").value && !form.getInputProps("SourceWarehouseID").value;
    };

    const printStockTransaction = async (mode: 'view' | 'download') => {
        setIsPrinting(true)
        downloadService.downloadFile("GET", `/StockTransaction/GetStockTransactionDocument?stockTransactionID=${form.values.ID}`, null, mode === 'view', false, "", "", null, false, (() => {
            setIsPrinting(false);
        }) as any);
    }

    const confirmComplete = async () => {

        currentStatusRef.current = Enums.StockTransactionStatus.Complete;
        const validateResult = form.validate();

        if (validateResult.hasErrors) {
            (toastCtx as any).setToast({
                message: 'There are validation errors',
                show: true,
                type: Enums.ToastType.error,
            });
            return;
        }

        currentStatusRef.current = Enums.StockTransactionStatus.Complete;
        let values = JSON.parse(JSON.stringify(form.values)) as StockTransaction;// { ...form.values };
        values.StockTransactionStatus = currentStatusRef.current;
        //Helper.formSetFieldValue(form, "StockTransactionStatus", currentStatusRef.current);
        handleSubmit(values);

        // setConfirmOptions({
        //     ...Helper.initialiseConfirmOptions(),
        //     display: true,
        //     confirmButtonText: "Confirm",
        //     heading: "Confirm complete?",
        //     text: "Confirming will modify live stock levels as well as make this form uneditable",
        //     onConfirm: () => {
        //         currentStatusRef.current = Enums.StockTransactionStatus.Complete;
        //         let values = { ...form.values };
        //         values.StockTransactionStatus = currentStatusRef.current;
        //         Helper.formSetFieldValue(form, "StockTransactionStatus", currentStatusRef.current);
        //         handleSubmit(values);
        //     },
        // });
    };

    const getWarehouseIDFilterForInventory = () => {

        switch (props.stockTransactionType) {
            case Enums.StockTransactionType.Adjustment:
            case Enums.StockTransactionType.GRV:
                return form.getInputProps("DestinationWarehouseID").value;
            case Enums.StockTransactionType.Transfer:
                return form.getInputProps("SourceWarehouseID").value;
            case Enums.StockTransactionType.ExternalTransfer:
                return form.getInputProps("SourceWarehouseID").value;
            default:
                return null;
        }
    }

    const getMinQuantity = () => {
        switch (props.stockTransactionType) {
            case Enums.StockTransactionType.Adjustment:
                return undefined;
            default:
                return 0;
        }
    }


    const getCostPriceFromPurchaseOrder = (defaultCost, inventoryID) => {
        let cost = defaultCost;
        if (!Array.isArray(selectedPurchaseOrder?.PurchaseOrderItems)) return cost;

        let poItemGroups = helper.groupBy(selectedPurchaseOrder.PurchaseOrderItems, 'InventoryID');

        let poItems = poItemGroups[inventoryID];

        if (Array.isArray(poItems)) {
            let {
                totalCostPrice,
                totalQuantity,
                unitCostPrice
            } = calculateAverageCost(poItems);

            if (!isNaN(unitCostPrice)) {
                cost = unitCostPrice;
            }
        }
        return cost;
    }

    const getQuantityAvailableFromPurchaseOrder = (inventoryID) => {
        let quantity = 0;
        if (!Array.isArray(selectedPurchaseOrder?.PurchaseOrderItems)) return quantity;

        let poItemGroups = helper.groupBy(selectedPurchaseOrder.PurchaseOrderItems, 'InventoryID');

        let poItems = poItemGroups[inventoryID];

        if (Array.isArray(poItems)) {
            let {
                totalCostPrice,
                totalQuantity,
                unitCostPrice
            } = calculateAverageCost(poItems);

            quantity = totalQuantity;
        }
        return quantity;
    }

    const updateInventory = async (line, e) => {
        updateLine(line.ID, "Inventory", e);
        updateLine(line.ID, "InventoryID", e?.ID ?? null);

        let costPrice = getCostPriceFromPurchaseOrder(e?.CostPrice ?? 0, e?.ID);
        updateLine(line.ID, "UnitCostPrice", costPrice);

        if (formSettings.showQuantityAvailable) {
            const whs = !e ? null : await warehouseService.getWarehouseStock({
                inventoryID: e.ID,
                warehouseID: getWarehouseIDFilterForInventory()
            });

            updateLine(line.ID, "WarehouseStock", whs);
        }
    }

    const isComplete = useMemo(() => {
        return props.stockTransaction?.StockTransactionStatus === Enums.StockTransactionStatus.Complete;
    }, [props.stockTransaction]);

    const getDestinationStoreID = () => {
        if (!!selectedPurchaseOrder) {
            return selectedPurchaseOrder.StoreID;
        }

        return undefined;
    }

    const getSourceStoreID = () => {
        return undefined;
    }

    const confirmInventoryCloseOrUpdate = useCallback((event: 'close') => {
        if (form.isDirty() && !saveStockTransactionMutation.isLoading) {
            setConfirmOptions({
                ...Helper.initialiseConfirmOptions(),
                display: true,
                showCancel: true,
                onCancel: () => {

                },
                showDiscard: true,
                onDiscard: () => {
                    if (event === 'close') {
                        props.onCancel && props.onCancel()
                    }
                },
                heading: "Save Changes?",
                text: `Would you like to save your changes?`,
                confirmButtonText: "Save",
                onConfirm: () => {
                    handleSubmit(form.values);
                }
            })
        }
    }, [form.isDirty(), form.values, saveStockTransactionMutation.isLoading]);

    useDidUpdate(() => {
        if (props.validateAndCloseCounter && form.isDirty()) { // will be 0 | undefined initially so will not fire on init
            confirmInventoryCloseOrUpdate('close')
        } else {
            props.onCancel && props.onCancel()
        }
    }, [props.validateAndCloseCounter]);

    const switchWarehouses = () => {
        let source = selectedSourceWarehouse,
            destination = selectedDestinationWarehouse;

        updateSelectedSourceWarehouse(destination);
        updateSelectedDestinationWarehouse(source);

        showNotification({
            message: "Warehouses switched",
            id: `stockTransaction_switchWarehouses_${form.values.ID}`,
            color: "grey"
        })

    };

    const { height: viewportHeight } = useViewportSize();

    const { height: toolbarHeight, ref: toolbarRef } = useElementSize();

    useEffect(() => {

        if (Array.isArray(selectedPurchaseOrder?.PurchaseOrderItems) && selectedPurchaseOrder.PurchaseOrderItems.length > 0
            && Array.isArray(form.values.StockTransactionLines) && form.values.StockTransactionLines.length > 0
            && form.values.StockTransactionType === Enums.StockTransactionType.GRV) {

            let lineQuantity = 0;
            let poQuantity = 0;
            let inventoryValidation = "";
            let quantityValidation = "";
            form.values.StockTransactionLines.forEach(line => {
                inventoryValidation = "";
                quantityValidation = "";

                if (!!line.InventoryID) {
                    lineQuantity = line.Quantity ?? 0;

                    let poItems = selectedPurchaseOrder.PurchaseOrderItems.filter(x => x.InventoryID === line.InventoryID);
                    let hasInPO = poItems.length > 0;
                    poQuantity = poItems.reduce((prevValue, item) => prevValue + (item.Quantity ?? 0) - (item.QuantityReceived ?? 0), 0);

                    if (hasInPO) {
                        if (lineQuantity > poQuantity) {
                            quantityValidation = "Exceeding PO Qty";
                        }
                    }
                    else if (lineQuantity > 0) {
                        inventoryValidation = "Not in PO";
                    }
                }

                line["_inventoryValidation"] = inventoryValidation;
                line["_quantityValidation"] = quantityValidation;
            });

        }

    }, [form.values.StockTransactionLines, selectedPurchaseOrder]);

    const getPurchaseOrderAvailableQuantity = (inventoryID) => {
        let qty = getQuantityAvailableFromPurchaseOrder(inventoryID);
        return qty;
    }

    return (<div>


        <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>


            <div className={styles.row} ref={toolbarRef}>
                <div className={styles.title}>
                    {props.hideHeading ? <></> : <>
                        {props.isNew ? "Create " : isComplete ? "View " : "Edit "} {Enums.getEnumStringValue(Enums.StockTransactionStatus, form.getInputProps("StockTransactionStatus").value, true)} {typeText}
                    </>}
                </div>


                {!props.isNew &&
                    <>
                        <Flex justify={"space-between"} w={"100%"} align={"center"}>
                            {props.stockTransaction?.StockTransactionNumber && <Title
                                fw={"normal"}
                                size={"1.5rem"}
                            >{form.getInputProps("StockTransactionNumber").value}</Title>}

                            <Flex justify={"right"} gap={"sm"} className={styles.buttonContainerTop} mr={"0.5rem"}>


                                {form.getInputProps("StockTransactionStatus").value === Enums.StockTransactionStatus.Complete && <>
                                    <Button
                                        key={'printButton'}
                                        variant={'default'}
                                        // disabled={isPrinting || saving}
                                        onClick={() => !isPrinting && printStockTransaction('download')}
                                        // color={'violet'}
                                        leftSection={isPrinting ? <Loader size={16} /> : <IconPrinter size={18} />}
                                        rightSection={
                                            <ActionIcon
                                                // disabled={isPrinting || saving}
                                                variant={'subtle'}
                                                size={'compact-sm'}
                                                color={'dark.5'}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    !isPrinting && printStockTransaction('view')
                                                }}
                                            >
                                                <IconEye size={18} />
                                            </ActionIcon>
                                        }
                                    >
                                        {isPrinting ? "Printing..." : "Print"}
                                    </Button>
                                </>}

                                {form.getInputProps("StockTransactionStatus").value === Enums.StockTransactionStatus.Draft && <>

                                    <Button type={'button'} color={'green.9'} onClick={() => confirmComplete()}
                                        rightSection={(saveStockTransactionMutation.isLoading) && <Loader variant={'oval'} size={18} color={'white'} />}>
                                        {form.values.StockTransactionType === Enums.StockTransactionType.GRV ? "Receive" : "Complete"}
                                    </Button>
                                    <Button color={'scBlue'} type={'submit'} disabled={!form.isDirty() || isDisabled} mt={0}
                                        rightSection={(saveStockTransactionMutation.isLoading) && <Loader variant={'oval'} size={18} color={'white'} />}>
                                        Update
                                    </Button>
                                </>
                                }



                            </Flex>
                        </Flex>

                    </>
                }
            </div>

            <ScrollArea.Autosize
                py={{ base: 5, xs: 8, sm: 'md' }}
                ps={0}
                h={viewportHeight < 500 ? '100%' : `calc(100dvh - ${(toolbarHeight ? (toolbarHeight + 50) : 50)}px)`}
                scrollbars={'y'}
                offsetScrollbars
                type={'auto'}
                maw={constants.maxFormWidth}
            >

                <div className={`${styles.row} ${styles.left}`}>

                    <div style={{ width: "100%" }}>

                        <SimpleGrid
                            w={"100%"}
                            cols={2}

                        >


                            <SCDatePicker
                                {...form.getInputProps("Date")}
                                label={"Date"}
                                required={true}
                                disabled={isDisabled}
                                readOnly={isReadOnly}
                                onChange={(day) => Helper.formSetFieldValue(form, "Date", day)}
                            />

                            {formSettings.employee && <EmployeeSelector
                                accessStatus={accessStatus}
                                disabled={isDisabled}
                                error={form.errors["EmployeeID"] as any}
                                required={formSettings.employee.required}
                                label={formSettings.employee.label}
                                canClear={!isReadOnly && formSettings.employee.canClear}
                                storeID={null}
                                selectedEmployee={selectedEmployee}
                                setSelectedEmployee={updateSelectedEmployee}
                                readOnly={isReadOnly || formSettings.employee.readOnly}
                            />}

                            {formSettings.sourceWarehouse && <WarehouseSelector
                                required={formSettings.sourceWarehouse.required}
                                label={formSettings.sourceWarehouse.label}
                                selectedWarehouse={selectedSourceWarehouse}
                                setSelectedWarehouse={updateSelectedSourceWarehouse}
                                canClear={!isReadOnly && formSettings.sourceWarehouse.canClear}
                                error={form.errors["SourceWarehouseID"] as any}
                                disabled={isDisabled}
                                readOnly={isReadOnly || formSettings.sourceWarehouse.readOnly}
                                ignoreIDs={selectedDestinationWarehouse ? [selectedDestinationWarehouse.ID] : []}
                                filterByEmployee={false}
                                storeID={formSettings.sourceWarehouse.filterByStore ? getSourceStoreID() : undefined}
                                onSuppressSave={() => { }}
                            />}

                            {formSettings.destinationWarehouse && <WarehouseSelector
                                required={formSettings.destinationWarehouse.required}
                                label={formSettings.destinationWarehouse.label}
                                selectedWarehouse={selectedDestinationWarehouse}
                                setSelectedWarehouse={updateSelectedDestinationWarehouse}
                                canClear={!isReadOnly && formSettings.destinationWarehouse.canClear}
                                error={form.errors["DestinationWarehouseID"] as any}
                                disabled={isDisabled}
                                readOnly={isReadOnly || formSettings.destinationWarehouse.readOnly}
                                ignoreIDs={selectedSourceWarehouse ? [selectedSourceWarehouse.ID] : []}
                                filterByEmployee={false}
                                storeID={formSettings.destinationWarehouse.filterByStore ? getDestinationStoreID() : undefined}
                                onSuppressSave={() => { }}
                            />}

                            {formSettings.sourceWarehouse && formSettings.destinationWarehouse && form.values.StockTransactionStatus === Enums.StockTransactionStatus.Draft && <>
                                <Button
                                    variant={'subtle'}
                                    color={'gray.9'}
                                    leftSection={<IconSwitchHorizontal size={16} />}
                                    w={"fit-content"}
                                    onClick={switchWarehouses}
                                >
                                    Switch Warehouses
                                </Button>
                            </>}

                            {formSettings.supplier && <SupplierSelector
                                required={formSettings.supplier.required}
                                label={formSettings.supplier.label}
                                selectedSupplier={selectedSupplier}
                                setSelectedSupplier={updateSelectedSupplier}
                                canClear={!isReadOnly && formSettings.supplier.canClear}
                                error={form.errors["SupplierID"] as any}
                                accessStatus={accessStatus}
                                onCreateNewSupplier={undefined}
                                disabled={isDisabled}
                                readOnly={isReadOnly || formSettings.supplier.readOnly}
                            />}

                            {formSettings.purchaseOrder && <PurchaseOrderSelector
                                required={formSettings.purchaseOrder.required}
                                label={formSettings.purchaseOrder.label}
                                selectedPurchaseOrder={selectedPurchaseOrder}
                                setSelectedPurchaseOrder={updateSelectedPurchaseOrder}
                                canClear={!isReadOnly && formSettings.purchaseOrder.canClear}
                                error={form.errors["PurchaseOrderID"] as any}
                                disabled={isDisabled || disablePurchaseOrderSelector()}
                                title={getPurchaseOrderTooltip()}
                                supplierID={form.getInputProps("SupplierID").value}
                                readOnly={isReadOnly || formSettings.purchaseOrder.readOnly}
                                hideFullyReceived={formSettings.purchaseOrder.hideFullyReceived}
                            />}


                        </SimpleGrid>

                        <SCTextArea
                            {...form.getInputProps("Comment")}
                            label='Comments'
                            placeholder={`Add ${formSettings.commentsRequired ? "" : "optional "}comments`}
                            onChange={(e) => Helper.formSetFieldValue(form, "Comment", e.value)}
                            disabled={isDisabled}
                            readOnly={isReadOnly}
                            required={formSettings.commentsRequired}
                        />



                    </div>


                </div>

                <div style={{ width: "100%", maxWidth: "768px", marginTop: "1rem" }}>

                    <div className={styles.subtitle}>Items</div>

                    {form.errors["StockTransactionLines"] && <span style={{ color: colors.mantineErrorOrange(), fontSize: "12px", lineHeight: "1.2" }}>{form.errors["StockTransactionLines"]}</span>}

                    <SimpleTable
                        cellVAlign='top'
                        stylingProps={{ compact: true, darkerText: true, rows: false }}
                        data={prepareStockLines()}
                        mapping={[{
                            key: "InventoryID",
                            label: "Code",
                            minColumnWidth: 50,
                            valueFunction: (line: StockTransactionLine) => {
                                return <div style={{ marginTop: "0.5rem", maxWidth: "150px" }} title={line.Inventory?.Code}>{line.Inventory?.Code}</div>
                            }
                        },
                        {
                            key: "InventoryID",
                            label: "Inventory",
                            columnWidth: 500,
                            valueFunction: (line: StockTransactionLine) => {
                                return (<div style={{ marginTop: "-0.75rem", width: "400px", position: "relative" }}>
                                    <InventorySelector
                                        key={`inventorySelector_${line.ID}`}
                                        accessStatus={accessStatus}
                                        cypress={""}
                                        onCreateNewInventoryItem={undefined}
                                        selectedInventory={line.Inventory}
                                        setInventoryChanged={(() => { }) as any}
                                        setSelectedInventory={(e) => {
                                            if (!e) return; // added this in to avoid null values coming back and clearing the selected inventory (never allowed)
                                            updateInventory(line, e);
                                        }}
                                        label=''
                                        //ignoreIDs={getIgnoreIDs(line) as any}
                                        disableIDs={getIgnoreIDs(line) as any}
                                        canClear={!isDisabled && !isReadOnly}
                                        disabled={isDisabled}
                                        readOnly={isReadOnly}
                                        error={form.values.StockTransactionStatus === Enums.StockTransactionStatus.Draft && line["_inventoryValidation"]}
                                        additionalQueryParams={{ OnlyWarehoused: true, PopulateStock: true } as any}
                                    //warehouseID={getWarehouseIDFilterForInventory()} // commented out as it is pulling inventories every time warehouse is changed... not sure needed
                                    />
                                </div>)
                            }
                        },
                        ...(formSettings.showQuantityAvailable ? [
                            {
                                key: "QuantityAvailable",
                                label: formSettings.quantityAvailableLabel ?? "Qty Available",
                                valueFunction: (line: StockTransactionLine) => {
                                    return <div style={{ marginTop: "0.5rem" }}>{line.WarehouseStock?.QuantityAvailable ?? line.Inventory?.WarehouseStock?.find(x => x.WarehouseID === (form.values.SourceWarehouseID ?? form.values.DestinationWarehouseID))?.QuantityAvailable}</div>
                                },
                                alignRight: true,
                                tooltip: formSettings.quantityAvailableTitle,
                                columnWidth: 60
                            } as SimpleColumnMapping
                        ] : []),
                        {
                            key: "Quantity",
                            label: formSettings.quantityLabel ?? "Quantity",
                            columnWidth: 100,
                            valueFunction: (line: StockTransactionLine) => {
                                return (<div style={{ marginTop: "-0.75rem" }}>
                                    <SCNumericInput
                                        label={undefined}
                                        min={getMinQuantity()}
                                        format={Enums.NumericFormat.Decimal}
                                        value={line.Quantity}
                                        name={`quantity_${Math.random()}`}
                                        max={undefined}
                                        onChange={(e) => { updateLine(line.ID, "Quantity", e.value) }}
                                        textAlign={"right"}
                                        required={false}
                                        disabled={isDisabled}
                                        readOnly={isReadOnly}
                                        cypress={undefined}
                                        extraClasses={""}
                                        hint={""}
                                        alignRight={true}
                                        error={form.values.StockTransactionStatus === Enums.StockTransactionStatus.Draft && line["_quantityValidation"]}
                                    />

                                </div>)
                            },
                            alignRight: true
                        },
                        ...(formSettings.showUnitCostPrice ? [
                            {
                                key: "UnitCostPrice",
                                label: "Unit Cost",
                                columnWidth: 112,
                                valueFunction: (line: StockTransactionLine) => {
                                    return (<div style={{ marginTop: "-0.75rem" }}>
                                        <SCNumericInput
                                            label={undefined}
                                            min={0}
                                            format={Enums.NumericFormat.Currency}
                                            value={line.UnitCostPrice}
                                            name={`unitcost_${Math.random()}`}
                                            max={undefined}
                                            onChange={(e) => { updateLine(line.ID, "UnitCostPrice", e.value) }}
                                            textAlign={"right"}
                                            required={false}
                                            disabled={isDisabled}
                                            readOnly={isReadOnly}
                                            cypress={undefined}
                                            extraClasses={""}
                                            hint={""}
                                            alignRight={true}
                                        />
                                    </div>)
                                },
                                alignRight: true
                            } as SimpleColumnMapping
                        ] : []),
                        ...(formSettings.showPurchaseOrderAvailable ? [
                            {
                                key: "PurchaseOrderAvailable",
                                label: "Outstanding",
                                tooltip: "Quantity outstanding from purchase order",
                                columnWidth: 140,
                                valueFunction: (line: StockTransactionLine) => {
                                    return <div style={{ marginTop: "0.5rem" }}>{getPurchaseOrderAvailableQuantity(line.InventoryID)}</div>
                                },
                                alignRight: true
                            } as SimpleColumnMapping
                        ] : [])
                        ]}
                        controls={isDisabled || isReadOnly ? [] : [
                            {
                                type: 'default',
                                icon: <IconX height={16} />,
                                name: "remove",
                                label: "Remove",
                            }
                        ]}
                        onAction={(actionName: string, actionItem: StockTransactionLine, actionItemIndex: number) => {
                            if (actionName === "remove") {
                                removeLine(actionItem);
                            }
                        }}
                        showControlsOnHover={false}
                        {...!isDisabled && !isReadOnly && !disableAddLine() && canAddLine() && {
                            addButton: {
                                label: "Add Line",
                                callback: () => addLine(),
                            }
                        }}
                        height={"100vh"}

                    />

                    {disableAddLine() && <div style={{ color: "orange", fontStyle: "italic", marginTop: "1rem", fontSize: "0.8rem" }}>Select {useBothWarehouses ? '' : 'a'} <span style={{ fontWeight: "bold" }}>warehouse{useBothWarehouses ? "s" : ""} above</span> to add lines</div>}

                </div>



                {props.isNew &&
                    <Flex justify={"right"} gap={"sm"} className={styles.buttonContainer} >
                        {props.onCancel ? <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => props.onCancel && props.onCancel()}>
                            Cancel
                        </Button> : null}

                        <SCSplitButton items={[{
                            defaultItem: true,
                            key: "draft",
                            label: "Create as Draft",
                            rightSection: (saveStockTransactionMutation.isLoading) && <Loader variant={'oval'} size={18} color={'white'} />,
                            leftSection: <IconDeviceFloppy />,
                            disabled: /*!form.isDirty() ||*/ isDisabled || isReadOnly,
                            action: () => {
                                !form.validate().hasErrors && handleSubmit(form.values);
                            }
                        }, {
                            defaultItem: false,
                            key: "complete",
                            label: form.values.StockTransactionType === Enums.StockTransactionType.GRV ? "Save and Receive" : "Save and Complete",
                            rightSection: (saveStockTransactionMutation.isLoading) && <Loader variant={'oval'} size={18} color={'white'} />,
                            leftSection: <IconFileCheck color="var(--mantine-color-green-8)" />,
                            disabled: /*!form.isDirty() ||*/ isDisabled || isReadOnly,
                            action: () => {
                                confirmComplete();
                            }
                        }]} />

                    </Flex>
                }

                <Space h={80} />
            </ScrollArea.Autosize>
        </form>





        <ConfirmAction
            options={confirmOptions}
            setOptions={setConfirmOptions}
        />

        <style jsx>{`

        :global(td.mantine-Table-td:first-child > div) {
            width: auto !important;
        }

        .table {
            width: 100%;
            border: none;
            border-collapse: collapse;
        }

        .table thead tr {
          background-color: ${colors.backgroundGrey};
          height: 2rem;
          border-radius: ${layout.cardRadius};
          width: 100%;
        }
        .table th {
          color: ${colors.darkPrimary};
          font-size: 0.75rem;
          font-weight: normal;
          padding: 4px 1rem 4px 0; 
          position: relative;
          text-align: left;
          text-transform: uppercase;
          transform-style: preserve-3d;
          user-select: none;
          white-space: nowrap;
        }
        .table th.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table th:last-child {
          padding-right: 1rem;
          text-align: right;
        }
        .table th:first-child {
          padding-left: 0.5rem;
          text-align: left;
        }
        .table .spacer {
          height: 0.75rem !important;
        }
        .table tr {
          height: 2rem;
          /* cursor: pointer; */
        }
        .table td {
          font-size: 12px;
          padding-right: 1rem;
        }
        .table td.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table tr:nth-child(even) td {
          background-color: ${colors.backgroundGrey}55;
        }
        .table td:last-child {
          border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
          text-align: right;
        }
        .table td:last-child :global(div){
          margin-left: auto;
        }
        .table td:first-child {
          border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
          padding-left: 1rem;
          text-align: left;
        }
        .table td:first-child :global(div){
          margin-left: 0;
        }
            
        `}</style>
    </div >);
};

export default ManageStockTransactionForm;