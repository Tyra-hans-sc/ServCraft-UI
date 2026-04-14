import Fetch from '../../utils/Fetch';

const getCounts = async (id) => {
    let countRequest = await Fetch.get({
        url: `/Quote/GetCounts?id=${id}`,
    });
    let result = countRequest.Results;
    let attachmentCount = result.find(x => x.Key == 'Attachments').Value;
    let communicationCount = result.find(x => x.Key == 'Communication').Value;

    return {attachmentCount, communicationCount};
};

const getQuote = async (id) => {
    let quote = await Fetch.get({
        url: `/Quote/${id}`
    })
    return quote
};


export default {
    getCounts,
    getQuote
};
