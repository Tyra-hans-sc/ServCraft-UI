import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';

const getInventoryCategoryList = async (searchPhrase, pageSize, currentPage, ancillaryFilters, sortField, sortDirection, toast = null, context = null) => {
    let params = {
        pageSize,
        pageIndex: currentPage - 1,
        searchPhrase,        
        SortExpression: sortField,
        SortDirection: sortDirection,
    };

    if (ancillaryFilters) {
        params = {...params, 
            IncludeClosed: ancillaryFilters["IncludeDisabled"],
        };
    }

    return await Fetch.post({
        url: `/InventoryCategory/GetInventoryCategories`,
        params,
        toastCtx: toast,
        ctx: context,
    });
};

const getInventoryCategoryListColumns = () => {
    return [{
        Label: 'Name',
        ColumnName: 'Description',
        CellType: 'none',
        }, {
        Label: 'Account Code',
        ColumnName: 'Code',
        CellType: 'none',
        }, {
        Label: 'Updated By',
        ColumnName: 'ModifiedBy',
        CellType: 'none',
        }, {
        Label: 'Updated Date',
        ColumnName: 'ModifiedDate',
        CellType: 'date',
    }];
};

const getAllInventoryCategories = async (context = null) => {
    return await Fetch.get({
        url: `/InventoryCategory/false`,
        ctx: context
    });
};

const getInventoryCategory = async (id) => {
  let result = null;
  if (id) {
      result = await Fetch.get({
          url: `/InventoryCategory?id=${id}`
      });
  }
  return result;
};

const validateInventoryCategory = (inputs) => {
  let validationItems = [];
  validationItems = [
    {key: 'Description', value: inputs.Description, required: true, type: Enums.ControlType.Text}
  ];
  return Helper.validateInputs(validationItems);
};

export default {
    getInventoryCategoryList,
    getInventoryCategoryListColumns,
    getAllInventoryCategories,
    getInventoryCategory,
    validateInventoryCategory,
};
