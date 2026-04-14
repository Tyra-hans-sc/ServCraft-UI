import Constants from '../../utils/constants';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';

const getCustomFields = async (module, context = null) => {
  const customFields = await Fetch.get({
    url: `/Option?module=${module}`,
    ctx: context
  });
  return customFields.Results;
};

const getOption = async (groupName, optionName) => {
  let optionResults = await Fetch.get({
    url: `/Option/GetByGroupName?group=${groupName}`,
  });
  let results = optionResults.Results;
  let option = null;
  if (results && results.length > 0) {
    option = results.find(x => x.OptionName == optionName);
  }
  return option;
};

const getOptionValue = async (optionName, context = null) => {
  let optionResult = await Fetch.get({
    url: `/Option/GetByOptionName?name=${optionName}`,
    ctx: context,
  });
  return optionResult;
};

const saveOption = async (params, toast = null) => {
  return await Fetch.put({
    url: '/Option',
    params,
    toastCtx: toast,
    statusIfNull: true
  });
};

const getSettingInputs = (settings) => {

  let settingInputs = {};
  settings.map(function (setting) {
    if (setting.SystemType == 'System.Boolean') {
      if (typeof setting.OptionValue === 'string' && setting.OptionValue.toUpperCase() == 'FALSE') {
        settingInputs[setting.OptionName] = false;
      } else {
        settingInputs[setting.OptionName] = true;
      }
    } else {
      settingInputs[setting.OptionName] = setting.OptionValue;
    }
  });
  return settingInputs;
};

const getSettingGroups = (settings) => {

  let settingGroups = {};
  settings.map(function (setting) {
    if (!settingGroups[setting.GroupName]) {
      settingGroups[setting.GroupName] = [];
      settingGroups[setting.GroupName].push(setting);
    } else {
      settingGroups[setting.GroupName].push(setting);
    }
  });
  return settingGroups;
};

function getCustomerCustomFields(customFields) {

  let { fieldLabel1, fieldLabel2, fieldLabel3, fieldLabel4,
    dateFieldLabel1, dateFieldLabel2, filterFieldLabel1, filterFieldLabel2,
    numberFieldLabel1, numberFieldLabel2 } = getModuleCustomFields(customFields, Enums.Module.Customer);

  let customerStatusRequired = false, customerTypeRequired = false, industryTypeRequired = false, mediaTypeRequired = false;

  let customerValidationSettings = customFields.filter(x => x.GroupName == 'Customer Validation Settings');
  if (customerValidationSettings) {
    let statusSetting = customerValidationSettings.find(x => x.OptionName == 'Customer Status Required');
    customerStatusRequired = (statusSetting.OptionValue == 'true');
    let typeSetting = customerValidationSettings.find(x => x.OptionName == 'Customer Type Required');
    customerTypeRequired = (typeSetting.OptionValue == 'true');
    let industryTypeSetting = customerValidationSettings.find(x => x.OptionName == 'Industry Type Required');
    industryTypeRequired = (industryTypeSetting.OptionValue == 'true');
    let mediaTypeSetting = customerValidationSettings.find(x => x.OptionName == 'Media Type Required');
    mediaTypeRequired = (mediaTypeSetting.OptionValue == 'true');
  }

  return {
    'fieldLabel1': fieldLabel1, 'fieldLabel2': fieldLabel2, 'fieldLabel3': fieldLabel3, 'fieldLabel4': fieldLabel4,
    'dateFieldLabel1': dateFieldLabel1, 'dateFieldLabel2': dateFieldLabel2, 'filterFieldLabel1': filterFieldLabel1, 'filterFieldLabel2': filterFieldLabel2,
    'numberFieldLabel1': numberFieldLabel1, 'numberFieldLabel2': numberFieldLabel2,
    'customerStatusRequired': customerStatusRequired, 'customerTypeRequired': customerTypeRequired,
    'industryTypeRequired': industryTypeRequired, 'mediaTypeRequired': mediaTypeRequired
  };
}

function getProductCustomFields(customFields) {

  let { fieldLabel1, fieldLabel2, fieldLabel3, fieldLabel4,
    dateFieldLabel1, dateFieldLabel2, filterFieldLabel1, filterFieldLabel2,
    numberFieldLabel1, numberFieldLabel2 } = getModuleCustomFields(customFields, Enums.Module.Asset);

  let field1Required = false, field2Required = false, serialNumberRequired = false, invoiceNumberRequired = false, locationRequired = false;
  let validationSettings = customFields.filter(x => x.GroupName == 'Asset Validation Settings');
  if (validationSettings) {
    let field1Setting = validationSettings.find(x => x.OptionName == 'Asset Custom Field 1 Required');
    let field2Setting = validationSettings.find(x => x.OptionName == 'Asset Custom Field 2 Required');
    let serialNumberSetting = validationSettings.find(x => x.OptionName == 'Asset Serial Number Required');
    let invoiceNumberSetting = validationSettings.find(x => x.OptionName == 'Asset Invoice Number Required');
    let locationSetting = validationSettings.find(x => x.OptionName == 'Asset Location Required');
    field1Required = field1Setting ? (field1Setting.OptionValue.toLowerCase() === 'true') : false;
    field2Required = field2Setting ? (field2Setting.OptionValue.toLowerCase() === 'true') : false;
    serialNumberRequired = serialNumberSetting ? (serialNumberSetting.OptionValue.toLowerCase() === 'true') : false;
    invoiceNumberRequired = invoiceNumberSetting ? (invoiceNumberSetting.OptionValue.toLowerCase() === 'true') : false;
    locationRequired = locationSetting ? (locationSetting.OptionValue.toLowerCase() === 'true') : false;
  }
  return {
    'fieldLabel1': fieldLabel1, 'fieldLabel2': fieldLabel2, 'fieldLabel3': fieldLabel3, 'fieldLabel4': fieldLabel4,
    'dateFieldLabel1': dateFieldLabel1, 'dateFieldLabel2': dateFieldLabel2,
    'filterFieldLabel1': filterFieldLabel1, 'filterFieldLabel2': filterFieldLabel2,
    'numberFieldLabel1': numberFieldLabel1, 'numberFieldLabel2': numberFieldLabel2,
    'field1Required': field1Required, 'field2Required': field2Required,
    'serialNumberRequired': serialNumberRequired, 'invoiceNumberRequired': invoiceNumberRequired, 'locationRequired': locationRequired
  };
}

function getQueryCustomFields(customFields) {
  return getModuleCustomFields(customFields, Enums.Module.Query);
}

function getJobCustomFields(customFields) {
  return getModuleCustomFields(customFields, Enums.Module.JobCard);
}

const getJobOptionName = (customFields, statusOption) => {
  let { fieldLabel1, fieldLabel2, fieldLabel3, fieldLabel4, dateFieldLabel1, dateFieldLabel2, filterFieldLabel1, filterFieldLabel2,
    numberFieldLabel1, numberFieldLabel2 } = getJobCustomFields(customFields);
  let result = Helper.splitWords(Enums.getEnumStringValue(Enums.JobStatusOptionName, statusOption.JobStatusOptionName));

  switch (result) {
    case 'Custom Field1':
      result = fieldLabel1;
      break;
    case 'Custom Field2':
      result = fieldLabel2;
      break;
    case 'Custom Field3':
      result = fieldLabel3;
      break;
    case 'Custom Field4':
      result = fieldLabel4;
      break;
    case 'Custom Date1':
      result = dateFieldLabel1;
      break;
    case 'Custom Date2':
      result = dateFieldLabel2;
      break;
    case 'Custom Filter1':
      result = filterFieldLabel1;
      break;
    case 'Custom Filter2':
      result = filterFieldLabel2;
      break;
    case 'Custom Number1':
      result = numberFieldLabel1;
      break;
    case 'Custom Number2':
      result = numberFieldLabel2;
      break;
    case 'Job Item':
      result = "Customer Assets";
      break;
  }

  return result;
};

function getModuleCustomFields(customFields, module) {
  let moduleText = module == Enums.Module.JobCard ? 'Job Card' : module == Enums.Module.Customer ? 'Customer' : module == Enums.Module.Query ? 'Query' : module == Enums.Module.Asset ? 'Asset' : '';

  let fieldLabel1 = '', fieldLabel2 = '', fieldLabel3 = '', fieldLabel4 = '', dateFieldLabel1 = '', dateFieldLabel2 = '',
    filterFieldLabel1 = '', filterFieldLabel2 = '', numberFieldLabel1 = '', numberFieldLabel2 = '';
  let customSettings = customFields.filter(x => x.GroupName == 'Custom Settings');

  // console.log(customSettings);

  if (customSettings) {

    let field1Settings, field2Settings, field3Settings, field4Settings, dateField1Settings, dateField2Settings,
      filterField1Settings, filterField2Settings, numberField1Settings, numberField2Settings;

    if (module === Enums.Module.Asset) {
      field1Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Field 1`);
      field2Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Field 2`);
      field3Settings = customSettings.find(x => x.OptionName == `${moduleText} Field 3`);
      field4Settings = customSettings.find(x => x.OptionName == `${moduleText} Field 4`);
      dateField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Date 1`);
      dateField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Date 2`);
      filterField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Yes/No 1`);
      filterField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Yes/No 2`);
      numberField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Number 1`);
      numberField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Number 2`);
    } else {
      field1Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Field 1`);
      field2Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Field 2`);
      if (module === Enums.Module.JobCard) {
        field3Settings = customSettings.find(x => x.OptionName == `Job Field 3`);
        field4Settings = customSettings.find(x => x.OptionName == `Job Field 4`);
      } else {
        field3Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Field 3`);
        field4Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Field 4`);
      }
      if (module === Enums.Module.Customer) {
        dateField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Date 1`);
        dateField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Date 2`);
        filterField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Yes/No 1`);
        filterField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Yes/No 2`);
        numberField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Number 1`);
        numberField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Number 2`);
      } else {
        dateField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Date 1`);
        dateField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Date 2`);
        filterField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Filter 1`);
        filterField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Filter 2`);
        numberField1Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Number 1`);
        numberField2Settings = customSettings.find(x => x.OptionName == `${moduleText} Custom Number 2`);
      }
    }

    fieldLabel1 = field1Settings ? field1Settings.OptionValue : 'Custom Field 1';
    fieldLabel2 = field2Settings ? field2Settings.OptionValue : 'Custom Field 2';
    fieldLabel3 = field3Settings ? field3Settings.OptionValue : 'Custom Field 3';
    fieldLabel4 = field4Settings ? field4Settings.OptionValue : 'Custom Field 4';
    dateFieldLabel1 = dateField1Settings ? dateField1Settings.OptionValue : 'Custom Date 1';
    dateFieldLabel2 = dateField2Settings ? dateField2Settings.OptionValue : 'Custom Date 2';
    filterFieldLabel1 = filterField1Settings ? filterField1Settings.OptionValue : 'Custom Filter 1';
    filterFieldLabel2 = filterField2Settings ? filterField2Settings.OptionValue : 'Custom Filter 2';
    numberFieldLabel1 = numberField1Settings ? numberField1Settings.OptionValue : 'Custom Number 1';
    numberFieldLabel2 = numberField2Settings ? numberField2Settings.OptionValue : 'Custom Number 2';
  }
  return {
    'fieldLabel1': fieldLabel1, 'fieldLabel2': fieldLabel2, 'fieldLabel3': fieldLabel3, 'fieldLabel4': fieldLabel4,
    'dateFieldLabel1': dateFieldLabel1, 'dateFieldLabel2': dateFieldLabel2,
    'filterFieldLabel1': filterFieldLabel1, 'filterFieldLabel2': filterFieldLabel2,
    'numberFieldLabel1': numberFieldLabel1, 'numberFieldLabel2': numberFieldLabel2
  };
}


export default {
  getOption,
  getOptionValue,
  saveOption,
  getSettingInputs,
  getSettingGroups,
  getCustomFields,
  getCustomerCustomFields,
  getProductCustomFields,
  getQueryCustomFields,
  getJobCustomFields,
  getJobOptionName
}
