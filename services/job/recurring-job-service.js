import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';

const getRecurringJobList = async (searchPhrase, pageSize, currentPage, ancillaryFilters, sortField, sortDirection, toast = null, context = null) => {

    const usePopulatedList = false;

    let params = {
        pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase,
        SortExpression: sortField,
        SortDirection: sortDirection,
        PopulatedList: usePopulatedList,
    };

    if (ancillaryFilters) {
        params = {...params,
            IncludeClosed: ancillaryFilters["IncludeDisabled"],
        };
    }

    return await Fetch.post({
        url: '/JobSchedule/GetJobSchedules',
        params,
        toastCtx: toast,
        ctx: context,
      });
};

const getRecurringJobListColumns = async (context = null) => {

    let columns = [{
        Label: 'Customer',
        ColumnName: 'CustomerName',
        CellType: 'none',
      }, {
        Label: 'Contact',
        ColumnName: 'CustomerContactFullName',
        CellType: 'none',
      }, {
        Label: 'Location',
        ColumnName: 'LocationDisplay',
        CellType: 'none',
      }, {
        Label: 'Service',
        ColumnName: 'InventoryDescription',
        CellType: 'none',
      }, {
        Label: 'Job Type',
        ColumnName: 'JobTypeName',
        CellType: 'none',
      }, {
        Label: 'Last Run Date',
        ColumnName: 'LastRunDate',
        CellType: 'date',
      }, {
        Label: 'Next Run Date',
        ColumnName: 'NextRunDate',
        CellType: 'date',
      }, {
        Label: 'Created',
        ColumnName: 'CreatedDate',
        CellType: 'date',
      }, {
        Label: 'Created By',
        ColumnName: 'CreatedBy',
        CellType: 'none',
      }, {
        Label: 'Active',
        ColumnName: 'IsActive',
        CellType: 'icon',
      }];

    let isServiceMode = false;

    let optionValue = await Fetch.get({
      url: `/Option/GetByOptionName?name=Job Service`,
      ctx: context,
    });

    if (optionValue) {
      isServiceMode = (optionValue.toLowerCase() === 'true');
    }

    if (!isServiceMode) {
      columns = columns.filter(x => x.Label != "Service");
    }

    return columns;
};

const getAncillaryFilterOptions = () => {
    const filter = [{
        type: Enums.ControlType.Switch,
        label: 'Include disabled recurring jobs',
    }];
    return {
        IncludeDisabled: filter,
    };
}

export default {
    getRecurringJobList,
    getRecurringJobListColumns,
    getAncillaryFilterOptions,
};
