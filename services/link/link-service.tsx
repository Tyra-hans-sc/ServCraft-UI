import { Link } from "@/interfaces/api/models";
import Fetch from "@/utils/Fetch";

const getLinksForItem = async (itemID: string, linkType?: number | null) => {
    const response = await Fetch.get({
        url: "/Link/LinksForItem",
        params: {
            itemID,
            linkType
        }
    } as any);

    return response.Results as Link[];
};

const saveLink = async (link: Link, toastCtx?: any) => {
    const response = await Fetch.post({
        url: "/Link",
        params: link,
        toastCtx: toastCtx
    } as any);

    if(response.ID) {
        return response as Link;
    } else {
        throw new Error(response.serverMessage || response.message || typeof response === 'string' && response || 'something went wrong')
    }

}

export default {
    getLinksForItem,
    saveLink
};