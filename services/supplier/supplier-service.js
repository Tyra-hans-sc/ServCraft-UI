import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';

const getSupplierList = async (searchPhrase, pageSize, currentPage, ancillaryFilters, sortField, sortDirection, toast = null, context = null) => {

    let params = {
        pageSize,
        pageIndex: currentPage - 1,
        searchPhrase,
        SortExpression: sortField,
        SortDirection: sortDirection,
        PopulateList: false,
    };

    if (ancillaryFilters) {
        params = {
            ...params,
            IncludeClosed: ancillaryFilters["IncludeDisabled"],
        };
    }

    return await Fetch.post({
        url: `/Supplier/GetSuppliers`,
        params,
        toastCtx: toast,
        ctx: context,
    });
};

const getSupplierAncillaryFilters = () => {
    const includeDisabledFilter = [{
        type: Enums.ControlType.Switch,
        label: 'Include disabled suppliers',
    }];
    return {
        IncludeDisabled: includeDisabledFilter,
    };
};

const getAllSuppliers = async (context = null) => {
    return await Fetch.get({
        url: `/Supplier/IncludeDisabled/true`,
        ctx: context
    });
};

const getTabCounts = async (supplierID) => {
    const countRequest = await Fetch.get({
        url: `/Supplier/GetCounts?id=${supplierID}`,
    });

    const result = countRequest.Results;
    let attachmentCount = result.find(x => x.Key == 'Attachments');
    let communicationCount = result.find(x => x.Key == 'Communication');
    let contactCount = result.find(x => x.Key == 'Contacts');
    let locationCount = result.find(x => x.Key == 'Locations');
    let purchaseOrderCount = result.find(x => x.Key == 'PurchaseOrders');

    return {
        attachmentCount: attachmentCount ? attachmentCount.Value : 0,
        communicationCount: communicationCount ? communicationCount.Value : 0,
        contactCount: contactCount ? contactCount.Value : 0,
        locationCount: locationCount ? locationCount.Value : 0,
        purchaseOrderCount: purchaseOrderCount ? purchaseOrderCount.Value : 0,
    };
};

const validate = (supplier) => {
    let validationItems = [];
    validationItems = [
        { key: 'Name', value: supplier.Name, required: true, type: Enums.ControlType.Text },
        { key: 'EmailAddress', value: supplier.EmailAddress, type: Enums.ControlType.Email },
        { key: 'ContactNumber', value: supplier.ContactNumber, type: Enums.ControlType.ContactNumber },
    ];

    return Helper.validateInputs(validationItems);
};

const createSupplier = async (supplier, toast = null) => {
    return await Fetch.post({
        url: `/Supplier`,
        params: supplier,
        toastCtx: toast,
    });
};

const editSupplier = async (supplier, toast = null) => {
    return await Fetch.put({
        url: `/Supplier`,
        params: supplier,
        toastCtx: toast,
    });
};

const getSupplier = async (id) => {
    return await Fetch.get({
        url: `/Supplier/${id}`,
        params: {}
    });
}

export default {
    getSupplierList,
    getSupplierAncillaryFilters,
    getAllSuppliers,
    getTabCounts,
    validate,
    createSupplier,
    editSupplier,
    getSupplier
};
