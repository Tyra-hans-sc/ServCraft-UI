import cookie from 'js-cookie';
import * as Enums from './enums';
import helper from './helper';
import { getCookies } from "cookies-next";

const encodeKeys = [Enums.Cookie.permissions, Enums.Cookie.subscriptionInfo, Enums.Cookie.blockMessage];

const setCookie = (key, value, duration = 7) => {
    // remove industry list as it is not important after signup
    if (key === Enums.Cookie.subscriptionInfo) {
        if (value.SetupComplete) {
            value = { ...value, IndustryList: [] };
        }
        
        // override LockedWithOutAccess to Live so all downstream checks see full access
        if (getCookie('bypassLockout') === 'true'
            && value?.AccessStatus === Enums.AccessStatus.LockedWithOutAccess) {
            value = { ...value, AccessStatus: Enums.AccessStatus.Live };
        }
    }
    let setVal = value;
    if (encodeKeys.indexOf(key) > -1) {
        const jString = JSON.stringify(value);
        setVal = btoa(jString);
    }
    cookie.set(key, setVal, { expires: duration, secure: true, sameSite: 'lax' });
};

const getCookie = (key) => {
    let retVal = cookie.get(key);
    if (encodeKeys.indexOf(key) > -1) {
        if (retVal) {
            const jString = atob(retVal);
            retVal = JSON.parse(jString);
        } else {
            retVal = null;
        }
    }
    return retVal;
};

/** function that clears all app cookies **/
const clearCookie = () => {
    console.log('clearing cookie', cookie)
    let cookieJson = getCookies();
    if (cookieJson) {
        Object.keys(cookieJson).map(key => {
            cookie.remove(key);
        });
    }
};

const hasCookieValue = (key) => {
    return !helper.isNullOrWhitespace(getCookie(key));
}

export default {
    setCookie,
    getCookie,
    clearCookie,
    hasCookieValue
};
