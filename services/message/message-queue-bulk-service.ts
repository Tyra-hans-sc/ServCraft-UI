import Fetch from "@/utils/Fetch";

const getMessageQueueBulk = async (id: string, toastCtx?: any) => {
    const result = await Fetch.get({
        url: `/MessageQueueBulk/${id}`,
        toastCtx: toastCtx
    } as any);

    return result;
}

const saveMessageQueueBulk = async (messageQueueBulk: any, toastCtx?: any) => {
    const result = await Fetch.post({
        url: `/MessageQueueBulk`,
        params: {
            MessageQueueBulk: messageQueueBulk
        },
        toastCtx: toastCtx
    } as any);

    return result;
}

const estimateMessageQueueBulk = async (messageQueueBulk: any, toastCtx?: any) => {
    const result = await Fetch.post({
        url: `/MessageQueueBulk/Estimate`,
        params: {
            MessageQueueBulk: messageQueueBulk
        },
        toastCtx: toastCtx
    } as any);

    return result;
}

const getMessageQueueBulkStats = async (id: string, toastCtx?: any) => {
    const result = await Fetch.get({
        url: `/MessageQueueBulk/Stats/${id}`,
        toastCtx: toastCtx
    } as any);

    return result;
}

const retryMessageQueueBulkFailedMessageQueues = async (id: string, toastCtx?: any) => {
    const result = await Fetch.get({
        url: `/MessageQueueBulk/RetryFailedMessages/${id}`,
        toastCtx: toastCtx
    } as any);

    return result;
}

const getMessageQueueReplies = async (id: string, toastCtx?: any) => {
    const result = await Fetch.get({
        url: `/MessageQueueReply/MessageQueueBulk/${id}`,
        toastCtx: toastCtx
    } as any);

    return result;
}

export default {
    getMessageQueueBulk,
    saveMessageQueueBulk,
    estimateMessageQueueBulk,
    getMessageQueueBulkStats,
    retryMessageQueueBulkFailedMessageQueues,
    getMessageQueueReplies
};