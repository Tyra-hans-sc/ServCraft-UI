import Fetch from "@/utils/Fetch";

const getWorkflow = async (workflowID: string, toastCtx: any = undefined) => {
    const workflow = await Fetch.get({
        url: `/Workflow/${workflowID}`,
        toastCtx: toastCtx
    } as any);
    return workflow;
};

export default {
    getWorkflow
};