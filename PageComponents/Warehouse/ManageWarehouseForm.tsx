import { FC, useContext, useEffect, useMemo, useRef, useState } from "react"
import styles from './ManageWarehouseForm.module.css'
import { useForm } from "@mantine/form"
import Helper from '@/utils/helper'
import * as Enums from '@/utils/enums'
import { Warehouse } from "@/interfaces/api/models"
import SCDropdownList from "@/components/sc-controls/form-controls/sc-dropdownlist"
import SubscriptionContext from "@/utils/subscription-context"
import { Box, Button, Flex, Loader, Title } from "@mantine/core"
import { useMutation, useQuery } from "@tanstack/react-query"
import warehouseService from "@/services/warehouse/warehouse-service"
import ToastContext from "@/utils/toast-context"
import { showNotification } from "@mantine/notifications"
import SCInput from "@/components/sc-controls/form-controls/sc-input"
import { useRouter } from "next/router"
import storeService from "@/services/store/store-service"
import EmployeeSelector from '@/components/selectors/employee/employee-selector'
import StoreSelector from '@/components/selectors/store/store-selector'
import SCSwitch from "@/components/sc-controls/form-controls/sc-switch"
import ConfirmAction from "@/components/modals/confirm-action"
import featureService from "@/services/feature/feature-service"
import constants from "@/utils/constants"
import { Employee } from "../Message/Communication/NewCommunicationForm"
import { IconArrowLeft } from "@tabler/icons-react"

const ManageWarehouseForm: FC<{
    warehouse?: Warehouse
    isNew: boolean
    caller?: string
    onCancel?: Function
    defaultStore?: any
    onBack?: Function
}> = (props) => {

    const [isInitiallyDefault] = useState(!props.isNew && props.warehouse?.IsDefault === true);
    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
    const subscriptionContext = useContext<any>(SubscriptionContext);
    const toastCtx = useContext(ToastContext);
    const router = useRouter();
    const [isMultiStore, setIsMultiStore] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(props.warehouse?.Employee ?? null);
    const [selectedStore, setSelectedStore] = useState(props.warehouse?.Store ?? props.defaultStore ?? null);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
    const [employeeSearchAvailable, setEmployeeSearchAvailable] = useState(true);

    const { data: hasVanStock } = useQuery(['hasVanStock'], () => featureService.getFeature(constants.features.VAN_STOCK));

    const { data: ignoreEmployeeIDs } = useQuery(['ignoreEmployeeIDs'], () => warehouseService.getIgnoreEmployeeIDs(props.warehouse?.ID), {
        refetchInterval: 30_000 // refetch every 30 seconds for validation to account for changes
    });

    const [savedCounter, setSavedCounter] = useState(0);

    const { data: canCreateInfo } = useQuery(['canCreateInfo', savedCounter], warehouseService.mobileWarehouseCanCreate);

    useEffect(() => {
        setAccessStatus(subscriptionContext?.subscriptionInfo?.AccessStatus);
        setIsMultiStore(subscriptionContext?.subscriptionInfo?.MultiStore);
    }, [hasVanStock, subscriptionContext]);

    const form = useForm<Warehouse>({
        initialValues: !props.isNew || props.warehouse ? {
            ...props.warehouse
        } : {
            // inital values if a create
            ID: Helper.newGuid(),
            IsActive: true,
            IsDefault: false,
            StoreID: props.defaultStore?.ID ?? null,
            WarehouseType: Enums.WarehouseType.Mobile,
        } as Warehouse,
        validate: {
            WarehouseType: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
                customErrorText: 'Type must be selected'
            } as any),
            "Name": (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true,
                customErrorText: "Name is required"
            } as any),
            "Code": (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true,
                customErrorText: isVan ? "Number plate is required" : "Code is required"
            } as any),
            "StoreID": (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
                customErrorText: "Store is required"
            } as any),
            "EmployeeID": (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: form.getInputProps("WarehouseType").value === Enums.WarehouseType.Mobile as any,
                customErrorText: "Employee is required"
            } as any) //|| (ignoreEmployeeIDs?.includes(x ?? '') ? "Employee is already assigned to another warehouse, try search again" : null),
        },
        clearInputErrorOnChange: true,
        validateInputOnBlur: true
    });



    // todo: find a way to make the save work with this hook (new hook?)
    Helper.preventRouteChange(form.isDirty(), () => Helper.formResetDirty(form), setConfirmOptions, undefined);

    // investigate if this works with :any
    const submitWarehouse = async (warehouse: Warehouse) => {
        return warehouseService.saveWarehouse(warehouse, props.isNew, toastCtx, props.caller);
    }

    const saveWarehouseMutation = useMutation(["warehouse", "save", form.values.ID], submitWarehouse, {
        onSuccess: async (data: Warehouse) => {
            if (data.ID) {
                form.setValues(data);

                showNotification({
                    message: props.isNew ? "Van created successfully" : "Warehouse saved successfully",
                    id: `warehouse_save_${form.values.ID}`
                });

                Helper.formResetDirty(form);
                setSavedCounter(prev => prev + 1);

                if (props.isNew) {
                    await Helper.waitABit();
                    if (props.onBack) {
                        props.onBack(data.ID);
                        return;
                    }
                    Helper.nextRouter(router.push, "/settings/warehouse/[id]", `/settings/warehouse/${data.ID}`);
                }
            }
        }
    });

    const handleSubmit = (warehouse: Warehouse) => {
        if (warehouse.IsActive === true && form.validate().hasErrors) return;

        saveWarehouseMutation.mutate(warehouse as any);
    }

    const isDisabled = useMemo(() => {
        return accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess;
    }, [accessStatus]);

    const warehouseTypeOptions = useMemo(() => {
        return Enums.getEnumItemsVD(Enums.WarehouseType, true, false)
            .filter(x => !props.isNew || x.value === Enums.WarehouseType.Mobile)
            .map(x => x.value === Enums.WarehouseType.Mobile ? { ...x, description: "Van" } : x);
    }, []);

    const updateEmployee = (employee: any) => {
        setSelectedEmployee(employee);
        Helper.formSetFieldValue(form, "EmployeeID", employee?.ID ?? null);
        if (employee && employee.ID && ignoreEmployeeIDs?.includes(employee.ID)) {
            setConfirmOptions({
                ...Helper.initialiseConfirmOptions(),
                display: true,
                heading: "Employee already assigned",
                text: "Employee is already assigned to another van, this will remove them from that van",
                showCancel: false
            });
        }
    };

    const updateStore = (store: any) => {
        setSelectedStore(store);
        Helper.formSetFieldValue(form, "StoreID", store?.ID ?? null);

        if (selectedEmployee) {
            updateEmployee(null);
            showNotification({
                message: "Store change cleared the employee",
                id: `store_changed_${form.values.ID}`
            });
        }
    };

    const isVan = useMemo(() => {
        return form.getInputProps("WarehouseType").value === Enums.WarehouseType.Mobile;
    }, [form]);

    const isWarehouse = useMemo(() => {
        return form.getInputProps("WarehouseType").value === Enums.WarehouseType.Warehouse;
    }, [form]);

    const canDeactivate = () => {
        return !props.isNew && !form.getInputProps("IsDefault").value && !isWarehouse;
    }

    const canActivate = () => {
        return !isWarehouse && canCreateInfo?.CanCreate === true;
    }

    const navigateToList = () => {
        if (props.onBack) {
            props.onBack();
            return;
        }

        Helper.nextRouter(router.push, `/settings/inventory/manage?tab=${isVan ? "van" : isWarehouse ? "warehouse" : "inventory"}`);
    }

    const tryDeactivate = async () => {

        const doToggle = () => {
            let newVals = {
                ...form.values,
                IsActive: newValue
            }
            handleSubmit(newVals);
        };

        // get van stock levels first
        let newValue = !form.getInputProps("IsActive").value;
        let isEmpty = await warehouseService.getIsEmpty(form.values.ID);

        if (!newValue) {
            if (!isEmpty) {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    display: true,
                    heading: "Cannot Deactivate Van",
                    text: "This van has stock allocated and cannot be deactivated. Please remove the stock before deactivating by either transferring out or adjusting levels to zero.",
                    confirmButtonText: "OK",
                    showCancel: false,
                });
            }
            else {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    display: true,
                    heading: "Deactivate Van",
                    text: "Are you sure you want to deactivate this van? This will remove it from the list of active vans.",
                    confirmButtonText: "Deactivate",
                    cancelButtonText: "Cancel",
                    onConfirm: () => {
                        doToggle();
                    },
                    onCancel: () => { }
                });
            }
        }
        else {
            doToggle();
        }
    }


    if (props.isNew && hasVanStock === null) {
        return <>Van stock feature not authorised</>
    }

    return <>
        <div >
            <form onSubmit={form.onSubmit(handleSubmit)}>

                <Flex w={"100%"} justify={"space-between"} align={"center"} >

                    <Box>
                        <Flex gap={"xs"}>

                            <Button variant={'subtle'}
                                size="xs"
                                leftSection={<IconArrowLeft size={16} />}
                                mr={"xs"}
                                onClick={() => !saveWarehouseMutation.isLoading && navigateToList()}
                            >
                                {saveWarehouseMutation.isLoading ? "Saving" : "Back"}
                            </Button>

                            <Title order={3}>
                                {props.isNew ? "Create " + (isVan ? "Van" : "Warehouse") :
                                    "Edit " + (isVan ? "Van" : "Warehouse")} {!props.isNew && !form.getInputProps("IsActive").value ? "[Deactivated]" : ""}
                            </Title>
                        </Flex>
                    </Box>

                    {!props.isNew && <Flex gap={"xs"} align={"center"}>
                        {canDeactivate() ? <Button
                            variant='subtle'
                            onClick={tryDeactivate}
                            color={form.getInputProps("IsActive").value ? "red" : "green"}
                            disabled={isDisabled || isInitiallyDefault || (!form.getInputProps("IsActive").value && !canActivate())}
                            title={!form.getInputProps("IsActive").value && !canActivate() ? `You can only have up to ${canCreateInfo?.MaxCount} active vans` : undefined}
                        >
                            {form.getInputProps("IsActive").value ? "Deactivate" : "Activate"}
                        </Button>
                            : <></>}


                        <Button color={'scBlue'} type={'submit'} disabled={!form.isDirty() || isDisabled}
                            rightSection={(saveWarehouseMutation.isLoading) &&
                                <Loader variant={'oval'} size={18} color={'white'} />}
                        >
                            Update
                        </Button>
                    </Flex>}
                </Flex>

                <SCInput
                    {...form.getInputProps("Code")}
                    label={isVan ? "Number plate" : "Code"}
                    required={true}
                    disabled={isDisabled}
                    onChange={(e) => {
                        Helper.formSetFieldValue(form, "Code", e.value);
                        if (isVan) {
                            Helper.formSetFieldValue(form, "Name", e.value);
                        }
                    }}
                />

                {!isVan && <SCInput
                    {...form.getInputProps("Name")}
                    label="Name"
                    required={true}
                    disabled={isDisabled}
                    onChange={(e) => Helper.formSetFieldValue(form, "Name", e.value)}
                />
                }

                {!isVan && <SCInput
                    {...form.getInputProps("Description")}
                    label="Description"
                    required={false}
                    disabled={isDisabled}
                    onChange={(e) => Helper.formSetFieldValue(form, "Description", e.value)}
                />
                }

                {/* <SCDropdownList
                    {...form.getInputProps("WarehouseType")}
                    options={warehouseTypeOptions}
                    label="Type"
                    required={true}
                    disabled={true}
                    textField="description"
                    dataItemKey="value"
                    // dataItemKeyAsValue={true} // TODO: add this as a feature to avoid having to translate the input and output values to the form
                    onChange={(val) => Helper.formSetFieldValue(form, "WarehouseType", val?.value ?? null)}
                    value={warehouseTypeOptions.find(x => x.value === form.getInputProps("WarehouseType").value)}
                /> */}

                {isMultiStore ? <StoreSelector
                    getAllStores={true}
                    selectedStore={selectedStore}
                    setSelectedStore={updateStore}
                    required={true}
                    error={form.errors["StoreID"]}
                    accessStatus={accessStatus}
                    disabled={isDisabled || form.getInputProps("WarehouseType").value === Enums.WarehouseType.Warehouse as any}
                /> : <></>}

                {employeeSearchAvailable && form.getInputProps("WarehouseType").value === Enums.WarehouseType.Mobile as any && <EmployeeSelector
                    accessStatus={accessStatus}
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={updateEmployee}
                    storeID={selectedStore?.ID ?? null}
                    error={form.errors["EmployeeID"]}
                    required={form.getInputProps("WarehouseType").value === Enums.WarehouseType.Mobile as any}
                    canClear={true}
                    cascadeDependency={selectedStore?.ID ?? null}
                    disabled={isDisabled}
                    filter={((x: Employee) => x.IsActive && !!x.UserID) as any} //!ignoreEmployeeIDs?.includes(x.ID) && 
                />}

                {isWarehouse && <SCSwitch
                    disabled={isDisabled || isInitiallyDefault || !isWarehouse}
                    checked={form.getInputProps("IsDefault").value}
                    label="Default"
                    onToggle={(val) => Helper.formSetFieldValue(form, "IsDefault", val)}
                />}



                {props.isNew && <div className={styles.buttonContainer}>
                    {props.onCancel ? <Button mr={"lg"} type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => props.onCancel && props.onCancel()}>
                        Cancel
                    </Button> : null}

                    <Button color={'scBlue'} type={'submit'} disabled={!form.isDirty() || isDisabled || saveWarehouseMutation.isLoading}
                        rightSection={(saveWarehouseMutation.isLoading) &&
                            <Loader variant={'oval'} size={18} color={'white'} />}
                    >
                        Create Van
                    </Button>
                </div>
                }
            </form>

        </div>

        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

        <style jsx>{`
        
        `}</style>
    </>
}

export default ManageWarehouseForm;