import Helper from '../../../utils/helper';
import { useEffect, useState, useContext } from 'react';
import { colors, layout, tickSvg } from '../../../theme';
import { Button, Flex, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import SCModal from '../../../PageComponents/Modal/SCModal';

import SCInput from '../../sc-controls/form-controls/sc-input';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCMultiSelect from '../../sc-controls/form-controls/sc-multiselect';
import SCDatePicker from '../../sc-controls/form-controls/sc-datepicker';
import SCTimePicker from '../../sc-controls/form-controls/sc-timepicker';

import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ButtonDropdown from '../../button-dropdown';
import OptionService from '../../../services/option/option-service';
import BusyIndicatorContext from '../../../utils/busy-indicator-context';
import Time from '../../../utils/time';
import Constants from '../../../utils/constants';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';

const CompleteTaskItem = ({ taskItem, onTaskItemSave, accessStatus, setCompleteTaskItem, requiredFormDefinitions }) => {

    const busyIndicator = useContext(BusyIndicatorContext);
    const [saving, setSaving] = useState(false);
    const [markingIncomplete, setMarkingIncomplete] = useState(false);

    useEffect(() => {
        if (taskItem.ItemDataType === "Select" || taskItem.ItemDataType === "MultiSelect") {
            let opts = Helper.deserializeCustomCSV(taskItem.ItemDataOption);
            setOptions(opts);
        } else if (taskItem.ItemDataType === "CustomerSignature") {
            getCustomerSignature();
        } else if (taskItem.ItemDataType === "EmployeeSignature") {
            getEmployeeSignature();
        } else if (taskItem.ItemDataType === "Attachment" || taskItem.ItemDataType === "TakePhoto") {
            getAttachments();
        } else if (taskItem.ItemDataType === "CompleteForms") {
            getForms();
        }
    }, []);

    const [inputValue, setInputValue] = useState(taskItem.ItemDataResult);
    const [inputError, setInputError] = useState(null);

    const [options, setOptions] = useState([]);
    const [isString] = useState(taskItem.ItemDataType === "String");
    const [isNumber] = useState(taskItem.ItemDataType === "Number");
    const [isBoolean] = useState(taskItem.ItemDataType === "Boolean");
    const [isDate] = useState(taskItem.ItemDataType === "Date");
    const [isDateTime] = useState(taskItem.ItemDataType === "DateTime");
    const [isAttachment] = useState(taskItem.ItemDataType === "Attachment");
    const [isTakePhoto] = useState(taskItem.ItemDataType === "TakePhoto");
    const [isSelect] = useState(taskItem.ItemDataType === "Select");
    const [isMultiSelect] = useState(taskItem.ItemDataType === "MultiSelect");
    const [isCustomerSignature] = useState(taskItem.ItemDataType === "CustomerSignature");
    const [isEmployeeSignature] = useState(taskItem.ItemDataType === "EmployeeSignature");
    const [isCompleteForms] = useState(taskItem.ItemDataType === "CompleteForms");

    const [customerSignature, setCustomerSignature] = useState(null);
    const [employeeSignature, setEmployeeSignature] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [attachmentChoices, setAttachmentChoices] = useState([]);

    const [attachmentType, setAttachmentType] = useState(null);
    const [formsCompleted, setFormsCompleted] = useState(false);


    const markIncomplete = async () => {
        taskItem.ItemDataResult = null;
        taskItem.Complete = false;

        setMarkingIncomplete(true);
        await onTaskItemSave(taskItem);
        setMarkingIncomplete(false);
    };

    const getCustomerSignature = async () => {
        const result = await Fetch.get({
            url: '/Attachment/GetItemAttachments',
            params: {
                itemID: taskItem.ItemID,
                excludeSignatures: false
            }
        });

        const sigResult = result.Results.filter(x => x.AttachmentType === Enums.AttachmentType.CustomerSignature);

        const custSig = sigResult.length > 0 ? sigResult[0].ID : null;

        setCustomerSignature(custSig);
        setSelectedSimple(custSig);
    };

    const getEmployeeSignature = async () => {
        const result = await Fetch.get({
            url: '/Attachment/GetItemAttachments',
            params: {
                itemID: taskItem.ItemID,
                excludeSignatures: false
            }
        });

        const sigResult = result.Results.filter(x => x.AttachmentType === Enums.AttachmentType.TechnicianSignature);

        const emplSig = sigResult.length > 0 ? sigResult[0].ID : null;

        setEmployeeSignature(emplSig);
        setSelectedSimple(emplSig);
    };

    const getFormExpired = (formHeader) => {
        if (!formHeader.ExpireDate) {
            return false;
        }
        return Time.now().valueOf() > Time.parseDate(formHeader.ExpireDate).valueOf();
    };

    const getForms = async () => {
        let formHeaderResponse = await Fetch.get({
            url: "/Form/GetByItemID",
            params: {
                itemID: taskItem.ItemID,
                itemModule: taskItem.Module
            }
        });

        const formHeaders = formHeaderResponse.Results;
        let canContinue = true;
        if (requiredFormDefinitions) {
            requiredFormDefinitions.filter(x => x.IsActive).forEach(formDefinition => {
                let header = formHeaders.find(x => x.FormDefinitionID === formDefinition.ID);
                if (!header || header.FormStatus !== Enums.FormStatus.Completed || getFormExpired(header)) {
                    canContinue = false;
                }
            });
        }

        setFormsCompleted(canContinue);
        if (canContinue) {
            setInputValue("Completed");
        } else {
            setInputValue(null);
        }

    };

    const getAttachments = async () => {
        const result = await Fetch.get({
            url: '/Attachment/GetItemAttachments',
            params: {
                itemID: taskItem.ItemID,
                excludeSignatures: true
            }
        });

        let results = result.Results;

        if (taskItem.ItemDataType === "TakePhoto") {
            results = results.filter(x => x.ContentType && x.ContentType.toLowerCase().indexOf("image/") > -1);
        }

        setAttachmentChoices(results);

        let attachs = [];
        const attachmentIDs = Helper.deserializeCustomCSV(taskItem.ItemDataResult);
        if (attachmentIDs.length > 0) {
            attachmentIDs.forEach(id => {
                let attach = result.Results.find(x => x.ID == id);
                if (attach) {
                    attachs.push(attach);
                }
            });
        }
        setAttachments(attachs);
    }

    const saveTaskItem = async () => {

        if (Helper.isNullOrWhitespace(inputValue)) {
            setInputError("Value is required");
            return;
        }

        let val = inputValue;

        if (taskItem.ItemDataType === "DateTime") {
            val = Time.toISOString(val, false, true);
        } else if (taskItem.ItemDataType === "Date") {
            val = Time.toISOString(val, false, false);
        }

        val = val?.toString();

        taskItem.ItemDataResult = val;
        taskItem.Complete = true;

        setSaving(true);
        await onTaskItemSave(taskItem);
        setSaving(false);
    };

    const textChangeHandler = (e) => {
        setInputValue(e.value);
        setInputError(null);
    };

    const setSelectedSimple = (option) => {
        let result = option;

        setInputValue(result);
        setInputError(null);
    };

    const setSelectedSimpleDate = (option) => {
        let result = option.value;

        setInputValue(result);
        setInputError(null);
    };

    const getDataOptions = () => {
        return Helper.deserializeCustomCSV(taskItem.ItemDataOption);
    };

    const getSelectedOptions = () => {
        return Helper.deserializeCustomCSV(inputValue);
    };

    const setSelectedMultiple = (option) => {
        setSelectedSimple(Helper.serializeCustomCSV(option));
    };

    const selectAttachment = (attachment, forceOne) => {
        let attachmentsTemp = [...attachments];
        let idx = attachmentsTemp.findIndex(x => x.ID === attachment.ID);
        if (idx > -1) {
            attachmentsTemp.splice(idx, 1);
        } else {
            if (forceOne) attachmentsTemp = [];
            attachmentsTemp.push(attachment);
        }
        setAttachments(attachmentsTemp);
        setSelectedSimple(Helper.serializeCustomCSV(attachmentsTemp.map(x => x.ID)));
    };

    const chooseAttachment = (type) => {
        setAttachmentType(parseInt(type));
        document.getElementById('js-attachment-input').click();
    };

    const handleAttachmentChange = (e) => {
        console.log(e);
        busyIndicator.setText("Uploading...");

        let reader = new FileReader();
        let file = e.target.files[0];
        reader.onloadend = async function () {

            let fileSizeSetting = await OptionService.getOption('System Settings', 'File Upload Size');
            let fileSizeUnit = fileSizeSetting ? fileSizeSetting.Unit : 'mb';
            let fileSizeValue = fileSizeSetting ? parseInt(fileSizeSetting.OptionValue) : 2;

            if (isTakePhoto && !reader.result.startsWith("data:image/")) {
                showNotification({
                    message: `The attachment must be an image`,
                    color: 'yellow.7'
                });
                busyIndicator.setText(null);
                return;
            }

            var b64 = reader.result.replace(/^data:.+;base64,/, '');
            let uploadLength = 2;

            if (fileSizeUnit == 'kb') {
                uploadLength = b64.length / 1024;
            } else if (fileSizeUnit == 'mb') {
                uploadLength = b64.length / 1024 / 1024;
            } else if (fileSizeUnit == 'gb') {
                uploadLength = b64.length / 1024 / 1024 / 1024;
            }

            // base64 converts 6bits to 8bits when encoding, so the actual file size is 3/4
            let scalingFactor = Constants.base64BitScalingFactor;
            uploadLength *= scalingFactor;

            if (uploadLength > parseFloat(fileSizeValue)) {
                showNotification({
                    message: `The attachment must be smaller than ${fileSizeValue}${fileSizeUnit}`,
                    color: 'yellow.7'
                });
            } else {
                const attachmentRes = await Fetch.post({
                    url: '/Attachment',
                    params: {
                        AttachmentType: attachmentType,
                        Description: file.name,
                        FileName: file.name,
                        FileBase64: b64,
                        ItemID: taskItem.ItemID,
                        Module: taskItem.Module,
                    },
                });

                if (attachmentRes.ID) {
                    showNotification({
                        message: 'Attachment uploaded successfully',
                        color: 'scBlue'
                    });
                    await getAttachments();
                    selectAttachment(attachmentRes, isTakePhoto);
                } else {
                    showNotification({
                        message: attachmentRes.error || 'Attachment upload failed',
                        color: 'yellow.7'
                    });
                }
            }

            busyIndicator.setText(null);
        };
        reader.readAsDataURL(file);
    };

    return (<>
        <SCModal
            open={true}
            onClose={() => setCompleteTaskItem(null)}
            size={700}
        >
            <Title order={3} style={{ color: colors.bluePrimary }}>
                Complete Task ({Enums.TaskTemplateDataTypes[taskItem.ItemDataType]})
            </Title>
                <h4>{taskItem.Description}</h4>
                {
                    isString ? <>
                        <SCInput
                            label="Text"
                            value={inputValue}
                            error={inputError}
                            onChange={textChangeHandler}
                        />
                    </> : isNumber ? <>
                        <SCNumericInput
                            label="Number"
                            value={inputValue}
                            error={inputError}
                            format={Enums.NumericFormat.Decimal}
                            onChange={textChangeHandler}
                        />
                    </> : isBoolean ? <>
                        <SCComboBox
                            label="Yes or No"
                            options={["Yes", "No"]}
                            value={inputValue}
                            error={inputError}
                            onChange={setSelectedSimple}
                        />
                    </> : isDate ? <>
                        <SCDatePicker
                            changeHandler={setSelectedSimpleDate}
                            label='Date'
                            required={true}
                            error={inputError}
                            value={inputValue}
                        />
                    </> : isDateTime ? <>
                        <SCDatePicker
                            changeHandler={setSelectedSimpleDate}
                            label='Date'
                            required={true}
                            error={inputError}
                            value={inputValue}
                        />

                        <SCTimePicker
                            changeHandler={setSelectedSimpleDate}
                            label="Time"
                            required={true}
                            error={inputError}
                            value={inputValue}
                            format="HH:mm:ss"
                        />
                    </> : isAttachment ? <>

                        {attachmentChoices.length === 0 ? <>No attachments available to select</> : ""}

                        {attachmentChoices.map(function (attachment, index) {
                            const attachmentSelected = attachments.findIndex(x => x.ID === attachment.ID) > -1;
                            return (
                                <div key={'attch' + index} className={`option ${attachmentSelected ? "selected" : ""}`} onClick={() => selectAttachment(attachment, false)}>
                                    <div className="box"></div>
                                    {attachment.Description}

                                    {attachment.ThumbnailSize > 0 ?
                                        (attachment.UrlThumb ? <img className="thumb" src={attachment.UrlThumb} height="48" /> : '')
                                        : attachment.ContentType === "image/svg+xml" ? <img className="thumb" src={attachment.Url} style={{ height: "48px" }} />
                                            : <img src="/attachments/file.svg" className="thumb" />
                                    }
                                </div>
                            )
                        })}

                        <br />
                        <div className="attachment-upload-button">
                            <ButtonDropdown
                                disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                action={chooseAttachment}
                                text="Add Attachment"
                                options={[
                                    { text: 'Other', link: '0' },
                                    { text: 'Quote', link: '1' },
                                    { text: 'Invoice', link: '2' },
                                    { text: 'POP', link: '3' },
                                    { text: 'POD', link: '4' },
                                    { text: 'Image', link: '5' },
                                    { text: 'Audio', link: '6' },
                                    { text: 'Contract', link: '7' },
                                    { text: 'Logo', link: '11' },
                                    { text: 'Job Card', link: '12' },
                                    { text: 'None', link: '99' },
                                ]}
                            />
                        </div>

                        <input type="file" id="js-attachment-input" className="hidden-file-input" onChange={handleAttachmentChange} />

                        {inputError ? <span className="error">At least one attachment must be selected, or mark as incomplete</span> : ""}


                    </> : isTakePhoto ? <>

                        {attachmentChoices.length === 0 ? <>No photos available to select</> : ""}

                        {attachmentChoices.map(function (attachment, index) {
                            const attachmentSelected = attachments.findIndex(x => x.ID === attachment.ID) > -1;
                            return (
                                <div key={'attop' + index} className={`option ${attachmentSelected ? "selected" : ""}`} onClick={() => selectAttachment(attachment, true)}>
                                    <div className="box"></div>
                                    {attachment.Description}

                                    {attachment.ThumbnailSize > 0 ?
                                        (attachment.UrlThumb ? <img className="thumb" src={attachment.UrlThumb} height="48" /> : '')
                                        : attachment.ContentType === "image/svg+xml" ? <img className="thumb" src={attachment.Url} style={{ height: "48px" }} />
                                            : <img src="/attachments/file.svg" className="thumb" />
                                    }
                                </div>
                            )
                        })}

                        <br />
                        <div className="attachment-upload-button">
                            <ButtonDropdown
                                disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                action={chooseAttachment}
                                text="Add Photo"
                                options={[
                                    { text: 'Image', link: '5' },
                                ]}
                            />
                        </div>

                        <input type="file" id="js-attachment-input" accept="image/*" className="hidden-file-input" onChange={handleAttachmentChange} />

                        {inputError ? <span className="error">One photo must be selected, or mark as incomplete</span> : ""}

                    </> : isSelect ? <>
                        <SCComboBox
                            label="Select"
                            options={getDataOptions()}
                            value={inputValue}
                            error={inputError}
                            onChange={setSelectedSimple}
                        />
                    </> : isMultiSelect ? <>
                        <SCMultiSelect
                            label="Multiselect"
                            availableOptions={getDataOptions()}
                            selectedOptions={getSelectedOptions()}
                            error={inputError}
                            onChange={setSelectedMultiple}
                        />
                    </> : isCustomerSignature ? <>
                        {customerSignature ? <>
                            Signature has already been captured, click Save Item to close this task.
                        </> : <>
                            Please capture customer's signature to close this task.
                        </>}
                    </> : isEmployeeSignature ? <>
                        {employeeSignature ? <>
                            Signature has already been captured, click Save Item to close this task.
                        </> : <>
                            Please capture employee's signature to close this task.
                        </>}
                    </> : isCompleteForms ? <>
                        {formsCompleted ? <>
                            Required forms have been completed, click Save Item to close this task.
                        </> : <>
                            Please complete all required forms to close this task.
                        </>}
                    </> :
                        ""}


            <Flex justify={'flex-end'} gap={'sm'} mt={'lg'}>
                <Button variant="subtle" color={'gray.7'} onClick={() => setCompleteTaskItem(null)} disabled={saving || markingIncomplete}>Cancel</Button>

                {(taskItem.Complete || markingIncomplete) ?
                    <Button variant="outline" onClick={markIncomplete} disabled={saving || markingIncomplete} loading={markingIncomplete}>Mark as Incomplete</Button>
                    : ""}
                <Button onClick={saveTaskItem} disabled={saving || markingIncomplete} loading={saving}>Save Item</Button>
            </Flex>
        </SCModal>

        <style jsx>{`        
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
        }
        .align-end {
            justify-content: flex-end;
            align-items: flex-end;
          }
        .title {
            color: ${colors.bluePrimary};
            font-size: 1.125rem;
            font-weight: bold;
          }

        .inventory-item-container {
          display: flex;
          flex-direction: row;
          width: 100%;
        }
        .description-container {

        }
        .integration-message {
          display: flex;
          flex-direction: row-reverse;
        }
        .pending {
          color: ${colors.labelGrey};
        }
        .error {
          color: ${colors.warningRed};
        }
        .synced {
          color: ${colors.green};
        }
        .total-row {
          font-weight: bold;
          margin-top: 1rem;
        }
        .end {
          align-items: flex-end;
        }
        .cancel {
          width: 6rem;
        }
        .incomplete {
            width: 10rem;
        }
        .update {
          width: 10rem;
        }
        .left-padding {
          padding-left: 0.5em;
        }
        .right-padding {
          padding-right: 0.5em;
        }

        .option {
            align-items: center;
            cursor: pointer;
            display: flex;
            height: 48px;
            position: relative;
            margin-bottom: 32px;
          }

        .thumb {
            position: absolute;
            right: 0;
          }

          .box {
            border: 1px solid ${colors.labelGrey};
            border-radius: ${layout.inputRadius};
            box-sizing: border-box;
            cursor: pointer;
            height: 1rem;
            margin-right: 1rem;
            opacity: 0.4;
            width: 1rem;
          }
          .selected .box {
            background-color: ${colors.bluePrimary};
            background-image: ${tickSvg};
            background-position: center;
            background-repeat: no-repeat;
            background-size: 70%;
            border: none;
            opacity: 1;
          }

          .hidden-file-input {
            display: none;
          }

          .attachment-upload-button {
              width: 200px;
          }
      `}</style>
    </>);
};

export default CompleteTaskItem;