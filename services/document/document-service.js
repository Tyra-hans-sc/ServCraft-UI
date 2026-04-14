import Constants from "../../utils/constants";
import Fetch from "../../utils/Fetch";

const getDocumentDefinition = async (ctx = null) => {
    const documentDefinition = await Fetch.get({
        url: "/DocumentDefinition",
        ctx: ctx
    });

    return documentDefinition;
};

const getUseLegacyDocuments = async (ctx = null) => {
    let optionValue = await Fetch.get({
        url: `/Option/GetByOptionName?name=${Constants.optionKeys.LegacyDocuments}`,
        ctx: ctx,
      });

    optionValue = optionValue !== null && optionValue.toLowerCase().trim() === "true";
    return optionValue;
  }


export default {
    getDocumentDefinition,
    getUseLegacyDocuments
};