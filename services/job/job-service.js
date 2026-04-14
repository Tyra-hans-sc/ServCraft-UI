import constants from '@/utils/constants';
import Fetch from '../../utils/Fetch';
import optionService from '../option/option-service';
import helper from '@/utils/helper';

const getJobList = async (searchPhrase, pageSize, currentPage, activeFilterIds, ancillaryFilters, sortField, sortDirection, caller = null, toast = null, context = null) => {
    const usePopulatedList = false; // make this true when optimisations have been made to the job query
    const checkboxColumnHeader = 'Number';
    const checkboxColumn = 'JobCardNumber';

    let params = {
        pageSize,
        pageIndex: currentPage - 1,
        searchPhrase,
        SortExpression: sortField === checkboxColumnHeader ? checkboxColumn : sortField,
        SortDirection: sortDirection,
        PopulatedList: usePopulatedList
    };

    if(activeFilterIds?.DateRange) {
        if(activeFilterIds.DateRange[0]) {
            params.StartDate = activeFilterIds.DateRange[0]
        }
        if(activeFilterIds.DateRange[1]) {
            params.EndDate = activeFilterIds.DateRange[1]
        }
    }

    if (activeFilterIds) {
        params = {...params,
            JobStatusIDList: activeFilterIds["JobStatus"],
            InventoryIDList: activeFilterIds["Services"],
            JobTypeIDList: activeFilterIds["JobTypes"],
            EmployeeIDList: activeFilterIds["Employees"],
            StoreIDList: activeFilterIds["Stores"],
        };
    }

    if (ancillaryFilters) {
        params = {...params,
            IncludeClosed: ancillaryFilters["IncludeClosed"],
            ShowArchived: ancillaryFilters["ShowArchived"],
        };
    }
    
    return await Fetch.post({
        url: '/Job/GetJobs',
        params: params,
        ctx: context,
        toastCtx: toast,
        caller: caller,
      });
};

const getJobsForCustomer = async (customerID, searchPhrase, pageSize, pageIndex, sortExpression, sortDirection, includeClosed, toast = null, showArchived) => {
    let params = {
        pageSize,
        pageIndex,
        searchPhrase,
        sortExpression,
        sortDirection,
        includeClosed,
        CustomerIDList: [customerID],
        showArchived
    };

    return await Fetch.post({
        url: '/Job/GetJobs',
        params,
        toastCtx: toast
    });
};

const getJobsForProject = async (projectID, searchPhrase, pageSize, pageIndex, sortExpression, sortDirection, includeClosed, toast = null, showArchived) => {
    return await Fetch.post({
        url: '/Job/GetJobsForProject',
        params: {
            pageSize,
            pageIndex,
            searchPhrase,
            sortExpression,
            sortDirection,
            includeClosed,
            projectID,
            showArchived
        },
        toastCtx: toast,
      });
};

const getJobsForAsset = async (productID, searchPhrase, pageSize, pageIndex, sortExpression, sortDirection, includeClosed, toast = null, showArchived) => {
    let params = {
        pageSize,
        pageIndex,
        searchPhrase,
        sortExpression,
        sortDirection,
        includeClosed,
        productID,
        showArchived
    };

    return await Fetch.post({
        url: '/Job/GetJobsForProduct',
        params,
        toastCtx: toast
    });
};

const getJob = async (id, context = null) => {
    return await Fetch.get({
        url: '/Job/' + id,
        ctx: context,
    });
}

const getJobCustomerZone = async (id, customerID, tenantID, api, context = null) => {
    return await Fetch.get({
        url: `/CustomerZone/GetJob`,
        params: {
            jobCardID: id
        },
        ctx: context,
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api,
    });
};

const updateJobCustomerZone = async (customerID, tenantID, api, job, toast = null, context = null) => {
    return await Fetch.put({
        url: '/CustomerZone/UpdateJob',
        params: {
          Job: job
        },
        ctx: context,
        toastCtx: toast,
        tenantID: tenantID,
        customerID: customerID,
        apiUrlOverride: api,
    });
};

const getMarkAsUsedOnClosedOptionValue = async () => {
    let value = await optionService.getOptionValue(constants.optionKeys.JobCardPreferenceClosedMarksMaterialsAsUsed);
    return helper.parseBool(value);
}

const getEffectiveWarehouse = async (jobCardID) => {
    return await Fetch.get({
        url: `/Job/EffectiveWarehouse`,
        params: {
            jobCardID
        }
    });
}

export default {
    getJob,
    getJobCustomerZone,
    updateJobCustomerZone,
    getJobList,  
    getJobsForAsset,
    getJobsForCustomer,
    getJobsForProject,
    getMarkAsUsedOnClosedOptionValue,
    getEffectiveWarehouse
};
