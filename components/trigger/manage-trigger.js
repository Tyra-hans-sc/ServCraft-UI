import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, layout, shadows } from '../../theme';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCComboBox from '../sc-controls/form-controls/sc-combobox';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import LegacyButton from '../button';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import Constants from '../../utils/constants';
import Helper from '../../utils/helper';
import ToastContext from '../../utils/toast-context';
import CreateTemplateModal from '../modals/template/create-template-modal';
import EditTemplateModal from '../modals/template/edit-template-modal';
import Router from 'next/router';
import ConfirmAction from '../modals/confirm-action';
import MinuteSelector from '../selectors/minute-selector';
import EmployeeService from '../../services/employee/employee-service';
import DocumentService from '../../services/document/document-service';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import { ActionIcon, Box, Button, Flex, Loader, Tooltip } from "@mantine/core";
import { IconCirclePlus, IconEdit, IconTrash } from "@tabler/icons-react";
import SCMultiSelect from '../sc-controls/form-controls/sc-multiselect';

const ManageTrigger = ({ triggerToEdit, module, setEditTriggerVisible, onSave, defaultTriggerName, defaultSetting1, defaultSetting2, modal, defaultRuleName, readonlyConditions }) => {

    const toast = useContext(ToastContext);

    const [isNew, setIsNew] = useState(!triggerToEdit);
    const [trigger, setTrigger] = useState(triggerToEdit ? triggerToEdit : {});
    const [errors, setErrors] = useState({});
    const [triggerRules, setTriggerRules] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [createTemplateVisibility, setCreateTemplateVisibility] = useState(false);
    const [createTemplateMetaData, setCreateTemplateMetaData] = useState(null);
    const [editTemplateVisibility, setEditTemplateVisibility] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [selectedJobStatus, setSelectedJobStatus] = useState(null);
    const [selectedJobStatuses, setSelectedJobStatuses] = useState([]);
    const [selectedQuoteStatus, setSelectedQuoteStatus] = useState(null);
    const [selectedQueryStatus, setSelectedQueryStatus] = useState(null);
    const [selectedJobType, setSelectedJobType] = useState(null);
    const [selectedJobTypes, setSelectedJobTypes] = useState([]);
    const [selectedPriority, setSelectedPriority] = useState(null);
    const [selectedQuoteReminderType, setSelectedQuoteReminderType] = useState(null);
    const [selectedInvoiceReminderType, setSelectedInvoiceReminderType] = useState(null);
    const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState(null);
    const [selectedPurchaseOrderStatus, setSelectedPurchaseOrderStatus] = useState(null);

    const [conditionSource, setConditionSource] = useState({});

    const [modules, setModules] = useState(Enums.getEnumItemsVD(Enums.Module, true)
        .filter(x => x.value == Enums.Module.JobCard || x.value == Enums.Module.Quote || x.value == Enums.Module.Query || x.value == Enums.Module.Invoice
            || x.value == Enums.Module.CustomerZone || x.value == Enums.Module.PurchaseOrder));

    const [selectedModule, setSelectedModule] = useState(module ? module : null);
    const [selectedRule, setSelectedRule] = useState(triggerToEdit ? triggerToEdit.TriggerConditions[0].TriggerRule : null)
    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    const [loaded, setLoaded] = useState(false);
    const [documentDefinitionMetaData, setDocumentDefinitionMetaData] = useState(null);

    const [initializing, setInitializing] = useState(true);

    const initialize = async () => {
        // if (!selectedModule) {
        //     return;
        // }

        let myTrigger = triggerToEdit && JSON.stringify(triggerToEdit) !== JSON.stringify({}) ? { ...triggerToEdit } : {
            ID: Helper.emptyGuid(),
            IsActive: true,
            Name: defaultTriggerName,
            TriggerConditions: [],
            TriggerActions: [getNewTriggerAction()],
            Module: selectedModule
        };

        let rules = await getTriggerRules();
        await getTemplates();
        await getEmployees();
        let sources = await getConditionSources();

        setInitializing(false);

        if (rules && rules.length > 0) {

            let defaultSettingProp1 = Helper.isNullOrWhitespace(defaultSetting1) ? null : defaultSetting1;
            let defaultSettingProp2 = Helper.isNullOrWhitespace(defaultSetting2) ? null : defaultSetting2;

            let rule = rules.find(x => x.Name === defaultRuleName);
            if (isNew) {

                let metaData = {};
                if (rule) {
                    if (rule.Name === Constants.appStrings.TriggerRuleJobStatusChange) {
                        metaData.JobStatusIDs = !!defaultSettingProp1 ? [defaultSettingProp1] : [];
                        metaData.JobTypeIDs = [];
                    }
                    // add these when needed when defaulting settings for rules
                    // else if (rule.Name === Constants.appStrings.TriggerRuleQuoteStatusChange) {
                    //     metaData.QuoteStatus = defaultSettingProp1;
                    // } else if (rule.Name === Constants.appStrings.TriggerRuleJobSLATimeElapsed) {
                    //     metaData.ElapsedMinutes = defaultSettingProp1;
                    //     metaData.JobTypeID = defaultSettingProp2;
                    // }
                }

                myTrigger.TriggerConditions.push({
                    ID: Helper.emptyGuid(),
                    TriggerRule: rule,
                    TriggerRuleID: rule ? rule.ID : null,
                    MetaData: JSON.stringify(metaData),
                    IsActive: true,
                    TriggerID: myTrigger.ID
                });
            }

            let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
            if (!metaData) {
                metaData = {};
            }

            var triggerRule = myTrigger.TriggerConditions[0].TriggerRule;

            if (triggerRule) {
                if (triggerRule.Name === Constants.appStrings.TriggerRuleJobStatusChange) {
                    let workflow = null;
                    if (!Array.isArray(metaData.JobStatusIDs)) metaData.JobStatusIDs = [];
                    if (!Array.isArray(metaData.JobTypeIDs)) metaData.JobTypeIDs = [];

                    if (!Helper.isNullOrWhitespace(metaData.WorkflowID)) {
                        let source = sources.Workflow.find(x => x.ID === metaData.WorkflowID);
                        setSelectedWorkflow(source);
                        workflow = source;
                    }
                    if (!Helper.isNullOrWhitespace(metaData.JobStatusID)) {
                        let source = sources.JobStatus.find(x => x.ID === metaData.JobStatusID);
                        setSelectedJobStatus();
                        metaData.JobStatusID = undefined;
                        let jssources = source ? [source] : [];
                        setSelectedJobStatuses(jssources);
                        metaData.JobStatusIDs = jssources.map(x => x.ID);
                        if (!workflow && source) {
                            workflow = sources.Workflow.find(x => x.ID === source.WorkflowID);
                            setSelectedWorkflow(workflow);
                        }
                    }
                    else if (Array.isArray(metaData.JobStatusIDs) && metaData.JobStatusIDs.length > 0) {
                        let selectedStatuses = sources.JobStatus.filter(x => metaData.JobStatusIDs.includes(x.ID));
                        setSelectedJobStatuses(selectedStatuses);
                        if (!workflow && selectedStatuses.length > 0) {
                            workflow = sources.Workflow.find(x => x.ID === selectedStatuses[0].WorkflowID);
                            setSelectedWorkflow(workflow);
                        }
                    }
                    metaData.WorkflowID = workflow?.ID ?? null;
                    if (!Helper.isNullOrWhitespace(metaData.JobTypeID)) {
                        let source = sources.JobType.find(x => x.ID === metaData.JobTypeID);
                        setSelectedJobType(source);
                        metaData.JobTypeID = undefined;
                        let jtsources = source ? [source] : [];
                        setSelectedJobTypes(jtsources);
                        metaData.JobTypeIDs = jtsources.map(x => x.ID);
                    }
                    else if (Array.isArray(metaData.JobTypeIDs) && metaData.JobTypeIDs.length > 0) {
                        let selectedJobTypes = sources.JobType.filter(x => metaData.JobTypeIDs.includes(x.ID));
                        setSelectedJobTypes(selectedJobTypes);
                    }
                } else if (triggerRule.Name === Constants.appStrings.TriggerRuleQuoteStatusChange && !Helper.isNullOrWhitespace(metaData.QuoteStatus)) {
                    let source = sources.QuoteStatus.find(x => x.ID === parseFloat(metaData.QuoteStatus));
                    setSelectedQuoteStatus(source);
                } else if (triggerRule.Name === Constants.appStrings.TriggerRuleQueryStatusChange) {
                    if (!Helper.isNullOrWhitespace(metaData.QueryStatusID)) {
                        let source = sources.QueryStatus.find(x => x.ID === metaData.QueryStatusID);
                        setSelectedQueryStatus(source);
                    }
                    if (!Helper.isNullOrWhitespace(metaData.Priority)) {
                        let source = sources.Priority.find(x => x.ID === parseFloat(metaData.Priority));
                        setSelectedPriority(source);
                    }
                } else if (triggerRule.Name === Constants.appStrings.TriggerRuleJobSLATimeElapsed && !Helper.isNullOrWhitespace(metaData.JobTypeID)) {
                    let source = sources.JobType.find(x => x.ID === metaData.JobTypeID);
                    setSelectedJobType(source);
                } else if (triggerRule.Name === Constants.appStrings.TriggerRuleQuoteReminder && !Helper.isNullOrWhitespace(metaData.QuoteReminderType)) {
                    let source = sources.QuoteReminderType.find(x => x.ID === parseFloat(metaData.QuoteReminderType));
                    setSelectedQuoteReminderType(source);
                } else if (triggerRule.Name === Constants.appStrings.TriggerRuleInvoiceReminder && !Helper.isNullOrWhitespace(metaData.InvoiceReminderType)) {
                    let source = sources.InvoiceReminderType.find(x => x.ID === parseFloat(metaData.InvoiceReminderType));
                    setSelectedInvoiceReminderType(source);
                } else if (triggerRule.Name === Constants.appStrings.TriggerRuleInvoiceStatusChange && !Helper.isNullOrWhitespace(metaData.InvoiceStatus)) {
                    let source = sources.InvoiceStatus.find(x => x.ID === parseFloat(metaData.InvoiceStatus));
                    setSelectedInvoiceStatus(source);
                } else if (triggerRule.Name === Constants.appStrings.TriggerRulePurchaseOrderStatusChange && !Helper.isNullOrWhitespace(metaData.PurchaseOrderStatus)) {
                    let source = sources.PurchaseOrderStatus.find(x => x.ID === parseFloat(metaData.PurchaseOrderStatus));
                    setSelectedPurchaseOrderStatus(source);
                } else if (triggerRule.Name === Constants.appStrings.TriggerRuleJobBackendStatusReminder) {
                    let workflow = null;
                    if (!Array.isArray(metaData.JobStatusIDs)) metaData.JobStatusIDs = [];
                    if (!Array.isArray(metaData.JobTypeIDs)) metaData.JobTypeIDs = [];

                    if (!Helper.isNullOrWhitespace(metaData.WorkflowID)) {
                        let source = sources.Workflow.find(x => x.ID === metaData.WorkflowID);
                        setSelectedWorkflow(source);
                        workflow = source;
                    }
                    if (!Helper.isNullOrWhitespace(metaData.JobStatusID)) {
                        let source = sources.JobStatus.find(x => x.ID === metaData.JobStatusID);
                        setSelectedJobStatus();
                        metaData.JobStatusID = undefined;
                        let jssources = source ? [source] : [];
                        setSelectedJobStatuses(jssources);
                        metaData.JobStatusIDs = jssources.map(x => x.ID);
                        if (!workflow && source) {
                            workflow = sources.Workflow.find(x => x.ID === source.WorkflowID);
                            setSelectedWorkflow(workflow);
                        }
                    }
                    else if (Array.isArray(metaData.JobStatusIDs) && metaData.JobStatusIDs.length > 0) {
                        let selectedStatuses = sources.JobStatus.filter(x => metaData.JobStatusIDs.includes(x.ID));
                        setSelectedJobStatuses(selectedStatuses);
                        if (!workflow && selectedStatuses.length > 0) {
                            workflow = sources.Workflow.find(x => x.ID === selectedStatuses[0].WorkflowID);
                            setSelectedWorkflow(workflow);
                        }
                    }
                    metaData.WorkflowID = workflow?.ID ?? null;
                    if (!Helper.isNullOrWhitespace(metaData.JobTypeID)) {
                        let source = sources.JobType.find(x => x.ID === metaData.JobTypeID);
                        setSelectedJobType(source);
                        metaData.JobTypeID = undefined;
                        let jtsources = source ? [source] : [];
                        setSelectedJobTypes(jtsources);
                        metaData.JobTypeIDs = jtsources.map(x => x.ID);
                    }
                    else if (Array.isArray(metaData.JobTypeIDs) && metaData.JobTypeIDs.length > 0) {
                        let selectedJobTypes = sources.JobType.filter(x => metaData.JobTypeIDs.includes(x.ID));
                        setSelectedJobTypes(selectedJobTypes);
                    }
                }
            }

            myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        }

        

        triggerMinuteDebounce();
        setTrigger(myTrigger);
        setLoaded(true);
    };

    const minuteDebounce = useRef(false);
    const triggerMinuteDebounce = () => {
        setTimeout(() => {
            minuteDebounce.current = true;
        }, 500);
    };

    useEffect(() => {
        getDocumentDefinition();
        initialize();
    }, []);

    useEffect(() => {
        initialize();
    }, [triggerToEdit, selectedModule]);

    const isReadOnlyCondition = (condition) => {
        if (readonlyConditions) {
            return readonlyConditions.filter(x => x === condition).length > 0;
        }

        return false;
    }

    const isReadOnlyModule = () => {
        return !Helper.isNullOrWhitespace(module) || (triggerToEdit !== null && triggerToEdit !== undefined);
    }

    const isReadOnlyTriggerRule = () => {
        return !Helper.isNullOrWhitespace(defaultRuleName) || (triggerToEdit !== null && triggerToEdit !== undefined);
    }

    const getNewTriggerAction = (taType = Enums.TriggerActionType.Communication) => {
        let action = {
            ID: Helper.emptyGuid(),
            TriggerActionType: taType, // defaulted for now as we dont want other triggers
            RecipientID: null,
            TriggerNotificationType: Enums.TriggerNotificationType.None,
            SendSMS: false,
            SendEmail: false,
            SendSMSIfNoEmail: false,
            SendNotification: false,
            TemplateID: null,
            Template: null,
            IsActive: true,
            TriggerID: trigger.ID,
            Settings: null
        };

        return action;
    }

    const addTriggerAction = () => {
        let myTrigger = { ...trigger };
        myTrigger.TriggerActions.push(getNewTriggerAction());
        setTrigger(myTrigger);
        setFormIsDirty(true);
    };

    const getDocumentDefinition = async () => {
        let useLegacy = await DocumentService.getUseLegacyDocuments();
        if (!useLegacy) {
            let documentDefinition = await DocumentService.getDocumentDefinition();
            let metaData = JSON.parse(documentDefinition.MetaData);
            setDocumentDefinitionMetaData(metaData);
        }
    };

    const getTriggerRules = async () => {
        let triggerRuleResult = await Fetch.get({
            url: '/Trigger/GetTriggerRules',
            params: {
                module: selectedModule
            }
        });

        setTriggerRules(triggerRuleResult.Results);
        return triggerRuleResult.Results;
    };

    const getEmployees = async () => {
        let employeeResult = await EmployeeService.getEmployees(null);
        setEmployees(employeeResult.Results);
    };

    const getConditionSources = async () => {

        let sources = {};

        const workflowResult = await Fetch.get({
            url: '/Workflow',
            params: {
            }
        });

        sources.Workflow = workflowResult.Results.map(x => {
            return {
                ID: x.ID,
                Description: x.Name
            }
        });

        const jobStatusResult = await Fetch.get({
            url: '/JobStatus',
            params: {
                onlyActive: false
            }
        });

        sources.JobStatus = jobStatusResult.Results.map(x => {
            return {
                ID: x.ID,
                Description: x.Description,
                IsActive: x.IsActive,
                WorkflowID: x.WorkflowID
            };
        });

        const queryStatusResult = await Fetch.get({
            url: '/QueryStatus',
            params: {
                queryTypeID: null
            }
        });

        sources.QueryStatus = queryStatusResult.Results.map(x => {
            return {
                ID: x.ID,
                Description: `${x.Description} - [Type ${x.QueryTypeDescription}]`
            };
        });

        const jobTypeResult = await Fetch.get({
            url: '/JobType'
        });

        sources.JobType = jobTypeResult.Results.map(x => {
            return {
                ID: x.ID,
                Description: x.Name,
                WorkflowID: x.WorkflowID
            };
        });

        sources.JobType.unshift({ ID: null, Description: "All" });

        sources.QuoteStatus = [
            { ID: Enums.QuoteStatus.Draft, Description: Enums.getEnumStringValue(Enums.QuoteStatus, Enums.QuoteStatus.Draft) },
            { ID: Enums.QuoteStatus.Approved, Description: Enums.getEnumStringValue(Enums.QuoteStatus, Enums.QuoteStatus.Approved) },
            { ID: Enums.QuoteStatus.Accepted, Description: Enums.getEnumStringValue(Enums.QuoteStatus, Enums.QuoteStatus.Accepted) },
            { ID: Enums.QuoteStatus.Declined, Description: Enums.getEnumStringValue(Enums.QuoteStatus, Enums.QuoteStatus.Declined) },
            { ID: Enums.QuoteStatus.Cancelled, Description: Enums.getEnumStringValue(Enums.QuoteStatus, Enums.QuoteStatus.Cancelled) },
            { ID: Enums.QuoteStatus.Invoiced, Description: Enums.getEnumStringValue(Enums.QuoteStatus, Enums.QuoteStatus.Invoiced) },
        ];

        sources.InvoiceStatus = [
            { ID: Enums.InvoiceStatus.Draft, Description: Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Draft) },
            { ID: Enums.InvoiceStatus.Unpaid, Description: Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Unpaid) },
            { ID: Enums.InvoiceStatus.Paid, Description: Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Paid) },
            { ID: Enums.InvoiceStatus.Cancelled, Description: Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Cancelled) },
        ];

        sources.PurchaseOrderStatus = [
            { ID: Enums.PurchaseOrderStatus.Draft, Description: Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Draft) },
            { ID: Enums.PurchaseOrderStatus.Approved, Description: Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Approved) },
            { ID: Enums.PurchaseOrderStatus.Billed, Description: Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Billed) },
            { ID: Enums.PurchaseOrderStatus.Cancelled, Description: Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Cancelled) },
        ];

        sources.Priority = [
            { ID: null, Description: "All" },
            { ID: Enums.QueryPriority.Low, Description: Enums.getEnumStringValue(Enums.QueryPriority, Enums.QueryPriority.Low) },
            { ID: Enums.QueryPriority.Medium, Description: Enums.getEnumStringValue(Enums.QueryPriority, Enums.QueryPriority.Medium) },
            { ID: Enums.QueryPriority.High, Description: Enums.getEnumStringValue(Enums.QueryPriority, Enums.QueryPriority.High) },
        ];

        sources.QuoteReminderType = [
            { ID: Enums.QuoteReminderType.AfterQuoteDate, Description: Helper.splitWords(Enums.getEnumStringValue(Enums.QuoteReminderType, Enums.QuoteReminderType.AfterQuoteDate)) },
            { ID: Enums.QuoteReminderType.BeforeExpiryDate, Description: Helper.splitWords(Enums.getEnumStringValue(Enums.QuoteReminderType, Enums.QuoteReminderType.BeforeExpiryDate)) },
        ];

        sources.InvoiceReminderType = [
            { ID: Enums.InvoiceReminderType.AfterInvoiceDate, Description: Helper.splitWords(Enums.getEnumStringValue(Enums.InvoiceReminderType, Enums.InvoiceReminderType.AfterInvoiceDate)) },
            { ID: Enums.InvoiceReminderType.AfterInvoiceDueDate, Description: Helper.splitWords(Enums.getEnumStringValue(Enums.InvoiceReminderType, Enums.InvoiceReminderType.AfterInvoiceDueDate)) },
        ];

        setConditionSource(sources);
        return sources;
    };

    const getTemplates = async () => {
        let templateResult = await Fetch.post({
            url: '/Template/GetTemplates',
            params: {
                ModuleList: selectedModule ? [Enums.getEnumStringValue(Enums.Module, selectedModule)] : null,
                TemplateTypeList: [Enums.getEnumStringValue(Enums.TemplateType, Enums.TemplateType.System), Enums.getEnumStringValue(Enums.TemplateType, Enums.TemplateType.User)],
                PageSize: 1000
            }
        });

        setTemplates(templateResult.Results);

        return templateResult.Results;
    };

    const validate = () => {
        let valErrors = {};
        let isValid = true;

        if (Helper.isNullOrWhitespace(trigger.Name)) {
            valErrors.Name = "Name is required";
            isValid = false;

            setErrors(valErrors);
            return { isValid, errors: valErrors };
        }

        if (!trigger.TriggerConditions || trigger.TriggerConditions.length === 0) {
            isValid = false;

            setErrors(valErrors);
            return { isValid, errors: valErrors };
        } else {
            const condition = trigger.TriggerConditions[0];
            if (!condition.TriggerRuleID) {
                isValid = false;
                valErrors.TriggerRule = "Rule is required";

                setErrors(valErrors);
                return { isValid, errors: valErrors };
            }
            let metaData = JSON.parse(condition.MetaData);
            if (!metaData) {
                metaData = {};
            }

            if (condition.TriggerRule) {
                switch (condition.TriggerRule.Name) {
                    case Constants.appStrings.TriggerRuleJobStatusChange:
                        if (!metaData.WorkflowID) {
                            isValid = false;
                            valErrors.Workflow = "Workflow is required";
                        }
                        if (metaData.JobStatusIDs.length === 0) {
                            isValid = false;
                            valErrors.JobStatus = "Job status is required";
                        }
                        break;
                    case Constants.appStrings.TriggerRuleQuoteStatusChange:
                        if (Helper.isNullOrWhitespace(metaData.QuoteStatus)) {
                            isValid = false;
                            valErrors.QuoteStatus = "Quote status is required";
                        }
                        break;
                    case Constants.appStrings.TriggerRuleQueryStatusChange:
                        if (Helper.isNullOrWhitespace(metaData.QueryStatusID)) {
                            isValid = false;
                            valErrors.QueryStatus = "Query status is required";
                        }
                        break;
                    case Constants.appStrings.TriggerRuleJobSLATimeElapsed:
                        let mins = parseFloat(metaData.ElapsedMinutes);
                        if (isNaN(mins)) {
                            isValid = false;
                            valErrors.ElapsedMinutes = "Elapsed minutes is required";
                        } else if (mins < 0) {
                            isValid = false;
                            valErrors.ElapsedMinutes = "Elapsed minutes must be greater or equal to zero";
                        }
                        break;
                    case Constants.appStrings.TriggerRuleQuoteReminder:
                        if (Helper.isNullOrWhitespace(metaData.QuoteReminderType)) {
                            isValid = false;
                            valErrors.QuoteReminderType = "Reminder type is required";
                        }
                        let mins2 = parseFloat(metaData.Minutes);
                        if (isNaN(mins2)) {
                            isValid = false;
                            valErrors.Minutes = "Minutes is required";
                        } else if (mins2 < 0) {
                            isValid = false;
                            valErrors.Minutes = "Minutes must be greater or equal to zero";
                        }
                        break;
                    case Constants.appStrings.TriggerRuleInvoiceReminder:
                        if (Helper.isNullOrWhitespace(metaData.InvoiceReminderType)) {
                            isValid = false;
                            valErrors.InvoiceReminderType = "Reminder type is required";
                        }
                        let mins4 = parseFloat(metaData.Minutes);
                        if (isNaN(mins4)) {
                            isValid = false;
                            valErrors.Minutes = "Minutes is required";
                        } else if (mins4 < 0) {
                            isValid = false;
                            valErrors.Minutes = "Minutes must be greater or equal to zero";
                        }
                        break;
                    case Constants.appStrings.TriggerRuleInvoiceStatusChange:
                        if (Helper.isNullOrWhitespace(metaData.InvoiceStatus)) {
                            isValid = false;
                            valErrors.InvoiceStatus = "Invoice status is required";
                        }
                        break;
                    case Constants.appStrings.TriggerRuleJobBackendStatusReminder:
                        if (!metaData.WorkflowID) {
                            isValid = false;
                            valErrors.Workflow = "Workflow is required";
                        }
                        if (metaData.JobStatusIDs.length === 0) {
                            isValid = false;
                            valErrors.JobStatus = "Job status is required";
                        }
                        let mins3 = parseFloat(metaData.Minutes);
                        if (isNaN(mins3)) {
                            isValid = false;
                            valErrors.Minutes = "Minutes is required";
                        } else if (mins3 < 0) {
                            isValid = false;
                            valErrors.Minutes = "Minutes must be greater or equal to zero";
                        } else if (mins3 > (43833 * 6)) {
                            isValid = false;
                            valErrors.Minutes = "Cannot be greater than 6 months";
                        }
                        break;
                }

                if (!isValid) {
                    setErrors(valErrors);
                    return { isValid, errors: valErrors };
                }
            } else {
                isValid = false;
                valErrors.TriggerRule = "Rule is required";

                setErrors(valErrors);
                return { isValid, errors: valErrors };
            }
        }

        if (!trigger.TriggerActions || trigger.TriggerActions.length === 0) {
            valErrors.TriggerActions = "Trigger actions required";
            isValid = false;

            setErrors(valErrors);
            return { isValid, errors: valErrors };
        } else {
            trigger.TriggerActions.map((triggerAction, index) => {

                if (!triggerAction.TriggerActionType || triggerAction.TriggerActionType === 0) {
                    valErrors[`TriggerActionType-${index}`] = "Required action type";
                    isValid = false;

                    setErrors(valErrors);
                    return { isValid, errors: valErrors };
                } else if (triggerAction.TriggerActionType === Enums.TriggerActionType.Communication) {
                    if (!triggerAction.TriggerNotificationType) {
                        valErrors[`TriggerNotificationType-${index}`] = "Required notification type";
                        isValid = false;
                    } else {
                        if (triggerAction.TriggerNotificationType === Enums.TriggerNotificationType.Employee) {
                            if (!triggerAction.RecipientID) {
                                valErrors[`RecipientID-${index}`] = "Required recipient";
                                isValid = false;
                            }
                        }
                        if (!triggerAction.SendSMS && !triggerAction.SendEmail) {
                            valErrors[`SendSMS-${index}`] = "At least one communication method required";
                            valErrors[`SendEmail-${index}`] = "At least one communication method required";
                            isValid = false;
                        }
                        if (!triggerAction.TemplateID) {
                            valErrors[`TemplateID-${index}`] = "Template is required";
                            isValid = false;
                        }
                    }

                    if (!isValid) {
                        setErrors(valErrors);
                        return { isValid, errors: valErrors };
                    }
                } else if (triggerAction.TriggerActionType === Enums.TriggerActionType.PropertySet) {
                    if (!triggerAction.Settings) {

                    }
                }
            });
        }

        setErrors(valErrors);
        return { isValid, errors: valErrors };
    }

    const getValidationSummary = (errors) => {
        let summary = "";
        let summarySet = new Set();

        for (const key in errors) {
            let error = errors[key];
            if (!summarySet.has(error)) {
                summary += errors[key] + ", ";
            }
            summarySet.add(error);
        }

        return summary.trim().slice(0, -1);
    };

    const [savingTrigger, setSavingTrigger] = useState(false);

    const saveTrigger = async () => {

        let submitFinished = false;
        setSavingTrigger(true);

        let { isValid, errors } = validate();

        if (isValid) {

            let method = isNew ? Fetch.post : Fetch.put;

            let triggerResult = await method({
                url: "/Trigger",
                params: {
                    Trigger: trigger
                }
            });

            if (triggerResult.ID) {
                setFormIsDirty(false);
                await Helper.waitABit();
                onSave(triggerResult.ID);
                setEditTriggerVisible && setEditTriggerVisible(false);
                toast.setToast({
                    message: 'Trigger saved successfully',
                    show: true,
                    type: Enums.ToastType.success
                });
                setSavingTrigger(false);
                submitFinished = true;
            } else {
                toast.setToast({
                    message: 'There are errors on the form',
                    show: true,
                    type: Enums.ToastType.error
                });
                setSavingTrigger(false);
            }
        } else {
            toast.setToast({
                message: `${getValidationSummary(errors)}`,
                show: true,
                type: Enums.ToastType.error
            });
            setSavingTrigger(false);
        }

        return submitFinished;
    };

    const cancel = () => {
        Helper.nextRouter(Router.push, '/settings/trigger/list');
    };

    const textInputChanged = (e) => {
        setErrors({ ...errors, [e.name]: e.value });
        setTrigger({ ...trigger, [e.name]: e.value });
        setErrors({ ...errors, [e.name]: null });
        setFormIsDirty(true);
    };

    const setActionType = (triggerActionIndex, selectedItem) => {
        let myTrigger = { ...trigger };

        if (selectedItem) {
            if (myTrigger.TriggerActions[triggerActionIndex].TriggerActionType === selectedItem.value) return;

            myTrigger.TriggerActions[triggerActionIndex] = getNewTriggerAction(selectedItem.value);
        } else {
            myTrigger.TriggerActions[triggerActionIndex].TriggerActionType = null;
        }

        setTrigger(myTrigger);
        setErrors({ ...errors, [`TriggerActionType-${triggerActionIndex}`]: null });
        setFormIsDirty(true);
    };

    const setNotificationType = (triggerActionIndex, selectedItem) => {
        let myTrigger = { ...trigger };
        myTrigger.TriggerActions[triggerActionIndex].TriggerNotificationType = selectedItem ? selectedItem.value : null;
        if (selectedItem && selectedItem.value !== Enums.TriggerNotificationType.Employee) {
            myTrigger.TriggerActions[triggerActionIndex].RecipientID = null;
        }

        if (!selectedItem || selectedItem.value === Enums.TriggerNotificationType.None) {
            myTrigger.TriggerActions[triggerActionIndex].TemplateID = null;
            myTrigger.TriggerActions[triggerActionIndex].Template = null;
            myTrigger.TriggerActions[triggerActionIndex].SendEmail = false;
            myTrigger.TriggerActions[triggerActionIndex].SendSMS = false;
            myTrigger.TriggerActions[triggerActionIndex].SendSMSIfNoEmail = false;
        }

        setTrigger(myTrigger);
        setErrors({ ...errors, [`TriggerNotificationType-${triggerActionIndex}`]: null });
        setFormIsDirty(true);
    };

    const setTemplate = (triggerActionIndex, selectedItem) => {
        let myTrigger = { ...trigger };
        myTrigger.TriggerActions[triggerActionIndex].TemplateID = selectedItem ? selectedItem.MasterID : null;
        myTrigger.TriggerActions[triggerActionIndex].Template = selectedItem;
        setTrigger(myTrigger);
        setErrors({ ...errors, [`TemplateID-${triggerActionIndex}`]: null });
        setFormIsDirty(true);
    };

    const setRecipient = (triggerActionIndex, selectedItem) => {
        let myTrigger = { ...trigger };
        myTrigger.TriggerActions[triggerActionIndex].RecipientID = selectedItem ? selectedItem.ID : null;
        setTrigger(myTrigger);
        setErrors({ ...errors, [`RecipientID-${triggerActionIndex}`]: null });
        setFormIsDirty(true);
    };

    const deleteTriggerAction = (index) => {
        let myTrigger = { ...trigger };
        let action = myTrigger.TriggerActions.splice(index, 1);
        action.IsActive = false;
        setTrigger(myTrigger);
        setFormIsDirty(true);
    };

    const getEmployeeName = (id) => {
        let employee = employees.find(x => x.ID == id);
        if (employee) {
            return employee.FullName;
        }
        return "";
    };

    const getEmployee = (id) => {
        return employees.find(x => x.ID == id);
    };

    const toggleSend = (fieldName, triggerActionIndex) => {
        let myTrigger = { ...trigger };
        myTrigger.TriggerActions[triggerActionIndex][fieldName] = !myTrigger.TriggerActions[triggerActionIndex][fieldName];

        switch (fieldName) {
            case "SendSMSIfNoEmail":
                myTrigger.TriggerActions[triggerActionIndex]["SendSMS"] = false;
                break;
            case "SendEmail":
                myTrigger.TriggerActions[triggerActionIndex]["SendSMSIfNoEmail"] = false;
                break;
        }

        setTrigger(myTrigger);
        setErrors({ ...errors, [`${fieldName}-${triggerActionIndex}`]: null });
        setFormIsDirty(true);
    };

    const defaultTriggerActionSettings = (triggerActionType) => {
        let obj = {};

        if (triggerActionType === Enums.TriggerActionType.Communication) {
            switch (trigger.TriggerConditions[0].TriggerRule?.Name) {
                case Constants.appStrings.TriggerRuleJobStatusChange:
                    obj[Constants.appStrings.TriggerActionJobCardAttach] = false;
                    obj[Constants.appStrings.TriggerActionWorkshopAttach] = false;
                    obj[Constants.appStrings.TriggerActionSignedOffAttach] = false;
                    obj[Constants.appStrings.TriggerActionJobSheetAttach] = false;
                    break;
                case Constants.appStrings.TriggerRuleQuoteStatusChange:
                    obj[Constants.appStrings.TriggerActionQuoteAttach] = false;
                    obj[Constants.appStrings.TriggerActionJobCardAttach] = false;
                    obj[Constants.appStrings.TriggerActionWorkshopAttach] = false;
                    obj[Constants.appStrings.TriggerActionSignedOffAttach] = false;
                    obj[Constants.appStrings.TriggerActionJobSheetAttach] = false;
                    break;
                case Constants.appStrings.TriggerRuleInvoiceStatusChange:
                    obj[Constants.appStrings.TriggerActionInvoiceAttach] = false;
                    obj[Constants.appStrings.TriggerActionJobCardAttach] = false;
                    obj[Constants.appStrings.TriggerActionWorkshopAttach] = false;
                    obj[Constants.appStrings.TriggerActionSignedOffAttach] = false;
                    obj[Constants.appStrings.TriggerActionJobSheetAttach] = false;
                    break;
            }
        } else if (triggerActionType === Enums.TriggerActionType.PropertySet) {
            obj[Constants.appStrings.TriggerActionSLAStartDateTime] = false;
            obj[Constants.appStrings.TriggerActionSLAEndDateTime] = false;
        }
        return obj;
    }

    const parseTriggerActionSettings = (triggerActionIndex) => {
        let triggerAction = trigger.TriggerActions[triggerActionIndex];
        let settingsString = triggerAction.Settings;
        let settings = JSON.parse(settingsString);
        if (!settings) {
            settings = defaultTriggerActionSettings(triggerAction.TriggerActionType);
            let myTrigger = { ...trigger };
            myTrigger.TriggerActions[triggerActionIndex].Settings = JSON.stringify(settings);
            setTrigger(myTrigger);
        }
        return settings;
    }

    const getSettingValue = (fieldName, triggerActionIndex) => {
        let settings = parseTriggerActionSettings(triggerActionIndex);
        return settings[fieldName];
    };

    const toggleSetting = (fieldName, triggerActionIndex) => {
        let myTrigger = { ...trigger };
        let settings = parseTriggerActionSettings(triggerActionIndex);

        settings[fieldName] = !settings[fieldName];

        myTrigger.TriggerActions[triggerActionIndex].Settings = JSON.stringify(settings);
        setTrigger(myTrigger);
        setFormIsDirty(true);
    };

    const cancelEdit = () => {
        onSave();
        setEditTriggerVisible && setEditTriggerVisible(false);
    }

    const createTemplate = (metaData) => {
        setCreateTemplateMetaData(metaData);
        setCreateTemplateVisibility(true);
    };

    const [fromCreateTemplate, setFromCreateTemplate] = useState(false);

    const onTemplateCreate = async (template) => {
        setFromCreateTemplate(true);
        // let templates = await getTemplates();
        // let template = templates.find(x => x.ID === id);
        // setTemplates(templates);
        setTimeout(() => {
            //setTemplate(createTemplateMetaData, template);
            setEditingTemplate(template);
            setEditTemplateVisibility(true);
        }, 100);
    };

    const editTemplate = (template, metaData) => {
        setEditingTemplate(template);
        setCreateTemplateMetaData(metaData);
        setEditTemplateVisibility(true);
    };

    const onTemplateEdit = async (id) => {
        setFromCreateTemplate(false);
        let templates = await getTemplates();
        let template = templates.find(x => x.ID === id);
        setTemplates(templates);
        setTimeout(() => {
            setTemplate(createTemplateMetaData, template);
            setEditingTemplate(false);
        }, 100);
    };

    const clearSelectedConditions = () => {
        setSelectedQuoteStatus(null);
        setSelectedInvoiceStatus(null);
        setSelectedPurchaseOrderStatus(null);
        setSelectedQueryStatus(null);
        setSelectedPriority(null);
        setSelectedWorkflow(null);
        setSelectedJobStatus(null);
        setSelectedJobStatuses([]);
        setSelectedJobType(null);
        setSelectedJobTypes([]);
        setSelectedQuoteReminderType(null);
        setSelectedInvoiceReminderType(null);
    }

    const moduleChanged = (mod) => {
        let moduleValue = mod ? mod.value : null;
        setErrors({ ...errors, Module: null });

        let triggerToSave = { ...trigger };
        triggerToSave.Module = moduleValue;

        if (triggerToSave.TriggerConditions && triggerToSave.TriggerConditions.length > 0) {
            triggerToSave.TriggerConditions[0].TriggerRuleID = null;
            triggerToSave.TriggerConditions[0].TriggerRule = null;
            triggerToSave.TriggerConditions[0].MetaData = null;
        }

        setTrigger(triggerToSave);
        setSelectedModule(moduleValue);
        clearSelectedConditions();
        setFormIsDirty(true);
    };

    const ruleChanged = (rule) => {
        setErrors({ ...errors, TriggerRule: null });
        let myTrigger = { ...trigger };
        myTrigger.TriggerActions = [getNewTriggerAction()];
        myTrigger.TriggerConditions[0].TriggerRuleID = rule ? rule.ID : null;
        myTrigger.TriggerConditions[0].TriggerRule = rule;
        myTrigger.TriggerConditions[0].MetaData = null;
        clearSelectedConditions();
        setTrigger(myTrigger);
        setFormIsDirty(true);
    };

    const jobStatusChanged = (jobStatus) => {
        setErrors({ ...errors, JobStatus: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        if (!metaData) {
            metaData = {};
        }

        let workflow = Helper.clone(selectedWorkflow);
        if (jobStatus) {
            workflow = conditionSource.Workflow.find(x => x.ID == jobStatus.WorkflowID);
        }
        let jobType = workflow ? selectedJobType : null;

        metaData.JobStatusID = jobStatus?.ID ?? null;
        metaData.WorkflowID = workflow?.ID ?? null;
        metaData.JobTypeID = jobType?.ID ?? null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedJobStatus(jobStatus);
        setSelectedWorkflow(workflow);
        setSelectedJobType(jobType)
        setFormIsDirty(true);
    };

    const jobStatusChangedMultiSelect = (jobStatuses) => {
        jobStatuses = jobStatuses.filter(x => !!x);
        setErrors({ ...errors, JobStatus: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        // clean up legacy config
        if (!metaData || metaData.hasOwnProperty("JobStatusID")) {
            metaData = {};
        }

        let workflow = Helper.clone(selectedWorkflow);
        if (jobStatuses.length > 0) {
            workflow = conditionSource.Workflow.find(x => x.ID === jobStatuses[0].WorkflowID);
        }
        let jobTypes = workflow ? selectedJobTypes : [];

        metaData.JobStatusIDs = jobStatuses ? jobStatuses.map(x => x.ID) : [];
        metaData.WorkflowID = workflow?.ID ?? null;
        metaData.JobTypeIDs = jobTypes ? jobTypes.map(x => x.ID) : [];
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedJobStatuses(jobStatuses ?? []);
        setSelectedWorkflow(workflow);
        setSelectedJobTypes(jobTypes);
        setFormIsDirty(true);
    };

    const quoteStatusChanged = (quoteStatus) => {
        setErrors({ ...errors, QuoteStatus: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        if (!metaData) {
            metaData = {};
        }

        metaData.QuoteStatus = quoteStatus ? quoteStatus.ID : null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedQuoteStatus(quoteStatus);
        setFormIsDirty(true);
    };

    const invoiceStatusChanged = (invoiceStatus) => {
        setErrors({ ...errors, InvoiceStatus: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        if (!metaData) {
            metaData = {};
        }

        metaData.InvoiceStatus = invoiceStatus ? invoiceStatus.ID : null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedInvoiceStatus(invoiceStatus);
        setFormIsDirty(true);
    };

    const purchaseOrderStatusChanged = (purchaseOrderStatus) => {
        setErrors({ ...errors, PurchaseOrderStatus: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        if (!metaData) {
            metaData = {};
        }

        metaData.PurchaseOrderStatus = purchaseOrderStatus ? purchaseOrderStatus.ID : null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedPurchaseOrderStatus(purchaseOrderStatus);
        setFormIsDirty(true);
    };

    const queryStatusChanged = (queryStatus) => {
        setErrors({ ...errors, QueryStatus: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        if (!metaData) {
            metaData = {};
        }

        metaData.QueryStatusID = queryStatus ? queryStatus.ID : null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedQueryStatus(queryStatus);
        setFormIsDirty(true);
    };

    const priorityChanged = (priority) => {
        setErrors({ ...errors, Priority: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        if (!metaData) {
            metaData = {};
        }

        metaData.Priority = priority ? priority.ID : null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedPriority(priority);
        setFormIsDirty(true);
    };

    const quoteReminderTypeChanged = (quoteReminderType) => {
        setErrors({ ...errors, QuoteReminderType: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        if (!metaData) {
            metaData = {};
        }

        metaData.QuoteReminderType = quoteReminderType ? quoteReminderType.ID : null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedQuoteReminderType(quoteReminderType);
        setFormIsDirty(true);
    };

    const invoiceReminderTypeChanged = (invoiceReminderType) => {
        setErrors({ ...errors, InvoiceReminderType: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        if (!metaData) {
            metaData = {};
        }

        metaData.InvoiceReminderType = invoiceReminderType ? invoiceReminderType.ID : null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedInvoiceReminderType(invoiceReminderType);
        setFormIsDirty(true);
    };

    const jobTypeChanged = (jobType) => {
        setErrors({ ...errors, JobType: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);

        if (!metaData) {
            metaData = {};
        }

        let workflow = Helper.clone(selectedWorkflow);
        if (jobType) {
            workflow = conditionSource.Workflow.find(x => x.ID === jobType.WorkflowID);
        }

        metaData.JobTypeID = jobType?.ID ?? null;
        metaData.WorkflowID = workflow?.ID ?? null;

        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedJobType(jobType);
        setSelectedWorkflow(workflow);
        setFormIsDirty(true);
    };

    const jobTypeChangedMultiSelect = (jobTypes) => {
        jobTypes = jobTypes.filter(x => !!x);
        setErrors({ ...errors, JobType: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);
        // clean up legacy config
        if (!metaData || metaData.hasOwnProperty("JobStatusID")) {
            metaData = {};
        }

        let workflow = Helper.clone(selectedWorkflow);
        if (jobTypes.length > 0) {
            workflow = conditionSource.Workflow.find(x => x.ID === jobTypes[0].WorkflowID);
        }

        metaData.JobTypeIDs = jobTypes ? jobTypes.map(x => x.ID) : [];
        metaData.WorkflowID = workflow?.ID ?? null;
        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedJobTypes(jobTypes ?? []);
        setSelectedWorkflow(workflow);
        setFormIsDirty(true);
    };

    const workflowChanged = (workflow) => {
        setErrors({ ...errors, Workflow: null });
        let myTrigger = { ...trigger };
        let metaData = JSON.parse(myTrigger.TriggerConditions[0].MetaData);

        if (!metaData) {
            metaData = {};
        }

        metaData.WorkflowID = workflow?.ID ?? null;
        metaData.JobStatusID = null;
        metaData.JobStatusIDs = [];
        metaData.JobTypeID = null;
        metaData.JobTypeIDs = [];

        myTrigger.TriggerConditions[0].MetaData = JSON.stringify(metaData);
        setTrigger(myTrigger);
        setSelectedWorkflow(workflow);
        setSelectedJobStatus(null);
        setSelectedJobStatuses([]);
        setSelectedJobType(null);
        setSelectedJobTypes([]);
        setFormIsDirty(true);
    };

    useEffect(() => {
        let item = null;

        switch (ruleName()) {
            case Constants.appStrings.TriggerRuleJobStatusChange:
            case Constants.appStrings.TriggerRuleJobBackendStatusReminder:
                item = selectedJobStatuses && selectedJobStatuses.length > 0 ? selectedJobStatuses[0] : selectedJobStatus;
                break;
            case Constants.appStrings.TriggerRuleQuoteStatusChange:
                item = selectedQuoteStatus;
                break;
            case Constants.appStrings.TriggerRuleInvoiceStatusChange:
                item = selectedInvoiceStatus;
                break;
            case Constants.appStrings.TriggerRulePurchaseOrderStatusChange:
                item = selectedPurchaseOrderStatus;
                break;
            case Constants.appStrings.TriggerRuleJobSLATimeElapsed:
                item = selectedJobType;
                break;
            case Constants.appStrings.TriggerRuleQueryStatusChange:
                item = selectedQueryStatus;
                break;
            case Constants.appStrings.TriggerRuleQuoteReminder:
                item = selectedQuoteReminderType;
                break;
            case Constants.appStrings.TriggerRuleInvoiceReminder:
                item = selectedInvoiceReminderType;
                break;
        }

        if (trigger.ID && item) {
            if (Helper.isNullOrWhitespace(trigger.Name)) {
                setTrigger({
                    ...trigger,
                    Name: item.Description
                });
            }
        }
    }, [selectedQuoteStatus, selectedJobStatus, selectedJobStatuses, selectedJobType, selectedQueryStatus, selectedQuoteReminderType, selectedInvoiceReminderType, selectedInvoiceStatus, selectedPurchaseOrderStatus]);

    const deleteTrigger = async () => {
        setConfirmOptions({
            ...Helper.initialiseConfirmOptions(),
            display: true,
            confirmButtonText: "Delete",
            heading: "Confirm delete trigger?",
            text: "This trigger will be deleted.",
            onConfirm: async () => {
                let myTrigger = { ...trigger };
                myTrigger.IsActive = false;

                let triggerResult = await Fetch.put({
                    url: "/Trigger",
                    params: {
                        Trigger: myTrigger
                    }
                });

                if (triggerResult.ID) {
                    setFormIsDirty(false);
                    await Helper.waitABit();
                    if (modal) {
                        cancelEdit();
                    } else {
                        Helper.nextRouter(Router.replace, "/settings/trigger/list")
                    }
                } else {
                    toast.setToast({
                        message: 'Could not delete the trigger',
                        show: true,
                        type: Enums.ToastType.error
                    });
                }
            }
        });
    };

    const backToList = () => {
        Helper.nextRouter(Router.replace, "/settings/trigger/list");
    };

    if (!modal) {
        Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveTrigger);
    }

    const replaceItemWithModule = (name) => {

        let selMod = Enums.getEnumStringValue(Enums.Module, selectedModule);
        if (selMod === "CustomerZone") {
            selMod = "Item";
        }

        if (name === Enums.getEnumStringValue(Enums.TriggerNotificationType, Enums.TriggerNotificationType.EmployeesForItem)) {
            return `Assigned Employees`;
        } else if (name === Helper.splitWords(Enums.getEnumStringValue(Enums.TriggerNotificationType, Enums.TriggerNotificationType.EmployeesForItem))) {
            return `Assigned Employees`;
        } else if (name === Enums.getEnumStringValue(Enums.TriggerNotificationType, Enums.TriggerNotificationType.CustomerContactsForItem)) {
            return `CustomerContactsFor${selMod}`;
        } else if (name === Helper.splitWords(Enums.getEnumStringValue(Enums.TriggerNotificationType, Enums.TriggerNotificationType.CustomerContactsForItem))) {
            return `Customer Contacts For ${Helper.splitWords(selMod)}`;
        } else if (name === Helper.splitWords(Enums.getEnumStringValue(Enums.TriggerNotificationType, Enums.TriggerNotificationType.SupplierContactsForItem))) {
            return `Supplier Contacts For ${Helper.splitWords(selMod)}`;
        }
        else {
            return name;
        }
    }

    const getElapsedMinutes = () => {
        if (ruleName() === Constants.appStrings.TriggerRuleJobSLATimeElapsed) {
            let condition = trigger.TriggerConditions[0];
            if (condition) {
                let metaData = JSON.parse(condition.MetaData);
                if (metaData) {
                    if (isNaN(parseFloat(metaData.ElapsedMinutes))) {
                        metaData.ElapsedMinutes = 0;
                        //setElapsedMinutes({ target: { value: metaData.ElapsedMinutes } });
                    }
                    return metaData.ElapsedMinutes;
                }
            }
        }
        return 0;
    }

    const setElapsedMinutes = (e) => {
        let elapsedMinutes = parseFloat(e);
        let myTrigger = { ...trigger };
        let condition = myTrigger.TriggerConditions[0];
        let metaData = JSON.parse(condition.MetaData);

        if (!metaData) {
            metaData = {};
        }

        metaData.ElapsedMinutes = elapsedMinutes;

        condition.MetaData = JSON.stringify(metaData);
        myTrigger.TriggerConditions[0] = condition;
        setTrigger(myTrigger);
        setFormIsDirty(true);
    }

    const getMinutes = () => {
        if (ruleName() === Constants.appStrings.TriggerRuleQuoteReminder || ruleName() === Constants.appStrings.TriggerRuleInvoiceReminder || ruleName() === Constants.appStrings.TriggerRuleJobBackendStatusReminder) {
            let condition = trigger.TriggerConditions[0];
            if (condition) {
                let metaData = JSON.parse(condition.MetaData);
                if (metaData) {
                    if (isNaN(parseFloat(metaData.Minutes))) {
                        metaData.Minutes = 0;
                        //setMinutes({ target: { value: metaData.Minutes } });
                    }
                    return metaData.Minutes;
                }
            }
        }
        return 0;
    }

    const setMinutes = (e) => {
        let minutes = parseFloat(e);
        let myTrigger = { ...trigger };
        let condition = myTrigger.TriggerConditions[0];
        let metaData = JSON.parse(condition.MetaData);

        if (!metaData) {
            metaData = {};
        }

        metaData.Minutes = minutes;

        condition.MetaData = JSON.stringify(metaData);
        myTrigger.TriggerConditions[0] = condition;
        setTrigger(myTrigger);
        setFormIsDirty(true);
    }

    const ruleName = () => {
        return trigger && trigger.TriggerConditions && trigger.TriggerConditions.length > 0 &&
            trigger.TriggerConditions[0].TriggerRule ? trigger.TriggerConditions[0].TriggerRule.Name : "";
    }

    const showJobStatus = () => {
        return false;
        // let name = ruleName();
        // return name === Constants.appStrings.TriggerRuleJobStatusChange || name === Constants.appStrings.TriggerRuleJobBackendStatusReminder;
    }

    const showJobStatuses = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleJobStatusChange || name === Constants.appStrings.TriggerRuleJobBackendStatusReminder;
    }

    const showQuoteStatus = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleQuoteStatusChange;
    }

    const showInvoiceStatus = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleInvoiceStatusChange;
    }

    const showPurchaseOrderStatus = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRulePurchaseOrderStatusChange;
    }

    const showQueryStatus = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleQueryStatusChange;
    }

    const showPriority = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleQueryStatusChange;
    }

    const showJobType = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleJobSLATimeElapsed;
    }

    const showJobTypes = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleJobStatusChange || name === Constants.appStrings.TriggerRuleJobBackendStatusReminder;
    }

    const showWorkflow = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleJobStatusChange || name === Constants.appStrings.TriggerRuleJobBackendStatusReminder;
    }

    const showElapsedMinutes = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleJobSLATimeElapsed;
    }

    const showMinutes = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleQuoteReminder || name === Constants.appStrings.TriggerRuleInvoiceReminder || name === Constants.appStrings.TriggerRuleJobBackendStatusReminder;
    }

    const showQuoteReminderType = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleQuoteReminder;
    }

    const showInvoiceReminderType = () => {
        let name = ruleName();
        return name === Constants.appStrings.TriggerRuleInvoiceReminder;
    }

    const noConditions = () => {
        return ruleName() !== "" && !(showJobStatus()
            || showQuoteStatus()
            || showJobType()
            || showElapsedMinutes()
            || showQueryStatus()
            || showInvoiceStatus()
            || showPriority()
            || showQuoteReminderType()
            || showInvoiceReminderType()
            || showMinutes()
            || showPurchaseOrderStatus()
            || showJobStatuses()
            || showJobTypes()
            || showWorkflow()
        );
    }

    const getTriggerActionTypes = () => {
        let types = Enums.getEnumItemsVD(Enums.TriggerActionType, true);

        // removing the property set trigger as it is not going to be used
        // if (ruleName() !== Constants.appStrings.TriggerRuleJobStatusChange) {
        types = types.filter(x => x.value === Enums.TriggerActionType.Communication);
        // }

        return types;
    }

    const getTriggerNotificationTypes = () => {
        let types = Enums.getEnumItemsVD(Enums.TriggerNotificationType, true).map(x => { return { ...x, description: replaceItemWithModule(x.description) }; })
        let typeValuesToIgnore = [];
        switch (ruleName()) {
            case Constants.appStrings.TriggerRuleJobEmployeeAllocated:
                typeValuesToIgnore = [Enums.TriggerNotificationType.EmployeesUnallocated, Enums.TriggerNotificationType.EmployeeAllocated,
                Enums.TriggerNotificationType.SupplierContacts, Enums.TriggerNotificationType.SupplierPrimaryAccounting, Enums.TriggerNotificationType.SupplierPrimaryContact];
                break;
            case Constants.appStrings.TriggerRuleJobEmployeeUnallocated:
                typeValuesToIgnore = [Enums.TriggerNotificationType.EmployeesAllocated, Enums.TriggerNotificationType.EmployeeAllocated,
                Enums.TriggerNotificationType.SupplierContacts, Enums.TriggerNotificationType.SupplierPrimaryAccounting, Enums.TriggerNotificationType.SupplierPrimaryContact];
                break;
            case Constants.appStrings.TriggerRuleQueryEmployeeAllocated:
                typeValuesToIgnore = [Enums.TriggerNotificationType.EmployeesAllocated, Enums.TriggerNotificationType.EmployeesUnallocated,
                Enums.TriggerNotificationType.SupplierContacts, Enums.TriggerNotificationType.SupplierPrimaryAccounting, Enums.TriggerNotificationType.SupplierPrimaryContact];
                break;
            case Constants.appStrings.TriggerRuleCustomerZoneMessage:
                types = Enums.getEnumItemsVD(Enums.TriggerNotificationType, true)
                    .filter(x => x.value === Enums.TriggerNotificationType.Employee || x.value === Enums.TriggerNotificationType.EmployeeAll
                        || x.value === Enums.TriggerNotificationType.EmployeesForItem)
                    .map(x => { return { ...x, description: replaceItemWithModule(x.description) }; })
                break;
            case Constants.appStrings.TriggerRulePurchaseOrderStatusChange:
                typeValuesToIgnore = [Enums.TriggerNotificationType.CustomerContacts, Enums.TriggerNotificationType.CustomerContactsForItem,
                Enums.TriggerNotificationType.CustomerPrimaryAccounting, Enums.TriggerNotificationType.CustomerPrimaryContact];
                break;
            default:
                typeValuesToIgnore = [Enums.TriggerNotificationType.EmployeesAllocated, Enums.TriggerNotificationType.EmployeesUnallocated, Enums.TriggerNotificationType.EmployeeAllocated];
                break;
        }

        typeValuesToIgnore.push(Enums.TriggerNotificationType.None);

        types = types.filter(x => typeValuesToIgnore.indexOf(x.value) < 0).sort((a, b) => {
            return a.description > b.description ? 1 : -1;
        });
        return types;
    };

    const getTriggerNamePlaceholder = () => {
        let ph = "";
        let rule = ruleName();

        if (rule === Constants.appStrings.TriggerRuleJobStatusChange ||
            rule === Constants.appStrings.TriggerRuleQuoteStatusChange ||
            rule === Constants.appStrings.TriggerRuleInvoiceStatusChange ||
            rule === Constants.appStrings.TriggerRuleJobSLATimeElapsed ||
            rule === Constants.appStrings.TriggerRuleQueryStatusChange ||
            rule === Constants.appStrings.TriggerRuleQuoteReminder ||
            rule === Constants.appStrings.TriggerRuleInvoiceReminder) {
            ph = "Leave blank to auto generate from condition";
        }

        return ph;
    }


    const extractInitials = (employee) => {
        let firstNameInitial = employee.FirstName ? employee.FirstName[0] : '';
        let lastNameInitial = employee.LastName ? employee.LastName[0] : '';

        return firstNameInitial + lastNameInitial;
    };

    if (!loaded) {
        return (<>
            {
                initializing && <Flex align={'center'} justify={'center'} direction={'column'} mih={'36rem'}>
                    <Loader size={40} />
                </Flex>
            }
        </>);
    }

    return (
        <Flex direction={'column'}>

            {modal || isNew ? "" :
                <Flex align={'center'} gap={5} ml={'auto'} >
                    <ActionIcon variant={'transparent'} onClick={deleteTrigger} mr={'md'} color={'yellow.7'}>
                        <IconTrash />
                    </ActionIcon>
                    <Button variant={'outline'} onClick={backToList}>
                        Cancel
                    </Button>
                    <Button onClick={saveTrigger} disabled={savingTrigger}>
                        Save
                    </Button>
                    {/*<img src="/icons/trash-bluegrey.svg" onClick={deleteTrigger} style={{ marginRight: "8px", cursor: "pointer" }} />
                            <LegacyButton text="Cancel" onClick={backToList} extraClasses="fit-content no-margin hollow" /> &nbsp;
                            <LegacyButton text="Save" onClick={saveTrigger} disabled={savingTrigger} extraClasses="fit-content no-margin" />*/}
                </Flex>
            }
            <Flex justify={'space-between'} wrap={'nowrap'} align={'center'} w={'100%'}>
                <div className="title column">
                    Trigger Settings
                </div>
                <div className="title column">
                    {
                        trigger.TriggerConditions && trigger.TriggerConditions.length > 0 && trigger.TriggerConditions[0].TriggerRule ?
                            "Trigger Actions" : ""
                    }
                </div>
                <span />
            </Flex>


            <div className="row" style={{ marginTop: -10 }}>
                <div className="column" style={{ marginTop: -10 }}>
                    <SCDropdownList
                        name="Module"
                        label="Trigger Module"
                        textField="description"
                        dataItemKey="value"
                        value={trigger.Module ? { 'description': Enums.getEnumStringValue(Enums.Module, trigger.Module, true), 'value': trigger.Module } : null}
                        options={modules}
                        disabled={isReadOnlyModule()}
                        onChange={moduleChanged}
                        required={true}
                        error={errors.Module}
                        cypress="data-cy-module"
                    />

                    <SCInput
                        label="Trigger Name"
                        value={trigger.Name}
                        error={errors.Name}
                        name="Name"
                        hint={isNew ? getTriggerNamePlaceholder() : ''}
                        required={true}
                        onChange={textInputChanged}
                        cypress="data-cy-name"
                    />

                    {trigger.TriggerConditions && trigger.TriggerConditions.length > 0 ?
                        <>
                            <SCDropdownList
                                name="TriggerRule"
                                textField="Name"
                                dataItemKey="ID"
                                label="Trigger Rule"
                                required={true}
                                options={triggerRules}
                                value={trigger.TriggerConditions[0].TriggerRule ? trigger.TriggerConditions[0].TriggerRule : null}
                                error={errors.TriggerRule}
                                onChange={ruleChanged}
                                disabled={isReadOnlyTriggerRule()}
                                itemRenderMantine={(itemProps) => {
                                    return (<div>
                                        {itemProps.dataItem.Name}{itemProps.dataItem.Description ?
                                            <span style={{ fontStyle: 'italic', fontSize: '0.9rem', opacity: '0.8' }}> - {itemProps.dataItem.Description}</span> : ''}
                                    </div>);
                                }}
                                itemRender={(li, itemProps) => {
                                    const itemChildren = (
                                        <div>
                                            {itemProps.dataItem.Name}{itemProps.dataItem.Description ?
                                                <span style={{ fontStyle: 'italic', fontSize: '0.9rem', opacity: '0.8' }}> - {itemProps.dataItem.Description}</span> : ''}
                                        </div>
                                    );
                                    return React.cloneElement(li, li.props, itemChildren);
                                }}
                            />

                            <br />
                            <div className="card" style={{ marginTop: 18 }}>
                                <h3 className="title column title-no-bottom">Rule Settings</h3>

                                <span className="description">{trigger.TriggerConditions[0].TriggerRule ? trigger.TriggerConditions[0].TriggerRule.Description : ""}</span>

                                {noConditions() ? <p className="description">No settings required</p> : ""}

                                {showWorkflow() ?
                                    <SCComboBox
                                        label="Workflow"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={true}
                                        options={conditionSource.Workflow}
                                        value={selectedWorkflow}
                                        error={errors.Workflow}
                                        name="Workflow"
                                        onChange={workflowChanged}
                                        disabled={isReadOnlyCondition("Workflow")}
                                    />
                                    : ''}

                                {showJobType() ?
                                    <SCComboBox
                                        label="Job Type"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={false}
                                        options={conditionSource.JobType}
                                        value={selectedJobType ? selectedJobType : { ID: null, Description: "All" }}
                                        error={errors.JobType}
                                        name="JobType"
                                        onChange={jobTypeChanged}
                                        disabled={isReadOnlyCondition("JobType")}
                                        cypress="data-cy-jobtype"
                                    />
                                    : ''}

                                {showJobTypes() ?
                                    <SCMultiSelect
                                        name="JobType"
                                        label="Job Type"
                                        availableOptions={conditionSource.JobType.filter(x => x.WorkflowID === selectedWorkflow?.ID && x.ID)}
                                        selectedOptions={selectedJobTypes}
                                        textField={"Description"}
                                        dataItemKey={"ID"}
                                        onChange={jobTypeChangedMultiSelect}
                                        error={errors.JobType}
                                        required={false}
                                        disabled={isReadOnlyCondition("JobType") || !selectedWorkflow}
                                        hint="Leave blank for all types"
                                    />
                                    : ''}

                                {showJobStatus() ?
                                    <SCComboBox
                                        name="JobStatus"
                                        label="Job Status"
                                        textField="Description"
                                        dataItemKey="ID"
                                        value={selectedJobStatus}
                                        options={(conditionSource.JobStatus ? conditionSource.JobStatus.filter(x => x.IsActive) : [])}
                                        onChange={jobStatusChanged}
                                        required={true}
                                        error={errors.JobStatus}
                                        disabled={isReadOnlyCondition("JobStatus")}
                                        cypress="data-cy-jobstatus"
                                    />
                                    : ''}

                                {showJobStatuses() ?
                                    <SCMultiSelect
                                        name="JobStatus"
                                        label="Job Status"
                                        availableOptions={conditionSource.JobStatus.filter(x => x.WorkflowID === selectedWorkflow?.ID)}
                                        selectedOptions={selectedJobStatuses}
                                        textField={"Description"}
                                        dataItemKey={"ID"}
                                        onChange={jobStatusChangedMultiSelect}
                                        error={errors.JobStatus}
                                        required={true}
                                        disabled={isReadOnlyCondition("JobStatus") || !selectedWorkflow}
                                    />
                                    : ''}

                                {showQuoteStatus() ?
                                    <SCDropdownList
                                        label="Quote Status"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={true}
                                        options={conditionSource.QuoteStatus}
                                        value={selectedQuoteStatus}
                                        error={errors.QuoteStatus}
                                        name="QuoteStatus"
                                        onChange={quoteStatusChanged}
                                        disabled={isReadOnlyCondition("QuoteStatus")}
                                        cypress="data-cy-quotestatus"
                                    />
                                    : ''}

                                {showInvoiceStatus() ?
                                    <SCDropdownList
                                        label="Invoice Status"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={true}
                                        options={conditionSource.InvoiceStatus}
                                        value={selectedInvoiceStatus}
                                        error={errors.InvoiceStatus}
                                        name="InvoiceStatus"
                                        onChange={invoiceStatusChanged}
                                        disabled={isReadOnlyCondition("InvoiceStatus")}
                                        cypress="data-cy-invoicestatus"
                                    />
                                    : ''}

                                {showPurchaseOrderStatus() ?
                                    <SCDropdownList
                                        label="Purchase Order Status"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={true}
                                        options={conditionSource.PurchaseOrderStatus}
                                        value={selectedPurchaseOrderStatus}
                                        error={errors.PurchaseOrderStatus}
                                        name="PurchaseOrderStatus"
                                        onChange={purchaseOrderStatusChanged}
                                        disabled={isReadOnlyCondition("PurchaseOrderStatus")}
                                        cypress="data-cy-purchaseorderstatus"
                                    />
                                    : ''}

                                {showQueryStatus() ?
                                    <SCComboBox
                                        label="Query Status"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={true}
                                        options={conditionSource.QueryStatus}
                                        value={selectedQueryStatus}
                                        error={errors.QueryStatus}
                                        name="QueryStatus"
                                        onChange={queryStatusChanged}
                                        disabled={isReadOnlyCondition("QueryStatus")}
                                        cypress="data-cy-querystatus"
                                    />
                                    : ''}

                                {showPriority() ?
                                    <SCDropdownList
                                        label="Priority"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={false}
                                        options={conditionSource.Priority}
                                        value={selectedPriority ? selectedPriority : { ID: null, Description: "All" }}
                                        error={errors.Priority}
                                        name="Priority"
                                        onChange={priorityChanged}
                                        disabled={isReadOnlyCondition("Priority")}
                                        cypress="data-cy-priority"
                                    />
                                    : ''}




                                {showElapsedMinutes() ? <>
                                    <MinuteSelector
                                        label="Elapsed Time"
                                        value={getElapsedMinutes()}
                                        name="ElapsedMinutes"
                                        required={true}
                                        error={errors.ElapsedMinutes}
                                        onChange={(e) => minuteDebounce.current && setElapsedMinutes(e)}
                                        readOnly={isReadOnlyCondition("ElapsedMinutes")}
                                        cypressCombo="data-cy-elapsedminutes-combo"
                                        cypressInput="data-cy-elapsedminutes-input"
                                    />
                                </> : ""}

                                {showQuoteReminderType() ?
                                    <SCDropdownList
                                        label="Quote Reminder Type"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={true}
                                        options={conditionSource.QuoteReminderType}
                                        value={selectedQuoteReminderType}
                                        error={errors.QuoteReminderType}
                                        name="QuoteReminderType"
                                        onChange={quoteReminderTypeChanged}
                                        disabled={isReadOnlyCondition("QuoteReminderType")}
                                        cypress="data-cy-quoteremindertype"
                                    />
                                    : ''}

                                {showInvoiceReminderType() ?
                                    <SCDropdownList
                                        label="Invoice Reminder Type"
                                        textField="Description"
                                        dataItemKey="ID"
                                        required={true}
                                        options={conditionSource.InvoiceReminderType}
                                        value={selectedInvoiceReminderType}
                                        error={errors.InvoiceReminderType}
                                        name="InvoiceReminderType"
                                        onChange={invoiceReminderTypeChanged}
                                        disabled={isReadOnlyCondition("InvoiceReminderType")}
                                        cypress="data-cy-invoiceremindertype"
                                    />
                                    : ''}

                                {showMinutes() ? <>
                                    <MinuteSelector
                                        label="Time"
                                        value={getMinutes()}
                                        name="Minutes"
                                        required={true}
                                        error={errors.Minutes}
                                        onChange={(e) => minuteDebounce.current && setMinutes(e)}
                                        readOnly={isReadOnlyCondition("Minutes")}
                                        cypressCombo="data-cy-minutes-combo"
                                        cypressInput="data-cy-minutes-input"
                                    />
                                </> : ""}
                            </div>

                        </>
                        : ""}

                </div>

                <div className="column">
                    {trigger.TriggerConditions && trigger.TriggerConditions.length > 0 && trigger.TriggerConditions[0].TriggerRule ? <>
                        {trigger.TriggerActions ? <>

                            {trigger.TriggerActions.map((triggerAction, index) => {
                                return <div className="card" key={index}>
                                    {trigger.TriggerActions.length > 1 ?
                                        <ActionIcon variant={'transparent'} color={'gray.6'} onClick={() => deleteTriggerAction(index)} ml={'auto'}>
                                            <IconTrash />
                                        </ActionIcon>
                                        // <img src="/icons/trash-bluegrey.svg" alt="trash" className="fit-content" onClick={() => deleteTriggerAction(index)} />
                                        : ''}

                                    <SCDropdownList
                                        label="Action Type"
                                        textField="description"
                                        dataItemKey="value"
                                        required={true}
                                        error={errors[`TriggerActionType-${index}`]}
                                        value={triggerAction.TriggerActionType ? { 'description': Enums.getEnumStringValue(Enums.TriggerActionType, triggerAction.TriggerActionType, true), 'value': triggerAction.TriggerActionType } : null}
                                        options={getTriggerActionTypes()}
                                        onChange={(selectedItem) => setActionType(index, selectedItem)}
                                        cypress="data-cy-triggeractiontype"
                                    />

                                    {triggerAction.TriggerActionType === Enums.TriggerActionType.Communication ? <>

                                        <SCDropdownList
                                            label="Notification Type"
                                            textField="description"
                                            dataItemKey="value"
                                            required={true}
                                            error={errors[`TriggerNotificationType-${index}`]}
                                            value={triggerAction.TriggerNotificationType ? { 'description': replaceItemWithModule(Enums.getEnumStringValue(Enums.TriggerNotificationType, triggerAction.TriggerNotificationType, true)), 'value': triggerAction.TriggerNotificationType } : null}
                                            options={getTriggerNotificationTypes()}
                                            onChange={(selectedItem) => setNotificationType(index, selectedItem)}
                                            cypress="data-cy-notificationtype"
                                        />

                                        {triggerAction.TriggerNotificationType && triggerAction.TriggerNotificationType !== Enums.TriggerNotificationType.None ? <>

                                            {triggerAction.TriggerNotificationType === Enums.TriggerNotificationType.Employee ? <>
                                                <SCComboBox
                                                    name="Recipient"
                                                    dataItemKey="ID"
                                                    textField="FullName"
                                                    label="Recipient"
                                                    required={true}
                                                    error={errors[`RecipientID-${index}`]}
                                                    value={getEmployee(triggerAction.RecipientID)}
                                                    options={employees}
                                                    onChange={(selectedItem) => setRecipient(index, selectedItem)}
                                                    itemRenderMantine={(itemProps) => {

                                                        let displayColorStyle = itemProps.dataItem.DisplayColor && itemProps.dataItem.DisplayColor.startsWith("#") ? itemProps.dataItem.DisplayColor : "";
                                                        let displayColorClass = itemProps.dataItem.DisplayColor && !displayColorStyle ? itemProps.dataItem.DisplayColor + "Local" : "";

                                                        return (
                                                            <div className="employee-container">

                                                                <div className="initial-container">
                                                                    <div className={`initial ${displayColorClass ? displayColorClass : ''}`} style={{ backgroundColor: `${displayColorStyle}` }}>
                                                                        {extractInitials(itemProps.dataItem)}
                                                                    </div>
                                                                </div>

                                                                <div className="details-container">
                                                                    <span className="item1">{itemProps.dataItem.FullName}</span>
                                                                    <span className="item2">{itemProps.dataItem.EmailAddress}</span>
                                                                </div>

                                                                <style >{`
                                                                         .employee-container {
                                                                            display: flex;
                                                                            align-items: center;
                                                                            position: relative;
                                                                        }
                                                                        .initial-container {
                                                                            
                                                                        }
                                                                        .initial {
                                                                            align-items: center;
                                                                            background-color: ${colors.bluePrimary};
                                                                            border-radius: 1rem;
                                                                            color: ${colors.white};
                                                                            display: flex;
                                                                            font-weight: bold;
                                                                            height: 2rem;
                                                                            justify-content: center;
                                                                            width: 2rem;
                                                                        }
                                                                        .details-container {
                                                                            display: flex;
                                                                            margin-left: 8px;
                                                                            flex-direction: column;
                                                                        }
                                                                        .details-container > span {
                                                                            margin-top: -3px; 
                                                                            margin-bottom: -3px;             
                                                                        }
                                                                        .item1 {
                                                                            font-weight: bold;
                                                                        }
                                                                        .item2 {
                                              
                                                                        }
                                                                        .RedLocal {
                                                                            background-color: #FC2E50 !important;
                                                                          }
                                                                          .OrangeLocal {
                                                                            background-color: #F26101 !important;
                                                                          }
                                                                          .YellowLocal {
                                                                            background-color: #FFC940 !important;
                                                                          }
                                                                          .GreenLocal {
                                                                            background-color: #51CB68 !important;
                                                                          }
                                                                          .BlueLocal {
                                                                            background-color: #5A85E1 !important;
                                                                          }
                                                                          .PurpleLocal {
                                                                            background-color: #735AE1 !important;
                                                                          }
                                                                          .BlackLocal {
                                                                            background-color: #4F4F4F !important;
                                                                          }
                                                                          .GreyLocal {
                                                                            background-color: #828282 !important;
                                                                          }
                                                                          .LightGreyLocal {
                                                                            background-color: #BDBDBD !important;
                                                                          }
                                                                          .CyanLocal {
                                                                            background-color: #13CACD !important;
                                                                          } 
                                                                    `}
                                                                </style>
                                                            </div>
                                                        );
                                                    }}
                                                    itemRender={(li, itemProps) => {
                                                        const itemChildren = (
                                                            <div style={{ alignItems: 'center', display: 'flex', padding: '0.5rem 1rem' }}>
                                                                <div style={{
                                                                    alignItems: 'center', backgroundColor: `${colors.bluePrimary}`, borderRadius: '1.25rem',
                                                                    color: `${colors.white}`, display: 'flex', fontWeight: 'bold', height: '2.5rem',
                                                                    justifyContent: 'center', marginRight: '1rem', width: '2.5rem'
                                                                }}>
                                                                    {itemProps.dataItem.FirstName[0] + itemProps.dataItem.LastName[0]}
                                                                </div>
                                                                <div>
                                                                    <h3 style={{ color: `${colors.darkPrimary}`, fontSize: '1rem', margin: 0 }}>{itemProps.dataItem.FirstName + " " + itemProps.dataItem.LastName}</h3>
                                                                    <p style={{ color: `${colors.blueGrey}`, fontSize: '14px', margin: 0 }}>{itemProps.dataItem.EmailAddress}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                        return React.cloneElement(li, li.props, itemChildren);
                                                    }}
                                                />
                                            </> : ''}

                                            <span className="spacer"></span>

                                            <div className="row">
                                                <SCCheckbox
                                                    value={triggerAction.SendEmail}
                                                    onChange={() => toggleSend("SendEmail", index)}
                                                    label="Send Email"
                                                    required={true}
                                                    error={errors[`SendEmail-${index}`]}
                                                    cypress="data-cy-sendemail"
                                                />
                                                {triggerAction.SendEmail ?
                                                    <SCCheckbox
                                                        value={triggerAction.SendSMSIfNoEmail}
                                                        onChange={() => toggleSend("SendSMSIfNoEmail", index)}
                                                        label="Send SMS If No Email"
                                                        required={false}
                                                        cypress="data-cy-sendsmsnoemail"
                                                    /> : ''}

                                                {/* this div aids in keeping the checkbox in the middle */}
                                                <div></div>
                                            </div>

                                            <span className="spacer"></span>
                                            <SCCheckbox
                                                value={triggerAction.SendSMS}
                                                onChange={() => toggleSend("SendSMS", index)}
                                                label="Send SMS"
                                                required={true}
                                                error={errors[`SendSMS-${index}`]}
                                                disabled={triggerAction.SendSMSIfNoEmail}
                                                cypress="data-cy-sendsms"
                                            />

                                            <div className="row">
                                                <div className="column" style={{ width: "100%", marginLeft: 0 }}>
                                                    <SCComboBox
                                                        label="Message Template"
                                                        textField="Name"
                                                        dataItemKey="ID"
                                                        addOption={{ text: "Add new template", action: () => createTemplate(index) }}
                                                        value={triggerAction.Template}
                                                        options={templates}
                                                        required={true}
                                                        onChange={(selectedItem) => setTemplate(index, selectedItem)}
                                                        error={errors[`TemplateID-${index}`]}
                                                        cypress="data-cy-template"
                                                    />
                                                </div>
                                                {triggerAction.Template ?
                                                    <div className="column" style={{ width: "24px", marginTop: "32px" }}>
                                                        <Tooltip color={'scBlue'} label={'Edit'} openDelay={1500}>
                                                            <ActionIcon variant={'transparent'} onClick={() => editTemplate(triggerAction.Template, index)}>
                                                                <IconEdit />
                                                                {/*<img src="/icons/edit-bluegrey.svg" />*/}
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </div> : ""}

                                            </div>

                                            {
                                                trigger.Module && trigger.Module === Enums.Module.JobCard ? <>

                                                    {!documentDefinitionMetaData ? <>
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionJobCardAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionWorkshopAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionWorkshopAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionWorkshopAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionSignedOffAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionJobSheetAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                    </> : <>
                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                    </>}

                                                </> : trigger.Module && trigger.Module === Enums.Module.Quote ? <>

                                                    <span className="spacer"></span>
                                                    <SCCheckbox
                                                        value={getSettingValue(Constants.appStrings.TriggerActionQuoteAttach, index)}
                                                        onChange={() => toggleSetting(Constants.appStrings.TriggerActionQuoteAttach, index)}
                                                        label={Helper.splitWords(Constants.appStrings.TriggerActionQuoteAttach)}
                                                        cypress={`data-cy-${index}`}
                                                    />
                                                    {!documentDefinitionMetaData ? <>
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionJobCardAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionWorkshopAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionWorkshopAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionWorkshopAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionSignedOffAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionJobSheetAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                    </> : <>
                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                    </>}

                                                </> : trigger.Module && trigger.Module === Enums.Module.Invoice ? <>

                                                    <span className="spacer"></span>
                                                    <SCCheckbox
                                                        value={getSettingValue(Constants.appStrings.TriggerActionInvoiceAttach, index)}
                                                        onChange={() => toggleSetting(Constants.appStrings.TriggerActionInvoiceAttach, index)}
                                                        label={Helper.splitWords(Constants.appStrings.TriggerActionInvoiceAttach)}
                                                        cypress={`data-cy-${index}`}
                                                    />
                                                    {!documentDefinitionMetaData ? <>
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionJobCardAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionWorkshopAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionWorkshopAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionWorkshopAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionSignedOffAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                        <span className="spacer"></span>
                                                        <SCCheckbox
                                                            value={getSettingValue(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                            label={Helper.splitWords(Constants.appStrings.TriggerActionJobSheetAttach)}
                                                            cypress={`data-cy-${index}`}
                                                        />
                                                    </> : <>
                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobCardAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionSignedOffAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                        {documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).IsActive ? <>
                                                            <span className="spacer"></span>
                                                            <SCCheckbox
                                                                value={getSettingValue(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                                onChange={() => toggleSetting(Constants.appStrings.TriggerActionJobSheetAttach, index)}
                                                                label={`Attach ${documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).Title}`}
                                                                cypress={`data-cy-${index}`}
                                                            />
                                                        </> : ""}

                                                    </>}

                                                </> : trigger.Module && trigger.Module === Enums.Module.PurchaseOrder ? <>

                                                    <span className="spacer"></span>
                                                    <SCCheckbox
                                                        value={getSettingValue(Constants.appStrings.TriggerActionPurchaseOrderAttach, index)}
                                                        onChange={() => toggleSetting(Constants.appStrings.TriggerActionPurchaseOrderAttach, index)}
                                                        label={Helper.splitWords(Constants.appStrings.TriggerActionPurchaseOrderAttach)}
                                                        cypress={`data-cy-${index}`}
                                                    />

                                                </> : ''
                                            }

                                        </> : ''}

                                    </> : ''}

                                    {triggerAction.TriggerActionType === Enums.TriggerActionType.PropertySet ? <>

                                        <span className="spacer"></span>
                                        <SCCheckbox
                                            value={getSettingValue(Constants.appStrings.TriggerActionSLAStartDateTime, index)}
                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionSLAStartDateTime, index)}
                                            label={Helper.splitWords(Constants.appStrings.TriggerActionSLAStartDateTime)}
                                            cypress={`data-cy-${index}`}
                                            disabled={true}
                                        />
                                        <span className="spacer"></span>
                                        <SCCheckbox
                                            value={getSettingValue(Constants.appStrings.TriggerActionSLAEndDateTime, index)}
                                            onChange={() => toggleSetting(Constants.appStrings.TriggerActionSLAEndDateTime, index)}
                                            label={Helper.splitWords(Constants.appStrings.TriggerActionSLAEndDateTime)}
                                            cypress={`data-cy-${index}`}
                                            disabled={true}
                                        />
                                        <span className="spacer">

                                        </span>
                                        <span style={{ color: colors.alertOrange }}>
                                            Please note: This functionality is not supported. You can remove this trigger action.
                                        </span>
                                    </> : ''}

                                </div>
                            })}
                        </> : ''}

                        {!!errors.TriggerActions ? <span className="error">{errors.TriggerActions}</span> : ""}

                        <div className="row">
                            <Button variant={'outline'} onClick={addTriggerAction} leftSection={<IconCirclePlus />} ml={'auto'} my={'sm'}>
                                Add Another Action
                            </Button>
                        </div>
                    </> : ''}
                </div>
            </div>

            {
                modal &&
                <Flex align={'center'} gap={5} ml={'auto'} style={{ float: 'right' }}>
                    {!isNew && <ActionIcon variant={'transparent'} onClick={deleteTrigger} mr={'md'} color={'yellow.7'}>
                        <IconTrash />
                    </ActionIcon>}
                    <Button variant={'outline'} onClick={cancelEdit}>
                        Cancel
                    </Button>
                    <Button onClick={saveTrigger} disabled={savingTrigger}>
                        Save
                    </Button>
                    {/*<img src="/icons/trash-bluegrey.svg" onClick={deleteTrigger} style={{ marginRight: "8px", cursor: "pointer" }} />
                            <LegacyButton text="Cancel" onClick={backToList} extraClasses="fit-content no-margin hollow" /> &nbsp;
                            <LegacyButton text="Save" onClick={saveTrigger} disabled={savingTrigger} extraClasses="fit-content no-margin" />*/}
                </Flex>
            }

            {/*{modal ? <div className="row">
                <div className="cancel">
                    <LegacyButton text="Cancel" extraClasses="hollow" onClick={cancelEdit} />
                </div>
                <div className="save row">
                    {!isNew ? <img src="/icons/trash-bluegrey.svg" onClick={deleteTrigger} style={{ cursor: "pointer", margin: "16px 8px 0 0" }} /> : ""}
                    <LegacyButton text={(isNew ? "Create" : "Save")} disabled={savingTrigger} onClick={saveTrigger} />
                </div>
            </div> : ''}*/}

            {
                isNew && !modal &&
                <Flex gap={5}>
                    <Button variant={'outline'} onClick={cancel} ml={'auto'}>
                        Cancel
                    </Button>
                    <Button disabled={savingTrigger} onClick={saveTrigger}>
                        Create
                    </Button>
                </Flex>

            }

            {/*{isNew && !modal ? <div className="row">
                <div className="column"></div>
                <div className="column">
                    <div className="actions">
                        <LegacyButton text="Create" extraClasses="auto" disabled={savingTrigger} onClick={saveTrigger} />
                        <LegacyButton text="Cancel" extraClasses="hollow auto" onClick={cancel} />
                    </div>
                </div>
            </div> : ''}*/}

            {createTemplateVisibility ?
                <CreateTemplateModal onSave={onTemplateCreate} setTemplateModalVisibility={setCreateTemplateVisibility} allowedModules={[selectedModule]} />
                : ""}

            {editTemplateVisibility ?
                <EditTemplateModal onSave={onTemplateEdit} setTemplateModalVisibility={setEditTemplateVisibility} template={editingTemplate} fromCreate={fromCreateTemplate} />
                : ""}

            {confirmOptions.display ?
                <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} /> : ""}

            <style jsx>{`

            .error {
                color: ${colors.warningRed};
            }

            .spacer {
                display: block;
                height: 1rem;
            }

            .fit-content {
                width: fit-content;
            }

            .modal-container {
                width: 70rem;
            }

            .row {
              display: flex;
              justify-content: space-between;
            }
            .column {
              display: flex;
              flex-direction: column;
              width: 100%;
              margin-left: 0.5rem;
            }
            .title {
              color: ${colors.bluePrimary};
              font-size: 1.125rem;
              font-weight: bold;
              margin-bottom: 1rem;
              margin-top: 0px;
            }

            .title-no-bottom {
                margin-bottom: 0px;
            }

            .title.column {
              width: fit-content;
            }

            .cancel {
              width: 6rem;
            }
            .update {
              width: 14rem;
            }

            .description {
                font-style: italic;
                font-size: 0.9rem;
                opacity: 0.8;
            }

            .card {
                background-color: ${colors.white};
                border-radius: ${layout.cardRadius};
                box-shadow: ${shadows.cardDark};
                box-sizing: border-box;
                color: ${colors.darkSecondary};
                cursor: pointer;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                justify-content: space-between;
                opacity: 1;
                padding: 1rem;
                position: relative;
                transition: opacity 0.3s ease-in-out;
                margin-bottom: 1rem;
              }

                .actions {
                    display: flex;
                    flex-direction: row-reverse;
                }
                .actions :global(.button){
                    margin-left: 0.5rem;
                    margin-top: 1rem;
                    padding: 0 1rem;
                    white-space: nowrap;
                }
          `}</style>
        </Flex>
    );
};

export default ManageTrigger;