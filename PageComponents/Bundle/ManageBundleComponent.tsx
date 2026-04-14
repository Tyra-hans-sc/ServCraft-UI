import SCCheckbox from '@/components/sc-controls/form-controls/sc-checkbox';
import SCInput from '@/components/sc-controls/form-controls/sc-input';
import SCNumericInput from '@/components/sc-controls/form-controls/sc-numeric-input';
import ScTextAreaControl from '@/components/sc-controls/form-controls/v2/ScTextAreaControl';
import bundleService from '@/services/inventory/bundle-service';
import constants from '@/utils/constants';
import ToastContext from '@/utils/toast-context';
import { Box, Button, Flex, Text } from '@mantine/core';
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SimpleTable from '../SimpleTable/SimpleTable';
import InventorySelector from '@/components/selectors/inventory/inventory-selector';
import SubscriptionContext from '@/utils/subscription-context';
import { TableAction, TableActionStates } from '../Table/table-model';
import { IconX } from '@tabler/icons-react';
import * as Enums from '@/utils/enums';
import helper from '@/utils/helper';
import useRefState from '@/hooks/useRefState';
import { useRouter } from 'next/router';
import InventoryItemModal from "@/PageComponents/Inventory/InventoryItemModal";
import { FieldSetting, getFieldSettings } from "@/PageComponents/Settings/Field Settings/FieldSettings";
import {
    getSystemNameForFormName
} from "@/PageComponents/Settings/Field Settings/fieldSettingHelper";
import { useQuery } from '@tanstack/react-query';
import companyService from '@/services/company-service';
import ItemDisplayImages from '../Attachment/ItemDisplayImages';
import Fetch from '@/utils/Fetch';

const ManageBundleComponent: FC<{
    bundle?: any,
    onBundleCreated?: (bundle: any) => void
    onConfirm?: (bundle: any | null) => void
}> = (props) => {
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
    const isShown = useCallback((name: string) => {
        const systemName = getSystemNameForFormName(name)
        return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive : false
    }, [settingsBySystemName])
    /** fieldSettings End */


    const toast = useContext(ToastContext);
    const router = useRouter();
    const subscriptionContext = useContext(SubscriptionContext);
    const [bundle, setBundle, getBundleValue] = useRefState<any>({ BundleInventory: [] }); // using useRefState as SimpleTable is not behaving well with state changes and remembers old state not just momentarily
    const [inputErrors, setInputErrors] = useState<any>({});
    const [useListPrice, setUseListPrice] = useState(true);
    const [listPriceDiscount, setListPriceDiscount] = useState(0);

    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.Live);
    const [inputProps, setInputProps] = useState({}); // not sure how this is used yet
    const [actionStates, setActionStates] = useState<TableActionStates>({}); // not sure how this is used yet
    const [selectedInventory, setSelectedInventory] = useState<any>(null);
    const [editingInventory, setEditingInventory] = useState<any>();
    const [currency, setCurrency] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const bundleSaveTimeoutRef = useRef<any>(null);

    const isNew = useMemo(() => {
        return !props.bundle;
    }, [props.bundle]);

    const setupBundle = async () => {
        let bundleTemp: any;
        if (!isNew) {
            bundleTemp = { ...props.bundle };
        }
        else {
            let canCreate = await bundleService.GetBundlesCanCreate(toast);
            if (!canCreate.CanCreate) {
                navigateToList();
                return;
            }
            bundleTemp = {
                Name: null,
                Description: null,
                BundleInventory: [],
                IsActive: true
            };
        }

        setBundle(bundleTemp);
    };

    const navigateToList = () => {
        helper.nextRouter(router.replace, '/inventory/list?tab=bundles');
    };

    const bundleFieldChanged = (e) => {
        setBundle({ ...bundle, [e.name]: e.value });

        attemptAutoSave();
    };

    const getBlankBundleInventory = (inventory: any) => {
        let lineNumber = 1;

        if (Array.isArray(bundle.BundleInventory) && bundle.BundleInventory.length > 0) {
            lineNumber = bundle.BundleInventory.filter(x => x.IsActive).sort((a, b) => b.LineNumber - a.LineNumber)[0].LineNumber + 1;
        }

        return {
            ID: helper.newGuid(),
            InventoryID: inventory.ID,
            Inventory: inventory,
            Quantity: 1,
            PriceListID: null,
            UsePriceList: useListPrice,
            PriceListDiscount: useListPrice ? listPriceDiscount : 0,
            CustomPrice: inventory.ListPrice,
            IsActive: true,
            LineNumber: lineNumber
        }
    };

    const inventorySelected = (inventory) => {
        if (!inventory) return;

        setSelectedInventory(inventory);

        setBundle({
            ...bundle,
            BundleInventory: [...bundle.BundleInventory, getBlankBundleInventory(inventory)]
        });

        attemptAutoSave();
    };

    useEffect(() => {
        if (!selectedInventory) return;
        setTimeout(() => {
            setSelectedInventory(_ => null);
        }, 100);
    }, [selectedInventory]);

    const setupCompany = async () => {
        let currencySymbol = await companyService.getCurrencySymbol();
        setCurrency(currencySymbol);
    };

    useEffect(() => {
        setupBundle();
        setAccessStatus((subscriptionContext as any).subscriptionInfo.AccessStatus);
        setupCompany();
    }, []);

    const handleBundleInventoryInputChange = async (name: string, item: any, value: any) => {
        let inventoryTemp = [...bundle.BundleInventory];
        let idx = inventoryTemp.findIndex(x => x.ID === item.ID);
        if (idx > -1) {
            inventoryTemp[idx][name] = value;

            if (name === "UsePriceList") {
                if (value === true) {
                    //inventoryTemp[idx]["CustomPrice"] = item.Inventory.ListPrice;
                }
                else if (value !== true) {
                    //inventoryTemp[idx]["PriceListDiscount"] = 0;
                }
            }

            setBundle({
                ...bundle,
                BundleInventory: inventoryTemp
            });

            attemptAutoSave();
        }
    };

    const handleRemoveItem = async (e) => {
        setBundle({
            ...bundle,
            BundleInventory: [...bundle.BundleInventory].filter(x => x.ID !== e.ID)
        });

        attemptAutoSave();
    };

    const toggleBundleIsActive = async () => {
        let bundleState = { ...getBundleValue() };
        let newActiveState = !bundleState.IsActive;
        bundleState.IsActive = newActiveState;

        await saveBundle(bundleState, newActiveState ? "Bundle activated successfully" : "Bundle deactivated successfully");
    };

    const validate = (bundleToValidate) => {

        let inputs = [
            { key: 'Name', value: bundleToValidate.Name, required: true, type: Enums.ControlType.Text }
        ];

        let { isValid, errors } = helper.validateInputs(inputs);

        if (!isNew && bundleToValidate.BundleInventory.length > 0) {
            if (bundleToValidate.BundleInventory.filter(x => isNaN(x.CustomPrice)).length > 0) {
                isValid = false;
                errors["BundleInventory"] = "All line items need a price";
            }
            else if (bundleToValidate.BundleInventory.filter(x => isNaN(x.Quantity) || x.Quantity <= 0).length > 0) {
                isValid = false;
                errors["BundleInventory"] = "All line items need a quantity";
            }
        }

        setInputErrors(errors);

        if (!isValid) {
            (toast as any).setToast({
                message: 'There are errors on the page',
                show: true,
                type: 'error'
            });
        }

        return isValid;
    };

    const onReorder = async (orderedBundleInventory: any[]) => {
        orderedBundleInventory.forEach((bi, idx) => {
            bi.LineNumber = idx + 1;
        });
        bundleFieldChanged({ name: "BundleInventory", value: orderedBundleInventory });
    };

    const attemptAutoSave = () => {

        if (isNew) return;

        clearTimeout(bundleSaveTimeoutRef.current);

        bundleSaveTimeoutRef.current = setTimeout(() => {
            saveBundle();
        }, 1000);
    };

    const saveBundle: (bundleStateOverride?, showSuccessMessage?) => Promise<boolean> = async (bundleStateOverride = null, showSuccessMessage = "") => {

        if (!bundleStateOverride) {
            bundleStateOverride = getBundleValue();
        }

        let saved = false;
        if (!validate(bundleStateOverride)) {
            return saved;
        }

        setIsSaving(true);

        let bundleResult = await bundleService.saveBundle(bundleStateOverride, toast);

        if (!!(bundleResult?.ID)) {

            saved = true;
            if (isNew) {
                if (props.onBundleCreated) {
                    setBundle(bundleResult)
                    props.onBundleCreated(bundleResult)
                } else {
                    helper.nextRouter(router.push, '/bundle/[id]', `/bundle/${bundleResult.ID}`);
                }
            }
            else {
                setBundle(bdl => ({ ...bdl, RowVersion: bundleResult.RowVersion, IsActive: bundleResult.IsActive })); // removing this as it is overwriting later updates
                if (showSuccessMessage) {
                    (toast as any).setToast({
                        message: showSuccessMessage,
                        show: true,
                        type: 'success'
                    });
                }
            }
        }

        setIsSaving(false);

        return saved;
    };

    const editInventoryForBundleInventory = (actionItem) => {
        setEditingInventory({ ...actionItem.Inventory });
    };

    const editingInventorySaved = (inventory) => {

        if (!!inventory) {

            let inventoryTemp = [...bundle.BundleInventory];

            inventoryTemp.filter(x => x.InventoryID === inventory.ID).forEach(bi => {
                bi.Inventory = inventory
            });

            setBundle({
                ...bundle,
                BundleInventory: inventoryTemp
            });
        }

        setEditingInventory(null);
    };

    const calculateFinalUnitPrice = (item) => {
        if (item.UsePriceList) {
            return (item.Inventory.ListPrice ?? 0) * (1 - ((item.PriceListDiscount ?? 0) / 100));
        }
        else {
            return item.CustomPrice ?? 0
        }
    }

    const bundleTotal = useMemo(() => {
        if (!Array.isArray(bundle?.BundleInventory)) return 0;

        let total = (bundle.BundleInventory as any[]).reduce((accumulator, item) => {

            let lineTotal = 0;

            lineTotal = calculateFinalUnitPrice(item) * item.Quantity;

            accumulator += lineTotal;
            return accumulator;
        }, 0);

        return total;

    }, [bundle]);



    const tableControls = useMemo<TableAction[]>(() => {
        return bundle.BundleInventory && [
            {
                label: 'Remove',
                disabledLabel: 'Cannot modify without paying your subscription and having access',
                activeLabel: 'Removing',
                name: 'remove',
                type: 'warning',
                icon: <IconX />,
                conditionalDisable: (x: any) => {
                    return accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess;
                }
            }
        ] || []
    }, [accessStatus]);


    const onPrimaryDisplayImageUpdate = async (attachmentID: string | null) => {

        let result = await Fetch.put({
            url: `/Bundle/${bundle.ID}/PrimaryDisplayImage/${attachmentID}`,
            toastCtx: toast
        })
        
        if (result.ID) {
            setBundle(bund => ({
                ...bund,
                PrimaryDisplayImageID: attachmentID,
                RowVersion: result.RowVersion
            }));
        }
    }

    return (<>
        <Flex
            justify={"space-between"}
        >
            <Flex align={"center"}>

                <div className="heading" style={{ marginTop: 8 }}>
                    Bundle Details {!bundle.IsActive && "[Deactivated]"}
                </div>
            </Flex>
            {!isNew && <div>
                <Button variant={'subtle'}
                    color={isSaving ? 'green' : 'gray.9'}
                    mr={"sm"}
                    onClick={() => {
                        if (!isSaving) {
                            if (props.onConfirm) {
                                props.onConfirm(null)
                            } else {
                                navigateToList()
                            }
                        }
                    }}
                >
                    {isSaving ? "Saving" : "Back"}
                </Button>
                {
                    !!props.onConfirm &&
                    <Button variant={'filled'}
                        color={isSaving ? 'green' : 'scBlue'}
                        mr={"sm"}
                        onClick={() => {
                            if (!isSaving) {
                                if (props.onConfirm) {
                                    props.onConfirm(bundle)
                                }
                            }
                        }}
                    >
                        {isSaving ? "Saving" : "Confirm"}
                    </Button>
                }
                <Button
                    color={bundle.IsActive ? "red" : "green"}
                    variant='light'
                    disabled={isSaving}
                    onClick={toggleBundleIsActive}
                >
                    {bundle.IsActive ? "Deactivate" : "Activate"}
                </Button>
            </div>}
        </Flex>
        <div className="form-container">

            {!isNew &&
                <ItemDisplayImages
                    itemID={bundle?.ID}
                    module={Enums.Module.Bundle}
                    primaryDisplayImageID={bundle?.PrimaryDisplayImageID}
                    onPrimaryDisplayImageUpdate={onPrimaryDisplayImageUpdate}
                />
            }

            <Flex gap={'sm'} wrap={'wrap'}>
                <div style={{ flexGrow: 1 }}>
                    <SCInput
                        name='Name'
                        label="Name"
                        value={bundle.Name}
                        required={true}
                        error={inputErrors.Name}
                        onChange={bundleFieldChanged}
                    />
                </div>
                <Box w={{ base: '100%', sm: 'auto' }} style={{ flexGrow: 1 }}>
                    <ScTextAreaControl
                        autosize
                        maxRows={7}
                        name='Description'
                        label="Description"
                        value={bundle.Description}
                        required={false}
                        error={inputErrors.Description}
                        onChange={(e) => bundleFieldChanged({ name: e.target.name, value: e.target.value })}
                    />
                </Box>
            </Flex>
        </div>

        {isNew && <>
            <Flex mt={'md'} justify={'end'}>
                <Button variant={'subtle'}
                    mr={"sm"}
                    onClick={() => {
                        if (!isSaving) {
                            if (props.onConfirm) {
                                props.onConfirm(null)
                            } else {
                                navigateToList()
                            }
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    disabled={isSaving}
                    onClick={() => !isSaving && saveBundle()}
                >
                    {isSaving ? "Saving" : "Create Bundle"}
                </Button>
            </Flex>
        </>}

        {!isNew && <>
            <div className="form-container" style={{ background: "whitesmoke", marginTop: "1rem", padding: "0.5rem" }}>
                <div className="heading" style={{ marginTop: "0" }}>
                    Default Settings
                </div>

                <Text size={'sm'} c={'dimmed'} mb={0}>Adding items below will use these default settings</Text>

                <div className="row" style={{ padding: "0.5rem" }}>
                    <div className="column">
                        <SCCheckbox
                            label='Use List Price'
                            name='useListPrice'
                            value={useListPrice as any}
                            onChange={setUseListPrice}
                        />
                    </div>
                    {useListPrice && <div className="column">
                        <SCNumericInput
                            mt={0}
                            label={"Price reduction % on list price"}
                            value={listPriceDiscount}
                            min={0}
                            max={100}
                            name={"listPriceDiscount"}
                            onChange={(e) => setListPriceDiscount(e.value)}
                        />
                    </div>
                    }
                </div>
            </div>

            <Box p={'sm'}>
                <SimpleTable
                    stylingProps={{ compact: true, darkerText: true, rows: false }}
                    data={bundle?.BundleInventory?.sort((a, b) => a.LineNumber - b.LineNumber) ?? []}
                    height={'100%'}
                    canEdit={true}
                    onReorder={onReorder}
                    onInputChange={handleBundleInventoryInputChange}
                    onAction={(actionName, actionItem, actionItemIndex) => (actionName === 'remove' && handleRemoveItem(actionItem)) || (actionName === "editInventory" && editInventoryForBundleInventory(actionItem))}
                    mapping={[
                        {
                            label: 'Code',
                            key: 'Code',
                            valueFunction: (item) => {
                                return `${item.Inventory.Code}`;
                            },
                            linkAction: "editInventory"
                        },
                        {
                            label: 'Description',
                            key: 'Description',
                            valueFunction: (item) => {
                                return `${item.Inventory.Description || ''}`;
                            }
                        },
                        {
                            label: 'Type',
                            key: 'StockItemType',
                            valueFunction: (item) => {
                                return `${Enums.getEnumStringValue(Enums.StockItemType, item.Inventory.StockItemType)}`;
                            },
                            inputProps: {
                                readOnly: true
                            },
                            stylingProps: {
                                compact: true,
                                darkerText: true
                            }
                        },
                        {
                            label: 'Category',
                            key: 'InventoryCategoryDescription',
                            valueFunction: (item) => {
                                return `${item.Inventory.InventoryCategoryDescription || ''}`;
                            },
                            hide: !isShown("InventoryCategory")
                        },
                        {
                            label: 'Subcategory',
                            key: 'InventorySubcategoryDescription',
                            valueFunction: (item) => {
                                return `${item.Inventory.InventorySubcategoryDescription || ''}`;
                            },
                            hide: !isShown("InventorySubcategory")
                        },
                        {
                            label: 'Quantity',
                            type: 'numberInput',
                            key: 'Quantity',
                            inputProps: {
                                width: 50
                            }
                        },
                        {
                            label: 'Use List Price',
                            type: 'checkInput',
                            key: 'UsePriceList',
                        },
                        {
                            label: 'Price',
                            type: 'numberInput',
                            key: 'CustomPrice',
                            inputProps: {
                                disabledFunction: (item) => {
                                    return item.UsePriceList;
                                }
                            },
                            valueFunction: (item) => {
                                return item.UsePriceList ? item.Inventory.ListPrice : item.CustomPrice;
                            }
                        },
                        {
                            label: 'Price Reduction %',
                            type: 'numberInput',
                            key: 'PriceListDiscount',
                            inputProps: {
                                max: 100,
                                disabledFunction: (item) => {
                                    return !item.UsePriceList;
                                }
                            },
                            valueFunction: (item) => {
                                return item.UsePriceList ? item.PriceListDiscount : 0;
                            }
                        },
                        {
                            label: 'Final Unit Price',
                            key: 'CustomPrice',
                            inputProps: {
                                disabled: true
                            },
                            valueFunction: (item) => {
                                let unitPrice = calculateFinalUnitPrice(item);
                                return helper.getCurrencyValue(unitPrice, currency as any);
                            }
                        }
                    ]}
                    tableItemInputMetadataByKeyName={inputProps}
                    controls={tableControls}
                    tableActionStates={actionStates}
                    showControlsOnHover={false}
                    addButton={{
                        customComponent:
                            <Box
                            // p={'sm'}
                            >
                                <Flex justify={"space-between"}>
                                    <div style={{ width: '100%' }}>
                                        <InventorySelector
                                            accessStatus={accessStatus}
                                            selectedInventory={selectedInventory}
                                            setSelectedInventory={inventorySelected}
                                            onCreateNewInventoryItem={undefined}
                                        />
                                    </div>
                                    <div style={{ width: "300px", textAlign: "right", padding: "1rem", fontWeight: "bold" }}>BUNDLE TOTAL: {helper.getCurrencyValue(bundleTotal, currency as any)}</div>

                                </Flex>
                                {inputErrors.BundleInventory && <Text size={'sm'} c={'yellow'} mb={0}>{inputErrors.BundleInventory}</Text>}

                            </Box>,
                        label: '',
                    }}
                />
            </Box>
        </>}

        {editingInventory && <InventoryItemModal
            show={true}
            inventory={editingInventory}
            accessStatus={accessStatus}
            onClose={() => editingInventorySaved(null)}
            onInventorySave={editingInventorySaved}
            isNew={false}
        />}


        <style jsx>{`

        .form-container {
            max-width: ${constants.maxFormWidth};
        }
            
        .row {
          display: flex;
        }
        .column {
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
        }
        .column :global(.textarea-container) {
          height: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
        }

        `}</style>
    </>);
};

export default ManageBundleComponent;