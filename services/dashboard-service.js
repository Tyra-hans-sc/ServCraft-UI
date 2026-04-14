import Fetch from '../utils/Fetch';
import * as Enums from '../utils/enums';

const gettingStartedView = async (storeID = null, context = null) => {
    let request = await Fetch.get({
        url: `/Dashboard/GetGettingStartedView?storeid=${storeID}`,
        ctx: context,
    });

    return {showCheckList: request.ShowCheckList, checkLists: request.CheckLists, checkListHeader: request.CheckListHeader,
        showYouTube: request.ShowYouTube, youTubeVideoID: request.YouTubeVideoID}
};

const getGlobalSearchResults = async (search, selectedCategoryList = [], toast = null) => {

    let moduleList = [];

    if (selectedCategoryList.includes('All')) {
        moduleList = [];
    } else {
        if (selectedCategoryList.includes('Jobs')) {
            moduleList.push(Enums.getEnumStringValue(Enums.Module, Enums.Module.JobCard));
        }
        if (selectedCategoryList.includes('Customers')) {
            moduleList.push(Enums.getEnumStringValue(Enums.Module, Enums.Module.Customer));
        }
        if (selectedCategoryList.includes('Assets')) {
            moduleList.push(Enums.getEnumStringValue(Enums.Module, Enums.Module.Asset));
        }
        if (selectedCategoryList.includes('Inventory')) {
            moduleList.push(Enums.getEnumStringValue(Enums.Module, Enums.Module.Inventory));
        }
        if (selectedCategoryList.includes('Queries')) {
            moduleList.push(Enums.getEnumStringValue(Enums.Module, Enums.Module.Query));
        }
        if (selectedCategoryList.includes('Quotes')) {
            moduleList.push(Enums.getEnumStringValue(Enums.Module, Enums.Module.Quote));
        }
        if (selectedCategoryList.includes('Invoices')) {
            moduleList.push(Enums.getEnumStringValue(Enums.Module, Enums.Module.Invoice));
        }
        if (selectedCategoryList.includes('Purchase Orders')) {
            moduleList.push(Enums.getEnumStringValue(Enums.Module, Enums.Module.PurchaseOrder));
        }
    }

    const request = await Fetch.post({
        url: '/Dashboard/GetGlobalSearch',
        params: {
          search,
          moduleList,
        },
        toastCtx: toast
    });
    return request;
};

const getGlobalSearchAvailableCategories = () => {
    return ['All', 'Jobs', 'Customers', 'Assets', 'Inventory', 'Queries', 'Quotes', 'Invoices', 'Purchase Orders'];
};

export default {
    gettingStartedView,
    getGlobalSearchResults,
    getGlobalSearchAvailableCategories,
};
