import React, { useState, useEffect, forwardRef, useImperativeHandle, useContext } from "react";
import * as Enums from '../../utils/enums'
import SelectInput from "../select-input";
import Checkbox from "../checkbox";
import RadioInputGroup from "../radio-input-group";
import Fetch from "../../utils/Fetch";
import KendoDatePicker from '../kendo/kendo-date-picker';
import KendoMultiSelect from '../kendo/kendo-multiselect';
import Time from "../../utils/time";
import Storage from '../../utils/storage';
import SCDatePicker from "../sc-controls/form-controls/sc-datepicker";
import SCCheckbox from "../sc-controls/form-controls/sc-checkbox";
import SCComboBox from "../sc-controls/form-controls/sc-combobox";
import SCMultiSelect from "../sc-controls/form-controls/sc-multiselect";
import SCRadioButtonGroup from "../sc-controls/form-controls/sc-radio-button-group";
import SCRadioButton from "../sc-controls/form-controls/sc-radio-button";
import helper from "../../utils/helper";
import SCDropdownList from "../sc-controls/form-controls/sc-dropdownlist";
import StoreMultiSelector from "../selectors/store/store-multiselector";
import CustomerSelector from "../selectors/customer/customer-selector";
import InventorySelector from "../selectors/inventory/inventory-selector";
import EmployeeSelector from "../selectors/employee/employee-selector";
import JobStatusMultiSelector from "../selectors/jobstatus/jobstatus-multiselector";
import QueryTypeSelector from "../selectors/query/query-type-selector";
import QueryStatusSelector from "../selectors/query/query-status-selector";
import SupplierSelector from "../selectors/supplier-selector";

const ReportFilterInput = ({ template, updateValue, queryType, startDate }) => {

    const [inputValue, setInputValue] = useState(template.DefaultValue);
    const [inputType, setInputType] = useState(null);
    const [inputDescription, setInputDescription] = useState(template.DefaultValue);
    const [selectSource, setSelectSource] = useState(null); // "API" or "Enum"
    const [selectHelper, setSelectHelper] = useState(null); // "<API endpoint>" or <Enum.Name>
    const [selectOptions, setSelectOptions] = useState();
    const [selectType, setSelectType] = useState(null); // for enum, enum, otherwise other types need to go here
    const [selectMultiple, setSelectMultiple] = useState(false);
    const [selectNoInput, setSelectNoInput] = useState(true);
    const [nullable, setNullable] = useState(true);
    const [selectParams, setSelectParams] = useState({});
    const [selectSearchMethod, setSelectSearchMethod] = useState("post");
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [label, setLabel] = useState("");
    const [placeholder, setPlaceholder] = useState(undefined)
    const [parentSelectValue, setParentSelectValue] = useState(undefined);
    const [dataItemKey, setDataItemKey] = useState("key");
    const [textField, setTextField] = useState("value");

    const updateValueInternal = (val, desc) => {
        setInputValue(val);
        setInputDescription(desc);
        updateValue(template.Name, val);
    };

    useEffect(() => {

        let parentSelVal = undefined;
        let param = { ...selectParams };
        let paramName = "";
        if (template.Name === "QueryStatus") {
            parentSelVal = queryType;
            paramName = "QueryTypeID";
            param[paramName] = parentSelVal;
        }
        else if (template.Name === "EndDate") {
            if (inputValue && startDate && inputValue < startDate) {
                setInputValue(null);
            }
        }

        if (parentSelVal !== parentSelectValue) {
            setInputValue(null);
            setInputDescription("");
            setParentSelectValue(parentSelVal);
            getAPIOptions("", { key: paramName, value: param[paramName] });
        }
    }, [queryType, startDate]);

    useEffect(() => {
        setupComponent();
    }, []);

    const setupComponent = async () => {
        // set up the component here for getting initial values

        let storeIDList = [];
        if (template.Name === "Employee") {
            let storeIDresult = await Fetch.get({
                url: "/Store/GetEmployeeStores",
                params: {
                    employeeID: Storage.getCookie(Enums.Cookie.employeeID),
                    searchPhrase: ""
                }
            });
            storeIDList = storeIDresult.Results;
        }

        let inpTyp = null; //Enums.ControlType.Select;
        let selSrc = null; //"Enum";
        let selTyp = null; //"enum";
        let selHlp = null; //Enums.ControlType;
        let selPrms = {};
        let srchMth = "post";

        switch (template.Name) {
            // case "Customer":
            //     inpTyp = Enums.ControlType.Select;
            //     selSrc = "API";
            //     selTyp = "customer";
            //     selHlp = "/Customer/GetCustomers";
            //     setLabel("Customer");
            //     setSelectNoInput(false);
            //     setDataItemKey("ID");
            //     setTextField("CustomerName");
            //     break;
            case "CustomerGroup":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "customer-group";
                selHlp = "/CustomerGroup/GetCustomerGroups";
                setLabel("Customer Group");
                setPlaceholder("Select customer group");
                setDataItemKey("ID");
                setTextField("Description");
                break;
            case "CustomerType":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "customer-type";
                selHlp = "/CustomerType/GetCustomerTypes";
                setLabel("Customer Type");
                setPlaceholder("Select customer type");
                setDataItemKey("ID");
                setTextField("Description");
                break;
            // case "Employee":
            //     inpTyp = Enums.ControlType.Select;
            //     selSrc = "API";
            //     selTyp = "employee";
            //     selHlp = "/Employee/GetEmployees";
            //     selPrms = {
            //         IncludeDisabled: false,
            //         StoreIDList: storeIDList
            //     };
            //     setLabel("Employee");
            //     setDataItemKey("ID");
            //     setTextField("FullName");
            //     break;
            case "FaultReason":
                inpTyp = Enums.ControlType.Select;
                selSrc = "API";
                selTyp = "fault-reason";
                selHlp = "/FaultReason/GetFaultReasons";
                setLabel("Fault Reason");
                setPlaceholder("Select fault reason")
                setDataItemKey("ID");
                setTextField("Description");
                break;
            // case "Inventory":
            //     inpTyp = Enums.ControlType.Select;
            //     selSrc = "API";
            //     selTyp = "inventory";
            //     selHlp = "/Inventory/GetInventories";
            //     selPrms = {
            //         IncludeClosed: false
            //     }
            //     setLabel("Inventory");
            //     setSelectNoInput(false);
            //     setDataItemKey("ID");
            //     setTextField("Description");
            //     break;
            // case "JobCardStatus":
            //     inpTyp = Enums.ControlType.MultiSelect;
            //     selSrc = "API";
            //     selTyp = "status";
            //     selHlp = "/JobStatus";
            //     srchMth = "get";
            //     setInputValue([]);
            //     setLabel("Job Card Status");
            //     setDataItemKey("ID");
            //     setTextField("Description");
            //     break;
            // case "QueryStatus":
            //     inpTyp = Enums.ControlType.Select;
            //     selSrc = "API";
            //     selTyp = "query-status";
            //     selHlp = "/QueryStatus/GetQueryStatus";
            //     setLabel("Query Status");
            //     setDataItemKey("ID");
            //     setTextField("Description");
            //     break;
            // case "QueryType":
            //     inpTyp = Enums.ControlType.Select;
            //     selSrc = "API";
            //     selTyp = "query-type";
            //     selHlp = "/QueryType/GetQueryTypes";
            //     setLabel("Query Type");
            //     setDataItemKey("ID");
            //     setTextField("Description");
            //     break;
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
            // case "Store":
            //     inpTyp = Enums.ControlType.MultiSelect;
            //     selSrc = "API";
            //     selTyp = "store";
            //     selHlp = "/Store/GetEmployeeStores";
            //     setInputValue([]);
            //     selPrms = {
            //         employeeID: Storage.getCookie(Enums.Cookie.employeeID),
            //         searchPhrase: ""
            //     };
            //     setLabel("Store");
            //     srchMth = "get";
            //     setDataItemKey("ID");
            //     setTextField("Name");
            //     break;
            // case "Supplier":
            //     inpTyp = Enums.ControlType.Select;
            //     selSrc = "API";
            //     selTyp = "supplier";
            //     selHlp = "/Supplier";
            //     srchMth = "get";
            //     selPrms = { "includeClosed": true, pageSize: 1000 };
            //     setLabel("Supplier");
            //     setDataItemKey("ID");
            //     setTextField("Name");
            //     break;
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
    };

    // to get API options
    const getAPIOptions = async (searchPhrase, ...others) => {
        let params = selectParams;
        if (selectType === "customer" || selectType === "inventory") {
            params.searchPhrase = searchPhrase;
        }
        if (Array.isArray(others)) {
            others.forEach(other => {
                params[other.key] = other.value;
            })
        }
        let meth = selectSearchMethod === "post" ? Fetch.post : selectSearchMethod === "get" ? Fetch.get : null;
        if (selectHelper) {
            let response = await meth({
                url: selectHelper,
                params: selectParams
            });
            setSelectOptions(response.Results);
        }
    };

    // to get Enum options
    const getEnumOptions = () => {
        let enumItems = Enums.getEnumItemsVD(selectHelper);
        setSelectOptions(enumItems);
    };

    function tryGetOptions() {
        if (selectSource === "API" && selectHelper) {
            //setSelectNoInput(false);
            getAPIOptions();
        } else if (selectSource === "Enum") {
            //setSelectNoInput(true);
            getEnumOptions();
        }
    }

    useEffect(() => {
        if (!inputType || !selectSource || !selectHelper || !selectType) return;

        if (inputType === Enums.ControlType.Select) {
            tryGetOptions();
        }

    }, [inputType, selectSource, selectHelper, selectType]);

    const handleSelectListChange = (e) => {
        let result = e.target.value;
        setInputDescription(result);
    };

    const updateSelectedValue = (val, desc) => {
        updateValueInternal(val, desc);
    };

    const updateSelectValueSC = (vals) => {
        setSelectedOptions(vals);
        let ids = vals.map(x => x.ID);
        let id = ids.length > 0 ? ids[0] : null;
        updateValue(template.Name, id);
    }

    // const updateSelectListValue = (val) => {
    //     // for enums

    //     let valueToSave = val;
    //     let description = val;


    //     if (selectType === "enum-proper") {
    //         valueToSave = val.value;
    //         description = getSelectDescription(val.value);
    //     } else if (selectType === "enum") {
    //         description = getSelectDescription(val);
    //     } else if (inputType === Enums.ControlType.MultiSelect) {
    //         // multiselect
    //         valueToSave = [...inputValue];
    //         let valID = val.ID,
    //             valIdx = valueToSave.indexOf(valID),
    //             selOpts = [...selectedOptions];

    //         if (valIdx > -1) {
    //             valueToSave.splice(valIdx, 1);
    //             selOpts.splice(valIdx, 1);
    //         } else {
    //             valueToSave.push(valID);
    //             selOpts.push(val);
    //         }
    //         setSelectedOptions(selOpts);
    //         description = getSelectDescription(selOpts);
    //     } else {
    //         valueToSave = val.ID;
    //         description = getSelectDescription(val);
    //     }

    //     updateSelectedValue(valueToSave, description);
    // };

    const updateRadioValue = (val) => {
        if (template.Name === "UserType") {
            updateValueInternal(val ? parseInt(val) : null);
        } else {
            updateValueInternal(val === "null" ? null : val.toString().toLowerCase() === "true");
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
                case "supplier":
                    desc = val.Name;
                    break;
                default:
                    desc = val.Description;
                    break;
            }
        }

        return desc;
    };

    return (
        <div className="row" >
            <div className="row">
                {template.Name === "Customer" ? <>
                    <CustomerSelector
                        canChangeCustomer={true}
                        canClear={true}
                        selectedCustomer={selectedOptions?.length > 0 ? selectedOptions[0] : null}
                        setSelectedCustomer={(e) => {
                            setSelectedOptions(e ? [e] : []);
                            updateValue(template.Name, e?.ID ?? null);
                        }}
                        inputErrors={{}}
                        compactView={true}
                        ignoreContactLocations={true}
                    />
                </>
                    :
                    template.Name === "Inventory" ? <>
                        <InventorySelector
                            selectedInventory={selectedOptions?.length > 0 ? selectedOptions[0] : null}
                            setSelectedInventory={(e) => {
                                setSelectedOptions(e ? [e] : []);
                                updateValue(template.Name, e?.ID ?? null);
                            }}
                            ignoreAddOption={true}
                            placeholder="Search for an inventory item"
                        />
                    </>
                        :
                        template.Name === "Employee" ? <>
                            <EmployeeSelector
                                selectedEmployee={selectedOptions?.length > 0 ? selectedOptions[0] : null}
                                setSelectedEmployee={(e) => {
                                    setSelectedOptions(e ? [e] : []);
                                    updateValue(template.Name, e?.ID ?? null);
                                }}
                                canClear={true}
                                placeholder="Select an employee"
                            />
                        </>
                            :
                            template.Name === "QueryType" ? <>
                                <QueryTypeSelector
                                    placeholder="Select a query type"
                                    required={false}
                                    selectedQueryType={selectedOptions?.length > 0 ? selectedOptions[0] : null}
                                    setSelectedQueryType={(e) => {
                                        setSelectedOptions(e ? [e] : []);
                                        updateValue(template.Name, e?.ID ?? null);
                                    }}
                                    ignoreAddOption={true}
                                    canClear={true}
                                    includeDisabled={true}
                                />
                            </>
                                :
                                template.Name === "QueryStatus" ? <>
                                    <QueryStatusSelector
                                        placeholder="Select a query status"
                                        required={false}
                                        selectedQueryStatus={selectedOptions?.length > 0 ? selectedOptions[0] : null}
                                        setSelectedQueryStatus={(e) => {
                                            setSelectedOptions(e ? [e] : []);
                                            updateValue(template.Name, e?.ID ?? null);
                                        }}
                                        ignoreAddOption={true}
                                        canClear={true}
                                        queryType={queryType}
                                        includeDisabled={true}
                                    />
                                </>
                                    :
                                    template.Name === "Supplier" ? <>
                                        <SupplierSelector
                                            selectedSupplier={selectedOptions?.length > 0 ? selectedOptions[0] : null}
                                            setSelectedSupplier={(e) => {
                                                setSelectedOptions(e ? [e] : []);
                                                updateValue(template.Name, e?.ID ?? null);
                                            }}
                                            ignoreAddOption={true}
                                        />
                                    </>
                                        :
                                        inputType === Enums.ControlType.Select ?
                                            <>
                                                <SCDropdownList
                                                    label={label}
                                                    value={selectedOptions?.length > 0 ? selectedOptions[0] : null}
                                                    options={selectOptions}
                                                    onChange={(e) => { updateSelectValueSC(e ? [e] : []) }}
                                                    // canSearch={!selectNoInput}
                                                    dataItemKey={dataItemKey}
                                                    textField={textField}
                                                    canClear={true}
                                                    placeholder={placeholder}
                                                    required={template.IsRequired}
                                                />
                                            </> : <></>}
                {template.Name === "Store" ? <>
                    <StoreMultiSelector
                        selectedStores={selectedOptions}
                        setSelectedStores={(e) => {
                            // updateSelectValueSC();
                            setSelectedOptions(e);
                            updateValue(template.Name, e.map(x => x.ID));
                        }}
                    />

                </>
                    :
                    template.Name === "JobCardStatus" ? <>
                        <JobStatusMultiSelector
                            selectedJobStatuses={selectedOptions}
                            setSelectedJobStatuses={(e) => {
                                // updateSelectValueSC();
                                setSelectedOptions(e);
                                updateValue(template.Name, e.map(x => x.ID));
                            }}
                        />

                    </>
                        :
                        inputType === Enums.ControlType.MultiSelect ? <>

                            <SCMultiSelect
                                label={label}
                                selectedOptions={selectedOptions}
                                availableOptions={selectOptions}
                                onChange={updateSelectValueSC}
                                dataItemKey={dataItemKey}
                                textField={textField}
                            />

                        </> : <></>}
                {inputType === Enums.ControlType.Checkbox ? <>
                    <div className="margin-top16">
                        <SCCheckbox
                            label={label} value={inputValue} onChange={(e) => { updateSelectedValue(!inputValue); }}
                        />
                    </div>
                </> : <></>}
                {inputType === Enums.ControlType.Radio ? <>
                    <div className="margin-top16">
                        <SCRadioButtonGroup
                            label={label}
                            value={inputValue?.toString() ?? "null"}
                            name={template.Name}
                            onChange={(e) => updateRadioValue(e.value)}
                        >
                            {selectOptions.map((opt, key) => {
                                return <SCRadioButton
                                    key={key}
                                    label={opt.key}
                                    value={opt.value?.toString() ?? "null"}
                                />
                            })}

                        </SCRadioButtonGroup>
                    </div>
                </> : <></>}
                {inputType === Enums.ControlType.Date ? <>
                    <SCDatePicker
                        label={label}
                        value={inputValue}
                        name={template.Name}
                        onChange={(e) => {
                            updateSelectedValue(e ? Time.toISOString(Time.updateTime(e, Time.today())) : e);
                        }}
                        canClear={true}
                        minDate={startDate}
                    />
                </> : <></>}
            </div>
            <style jsx>{`
                    .margin-top16 {
                        margin-top: 16px;
                    }
            `}</style>
        </div>
    );
};


export default ReportFilterInput;

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
