import Time from '../../utils/time';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';

const getAssetList = async (searchPhrase, pageSize, currentPage, sortExpression, sortDirection, activeFilterIds, ancillaryFilters, context = null) => {

  const checkboxColumnHeader = 'Number';
  const checkboxColumn = 'ProductNumber';

  let params = {
    searchPhrase,
    pageSize,
    pageIndex: currentPage - 1,
    sortExpression: sortExpression === checkboxColumnHeader ? checkboxColumn : sortExpression,
    sortDirection,
  };

  if (activeFilterIds) {
    params = {
      ...params,
      CategoryIDList: activeFilterIds["Categories"],
      SubcategoryIDList: activeFilterIds["Subcategories"],
      CustomerGroupIDList: activeFilterIds["CustomerGroups"],
      StoreIDList: activeFilterIds["Stores"],
    };
  }

  if (ancillaryFilters) {
    params = {
      ...params,
      IncludeScrapped: ancillaryFilters["IncludeScrapped"],
    };
  }

  return await Fetch.post({
    url: `/Product/GetProducts`,
    params: params,
    ctx: context
  });
};

const getParameterizedAssets = async (params) => {
  return await Fetch.post({
    url: `/Product/GetProducts`,
    params: params
  });
};

const getAssetsForCustomer = async (customerID, searchPhrase, pageSize, pageIndex, sortExpression, sortDirection, includeScrapped, toast = null) => {
  let params = {
    pageSize,
    pageIndex,
    searchPhrase,
    sortExpression,
    sortDirection,
    CustomerIDList: [customerID],
    includeScrapped,
  };

  return await Fetch.post({
    url: '/Product/GetProducts',
    params: params,
    toastCtx: toast
  });
};

const getCounts = async (id) => {
  let countRequest = await Fetch.get({
    url: `/Product/GetCounts?id=${id}`,
  });
  let result = countRequest.Results;
  let attachmentCount = result.find(x => x.Key == 'Attachments');
  let communicationCount = result.find(x => x.Key == 'Communication');
  let jobCount = result.find(x => x.Key == 'Jobs');

  return {
    attachmentCount: attachmentCount ? attachmentCount.Value : 0,
    communicationCount: communicationCount ? communicationCount.Value : 0,
    jobCount: jobCount ? jobCount.Value : 0,
  };
};

const getAssetCountForOtherCustomers = async (customerID, searchPhrase) => {
  return await Fetch.post({
    url: `/Product/ProductCountForOtherCustomers`,
    params: {
      customerID,
      searchPhrase,
    }
  });
};

const inWarranty = (purchaseDate, warrantyPeriod, refDate = null) => {
  let dateRef = refDate ? refDate : Time.now();
  let expireDate = expiryDate(purchaseDate, warrantyPeriod);
  if (!expireDate) return false;

  return dateRef.valueOf() < expireDate.valueOf();
};

const outOfWarranty = (purchaseDate, warrantyPeriod, refDate = null) => {
  let dateRef = refDate ? refDate : Time.now();
  let expireDate = expiryDate(purchaseDate, warrantyPeriod);
  if (!expireDate) return false;

  return dateRef.valueOf() >= expireDate.valueOf();
};

const expiryDate = (purchaseDate, warrantyPeriod) => {
  if (!purchaseDate || !warrantyPeriod) return null;

  let date = Time.parseDate(Time.getDate(purchaseDate));
  let period = parseFloat(warrantyPeriod);
  let expireDate = date.setMonth(date.getMonth() + period);
  return expireDate;
};

const checkForAssets = async (module, itemID, customerID) => {
  if (module == Enums.Module.JobCard && itemID) {
    const request1 = await Fetch.post({
      url: `/Product/GetProducts`,
      params: {
        JobCardID: itemID
      }
    });
    if (request1.TotalResults > 0) {
      return true;
    }
  }

  if (!Helper.isNullOrUndefined(customerID)) {
    const request2 = await Fetch.post({
      url: `/Product/GetProducts`,
      params: {
        CustomerIDList: [customerID]
      }
    });
    if (request2.TotalResults > 0) {
      return true;
    }
  }

  return false;
};

export default {
  getAssetList,
  getAssetsForCustomer,
  getParameterizedAssets,
  getCounts,
  getAssetCountForOtherCustomers,
  inWarranty,
  outOfWarranty,
  expiryDate,
  checkForAssets,
};
