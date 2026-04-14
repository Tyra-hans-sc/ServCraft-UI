import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';

const getProjectList = async (searchPhrase, pageSize, currentPage, sortExpression, sortDirection, toast = null, context = null) => {
    return await Fetch.post({
        url: `/Project/GetProjects`,
        params: {
          pageSize,
          pageIndex: currentPage - 1,
          sortExpression,
          sortDirection,
          searchPhrase,
        },
        toastCtx: toast,
        ctx: context
    });
};

const getProject = async (projectID, context = null) => {
    return await Fetch.get({
        url: `/Project/${projectID}`,
        ctx: context,
    });
};

const customerHasProjects = async (customerID, context = null) => {
    const request = await Fetch.get({
        url: `/Project`,
        params: {
          customerID: customerID,
        },
        ctx: context,
    });
    return request.TotalResults > 0;
};

export default {
    getProjectList,
    getProject,
    customerHasProjects,
};
