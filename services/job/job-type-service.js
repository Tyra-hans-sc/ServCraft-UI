import Fetch from '../../utils/Fetch';

const getJobTypes = async (context = null) => {
    return await Fetch.get({
        url: '/JobType',
        ctx: context
    });
};

const getFilteredJobTypes = async (pageSize, showClosed, context = null) => {
    return await Fetch.post({
        url: '/JobType/GetJobTypes',
        params: {
          ShowClosed: showClosed,
          PageSize: pageSize
        },
        ctx: context,
      });
};

export default {
    getJobTypes,
    getFilteredJobTypes,
};
