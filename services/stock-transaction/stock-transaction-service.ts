import { StockTransaction } from "@/interfaces/api/models";
import Fetch from "@/utils/Fetch";

const saveStockTransaction = async (stockTransaction: StockTransaction, isNew: boolean, toastCtx: any, caller?: string) => {

    const method = isNew ? Fetch.post : Fetch.put;

    const result = await method({
        url: "/StockTransaction",
        params: stockTransaction,
        toastCtx: toastCtx,
        caller
    });

    return result as StockTransaction;
}

const getStockTransaction = async (id: string, ctx: any) => {
    const stockTransaction: StockTransaction = await Fetch.get({
        url: "/StockTransaction",
        params: {
            id: id
        } as any,
        ctx: ctx
    });

    return stockTransaction;
};

interface SearchStockTransactionRequest {
    pageSize: number
    pageIndex: number
    searchPhrase: string
    sortExpression: string
    sortDirection: string
    includeDisabled: boolean
    stockTransactionTypes: number[]
    itemIDs?: string[]
}

const searchStockTransactions = async ({pageSize, pageIndex, searchPhrase, sortExpression, sortDirection, includeDisabled, stockTransactionTypes, itemIDs}: SearchStockTransactionRequest) => {
    const stockTransactions = await Fetch.post({
        url: `/StockTransaction/GetStockTransactions`,
        params: {
            pageSize: pageSize,
            pageIndex: pageIndex,
            searchPhrase: searchPhrase,
            sortExpression: sortExpression,
            sortDirection: sortDirection,
            IncludeDisabled: includeDisabled,
            StockTransactionTypes: stockTransactionTypes,
            ItemIDs: itemIDs
        }
    });

    return stockTransactions;
};

const getDraftStockTransactionForPurchaseOrder = async (purchaseOrderID) => {
    const stockTransaction: StockTransaction = await Fetch.get({
        url: "/StockTransaction/GetDraftGRVForPurchaseOrder",
        params: {
            purchaseOrderID: purchaseOrderID
        } as any
    });

    return stockTransaction;
}

export default {
    saveStockTransaction,
    getStockTransaction,
    searchStockTransactions,
    getDraftStockTransactionForPurchaseOrder
};