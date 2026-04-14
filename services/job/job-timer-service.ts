import { ResultResponse } from "@/interfaces/api/models";
import Fetch from "@/utils/Fetch";
import * as Enums from '@/utils/enums';

interface RunningTimersStore {
    timers: any[],
    stamp: number
}

const getRunningTimers = async (force) => {
    let timersResult = await navigator.locks.request("getRunningTimers", async (_) => {
        let timers = getRunningTimersLocal();

        if (!force && Array.isArray(timers)) {
            return timers;
        }

        timers = await getRunningTimersFromAPI();

        if (!Array.isArray(timers)) {
            return null;
        }

        setRunningTimersLocal(timers);

        return timers;
    });

    return timersResult;
}

const setRunningTimersLocal = (timers: any[]) => {

    let store: RunningTimersStore = {
        stamp: new Date().valueOf(),
        timers: timers
    };

    let storeVal = btoa(JSON.stringify(store));

    window.localStorage.setItem(Enums.LocalStorage.RunningTimers, storeVal);
}

const getRunningTimersLocal = (expirationMS = 25_000) => {

    let runningTimersStoreVal = window.localStorage.getItem(Enums.LocalStorage.RunningTimers);

    if (!runningTimersStoreVal || runningTimersStoreVal.length === 0) {
        return null;
    }

    let runningTimersStore = JSON.parse(atob(runningTimersStoreVal)) as RunningTimersStore;

    let now = new Date().valueOf();
    let diff = now - runningTimersStore.stamp;

    if (diff > expirationMS) {
        return null;
    }

    return runningTimersStore.timers;
}

const getRunningTimersFromAPI = async () => {
    const getResult = await Fetch.get({
        url: "/JobTime/RunningTimers",
        params: {}
    }) as ResultResponse<any>;

    return getResult.Results;
}


export default {
    getRunningTimers
}