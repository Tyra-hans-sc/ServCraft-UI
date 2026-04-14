import * as Enums from '../../utils/enums';
import Storage from '../../utils/storage';
import { logout } from '../../utils/auth';

const setPermissions = (permissions, isOwner, duration) => {
    if (isOwner) {
        permissions.push(Enums.PermissionName.Owner);
    }
    Storage.setCookie(Enums.Cookie.permissions, mapPermissionsToShortCode(permissions), duration);
}

const getPermissions = () => {
    const permissions = Storage.getCookie(Enums.Cookie.permissions);

    return mapShortCodeToPermissions(permissions);
}

const hasAdvancedPermissions = () => {
    const subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
    if (subscriptionInfo) {
        return subscriptionInfo.AdvancedPermission === true;
    }

    return false;
}

const mapPermissionsToShortCode = (permissions) => {
    if (!permissions || permissions.length === 0) return permissions;

    let map = permissions.map(x => {
        let matchKeys = Object.keys(Enums.permissionIDShortCodes).filter(key => Enums.permissionIDShortCodes[key] === x.toUpperCase());
        if (matchKeys.length === 1) {
            return matchKeys[0];
        } else {
            return null;
        }
    });

    return map.filter(x => !!x);
}

const mapShortCodeToPermissions = (shortCodes, ctx) => {
    if (!shortCodes || shortCodes.length === 0) return shortCodes;

    // this is for legacy permissions prior to 1.7.6 - auto log them out
    if (shortCodes.filter(x => x.length === 36).length > 0) {
        logout(true, ctx);
        return shortCodes;
    }

    return shortCodes.map(x => Enums.permissionIDShortCodes[x]);
}

// use ignoreMaster for all owner based ones
const hasPermission = (permissionNames, ignoreMaster = false, permissions = null) => {

    if (permissionNames) {
        let permNames = [];
        if (permissionNames instanceof Array) {
            permNames = [...permissionNames];
        } else {
            permNames = [permissionNames];
        }

        // owner checks
        // check if permNames contains the super admin permissions, if so, add owner to the list if it doesnt exist so owner can access those at any point
        const ownerPermissions = [
            Enums.PermissionName.MasterOfficeAdmin,
            Enums.PermissionName.EditCompany,
            Enums.PermissionName.UserManagement,
            Enums.PermissionName.Integrations,
            Enums.PermissionName.Subscriptions
        ];
        if (permNames.filter(x => ownerPermissions.includes(x)).length > 0 && !permNames.includes(Enums.PermissionName.Owner)) {
            permNames.push(Enums.PermissionName.Owner);
        }

            permissions = permissions != null ? permissions : getPermissions();
        if (permissions) {
            let localPerms = [...permissions];
            let hasMatch = localPerms.filter(x => {
                let xUp = x?.toUpperCase() ?? "";

                return xUp === Enums.PermissionName.MasterSystemAdmin.toUpperCase() ||
                    permNames.filter(y => {
                        return y.toUpperCase() === xUp
                    }).length > 0;
            }).length > 0;

            return hasMatch;
        }
    }
    return false;
};


export default {
    hasAdvancedPermissions,
    hasPermission,
    setPermissions,
    getPermissions,
    mapShortCodeToPermissions,
    mapPermissionsToShortCode
    // idFromNames
};