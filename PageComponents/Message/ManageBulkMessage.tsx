import SCInput from '@/components/sc-controls/form-controls/sc-input';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import messageQueueBulkService from '@/services/message/message-queue-bulk-service';
import ToastContext from '@/utils/toast-context';
import ScTextAreaControl from '@/components/sc-controls/form-controls/v2/ScTextAreaControl';
import SCTextArea from '@/components/sc-controls/form-controls/sc-textarea';
import { Button, Flex, Text } from '@mantine/core';
import constants from '@/utils/constants';
import SCDatePicker from '@/components/sc-controls/form-controls/sc-datepicker';
import SCTimePicker from '@/components/sc-controls/form-controls/sc-timepicker';
import time from '@/utils/time';
import * as Enums from '@/utils/enums';
import MessageQueueBulkFilterComponent from './MessageQueueBulkFilterComponent';
import MessageQueueBulkItemTable from './MessageQueueBulkItemTable';
import useRefState from '@/hooks/useRefState';
import helper from '@/utils/helper';
import SCWidgetTitle from '@/components/sc-controls/widgets/new/sc-widget-title';
import { useRouter } from 'next/router';
import ConfirmAction from '@/components/modals/confirm-action';
import Link from 'next/link';
import { IconMessage2Dollar } from '@tabler/icons-react';
import EmployeeSelector from '@/components/selectors/employee/employee-selector';
import { showNotification, updateNotification } from '@mantine/notifications';
import downloadService from '@/utils/download-service';
import MessageReplyTable from './MessageReplyTable';

const processWindowMinutes = 5;

const ManageBulkMessage: FC<{
    id?: string
    inModal: boolean
    messageType: number
}> = (props) => {

    const toast = useContext(ToastContext);
    const [bulkMessage, setBulkMessage, getBulkMessageValue] = useRefState<any>({
        SendDateTime: null,
        MessageSubject: "",
        MessageBody: "",
        Filters: JSON.stringify([
            { Type: Enums.MessageGroupingType.CustomerFilters, Values: ["false"], ParentType: null },
            { Type: Enums.MessageGroupingType.JobFilters, Values: ["false"], ParentType: null },
            { Type: Enums.MessageGroupingType.CustomerType, Values: [], ParentType: Enums.MessageGroupingType.CustomerFilters },
            { Type: Enums.MessageGroupingType.CustomerStatus, Values: [], ParentType: Enums.MessageGroupingType.CustomerFilters },
            { Type: Enums.MessageGroupingType.IndustryType, Values: [], ParentType: Enums.MessageGroupingType.CustomerFilters },
            { Type: Enums.MessageGroupingType.IncludeArchivedCustomer, Values: ["true"], ParentType: Enums.MessageGroupingType.CustomerFilters },
            { Type: Enums.MessageGroupingType.PrimaryContactType, Values: ["Primary"], ParentType: null },
            { Type: Enums.MessageGroupingType.MarketingBlacklistLookback, Values: [], ParentType: null },
            { Type: Enums.MessageGroupingType.LimitTop, Values: [], ParentType: null },
            { Type: Enums.MessageGroupingType.JobStatus, Values: [], ParentType: Enums.MessageGroupingType.JobFilters },
            { Type: Enums.MessageGroupingType.OpenJobs, Values: ["true"], ParentType: Enums.MessageGroupingType.JobFilters },
            { Type: Enums.MessageGroupingType.ClosedJobs, Values: ["false"], ParentType: Enums.MessageGroupingType.JobFilters },
            { Type: Enums.MessageGroupingType.JobActivity, Values: [null, null], ParentType: Enums.MessageGroupingType.JobFilters }
        ]),
        MessageQueueBulkItems: [],
        MessageType: props.messageType,
        MessageStatus: Enums.MessageStatus.Draft,
        CampaignID: null,
        EmployeeID: null,
        Employee: null
    });
    const [estimate, setEstimate] = useState({
        RecipientCount: 0,
        MessageCredits: 0,
        CreditsRemaining: 0,
        OptOutText: "",
        MessageLimit: 0,
        MaxMessageLength: 0,
        MinMessageLength: 0,
        MessagePreview: ""
    });

    const [exportBusyState, setExportBusyState] = useState(false);
    const [saving, setSaving] = useState(false);

    const [replies, setReplies] = useState<any[]>([]);

    const [retrying, setRetrying] = useState(false);
    const [gettingStats, setGettingStats] = useState(false);
    const [stats, setStats] = useState({
        Aggregates: [{
            MessageStatus: Enums.MessageStatus.Draft,
            Name: "Awaiting stats",
            Count: 0,
            ExtraInfo: "Awaiting stats"
        }]
    });
    const [usingCachedStats, setUsingCachedStats] = useState(false);

    const [inputErrors, setInputErrors] = useState<any>({});
    const [gettingEstimate, setGettingEstimate] = useState(false);
    const router = useRouter();

    const [confirmOptions, setConfirmOptions] = useState(helper.initialiseConfirmOptions());
    const [showPasteReplacementTag, setShowPasteReplacementTag] = useState(false);

    const [gettingBulkMessage, setGettingBulkMessage] = useState(false);

    const pollingInterval = useRef<any>();

    useEffect(() => {
        if (showPasteReplacementTag) {
            setTimeout(() => {
                setShowPasteReplacementTag(false);
            }, 5000);
        }
    }, [showPasteReplacementTag]);

    const getMessageQueueBulk = async (id) => {
        setGettingBulkMessage(true);
        const bm = await messageQueueBulkService.getMessageQueueBulk(id, toast);
        setBulkMessage(bm);
        setGettingBulkMessage(false);
        return bm;
    }

    const retryMessageQueueBulkFailedMessageQueues = async (id) => {
        setRetrying(true);
        let result = await messageQueueBulkService.retryMessageQueueBulkFailedMessageQueues(id);
        setRetrying(false);
        if (result.HttpStatusCode === 200) {
            (toast as any).setToast({
                message: `Retrying ${result.TotalResults} failed messages`,
                show: true,
                type: 'success'
            });
            getMessageQueueBulkStats(id, true);
        }
        else {
            (toast as any).setToast({
                message: result.Message,
                show: true,
                type: 'error'
            });
        }
    }

    const getMessageQueueBulkStats = async (id, force = false) => {

        let localKey = `mqbStat_${id}`;
        let statsLocal = sessionStorage.getItem(localKey);
        let statsObj: { stamp: Date, data: any, replies: any[] };

        if ((statsLocal?.length ?? 0) > 0 && !force) {
            statsObj = JSON.parse(statsLocal ?? "{}");
            if (new Date().valueOf() - new Date(statsObj.stamp).valueOf() < 60_000 && !!statsObj.data) {
                setUsingCachedStats(true);
                setStats(statsObj.data ?? { Aggregates: [] });
                setReplies(statsObj.replies ?? []);
                return statsObj.data;
            }
        }

        setUsingCachedStats(false);
        setGettingStats(true);
        const bms = await messageQueueBulkService.getMessageQueueBulkStats(id, toast);
        const reps = (await messageQueueBulkService.getMessageQueueReplies(id, toast)).Results;
        getMessageQueueBulk(id);
        setGettingStats(false);

        if (!!bms) {
            setStats(bms);
            setReplies(reps);
            statsObj = {
                stamp: new Date(),
                data: bms,
                replies: reps
            };
            sessionStorage.setItem(localKey, JSON.stringify(statsObj));
            return bms;
        }

        return null;
    }

    const canGetStats = (messageQueueBulk) => {
        return messageQueueBulk.MessageStatus !== Enums.MessageStatus.Aborted && messageQueueBulk.MessageStatus !== Enums.MessageStatus.Draft;
    }

    const tryStartPollingRefresh = (bm) => {
        stopPollingRefresh();
        if (canGetStats(bm)) {
            pollingInterval.current = setInterval(() => {
                getMessageQueueBulk(bm.ID);
            }, 60_000);
        }
    };

    const stopPollingRefresh = () => {
        clearInterval(pollingInterval.current);
    };

    useEffect(() => {
        if (props.id) {
            getMessageQueueBulk(props.id).then(bm => {
                if (canGetStats(bm)) {
                    getMessageQueueBulkStats(props.id);
                }

                tryStartPollingRefresh(bm);
            })
        }

        return () => {
            stopPollingRefresh();
        };
    }, []);

    const bulkMessageEstimateTimeout = useRef<any>();
    useEffect(() => {
        clearTimeout(bulkMessageEstimateTimeout.current);

        //if (bulkMessage.MessageStatus !== Enums.MessageStatus.Draft) return;

        setGettingEstimate(true);

        bulkMessageEstimateTimeout.current = setTimeout(async () => {
            let estimateTemp = await messageQueueBulkService.estimateMessageQueueBulk(getBulkMessageValue(), toast);
            setEstimate(estimateTemp);
            setGettingEstimate(false);
        }, 1000);
    }, [bulkMessage.MessageBody, bulkMessage.Filters, bulkMessage.MessageQueueBulkItems]);

    const onFieldChange = (e) => {
        setBulkMessage(bm => ({
            ...bm,
            [e.name]: e.value
        }));
    }

    const getSelectedEmployee = () => {
        return bulkMessage.Employee;
    }

    const setSelectedEmployee = (employee) => {
        setBulkMessage(bm => ({
            ...bm,
            Employee: employee,
            EmployeeID: employee?.ID ?? null
        }));
    }

    const updateDateTime = (name: string, value: string, section: "date" | "time") => {
        var dateTime: string = bulkMessage[name];
        if (!dateTime) {
            let now = time.now();
            now = time.addSeconds(3600, now);
            if (now.getHours() < 8) {
                now.setHours(8);
                now.setMinutes(0);
                now.setSeconds(0);
            }
            dateTime = time.toISOString(now);
        }
        let split = dateTime.split("T");
        if (split.length === 1) {
            split = dateTime.split(" ");
        }
        if (section === "date") {
            split[0] = value.substring(0, 10);
        }
        else if (section === "time") {
            split[1] = value.substring(11);
        }
        dateTime = split.join("T");
        onFieldChange({ name: name, value: dateTime });
    }

    const updateMessageQueueBulkItems = (items: any[]) => {
        onFieldChange({ name: "MessageQueueBulkItems", value: items });
    };


    const getMessageLength = () => {
        // compensate for placeholders in the message length 

        return bulkMessage?.MessageBody?.length ?? 0;
    }

    const bodyLabelExtra = useMemo(() => {
        let length = getMessageLength();

        return `${length} character${length === 1 ? "" : "s"}. Calculated max message length is ${estimate.MaxMessageLength} of ${estimate.MessageLimit} characters.`;
    }, [bulkMessage.MessageBody, estimate]);

    const maxLength = 400;

    const validate = () => {
        let inputs = [
            { key: "Name", value: bulkMessage.Name, type: Enums.ControlType.Text, required: true },
            { key: "MessageSubject", value: bulkMessage.MessageSubject, type: Enums.ControlType.Text, required: props.messageType === Enums.MessageType.Email },
            { key: "MessageBody", value: bulkMessage.MessageBody, type: Enums.ControlType.Text, required: true },
            { key: "SendDateTime", value: bulkMessage.SendDateTime, type: Enums.ControlType.Date, required: true, lt: null, gt: time.toISOString(time.now()) }
        ];

        const validationResult = helper.validateInputs(inputs);
        setInputErrors(validationResult.errors);
        return validationResult.isValid;
    }

    const isMessagePastProcessingTime = () => {
        const now = time.now();
        const then = time.parseDate(bulkMessage.SendDateTime);
        return (then.valueOf() - now.valueOf()) < (1000 * 60 * processWindowMinutes);
    };

    const disableForm = useMemo(() => {
        return bulkMessage.MessageStatus !== Enums.MessageStatus.Draft || gettingBulkMessage;
    }, [bulkMessage, gettingBulkMessage]);


    const canRevert = useMemo(() => {
        return bulkMessage.MessageStatus !== Enums.MessageStatus.Draft;
    }, [bulkMessage]);

    const canAbort = useMemo(() => {
        let hasQueuedMessages = stats && stats.Aggregates && stats.Aggregates.filter(x => x.MessageStatus === Enums.MessageStatus.Queued).length > 0;
        return bulkMessage.MessageStatus === Enums.MessageStatus.Queued || hasQueuedMessages;
    }, [bulkMessage, stats]);


    const revertToDraftBulkMessage = async () => {
        let messageToSave = getBulkMessageValue();
        return await saveBulkMessage(messageToSave, Enums.MessageStatus.Draft);
    }

    const abortBulkMessage = async () => {
        setConfirmOptions({
            ...helper.initialiseConfirmOptions(),
            display: true,
            text: `This will cancel the message being processed and sent`,
            heading: "Confirm abort bulk message?",
            confirmButtonText: "Abort",
            onConfirm: async () => {
                let messageToSave = getBulkMessageValue();
                return await saveBulkMessage(messageToSave, Enums.MessageStatus.Aborted);
            }
        });
    };

    const handleContactExport = async () => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await downloadService.downloadFile('POST', '/MessageQueueBulk/ExportContacts', {
                MessageQueueBulk: bulkMessage
            }, false, false, "", "", null, false, (() => {
                updateNotification({
                    id: 'downloading-export',
                    loading: false,
                    message: 'Downloading Exported File',
                    autoClose: 2000,
                    color: 'scBlue'
                })
                setExportBusyState(false)
            }) as any)
        } catch (e) {
            setExportBusyState(false)
        }
    }

    const cancel = () => {
        router.back();
    }

    const copyToClipboard = (itemToCopy) => {
        helper.copyToClipboard(itemToCopy);
        (toast as any).setToast({
            message: `Replacement tag copied to clipboard: ${itemToCopy}`,
            show: true,
            type: 'success'
        });
        setShowPasteReplacementTag(true);
    }


    const finaliseBulkMessage = async () => {

        if (!validate()) {
            (toast as any).setToast({
                message: 'Cannot finalise with errors',
                show: true,
                type: 'error'
            });
            return;
        }

        setConfirmOptions({
            ...helper.initialiseConfirmOptions(),
            display: true,
            text: `You will not be able to abort or modify the message within ${processWindowMinutes} minutes of it sending.
            
            <h3>Preview:</h3>
            
            <div >${estimate.MessagePreview.replace(estimate.OptOutText, `<span style="font-weight: bold;">${estimate.OptOutText}</span>`).replace(/\n/g, "<br/>")}</div>`,
            heading: "Confirm finalise bulk message?",
            confirmButtonText: "Finalise",
            onConfirm: async () => {
                let messageToSave = getBulkMessageValue();
                return await saveBulkMessage(messageToSave, Enums.MessageStatus.Queued);
            }
        });
    };

    const saveBulkMessage = async (messageToSave = getBulkMessageValue(), newStatus: number | undefined = undefined) => {
        let saveSuccess = false;

        if (!validate()) return saveSuccess;

        if (typeof newStatus === "number") {
            messageToSave.MessageStatus = newStatus;
        }

        setSaving(true);

        let saveResult = await messageQueueBulkService.saveMessageQueueBulk(messageToSave, toast);

        setSaving(false);

        if (!!saveResult.ID) {
            if (!props.id && !props.inModal) {
                helper.nextRouter(router.push, `/message/bulk/[id]`, `/message/bulk/${saveResult.ID}`);
            }
            else {
                (toast as any).setToast({
                    message: 'Bulk message updated successfully',
                    show: true,
                    type: 'success'
                });
                tryStartPollingRefresh(saveResult);
            }
            setBulkMessage(saveResult);
            if (canGetStats(saveResult)) {
                getMessageQueueBulkStats(saveResult.ID, true);
            }
            saveSuccess = true;
        }

        return saveSuccess;
    };

    const canFinalise = useMemo(() => {
        return !gettingEstimate && estimate.MaxMessageLength <= estimate.MessageLimit;
    }, [estimate, gettingEstimate]);

    return (<>

        <SCWidgetTitle marginTop={"0.5rem"} marginBottom={"0rem"} title={`Status: ${Enums.getEnumStringValue(Enums.MessageStatus, bulkMessage.MessageStatus)}`} />
        {/* <div style={{ fontWeight: "bold", marginTop: "0.5rem" }}>
            {`Status: ${Enums.getEnumStringValue(Enums.MessageStatus, bulkMessage.MessageStatus)}`}
        </div> */}

        {disableForm && !!bulkMessage.ID && <div style={{ marginTop: "1rem", maxWidth: constants.maxFormWidth, paddingBottom: "1rem", marginBottom: "1rem", borderBottom: "4px solid whitesmoke" }}>

            <Flex mt={"lg"} justify={"space-between"}>
                <SCWidgetTitle title='Statistics' />

                {usingCachedStats && <Text size={'sm'} c={'dimmed'} ml="1rem" mt={"0.25rem"}>Sending stats may be delayed for up to 5 minutes.</Text>}
                <Button
                    ml={"md"}
                    size='compact-xs'
                    pl={"4px"}
                    pr={"4px"}
                    miw={"70px"}
                    variant='subtle'
                    disabled={gettingStats}
                    onClick={() => getMessageQueueBulkStats(bulkMessage.ID)}>
                    {gettingStats ? "Refreshing..." : "Refresh"}
                </Button>
            </Flex>

            <div style={{ width: "100%", maxWidth: parseInt(constants.maxFormWidth.replace("px", "")) / 2, background: "whitesmoke", borderRadius: "4px", padding: "0.5rem" }}>
                <table style={{ width: "100%" }}>
                    <tbody>

                        {stats.Aggregates.map((agg, idx) => {
                            return <tr key={idx}>
                                <td style={{ width: "calc(100% - 100px)" }}>
                                    <div style={{ fontWeight: "bold" }}>
                                        {agg.MessageStatus === Enums.MessageStatus.OutOfCredits ? <Button
                                            mr={"md"}
                                            size='compact-xs'
                                            pl={"4px"}
                                            pr={"4px"}
                                            color='green'
                                            variant='subtle'
                                            miw={"10px"}
                                            disabled={retrying}
                                            onClick={() => retryMessageQueueBulkFailedMessageQueues(bulkMessage.ID)}>
                                            {retrying ? "Retrying..." : "Retry"}
                                        </Button> : <></>} {agg.Name}
                                    </div>
                                    <div style={{ fontSize: "0.7rem" }}>
                                        {agg.ExtraInfo}
                                    </div>
                                </td>
                                <td style={{ width: "100px", textAlign: "right", paddingRight: "1rem" }}>
                                    <div style={{ fontWeight: "bold" }}>
                                        {agg.Count}
                                    </div>
                                </td>
                            </tr>
                        })}

                    </tbody>
                </table>
            </div>

        </div>}


        {disableForm && !!bulkMessage.ID && <div style={{ maxWidth: constants.maxFormWidth, paddingBottom: "1rem", borderBottom: "4px solid whitesmoke" }}>
            <SCWidgetTitle title='Replies' />

            <MessageReplyTable replies={replies} />
            {(!replies || replies.length === 0) && <div>No replies yet...</div>}

        </div>}

        <SCWidgetTitle marginTop={"1rem"} title='Details' />

        <Flex justify={'space-between'} maw={constants.maxFormWidth}>

            <div style={{ width: "100%" }}>
                {props.messageType === Enums.MessageType.Email && <SCInput
                    name='MessageSubject'
                    label='Subject'
                    value={bulkMessage.MessageSubject}
                    onChange={onFieldChange}
                    error={inputErrors.MessageSubject}
                    required={true}
                    disabled={disableForm}
                />
                }

                {props.messageType === Enums.MessageType.SMS && <>
                    <SCInput
                        name='Name'
                        label='Name'
                        value={bulkMessage.Name}
                        onChange={onFieldChange}
                        error={inputErrors.Name}
                        required={true}
                        disabled={disableForm}
                    />

                    <SCTextArea
                        name='MessageBody'
                        label={`Body`}
                        value={bulkMessage.MessageBody}
                        onChange={onFieldChange}
                        error={inputErrors.MessageBody}
                        required={true}
                        hint={bodyLabelExtra}
                        maxLength={maxLength}
                        disabled={disableForm}
                    />

                    <EmployeeSelector
                        accessStatus={Enums.AccessStatus.Live}
                        error={inputErrors.EmployeeID}
                        required={false}
                        selectedEmployee={getSelectedEmployee()}
                        setSelectedEmployee={setSelectedEmployee}
                        storeID={null}
                        canClear={true}
                        disabled={disableForm}
                        label='Email Notification for SMS Replies'
                    />
                </>}


            </div>



            <div style={{ width: "100%" }}>
                <Flex w={"100%"} justify={"space-between"}>
                    <div style={{ width: "50%" }}>
                        <SCDatePicker
                            label='Send Date'
                            required={true}
                            onChange={(e) => {
                                console.log(e)
                                if (typeof e === "string") {
                                    updateDateTime("SendDateTime", e, "date");
                                }
                            }}
                            value={bulkMessage.SendDateTime}
                            error={inputErrors.SendDateTime}
                            name="SendDateTime"
                            minDate={!!props.id ? undefined : new Date()}
                            disabled={disableForm}
                        />
                    </div>
                    <div style={{ width: "50%" }}>
                        <SCTimePicker
                            required={true}
                            changeHandler={(e) => {
                                if (typeof e === "object") {
                                    let value = time.toISOString(e.value, true, true, true);
                                    updateDateTime("SendDateTime", value, "time");
                                }
                            }}
                            label='Time'
                            value={bulkMessage.SendDateTime}
                            error={inputErrors.SendDateTime}
                            name="SendDateTime"
                            disabled={disableForm}
                        />
                    </div>
                </Flex>
                {!disableForm && <> <div style={{ marginTop: "1rem", fontWeight: 500, fontSize: "var(--input-label-size,var(--mantine-font-size-sm))" }}>Copy Replacement Tags</div>
                    <Flex mt={"1rem"}>
                        <Button
                            variant='outline'
                            onClick={() => copyToClipboard("{{CustName}}")}
                        >Customer Name</Button>
                        <Button ml={"0.5rem"}
                            variant='outline'
                            onClick={() => copyToClipboard("{{ContFstName}}")}
                        >First Name</Button>
                        <Button ml={"0.5rem"}
                            variant='outline'
                            onClick={() => copyToClipboard("{{ContLstName}}")}
                        >Last Name</Button>
                    </Flex>
                    {showPasteReplacementTag && <div style={{ marginTop: "1rem", opacity: 0.5, fontWeight: 500, fontSize: "var(--input-label-size,var(--mantine-font-size-sm))" }}>Paste the replacement tag inside the message</div>}
                </>}
            </div>
        </Flex>

        <div style={{ margin: "0.5rem 0.7rem 0 0", padding: "0.5rem", borderRadius: "4px", background: "whitesmoke", maxWidth: constants.maxFormWidth }}>
            <MessageQueueBulkFilterComponent
                disabled={disableForm}
                filters={bulkMessage.Filters}
                setFilters={(filters) => {
                    onFieldChange({ name: "Filters", value: filters });
                }}
            />
        </div>

        {
            false &&
            <MessageQueueBulkItemTable
                items={bulkMessage.MessageQueueBulkItems}
                updateItems={updateMessageQueueBulkItems}
                inputErrors={inputErrors}
            />
        }

        {!!estimate && <>
            <div style={{ maxWidth: constants.maxFormWidth, padding: "1rem 0.5rem", borderRadius: "4px", background: "whitesmoke" }}>
                <SCWidgetTitle title='Preview' />
                <div style={{ margin: "1rem 0" }} dangerouslySetInnerHTML={{ __html: estimate.MessagePreview?.replace(estimate.OptOutText, `<span style="font-weight: bold;">${estimate.OptOutText}</span>`).replace(/\n/g, "<br/>") ?? "Something went wrong" }}></div>
            </div>
            <Text mt={"sm"} size='sm'>
                Estimated <span style={{ fontWeight: "bold" }}>{estimate.RecipientCount}</span> recipients, spending up to <span style={{ fontWeight: "bold" }}>{estimate.MessageCredits}</span> credits. {estimate.CreditsRemaining} credits remaining.
                {estimate.CreditsRemaining < estimate.MessageCredits && <Link href={'/settings/subscription/manage?tab=sms'} onClick={() => helper.nextLinkClicked('/settings/subscription/manage?tab=sms')}>
                    <Button ml={"sm"} color={'scBlue'} variant={'light'} rightSection={<IconMessage2Dollar size={14} />}>
                        Buy Credits
                    </Button>
                </Link>}
            </Text>
        </>}

        {!disableForm &&
            <>


                <Flex justify={"space-between"} maw={constants.maxFormWidth} mt={"sm"}>
                    <div>
                        {!!bulkMessage.ID ? <Button
                            color='red'
                            variant='outline'
                            onClick={abortBulkMessage}
                            disabled={saving}
                        >Abort</Button> : !props.inModal ? <Button
                            variant='outline'
                            onClick={cancel}
                            disabled={saving}
                        >Cancel</Button> : <></>}
                    </div>
                    <Flex>
                        <Button
                            mr="sm"
                            variant='subtle'
                            disabled={exportBusyState}
                            onClick={() => handleContactExport()}
                        >Filtered Export</Button>
                        <Button
                            disabled={saving}
                            onClick={() => saveBulkMessage()}
                        >Save Draft</Button>

                        <Button
                            color='green'
                            onClick={finaliseBulkMessage}
                            ml={"sm"}
                            disabled={!canFinalise || saving}
                            title={!canFinalise ? 'One or more recipients will use more than the maximum amount of characters for the SMS' : ''}
                        >Finalise</Button>
                    </Flex>

                </Flex>
            </>}




        {/* TODO SHOULD BE ABLE TO ABORT ANY TIME WHEN SENDING */}
        {disableForm && canRevert &&
            <Flex justify={"space-between"} maw={constants.maxFormWidth} mt={"sm"}>
                {(bulkMessage.MessageStatus === Enums.MessageStatus.Queued || canAbort) &&
                    <Button
                        disabled={saving}
                        color='red'
                        variant='outline'
                        onClick={abortBulkMessage}
                    >Abort</Button>}

                {!isMessagePastProcessingTime() && <Flex>
                    <Button
                        mr="sm"
                        variant='subtle'
                        disabled={exportBusyState}
                        onClick={() => handleContactExport()}
                    >Filtered Export</Button>
                    <Button
                        disabled={saving}
                        onClick={revertToDraftBulkMessage}
                    >Revert to Draft</Button>

                </Flex>}
            </Flex>}






        <ConfirmAction
            options={confirmOptions}
            setOptions={setConfirmOptions}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default ManageBulkMessage;