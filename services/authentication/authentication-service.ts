import config from "@/utils/config";
import storage from "@/utils/storage";
import * as Enums from "@/utils/enums";
import time from "@/utils/time";
import constants from "@/utils/constants";
import scConsole from "@/utils/sc-console";


async function updateAPIEndpoint() {
    
    const tenantID = storage.getCookie(Enums.Cookie.tenantID);
    const username = storage.getCookie(Enums.Cookie.servUserName);
    const connectionType = 1; // ConnectionType.Web

    if (!tenantID || !username) {
        // scConsole.logTest(`logTest`,`updateAPIEndpoint: Not authenticated, skipping...`, {testing: "blah"});
        // scConsole.logTestUnsafe(`logTestUnsafe`,`updateAPIEndpoint: Not authenticated, skipping...`, {testing: "blah"})
        return;
    }

    let lastRefreshed = window.localStorage.getItem(Enums.LocalStorage.LastRefreshedAPI) ?? null;

    if (lastRefreshed && new Date().valueOf() - time.parseDate(lastRefreshed).valueOf() <  constants.managerRefreshAPIIntervalMS ) {
        // scConsole.log()(`updateAPIEndpoint: Already checked at ${lastRefreshed}, skipping...`);
        return;
    }

    window.localStorage.setItem(Enums.LocalStorage.LastRefreshedAPI, time.toISOString(new Date()));

    const res = await fetch(config.managerHost + `/Authentication/APIEndpoint?connectionType=${connectionType}&tenantID=${encodeURIComponent(tenantID)}&username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).catch(e => {
        console.error("updateAPIEndpoint: Catch", e);
    });

    const response = res as Response;
    if (response?.ok) {
        let result = (await response.text()).replaceAll("\"", "");

        if (result && result.length > 0) {
            storage.setCookie(Enums.Cookie.apiHost, result);
        }
        // scConsole.log()(`updateAPIEndpoint: New api string: ${result}`);
    }
    else {
        console.error("updateAPIEndpoint: Response failure", response);
    }
}

export default {
    updateAPIEndpoint
};