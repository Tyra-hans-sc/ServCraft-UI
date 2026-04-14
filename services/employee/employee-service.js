import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import * as Auth from '../../utils/auth';
import permissionService from '../permission/permission-service';
import constants from '@/utils/constants';

const getEmployees = async (multiStoreID, ctx = null, includeDisabled = false) => {

    let multiStore = false;
    let subInfo = null;
    if (ctx) {
        const { token, tenantID, apiHost, fingerPrint, subscriptionInfo } = Auth.nextCookieContents(ctx);
        subInfo = subscriptionInfo;
    } else {
        subInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
    }

    multiStore = (subInfo && subInfo.MultiStore) === true;

    const employeeResult = await Fetch.get({
        url: "/Employee/GetEmployees", params: {
            storeID: multiStore ? multiStoreID : null,
            includeDisabled: includeDisabled
        },
        ctx: ctx
    });

    return employeeResult;
};

const getEmployee = async (id, context = null) => {
    return await Fetch.get({
        url: `/Employee?id=${id}`,
        ctx: context,
    });
};

const getColumnMappings = async (model, context = null) => {
    return await Fetch.get({
        url: '/Employee/ColumnMapping',
        params: {
            model
        },
        ctx: context,
    });
};

const saveColumnMappings = async (mappings, model, toast = null, context = null) => {
    await Fetch.put({
        url: '/Employee/ColumnMapping',
        params: {
            ColumnMappings: mappings,
            model,
        },
        toastCtx: toast,
        ctx: context,
    });
};

const refreshPermissions = async () => {

    if (typeof window === "undefined") return;

    const lastRefreshed = window.localStorage.getItem(Enums.LocalStorage.LastRefreshedPermissions);
    const newRefreshed = new Date().valueOf();

    if (lastRefreshed && newRefreshed - lastRefreshed < constants.permissionsRefreshIntervalMS) return;

    Fetch.get({
        url: '/Employee/UserPermissions',
    }).then(permissionIDs => {
        if (Array.isArray(permissionIDs)) {
            const isOwner = permissionService.hasPermission(Enums.PermissionName.Owner);
            permissionService.setPermissions(permissionIDs, isOwner, 7);
            window.localStorage.setItem(Enums.LocalStorage.LastRefreshedPermissions, newRefreshed);
        }
    });
}

const getPrimaryRoles = async () => {
    const primaryRoles = await Fetch.get({
        url: '/Employee/PrimaryRole'
    });

    return primaryRoles.Results;
}

export default {
    getEmployees,
    getEmployee,
    getColumnMappings,
    saveColumnMappings,
    refreshPermissions,
    getPrimaryRoles
};