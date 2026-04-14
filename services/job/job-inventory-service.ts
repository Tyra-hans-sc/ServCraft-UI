import Fetch from "@/utils/Fetch";
import { getSectionsFromTableData } from "@/PageComponents/SectionTable/SectionTable";
import * as Enums from '@/utils/enums'

const getJobInventory = async (jobID: string, stockItemStatus: number, toastCtx: any = undefined) => {
    const jobInventory = await Fetch.get({
        url: `/JobInventory`,
        params: {
            jobID,
            stockItemStatus
        },
        toastCtx: toastCtx
    } as any);

    return jobInventory.Results;
};

const saveJobInventory = async (jobInventory: any[], jobID: string, stockItemStatus: number, toastCtx: any = undefined) => {

    const inventorySections = getSectionsFromTableData(jobInventory, 'InventorySectionName', 'InventorySectionID', Enums.Module.Jobcard, jobID)

    const request = await Fetch.post({
        url: '/JobInventory',
        params: {
            jobInventory: Array.isArray(jobInventory) ? jobInventory : [],
            ...(inventorySections ? {
                inventorySections
            } : {}),
            jobCardID: jobID,
            stockItemStatus: stockItemStatus
        },
        toastCtx: toastCtx
    } as any);

    if (request.Results) {

        let sortedResults = request.Results.sort((a, b) => +a.LineNumber - +b.LineNumber) as any[];

        let rowVersion: any = null;
        if (request.Metadata) {
            rowVersion = request.Metadata.RowVersion;
        }

        return { rowVersion, sortedResults };
    }

    return null;
};

const doMaterialsLocationChange = async (jobCardID: string, stockItemStatus: number, changeType: number, toastCtx) => {
    const request = await Fetch.post({
        url: '/JobInventory/WarehouseStockLocationChange',
        params: {
            JobCardID: jobCardID,
            StockItemStatus: stockItemStatus,
            ChangeType: changeType
        },
        toastCtx: toastCtx
    } as any);

    if (request.Results) {

        let sortedResults = request.Results.sort((a, b) => +a.LineNumber - +b.LineNumber) as any[];

        let rowVersion: any = null;
        if (request.Metadata) {
            rowVersion = request.Metadata.RowVersion;
        }

        return { rowVersion, sortedResults };
    }

    return null;
}

const allocateMaterials = async (jobCardID: string, stockItemStatus: number, toastCtx) => {
    return await doMaterialsLocationChange(jobCardID, stockItemStatus, Enums.WarehouseStockLocationChange.AvailableToInProgress, toastCtx);
}

const unallocateMaterials = async (jobCardID: string, stockItemStatus: number, toastCtx) => {
    return await doMaterialsLocationChange(jobCardID, stockItemStatus, Enums.WarehouseStockLocationChange.InProgressToAvailable, toastCtx);
}

const getJobInventoryInvoicedWidget = async (jobCardID: string, toastCtx) => {
    const widgetResponse = await Fetch.get({
        url: `/JobInventory/JobInventoryInvoicedWidget`,
        params: {
            JobCardID: jobCardID
        },
        toastCtx: toastCtx
    } as any);

    return widgetResponse as JobInventoryInvoicedWidgetResponse;
}

export default {
    getJobInventory,
    saveJobInventory,
    allocateMaterials,
    unallocateMaterials,
    getJobInventoryInvoicedWidget
};

export interface JobInventoryInvoicedWidgetResponse {
    Lines: JobInventoryInvoicedWidgetResponseLine[]
}

export interface JobInventoryInvoicedWidgetResponseLine {
    QuantityUsed: number
    TotalCostOfSale: number
    TotalRequestedOfSale: number
    QuantityInvoiced: number
    TotalPriceExcl: number
    TotalVAT: number
    InventoryID: string
    InventoryCode: string
    InventoryDescription: string
    QuantityOnPurchaseOrder: number;
    QuantityQuoted: number;
    AverageRequestedCost: number;
    AverageCostOfSale: number;
    QuantityInvoicedDraft: number;
    QuantityReceived: number;
    Profit: number;
    ProjectedProfit: number;
}