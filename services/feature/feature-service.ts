import { Feature, ResultResponse } from "@/interfaces/api/models";
import Fetch from "@/utils/Fetch";
import storage from "@/utils/storage";
import * as Enums from "@/utils/enums";
import helper from "@/utils/helper";

type FeatureStore = {
    feature: Feature | null
    expiration: number
}

const currentlyGettingCache: any = {};

const getStorage: (code: string) => Storage = (code: string) => {
    switch (code) {
        default:
            return window.sessionStorage;
    }
}

const getFeatureFromAPI: (code: string, invalidate?: boolean, ctx?: any) => Promise<Feature | null> = async (code: string, invalidate?: boolean, ctx?: any) => {

    let feature = await Fetch.get({
        url: `/Feature?code=${code}&invalidate=${invalidate === true}`,
        ctx: ctx
    } as any);

    return !!feature ? feature as Feature : null;
};

const getFeaturesFromAPI: (invalidate?: boolean, ctx?: any) => Promise<Feature[]> = async (invalidate?: boolean, ctx?: any) => {

    let featureResponse = await Fetch.get({
        url: `/Feature/List?invalidate=${invalidate === true}`,
        ctx: ctx
    }) as ResultResponse<Feature>;

    return featureResponse.Results;
};

const getFeatureKey: (code: string) => string = (code: string) => {
    return `FK_${code}`;
};

const getLocalFeature: (code: string) => { feature: Feature | null, hasLocal: boolean } = (code: string) => {
    if (typeof window !== "undefined") {
        let featureKey = getFeatureKey(code);
        let item = getStorage(code).getItem(featureKey);
        if ((item?.length ?? 0) > 0) {
            let data = atob(item as string);
            let featureStore: FeatureStore = JSON.parse(data);
            if (featureStore.expiration > new Date().valueOf()) {
                return {
                    feature: featureStore.feature,
                    hasLocal: true
                };
            }
        }
    }
    return { feature: null, hasLocal: false }
}

const setLocalFeature: (code: string, feature: Feature | null, expirationMinutes?: number) => void = (code: string, feature: Feature | null, expirationMinutes: number = 30) => {
    if (typeof window === "undefined") return;

    let featureStore: FeatureStore = {
        feature: feature,
        expiration: new Date().valueOf() + (expirationMinutes * 60_000)
    };

    let featureKey = getFeatureKey(code);
    let data = btoa(JSON.stringify(featureStore));
    getStorage(code).setItem(featureKey, data);
};

const getFeature: (code: string, invalidate?: boolean, ctx?: any) => Promise<Feature | null> = async (code: string, invalidate?: boolean, ctx?: any) => {
    // if not logged in, no features to return
    if (!storage.hasCookieValue(Enums.Cookie.token)) return null;

    var { feature, hasLocal } = getLocalFeature(code);

    if (hasLocal) return feature;

    feature = await navigator.locks.request(`customerFeatureCache`, async (_) => {
        var { feature, hasLocal } = getLocalFeature(code);

        if (!storage.hasCookieValue(Enums.Cookie.token)) return null;

        if (!hasLocal) {
            let features = await getFeaturesFromAPI(invalidate, ctx);
            features.forEach(f => setLocalFeature(f.FeatureCode, f));
            return features.find(f => f.FeatureCode === code) ?? null;
        }
        return !!feature ? feature as Feature : null;
    });

    return !!feature ? feature as Feature : null;
};

const hasFeature: (code: string, invalidate?: boolean, ctx?: any) => Promise<boolean> = async (code: string, invalidate?: boolean, ctx?: any) => {

    let feature = await getFeature(code, invalidate, ctx);

    return !!feature;
};

export default {
    getFeature,
    hasFeature
};