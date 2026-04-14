import Fetch from '../../utils/Fetch';

const checkboxColumnHeader = 'Customer No';
const checkboxColumn = 'CustomerCode';

const getCustomerList = async (searchPhrase, pageSize, currentPage, sortExpression, sortDirection, activeFilterIds, ancillaryFilters, populatedList = false, toast = null, context = null) => {    

    let params = {
        pageSize,
        pageIndex: currentPage - 1,
        searchPhrase,
        sortExpression: sortExpression === checkboxColumnHeader ? checkboxColumn : sortExpression,
        sortDirection,
        populatedList,
    };

    if (activeFilterIds) {
        params = {...params,
            CustomerGroupIDList: activeFilterIds["CustomerGroups"],
            CustomerStatusIDList: activeFilterIds["CustomerStatuses"],
            CustomerTypeIDList: activeFilterIds["CustomerTypes"],
        };
    }

    if (ancillaryFilters) {
        params = {...params, 
            IncludeClosed: ancillaryFilters["IncludeClosed"],
            ShowArchived: ancillaryFilters["ShowArchived"],
        };
    }

    return await Fetch.post({
        url: '/Customer/GetCustomers',
        params: params,
        ctx: context,
        toastCtx: toast
    });
};

const getCounts = async (id, context = null) => {
    let countRequest = await Fetch.get({
        url: `/Customer/GetCounts?id=${id}`,
        ctx: context,
    });

    let result = countRequest.Results;
    let contactCount = result.find(x => x.Key == 'Contacts');
    let locationCount = result.find(x => x.Key == 'Locations');
    let jobCount = result.find(x => x.Key == 'Jobs');
    let quoteCount = result.find(x => x.Key == 'Quotes');
    let invoiceCount = result.find(x => x.Key == 'Invoices');
    let queryCount = result.find(x => x.Key == 'Queries');
    let productCount = result.find(x => x.Key == 'Products');
    let appointmentCount = result.find(x => x.Key == 'Appointments');
    let attachmentCount = result.find(x => x.Key == 'Attachments');
    let communicationCount = result.find(x => x.Key == 'Communication');
    
    return {
        contactCount: contactCount ? contactCount.Value : 0,
        locationCount: locationCount ? locationCount.Value : 0,
        jobCount: jobCount ? jobCount.Value : 0,
        quoteCount: quoteCount ? quoteCount.Value : 0,
        invoiceCount: invoiceCount ? invoiceCount.Value : 0,
        queryCount: queryCount ? queryCount.Value : 0,
        productCount: productCount ? productCount.Value : 0,
        appointmentCount: appointmentCount ? appointmentCount.Value : 0,
        attachmentCount: attachmentCount ? attachmentCount.Value : 0,
        communicationCount: communicationCount ? communicationCount.Value : 0,
    }
};

const getCustomer = async (id, context = null) => {
  const customer = await Fetch.get({
    url: '/Customer/' + id,
    ctx: context
  });
  return customer;
};

const archiveCustomer = async (id, toast = null) => {
    return await Fetch.put({
        url: '/Customer/Archive?id=' + id,
        toastCtx: toast
    });
};

const archiveSelectedCustomers = async (customerIDs, toast = null) => {
    return await Fetch.post({
        url: '/Customer/ArchiveToggle',
        params: customerIDs,
        toastCtx: toast
    });
};

const getCountries = async (context = null) => {
    const countries = await Fetch.get({
        url: '/Country',
        ctx: context
    });
    return countries.Results;
};

const getCountry = async (id, context = null) => {
  const country = await Fetch.get({
    url: `/Country/${id}`,
    ctx: context,
  });
  return country;
};

const getCustomerGroups = async (context = null) => {
    return await Fetch.get({
        url: '/CustomerGroup',
        ctx: context,
    });
};

const getCustomerStatuses = async (context = null) => {
    return await Fetch.get({
        url: '/CustomerStatus',
        ctx: context,
    });
};

const getCustomerTypes = async (context = null) => {
    return await Fetch.get({
        url: '/CustomerType',
        ctx: context,
    });
};

const getIndustryTypes = async (context = null) => {
    return await Fetch.get({
        url: `/IndustryType`,
        ctx: context,
    });
};

const getMediaTypes = async (context = null) => {
    return await Fetch.get({
        url: `/MediaType`,
        ctx: context,
    });
};

const getDesignations = async (context = null) => {
  return await Fetch.get({
    url: `/Designation`,
    ctx: context    
  });
};

const contactsFilter = (contacts, contactSearch) => {
  return contacts.filter(contact => {
    const contactName = contact.FirstName + " " + contact.LastName;
    if (contactName.toLowerCase().includes(contactSearch.toLowerCase())) {
      return true;
    }
    if (contact.EmailAddress && contact.EmailAddress.toLowerCase().includes(contactSearch.toLowerCase())) {
      return true;
    }
    if (contact.MobileNumber && contact.MobileNumber.includes(contactSearch)) {
      return true;
    }
    return false;
  });
};

const locationsFilter = (locations, locationSearch) => {
  return locations.filter(location => {
    if (location.LocationDisplay.toLowerCase().includes(locationSearch.toLowerCase())) {
      return true;
    }
    if (location.AddressLine1 && location.AddressLine1.toLowerCase().includes(locationSearch.toLowerCase())) {
      return true;
    }
    if (location.AddressLine2 && location.AddressLine2.includes(locationSearch)) {
      return true;
    }
    return false;
  });
};

const hasLocationChanged = (initialLocation, updatedLocation) => {
  let hasChanged = false;
  if (initialLocation) {
    if (updatedLocation) {
      if (initialLocation.ID != updatedLocation.ID) {
        hasChanged = true;
      }
    } else {
      hasChanged = true;
    }
  } else {
    if (updatedLocation) {
      hasChanged = true;
    }
  }
  return hasChanged;
};

export default {
    getCustomerList,
    getCounts,
    getCustomer,
    archiveCustomer,
    archiveSelectedCustomers,

    getCustomerGroups,
    getCustomerStatuses,
    getCustomerTypes,    
    getIndustryTypes,
    getMediaTypes,
    getDesignations,
    
    contactsFilter,
    locationsFilter,
    hasLocationChanged,
    getCountries,
    getCountry,

    checkboxColumnHeader,
    checkboxColumn,
};
