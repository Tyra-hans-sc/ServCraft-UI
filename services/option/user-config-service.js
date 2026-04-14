import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Storage from '../../utils/storage';

const getPageFilters = async (section, ctx) => {
    return await getSettings(section, Enums.ConfigurationType.PageFilters, ctx);
};

const getCrudSettings = async (section, ctx) => {
    return await getSettings(section, Enums.ConfigurationType.CRUD, ctx);
}

const getSettings = async (section, type, ctx) => {
    let configResponse = await Fetch.get({
        url: '/AuthUserConfiguration',
        ctx: ctx,
        params: {
            type: type,
            section: section
        }
    });

    // console.log('configResponse: ', configResponse)

    return configResponse.Results && configResponse.Results.length > 0 ? configResponse.Results[0] : {
        AuthUserID: Storage.getCookie(Enums.Cookie.userID),
        // ID: Helper.emptyGuid(),
        ConfigurationType: type,
        ConfigurationSection: section,
        MetaData: JSON.stringify({}),
        IsActive: true
    };
};

let timeout = null;

const saveConfigDebounced = (config, ctx, delay = 500) => {

    clearTimeout(timeout);

    timeout = setTimeout(async () => {
        await saveConfig(config, ctx);
    }, delay);

};

const saveConfig = async (config, ctx) => {
    let result = await Fetch.post({
        url: '/AuthUserConfiguration',
        ctx: ctx,
        params: config
    });

    return result;
};

const getMetaDataValue = (config, property) => {
    if (config && config.MetaData) {
        /*
        let val = JSON.parse(config.MetaData)[property];
        if (val !== undefined) { this check won't work as typeof 'undefined' is not undefined
            return val;
        }*/
        return JSON.parse(config.MetaData)[property] ?? null
    }
    return null;
};

const setMetaDataValue = (config, property, value) => {
    if (config && config.MetaData) {
        let meta = JSON.parse(config.MetaData);
        meta[property] = value;
        config.MetaData = JSON.stringify(meta);
    }
};


const updateFilters = (config, activeFilterIDs, ancillaryFilters, sortExpression, sortDirection, allowStickySort = false) => {
    if (activeFilterIDs) {
        setMetaDataValue(config, "ActiveFilterIDs", activeFilterIDs);
    } else {
        setMetaDataValue(config, "ActiveFilterIDs", {});
    }

    if (ancillaryFilters) {
        setMetaDataValue(config, "AncillaryFilters", ancillaryFilters);
    } else {
        setMetaDataValue(config, "AncillaryFilters", {});
    }

    if (allowStickySort && sortExpression) {
        setMetaDataValue(config, "SortExpression", sortExpression);
    } else {
        setMetaDataValue(config, "SortExpression", "");
    }

    if (allowStickySort && sortDirection) {
        setMetaDataValue(config, "SortDirection", sortDirection);
    } else {
        setMetaDataValue(config, "SortDirection", "");
    }
};

const getFilterValues = (config, activeFilterIDPropertyList = [], activeFilterIDDefault = [],
    ancillaryFilterPropertyList = [], ancillaryFilterDefault = false, allowStickySort = false) => {
    let activeFilterIDs = getMetaDataValue(config, "ActiveFilterIDs");
    let ancillaryFilters = getMetaDataValue(config, "AncillaryFilters");

    let stickyFilters = true;
    // if ((ancillaryFilterPropertyList && ancillaryFilterPropertyList.includes("StickyFilters")) || (ancillaryFilters && ancillaryFilters.StickyFilters !== undefined)) {
    //     stickyFilters = !ancillaryFilters || ancillaryFilters.StickyFilters !== false;
    // }

    let stickySorting = false;
    // if ((ancillaryFilterPropertyList && ancillaryFilterPropertyList.includes("StickySorting")) || (ancillaryFilters && ancillaryFilters.StickySorting !== undefined)) {
    //     stickySorting = ancillaryFilters && ancillaryFilters.StickySorting === true;
    // }

    if (activeFilterIDPropertyList) {
        activeFilterIDs = activeFilterIDs !== undefined && activeFilterIDs !== null ? activeFilterIDs : {};
        activeFilterIDPropertyList.map(prop => {
            activeFilterIDs[prop] = activeFilterIDs[prop] !== undefined && stickyFilters ? activeFilterIDs[prop] : activeFilterIDDefault;
            if (prop === "DateRange" && activeFilterIDs[prop].length === 0) {
                activeFilterIDs[prop] = [null, null];
            }
        });
    }

    if (!ancillaryFilterPropertyList) {
        ancillaryFilterPropertyList = [];
    }

    if (ancillaryFilterPropertyList) {
        ancillaryFilters = ancillaryFilters !== undefined && ancillaryFilters !== null ? ancillaryFilters : {};
        ancillaryFilterPropertyList.map(prop => {
            let defaultVal = ancillaryFilterDefault;
            if (prop === "StickyFilters") {
                defaultVal = true;
            }
            let isStickySetting = prop === "StickyFilters" || prop === "StickySorting";
            ancillaryFilters[prop] = ancillaryFilters[prop] !== undefined && (stickyFilters || isStickySetting) ? ancillaryFilters[prop] : defaultVal;
        });
    }

    let sortExpression = !allowStickySort || !stickySorting ? "" : getMetaDataValue(config, "SortExpression");
    let sortDirection = !allowStickySort || !stickySorting ? "" : getMetaDataValue(config, "SortDirection");

    return [activeFilterIDs, ancillaryFilters, sortExpression, sortDirection];
};


const setAppointmentDefaultPage = async (defaultPage, ctx) => {
    const filtersConfig = await getPageFilters(Enums.ConfigurationSection.Appointment, ctx);

    let activeFilterIDs = getMetaDataValue(filtersConfig, "ActiveFilterIDs");
    if (activeFilterIDs == null) {
        activeFilterIDs = {};
    }
    activeFilterIDs.DefaultPage = [defaultPage];
    setMetaDataValue(filtersConfig, "ActiveFilterIDs", activeFilterIDs);

    let result = await Fetch.post({
        url: '/AuthUserConfiguration',
        ctx: ctx,
        params: filtersConfig
    });
    return result;
};

const getAlternateDashboardLayout = async (ctx) => {
    let flagResponse = await Fetch.get({
        url: '/AuthUserConfiguration/AuthUserFlags',
        ctx: ctx
    });

    return flagResponse.ShowDashboard;
};

const getLegacyDashboardLayout = async (ctx) => {
    let optionResponse = await Fetch.get({
        url: '/Option/GetByOptionName',
        ctx: ctx,
        params: {
            name: "Legacy Dashboard"
        }
    });

    return Helper.parseBool(optionResponse);
}

const getPreTrialDashboardDismissed = (filtersConfig) => {
    let list = getMetaDataValue(filtersConfig, "PreTrialDashboardDismissed");

    if (list == null) {
        return [];
    } else {
        return list;
    }
};

const setPreTrialDashboardDismissed = (filtersConfig, newList) => {
    setMetaDataValue(filtersConfig, "PreTrialDashboardDismissed", newList);
}

const getSCDashboardPageConfig = (filtersConfig) => {
    let dashboardPageConfig = getMetaDataValue(filtersConfig, "DashboardPageConfig");
    return dashboardPageConfig;
};

const setSCDashboardPageConfig = (filtersConfig, dashboardPageConfig) => {
    setMetaDataValue(filtersConfig, "DashboardPageConfig", dashboardPageConfig);
}

export default {
    getSettings,
    getPageFilters,
    getCrudSettings,
    saveConfig,
    getMetaDataValue,
    setMetaDataValue,
    updateFilters,
    getFilterValues,
    saveConfigDebounced,
    setAppointmentDefaultPage,
    getAlternateDashboardLayout,
    getPreTrialDashboardDismissed,
    setPreTrialDashboardDismissed,
    getSCDashboardPageConfig,
    setSCDashboardPageConfig,
    getLegacyDashboardLayout
};
