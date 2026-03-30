import React, { useState, useEffect, forwardRef, useImperativeHandle, useContext } from "react";
import * as Enums from '../../utils/enums'
import SelectInput from "../select-input";
import Checkbox from "../checkbox";
import RadioInputGroup from "../radio-input-group";
import Fetch from "../../utils/Fetch";
import KendoDatePicker from '../kendo/kendo-date-picker';
import Time from "../../utils/time";

const ReportFilterInputOld = forwardRef((props, ref) => {

    const [template, setTemplate] = useState(props.template);
    const [inputValue, setInputValue] = useState(props.template.DefaultValue);
    const [inputType, setInputType] = useState(null);
    const [inputDescription, setInputDescription] = useState(props.template.DefaultValue);
    const [selectSource, setSelectSource] = useState(null); // "API" or "Enum"
    const [selectHelper, setSelectHelper] = useState(null); // "<API endpoint>" or <Enum.Name>
    const [selectOptions, setSelectOptions] = useState([]);
    const [selectType, setSelectType] = useState(null); // for enum, enum, otherwise other types need to go here
    const [selectMultiple, setSelectMultiple] = useState(false);
    const [selectNoInput, setSelectNoInput] = useState(false);
    const [nullable, setNullable] = useState(true);
    const [selectParams, setSelectParams] = useState({});
    const [selectSearchMethod, setSelectSearchMethod] = useState("post");
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [label, setLabel] = useState("");
    const [parentSelectValue, setParentSelectValue] = useState(undefined);
    const [formInputs, setFormInputs] = useState([]);

    const updateValue = (val, desc) => {
        console.log("updateValue", val);
        setInputValue(val);
        setInputDescription(desc);
        props.updateValue(template.Name, val);
    };

    useEffect(() => {
        console.log("formInputs changed " + template.Name);
        console.log(formInputs);

        if (!formInputs) return;
        let parentSelVal = undefined;
        let param = {...selectParams};
        let paramName = "";
        if (template.Name === "InventorySubcategory") {
            parentSelVal = formInputs.InventoryCategory;
            paramName = "CategoryIDList";
            param[paramName] = parentSelVal ? [parentSelVal] : [];
        } else if (template.Name === "QueryStatus") {
            parentSelVal = formInputs.QueryType;
            paramName = "QueryTypeID";
            param[paramName] = parentSelVal;
        }

        if (parentSelVal !== parentSelectValue) {
            console.log("CHANGE ON PARENT DETECTED");
            setInputValue(null);
            setInputDescription("");
            setParentSelectValue(parentSelVal);
            getAPIOptions("", {key: paramName, value: param[paramName]});
        }
    }, [formInputs]);

    const checkCascade = (formInps) => {
        setFormInputs(formInps);
    };

    useImperativeHandle(ref, () => {
        return {
            checkCascade: checkCascade
        };
    });

    useEffect(() => {
        // set up the component here for getting initial values

        let inpTyp = null; //Enums.ControlType.Select;
        let selSrc = null; //"Enum";
        let selTyp = null; //"enum";
        let selHlp = null; //Enums.ControlType;
        let selPrms = {};
        let srchMth = "post";

        switch (template.Name) {
            case "CollectionArea": // not implemented
                // inpTyp = Enums.ControlType.Select;
                // selSrc = "API";
                // selTyp = "collection-area";
                // selHlp = "/Collection/GetCollectionAreas";
                // setLabel("Collection Area");
                break;
            case "CollectionStatus": // not used
                // inpTyp = Enums.ControlType.Select;
                // selSrc = "Enum";
                // selTyp = "enum-proper";
                // selHlp = Enums.CollectionStatus;
                // setLabel("Collection Status");
                break;
            case "CollectionSubType": // not used
                // inpTyp = Enums.ControlType.Select;
                // selSrc = "Enum";
                // selTyp = "enum-proper";
                // selHlp = Enums.CollectionSubType;
                // setLabel("Collection Subtype");
                break;
            case "CollectionType": // not used
                // inpTyp = Enums.ControlType.Select;
                // selSrc = "Enum";
                // selTyp = "enum-proper";
                // selHlp = Enums.CollectionType;
                // setLabel("Collection Type");
                break;
            case "Concluded":
                inpTyp = Enums.ControlType.Radio;
                setSelectOptions([
                    { key: "Show All", value: null },
                    { key: "Concluded", value: true },
                    { key: "Not Concluded", value: false }
                ]);
                setLabel("Concluded");
                break;
            case "Customer":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "customer";
                selHlp = "/Customer/GetCustomers";
                setLabel("Customer");
                break;
            case "CustomerGroup":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "customer-group";
                selHlp = "/CustomerGroup/GetCustomerGroups";
                setLabel("Customer Group");
                break;
            case "CustomerType":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "customer-type";
                selHlp = "/CustomerType/GetCustomerTypes";
                setLabel("Customer Type");
                break;
            case "Employee":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "employee";
                selHlp = "/Employee/GetEmployees";
                selPrms = {
                    IncludeDisabled: false
                };
                setLabel("Employee");
                break;
            case "FaultReason":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "fault-reason";
                selHlp = "/FaultReason/GetFaultReasons";
                setLabel("Fault Reason");
                break;
            case "Inventory":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "inventory";
                selHlp = "/Inventory/GetInventories";
                selPrms = {
                    IncludeClosed: false
                }
                setLabel("Inventory");
                break;
            case "InventoryCategory":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "inventorycategory";
                selHlp = "/InventoryCategory/GetInventoryCategories";
                setLabel("Inventory Category");
                break;
            case "InventorySubcategory":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "inventorysubcategory";
                selHlp = "/InventorySubcategory/GetInventoryCategories";
                setLabel("Inventory Subcategory");
                break;
            case "JobCardStatus":
                inpTyp = Enums.ControlType.MultiSelect;
                selSrc = "API";
                selTyp = "status";
                selHlp = "/JobStatus";
                srchMth = "get";
                setInputValue([]);
                setLabel("Job Card Status");
                break;
            case "QueryStatus":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "query-status";
                selHlp = "/QueryStatus/GetQueryStatus";
                setLabel("Query Status");
                break;
            case "QueryType":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "query-type";
                selHlp = "/QueryType/GetQueryTypes";
                setLabel("Query Type");
                break;
            case "QuoteStatus":
                inpTyp = Enums.ControlType.Select;
                selSrc = "Enum";
                selTyp = "enum-proper";
                selHlp = Enums.QuoteStatus;
                setLabel("Quote Status");
                break;
            case "Show":
                inpTyp = Enums.ControlType.Radio;
                setSelectOptions([
                    { key: "All", value: null },
                    { key: "Open", value: false },
                    { key: "Closed", value: true }
                ]);
                setLabel("Show");
                break;
            case "ShowClosed":
                inpTyp = Enums.ControlType.Checkbox;
                setInputValue(false);
                setLabel("Show Closed");
                break;
            case "Store":
                inpTyp = Enums.ControlType.MultiSelect;
                selSrc = "API";
                selTyp = "store";
                selHlp = "/Store/GetStores";
                setInputValue([]);
                selPrms = {
                    IncludeClosed: false
                };
                setLabel("Store");
                break;
            case "Supplier":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "supplier";
                selHlp = "/Supplier";
                srchMth = "get";
                selPrms = { pageSize: 1000 };
                setLabel("Supplier");
                break;
            case "Technician":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "employee";
                selHlp = "/Employee/GetEmployees";
                selPrms = {
                    IncludeDisabled: false
                };
                setLabel("Technician");
                break;
            case "UnitCount":
                inpTyp = Enums.ControlType.Select;
                selSrc = "List";
                setSelectOptions([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
                setSelectNoInput(true);
                selTyp = "enum"; // using this as it behaves the same
                setLabel("Unit Count");
                break;
            case "UserType":
                inpTyp = Enums.ControlType.Radio;
                setSelectOptions([
                    { key: "All", value: null },
                    { key: Enums.getEnumStringValue(Enums.UserType, Enums.UserType.Employee), value: Enums.UserType.Employee },
                    { key: Enums.getEnumStringValue(Enums.UserType, Enums.UserType.System), value: Enums.UserType.System },
                    { key: Enums.getEnumStringValue(Enums.UserType, Enums.UserType.Communication), value: Enums.UserType.Communication }
                ]);
                setLabel("Comment Type");
                break;
            case "StartDate":
                inpTyp = Enums.ControlType.Date;
                setLabel("Start Date");
                break;
            case "EndDate":
                inpTyp = Enums.ControlType.Date;
                setLabel("End Date");
                break;
        }

        // do this last to get options
        setSelectSearchMethod(srchMth);
        setSelectParams(selPrms);
        setSelectType(selTyp);
        setSelectSource(selSrc);
        setSelectHelper(selHlp);
        setInputType(inpTyp);
    }, []);

    // to get API options
    const getAPIOptions = async (searchPhrase, other) => {
        let params = selectParams;
        if (selectType === "customer" || selectType === "inventory") {
            params.searchPhrase = searchPhrase;
        }
        if (other) {
            params[other.key] = other.value; 
        }
        let meth = selectSearchMethod === "post" ? Fetch.post : selectSearchMethod === "get" ? Fetch.get : null;
        let response = await meth({
            url: selectHelper,
            params: selectParams
        });
        setSelectOptions(response.Results);
    };

    // to get Enum options
    const getEnumOptions = () => {
        let enumItems = Enums.getEnumItemsVD(selectHelper);
        setSelectOptions(enumItems);
    };

    useEffect(() => {
        if (!inputType || !selectSource || !selectHelper || !selectType) return;

        if (inputType === Enums.ControlType.Select) {
            if (selectSource === "API") {
                setSelectNoInput(false);
                getAPIOptions();
            } else if (selectSource === "Enum") {
                setSelectNoInput(true);
                getEnumOptions();
            }
        }


    }, [inputType, selectSource, selectHelper, selectType]);

    const updateSelectedValue = (val, desc) => {
        updateValue(val, desc);
    };

    const updateSelectListValue = (val) => {
        // for enums

        console.log("updateSelectListValue", val, "inputValue", inputValue);

        let valueToSave = val;
        let description = val;


        if (selectType === "enum-proper") {
            valueToSave = val.value;
            description = getSelectDescription(val.value);
        } else if (selectType === "enum") {
            description = getSelectDescription(val);
        } else if (inputType === Enums.ControlType.MultiSelect) {
            // multiselect
            valueToSave = [...inputValue];
            let valID = val.ID,
                valIdx = valueToSave.indexOf(valID),
                selOpts = [...selectedOptions];

            console.log("valID", valID, "valIdx", valIdx);
            if (valIdx > -1) {
                valueToSave.splice(valIdx, 1);
                selOpts.splice(valIdx, 1);
            } else {
                valueToSave.push(valID);
                selOpts.push(val);
            }
            setSelectedOptions(selOpts);
            description = getSelectDescription(selOpts);
        } else {
            valueToSave = val.ID;
            description = getSelectDescription(val);
        }


        updateSelectedValue(valueToSave, description);
    };

    const updateRadioValue = (val) => {
        if (template.Name === "UserType") {
            updateValue(val ? parseInt(val) : null);
        } else {
            updateValue(val ? val.toString().toLowerCase() === "true" : null);
        }
    };

    const getSelectDescription = (val) => {
        // for enums
        if (val === undefined || val === null) return "";
        let desc = "";
        if (selectSource === "Enum") {
            desc = Enums.getEnumStringValue(selectHelper, val);
        } else if (selectSource === "List") {
            desc = val;
        } else if (selectSource === "API") {
            switch (selectType) {
                case "employee":
                    desc = val.FirstName + " " + val.LastName;
                    break;
                case "customer":
                    desc = val.CustomerName;
                    break;
                case "status":
                    desc = val.map(function (opt) {
                        return opt.Description;
                    }).join(", ");
                    break;
                case "store":
                    desc = val.map(function (opt) {
                        return opt.Name;
                    }).join(", ");
                    break;
                default:
                    desc = val.Description;
                    break;
            }
        }

        console.log(desc);
        return desc;
    };

    return (
        <div className="row">
            {/* <div>
                {template.Name}:
            </div> */}
            <div className="row">
                {inputType === Enums.ControlType.Select || inputType === Enums.ControlType.MultiSelect ? <>
                    <SelectInput label={label} value={inputDescription} options={selectOptions} type={selectType} setSelected={(e) => { updateSelectListValue(e) }}
                        noInput={selectNoInput} multiSelect={inputType === Enums.ControlType.MultiSelect} searchFunc={getAPIOptions}
                        selectedOptions={selectedOptions} useKeyUp={true} />
                </> : <></>}
                {inputType === Enums.ControlType.Checkbox ? <>
                    <div className="margin-top16">
                        <Checkbox label={label} checked={inputValue} changeHandler={(e) => { updateSelectedValue(!inputValue); }} />
                    </div>
                </> : <></>}
                {inputType === Enums.ControlType.Radio ? <>
                    <div className="margin-top16">
                        <RadioInputGroup label={label} options={selectOptions} name={template.Name} changeHandler={(e) => { updateRadioValue(e); }} />
                    </div>
                </> : <></>}
                {inputType === Enums.ControlType.Date ? <>
                    <KendoDatePicker label={label} value={inputValue} name={template.Name} changeHandler={(e) => { updateSelectedValue(Time.toISOString(Time.updateTime(e, Time.today()))); }} />
                </> : <></>}
            </div>
            <style jsx>{`
                    .margin-top16 {
                        margin-top: 16px;
                    }
            `}</style>
        </div>
    );
});


export default ReportFilterInputOld;

/*
Name                    InputType   DataType        Implementation                          Done
CollectionArea          select      Guid?           API
CollectionStatus        select      Guid?           Enum
CollectionSubType       select      Guid?           Enum
CollectionType          select      Guid?           Enum
Concluded               select      Guid?           Show All, Concluded, Not Concluded
Customer                select      Guid?           API
CustomerGroup           select      Guid?           API
CustomerType            select      Guid?           API
Employee                select      Guid?           API
FaultReason             select      Guid?           API
Inventory               select      Guid            API
Inventory               select      Guid?           API
InventoryCategory       select      Guid?           API
InventorySubcategory    select      Guid?           API
JobCardStatus           multiselect List<Guid>      API
QueryStatus             select      Guid?           API
QueryType               select      Guid?           API
QuoteStatus             select      Guid?           Enum
Show                    radio       bool            Show All, Open, Closed
ShowClosed              boolean     bool            Boolean
Store                   select      Guid?           API
Supplier                select      Guid?           API
Technician              select      Guid?           API (All employees???)
UnitCount               select      int             Numbers from 0 - 50 in intervals of 5
UserType                radio       int             Enum (All, User, System, Communication)
StartDate   NOT CONFIGURED IN CONFIG TEMPLATE DB TABLE
EndDate     NOT CONFIGURED IN CONFIG TEMPLATE DB TABLE
*/
