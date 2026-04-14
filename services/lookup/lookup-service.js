import Helper from '../../utils/helper'
import * as Enums from '../../utils/enums'

const validate = (type, description, code = null, selectedInventoryCategory = null, selectedQueryType = null) => {

  let validationItems = [];
  validationItems = [
    {key: 'Description', value: description, required: true, type: Enums.ControlType.Text},
  ];
  if (type == 'faultCause' || type == 'faultReason' || type == 'faultCode') {
    validationItems = [...validationItems, 
      {key: 'Code', value: code, required: true, type: Enums.ControlType.Text},];
  }
  if (type == 'queryStatus') {
    validationItems = [...validationItems, 
      {key: 'QueryType', value: selectedQueryType, required: true, type: Enums.ControlType.Select},];
  }

  return Helper.validateInputs(validationItems);
}

const getTitle = (type) => {
  let title = '';
  
  switch (type) {
    case 'customerType':
      title = 'Customer Type';
      break;
    case 'customerStatus':
      title = 'Customer Status';
      break;
    case 'industryType':
      title = 'Industry Type';
      break;
    case 'mediaType':
      title = 'Media Type';
      break;
    case 'queryType':
      title = 'Query Type';
      break;
    case 'queryStatus':
      title = 'Query Status';
      break;
    case 'queryReason':
      title = 'Query Reason';
      break;
    case 'designation':
      title = 'Designation';
      break;
    case 'faultCause':
      title = 'Fault Cause';
      break;
    case 'faultCode':
      title = 'Fault Code';
      break;
    case 'faultReason':
      title = 'Fault Reason';
      break;
  }
  return title;
}

const getListUrl = (type) => {
  let url = '';
  switch (type) {
    case 'customerType':
      url = '/CustomerType/GetCustomerTypes';
      break;
    case 'customerStatus':
      url = '/CustomerStatus/GetCustomerStatus';
      break;
    case 'industryType':
      url = '/IndustryType/GetIndustryTypes';
      break;
    case 'mediaType':
      url = '/MediaType/GetMediaTypes';
      break;
    case 'queryType':
      url = '/QueryType/GetQueryTypes';
      break;
    case 'queryStatus':
      url = '/QueryStatus/GetQueryStatus';
      break;
    case 'queryReason':
      url = '/QueryReason/GetQueryReasons';
      break;
    case 'designation':
      url = '/Designation/GetDesignations';
      break;
    case 'faultCause':
      url = '/FaultCause/GetFaultCauses';
      break;
    case 'faultCode':
      url = '/FaultCode/GetFaultCodes';
      break;
    case 'faultReason':
      url = '/FaultReason/GetFaultReasons';
      break;
  }
  return url;
}

const getEditUrl = (type, id) => {
  let url = '';
  switch (type) {
    case 'customerType':
      url = `/CustomerType/${id}`;
      break;
    case 'customerStatus':
      url = `/CustomerStatus/${id}`;
      break;
    case 'industryType':
      url = `/IndustryType/${id}`;
      break;
    case 'mediaType':
      url = `/MediaType/${id}`;
      break;
    case 'queryType':
      url = `/QueryType/${id}`;
      break;
    case 'queryStatus':
      url = `/QueryStatus/${id}`;
      break;
    case 'queryReason':
      url = `/QueryReason/${id}`;
      break;
    case 'designation':
      url = `/Designation/${id}`;
      break;
    case 'faultCause':
      url = `/FaultCause/${id}`;
      break;
    case 'faultCode':
      url = `/FaultCode/${id}`;
      break;
    case 'faultReason':
      url = `/FaultReason/${id}`;
      break;
  }
  return url;
}

export default {
  validate,
  getTitle,
  getListUrl,
  getEditUrl,
}
