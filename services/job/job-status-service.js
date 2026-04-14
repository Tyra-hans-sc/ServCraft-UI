import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';

const getFieldFromOption = (jobStatusOptionName, job) => {
    if (!jobStatusOptionName || !job) {
        return null;
    }

    var isString = typeof (jobStatusOptionName) === "string";

    let propName = isString ? jobStatusOptionName : Enums.getEnumStringValue(Enums.JobStatusOptionName, jobStatusOptionName);

    switch (propName) {
        case "Supplier": return "Suppliers";
        case "PurchaseOrder": return "PurchaseOrderNumber";
        case "FaultCause": return "FaultCauseID";
        case "FaultCode": return "FaultCodeID";
        case "FaultReason": return "FaultReasonID";
        case "FaultCauseList": return "FaultCauses";
        case "FaultCodeList": return "FaultCodes";
        case "FaultReasonList": return "FaultReasons";
        case "AssessmentFee": return "AssessmentAmount";
        case "Product": return "ProductID";
        case "EmployeeList": return "Employees";
        case "EmployeeTime": return "TimeSpent";
        case "EmployeeStartTime": return "StartTime";
        case "EmployeeEndTime": return "EndTime";
        case "EmployeeTravel": return "Travel";
        case "Van": return "Vans";
        default: return propName;
    }
};

const validateJob = (job, jobProperties) => {
    let validationItems = [];

    // console.log(job, jobProperties)
    jobProperties.forEach((prop) => {
        let optionName = prop.JobStatusOptionName;
        let optionConfig = prop.OptionConfiguration;

        let val = job[getFieldFromOption(optionName, job)];
        let controlType = Enums.ControlType.Custom;
        let key = Enums.getEnumStringValue(Enums.JobStatusOptionName, optionName);

        // console.log(key, val)
        if (key == Enums.getEnumStringValue(Enums.JobStatusOptionName, Enums.JobStatusOptionName.JobItem) || key == Enums.getEnumStringValue(Enums.JobStatusOptionName, Enums.JobStatusOptionName.Materials)) {
            return;
        }

        if (key === Enums.getEnumStringValue(Enums.JobStatusOptionName, Enums.JobStatusOptionName.CustomFilter1) ||
            key === Enums.getEnumStringValue(Enums.JobStatusOptionName, Enums.JobStatusOptionName.CustomFilter2)) {
            return;
        }

        if (key === Enums.getEnumStringValue(Enums.JobStatusOptionName, Enums.JobStatusOptionName.Supplier)) {
          controlType = Enums.ControlType.MultiSelect;
        }

        if (key === Enums.getEnumStringValue(Enums.JobStatusOptionName, Enums.JobStatusOptionName.CustomNumber1) ||
            key === Enums.getEnumStringValue(Enums.JobStatusOptionName, Enums.JobStatusOptionName.CustomNumber2)) {

            // console.log('number')

            /*if (val) {
            }*/
            controlType = Enums.ControlType.Number;
            let required = optionConfig === Enums.OptionConfiguration.Required;

            let rule = {
                type: controlType,
                value: val,
                key: key,
                required: required,
                mdp: 4,
            };
            validationItems.push(rule);
        } else {
            let required = optionConfig === Enums.OptionConfiguration.Required;
            let rule = {
                type: controlType,
                value: val,
                key: key,
                required: required
            };
            validationItems.push(rule);
        }
    });

    const { isValid, errors } = Helper.validateInputs(validationItems);

    // console.log(isValid, errors);

    return [
        isValid,
        errors
    ];
};

const getJobStatuses = async (onlyActive = false, context = null) => {
    return await Fetch.get({
        url: `/JobStatus?onlyActive=${onlyActive}`,
        ctx: context
    });
};

export default {
    getFieldFromOption,
    validateJob,
    getJobStatuses,
};
