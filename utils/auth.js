//From NextJS example project at https://github.com/zeit/next.js/blob/canary/examples/with-cookie-auth/utils/auth.js
import { useEffect } from 'react';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import * as Enums from '../utils/enums';
import PS from '../services/permission/permission-service';
import Storage from '../utils/storage';
import config from '../utils/config';
import time from './time';
import storage from '../utils/storage';
import hubspotService from '../services/hubspot/hubspot-service';
import constants from '../utils/constants';

export const login = ({ token, tenantID, userID, employeeID, duration, userName, fullName, companyName, permissions, isOwner,
  subscriptionInfo, apiHost, fingerPrint, pageSize, redirect, supplierID, supplierContactID, bypassLockout, isAdminLogin }) => {

  // Detect tenant change to force hard navigation and avoid stale React state (banners, menus, etc.)
  // If previousTenantID is empty (cookies were cleared by login page), also force hard nav
  // since _app.jsx React state may still hold the old tenant's data
  const previousTenantID = Storage.getCookie(Enums.Cookie.tenantID);
  const forceHardNav = isAdminLogin || !previousTenantID || previousTenantID !== tenantID;

  Storage.setCookie('bypassLockout', bypassLockout ? 'true' : 'false', duration);

  Storage.setCookie(Enums.Cookie.token, token, duration);
  Storage.setCookie(Enums.Cookie.tenantID, tenantID, duration);
  Storage.setCookie(Enums.Cookie.servUserName, userName, duration);
  Storage.setCookie(Enums.Cookie.servFullName, fullName, duration);
  Storage.setCookie(Enums.Cookie.servCompanyName, companyName, duration);
  Storage.setCookie(Enums.Cookie.subscriptionInfo, subscriptionInfo, duration);
  Storage.setCookie(Enums.Cookie.apiHost, apiHost, duration);
  Storage.setCookie(Enums.Cookie.fingerPrint, fingerPrint, duration);
  Storage.setCookie(Enums.Cookie.userID, userID, duration);
  Storage.setCookie(Enums.Cookie.employeeID, employeeID ? employeeID : "", duration);
  Storage.setCookie(Enums.Cookie.pageSize, pageSize, duration);
  Storage.setCookie(Enums.Cookie.supplierID, supplierID ? supplierID : "", duration);
  Storage.setCookie(Enums.Cookie.supplierContactID, supplierContactID ? supplierContactID : "", duration);
  PS.setPermissions(permissions, isOwner, duration);
  window.localStorage.setItem(Enums.LocalStorage.LastRefreshedAPI, time.toISOString(new Date()));
  window.localStorage.setItem(Enums.LocalStorage.LastRefreshedPermissions, new Date().valueOf());

  hubspotService.reInitialiseChatWidget();
  identifyClarityUser();

  if (redirect) {
    forceHardNav ? window.location.href = redirect : Router.push(redirect);
  } else if (subscriptionInfo.AccessStatus === Enums.AccessStatus.LockedWithOutAccess
    && !bypassLockout
    && (PS.hasPermission(Enums.PermissionName.Subscriptions))) {
    forceHardNav ? window.location.href = "/settings/subscription/manage" : Router.push("/settings/subscription/manage");
  } else {
    forceHardNav ? window.location.href = "/" : Router.push("/");
  }
}

export const getApiHost = (ctx = null, apiUrlOverride = null) => {

  if (config.isDebugging()) {
    return config.apiHost;
  }

  let apiHostFromCookie = Storage.getCookie(Enums.Cookie.apiHost);
  let { apiHost } = ctx ? nextCookieContents(ctx) : { apiHost: apiHostFromCookie };

  if (!apiHost && !apiUrlOverride) {
    return '';
  }

  if (apiUrlOverride) {
    apiHost = apiUrlOverride;
  }

  return apiHost;
};

export const nextCookieContents = ctx => {
  let { token, tenantID, apiHost, fingerPrint, subscriptionInfo, permissions, employeeID, pageSize, bypassLockout } = nextCookie(ctx);
  subscriptionInfo = subscriptionInfo && subscriptionInfo.length > 0 ? JSON.parse(Buffer.from(subscriptionInfo, 'base64').toString()) : subscriptionInfo;
  if (bypassLockout === 'true' && subscriptionInfo?.AccessStatus === Enums.AccessStatus.LockedWithOutAccess) {
    subscriptionInfo = { ...subscriptionInfo, AccessStatus: Enums.AccessStatus.Live };
  }
  permissions = permissions && permissions.length > 0 ? JSON.parse(Buffer.from(permissions, 'base64').toString()) : permissions;
  permissions = PS.mapShortCodeToPermissions(permissions, ctx);
  return { token, tenantID, apiHost, fingerPrint, subscriptionInfo, permissions, employeeID, pageSize };
}

export const auth = (ctx) => {
  const { token, tenantID, apiHost, fingerPrint } = nextCookieContents(ctx);
  const { id, username } = ctx.query;

  // If there's no token, it means the user is not logged in.
  if (!token) {

    let qsParams = [];
    const pathname = ctx.pathname; //job/[id]
    let redirect = '';

    if (pathname && pathname.length > 1 || Object.keys(ctx.query).length > 0) {
      if (id && pathname.includes('[id]')) {
        redirect = pathname.replace('[id]', id);
      } else {
        const queryParamString = '?' + Object.entries(ctx.query).map(([param, val]) => param + '=' + val).join('&')
        redirect = pathname + queryParamString;
      }
      qsParams.push(`redirect=${encodeURIComponent(redirect)}`);
    }

    if (username) {
      qsParams.push(`username=${encodeURIComponent(username)}`);
    }

    let qsString = "";
    if (qsParams.length > 0) {
      qsString = `?${qsParams.join("&")}`;
    }

    if (typeof window === 'undefined' && ctx) {
      ctx.res.writeHead(302, { Location: `/login${qsString}` });
      ctx.res.end();
    } else {
      Router.push(`/login${qsString}`);
    }
  }

  return { token, tenantID, apiHost, fingerPrint };
}

export const clearCookie = (withLogout) => {
  Storage.clearCookie();

  if (typeof window !== 'undefined' && withLogout) {
    window.localStorage.setItem('logout', Date.now());
  }

  // if (window !== undefined && window !== null && withLogout === true) {
  //   // to support logging out from all windows - using cookie for everything else
  //   window.localStorage.setItem('logout', Date.now());
  // }
};

let logoutInProgress = false;

export const logout = (expired, ctx, logoutMessage = "") => {
    // Prevent multiple simultaneous logout calls
    if (logoutInProgress) {
        console.log('Logout already in progress, skipping duplicate call');
        return;
    }

    logoutInProgress = true;

    clearCookie(true);

    hubspotService.clearChatWidget();

    // Clear React Query cache to prevent old user data from persisting
    if (typeof window !== 'undefined') {
        const pathname = Router.pathname;
        try {
            // Dynamically import to avoid SSR issues and circular dependencies
            import('../pages/_app').then(({queryClient}) => {
                if (queryClient) {
                    queryClient.clear();
                    console.log('React Query cache cleared on logout');
                }
            }).catch(err => {
                console.warn('Failed to clear React Query cache:', err);
                // Navigate anyway even if cache clear fails
            });
        } catch (err) {
            console.warn('Error clearing cache on logout:', err);
            // Navigate anyway even if cache clear fails
        } finally {
            if (!isPathExcluded(pathname, constants.PUBLIC_ROUTE_PREFIXES, constants.PUBLIC_ROUTES_EXACT)) {
                performLogoutNavigation(expired, ctx, logoutMessage)
            }
        }
    } else {
        // console.log('router path', Router?.pathname)
        performLogoutNavigation(expired, ctx, logoutMessage);
    }
};

const isPathExcluded = (pathname, excludedPathPrefixes,exactPaths)=>{
      let excludePrefix = excludedPathPrefixes.some(p => pathname.startsWith(p));
      let excludeExactPath = exactPaths.has(pathname);
    return excludePrefix || excludeExactPath;
}

const performLogoutNavigation = (expired, ctx, logoutMessage) => {
  if (expired === true) {
    if (typeof window === 'undefined' && ctx) {
      ctx.res.writeHead(302, { Location: '/login?token_expired=true&message=' + encodeURIComponent(logoutMessage) });
      ctx.res.end();
    } else if (Router.router) {

      Router.push('/login?token_expired=true&message=' + encodeURIComponent(logoutMessage));
    }
  } else {
    Router.push('/login');
  }
  
  // Reset flag after navigation starts (small delay to prevent race conditions)
  setTimeout(() => {
    logoutInProgress = false;
  }, 500);
}

// TODO: if no token registered for hubspot and then user logs in and it is not reinitialised with token, then remember to reinitialse when it gets minimised or removed

export const withAuthSync = (WrappedComponent, pageRouteParent = null) => {

  let pagePermissions = [];
  let permissionsInError = false;
  if (pageRouteParent) {
    pagePermissions = getPagePermissions(pageRouteParent);
    permissionsInError = pagePermissions === null;
    pagePermissions = permissionsInError ? [] : pagePermissions;
  }

  const usesPermissions = Array.isArray(pagePermissions) && pagePermissions.length > 0;

  const Wrapper = props => {
    const syncLogout = event => {
      if (event.key === 'logout') {
        Router.push('/login');
      }
    };

    useEffect(() => {

      // relocate to https
      if (window.location.href && window.location.href.indexOf("http:") > -1 && window.location.href.indexOf("localhost") < 0) {
        window.location = window.location.href.replace("http:", "https:");
      }

      window.addEventListener('storage', syncLogout);

      return () => {
        window.removeEventListener('storage', syncLogout);
        window.localStorage.removeItem('logout');
      }
    }, []);

    return <WrappedComponent {...props} />
  }

  Wrapper.getInitialProps = async ctx => {
    const { token, tenantID } = auth(ctx);

    if (usesPermissions || permissionsInError) {

      const ssr = typeof window === 'undefined' && ctx;

      let { permissions, subscriptionInfo, hasVan } = ssr ?
        nextCookieContents(ctx) :
        { permissions: PS.getPermissions(), subscriptionInfo: Storage.getCookie(Enums.Cookie.subscriptionInfo), hasVan: Storage.getCookie(Enums.Cookie.hasVan) };

      // Client-side bypass lockout override (SSR path is handled in nextCookieContents)
      if (!ssr && Storage.getCookie('bypassLockout') === 'true' && subscriptionInfo?.AccessStatus === Enums.AccessStatus.LockedWithOutAccess) {
        subscriptionInfo = { ...subscriptionInfo, AccessStatus: Enums.AccessStatus.Live };
      }

      const lockedWithOutAccess = subscriptionInfo?.AccessStatus === Enums.AccessStatus.LockedWithOutAccess;

      const permissionsHasSysAdmin = permissions?.includes(Enums.PermissionName.MasterSystemAdmin);
      const allowedPermissions = lockedWithOutAccess ? lockedWithoutAccessPermissions.map(x => x.value).filter(x => permissions.includes(x)) : permissions;
      if (permissionsHasSysAdmin && lockedWithOutAccess) {
        allowedPermissions.push(Enums.PermissionName.MasterSystemAdmin);
      }

      if (hasVan && !allowedPermissions.includes(Enums.PermissionName.VanManage)) {
        allowedPermissions.push(Enums.PermissionName.VanManage);
      }

      const authorised = PS.hasPermission(pagePermissions, false, allowedPermissions);

      if (!authorised || permissionsInError) {
        if (ssr) {
          ctx.res.writeHead(302, { Location: '/' });
          ctx.res.end();
        } else {
          console.log(pageRouteParent, Router.domainLocales, window.history, window.history.state.url);
          alert(permissionsInError ? "Page permission configuration issue" : "You do not have access to this page.");
          if (typeof window === 'undefined' || window.history.state.url.startsWith('/login')) {
            Router.replace("/", "/");
          } else {
            Router.replace('/');
          }
        }
      }
    }

    const componentProps =
      WrappedComponent.getInitialProps &&
      (await WrappedComponent.getInitialProps(ctx));

    return { ...componentProps, token, tenantID };
  }

  return Wrapper;
}

export const withAuthSyncNew = WrappedComponent => {
  const Wrapper = props => {
    const syncLogout = event => {
      if (event.key === 'logout') {
        Router.push('/login');
      }
    };

    useEffect(() => {

      // relocate to https
      if (window.location.href && window.location.href.indexOf("http:") > -1 && window.location.href.indexOf("localhost") < 0) {
        window.location = window.location.href.replace("http:", "https:");
      }

      window.addEventListener('storage', syncLogout);

      return () => {
        window.removeEventListener('storage', syncLogout);
        window.localStorage.removeItem('logout');
      }
    }, []);

    return <WrappedComponent {...props} />
  }

  return Wrapper;
}

const pagePermissions = {
  "/settings/company": [Enums.PermissionName.EditCompany],
  "/settings/store": [Enums.PermissionName.EditCompany],
  "/settings/job": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/recurringjob": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/customer": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/query": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/quote": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/invoice": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/purchase": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/document": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/asset": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/inventory": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/employee": [Enums.PermissionName.UserManagement],
  "/settings/form": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/webform": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/template": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/task": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/trigger": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/import": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/integration": [Enums.PermissionName.Integrations],
  "/settings/subscription": [Enums.PermissionName.Subscriptions],
  "/settings/payment": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/project": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/signaturetemplate": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/change-password": [Enums.PermissionName.ChangeMyPassword],
  "/job/list": [Enums.PermissionName.Job, Enums.PermissionName.RecurringJob, Enums.PermissionName.Project],
  "/job": [Enums.PermissionName.Job],
  "/appointment": [Enums.PermissionName.Appointment],
  "/query": [Enums.PermissionName.Query],
  "/quote": [Enums.PermissionName.Quote],
  "/invoice": [Enums.PermissionName.Invoice],
  "/purchase": [Enums.PermissionName.PurchaseOrder],
  "/customer/list": [Enums.PermissionName.Customer, Enums.PermissionName.Product],
  "/customer": [Enums.PermissionName.Customer],
  "/inventory/list": [
    Enums.PermissionName.Inventory,
    Enums.PermissionName.StockTransactionsView,
    Enums.PermissionName.StockTake,
    Enums.PermissionName.StockTakeManager,
    Enums.PermissionName.VanManage],
  "/inventory": [Enums.PermissionName.Inventory],
  // "/stock-take": [Enums.PermissionName.StockTake],
  "/stock-take": [Enums.PermissionName.StockTake, Enums.PermissionName.StockTakeManager],
  "/stock-take/create": [Enums.PermissionName.StockTakeManager],
  "/report": [Enums.PermissionName.Reports],
  "/job-schedule": [Enums.PermissionName.RecurringJob],
  "/project": [Enums.PermissionName.Project],
  "/asset": [Enums.PermissionName.Product],
  "/supplier": [Enums.PermissionName.Inventory],
  "/settings/warehouse": [Enums.PermissionName.MasterOfficeAdmin],
  "/settings/van": [Enums.PermissionName.VanManage],
  "/stocktransaction": [Enums.PermissionName.StockTransactionsView],
  "/message": [Enums.PermissionName.Message],
  "/bundle": [Enums.PermissionName.Inventory],
  "/admin": [Enums.PermissionName.MasterOfficeAdmin],
  "/van": []//[Enums.PermissionName.VanManage]
};

export const lockedWithoutAccessPermissions = [
  { key: "UserManagement", value: Enums.PermissionName.UserManagement },
  { key: "Subscriptions", value: Enums.PermissionName.Subscriptions },
  { key: "Owner", value: Enums.PermissionName.Owner },
  { key: "ChangeMyPassword", value: Enums.PermissionName.ChangeMyPassword }
];

const getPagePermissions = (pageRoute) => {
  let permissions = pagePermissions[pageRoute];
  if (!Array.isArray(permissions)) {
    permissions = null;
  }
  return permissions;
};


/**
 * Parse user data from authentication cookie
 */
export const getUserFromCookie = () => {
  try {

    if (!storage.hasCookieValue(Enums.Cookie.token)) {
      return null;
    }

    let email = storage.getCookie(Enums.Cookie.servUserName);
    let fullName = storage.getCookie(Enums.Cookie.servFullName);
    let userID = storage.getCookie(Enums.Cookie.userID);

    let firstName = "";
    let lastName = "";
    if (!!fullName) {
      let nameParts = fullName.split(" ");
      firstName = nameParts[0];
      if (nameParts.length > 1) {
        lastName = nameParts.slice(1).join(" ");
      }
    }

    return {
      email: email,
      firstName: firstName,
      lastName: lastName,
      userId: userID,
      fullName: fullName
    };
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
};



export const identifyClarityUser = () => {
  try {
    const userData = getUserFromCookie();

    if (!userData || !userData.email) {
      return;
    }

    if (typeof window !== 'undefined' && window.clarity) {
      const si = storage.getCookie(Enums.Cookie.subscriptionInfo) || {};
      const companyName = storage.getCookie(Enums.Cookie.servCompanyName);
      const tenantID = storage.getCookie(Enums.Cookie.tenantID);

      window.clarity("identify", userData.email, null, null, userData.fullName);
      if (companyName) {
        window.clarity("set", "company", companyName);
      }
      if (tenantID) {
        window.clarity("set", "tenantID", tenantID);
      }
      if (userData.userId) {
        window.clarity("set", "userID", userData.userId);
      }

      const customerStatus = si.CustomerStatus || si.CustomerStatusEnum;
      if (customerStatus) {
        window.clarity("set", "customerStatus", customerStatus);
      }

      if (si.FirstTrialDate) {
        window.clarity("set", "firstTrialDate", si.FirstTrialDate);
      }
      if (si.AccessStatus) {
        window.clarity("set", "accessStatus", si.AccessStatus);
      }
      if (si.AccessEndDate) {
        window.clarity("set", "accessEndDate", si.AccessEndDate);
      }
      if (si.UserCount) {
        window.clarity("set", "userCount", si.UserCount);
      }
    }
  } catch (error) {
    console.error('Clarity identification error:', error);
  }
}