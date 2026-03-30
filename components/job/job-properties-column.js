import React, { useState, useEffect, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import TextInput from '../text-input';
import SelectInput from '../select-input';
import KendoMultiSelect from '../kendo/kendo-multiselect';
import KendoDatePicker from '../kendo/kendo-date-picker';
import Checkbox from '../checkbox';
import SupplierSelector from '../selectors/supplier-selector';
import Fetch from '../../utils/Fetch';
import AssignTechnicians from '../shared-views/assign-technicians';
import JobStatusService from '../../services/job/job-status-service';
import OptionService from '../../services/option/option-service';
import Helper from '../../utils/helper';
import Storage from '../../utils/storage';
import { useMemo } from 'react';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import EmployeeMultiSelector from '../selectors/employee/employee-multiselector';
import SCMultiSelect from '../sc-controls/form-controls/sc-multiselect';
import { Box, Flex } from "@mantine/core";
import WarehouseSelector from '../selectors/warehouse/warehouse-selector';
import employeeService from '../../services/employee/employee-service';
import ConfirmAction from '../modals/confirm-action';
import { useQuery } from '@tanstack/react-query';
import featureService from '../../services/feature/feature-service';
import constants from '../../utils/constants';
import { showNotification } from '@mantine/notifications';

function JobPropertiesColumn({ job, updateJobProperty, jobProperties, inputErrors, showAll, customFields, allowNonEmployee, accessStatus,
    groupSize = 2, selectedStore = null, customerZone = false, disabled = false, cypressCustomField, hasVans, ...props }) {

    const toast = React.useContext(ToastContext);
    const [options, setOptions] = useState({});
    const [fieldInputs, setFieldInputs] = useState({});

    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    const [productSearchPhrase, setProductSearchPhrase] = useState(job.Product ? job.Product.ProductNumber : "");
    const [products, setProducts] = useState([]);
    const [skipProductSearch, setSkipProductSearch] = useState(true);

    const [selectedSupplier, setSelectedSupplier] = useState();
    const [selectedVan, setSelectedVan] = useState();
    const [suppressVanSave, setSuppressVanSave] = useState(false);

    useEffect(() => {
        if (job.Suppliers && job.Suppliers.length > 0) {
            setSelectedSupplier(job.Suppliers[0]);
        } else {
            // Ensure UI reflects resets/clears from upstream state
            setSelectedSupplier(null);
        }
    }, [job.Suppliers]);

    useEffect(() => {
        if (job.Vans && job.Vans.length > 0) {
            setSelectedVan(job.Vans[0]);
        }
        else {
            setSelectedVan(null);
        }
    }, [job.Vans]);

    useEffect(() => {
        // Keep product search input in sync with upstream resets/changes
        if (job.Product && job.Product.ProductNumber) {
            setProductSearchPhrase(job.Product.ProductNumber);
        } else {
            setProductSearchPhrase("");
        }
    }, [job.Product]);

    const [hasEmployee, setHasEmployee] = useState(!disabled && !customerZone && (allowNonEmployee || Storage.hasCookieValue(Enums.Cookie.employeeID)));

    const { data: hasVanStock } = useQuery(["hasVanStock"], () => featureService.hasFeature(constants.features.VAN_STOCK));

    const updateJobPropertyHelper = (jobPropertyName, value, object) => {
        let key = JobStatusService.getFieldFromOption(jobPropertyName, job);

        const statusOptionName = jobProperties.find((prop) => prop.Name === jobPropertyName)?.JobStatusOptionName
        const type = Enums.getEnumStringValue(Enums.JobStatusTypes, statusOptionName)?.replace('' + statusOptionName, '')

        if (jobPropertyName === "Product") {

            updateJobProperty(null, null, [{
                key: key,
                value: value
            }, {
                key: "Product",
                value: object
            }]);

            setProductSearchPhrase(object.ProductNumber);

        } else if (jobPropertyName === "Supplier") {

            let supplierList = object ? [object] : [];

            updateJobProperty("Suppliers", supplierList);

        } else if (jobPropertyName === "Van") {

            let vanList = object ? [object] : [];

            updateJobProperty("Vans", vanList);

        } else {
            // set the value to null for number types as updates can be triggered with <empty-string> values
            if ((type === 'integer' || type === 'number' || type === 'amount') && (typeof value !== "number")) {
                updateJobProperty(key, null);
            } else {
                updateJobProperty(key, value);
            }
        }
    }

    const handleInputChange = (e) => {
        updateJobPropertyHelper(e.target.name, e.target.value);
    }

    const handleInputChangeSC = (e) => {
        updateJobPropertyHelper(e.name, e.value);
    }

    const handleIntegerChange = (e) => {
        let val = e.target.value;

        if (!Helper.isNullOrWhitespace(val)) {
            val = parseInt(val);
            if (isNaN(val) || val < 0) {
                return;
            }
        }

        updateJobPropertyHelper(e.target.name, val);
    }

    const handleIntegerChangeSC = (e) => {
        let val = e.value;
        if (!Helper.isNullOrWhitespace(val)) {
            val = parseInt(val);
            if (isNaN(val) || val < 0) {
                return;
            }
        }

        updateJobPropertyHelper(e.name, val);
    }

    const handleDateChange = (day, fieldName) => {
        if (day) {
            updateJobPropertyHelper(fieldName, day);
        } else {
            updateJobPropertyHelper(fieldName, "");
        }
    }

    const handleDateChangeSC = (e, fieldName) => {
        if (e.value) {
            updateJobPropertyHelper(fieldName, e.value);
        } else {
            updateJobPropertyHelper(fieldName, "");
        }
    }

    const handleSelectChange = (e, type, fieldName) => {

        if (fieldName === "Product") {
            setProductSearchPhrase(e.target.value);
        }

    }

    const doVanCheckFromEmployeesRef = useRef(false);
    const addedEmployeesRef = useRef([]);

    function setSelectedSC(option, fieldName, type) {
        if (type == 'single') {
            if (fieldName === "Product") {
                updateJobPropertyHelper(fieldName, option.ID, option);
            } else if (fieldName === "Supplier") {
                updateJobPropertyHelper(fieldName, option.ID, option);
            } else if (fieldName === "Van") {
                updateJobPropertyHelper(fieldName, option.ID, option);
            } else {
                updateJobPropertyHelper(fieldName, option.ID);
            }
        } else {

            let newItems = option;

            if (fieldName === "EmployeeList" && hasVanStock && newItems.length > 0) {
                const currentEmployees = job.Employees || [];
                const newlyAdded = newItems.filter(ni => !currentEmployees.some(ce => ce.ID === ni.ID));

                if (newlyAdded.length > 0) {
                    addedEmployeesRef.current = newlyAdded;
                    doVanCheckFromEmployeesRef.current = true;
                }
            }

            updateJobPropertyHelper(fieldName, newItems);

        }
    }

    useEffect(() => {
        if (doVanCheckFromEmployeesRef.current) {
            doVanCheckFromEmployeesRef.current = false;

            let vanToLink = null;
            let newLinkFound = false;
            let employeeLinked = null;

            let vanAlreadyLinked = job.Vans && job.Vans.length > 0;

            const employeesToCheck = addedEmployeesRef.current || [];
            addedEmployeesRef.current = [];

            employeesToCheck.forEach(employee => {
                if (!newLinkFound) {
                    vanToLink = getEmployeesLinkedVan(employee);
                    if (!!vanToLink && !jobIsLinkedToVan(vanToLink)) {
                        newLinkFound = true;
                        employeeLinked = employee;
                    }
                }
            });

            if (newLinkFound && !vanAlreadyLinked) {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    display: true,
                    onConfirm: () => {
                        setSelected(vanToLink, "Van", 'single');
                    },
                    heading: "Employee's Van Not Linked",
                    text: `${employeeLinked.FullName} is linked to the van ${vanToLink.Code} but it's not linked to the job. Would you like to link the van to the job?`,
                    confirmButtonText: "Link Van",
                    cancelButtonText: "No Thanks",
                });
            }
        }

    }, [job.Employees]);

    const jobIsLinkedToVan = (van) => {
        return !!(job.Vans?.find((v) => v.ID === van.ID));
    }

    const getEmployeesLinkedVan = (employee) => {
        if (employee && employee.Warehouses && employee.Warehouses.length > 0) {

            let employeeVans = employee.Warehouses.filter(x => x.WarehouseType === Enums.WarehouseType.Mobile);
            if (employeeVans.length > 0) {
                return employeeVans[0];
            }
        }
        return null;
    }

    const checkVanForLinkedEmployee = async (van) => {
        if (van && van.EmployeeID) {
            const linkedEmployee = job.Employees?.find((emp) => emp.ID === van.EmployeeID);
            if (!linkedEmployee) {
                // prompt user to add employee
                let employee = await employeeService.getEmployee(van.EmployeeID);
                
                const list = Helper.clone(job.Employees ?? []);
                list.push(employee);
                setSelectedSC(list, "EmployeeList", "multi");

                showNotification({
                    title: "Employee Linked",
                    message: `${employee.FullName} is linked to this van but not linked to the job. They have been added to the job.`,
                    color: "blue",
                });

                // setConfirmOptions({
                //     ...Helper.initialiseConfirmOptions(),
                //     display: true,
                //     onConfirm: () => {
                //         const list = Helper.clone(job.Employees ?? []);
                //         list.push(employee);
                //         setSelectedSC(list, "EmployeeList", "multi");
                //     },
                //     heading: "Van's Employee Not Linked",
                //     text: `${employee.FullName} is linked to this van but not linked to the job. Would you like to add them to the job?`,
                //     confirmButtonText: "Link Employee",
                //     cancelButtonText: "No Thanks",

                // });
            }
        }
    }

    function setSelected(option, fieldName, type) {
        if (type == 'single') {
            if (fieldName === "Product" || fieldName === "Supplier" || fieldName === "Van") {
                updateJobPropertyHelper(fieldName, option?.ID, option);
            } else {
                updateJobPropertyHelper(fieldName, option?.ID);
            }
        } else {

            let newItems = processedFieldInputs[fieldName];

            if (!newItems) {
                newItems = [];
            }

            if (newItems.filter(function (opt) { return opt.ID === option.ID; }).length > 0) {
                newItems = newItems.filter((opt) => { return opt.ID !== option.ID })
            } else {
                newItems.push(option);
            }
            updateJobPropertyHelper(fieldName, newItems);
        }
    }

    const handleMultiSelectChange = (fieldName, options) => {
        updateJobPropertyHelper(fieldName, options ?? []);
    };

    const processedFieldInputs = useMemo(() => {
        let inps = {};
        jobProperties.map((prop) => {
            inps[prop.Name] = job[JobStatusService.getFieldFromOption(prop.JobStatusOptionName, job)];
        });
        return inps;
    }, [job, jobProperties, selectedStore]);

    // const populateFieldInputs = () => {
    //     if (!job) {
    //         setFieldInputs({});
    //         return;
    //     }

    //     let inps = { ...fieldInputs };
    //     jobProperties.map((prop) => {
    //         inps[prop.Name] = job[JobStatusService.getFieldFromOption(prop.JobStatusOptionName, job)];
    //     });

    //     setFieldInputs(inps);
    // };

    useEffect(() => {
        searchProducts();
    }, [productSearchPhrase]);

    const searchProducts = async () => {

        if (skipProductSearch || !hasEmployee || job.IsClosed) {
            setSkipProductSearch(false);
            return;
        }

        const products = await Fetch.post({
            url: `/Product/GetProducts`,
            params: {
                pageSize: 100,
                pageIndex: 0,
                searchPhrase: productSearchPhrase,
                CategoryIDList: [],
                SubcategoryIDList: [],
                EmployeeIDList: [],
                CustomerGroupIDList: [],
                SortExpression: "code",
                SortDirection: "ascending"
            }
        });

        if (products.TotalResults > 0) {
            setProducts(products.Results);
        } else if (productSearchPhrase) {
            toast.setToast({
                message: 'No asset results from search, showing last search results',
                show: true
            });
        }
    };

    const selectListClick = async (fieldName) => {
        if (fieldName === "Product") {
            if (!products || products.length === 0) {
                await searchProducts();
            }
        }
    };


    // let lastStore = useRef(selectedStore ? selectedStore.ID : null);
    let searching = useRef(false);
    const fetchData = async () => {

        if (!hasEmployee || job.IsClosed) {
            setSkipProductSearch(false);
            return;
        }

        if (searching.current) return;

        searching.current = true;

        // let storeChanged = (selectedStore ? selectedStore.ID : null) !== lastStore.current;
        // lastStore.current = selectedStore ? selectedStore.ID : null;

        let suppliers = options.Supplier;

        // if (storeChanged) {
        //     const supplierRequest = await Fetch.post({
        //         url: '/Supplier/GetSuppliers',
        //         params: {
        //             StoreIDList: selectedStore ? [selectedStore.ID] : null,
        //             IncludeClosed: false
        //         }
        //     });
        //     suppliers = supplierRequest.Results;
        // }

        let codes = options.FaultCodeList,
            causes = options.FaultCauseList,
            reasons = options.FaultReasonList;



        if (!reasons || reasons.length === 0) {
            const reasonRequest = await Fetch.get({
                url: '/FaultReason',
            });
            reasons = reasonRequest.Results;
        }
        if (!codes || codes.length === 0) {
            const codeRequest = await Fetch.get({
                url: '/FaultCode',
            });
            codes = codeRequest.Results;
        }
        if (!causes || causes.length === 0) {
            const causeRequest = await Fetch.get({
                url: '/FaultCause',
            });
            causes = causeRequest.Results;
        }

        // handle products as proper search not just a list to select from

        let requestOptions = {
            FaultCause: causes,
            FaultCauseList: causes,
            FaultCode: codes,
            FaultCodeList: codes,
            FaultReason: reasons,
            FaultReasonList: reasons,
            Supplier: suppliers
        }

        setOptions(requestOptions);
        searching.current = false;
    };

    useEffect(() => {
        fetchData();
        //populateFieldInputs();
    }, []);

    useEffect(() => {
        fetchData();
        //populateFieldInputs();
    }, [job, jobProperties]);

    useEffect(() => {
        fetchData();
        //populateFieldInputs();
    }, [selectedStore]);

    const displayValue = (fieldName) => {
        let val = processedFieldInputs[fieldName];
        let opts = options[fieldName];
        opts = opts ? opts : [];
        let returnVal = val;
        let readOnly = !hasEmployee || job.IsClosed;
        switch (fieldName) {
            case "FaultCause":
                var match = opts.filter(x => x.ID === val);
                returnVal = match && match.length > 0 ? match[0].Description : "";
                break;
            case "FaultCauseList":
                if (!val) val = [];
                if (readOnly) {
                    returnVal = val.map(x => x.Description).join(", ");
                    break;
                }
                var match = opts.filter(x => val.map(y => y.ID).indexOf(x.ID) > -1);
                returnVal = match && match.length > 0 ? match.map((x) => x.Description).join(", ") : "";
                break;
            case "FaultCode":
                var match = opts.filter(x => x.ID === val);
                returnVal = match && match.length > 0 ? match[0].Description : "";
                break;
            case "FaultCodeList":
                if (!val) val = [];
                if (readOnly) {
                    returnVal = val.map(x => x.Description).join(", ");
                    break;
                }
                var match = opts.filter(x => val.map(y => y.ID).indexOf(x.ID) > -1);
                returnVal = match && match.length > 0 ? match.map((x) => x.Description).join(", ") : "";
                break;
            case "FaultReason":
                var match = opts.filter(x => x.ID === val);
                returnVal = match && match.length > 0 ? match[0].Description : "";
                break;
            case "FaultReasonList":
                if (!val) val = [];
                if (readOnly) {
                    returnVal = val.map(x => x.Description).join(", ");
                    break;
                }
                var match = opts.filter(x => val.map(y => y.ID).indexOf(x.ID) > -1);
                returnVal = match && match.length > 0 ? match.map((x) => x.Description).join(", ") : "";
                break;
            case "Supplier":
                // var supplier = job.Suppliers && job.Suppliers.length > 0 ? job.Suppliers[0] : undefined;
                // setSelectedSupplier(supplier);
                var match = job.Suppliers && job.Suppliers.length > 0 ? job.Suppliers[0].Name : "";
                returnVal = match;
                // if (!supplierDescription && match) {
                //     let newSupplierDescription = match;
                //     setSupplierDescription(newSupplierDescription);
                //     returnVal = newSupplierDescription;
                // }
                break;
            case "Van":
                var match = job.Vans && job.Vans.length > 0 ? job.Vans[0].Code : "";
                returnVal = match;
                break;
            case "Product":
                var match = job.Product;
                returnVal = productSearchPhrase;
                if (!productSearchPhrase && match) {
                    let newSearchPhrase = match.ProductNumber;
                    setProductSearchPhrase(newSearchPhrase);
                    returnVal = newSearchPhrase;
                }

                break;
        }
        return returnVal;
    };

    const jobPropertyRender = (field) => {

        const fieldName = field.Name;
        const fieldLabel = field.Description;
        const requiredField = field.OptionConfiguration == Enums.OptionConfiguration.Required;
        let val = processedFieldInputs[fieldName];
        let isPopulated = val !== undefined && val !== null && val.toString() !== ""; // toString() handles empty arrays like empty strings        

        let availableOptions = [];

        let type = Enums.getEnumStringValue(Enums.JobStatusTypes, field.JobStatusOptionName);

        if (type == `singleSelect${field.JobStatusOptionName}`) {

            availableOptions = options[fieldName];

            if (availableOptions && availableOptions.length > 0) {
                let match = availableOptions.find(x => x.ID === val);
                if (match) {
                    if (match.IsActive) {
                        availableOptions = availableOptions.filter(x => x.IsActive);
                    } else {
                        let optionsToShow = availableOptions.filter(x => x.IsActive);
                        optionsToShow.push(match);
                        availableOptions = optionsToShow;
                    }
                }
            }
        }

        let selectedOptions = [];

        if (type == `multiSelect${field.JobStatusOptionName}` && fieldName !== "EmployeeList") {

            availableOptions = options[fieldName];
            selectedOptions = processedFieldInputs[fieldName];

            if (availableOptions && availableOptions.length > 0) {
                if (selectedOptions && selectedOptions.length > 0) {

                    let matches = availableOptions.filter(function (item) {
                        return selectedOptions.some(x => x.ID == item.ID);
                    });

                    if (matches.length > 0) {
                        let inActiveMatches = matches.filter(x => !x.IsActive);
                        availableOptions = availableOptions.filter(x => x.IsActive).concat(inActiveMatches);
                    }
                } else {
                    availableOptions = availableOptions.filter(x => x.IsActive);
                }
            }
        }

        if (((isPopulated && showAll === true) || field.OptionConfiguration > Enums.OptionConfiguration.None)
            && field.JobStatusOptionName !== Enums.JobStatusOptionName.Description) {

            switch (Enums.getEnumStringValue(Enums.JobStatusTypes, field.JobStatusOptionName)) {
                case "textField" + field.JobStatusOptionName:
                    return (<>
                        <SCInput
                            error={inputErrors[fieldName]}
                            label={fieldLabel}
                            name={fieldName}
                            required={requiredField}
                            value={processedFieldInputs[fieldName] ?? ""}
                            readOnly={!hasEmployee || job.IsClosed}
                            onChange={handleInputChangeSC}
                        />
                        {/* <TextInput
                            cypress={cypressCustomField ? cypressCustomField : null}
                            changeHandler={handleInputChange}
                            error={inputErrors[fieldName]}
                            label={fieldLabel}
                            name={fieldName}
                            required={requiredField}
                            value={processedFieldInputs[fieldName]}
                            readOnly={!hasEmployee || job.IsClosed}
                        /> */}
                    </>
                    );
                case "amount" + field.JobStatusOptionName:
                    return (
                        <>
                            <SCNumericInput
                                error={inputErrors[fieldName]}
                                label={fieldLabel}
                                name={fieldName}
                                required={requiredField}
                                value={processedFieldInputs[fieldName] ?? undefined}
                                readOnly={!hasEmployee || job.IsClosed}
                                format={Enums.NumericFormat.Currency}
                                onChange={handleInputChangeSC}
                            />
                            {/* <TextInput
                                changeHandler={handleInputChange}
                                error={inputErrors[fieldName]}
                                label={fieldLabel}
                                name={fieldName}
                                required={requiredField}
                                type="number"
                                value={processedFieldInputs[fieldName]}
                                readOnly={!hasEmployee || job.IsClosed}
                            /> */}
                        </>
                    );
                case "number" + field.JobStatusOptionName:
                    return (
                        <>
                            <SCNumericInput
                                error={inputErrors[fieldName]}
                                label={fieldLabel}
                                name={fieldName}
                                required={requiredField}
                                value={processedFieldInputs[fieldName] ?? undefined}
                                readOnly={!hasEmployee || job.IsClosed}
                                onChange={handleInputChangeSC}
                            />
                            {/* <TextInput
                            changeHandler={handleInputChange}
                            error={inputErrors[fieldName]}
                            label={fieldLabel}
                            name={fieldName}
                            required={requiredField}
                            type="number"
                            value={processedFieldInputs[fieldName]}
                            readOnly={!hasEmployee || job.IsClosed}
                        /> */}
                        </>
                    );
                case "integer" + field.JobStatusOptionName:
                    return (
                        <>
                            <SCNumericInput
                                error={inputErrors[fieldName]}
                                label={fieldLabel}
                                name={fieldName}
                                required={requiredField}
                                value={processedFieldInputs[fieldName] ?? undefined}
                                readOnly={!hasEmployee || job.IsClosed}
                                onChange={handleIntegerChangeSC}
                            />
                            {/* <TextInput
                                changeHandler={handleIntegerChange}
                                error={inputErrors[fieldName]}
                                label={fieldLabel}
                                name={fieldName}
                                required={requiredField}
                                type="number"
                                value={processedFieldInputs[fieldName]}
                                readOnly={!hasEmployee || job.IsClosed}
                            /> */}
                        </>
                    );
                case "singleSelect" + field.JobStatusOptionName:
                    if (fieldName === "Supplier") {
                        return (<SupplierSelector selectedSupplier={selectedSupplier} setSelectedSupplier={(option) => setSelected(option, fieldName, 'single')}
                            accessStatus={accessStatus} error={inputErrors[fieldName]} isRequired={requiredField} disabled={!hasEmployee || job.IsClosed} />);
                    }
                    else if (fieldName === "Van" && (hasVans || requiredField)) {
                        return <WarehouseSelector
                            vanStoreID={job.StoreID}
                            selectedWarehouse={selectedVan}
                            setSelectedWarehouse={(option) => {
                                setSelected(option, fieldName, 'single');
                                checkVanForLinkedEmployee(option);
                            }}
                            canClear={true}
                            disabled={!hasEmployee || job.IsClosed}
                            error={inputErrors[fieldName]}
                            required={requiredField}
                            onSuppressSave={(suppress) => {
                                setSuppressVanSave(suppress);
                            }}
                            label='Van'
                            placeholder='Select Van'
                            warehouseType={Enums.WarehouseType.Mobile}
                            filterByEmployee={false}
                            autoSelect={false}
                        />
                    }
                    else {
                        return (
                            <>
                                {/* <SCComboBox
                                    error={inputErrors[fieldName]}
                                    label={fieldLabel}
                                    name={fieldName}
                                    canSearch={fieldName === "Product" ? false : true}
                                    options={fieldName === "Product" ? products : options[fieldName]}
                                    onChange={(option) => setSelected(option, fieldName, 'single')}
                                    required={requiredField}
                                    value={displayValue(fieldName)} incorrect solution, but not needed in the system
                                    disabled={!hasEmployee || job.IsClosed}
                                />
                                <SelectInput
                                    changeHandler={(e) => handleSelectChange(e, 'single', fieldName)}
                                    error={inputErrors[fieldName]}
                                    label={fieldLabel}
                                    name={fieldName}
                                    noInput={fieldName === "Product" ? false : true}
                                    options={fieldName === "Product" ? products : options[fieldName]}
                                    setSelected={(option) => setSelected(option, fieldName, 'single')}
                                    required={requiredField}
                                    type={fieldName === "Product" ? "product" : fieldName === "Supplier" ? "supplier" : "statusChange"}
                                    value={displayValue(fieldName)}
                                    clickHandler={() => selectListClick(fieldName)}
                                    disabled={!hasEmployee || job.IsClosed}
                                /> */}
                            </>
                        );
                    }
                case "multiSelect" + field.JobStatusOptionName:
                    let selectVal = "";

                    if (fieldName === "EmployeeList") {
                        return (
                            <>
                                <EmployeeMultiSelector
                                    selectedEmployees={processedFieldInputs[fieldName] ?? []}
                                    error={inputErrors[fieldName]}
                                    disabled={!hasEmployee || job.IsClosed}
                                    storeID={(selectedStore ? selectedStore.ID : null)}
                                    setSelectedEmployees={(e) => setSelectedSC(e, fieldName, 'multi')}
                                    readonlyValues={job.Vans?.map(v => v.EmployeeID) ?? []}
                                />
                                {/* <AssignTechnicians selectedEmployees={processedFieldInputs[fieldName]} error={inputErrors[fieldName]} disabled={!hasEmployee || job.IsClosed}
                                    selectEmployee={(employee) => setSelected(employee, fieldName, 'multi')} storeID={(selectedStore ? selectedStore.ID : null)} /> */}
                            </>
                        );
                    }

                    if (processedFieldInputs[fieldName]) {
                        selectVal = (processedFieldInputs[fieldName].length > 0 ? processedFieldInputs[fieldName][0] + (processedFieldInputs[fieldName].length > 1 ? " + " + (processedFieldInputs[fieldName].length - 1) : "") : "")
                    }
                    return (
                        // <SelectInput
                        //     changeHandler={(e) => handleSelectChange(e, 'multi')}
                        //     error={inputErrors[fieldName]}
                        //     label={fieldLabel}
                        //     multiSelect={true}
                        //     name={fieldName}
                        //     noInput={true}
                        //     options={options[fieldName]}
                        //     required={requiredField}
                        //     selectedOptions={processedFieldInputs[fieldName]}
                        //     setSelected={(option) => setSelected(option, fieldName, 'multi')}
                        //     type={"statusChange-multi-object"}
                        //     value={displayValue(fieldName)}
                        //     disabled={!hasEmployee || job.IsClosed}
                        // />
                        <>
                            <SCMultiSelect
                                availableOptions={(availableOptions || []).map((opt) => opt?.IsActive ? opt : { ...opt, Description: opt?.Description?.includes(' (disabled)') ? opt.Description : `${opt.Description} (disabled)` })}
                                textField="Description"
                                dataItemKey="ID"
                                selectedOptions={processedFieldInputs[fieldName] ?? []}
                                label={fieldLabel}
                                error={inputErrors[fieldName]}
                                required={requiredField}
                                disabled={!hasEmployee || job.IsClosed}
                                onChange={(options) => handleMultiSelectChange(fieldName, options)}
                            />
                            {/* <KendoMultiSelect availableOptions={options[fieldName]} selectedOptions={processedFieldInputs[fieldName]}
                                textField={'Description'} dataItemKey={'ID'} label={fieldLabel} error={inputErrors[fieldName]} required={requiredField}
                                handleChange={(options) => handleMultiSelectChange(fieldName, options)} disabled={!hasEmployee || job.IsClosed} /> */}
                        </>
                    );
                case "datetime" + field.JobStatusOptionName:
                    return (
                        <>
                            <SCDatePicker
                                value={processedFieldInputs[fieldName] ? processedFieldInputs[fieldName] : undefined}
                                error={inputErrors[fieldName]}
                                label={fieldLabel}
                                name={fieldName}
                                required={requiredField}
                                disabled={!hasEmployee || job.IsClosed}
                                changeHandler={(e) => handleDateChangeSC(e, fieldName)}
                            />
                            {/* <KendoDatePicker
                                changeHandler={(day) => handleDateChange(day, fieldName)}
                                value={processedFieldInputs[fieldName] ? processedFieldInputs[fieldName] : undefined}
                                error={inputErrors[fieldName]}
                                label={fieldLabel}
                                name={fieldName}
                                required={requiredField}
                                disabled={!hasEmployee || job.IsClosed}
                            /> */}
                        </>
                    );
                case "bool" + field.JobStatusOptionName:
                    const updateVal = (processedFieldInputs[fieldName] ? processedFieldInputs[fieldName] : true)
                    return (
                        <>
                            <SCCheckbox
                                value={processedFieldInputs[fieldName] ? processedFieldInputs[fieldName] : false}
                                error={inputErrors[fieldName]}
                                extraClasses="form"
                                label={fieldLabel}
                                disabled={!hasEmployee || job.IsClosed}
                                onChange={() => handleInputChange({ target: { name: fieldName, value: !processedFieldInputs[fieldName] } })}
                            />
                            {/* <Checkbox
                                changeHandler={() => handleInputChange({ target: { name: fieldName, value: !processedFieldInputs[fieldName] } })}
                                checked={processedFieldInputs[fieldName] ? processedFieldInputs[fieldName] : false}
                                error={inputErrors[fieldName]}
                                extraClasses="form"
                                label={fieldLabel}
                                disabled={!hasEmployee || job.IsClosed}
                            /> */}
                        </>
                    );
                //TODO: Attachment field option
                case "attach" + field.JobStatusOptionName:
                    return (
                        <div className="attach">
                            {fieldName}
                            <br />
                            <input type="file" id="js-attachment-input" className="hidden-file-input" />
                        </div>
                    );
                default:
                    return ("");
            }
        }
    }


    const jobPropertiesGroups = useMemo(() => {

        // Build a flat ordered list first; we'll chunk into groups after optional reordering
        let orderedFields = [];

        let { fieldLabel1, fieldLabel2, fieldLabel3, fieldLabel4, dateFieldLabel1, dateFieldLabel2, filterFieldLabel1, filterFieldLabel2, numberFieldLabel1, numberFieldLabel2 } =
            OptionService.getJobCustomFields(customFields);

        for (let i = 0; i < jobProperties.length; i++) {
            let field = jobProperties[i];
            const fieldName = field.Name;

            if (fieldName === 'CustomField1' && !Helper.isNullOrWhitespace(fieldLabel1)) {
                field.Description = fieldLabel1;
            }

            if (fieldName === 'CustomField2' && !Helper.isNullOrWhitespace(fieldLabel2)) {
                field.Description = fieldLabel2;
            }

            if (fieldName === 'CustomField3' && !Helper.isNullOrWhitespace(fieldLabel3)) {
                field.Description = fieldLabel3;
            }

            if (fieldName === 'CustomField4' && !Helper.isNullOrWhitespace(fieldLabel4)) {
                field.Description = fieldLabel4;
            }

            if (fieldName === 'CustomDate1' && !Helper.isNullOrWhitespace(dateFieldLabel1)) {
                field.Description = dateFieldLabel1;
            }

            if (fieldName === 'CustomDate2' && !Helper.isNullOrWhitespace(dateFieldLabel2)) {
                field.Description = dateFieldLabel2;
            }

            if (fieldName === 'CustomFilter1' && !Helper.isNullOrWhitespace(filterFieldLabel1)) {
                field.Description = filterFieldLabel1;
            }

            if (fieldName === 'CustomFilter2' && !Helper.isNullOrWhitespace(filterFieldLabel2)) {
                field.Description = filterFieldLabel2;
            }

            if (fieldName === 'CustomNumber1' && !Helper.isNullOrWhitespace(numberFieldLabel1)) {
                field.Description = numberFieldLabel1;
            }

            if (fieldName === 'CustomNumber2' && !Helper.isNullOrWhitespace(numberFieldLabel2)) {
                field.Description = numberFieldLabel2;
            }

            //const fieldLabel = field.Description;
            //const requiredField = field.OptionConfiguration == Enums.OptionConfiguration.Required;
            let val = processedFieldInputs[fieldName];
            let isPopulated = val !== undefined && val !== null && val.toString() !== ""; // toString() handles empty arrays like empty strings

            if (((isPopulated && showAll === true) || field.OptionConfiguration > Enums.OptionConfiguration.None)
                && field.JobStatusOptionName !== Enums.JobStatusOptionName.Description) {

                // Remove Project property entirely
                if (field.Name === "Project") {
                    continue;
                }

                orderedFields.push(field);
            }
        }

        // If inline mode, move EmployeeList to the front while preserving the order of all other fields - the design requirement is to place assigned employees alongside store selector (which is part of the parent component on the wrapping grid)
        // Additionally, when EmployeeList is moved to the front, place the Van selector immediately after it.
        if (props.inline) { // modern inline approach
            const empIdx = orderedFields.findIndex(f => f?.Name === 'EmployeeList');
            if (empIdx > -1) {
                const [emp] = orderedFields.splice(empIdx, 1);
                orderedFields.unshift(emp);

                // Reorder Van to be right after EmployeeList if present
                const vanIdx = orderedFields.findIndex(f => f?.Name === 'Van');
                if (vanIdx > -1) {
                    const [van] = orderedFields.splice(vanIdx, 1);
                    // Insert van right after EmployeeList (now at index 0)
                    orderedFields.splice(1, 0, van);
                }
            }
            return [orderedFields];
        } else { // legacy approach grouping items by 2 (no defined group structure)
            // Now chunk into groups according to groupSize
            let groups = [];
            let currGroup = [];
            for (let i = 0; i < orderedFields.length; i++) {
                if (currGroup.length === groupSize) {
                    groups.push([...currGroup]);
                    currGroup = [];
                }
                currGroup.push(orderedFields[i]);
            }
            if (currGroup.length > 0) {
                groups.push([...currGroup]);
            }

            return groups;
        }
    }, [ jobProperties, processedFieldInputs, showAll, groupSize, customFields, props.inline ]);


    return (<>
        {
            props.inline ? jobPropertiesGroups[0].filter(x => x.JobStatusOptionName !== Enums.JobStatusOptionName.JobItem).map((prop, index) => {
                return (
                    // <Box key={index + 'jobCustomPropItem'} w={{ base: '100%', xs: '48%' }} style={{ flexGrow: 1 }}>
                    <Box key={index + 'jobCustomPropItem'}>
                        {jobPropertyRender(prop)}
                    </Box>
                )}) :
                jobPropertiesGroups.map((group) => (group.filter(x => x.JobStatusOptionName !== Enums.JobStatusOptionName.JobItem))).map((group, i) => { // filtering job item type to avoid blank space as there is no rendering case for it
                return <Flex key={'jubCustomPropGroup' + i} wrap={'wrap'} gap={'sm'} justify={'space-between'} align={{ base: 'stretch', xs: 'end' }} w={'100%'} direction={{ base: 'column', xs: 'row' }}>
                    {group.length === 1 ?
                    <>
                        {group.map((prop, index) => {
                            return (
                                <Box key={index + 'jobCustomPropItem'} style={{ flexGrow: 1 }}>
                                    {jobPropertyRender(prop)}
                                </Box>
                            );
                        })}
                    </> :
                    <>
                        {group.map((prop, index) => {
                            return (
                                <Box key={index + 'jobCustomPropItem'} w={{ base: '100%', xs: '48%' }} style={{ flexGrow: 1 }}>
                                    {jobPropertyRender(prop)}
                                </Box>
                            );
                        })}
                    </>
                }
            </Flex>
        })}

        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

    </>)
}

export default JobPropertiesColumn;
