import React, { useState, useContext, useEffect } from 'react';
import Router from 'next/router';
import Button from '../button';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Fetch from '../../utils/Fetch';
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ConfirmAction from '../modals/confirm-action';
import Storage from '../../utils/storage';
import ReactSwitch from '../react-switch';
import config from '../../utils/config';
import { SketchPicker } from 'react-color';
import AssignEmployee from '../shared-views/assign-employee';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCComboBox from '../sc-controls/form-controls/sc-combobox';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import SCSwitch from "../sc-controls/form-controls/sc-switch";
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import QueryTypeSelector from '../selectors/query/query-type-selector';
import QueryStatusSelector from '../selectors/query/query-status-selector';

export default function ManageWebForm({  webFormToEdit, isNew }) {

    const [webForm, setWebForm] = useState(webFormToEdit);
    const [selectedQueryType, setSelectedQueryType] = useState(webFormToEdit?.QueryType ?? null);
    const [selectedQueryStatus, setSelectedQueryStatus] = useState(webFormToEdit?.QueryStatus ?? null);

    const [backgroundColour, setBackgroundColour] = useState(false);
    const [colorColour, setColorColour] = useState(false);

    const toast = useContext(ToastContext);

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    const [saving, setSaving] = useState(false);

    const [types, setTypes] = useState(Enums.getEnumItemsVD(Enums.WebFormType, true)
        .filter(x => x.value === Enums.WebFormType.RegisterWarranty
            || x.value === Enums.WebFormType.ContactUs
            || x.value === Enums.WebFormType.LogServiceRequest
            || x.value === Enums.WebFormType.ItemBooking
        ));

    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
    const [customerStatus, setCustomerStatus] = useState(null);

    const getAccessStatus = () => {
        let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
        if (subscriptionInfo) {
            setAccessStatus(subscriptionInfo.AccessStatus);
            setCustomerStatus(subscriptionInfo.CustomerStatus);
        }
    }

    useEffect(() => {
        getAccessStatus();
        setEmbedVariables();
    }, []);

    const setEmbedVariables = () => {
        let host = (config.isDebugging() ? config.apiHost : Storage.getCookie(Enums.Cookie.apiHost));
        if (host.endsWith("/api")) {
            host = host.substr(0, host.length - 4);
        }
        setApiHost(host);
        setScriptEmbed(`<script type="text/javascript" src="https://api.servcraft.co.za/Scripts/embed-form.js" async defer></script>`);
        setDivEmbed(`<div id="servCraft_Container" data-key="${webForm.Key}"></div>`);
    }

    useEffect(() => {
        if ((accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) && customerStatus !== "Trial" && customerStatus !== null) {
            Helper.nextRouter(Router.replace, "/");
        }
    }, [accessStatus, customerStatus]);

    Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, submitWebForm);

    const [inputs, setInputs] = useState({
        Name: webForm.Name,
        WebFormType: webForm.WebFormType,
        Origin: webForm.Origin,
        QueryTypeID: webForm.QueryTypeID,
        MetaData: webForm.MetaData,
        IsActive: webForm.IsActive,
        Title: webForm.Title,
        Style: webForm.Style,
        FollowUpTimespan: webForm.FollowUpTimespan,
        EmployeeID: webForm.EmployeeID,
        QueryStatusID: webForm.QueryStatusID,
        ColumnCount: 1 // this is only ever used on new webforms
    });
    const [inputErrors, setInputErrors] = useState({});
    const [metaDataLabelErrors, setMetaDataLabelErrors] = useState({});
    const [metaDataValidationErrors, setMetaDataValidationErrors] = useState({});

    const handleInputChange = (e) => {
        setInputs({
            ...inputs,
            [e.name]: e.value
        });
        setFormIsDirty(true);
    };

    const parseMetaData = () => {
        let meta = JSON.parse(inputs.MetaData);
        if (!meta.inputs) {
            meta = {
                inputs: meta,
                colCount: 1
            };
        }
        return meta;
    };

    const handleColCountChange = (e) => {
        if (isNew) {
            setInputs({
                ...inputs,
                ColumnCount: e ? e : 1
            });
        } else {
            let meta = parseMetaData();
            meta.colCount = e ? e : 1;
            setInputs({
                ...inputs,
                MetaData: JSON.stringify(meta)
            });
        }
        setFormIsDirty(true);
    };

    const handleMetaDataLabelChange = (e) => {
        let meta = parseMetaData();
        meta.inputs.find(x => x.name === e.name).label = e.value;
        setInputs({
            ...inputs,
            MetaData: JSON.stringify(meta)
        });
        setFormIsDirty(true);
    };

    const handleMetaDataRequiredChange = (item) => {
        let meta = parseMetaData();
        let metaItem = meta.inputs.find(x => x.name === item.name);
        metaItem.required = !metaItem.required;
        setInputs({
            ...inputs,
            MetaData: JSON.stringify(meta)
        });
        setFormIsDirty(true);
    };

    const handleMetaDataValidationChange = (e) => {
        let meta = parseMetaData();
        meta.inputs.find(x => x.name === e.name).validationMessage = e.value;
        setInputs({
            ...inputs,
            MetaData: JSON.stringify(meta)
        });
        setFormIsDirty(true);
    };

    function validationMetaDataLabel() {
        let metaData = parseMetaData();
        let metaValidationItems = [];
        metaData.inputs.map(meta => {
            metaValidationItems.push({ key: meta.name, value: meta.label, required: true, type: Enums.ControlType.Text });
        });

        const { isValid, errors } = Helper.validateInputs(metaValidationItems);
        setMetaDataLabelErrors(errors);
        return isValid;
    };

    function validationMetaDataValidationMessage() {
        let metaData = parseMetaData();
        let metaValidationItems = [];
        metaData.inputs.map(meta => {
            metaValidationItems.push({ key: meta.name, value: meta.validationMessage, required: true, type: Enums.ControlType.Text });
        });

        const { isValid, errors } = Helper.validateInputs(metaValidationItems);
        setMetaDataValidationErrors(errors);
        return isValid;
    };

    async function submitWebForm() {
        let submitFinished = false;

        let validationItems = [
            { key: 'Name', value: inputs.Name, required: true, type: Enums.ControlType.Text },
            { key: 'Origin', value: inputs.Origin, required: true, type: Enums.ControlType.Text },
            { key: 'QueryTypeID', value: inputs.QueryTypeID, required: true, type: Enums.ControlType.Text },
            { key: 'QueryStatusID', value: inputs.QueryStatusID, required: true, type: Enums.ControlType.Text },
            { key: 'WebFormType', value: inputs.WebFormType, required: true, type: Enums.ControlType.Select },
            { key: 'Title', value: inputs.Title, required: false, type: Enums.ControlType.Text },
            { key: 'Style', value: inputs.Style, required: true, type: Enums.ControlType.Style },
            { key: 'FollowUpTimespan', value: inputs.FollowUpTimespan, required: true, type: Enums.ControlType.Number, gte: 0 }
        ];

        let { isValid, errors } = Helper.validateInputs(validationItems);

        if (!errors.Origin) {
            if (inputs.Origin.indexOf("http://") === -1 && inputs.Origin.indexOf("https://") === -1) {
                errors.Origin = "Domain must start with http:// or https://";
                isValid = false;
            } else if (inputs.Origin.indexOf(".") === -1 && inputs.Origin.toLowerCase().indexOf("localhost") === -1) {
                errors.Origin = "Domain malformed";
                isValid = false;
            } else if (inputs.Origin.replace("://", "").indexOf("/") > -1) {
                errors.Origin = "Only the domain is required, eg https://mywebsite.com";
                isValid = false;
            }
        }
        setInputErrors(errors);

        const metaLabelIsValid = isNew ? true : validationMetaDataLabel();
        const metaValidationIsValid = isNew ? true : validationMetaDataValidationMessage();

        if (isValid && metaLabelIsValid && metaValidationIsValid) {

            setSaving(true);

            let webFormToSave = { ...webForm };
            webFormToSave.Name = inputs.Name;
            webFormToSave.WebFormType = inputs.WebFormType;
            webFormToSave.Origin = inputs.Origin;
            webFormToSave.QueryTypeID = inputs.QueryTypeID;
            webFormToSave.MetaData = inputs.MetaData;
            webFormToSave.IsActive = inputs.IsActive;
            webFormToSave.Title = inputs.Title;
            webFormToSave.Style = inputs.Style;
            webFormToSave.FollowUpTimespan = inputs.FollowUpTimespan;
            webFormToSave.EmployeeID = inputs.EmployeeID;
            webFormToSave.QueryStatusID = inputs.QueryStatusID;

            let params = webFormToSave;

            if (isNew) {
                params.ColumnCount = inputs.ColumnCount;

                const webFormPostResponse = await Fetch.post({
                    url: '/WebForm',
                    params: params
                });
                if (webFormPostResponse.ID) {

                    setFormIsDirty(false);
                    await Helper.waitABit();
                    toast.setToast({
                        message: 'Web Form created successfully',
                        show: true,
                        type: 'success'
                    });
                    Helper.nextRouter(Router.push, '/settings/webform/[id]', '/settings/webform/' + webFormPostResponse.ID);
                } else {
                    toast.setToast({
                        message: webFormPostResponse.serverMessage,
                        show: true,
                        type: Enums.ToastType.error
                    });
                }
            } else {
                const webFormPostResponse = await Fetch.put({
                    url: '/WebForm',
                    params: params
                });
                if (webFormPostResponse.ID) {
                    setWebForm(webFormPostResponse);
                    setFormIsDirty(false);
                    toast.setToast({
                        message: 'Web Form saved successfully',
                        show: true,
                        type: 'success'
                    });
                    submitFinished = true;
                } else {
                    toast.setToast({
                        message: webFormPostResponse.serverMessage,
                        show: true,
                        type: Enums.ToastType.error
                    });
                }
            }
        } else {
            toast.setToast({
                message: 'There are errors on the page.',
                show: true,
                type: 'error'
            });
        }

        setSaving(false);
        return submitFinished;
    }

    const typeChanged = (type) => {
        setInputErrors({ ...inputErrors, WebFormType: null });
        setInputs({
            ...inputs,
            WebFormType: type ? type.value : null
        });
        setFormIsDirty(true);
    };

    const queryTypeChanged = (type) => {
        setInputErrors({ ...inputErrors, QueryTypeID: null });
        setInputs({
            ...inputs,
            QueryTypeID: type ? type.ID : null,
            QueryStatusID: null,
            QueryType: type
        });
        setSelectedQueryType(type);
        setSelectedQueryStatus(null);
        setFormIsDirty(true);
    };

    const queryStatusChanged = (status) => {
        setInputErrors({ ...inputErrors, QueryStatusID: null });
        setInputs({
            ...inputs,
            QueryStatusID: status ? status.ID : null,
            QueryStatus: status
        });
        setSelectedQueryStatus(status);
        setFormIsDirty(true);
    };

    const copyToClipboard = (text) => {
        let tempInput = document.createElement("input");
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);

        toast.setToast({
            message: 'Copied to clipboard',
            show: true,
            type: 'success'
        });
    };


    const [apiHost, setApiHost] = useState("");
    const [scriptEmbed, setScriptEmbed] = useState("");
    const [divEmbed, setDivEmbed] = useState("");
    const [divMetaDataCSS] = useState(`<meta name="servcraft-css-override" content=".form-control { border-radius: 0px; }" />`);

    const preview = () => {
        window.open(`${window.origin}/webform/${encodeURIComponent(btoa(window.origin))}/${encodeURIComponent(btoa(webForm.Key))}/${encodeURIComponent(btoa(apiHost))}`, "_blank");
    };

    const getStyleColour = (key) => {
        return JSON.parse(inputs.Style)[key];
    }

    const setStyleColour = (key, colourHex) => {
        let style = JSON.parse(inputs.Style);
        style[key] = colourHex;
        setInputErrors({ ...inputErrors, Style: null });
        setInputs({
            ...inputs,
            Style: JSON.stringify(style)
        });
    }

    const assignEmployee = (employee) => {
        setInputs({
            ...inputs,
            EmployeeID: employee ? employee.ID : null
        });
        setWebForm({
            ...webForm,
            Employee: employee
        });
    };

    const cancel = () => {
        Helper.nextRouter(Router.push, "/settings/webform/list");
    };

    return (<>
        <div className="settings-card">
            <div className="">
                <div className="">

                    <div className="row">
                        <div className="column">
                            <h3>{isNew ? "Create" : "Edit"} Web Form</h3>
                        </div>
                        {isNew ? "" : <div className="column column-end ">
                            <div className="actions">
                                <Button disabled={accessStatus === Enums.AccessStatus.LockedWithOutAccess && customerStatus !== "Trial"}
                                    text={saving ? "Saving" : 'Save'} onClick={saving ? null : submitWebForm} extraClasses="auto" />
                                <Button text={"Preview"} onClick={preview} extraClasses="auto hollow" />
                                <Button text={"Cancel"} onClick={cancel} extraClasses="auto hollow" />

                            </div>
                        </div>}
                    </div>

                    <div>
                        {isNew ? <>
                            <p>Select one of our predefined forms to embed in your website. We will provide instructions once your form is created.</p>
                        </> : <>
                            <p>Place this script inside the <code>&lt;head&gt;</code> element of your web page.</p>
                            {/* https://tinyurl.com/scemb would work as an example */}
                            <button className="copy-button" onClick={() => copyToClipboard(scriptEmbed)}>Copy</button> <code className="code">{scriptEmbed}</code>

                            <p>Place this element in the <code>&lt;body&gt;</code> element of your web page where you would like the form to be.</p>
                            <button className="copy-button" onClick={() => copyToClipboard(divEmbed)}>Copy</button> <code className="code">{divEmbed}</code>

                            <p>(Optional) Example meta tag to inject css for customised styles in the <code>&lt;head&gt;</code> element of your web page.</p>
                            <button className="copy-button" onClick={() => copyToClipboard(divMetaDataCSS)}>Copy</button> <code className="code">{divMetaDataCSS}</code>

                            <p>Please note, the form will only work when hosted on your website domain. Only a single form is allowed per page.</p>
                        </>}
                    </div>

                    <div>
                        {isNew ? "" : <h3>Web Form Details</h3>}
                        <div className="row">
                            <div className="column">
                                <SCInput
                                    onChange={handleInputChange}
                                    error={inputErrors.Name}
                                    label={"Name"}
                                    name="Name"
                                    required={true}
                                    value={inputs.Name}
                                />
                            </div>
                            <div className="column">
                                <SCInput
                                    onChange={handleInputChange}
                                    error={inputErrors.Title}
                                    label={"Title"}
                                    name="Title"
                                    required={false}
                                    value={inputs.Title}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="column">
                                <SCDropdownList
                                    label="Type"
                                    required={true}
                                    options={types}
                                    dataItemKey="value"
                                    disabled={!isNew}
                                    textField="description"
                                    value={() => inputs.WebFormType ? types.find(x => x.value === inputs.WebFormType) : null}
                                    onChange={typeChanged}
                                    name="WebFormType"
                                    error={inputErrors.WebFormType}
                                />
                            </div>
                            <div className="column">
                                <SCInput
                                    onChange={handleInputChange}
                                    error={inputErrors.Origin}
                                    label={"Your website domain"}
                                    name="Origin"
                                    hint={"eg https://mywebsite.com"}
                                    required={true}
                                    value={inputs.Origin}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="column">
                                <QueryTypeSelector
                                    accessStatus={accessStatus}
                                    canClear={false}
                                    error={inputErrors.QueryTypeID}
                                    ignoreAddOption={false}
                                    includeDisabled={false}
                                    placeholder="Select query type"
                                    required={true}
                                    selectedQueryType={selectedQueryType}
                                    setSelectedQueryType={queryTypeChanged}
                                />
                                {/* <SCComboBox
                                    label="Query Type"
                                    required={true}
                                    dataItemKey="ID"
                                    textField="Description"
                                    options={queryTypes}
                                    value={inputs.QueryTypeID ? queryTypes.find(x => x.ID === inputs.QueryTypeID) : null}
                                    error={inputErrors.QueryTypeID}
                                    name="QueryTypeID"
                                    onChange={queryTypeChanged}
                                /> */}
                            </div>
                            <div className="column">
                                <QueryStatusSelector
                                    accessStatus={accessStatus}
                                    canClear={false}
                                    error={inputErrors.QueryStatusID}
                                    ignoreAddOption={false}
                                    includeDisabled={false}
                                    placeholder="Select query status"
                                    queryType={selectedQueryType}
                                    required={true}
                                    selectedQueryStatus={selectedQueryStatus}
                                    setSelectedQueryStatus={queryStatusChanged}
                                />
                                {/* <SCComboBox
                                    label="Query Status"
                                    required={true}
                                    options={queryStatuses.filter(x => x.QueryTypeID === inputs.QueryTypeID && x.IsActive)}
                                    value={inputs.QueryStatusID ? queryStatuses.find(x => x.ID === inputs.QueryStatusID) : null}
                                    error={inputErrors.QueryStatusID}
                                    name="QueryStatusID"
                                    onChange={queryStatusChanged}
                                    dataItemKey="ID"
                                    textField="Description"
                                /> */}
                            </div>
                        </div>

                        <div className="row">
                            <div className="column">
                                <SCNumericInput
                                    onChange={handleInputChange}
                                    error={inputErrors.FollowUpTimespan}
                                    label={"Follow Up Time in Minutes"}
                                    name="FollowUpTimespan"
                                    required={true}
                                    value={inputs.FollowUpTimespan}
                                    min={0}
                                    format={Enums.NumericFormat.Integer}
                                />
                            </div>
                            <div className="column">
                                <AssignEmployee
                                    selectedEmployee={webForm.Employee}
                                    setSelected={assignEmployee}
                                    storeID={null} />
                            </div>
                        </div>

                        <div className="row">
                            <div className="column">
                                <SCComboBox
                                    onChange={handleColCountChange}
                                    label={"Columns"}
                                    name="Columns"
                                    required={true}
                                    value={isNew ? inputs.ColumnCount : parseMetaData().colCount}
                                    options={[1, 2]}
                                    canClear={false}
                                    canSearch={false}
                                />
                            </div>
                            <div className="column">
                            </div>
                        </div>


                        <div className="row">
                            <div className="column">
                                <span onClick={() => { setBackgroundColour(!backgroundColour); setColorColour(!colorColour); }}
                                    className="style-button">
                                    {backgroundColour || colorColour ? "Done" : "Edit Form Style"}
                                </span>
                            </div>

                            {backgroundColour ? <div className="column">
                                <span className="style-heading">Background Colour</span>
                                <SketchPicker
                                    disableAlpha={false}
                                    color={getStyleColour("background")}
                                    onChangeComplete={(color) => { setStyleColour("background", color.hex); }}
                                />
                            </div> : ""}
                            {colorColour ? <div className="column">
                                <span className="style-heading">Text Colour</span>
                                <SketchPicker
                                    disableAlpha={false}
                                    color={getStyleColour("color")}
                                    onChangeComplete={(color) => { setStyleColour("color", color.hex); }}
                                />
                            </div> : ""}
                        </div>

                    </div>

                    {isNew ? <>
                        <div className="actions">
                            <Button text="Create" extraClasses="auto" onClick={submitWebForm} />
                            <Button text="Cancel" extraClasses="auto hollow" onClick={cancel} />
                        </div>
                    </> : <>
                        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                            <h3>Edit Form Items</h3>

                            {inputs.MetaData && parseMetaData().inputs.map((meta, key) => {
                                return (<div key={key} className="row">

                                    <div className="column">

                                        <SCInput
                                            onChange={handleMetaDataLabelChange}
                                            error={metaDataLabelErrors[meta.name]}
                                            label={`Label for ${meta.name}`}
                                            name={meta.name}
                                            required={true}
                                            value={meta.label}
                                        />

                                    </div>&nbsp;
                                    <div className="column narrow">
                                        <SCCheckbox
                                            disabled={!meta.allowOptional}
                                            onChange={() => { handleMetaDataRequiredChange(meta) }}
                                            value={meta.required}
                                            label="Required"
                                        />
                                    </div>
                                    <div className="column">
                                        {meta.required ?
                                            <SCInput
                                                onChange={handleMetaDataValidationChange}
                                                error={metaDataValidationErrors[meta.name]}
                                                label={`Validation message for ${meta.name}`}
                                                name={meta.name}
                                                required={true}
                                                value={meta.validationMessage}
                                            />
                                            : ""}
                                    </div>
                                </div>);
                            })}
                        </div>

                        <div className="section">
                            <h3>Active</h3>
                            <SCSwitch checked={inputs.IsActive}
                                onToggle={(checked) => handleInputChange({ name: 'IsActive', value: checked })} />
                            {/*<ReactSwitch checked={inputs.IsActive}
                                handleChange={(checked) => handleInputChange({ name: 'IsActive', value: checked })} />*/}
                        </div>
                    </>}

                </div>
            </div>
        </div>
        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

        <style jsx>{`

            .style-button {
                color: ${getStyleColour("color")};
                background: ${getStyleColour("background")};
                padding: 0 1rem;
                height: 2.5rem;
                cursor: pointer;
                border-radius: 4px;
                border: 1px solid #003ED0;
                font-weight: bold;
                display: flex;
                width: fit-content;
                align-items: center;
                justify-content: center;
                margin-top: 1.5rem;
                position: relative;
            }

            .style-heading {
                margin: 24px 0 8px 0;
                font-weight: bold;
            }

            .actions {
                margin-top: 1rem;
                padding-bottom: 1rem;
                display: flex;
                flex-direction: row-reverse;
            }

            .actions :global(.button){
                margin-left: 0.5rem;
                margin-top: 0;
                padding: 0 1rem;
                white-space: nowrap;
            }

            .copy-button {
            background: lightgrey;
                padding: 8px;
                border-radius: 3px;
                border: none;
                cursor: pointer;
            }

            .code {
                background: lightgrey;
                padding: 8px;
                border-radius: 3px;
                line-height: 32px;
            }

            .add-location {
            align-items: center;
            color: ${colors.bluePrimary};
            cursor: pointer;
            display: flex;
            font-weight: bold;
            }
            .add-location img {
            margin: 2px 0.5rem 0 0;
            }
            .container {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 1.5rem 3rem;
            overflow-x: hidden;
            }
            .column {
            display: flex;
            flex-direction: column;
            width: ${layout.inputWidth};
            }
            .column + .column {
            margin-left: 1.25rem;
            }
            .column-end {
            align-items: flex-end;
            }
            .column.narrow {
            width: 90px;
            min-width: 90px;
            padding-top: 2rem;
            }
            .column-margin {
            margin-left: 24px;
            }
            .button-container {
            flex-shrink: 0;
            width: 10rem;
            }
            .button-container :global(.button){
            margin-top: 0.5rem;
            }
            .title {
            align-items: center;
            color: ${colors.darkPrimary};
            display: flex;
            height: 2.5rem;
            width: 100%;
            }
            .title h1 {
            font-size: 32px;
            margin: 6px 0 2rem 0;
            }
            .title p {
            font-size: 14px;
            margin: 0;
            }
            .row {
            display: flex;
            }
            .row-align {
            align-items: center;
            height: 1.75rem
            }
            .empty {
            align-items: center;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            height: fit-content;
            justify-content: center;
            margin-left: 1.5rem;
            width: 520px;
            }
            .empty img {
            height: 110px;
            margin-bottom: 1rem;
            }
            .empty h3 {
            color: ${colors.darkSecondary};
            font-size: 16px;
            margin: 0 0 0.75rem;
            }
            .empty p {
            color: ${colors.blueGrey};
            margin: 0;
            text-align: center;
            }
`}</style>

    </>)
};
