import { FeatureItemCreateConfirmation, ResultResponse, Warehouse, WarehouseStock } from "@/interfaces/api/models"
import Fetch from "@/utils/Fetch"
import * as Enums from "@/utils/enums"

const saveWarehouse = async (warehouse: Warehouse, isNew: boolean, toastCtx: any, caller?: string) => {

    let method = isNew ? Fetch.post : Fetch.put;

    const result = await method({
        url: '/Warehouse',
        params: {
            ...warehouse
        },
        toastCtx: toastCtx,
        caller
    });

    return result as Warehouse;
}

const getWarehouse = async (id: string, ctx: any = undefined) => {

    const result = await Fetch.get({
        url: `/Warehouse`,
        params: { id },
        ctx: ctx
    });

    return result as Warehouse;
};

const getWarehouses = async (pageSize: number = 100, ctx: any = undefined, search = '', warehouseType: number | null = null) => {

    const result = await Fetch.post({
        url: '/Warehouse/GetWarehouses',
        params: {
            IncludeDisabled: false,
            PageSize: pageSize,
            SearchPhrase: search,
            WarehouseType: warehouseType
        },
        ctx: ctx
    });

    return result as ResultResponse<Warehouse>;
};

const searchWarehouseStocks = async ({ pageSize, pageIndex, searchPhrase, sortExpression, sortDirection, includeDisabled, warehouseIDs, extraParams }:
    { pageSize: number, pageIndex: number, searchPhrase: string, sortExpression: string, sortDirection: string, includeDisabled: boolean, warehouseIDs: string[], extraParams?: any }) => {
    const result = await Fetch.post({
        url: '/WarehouseStock/GetWarehouseStocks',
        params: {
            PageSize: pageSize,
            PageIndex: pageIndex,
            SearchPhrase: searchPhrase,
            SortExpression: sortExpression,
            SortDirection: sortDirection,
            IncludeDisabled: includeDisabled,
            WarehouseIDs: warehouseIDs,
            ...extraParams
        }
    });

    return result as ResultResponse<WarehouseStock>;
};

const getWarehouseStock = async ({ inventoryID, warehouseID }: { inventoryID: string, warehouseID: string }) => {
    const result = await Fetch.get({
        url: '/WarehouseStock',
        params: {
            inventoryID,
            warehouseID
        }
    });

    return result as WarehouseStock;
}

const getIgnoreEmployeeIDs = async (currentWarehouseID) => {
    let warehouseResult = await getWarehouses(1000, undefined, '', Enums.WarehouseType.Mobile);

    return warehouseResult.Results?.filter(x => x.ID !== currentWarehouseID && x.IsActive && !!x.EmployeeID).map(x => x.EmployeeID as string) ?? [];
};

const getEmployeeWarehouses = async (employeeID: string, warehouseType?: number) => {
    const result = await Fetch.get({
        url: '/Warehouse/GetEmployeeWarehouses',
        params: {
            employeeID,
            warehouseType
        }
    });

    return result.Results as Warehouse[];
}

const getIsEmpty = async (id: string) => {

    const result = await Fetch.get({
        url: '/Warehouse/IsEmpty',
        params: { id }
    });

    return result.Result as boolean;
};

const mobileWarehouseCanCreate = async () => {
    const result = await Fetch.get({
        url: '/Warehouse/MobileWarehouseCanCreate'
    });

    return result as FeatureItemCreateConfirmation;
}


export default {
    getWarehouse,
    saveWarehouse,
    getWarehouses,
    searchWarehouseStocks,
    getWarehouseStock,
    getIgnoreEmployeeIDs,
    getEmployeeWarehouses,
    getIsEmpty,
    mobileWarehouseCanCreate
}