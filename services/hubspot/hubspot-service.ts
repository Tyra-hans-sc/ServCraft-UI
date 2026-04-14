import Fetch from "@/utils/Fetch";
import storage from "@/utils/storage";
import * as Enums from "@/utils/enums";
import helper from "@/utils/helper";
import { getUserFromCookie } from "@/utils/auth";

interface HubSpotTokenStore {
    token: string
    expiration: string
}

const refreshHubSpotToken = async () => {

    let user = getUserFromCookie();

    if (!user) return null;
    if (user.email && user.email.trim().toLowerCase() === "admin") return null;

    let token = await Fetch.get({
        url: "/HubSpot/VisitorIdentificationToken",
    });

    if (!token) return null;

    let payload = helper.parseJwtPayload(token);

    let tokenLifetimeSeconds = payload.exp - payload.iat;

    let tokenExpiration = new Date();
    tokenExpiration.setSeconds(tokenExpiration.getSeconds() + tokenLifetimeSeconds - (60 * 5)); //expire 5 minutes before actual expiry

    return {
        token: token,
        expiration: tokenExpiration.toISOString()
    } as HubSpotTokenStore;
}

const getLocalHubSpotToken = () => {

    let item = window.localStorage.getItem(Enums.LocalStorage.HubSpotToken);
    if (!!item) {
        return JSON.parse(item) as HubSpotTokenStore;
    }

    return null;
}

const isTokenExpired = (token: HubSpotTokenStore) => {

    if (!token) return true;

    var expirationDate = new Date(token.expiration);
    var now = new Date();

    return now.valueOf() >= expirationDate.valueOf();
}

const getHubSpotToken = async () => {

    // check if logged in, if not, return null
    if (!storage.hasCookieValue(Enums.Cookie.token)) return null;

    // get local token
    let localToken = getLocalHubSpotToken();

    // if expired, invalidate
    if (!!localToken && isTokenExpired(localToken)) {
        localToken = null;
    }

    // retrieve new token if not present
    if (!localToken) {
        localToken = await refreshHubSpotToken();

        // store in local storage
        if (!!localToken && typeof window !== "undefined") {
            window.localStorage.setItem(Enums.LocalStorage.HubSpotToken, JSON.stringify(localToken));
        }
    }

    return localToken?.token ?? null;
}

const initialiseChatWidget = async () => {
    let token = await getHubSpotToken();
    let userName = storage.getCookie(Enums.Cookie.servUserName);

    let windowAny = window as any;

    if (!!token && !!userName) {
        if (!windowAny.hsConversationsSettings) {
            windowAny.hsConversationsSettings = {
                loadImmediately: false
            };
        }
        windowAny.hsConversationsSettings.identificationEmail = userName;
        windowAny.hsConversationsSettings.identificationToken = token;
    }
    else if (windowAny.hsConversationsSettings) {
        windowAny.hsConversationsSettings.identificationEmail = undefined;
        windowAny.hsConversationsSettings.identificationToken = undefined;
    }

    // Check if HubSpotConversations is loaded before trying to access widget
    if (windowAny.HubSpotConversations?.widget) {
        windowAny.HubSpotConversations.widget.load();
    }
}

const reInitialiseChatWidget = async () => {
    await initialiseChatWidget();
    let windowAny = window as any;
    let widgetHeight = document.getElementById("hubspot-messages-iframe-container")?.offsetHeight;

    // check if the widget is minimised (the height will be small) and if so, reset and reload it, otherwise do nothing as it will mess up the user if they are in the middle of a chat
    if (widgetHeight && widgetHeight < 150 && windowAny.HubSpotConversations?.resetAndReloadWidget) {
        windowAny.HubSpotConversations.resetAndReloadWidget();
    }
};

const clearChatWidget = async () => {

    let windowAny = window as any;

    // wait for HubSpot Conversations to be available
    let count = 0;
    while (!windowAny.HubSpotConversations && count < 50) {
        await helper.waitABit(100);
        count++;
    }

    if (windowAny.HubSpotConversations) {
        // clear local token
        if (windowAny.hsConversationsSettings) {
            windowAny.hsConversationsSettings.identificationEmail = undefined;
            windowAny.hsConversationsSettings.identificationToken = undefined;
        }
        windowAny.HubSpotConversations.resetAndReloadWidget();
    }
}


const loadHubspot = async () => {

    if (typeof window === "undefined") return;


    const _hsp = ((window as any)._hsp = (window as any)._hsp || []);
    _hsp.push(["addEnabledFeatureGates", []]);

    (window as any).hsConversationsSettings = {
        loadImmediately: false
    };

    (window as any).hsConversationsOnReady = (window as any).hsConversationsOnReady || [];
    (window as any).hsConversationsOnReady.push(async () => {
        console.log('HubSpot Conversations ready');
        // token stuff here
        initialiseChatWidget();
    });

    const loadHubspotScript = (function (t, e, r) {
        if (!(document as any).getElementById(t)) {
            const n = (document as any).createElement("script");
            for (const a in ((n.src = "https://js.usemessages.com/conversations-embed.js"), (n.type = "text/javascript"), (n.id = t), r)) r.hasOwnProperty(a) && n.setAttribute(a, r[a]);
            const i = (document as any).getElementsByTagName("script")[0];
            i.parentNode.insertBefore(n, i);


        }
    });

    loadHubspotScript("hubspot-messages-loader", 0, { "data-loader": "hs-scriptloader", "data-hsjs-portal": 8236184, "data-hsjs-env": "prod", "data-hsjs-hublet": "na1" });

}

export default {
    loadHubspot,
    reInitialiseChatWidget,
    clearChatWidget
}

