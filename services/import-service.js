import Fetch from '../utils/Fetch';

const getImports = async (pageSize, pageIndex, sortExpression, sortDirection, searchPhrase, importTypeList, importStatusList, context = null) => {
    const request = await Fetch.post({
        url: `/Import/GetImports`,
        params: {
          PageSize: pageSize,
          PageIndex: pageIndex,
          SortExpression: sortExpression, 
          SortDirection: sortDirection,
          SearchPhrase: searchPhrase,
          ImportTypeList: importTypeList,
          ImportStatusList: importStatusList,
        },
        ctx: context
      });
    return {data: request.Results, total: request.TotalResults};
};

export default {
    getImports,
};
