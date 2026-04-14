import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';

const getAllStores = async (search, showAll, employeeID = null, context = null) => {
    let url = `/Store/GetEmployeeStores?employeeID=${employeeID ? employeeID : Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`;
    if (search) {
        url = url + search;
    }
    if (showAll) {
        url = url + "&showAll=true";
    }
    return await Fetch.get({
        url: url,
        ctx: context,
    });
};

const isMultiStore = async (employeeID = null, context = null) => {
    const request = await getAllStores(null, true, employeeID, context);
    return request.TotalResults > 1;
};

const getStores = async (search, showAll, employeeID = null, context = null) => {
    return await getAllStores(search, showAll, employeeID, context);    
};

const getListOfStores = async (context = null) => {
    return await Fetch.get({
        url: '/Store',
        ctx: context
    });
}

const getDefaultStore = async (context = null) => {
    const stores = await getListOfStores(context);
    return stores?.Results?.find(x => x.IsDefault) ?? null;
}

export default {
    isMultiStore,
    getStores,
    getListOfStores,
    getDefaultStore
};
