import React, { useState, useContext, useRef, createRef, useEffect } from 'react';
import Router from 'next/router';
import Button from '../../components/button';
import SCInput from '../../components/sc-controls/form-controls/sc-input';
import SCTextArea from '../../components/sc-controls/form-controls/sc-textarea';
import Fetch from '../../utils/Fetch';
import ReplacementTags from '../../components/modals/template/replacement-tags';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';
import ConfirmAction from '../../components/modals/confirm-action';
import Storage from '../../utils/storage';
import { Editor, EditorTools, EditorUtils } from '@progress/kendo-react-editor';
import ReactSwitch from '../../components/react-switch';
import NoSSR from '../../utils/no-ssr';
import KendoTooltip from '../kendo/kendo-tooltip';
import { layout } from '../../theme';
import TemplateService from '../../services/template-service';

const EditTemplate = (props) => {

    const emailBodyEditorRef = useRef();

    const toast = useContext(ToastContext);

    const { Bold, Italic, Underline,
        AlignLeft, AlignRight, AlignCenter,
        Indent, Outdent,
        OrderedList, UnorderedList,
        InsertTable,
        Undo, Redo, Link, Unlink, ViewHtml } = EditorTools;

    const getCharacterCount = (text) => {
        if (text) {
            return text.length.toString();
        }
        return 0;
    };

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [template, setTemplate] = useState(props.template);

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
    const [characterCount, setCharacterCount] = useState(getCharacterCount(props.template.Subject));

    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);

    const getAccessStatus = () => {
        let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
        if (subscriptionInfo) {
            setAccessStatus(subscriptionInfo.AccessStatus);
        }
    };

    useEffect(() => {
        getAccessStatus();
        getAllReplacementTags();
    }, []);

    useEffect(() => {
        if (emailBodyEditorRef.current && emailBodyEditorRef.current.element) {
            emailBodyEditorRef.current.element.getElementsByClassName("k-toolbar")[0].title = "To add a hyperlink, first select the text you want to apply it to";
        }
    }, [emailBodyEditorRef.current]);

    useEffect(() => {
        if (accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
            Helper.nextRouter(Router.replace, "/");
        }
    }, [accessStatus]);    

    const [name, setName] = useState(template.Name);

    const handleNameChange = (e) => {
        setName(e.value);
        setFormIsDirty(true);
    };

    const [isActive, setIsActive] = useState(props.template.IsActive);

    const handleIsActiveChange = () => {
        setIsActive(!isActive);
        setFormIsDirty(true);
    };

    const module =  Enums.getEnumStringValue(Enums.Module, template.Module, true); //!isNaN(parseInt(template.Module)) ? parseInt(template.Module) : template.Module; 

    // #region Subject Editor

    const [subjectContent, setSubjectContent] = useState(props.template.Subject);

    const handleSubjectContentChange = (newContent) => {
        if (subjectContent != newContent) {
            setSubjectContent(newContent);
        }
        setFormIsDirty(true);
    };

    // #endregion

    // #region Email Editor

    const [emailBody, setEmailBody] = useState(template.EmailBody);

    const handleEmailBodyChange = (newContent) => {
        if (emailBody != newContent.html) {
            setEmailBody(newContent.html);
        }
        setFormIsDirty(true);
    };

    // #endregion

    // #region SMS Editor

    const [smsBody, setSMSBody] = useState(template.SMSBody);

    const handleSMSBodyChange = (newContent) => {
        if (smsBody != newContent) {
            setSMSBody(newContent);
            setCharacterCount(getCharacterCount(newContent));
        }
        setFormIsDirty(true);
    };

    // #endregion

    const [showReplacementModal, setShowReplacementModal] = useState(false);

    const closeReplacementModal = () => {
        setShowReplacementModal(false);
    };

    function toggleReplacementModal() {
        if (showReplacementModal) {
            setShowReplacementModal(false);
        } else {
            setShowReplacementModal(true);
        }
    }

    const [allReplacementTags, setAllReplacementTags] = useState([]);

    const getAllReplacementTags = async () => {
        const {data} = await TemplateService.getAllReplacementTags(template.Module);
        setAllReplacementTags(data);
    };

    const [inputErrors, setInputErrors] = useState({});

    // const testForValidReplacementTags = (stringToTest, type) => {
    //     let regexOpening = /{{/gi;
    //     let resultOpening = null;
    //     let openingIndices = [];

    //     let regexClosing = /}}/gi;
    //     let resultClosing = null;
    //     let closingIndices = [];

    //     while ((resultOpening = regexOpening.exec(stringToTest))) {
    //         openingIndices.push(resultOpening.index);
    //     }

    //     while ((resultClosing = regexClosing.exec(stringToTest))) {
    //         closingIndices.push(resultClosing.index);
    //     }

    //     let words = [];
    //     for (let i in openingIndices) {
    //         let word = stringToTest.substr(openingIndices[i] + 2, closingIndices[i] - openingIndices[i] - 2);            
    //         if (!Helper.isNullOrWhitespace(word)) {
    //             if (!word.includes("{") && !word.includes("}")) {
    //                 words.push(stringToTest.substr(openingIndices[i] + 2, closingIndices[i] - openingIndices[i] - 2));
    //             }
    //         }
    //     }

    //     let tags = allReplacementTags.map(x => x.Name.toLowerCase());

    //     let invalidTags = [];
    //     let excludedTags = ["paymentlink"];
    //     let tagsNotAllowedForSubject = ["link", "paymentlink", "feedback", "feedbackresponse"];

    //     for (let word of words) {
    //         let lowerCaseWord = word.toLowerCase();
    //         if (!tags.includes(lowerCaseWord) && !excludedTags.includes(lowerCaseWord)) {                              
    //             invalidTags.push("{{" + word + "}}");                
    //         }
    //         if (type == "Subject") {
    //             if (tagsNotAllowedForSubject.includes(lowerCaseWord)) {
    //                 invalidTags.push("{{" + word + "}}");
    //             }
    //         }
    //     }

    //     return invalidTags;
    // };

    const validate = () => {

        let validationItems = [];
        validationItems = [
            { key: 'Name', value: name, required: true, type: Enums.ControlType.Text },
            { key: 'Subject', value: subjectContent, required: true, type: Enums.ControlType.Text },
            { key: 'Email', value: emailBody, required: true, type: Enums.ControlType.Text },  
        ];

        const { isValid, errors } = Helper.validateInputs(validationItems);

        if (!isValid) {
            setInputErrors(errors);
            return {
                isValid: false,
                message: ""
            };
        }

        let invalidTags = [];

        if (!Helper.isNullOrWhitespace(subjectContent)) {

            let tags = TemplateService.testForValidSubject(subjectContent);
            if (tags.length > 0) {
                let message = 'Please remove the following replacement tag(s): ' + tags;
                errors['Subject'] = message
                setInputErrors(errors);
                return {
                    isValid: false,
                    message: message
                };
            }

            let subjectTags = TemplateService.testForValidReplacementTags(subjectContent, allReplacementTags);
            if (subjectTags.length > 0) {
                errors['Subject'] = 'Please fix the following replacement tag(s): ' + subjectTags;
                invalidTags.push([...subjectTags]);
            }
        }

        if (!Helper.isNullOrWhitespace(emailBody)) {
            let tags = TemplateService.testForValidReplacementTags(emailBody, allReplacementTags);
            if (tags.length > 0) {
                errors['Email'] = 'Please fix the following replacement tag(s): ' + tags;
                invalidTags.push([...tags]);
            }
        }

        if (!Helper.isNullOrWhitespace(smsBody)) {
            let tags = TemplateService.testForValidReplacementTags(smsBody, allReplacementTags);
            if (tags.length > 0) {
                errors['SMS'] = 'Please fix the following replacement tag(s): ' + tags;
                invalidTags.push([...tags]);
            }
        }

        if (invalidTags.length > 0) {
            setInputErrors(errors);
            return {
                isValid: false,
                message: 'Please fix the following replacement tag(s): ' + invalidTags
            };
        } else {
            setInputErrors({});
        }

        return {
            isValid: true,
            message: '',
        };
    };

    async function deleteTemplate() {
        setConfirmOptions({
            ...Helper.initialiseConfirmOptions(),
            confirmButtonText: "Delete Template",
            heading: "Confirm delete template?",
            text: "This action will be permanent",
            display: true,
            onConfirm: async () => {
                setDeleting(true);

                let templateToSave = await Fetch.get({
                    url: '/Template',
                    params: {id : template.ID}
                  });

                templateToSave.IsActive = false;

                const templatePut = await Fetch.put({
                    url: '/Template',
                    params: templateToSave
                });

                setDeleting(false);

                if (templatePut.ID) {
                    toast.setToast({
                        message: 'Template deleted successfully',
                        show: true,
                        type: Enums.ToastType.success
                    });

                    setFormIsDirty(false);
                    await Helper.waitABit();

                    Helper.nextRouter(Router.replace, "/settings/template/list");
                } else {
                    toast.setToast({
                        message: templatePut.serverMessage,
                        show: true,
                        type: Enums.ToastType.error
                    });
                }
            }
        });
    }

    async function saveTemplate() {
        let submitFinished = false;
        setSaving(true);

        let { isValid, message } = validate();
        if (isValid) {
            let templateToSave = template;
            templateToSave.Name = name;
            templateToSave.Subject = subjectContent;
            templateToSave.EmailBody = emailBody;
            templateToSave.SMSBody = smsBody;
            templateToSave.IsActive = (templateToSave.TemplateType == Enums.TemplateType.User ? isActive : true);
            templateToSave.Module = !isNaN(parseInt(template.Module)) ? parseInt(template.Module) : template.Module;
            templateToSave.TemplateType = !isNaN(parseInt(template.TemplateType)) ? parseInt(template.TemplateType) : template.TemplateType;

            //!isNaN(parseInt(template.Module)) ? parseInt(template.Module) : template.Module; 

            let templateResponse = {};

            if (props.fromCreate) {
                templateResponse = await Fetch.post({
                    url: '/Template',
                    params: templateToSave
                });
            } else {
                templateResponse = await Fetch.put({
                    url: '/Template',
                    params: templateToSave
                });
            }

            if (templateResponse.ID) {
                toast.setToast({
                    message: 'Template saved successfully',
                    show: true,
                    type: 'success'
                });
                Helper.mixpanelTrack(props.fromCreate ? "create-template" : "edit-template", {
                    "templateID": templateResponse.ID
                });
                
                setFormIsDirty(false);
                if (props.onSave) {
                    props.onSave(templateResponse.ID);
                } else {
                    submitFinished = true;
                }

                if (props.fromCreate && !props.fromExternalModule) {
                    await Helper.waitABit();
                    Helper.nextRouter(Router.push, `/settings/template/${templateResponse.ID}`);                    
                } else {
                    setTemplate(templateResponse);
                    setSaving(false);
                }
            } else {
                toast.setToast({
                    message: templateResponse.serverMessage,
                    show: true,
                    type: Enums.ToastType.error
                });
                setSaving(false);
            }
        } else {
            toast.setToast({
                message: message ? message : 'There are errors on the page',
                show: true,
                type: Enums.ToastType.error
            });
            setSaving(false);
        }
        
        return submitFinished;
    }

    Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveTemplate);

    const cancelClick = () => {
        if (props.fromCreate && !props.fromExternalModule) {
            Helper.nextRouter(Router.push, `/settings/template/list`);
        } else {
            props.onCancel();
        }
    };

    return (
        <>
            <div className="row">
                <div className="column">
                    <h3>Template Details</h3>
                </div>
                <div className="column column-end">
                    <div className="row">
                        {!props.fromExternalModule && !props.fromCreate ?
                            <KendoTooltip>
                                <Button disabled={template.TemplateType !== Enums.TemplateType.User || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                    text={deleting ? "Deleting" : 'Delete'} onClick={deleting ? null : deleteTemplate} extraClasses="auto hollow no-margin "
                                    tooltip={template.TemplateType !== Enums.TemplateType.User ? "Cannot delete system template" : "Delete user template"} />
                            </KendoTooltip> : ''
                        }
                        <div className="actions">
                            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                text={saving ? "Saving" : 'Save'} onClick={saving ? null : saveTemplate} extraClasses="fit-content no-margin left-margin" />
                            <Button text="Cancel" onClick={cancelClick} extraClasses="auto hollow no-margin" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <SCInput
                        label="Name of the template"
                        onChange={handleNameChange}
                        required={true}
                        value={name}
                    />
                </div>
                <div className="column">
                    <SCInput
                        label="Module"
                        required={true}
                        readOnly={true}
                        value={module}
                    />
                </div>
            </div>
            <div className="row">
                <Button text="Insert Replacement Tag" extraClasses="hollow fit-content" onClick={() => toggleReplacementModal()} />
            </div>
            <div className="row">
                <h3>Subject</h3>
            </div>
            <div className="row">
                <div className="column">
                    <SCInput
                        label="Subject"
                        onChange={(e) => handleSubjectContentChange(e.value)}
                        required={true}
                        value={subjectContent}
                        error={inputErrors.Subject}
                    />
                </div>
            </div>
            <div className="row">
                <h3>Email Template</h3>
            </div>
            <div className="row">
                <NoSSR>
                    <Editor
                        ref={emailBodyEditorRef}
                        value={emailBody ? emailBody : ''}
                        tools={[
                            [Bold, Italic, Underline,
                                AlignLeft, AlignRight, AlignCenter,
                                Indent, Outdent,
                                OrderedList, UnorderedList,
                                InsertTable,
                                Undo, Redo, Link, Unlink, ViewHtml]
                        ]}
                        onChange={handleEmailBodyChange}
                        contentStyle={{ width: "100%", height: "15rem" }}
                        style={{ borderColor: inputErrors.Email ? '#FC2E50' : 'rgba(0, 0, 0, 0.12)' }}
                    />
                </NoSSR>
            </div>
            <div className="row">
                <h3>SMS Template</h3>
            </div>
            <div className="row">
                <div className="column">
                    <SCTextArea
                        label={"SMS Template - " + characterCount + " chars"}
                        onChange={(e) => handleSMSBodyChange(e.value)}
                        required={true}
                        value={smsBody}
                        hint="NOTE: SMS's that are longer than 160 characters will incur additional credits"
                        error={inputErrors.SMS}
                    />
                </div>
            </div>

            {showReplacementModal ?
                <ReplacementTags closeReplacementModal={closeReplacementModal} module={template.Module} />
                : ''
            }

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

            <style jsx>{`
          .row {
            display: flex;
          }
          .column {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 500px;
          }
          .column :global(.textarea-container) {
            height: 100%;
          }
          .column + .column {
            margin-left: 1.25rem;
          }
          .column-end {
            align-items: flex-end;
          }
          .image-button {
            cursor: pointer;
          }
          .joditContainer {
            position: relative;
          }
          .note {
            margin-top: 1rem;
          }
          .tagSelector {
            position: absolute;
            right: 1rem;
            top: 3rem;
          }
          .tagSelectorNoToolbar {
            position: absolute;
            right: 1rem;
            top: 1rem;
          }
            .actions {
                display: flex;
                flex-direction: row-reverse;
            }
            .actions :global(.button){
                margin-left: 0.5rem;
                margin-top: 0;
                padding: 0 1rem;
                white-space: nowrap;
            }
            .switch {
                flex-direction: row-reverse;
                display: flex;
                margin-top: 1rem;
            }
        `}</style>
        </>
    );
};

export default EditTemplate;
