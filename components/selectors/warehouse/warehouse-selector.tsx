import SCDropdownList from '@/components/sc-controls/form-controls/sc-dropdownlist';
import { Warehouse } from '@/interfaces/api/models';
import warehouseService from '@/services/warehouse/warehouse-service';
import helper from '@/utils/helper';
import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as Enums from '@/utils/enums';
import storage from '@/utils/storage';
import SubscriptionContext from '@/utils/subscription-context';
import { Box, Flex, MantineSize } from "@mantine/core";
import useInitialTimeout from '@/hooks/useInitialTimeout';
import WarehouseTypeIcon from '@/PageComponents/Warehouse/WarehouseTypeIcon';

const WarehouseSelector: FC<{
    selectedWarehouse: Warehouse | null | undefined
    setSelectedWarehouse: (newValue: any) => void
    error?: string
    required?: boolean
    label?: string
    size?: MantineSize
    canClear?: boolean
    disabled?: boolean
    readOnly?: boolean
    ignoreIDs?: (string | undefined)[]
    storeID?: string
    filterByEmployee: boolean
    hideFromView?: boolean
    icon?: any
    mt?: any
    onSuppressSave: (suppress: boolean) => void
    placeholder?: string
    warehouseType?: number
    vanStoreID?: string
    autoSelect?: boolean
}> = ({ selectedWarehouse,
    setSelectedWarehouse,
    error,
    required,
    label = "Warehouse",
    placeholder = "Select warehouse",
    canClear = true,
    disabled = false,
    readOnly = false,
    ignoreIDs,
    storeID,
    filterByEmployee,
    warehouseType = null,
    vanStoreID = null,
    autoSelect = true,
    ...props
}) => {

        const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);

        const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
        const subscriptionContext = useContext(SubscriptionContext);

        const getAllWarehouses = async () => {
            const warehouseResults = await warehouseService.getWarehouses();
            setAllWarehouses(warehouseResults.Results ?? []);
        };

        const getWarehouses = (localWarehouses: Warehouse[] = allWarehouses) => {

            const isMultiStore = (subscriptionContext as any)?.subscriptionInfo?.MultiStore === true;
            const employeeID = storage.getCookie(Enums.Cookie.employeeID);

            let processedWarehouses = localWarehouses.filter(x => !(ignoreIDs ?? []).includes(x.ID)).map(x => {
                return {
                    ...x,
                    GroupDisplay: Enums.getEnumStringValue(Enums.WarehouseType, x.WarehouseType, true)
                };
            }).sort((a, b) => {
                if (a.WarehouseType !== b.WarehouseType) return (a.WarehouseType as any) - (b.WarehouseType as any);
                return (a.Name as any) - (b.Name as any);
            });

            if (!!storeID || filterByEmployee) {
                processedWarehouses = processedWarehouses.filter(x => {
                    if ((!!storeID || !isMultiStore)) { //x.WarehouseType === Enums.WarehouseType.Warehouse && 
                        return !isMultiStore || x.StoreID === storeID;
                    }
                    else if (x.WarehouseType === Enums.WarehouseType.Mobile && filterByEmployee) {
                        return x.EmployeeID === employeeID;
                    }
                    return false;
                });
            }

            if (!!warehouseType) {
                processedWarehouses = processedWarehouses.filter(x => x.WarehouseType === warehouseType);

                if (warehouseType === Enums.WarehouseType.Mobile) {
                    processedWarehouses = processedWarehouses.filter(x => !!x.EmployeeID);
                    if (!!vanStoreID) {
                        processedWarehouses = processedWarehouses.filter(x => x.StoreID === vanStoreID);
                    }
                }
            }

            setWarehouses(processedWarehouses);

            if (!selectedWarehouse && autoSelect) {
                let bestMatches = !!employeeID ? processedWarehouses.filter(x => x.WarehouseType === Enums.WarehouseType.Mobile && x.EmployeeID === employeeID) : [];
                if (bestMatches.length === 0 && (!!storeID || !isMultiStore)) {
                    bestMatches = processedWarehouses.filter(x => x.WarehouseType === Enums.WarehouseType.Warehouse && (x.StoreID === storeID || !isMultiStore));
                }
                if (bestMatches.length > 0) {
                    setSelectedWarehouse(bestMatches.sort((a, b) => (b.IsDefault ? 1 : 0) - (a.IsDefault ? 1 : 0))[0])
                }
            }
        };

        // const ignoreIDsRef = useRef<(string | undefined)[]>();

        useEffect(() => {
            // if (JSON.stringify(ignoreIDsRef.current) !== JSON.stringify(ignoreIDs)) {
            getWarehouses();
            // ignoreIDsRef.current = ignoreIDs;
            // }
        }, [ignoreIDs, storeID, filterByEmployee, allWarehouses, vanStoreID]);

        useInitialTimeout(0, () => {
            props.onSuppressSave(warehouses.length === 0);
            getAllWarehouses().finally(() => {
                props.onSuppressSave(false);
            });
        });

        const oldVanStoreIDRef = useRef<string | null>(vanStoreID);
        useEffect(() => {
            if (vanStoreID != oldVanStoreIDRef.current) {
                setSelectedWarehouse(null);
            }

            oldVanStoreIDRef.current = vanStoreID;
        }, [vanStoreID]);

        return (<Box style={{ display: (warehouses.length < 2 && props.hideFromView) ? 'none' : 'inherit' }}>
            <SCDropdownList
                label={label}
                required={required}
                error={error}
                canClear={canClear}
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
                dataItemKey='ID'
                textField='Code'
                groupField='GroupDisplay'
                options={warehouses}
                itemRenderMantine={(item) => {
                    const wh = item.dataItem as Warehouse;
                    return <>
                        <Flex align={"center"} gap={"xs"}>
                            <WarehouseTypeIcon warehouse={wh} />
                            <span style={{ fontWeight: "bold" }}>{wh.Code}</span>
                            {wh.EmployeeFullName && <div style={{ fontSize: "0.75rem" }}> - {wh.EmployeeFullName}</div>}
                        </Flex>
                        {wh.Description && <div style={{ fontSize: "0.75rem", marginTop: "0.2rem" }}>{wh.Description}</div>}
                        
                    </>
                }}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                size={props.size}
                iconMantine={props.icon}
                mt={props.mt}
            />
        </Box>);
    };

export default WarehouseSelector;