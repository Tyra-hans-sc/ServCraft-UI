import Fetch from '../../utils/Fetch';

const getComments = async (itemID, pageIndex, pageSize, context = null) => {
    return await Fetch.post({
        url: '/Comment/GetComments',
        params: {
          itemID,
          pageIndex: pageIndex ? pageIndex : 0,
          pageSize,
        },
        ctx: context,
    });    
};

const createComment = async (commentText, module, itemID, storeID, isPublic) => {
    module = !isNaN(parseInt(module)) ? parseInt(module) : module;
    
    let params = {
        commentText,
        itemID,
        module,
        storeID,
        CustomerView: isPublic
    };

    await Fetch.post({
        url: '/Comment',
        params,
    });
};

const updateComment = async (comment) => {
    let commentResult = await Fetch.put({
        url: '/Comment',
        params: comment,
    });

    return commentResult;
};

export default {
    getComments,
    createComment,
    updateComment
};
