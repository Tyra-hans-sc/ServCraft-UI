import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';

const getAuthWidgets = async (context) => {
    const widgets = await Fetch.get({
        url: `/AuthUserWidget`,
        ctx: context
    });
    return {data: widgets.Results, total: widgets.TotalResults};
};

const getDefaultWidgetPositions = () => {
    return [{
        col: 1,
        colSpan: 2,
        // row: 1,
        rowSpan: 1,
        id: Enums.Widgets.JobsTracker,
        order: 1,
      }, {
        col: 3,
        colSpan: 2,
        // row: 1,
        rowSpan: 1,
        id: Enums.Widgets.JobsAttention,
        order: 2,
      }, { 
        col: 1,
        colSpan: 4,
        // row: 2,
        rowSpan: 2,
        id: Enums.Widgets.AppointmentsCalendar,
        order: 3,
      }, { 
        col: 1,
        colSpan: 2,
        row: 4,
        rowSpan: 1,
        id: Enums.Widgets.JobsForTodayGrid,
        order: 4,
      }, {
        col: 3,
        colSpan: 1,
        // row: 4,
        rowSpan: 1,
        id: Enums.Widgets.QuotesSummary,
        order: 5,
      }, {
        col: 4,
        colSpan: 1,
        // row: 4,
        rowSpan: 1,
        id: Enums.Widgets.InvoicesSummary,
        order: 6,
      }, {
        col: 1,
        colSpan: 2,
        // row: 5,
        rowSpan: 1,
        id: Enums.Widgets.CommentsLatest,
        order: 7,
      }, {
        col: 3,
        colSpan: 2,
        // row: 5,
        rowSpan: 1,
        id: Enums.Widgets.YouTube,
        order: 8,
      }, { 
        col: 1,
        colSpan: 2,
        // row: 6,
        rowSpan: 1,
        id: Enums.Widgets.JobsForTodayTile,
        order: 9,
      }, { 
        col: 3,
        colSpan: 2,
        // row: 6,
        rowSpan: 1,
        id: Enums.Widgets.AppointmentsTile,
        order: 10,
      }];
};

const saveAuthWidgets = async (authUserWidgets, context) => {
    let result = await Fetch.post({
        url: '/AuthUserWidget',
        ctx: context,
        params: authUserWidgets
    });

    return result;
};

export default {
    getAuthWidgets,
    getDefaultWidgetPositions,
    saveAuthWidgets,
};
