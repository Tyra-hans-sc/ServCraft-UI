import Fetch from '../utils/Fetch';
import Helper from '../utils/helper';

const getAllReplacementTags = async (module, context = null) => {
    const request = await Fetch.get({
        url: `/Template/GetReplacementTagList?module=${module}`,
        ctx: context,
    });
    
    return {data: request.Results, total: request.TotalResults};
};

const _extractReplacementTags = (stringToTest) => {
    let regexOpening = /{{/gi;
    let resultOpening = null;
    let openingIndices = [];

    let regexClosing = /}}/gi;
    let resultClosing = null;
    let closingIndices = [];

    while ((resultOpening = regexOpening.exec(stringToTest))) {
        openingIndices.push(resultOpening.index);
    }

    while ((resultClosing = regexClosing.exec(stringToTest))) {
        closingIndices.push(resultClosing.index);
    }

    let words = [];
    for (let i in openingIndices) {
        let word = stringToTest.substr(openingIndices[i] + 2, closingIndices[i] - openingIndices[i] - 2);            
        if (!Helper.isNullOrWhitespace(word)) {
            if (!word.includes("{") && !word.includes("}")) {
                words.push(stringToTest.substr(openingIndices[i] + 2, closingIndices[i] - openingIndices[i] - 2));
            }
        }
    }
    return words;
};

const testForValidReplacementTags = (stringToTest, replacementTags) => {
    
    let tags = replacementTags.map(x => x.Name.toLowerCase());

    let invalidTags = [];
    let excludedTags = ["paymentlink"];

    let words = _extractReplacementTags(stringToTest);

    for (let word of words) {
        let lowerCaseWord = word.toLowerCase();
        if (!tags.includes(lowerCaseWord) && !excludedTags.includes(lowerCaseWord)) {                              
            invalidTags.push("{{" + word + "}}");                
        }
    }

    return invalidTags;
};

const testForValidSubject = (stringToTest) => {
    let words = _extractReplacementTags(stringToTest);
    let tagsNotAllowedForSubject = ["link", "paymentlink", "feedback", "feedbackresponse"];
    let invalidTags = [];

    for (let word of words) {
        let lowerCaseWord = word.toLowerCase();
        if (tagsNotAllowedForSubject.includes(lowerCaseWord)) {
            invalidTags.push("{{" + word + "}}");
        }
    }

    return invalidTags;
};

export default {
    getAllReplacementTags,
    testForValidReplacementTags,
    testForValidSubject,
};
