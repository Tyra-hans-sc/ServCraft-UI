import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';

const getInventorySubcategoryList = async (searchPhrase, pageSize, currentPage, activeFilterIds, ancillaryFilters, sortField, sortDirection, toast = null, context = null) => {
    let params = {
        pageSize,
        pageIndex: currentPage - 1,
        searchPhrase,        
        SortExpression: sortField,
        SortDirection: sortDirection,
    };

    if (activeFilterIds) {
        params = {...params,
            CategoryIDList: activeFilterIds["Categories"],
        };
    }

    if (ancillaryFilters) {
        params = {...params, 
            IncludeClosed: ancillaryFilters["IncludeDisabled"],
        };
    }

    return await Fetch.post({
        url: `/InventorySubcategory/GetInventoryCategories`,
        params,
        toastCtx: toast,
        ctx: context,
    });
};

const getInventorySubcategoryListColumns = () => {
    return [{
        Label: 'Name',
        ColumnName: 'Description',
        CellType: 'none',
    }, {
        Label: 'Inventory Category',
        ColumnName: 'InventoryCategoryDescription',
        CellType: 'status',
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

const getAllInventorySubCategories = async (context = null) => {
    return await Fetch.get({
        url: `/InventorySubcategory/GetOnlyActive?onlyActive=false`,
        ctx: context
    });
};

const validateInventorySubcategory = (inputs, selectedInventoryCategory) => {
    let validationItems = [];
    validationItems = [
        {key: 'Description', value: inputs.Description, required: true, type: Enums.ControlType.Text},
        {key: 'InventoryCategory', value: selectedInventoryCategory, required: true, type: Enums.ControlType.Select},
    ];
    return Helper.validateInputs(validationItems);
};

export default {
    getInventorySubcategoryList,
    getInventorySubcategoryListColumns,
    getAllInventorySubCategories,
    validateInventorySubcategory,
};
