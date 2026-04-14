import Fetch from '../../utils/Fetch';

const getMessages = async (itemID, pageIndex, pageSize, context = null) => {
  return await Fetch.post({
    url: '/Message/GetMessages',
    params: {
      itemID,
      pageIndex,
      pageSize,
      DisplayMessage: false
    },
    ctx: context,
  } as any);
};

const getMessage = async (id) => {
  return await Fetch.get({
    url: `/Message/${id}`
  } as any);
};

export default {
  getMessages,
  getMessage
};
