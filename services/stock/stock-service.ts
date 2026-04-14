import { WarehouseStock } from "@/interfaces/api/models";
import Fetch from "@/utils/Fetch";
import {
    StocktakeDto,
    StocktakeItemDto,
    StocktakeTemplateDto,
    StocktakeTemplateItemDto
} from "@/PageComponents/Stock Take/StockTake.model";
import storageService from '@/utils/storage';
import * as Enums from '@/utils/enums';
import Helper from "@/utils/helper";
import time from "@/utils/time";


const postTemplate = async (templateData: Partial<StocktakeTemplateDto>) => {

    // Ensure stocktakeData has required fields populated with empty strings if they are missing
    templateData.CreatedBy = templateData.CreatedBy || storageService.getCookie(Enums.Cookie.servFullName);
    templateData.ModifiedBy = templateData.ModifiedBy || storageService.getCookie(Enums.Cookie.servFullName);
    templateData.RowVersion = templateData.RowVersion || '';

    const response = await Fetch.post({
        url: "/StocktakeTemplate",
        params: {
            StocktakeTemplate: templateData
        }
    });

    if (!response.ID) {
        throw new Error(response.serverMessage || response.message || 'Failed to create stock take');
    }

    return response;
}

const updateTemplate = async (templateData: StocktakeTemplateDto) => {

    // Ensure stocktakeData has required fields populated with empty strings if they are missing
    templateData.CreatedBy = templateData.CreatedBy || storageService.getCookie(Enums.Cookie.servFullName);
    templateData.ModifiedBy = templateData.ModifiedBy || storageService.getCookie(Enums.Cookie.servFullName);

    const response = await Fetch.put({
        url: "/StocktakeTemplate/" + templateData.ID,
        params: {
            StocktakeTemplate: templateData
        }
    });

    if (!response.ID) {
        throw new Error(response.serverMessage || response.message || 'Failed to create stock take');
    }

    return response;
}

const getTemplates = (searchPhrase: string = "", pageIndex = 0, pageSize = 100) => {
    return Fetch.post({
        url: `/StocktakeTemplate/list`,
        params: {
            SearchPhrase: searchPhrase,
            PageIndex: pageIndex,
            PageSize: pageSize,
            SortExpression: "Name",
            SortDirection: "descending",
        } as any
    });
}

const getTemplateItems = async (templateID: string) => {
    const response = await Fetch.get({
        url: `/StocktakeTemplate/item/list/${templateID}`
    });

    if (!response || !response.Results) {
        throw new Error(response.serverMessage || response.message || 'Failed to create stock take');
    }

    return response.Results as StocktakeTemplateItemDto[];
}

const postStockTake = async (stocktakeData: Partial<StocktakeDto>) => {

    // Ensure stocktakeData has required fields populated with empty strings if they are missing
    stocktakeData.CreatedBy = stocktakeData.CreatedBy || storageService.getCookie(Enums.Cookie.servFullName);
    stocktakeData.ModifiedBy = stocktakeData.ModifiedBy || storageService.getCookie(Enums.Cookie.servFullName);
    stocktakeData.RowVersion = stocktakeData.RowVersion || '';
    stocktakeData.WarehouseName = stocktakeData.WarehouseName || '';
    stocktakeData.AssignedEmployeeFullName = stocktakeData.AssignedEmployeeFullName || '';
    stocktakeData.AssignedManagerEmployeeFullName = stocktakeData.AssignedManagerEmployeeFullName || '';

    const response = await Fetch.post({
        url: "/Stocktake",
        params: {
            StockTake: stocktakeData
        }
    });

    if (!response.ID) {
        throw new Error(response.serverMessage || response.message || 'Failed to create stock take');
    }

    return response;
}

const copyStockTake = async (stocktakeData: Partial<StocktakeDto>) => {

    // Ensure stocktakeData has required fields populated with empty strings if they are missing
    stocktakeData.CreatedBy = stocktakeData.CreatedBy || storageService.getCookie(Enums.Cookie.servFullName);
    stocktakeData.ModifiedBy = stocktakeData.ModifiedBy || storageService.getCookie(Enums.Cookie.servFullName);
    stocktakeData.RowVersion = stocktakeData.RowVersion || '';
    stocktakeData.WarehouseName = stocktakeData.WarehouseName || '';
    stocktakeData.AssignedEmployeeFullName = stocktakeData.AssignedEmployeeFullName || '';

    const response = await Fetch.post({
        url: "/Stocktake/copy",
        params: {
            OriginalStocktakeID: stocktakeData.ID,
            StockTake: { ...stocktakeData, ID: Helper.emptyGuid(), CompletedDate: null, StartedDate: null, Status: Enums.StocktakeStatus.Draft } as StocktakeDto
        }
    });

    if (!response.ID) {
        throw new Error(response.serverMessage || response.message || 'Failed to create stock take');
    }

    return response;
}

const getWarehouseStockForInventory = async (inventoryID, storeID?: string, toastCtx: any = undefined) => {
    let results = await Fetch.get({
        url: `/WarehouseStock/GetByInventory/${inventoryID}?storeID=${storeID}`,
        toastCtx: toastCtx
    });

    return results.Results as WarehouseStock[];
};

const fetchAllStockItems = async (
    params: any,
    searchPhrase: string = "",
    updateLoadingProgress?: (progress: { current: number, total: number }) => void,
    pageSize: number = 500
): Promise<StocktakeItemDto[]> => {
    // First request to get total count
    const firstPageResponse = await Fetch.post({
        url: `/Stocktake/item/list`,
        params: {
            ...params,
            SearchPhrase: searchPhrase,
            SortExpression: "InventoryDescription",
            SortDirection: "ascending",
            PageSize: pageSize,
            PageIndex: 0,
        }
    });

    if (!firstPageResponse || !firstPageResponse.Results) {
        throw new Error('Failed to fetch inventory data');
    }

    let allItems: StocktakeItemDto[] = [...firstPageResponse.Results];
    const totalPages = Math.ceil(firstPageResponse.TotalResults / pageSize);

    // Update progress if callback provided
    updateLoadingProgress && updateLoadingProgress({ current: 1, total: totalPages });

    // If there's more than one page, fetch the rest synchronously
    if (totalPages > 1) {
        for (let page = 1; page < totalPages; page++) {
            const response = await Fetch.post({
                url: `/Stocktake/item/list`,
                params: {
                    ...params,
                    SearchPhrase: searchPhrase,
                    SortExpression: "InventoryDescription",
                    SortDirection: "ascending",
                    PageSize: pageSize,
                    PageIndex: page
                }
            });

            if (response && response.Results) {
                allItems = [...allItems, ...response.Results];
                // Update progress
                updateLoadingProgress && updateLoadingProgress({ current: page + 1, total: totalPages });
            }
        }
    }

    return allItems;
};

// used for validation when templates must be linked to stocktakes
const isTemplateRequired = (stocktakeType: number) => {
    return +stocktakeType === Enums.StocktakeType.Templated;
}

// used when determining if the stocktake can add more items on the fly when counting
const isOpenEnded = (stocktakeType: number) => {
    return +stocktakeType === Enums.StocktakeType.OpenCapture;
}

const calculateValidityEndDate = (stocktake: StocktakeDto | undefined) => {

    let st = stocktake ?? {
        ScheduledDate: time.now(),
        ValidityPeriodHours: 48,
        StartedDate: time.now(),
        CreatedDate: time.now()
    };

    let start = st.ScheduledDate ?? st.StartedDate ?? st.CreatedDate;
    let calculatedDate = time.parseDate(start);
    calculatedDate.setHours(calculatedDate.getHours() + st.ValidityPeriodHours);
    return calculatedDate;
}

export default {
    postStockTake,
    postTemplate,
    updateTemplate,
    getTemplates,
    copyStockTake,
    getWarehouseStockForInventory,
    fetchAllStockItems,
    getTemplateItems,
    isTemplateRequired,
    isOpenEnded,
    calculateValidityEndDate
};