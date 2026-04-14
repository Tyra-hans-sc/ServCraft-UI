import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';

const validate = (inputs, selectedInventoryCategory, selectedInventorySubcategory) => {

  let validationItems = [];
  validationItems = [
    {key: 'Description', value: inputs.Description, required: true, type: Enums.ControlType.Text},
    {key: 'InventoryCategoryDescription', value: selectedInventoryCategory, required: true, type: Enums.ControlType.Select},
    {key: 'InventorySubcategoryDescription', value: selectedInventorySubcategory, required: true, type: Enums.ControlType.Select},
    {key: 'StockItemTypeDescription', value: inputs.StockItemTypeDescription, required: true, type: Enums.ControlType.Text},
    {key: 'CostPrice', value: inputs.CostPrice, required: true, type: Enums.ControlType.Number},
    {key: 'ListPrice', value: inputs.ListPrice, required: true, type: Enums.ControlType.Number},
    {key: 'CommissionPercentage', value: inputs.CommissionPercentage, required: true, type: Enums.ControlType.Number},
    {key: 'Quantity', value: inputs.Quantity, required: true, type: Enums.ControlType.Number},
    {key: 'WarrantyPeriod', value: inputs.WarrantyPeriod, required: true, type: Enums.ControlType.Number},
  ];

  return Helper.validateInputs(validationItems);
};

const getInventoryList = async (searchPhrase, pageSize, currentPage, activeFilterIds, ancillaryFilters, sortField, sortDirection, toast = null, context = null) => {
    let params = {
        pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase,
        sortExpression: sortField,
        sortDirection: sortDirection
    };

    if (activeFilterIds) {
        params = {...params,
            CategoryIDList: activeFilterIds["Categories"],
            SubcategoryIDList: activeFilterIds["Subcategories"],
            SupplierIDList: activeFilterIds["Suppliers"],
            StockItemTypeIDList: activeFilterIds["StockItemTypes"],
        };
    }

    if (ancillaryFilters) {
        params = {...params,
            IncludeClosed: ancillaryFilters["IncludeDisabled"],
        }
    }

    return await Fetch.post({
        url: `/Inventory/GetInventories`,
        params: params,
        toastCtx: toast,
        ctx: context,
    });
};

const getInventory = async (id, context = null) => {
  return await Fetch.get({
    url: `/Inventory?id=${id}`,
    ctx: context,
  });
};

// INVENTORY CATEGORY

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

// INVENTORY SUBCATEGORY

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
  validate,
  getInventoryList,
  getInventory,
  
  getAllInventoryCategories,
  getInventoryCategory,  
  validateInventoryCategory,

  getAllInventorySubCategories,
  validateInventorySubcategory,
};
