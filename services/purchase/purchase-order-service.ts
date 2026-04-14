import Helper from '@/utils/helper';
import Fetch from '@/utils/Fetch';
import { ReplaceWithModel, ResultResponse } from '@/interfaces/api/models';

const getPurchaseOrder = async (id) => {
    return await Fetch.get({
        url: `/PurchaseOrder/${id}`,
        params: {
        } as any
    });
};

const getPurchaseOrderUnallocatedItems = async (purchaseOrderID) => {
    return await Fetch.get({
        url: "/PurchaseOrder/GetUnallocatedItems",
        params: {
            purchaseOrderID: purchaseOrderID
        } as any
    }) as ResultResponse<ReplaceWithModel>;
};

const quickGRVFromPurchaseOrder = async (id, toastCtx, warehouseID) => {
    return await Fetch.post({
        url: `/PurchaseOrder/QuickGRV/${id}/Warehouse/${warehouseID}`,
        params: {
            WarehouseID: warehouseID
        } as any,
        toastCtx: toastCtx
    });
}


const compareJobInventory = async (purchaseOrder, purchaseOrderItems, toastCtx) => {
    let result = await Fetch.post({
        url: `/PurchaseOrder/CompareJobInventory`,
        params: {
            PurchaseOrder: purchaseOrder,
            PurchaseOrderItems: purchaseOrderItems
        },
        toastCtx: toastCtx
    });

    return result;
}

export default {
    getPurchaseOrder,
    getPurchaseOrderUnallocatedItems,
    quickGRVFromPurchaseOrder,
    compareJobInventory
};
