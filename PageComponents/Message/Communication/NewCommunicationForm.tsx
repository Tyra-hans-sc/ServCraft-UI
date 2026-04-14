import {
    ActionIcon,
    Box,
    Button,
    Card,
    Center,
    Flex,
    Menu, ScrollArea,
    SegmentedControl,
    Text,
    Highlight as MantineHighlight,
    Tooltip, Loader
} from "@mantine/core";
import {
    IconAddressBook,
    IconBookDownload,
    IconCodePlus,
    IconMail,
    IconMailFast,
    IconMessage2Dollar, IconSend,
    IconUserScan
} from "@tabler/icons-react";
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@mantine/form";
import * as Enums from "@/utils/enums";
import Constants from "@/utils/constants";
import BillingService from "@/services/billing-service";
import PS from "@/services/permission/permission-service";
import SubscriptionContext from "@/utils/subscription-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import NextLink from "next/link";
import Helper from "@/utils/helper";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import { useDidUpdate, useFocusReturn } from "@mantine/hooks";
import CommunicationContactSelector from "@/PageComponents/Message/Communication/CommunicationContactSelector";
import Fetch from "@/utils/Fetch";
import { IconMessage2 } from "@tabler/icons";
import SCTextArea from "@/components/sc-controls/form-controls/sc-textarea";
import CommunicationAttachments from "./CommunicationAttachments";
import Router from "next/router";
import { showNotification } from "@mantine/notifications";
import TemplateService from "@/services/template-service";
import ConfirmAction from "@/components/modals/confirm-action";
import helper from "@/utils/helper";
import { colors } from "@/theme";
import ScRichTextEditor from "@/PageComponents/Message/Communication/ScRichTextEditor";

const smsMaxChar = 459
const MAX_CONTENT_SIZE = 1048576 / 2; // 500 KB in bytes

const mapLegacyTypeToEnum = {
    'sms': Enums.MessageType.SMS,
    'email': Enums.MessageType.Email,
    'both': Enums.MessageType.Both,
}

interface ReplacementTag {
    Group: string;
    Name: string;
    Description: string;
    Module: null | number;
}

const getInitialDocument = (props: any) => {
    const dv: any[] = []
    if (props.attachQuote) {
        dv.push('quote')
    }
    if (props.attachInvoice) {
        dv.push('invoice')
    }
    if (props.attachPurchaseOrder) {
        dv.push('purchase_order')
    }
    if (props.attachJobCard) {
        dv.push('job_card')
    }
    return dv
}

export interface Contact {
    Title: null | string,
    FirstName: string,
    LastName: string,
    FullName: string,
    EmailAddress: string,
    MobileNumber: string,
    DesignationID: null | string,
    DesignationDescription: null | string,
    WorkNumber: null | string,
    HomeNumber: null | string,
    FaxNumber: null | string,
    IDNumber: null | string,
    Birthdate: null | Date,
    SendEmail: boolean,
    SendSMS: boolean,
    Unsubscribe: boolean,
    IsPrimary: boolean,
    IsPrimaryAccount: boolean,
    LocationID: null | string,
    LocationDescription: null | string,
    Location: null | string,
    CustomerID: string,
    CustomerName: string,
    Customer: null | string,
    ID: string,
    IsActive: boolean,
    CreatedBy: string,
    CreatedDate: string,
    ModifiedBy: string,
    ModifiedDate: string,
    RowVersion: string
}

export interface Employee {
    FirstName: string,
    LastName: string,
    EmailAddress: string,
    MobileNumber: string,
    UserID: string,
    UserName?: string,
    Password?: string,
    AuthUserIsActive: boolean,
    SendEmail: boolean,
    SendSMS: boolean,
    SendNotifications: boolean,
    IsAllJobCardStatus: boolean,
    IsAllStore: boolean,
    IsAllReport: boolean,
    PageSize: number,
    IsSalesRepresentative: boolean,
    IsTechnician: boolean,
    Owner: boolean,
    DisplayColor: string,
    FullName: string,
    OwnerControlled: boolean,
    SessionTimeOut: number,
    LastKnownLatitude?: number,
    LastKnownLongitude?: number,
    LastKnownActiveDate?: Date,
    PrimaryRole?: string,
    Permissions: any[],
    Roles: any[],
    Stores: any[],
    JobStatuses: any[],
    Reports: any[],
    ID: string,
    IsActive: boolean,
    CreatedBy: string,
    CreatedDate: string,
    ModifiedBy: string,
    ModifiedDate: string,
    RowVersion: string,
}

interface Template {
    Name: string;
    Module: number;
    TemplateType: number;
    Subject: string;
    EmailBody: string;
    SMSBody: string;
    MasterID: string;
    ID: string;
    IsActive: boolean;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedBy: string;
    ModifiedDate: string;
    RowVersion: string;
}

export interface NewCommunicationFormProps {
    validateAndCloseCounter: number;
    supplier: { Contacts: Contact[], [key: string]: any };
    customer: { Contacts: Contact[], [key: string]: any };
    item: any;
    itemId: string; //: id;
    itemUrl?: string;
    onClose?: () => void;
    onSent?: () => void;
    method: 0 | 1 | 2 | 'email' | 'sms' | 'both';
    moduleCode: string | number;
    templates: Template[]; //: templates.Results;
    attachQuote?: boolean;
    attachInvoice?: boolean;
    attachPurchaseOrder?: boolean;
    attachJobCard?: boolean;
    template?: Template;
    employees: Employee[]; //: employees.Results;
    documentDefinitionMetaData: any; //: documentDefinitionMetaData
    stickyHeaderOffset?: number;
    preSelectEmployeeId?: string;
    initialValues?:NewCommunicationFormInitialValues
}

export interface NewCommunicationFormInitialValues{
    EmailBody?:string,
    Subject?:string
}

const content = '';

const NewCommunication: FC<NewCommunicationFormProps> = ({ stickyHeaderOffset = 0, ...props }) => {

    const [accessStatus, setAccessStatus] = useState<any>(Enums.AccessStatus.None);

    const subscriptionContext = useContext<any>(SubscriptionContext);
    const [credits, setCredits] = useState(-1)
    const [canBuyCredits, setCanBuyCredits] = useState(false)

    const { data: subscription } = useQuery(['subscriptionInfo'], () => BillingService.getSubcriptionInfo(), {
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false, // Don't refetch on tab focus
        refetchOnMount: false // Don't refetch on component remount
    })

    useEffect(() => {
        if (subscription) {
            const [subscriptionInfo] = subscription as [any, string];
            if (subscriptionInfo) {
                setAccessStatus(subscriptionInfo.AccessStatus);
                setCredits(subscriptionInfo.SMSCreditsPurchased - (subscriptionInfo.SMSCreditsUsed ?? 0))
                /**set purchase credits access**/
                let canAccess = (subscriptionInfo.AccessStatus === Enums.AccessStatus.Live || subscriptionInfo.AccessStatus === Enums.AccessStatus.Trial);
                // let smsRateInclVAT = subscriptionInfo.SMSRateExVAT * (1 + subscriptionInfo.VATPercentage / 100);
                let billingAccount = subscriptionInfo.BillingAccount;
                if (billingAccount && billingAccount.BillingProvider === Enums.BillingProvider.Custom) {
                    canAccess = true;
                }
                let canBuy = PS.hasPermission(Enums.PermissionName.Subscriptions) && canAccess && subscriptionInfo.SMSRateExVAT > 0
                setCanBuyCredits(canBuy)
            }
        }
    }, [subscription])

    const validateRecipients = (contacts: Contact[], employees: Employee[]) => {
        let result: { contactError: string | null, employeeError: string | null, contactWarning: string | null, employeeWarning: string | null, isValid: boolean } = {
            isValid: true,
            contactError: null,
            employeeError: null,
            contactWarning: null,
            employeeWarning: null
        };

        // no recipients selected
        if (contacts.length === 0 && employees.length === 0) {
            result.contactError = "At least one contact or employee must be selected";
            result.employeeError = "At least one contact or employee must be selected";
            result.isValid = false;
        }

        let sendingEmail = +form.values.messageType === Enums.MessageType.Email || +form.values.messageType === Enums.MessageType.Both;
        let sendingSMS = +form.values.messageType === Enums.MessageType.SMS || +form.values.messageType === Enums.MessageType.Both;

        if (result.isValid) {
            let contactCount = contacts.length;
            let contactEmailCount = contacts.filter(x => x.EmailAddress && x.SendEmail).length;
            let contactSMSCount = contacts.filter(x => x.MobileNumber && x.SendSMS).length;
            let contactEmailValid = sendingEmail && contactEmailCount > 0;
            let contactEmailIncomplete = sendingEmail && contactCount > contactEmailCount;
            let contactSMSValid = sendingSMS && contactSMSCount > 0;
            let contactSMSIncomplete = sendingSMS && contactCount > contactSMSCount;
            let contactValid = contactEmailValid || contactSMSValid;

            let employeeCount = employees.length;
            let employeeEmailCount = employees.filter(x => x.EmailAddress && x.SendEmail).length;
            let employeeSMSCount = employees.filter(x => x.MobileNumber && x.SendSMS).length;
            let employeeEmailValid = sendingEmail && employeeEmailCount > 0;
            let employeeEmailIncomplete = sendingEmail && employeeCount > employeeEmailCount;
            let employeeSMSValid = sendingSMS && employeeSMSCount > 0;
            let employeeSMSIncomplete = sendingSMS && employeeCount > employeeSMSCount;
            let employeeValid = employeeEmailValid || employeeSMSValid;

            result.isValid = contactValid && employeeValid;

            if (contactValid) {
                if (contactEmailIncomplete && contactSMSIncomplete) result.contactWarning = "Some contacts are not configured to receive emails and/or SMS messages";
                else if (contactEmailIncomplete) result.contactWarning = "Some contacts are not configured to receive emails";
                else if (contactSMSIncomplete) result.contactWarning = "Some contacts are not configured to receive SMS messages";
            }
            else if (contactCount > 0) {
                result.contactError = "No contacts are able to receive any communications";
            }

            if (employeeValid) {
                if (employeeEmailIncomplete && employeeSMSIncomplete) result.employeeWarning = "Some employees are not configured to receive emails and/or SMS messages";
                else if (employeeEmailIncomplete) result.employeeWarning = "Some employees are not configured to receive emails";
                else if (employeeSMSIncomplete) result.employeeWarning = "Some employees are not configured to receive SMS messages";
            }
            else if (employeeCount > 0) {
                result.employeeError = "No employees are able to receive any communications";
            }
        }

        return result;
    };

    const form = useForm<{
        module: number
        itemId: string
        storeId: string
        messageType: number;
        contacts: Contact[];
        employees: Employee[];
        subject: string;
        smsBody: string;
        moduleAttachments: any[];
        localAttachments: any[];
        forms: any[];
        documents: any[];
    }>({
        initialValues: {
            module: +props.moduleCode,
            itemId: props.itemId,
            storeId: props.item.StoreID,
            messageType: typeof props.method === "string" ?
                mapLegacyTypeToEnum[props.method] ?? Enums.MessageType.Email :
                props.method ?? Enums.MessageType.Email,
            contacts: !!props.customer ? (props.item.Contact ? [props.item.Contact] : []) : props.item.SupplierContact ? [props.item.SupplierContact] : [],
            employees: props.preSelectEmployeeId ? props.employees.filter(x => x.ID === props.preSelectEmployeeId) : [],
            subject: props.template?.Subject || props.initialValues?.Subject || '', // relevant
            smsBody: props.template?.SMSBody || '',
            moduleAttachments: [],
            localAttachments: [],
            forms: [],
            documents: getInitialDocument(props) ?? []
        },
        validateInputOnBlur: true,
        validate: {
            subject: (val, values) => {
                const invalidTags = TemplateService.testForValidSubject(val)
                if (invalidTags.length !== 0) {
                    return 'Unfortunately ' + invalidTags.join(', ') + ' is not allowed in the message subject'
                }
                if ((+values.messageType === Enums.MessageType.Email || +values.messageType === Enums.MessageType.Both) && !val) {
                    return 'Subject is required when sending emails';
                }
                return null;
            },
            smsBody: (val, values) => {
                if (+values.messageType === Enums.MessageType.SMS || +values.messageType === Enums.MessageType.Both) {
                    if (!val) {
                        return 'Please enter an SMS message';
                    }
                    if (val.length > smsMaxChar) {
                        return `SMS content exceeds the maximum allowed characters of ${smsMaxChar}`;
                    }
                }
                return null;
            },
            employees: (val, values) => {
                let validationResult = validateRecipients(values.contacts, val);
                return validationResult.employeeError;
                // if (val.length === 0 && values.contacts.length === 0) {
                //     return 'Please select a recipient';
                // }
                // if (+values.messageType === Enums.MessageType.Both) {
                //     const emailOrSmsConditionForEmployees = val.every(
                //         employee => (employee.EmailAddress && employee.SendEmail) || (employee.MobileNumber && employee.SendSMS)
                //     );
                //     return emailOrSmsConditionForEmployees ? null : 'Some employees are missing both an email and a phone number or have opted out of both emails and SMS';
                // } else if (+values.messageType === Enums.MessageType.Email) {
                //     return val.every(employee => employee.EmailAddress && employee.SendEmail)
                //         ? null
                //         : 'Some employees are missing an email or have opted out of emails';
                // } else if (+values.messageType === Enums.MessageType.SMS) {
                //     return val.every(employee => employee.MobileNumber && employee.SendSMS)
                //         ? null
                //         : 'Some employees are missing a phone number or have opted out of SMS';
                // }
                //return null;
            },
            contacts: (val, values) => {
                let validationResult = validateRecipients(val, values.employees);
                return validationResult.contactError;
                // if (val.length === 0 && values.employees.length === 0) {
                //     return 'Please select a recipient';
                // }
                // if (+values.messageType === Enums.MessageType.Both) {
                //     const emailOrSmsConditionForContacts = val.every(
                //         contact => (contact.EmailAddress && contact.SendEmail) || (contact.MobileNumber && contact.SendSMS)
                //     );
                //     return emailOrSmsConditionForContacts ? null : 'Some contacts are missing both an email and a phone number or have opted out of both emails and SMS';
                // } else if (+values.messageType === Enums.MessageType.Email) {
                //     return val.every(contact => contact.EmailAddress && contact.SendEmail)
                //         ? null
                //         : 'Some contacts are missing an email or have opted out of emails';
                // } else if (+values.messageType === Enums.MessageType.SMS) {
                //     return val.every(contact => contact.MobileNumber && contact.SendSMS)
                //         ? null
                //         : 'Some contacts are missing a phone number or have opted out of SMS';
                // }
                // return null;
            },
        },
        transformValues: (values) => ({
            ...values,
            messageRecipientList: [
                ...values.contacts.map(x => (
                    { 'RecipientID': x.ID, UserType: !!props.customer ? Enums.UserType.Customer : Enums.UserType.Supplier, 'SendEmail': x.SendEmail, 'SendSMS': x.SendSMS }
                )),
                ...values.employees.map(x => (
                    { 'RecipientID': x.ID, UserType: Enums.UserType.Employee, 'SendEmail': x.SendEmail, 'SendSMS': x.SendSMS }
                )),
            ],
            messageType: +values.messageType,
            attachments: [...values.moduleAttachments, ...values.localAttachments],
            formHeaders: values.forms,
            attachQuote: values.documents.includes('quote'),
            attachInvoice: values.documents.includes('invoice'),
            attachJobCard: values.documents.includes('job_card'),
            attachWorkShop: values.documents.includes('workshop'),
            attachSignOff: values.documents.includes('sign_off'),
            attachJobSheet: values.documents.includes('job_sheet'),
            attachPurchaseOrder: values.documents.includes('purchase_order'),
        })
    })

    /*useEffect(() => {
        console.log('form values have changed', form.values, form)
    }, [form.values]);*/

    const contacts = (props.customer ?? props.supplier).Contacts
    const employees = (props.employees)

    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
    const submitButtonRef = useRef<HTMLButtonElement>(null)

    Helper.preventRouteChange(
        form.isDirty(),
        form.resetDirty,
        (co) => setConfirmOptions({
            ...co,
            confirmButtonText: 'Send',
            heading: "Send Communication?",
            text: "You have unfinished changes",
        }),
        () => !messageMutation.isLoading && submitButtonRef.current?.click()
    );
    useDidUpdate(() => {
        if (props.validateAndCloseCounter) {
            if (form.isDirty()) {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    display: true,
                    showCancel: true,
                    showDiscard: true,
                    onDiscard: () => {
                        props.onClose && props.onClose()
                    },
                    heading: "Send Communication?",
                    text: `You have unfinished changes`,
                    confirmButtonText: "Send",
                    onConfirm: messageMutation.isLoading ? () => { } : () => submitButtonRef.current?.click()
                })
            } else {
                props.onClose && props.onClose()
            }
        }
    }, [props.validateAndCloseCounter]);

    const [forceNewContentValue, setForceNewContentValue] = useState(props.initialValues?.EmailBody || content)

    const [emailEditorEmpty, setEmailEditorEmpty] = useState(false)
    const [emailEditorContentHtml, setEmailEditorContentHtml] = useState(props.initialValues?.EmailBody || content);
    const [contentErrorMessage, setContentErrorMessage] = useState<string | null>(null);
    useEffect(() => {
        try {
            const size = new Blob([emailEditorContentHtml]).size; // Get the size of the content in bytes
            // console.log("current email content size", size);

            if (size > MAX_CONTENT_SIZE) {
                const excessSize = size - MAX_CONTENT_SIZE;
                let excessSizeMessage = '';

                if (excessSize < 1024) {
                    excessSizeMessage = `${excessSize} bytes`;
                } else if (excessSize < 1048576) {
                    excessSizeMessage = `${(excessSize / 1024).toFixed(2)} KB`;
                } else {
                    excessSizeMessage = `${(excessSize / 1048576).toFixed(2)} MB`;
                }

                setContentErrorMessage(
                    `Total content exceeds the 500KB limit by ${excessSizeMessage}`
                );
            } else {
                setContentErrorMessage(null);
            }
        } catch (error) {
            console.error("Unable to determine content size", error);
        }
    }, [emailEditorContentHtml]);

    /*useDidUpdate(() => {
        if (emailEditor?.isFocused && !emailEditorTouched) {
            setEmailEditorTouched(true)
        }
    }, [emailEditor?.isFocused])*/

    const [subjectCursorPos, setSubjectCursorPos] = useState(-1)
    const [smsCursorPos, setSmsCursorPos] = useState(-1)
    const returnFocus = useFocusReturn({ // return focus does not function with rich text component
        opened: true,
        shouldReturnFocus: subjectCursorPos !== -1 || smsCursorPos !== -1,
    });

    const [recentReplacementTagItems, setRecentReplacementTagItems] = useState([])
    const [replacementTagSearch, setReplacementTagSearch] = useState('')
    const { data: replacementTags } = useQuery(['replacementTags'], async () => {
        const { Results: tags, ...res } = await Fetch.get({
            url: `/Template/GetReplacementTagList?module=${props.moduleCode}&searchPhrase=${''}`
        })
        if (tags) {
            return tags as ReplacementTag[]
        } else {
            throw new Error(res.serverMessage || res.message || 'something went wrong')
        }
    })
    const replacementTagOptions = useCallback((onSelect: (replacementTag: ReplacementTag, event: any) => void) => {

        const filtered = replacementTags?.filter(
            x => (
                x.Module === null || x.Module === +props.moduleCode
            ) && (
                    !replacementTagSearch || x.Name.toLowerCase().includes(replacementTagSearch.toLowerCase()) || x.Description.toLowerCase().includes(replacementTagSearch.toLowerCase()) || x.Group.toLowerCase().includes(replacementTagSearch.toLowerCase())
                )
        )

        return <>
            <ScTextControl
                style={{ border: 0 }}
                mt={0}
                placeholder={'Search'}
                autoFocus
                value={replacementTagSearch}
                onChange={e => setReplacementTagSearch(e.currentTarget.value)}
            />
            <ScrollArea.Autosize
                mah={350}
            >
                {
                    filtered?.length === 0 && replacementTagSearch &&
                    <Text size={'sm'} ta={'center'} c={'dimmed'} my={'xl'}>
                        Nothing found....
                    </Text>
                }
                {
                    filtered?.map((rt, i, a) => (
                        [
                            i === 0 || (a[i - 1]?.Group !== rt.Group) &&
                            <Menu.Label key={rt.Name + rt.Group}>{rt.Group}</Menu.Label>,
                            <Menu.Item
                                key={rt.Name}
                                onClick={
                                    e => onSelect(rt, e)
                                }
                            // leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                            >
                                <Flex
                                    align={'center'}
                                    justify={'space-between'}
                                    gap={5}
                                >
                                    <MantineHighlight
                                        highlight={replacementTagSearch}
                                        size={'sm'}
                                        color={'scBlue.1'}
                                    >
                                        {rt.Description}
                                    </MantineHighlight>
                                    <MantineHighlight
                                        highlight={replacementTagSearch}
                                        size={'xs'}
                                        fw={'bolder'}
                                        color={'scBlue.1'}
                                    >
                                        {rt.Name}
                                    </MantineHighlight>
                                </Flex>
                            </Menu.Item>
                        ]
                    ))
                }
            </ScrollArea.Autosize>
        </>

    }, [replacementTags, recentReplacementTagItems, replacementTagSearch])

    const messageMutation = useMutation(
        ['messageMutation'],
        async (params) => {
            await Fetch.post({
                url: '/Message',
                params
            } as any).then(
                (messageRes) => {
                    if (messageRes && messageRes.HttpStatusCode == 200) {
                        Helper.mixpanelTrack(Constants.mixPanelEvents.createCommunication, {
                            "itemID": props.itemId
                        } as any);
                        return messageRes
                    } else {
                        throw new Error(messageRes.serverMessage || messageRes.message || 'Message could not be sent')
                    }
                }
            )

        }
        ,
        {
            onSuccess: (messageRes) => {
                showNotification({
                    id: 'messageSent',
                    message: 'Message sent successfully',
                    color: 'scBlue',
                    autoClose: 3000
                })
                // setFormIsDirty(false);
                if (props.onSent) {
                    props.onSent()
                }
                if (props.onClose) {
                    props.onClose()
                } else {
                    // cleaning form dirty state as we have successfully submitted, and waiting a bit for state to update (this is necessary due to timing on page navigation)
                    helper.formResetDirty(form);
                    helper.waitABit().then(() => {
                        let url = props.itemUrl?.toLowerCase();
                        if (+props.moduleCode === Enums.Module.Asset) {
                            Helper.nextRouter(Router.push, '/asset/' + props.itemId + "?tab=communication");
                        } else if (+props.moduleCode === Enums.Module.PurchaseOrder) {
                            Helper.nextRouter(Router.push, '/purchase/' + props.itemId + "?tab=communication");
                        } else {
                            Helper.nextRouter(Router.push, url + props.itemId + "?tab=communication");
                        }
                    });
                }

            },
            onError: (err: Error) => {
                if (err.message.includes("(429)")) {
                    showNotification({
                        id: 'messageSent',
                        title: 'Message could not be sent',
                        message: "You have reached your limit sending messages, try again in a short while",
                        color: 'yellow.7',
                        autoClose: 3000
                    })
                } else {
                    showNotification({
                        id: 'messageSent',
                        title: 'Message could not be sent',
                        message: err.message || '',
                        color: 'yellow.7',
                        autoClose: 3000
                    })
                }
                // setFormIsDirty(false);
            }
        }
    );

    const handleSubmit = (formVals, formErrors) => {
        if (formVals.messageType === Enums.MessageType.SMS || !emailEditorEmpty) {
            messageMutation.mutate({
                ...formVals,
                emailBody: emailEditorContentHtml
            });
        } else if (emailEditorEmpty) {
            setContentErrorMessage('Email content is required');
            // emailEditor.commands.scrollIntoView()
        }
    }

    const handleErrors = (formErrors) => {
        // Handle errors
        if (formErrors) {
            const firstErrorField = Object.keys(formErrors)[0];
            let errorElement = (formErrors.contacts || formErrors.employees) ? (
                document.querySelector(`#recipients`)
            ) : form.getInputNode(firstErrorField);
            errorElement?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    const validatedRecipients = useMemo(() => {
        return validateRecipients(form.values.contacts, form.values.employees);
    }, [form.values.contacts, form.values.employees, form.values.messageType]);

    return <>
        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

        <form
            onSubmit={form.onSubmit(handleSubmit, handleErrors)}
        >
            <Flex direction={'column'}>
                <Flex
                    align={'start'}
                    mb={'sm'}
                    wrap={'wrap-reverse'}
                >
                    <SegmentedControl
                        disabled={props.template?.ID === Constants.templateIDs.TemplateCustomerZone}
                        {...form.getInputProps('messageType')}
                        onChange={
                            (e) => {
                                form.getInputProps('messageType').onChange(e)
                                form.validateField('employees')
                                form.validateField('contacts')
                            }
                        }
                        value={form.values.messageType + ''}
                        data={[
                            {
                                value: Enums.MessageType.Email + '',
                                label: (
                                    <Center style={{ gap: 5 }}>
                                        <IconMail size={18} />
                                        <span>Email</span>
                                    </Center>
                                ),
                            },
                            {
                                value: Enums.MessageType.SMS + '',
                                label: (
                                    <Center style={{ gap: 5 }}>
                                        <IconMessage2 size={18} />
                                        <span>SMS</span>
                                    </Center>
                                ),
                            },
                            {
                                value: Enums.MessageType.Both + '',
                                label: (
                                    <Center style={{ gap: 5 }}>
                                        <IconMailFast size={18} />
                                        <span>Both</span>
                                    </Center>
                                ),
                            },
                        ]}
                    />

                    <Flex align={'center'} gap={'sm'} ml={'auto'}>
                        <Text c={'dimmed'}>SMS Credits Available: {credits}</Text>
                        <Tooltip events={{ hover: true, focus: true, touch: true }} disabled={canBuyCredits}
                            label={'You do not have access to purchase more credits'} color={'scBlue'}>
                            <NextLink href={'/settings/subscription/manage?tab=sms'}
                                onClick={() => Helper.nextLinkClicked('/settings/subscription/manage?tab=sms')}>
                                <Button disabled={!canBuyCredits} color={'scBlue'} variant={'light'}
                                    rightSection={<IconMessage2Dollar size={14} />}>
                                    Buy Credits
                                </Button>
                            </NextLink>
                        </Tooltip>
                    </Flex>

                </Flex>
            </Flex>

            <Flex mb={'sm'} direction={'column'}>
                <Flex
                    gap={'sm'}
                    wrap={'wrap'}
                    align={'stretch'}
                    justify={'stretch'}
                >
                    <Box
                        w={{ base: '100%', md: 'calc(50% - 20px)' }}
                        style={{
                            flexGrow: 1
                        }}
                    >
                        <Card
                            id={'recipients'}
                            withBorder
                            mih={125}
                            style={{ borderColor: form.errors.contacts ? 'var(--mantine-color-yellow-6)' : '' }}
                        >
                            <CommunicationContactSelector
                                messageType={+form.values.messageType}
                                contacts={contacts}
                                icon={<IconAddressBook size={18} />}
                                placeholder={'Search contacts'}
                                defaultValue={form.values.contacts}
                                onAdd={(contact) => {
                                    form.insertListItem('contacts', contact)
                                    form.validateField('contacts')
                                    form.validateField('employees')
                                }}
                                onRemove={(index) => {
                                    form.removeListItem('contacts', index)
                                    form.validateField('contacts')
                                    form.validateField('employees')
                                }}
                            />
                        </Card>
                        {
                            form.errors.contacts &&
                            <Text c={'yellow.6'} size={'11px'} mt={3}>
                                {form.errors.contacts}
                            </Text>
                        }
                    </Box>
                    <Box
                        w={{ base: '100%', md: 'calc(50% - 20px)' }}
                        style={{
                            flexGrow: 1
                        }}
                    >
                        <Card
                            withBorder
                            mih={125}
                            style={{ borderColor: form.errors.employees ? 'var(--mantine-color-yellow-6)' : '' }}
                        >
                            <CommunicationContactSelector
                                messageType={+form.values.messageType}
                                contacts={employees}
                                icon={<IconUserScan size={18} />}
                                placeholder={'Search employees'}
                                defaultValue={form.values.employees}
                                onAdd={(contact) => {
                                    form.insertListItem('employees', contact)
                                    form.validateField('contacts')
                                    form.validateField('employees')
                                }}
                                onRemove={(index) => {
                                    form.removeListItem('employees', index)
                                    form.validateField('contacts')
                                    form.validateField('employees')
                                }}
                            />
                        </Card>
                        {
                            form.errors.employees &&
                            <Text c={'yellow.6'} size={'11px'} mt={3}>
                                {form.errors.employees}
                            </Text>
                        }
                    </Box>
                </Flex>

            </Flex>

            <Flex direction={'column'}>
                <Flex mb={'sm'} w={'100%'} align={'end'} justify={'space-between'}>
                    {
                        +form.values.messageType !== Enums.MessageType.SMS &&
                        <ScTextControl
                            rightSection={
                                <Tooltip
                                    color={'dark'}
                                    label={'Insert replacement tag'}
                                    openDelay={1000}
                                >
                                    <Menu shadow="md" width={350}
                                        trapFocus={false}
                                        position={'left'}

                                    >
                                        <Menu.Target>
                                            <ActionIcon
                                                variant={'transparent'}
                                                color={'dark'}
                                                onClick={returnFocus}
                                            >
                                                <IconCodePlus
                                                    stroke={1.2}
                                                    size={22}
                                                />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {replacementTagOptions((rt, e) => {
                                                e.preventDefault();
                                                form.setFieldValue('subject', form.values.subject.substring(0, subjectCursorPos) + '{{' + rt.Name + '}}' + form.values.subject.substring(subjectCursorPos));
                                                // setSubjectCursorPos(p => p + rt.Name.length + 4)
                                                returnFocus();
                                            })}
                                        </Menu.Dropdown>
                                    </Menu>
                                </Tooltip>
                            }
                            {...form.getInputProps('subject')}
                            onChange={event => {
                                form.getInputProps('subject').onChange(event);
                                setSubjectCursorPos(event.currentTarget.selectionStart || 0);
                            }}
                            onFocus={(e) => {
                                setSubjectCursorPos(e.currentTarget.selectionStart || 0)
                                setSmsCursorPos(-1)
                            }}
                            // onBlur={() => setSubjectCursorPos(-1)}
                            mt={0}
                            w={500}
                            maw={'80%'}
                            label={'Message ' + (+form.values.messageType === Enums.MessageType.Email ? 'subject' : 'title')}
                        />
                    }

                    <Flex gap={'sm'} ml={'auto'}>
                        <Menu shadow="md" width={200}
                            trapFocus={false}
                            position={'bottom-end'}
                        >
                            <Menu.Target>
                                <Button
                                    variant={'default'}
                                    leftSection={
                                        <IconBookDownload
                                            stroke={1.2}
                                            size={22}
                                        />
                                    }
                                >
                                    Load Template
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <ScrollArea.Autosize mah={'50vh'} type={'auto'}>
                                    {
                                        props.templates.map(
                                            x => <Menu.Item
                                                // leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                                key={x.ID}
                                                onClick={() => {
                                                    form.setFieldValue('subject', x.Subject || '')
                                                    form.setFieldValue('smsBody', x.SMSBody || '')
                                                    setForceNewContentValue(x.EmailBody || '')
                                                    setEmailEditorContentHtml(x.EmailBody || '')
                                                    // emailEditor?.commands.setContent(x.EmailBody || '')
                                                    // smsEditor?.commands.setContent(x.SMSBody)
                                                }}
                                            >
                                                {x.Name}
                                            </Menu.Item>
                                        )
                                    }
                                </ScrollArea.Autosize>
                            </Menu.Dropdown>
                        </Menu>

                    </Flex>
                </Flex>
                <Box>
                    {
                        (
                            +form.values.messageType === Enums.MessageType.Email ||
                            +form.values.messageType === Enums.MessageType.Both
                        ) && <>

                            <ScRichTextEditor
                                value={emailEditorContentHtml}
                                forceNewContentValue={forceNewContentValue}
                                onChange={setEmailEditorContentHtml}
                                setIsEmpty={(empty: boolean) => setEmailEditorEmpty(empty)}
                                replacementTagOptions={replacementTagOptions}
                                errorMessage={contentErrorMessage}
                                maxHeight={'100%'}
                                stickyOffset={stickyHeaderOffset}
                                showHtmlEditButton
                                required={true}
                            />

                            {/* attachments */}
                            <Box
                                mt={'sm'}
                            >
                                <CommunicationAttachments
                                    {...props}
                                    onFormsChanged={(x) => {
                                        form.setFieldValue('forms', x)
                                    }}
                                    onAttachmentsChanged={(x) => {
                                        form.setFieldValue('moduleAttachments', x)
                                    }}
                                    onLocalAttachmentsChanged={(x) => {
                                        form.setFieldValue('localAttachments', x)
                                    }}
                                    onDocumentsChanged={(x) => {
                                        form.setFieldValue('documents', x)
                                    }}
                                    defaultDocs={form.values.documents}
                                />
                            </Box>
                        </>
                    }
                    {
                        (
                            +form.values.messageType === Enums.MessageType.SMS ||
                            +form.values.messageType === Enums.MessageType.Both
                        ) &&
                        <SCTextArea
                            autosize
                            maxRows={14}
                            rows={3}
                            maw={'100%' as any}
                            label={'SMS text'}
                            description={
                                <Text size={'11px'}>
                                    {
                                        form.values.smsBody.includes('{{') && form.values.smsBody.includes('}}') ? 'Est. characters: ' : 'Characters: '
                                    }
                                    <span
                                        style={{ color: form.values.smsBody.length > smsMaxChar ? 'var(--mantine-color-yellow-7)' : 'inherit' }}>{form.values.smsBody.length}</span>
                                    &nbsp;(max {smsMaxChar})
                                </Text>

                            }
                            {...form.getInputProps('smsBody')}
                            rightSection={
                                <Tooltip
                                    color={'dark'}
                                    label={'Insert replacement tag'}
                                    openDelay={1000}
                                >
                                    <Menu shadow="md" width={350}
                                        trapFocus={false}
                                        position={'left'}
                                    >
                                        <Menu.Target>
                                            <ActionIcon
                                                variant={'transparent'}
                                                color={'dark'}
                                                onClick={returnFocus}
                                            >
                                                <IconCodePlus
                                                    stroke={1.2}
                                                    size={22}
                                                />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {replacementTagOptions((rt, e) => {
                                                e.preventDefault();
                                                form.setFieldValue('smsBody', form.values.smsBody.substring(0, smsCursorPos) + '{{' + rt.Name + '}}' + form.values.smsBody.substring(smsCursorPos));
                                                // setSmsCursorPos(p => p + rt.Name.length + 4)
                                                returnFocus();
                                            })}
                                        </Menu.Dropdown>
                                    </Menu>
                                </Tooltip>
                            }
                            onChange={event => {
                                form.getInputProps('smsBody').onChange(event);
                                setSmsCursorPos(event.currentTarget.selectionStart || 0);
                            }}
                            onFocus={(e) => {
                                setSmsCursorPos(e.currentTarget.selectionStart || 0)
                                setSubjectCursorPos(-1)
                            }}
                            mb={'md'}
                            mt={0}
                        />
                    }
                </Box>

                <Flex align={"center"}>

                    <div style={{ textAlign: "center", fontSize: "0.9rem", marginLeft: "auto", color: colors.mantineErrorOrange() }}>
                        <div>{validatedRecipients?.contactWarning}</div>
                        <div>
                            {validatedRecipients?.employeeWarning}
                        </div>
                    </div>
                    <Button
                        ref={submitButtonRef}
                        ml={'auto'}
                        type={'submit'}
                        leftSection={messageMutation.isLoading ? <Loader color={'scBlue'} size={18} /> : <IconSend />}
                        disabled={messageMutation.isLoading}
                    >
                        Send
                    </Button>
                </Flex>

            </Flex>


        </form>

    </>;
}

export default NewCommunication