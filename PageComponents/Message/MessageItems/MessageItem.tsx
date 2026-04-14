import React, { useEffect, useMemo, useRef, useState } from 'react';
import time from '@/utils/time';
import * as Enums from '@/utils/enums';
import Helper from '@/utils/helper';
import Fetch from '@/utils/Fetch';
import Router from 'next/router';
import HelpDialog from '@/components/help-dialog';
import ConfirmAction from '@/components/modals/confirm-action';
import CellStatus from "@/components/cells/status-old";
import { ActionIcon, Avatar, Box, Button, Fieldset, Flex, ScrollArea, Text, Tooltip } from "@mantine/core";
import {
    IconActivity,
    IconAddressBook, IconBolt, IconCalendar, IconCalendarEvent,
    IconChevronDown, IconIdBadge,
    IconMail,
    IconMailFast,
    IconMessage2, IconMessageChatbot,
    IconPaperclip, IconPhoneIncoming, IconPlayerPlay,
    IconRefresh, IconSend, IconSendOff, IconSettingsAutomation, IconUser, IconUserCircle, IconUserCog, IconUsers, IconUserScan
} from "@tabler/icons-react";
import styles from './MessageItem.module.css'
import { motion, AnimatePresence } from 'framer-motion';
import MessageAttachmentItem from "@/PageComponents/Message/MessageItems/MessageAttachmentItem";
import { getIconForDoc } from "@/PageComponents/Message/Communication/CommunicationAttachments";
import StatusBadge from "@/PageComponents/StatusBadge";
import { colors } from '@/theme';
import messageService from '@/services/message/message-service';

export interface Message {
    ID: string;
    MessageStatus: (typeof Enums.MessageStatus)[keyof typeof Enums.MessageStatus]; // Enum for message status
    ErrorMessage?: string; // Error message if the status indicates an error (optional as it can be null)
    MessageType: (typeof Enums.MessageType)[keyof typeof Enums.MessageType]; // Enum for message type (Email, SMS, etc.)
    ToName: string; // Recipient's name
    ToAddress?: string; // Optional recipient email address
    MobileNumber?: string; // Optional recipient mobile number
    AttachmentFilePath?: string; // Optional path to the attachment file
    AttachInvoice?: boolean; // Indicates if an invoice is attached
    AttachJobCard?: boolean; // Indicates if a job card is attached
    AttachQuote?: boolean; // Indicates if a quote is attached
    AttachPurchaseOrder?: boolean; // Indicates if a purchase order is attached
    AttachSignOff?: boolean; // Indicates if a sign-off document is attached
    AttachWorkshop?: boolean; // Indicates if a workshop document is attached
    AttachJobSheet?: boolean; // Indicates if a job sheet is attached
    MessageBody: string; // Body of the message
    Subject: string; // Subject of the message
    StoreID: string; // Store identifier
    StoreName: string; // Store name
    Store?: string | null; // Optional, could be `null`
    CustomerID: string; // Customer identifier
    CustomerName: string; // Customer name
    Customer?: string | null; // Optional, could be `null`
    CustomerContactID: string; // Customer contact identifier
    Contact?: string | null; // Optional, could be `null`
    ItemID: string; // Item identifier
    Module: number; // Module identifier
    ItemDisplay: string; // Display name of the item
    MessageSource: number; // Source of the message
    UserType: number; // Type of user
    FromAddress?: string | null; // Optional sender address
    FromName?: string | null; // Optional sender name
    CCAddress?: string | null; // Optional CC address
    Recipient: string; // Primary recipient's contact
    SendDateTime: Date; // The timestamp the message is sent
    ScheduledDateTime: Date; // The timestamp the message is scheduled to be sent
    SentDateTime?: Date; // The timestamp the message was actually sent
    CompletedDateTime?: Date; // The timestamp when the message process is completed
    DeliveredDateTime?: Date | null; // The timestamp when the message was delivered (can be null)
    Priority: number; // Priority of the message
    Retrycount: number; // Number of retries for sending the message
    Sent: boolean; // Whether the message was sent
    ReceivedData?: string | null; // Optional data for received messages
    ReceivedDatetime?: Date | null; // The timestamp the message was received (can be null)
    CreditsUsed: number; // The number of credits used to send the message
    IsActive: boolean; // Is the message active
    CreatedBy: string; // Who created the message
    CreatedDate: Date; // The timestamp the message was created
    ModifiedBy: string; // Who last modified the message
    ModifiedDate: Date; // The timestamp the message was last modified
    RowVersion: string; // Version of the row (for concurrency)
}

const cardSize = 100;

interface CommunicationProps {
    message: Message;
    fetchMessages: () => void;
    hasCreditsAvailable: boolean;
    documentDefinitionMetaData: any | null;
}

const springConfig = {
    duration: 0.2,
    ease: {
        type: "spring",
        stiffness: 300,
        damping: 30,
    },
    type: 'spring',
};

const maxExpandedHeight = 500;
const minimisedHeight = 30;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20, height: 0 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 }, height: 'auto' },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 }, height: 0 }, // Exiting to the right
};



const Communication: React.FC<CommunicationProps> = ({
    message,
    fetchMessages,
    hasCreditsAvailable,
    documentDefinitionMetaData
}) => {


    // initialise empty for lazy loading
    const [downloadedMessageBody, setDownloadedMessageBody] = useState("");

    const messageBody = useMemo(() => {
        return !!downloadedMessageBody ? downloadedMessageBody : message.MessageBody;
    }, [message.MessageBody, downloadedMessageBody]);

    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (expanded && !downloadedMessageBody) {
            messageService.getMessage(message.ID).then(res => {
                setDownloadedMessageBody(res.MessageBody);
            });
        }
    }, [expanded]);

    const [inError, setInError] = useState(
        message.MessageStatus === Enums.MessageStatus.Error
    );
    const [errorMessage, setErrorMessage] = useState(message.ErrorMessage);

    const [confirmOptions, setConfirmOptions] = useState(
        Helper.initialiseConfirmOptions()
    );

    const messageIcon = (iconProps: any) => {

        if (!message.Sent) {
            return <IconSendOff {...iconProps} />
        }

        switch (message.MessageType) {
            case Enums.MessageType.Email:
                return <IconMail {...iconProps} />;
            case Enums.MessageType.SMS:
                return <IconMessage2 {...iconProps} />;
            default:
                return <IconMailFast {...iconProps} />;
        }
    };

    const retrySendConfirm = async (messageToRetry: CommunicationProps['message']) => {
        await Fetch.post({
            url: `/Message/Retry`,
            params: {
                messageIDList: [messageToRetry.ID],
            },
        });
        fetchMessages();
    };

    const retrySend = async (messageToRetry: CommunicationProps['message']) => {
        if (messageToRetry.MessageStatus === Enums.MessageStatus.OutOfCredits) {
            if (hasCreditsAvailable) {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    confirmButtonText: 'Retry Message',
                    onConfirm: () => {
                        retrySendConfirm(messageToRetry);
                    },
                    display: true,
                    heading: 'Retry Message',
                    text: 'Are you sure you want to retry sending this message?',
                });
            } else {
                setConfirmOptions({
                    ...Helper.initialiseConfirmOptions(),
                    confirmButtonText: 'Buy credits',
                    onConfirm: () => {
                        Helper.nextRouter(Router.push, `/settings/subscription/manage?tab=sms`);
                    },
                    display: true,
                    heading: 'Buy Credits',
                    text: "You have run out of SMS credits. Click 'Buy credits' to buy more.",
                });
            }
        }
    };

    const messageHasAttachment = (): boolean => {
        return (
            !!message.AttachmentFilePath ||
            !!message.AttachInvoice ||
            !!message.AttachJobCard ||
            !!message.AttachQuote ||
            !!message.AttachPurchaseOrder ||
            !!message.AttachSignOff ||
            !!message.AttachWorkshop ||
            !!message.AttachJobSheet
        );
    };

    const linkedAttachmentItem = useMemo(() => {
        const items: { label: string, key: string, icon: any }[] = [];

        if (message.AttachInvoice) {
            items.push({
                key: 'AttachInvoice',
                label: 'Invoice',
                icon: getIconForDoc('invoice'),

            });
        }
        if (message.AttachJobCard) {
            items.push({
                key: 'AttachJobCard',
                label: documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).IsActive && documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).Title || 'Job Card',
                icon: getIconForDoc('job_card')
            });
        }
        if (message.AttachQuote) {
            items.push({
                key: 'AttachQuote',
                label: 'Quote',
                icon: getIconForDoc('quote')
            });
        }
        if (message.AttachPurchaseOrder) {
            items.push({
                key: 'AttachPurchaseOrder',
                label: 'Purchase Order',
                icon: getIconForDoc('purchase_order')
            });
        }
        if (message.AttachSignOff) {
            items.push({
                key: 'AttachSignOff',
                label: documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).IsActive && documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).Title || 'Sign Off',
                icon: getIconForDoc('sign_off')
            });
        }
        if (message.AttachWorkshop) {
            items.push({
                key: 'AttachWorkshop',
                label: 'Workshop',
                icon: getIconForDoc('workshop')
            });
        }
        if (message.AttachJobSheet) {
            items.push({
                key: 'AttachJobSheet',
                label: documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).IsActive && documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).Title || 'Job Sheet',
                icon: getIconForDoc('job_sheet')
            });
        }

        return items.map(
            x => <Flex

                className={styles.attachmentCard + ' ' + styles.documentAttachment}
                key={x.key} w={cardSize} h={cardSize}>
                <Text
                    size={'9px'} mt={8} ms={8} me={19} c={'scBlue.0'} lineClamp={3} maw={cardSize}
                    style={{ zIndex: 3 }}
                >
                    {x.label}
                </Text>
                {x.icon}
            </Flex>
        );
    }, [
        documentDefinitionMetaData,
        message.AttachmentFilePath,
        message.AttachInvoice,
        message.AttachJobCard,
        message.AttachQuote,
        message.AttachPurchaseOrder,
        message.AttachSignOff,
        message.AttachWorkshop,
        message.AttachJobSheet,
    ]);


    const attachmentItems = useMemo(() => {
        return message.AttachmentFilePath && message.AttachmentFilePath?.split(',').map(
            (attachment, index) => {
                return <MessageAttachmentItem attachmentItemId={attachment} key={'messageAttachmentItem' + message.ID + index} cardSize={cardSize} />
            }
        )
    }, [message.ID, message.AttachmentFilePath]);

    const attachmentCount = useMemo(() => {
        let attachCount = message.AttachmentFilePath?.split(',').length ?? 0;
        if (message.AttachInvoice) attachCount++;
        if (message.AttachJobCard) attachCount++;
        if (message.AttachQuote) attachCount++;
        if (message.AttachPurchaseOrder) attachCount++;
        if (message.AttachSignOff) attachCount++;
        if (message.AttachWorkshop) attachCount++;
        if (message.AttachJobSheet) attachCount++;
        return attachCount;
    }, [message]);

    const PlainTextEmail = ({ htmlContent }) => {
        // Create a temporary div to parse the HTML
        const getTextFromHtml = (html) => {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            return temp.textContent || temp.innerText || '';
        };

        // Get the text and remove extra whitespace
        const plainText = getTextFromHtml(messageBody).replace(/\s+/g, ' ').trim();

        return plainText;
    };

    const attachmentsRef = useRef<HTMLFieldSetElement>(null);

    const onViewAttachments = () => {
        setExpanded(true);
        setTimeout(() => {
            if (attachmentsRef.current) {
                attachmentsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 200)
    }

    const messageNotSent = useMemo(() => !message.Sent && (
        message.MessageStatus !== Enums.MessageStatus.InProgress
    ), [message.MessageStatus, message.Sent]);

    return (
        <>
            <Flex gap={'md'} w={'100%'} className={`${styles.messageItem} ${expanded ? styles.expanded : ""}`} onClick={() => setExpanded(!expanded)}>

                <Tooltip
                    color={'scBlue.9'}
                    openDelay={500}
                    label={message.MessageType === Enums.MessageType.Email ? 'Email' : message.MessageType === Enums.MessageType.SMS ? 'SMS' : ''}>
                    <Box style={{ color: messageNotSent ? colors.mantineErrorOrange() : colors.bluePrimary, marginTop: "4px" }}>
                        <Flex direction={'column'} align={'center'}>
                            {messageIcon({ size: '22px' })}
                        </Flex>
                    </Box>
                </Tooltip>

                <Flex direction={'column'} w={'100%'}>

                    <Flex gap={'sm'} wrap={{ base: 'wrap-reverse', md: 'nowrap' }}>
                        <Flex align={'center'} gap={'xs'}>

                            <Flex direction={'column'}>
                                <Flex gap={'sm'} mt={5}>
                                    <Text miw={60} c={'dark'} ta={'left'}>
                                        To:
                                    </Text>

                                    <Text c={'dimmed'}>
                                        <strong
                                            style={{ color: 'var(--mantine-color-dark-5)' }}>{message.ToName}</strong>
                                    </Text>
                                    <Text size='sm' c={'dimmed'}>
                                        {message.MessageType === Enums.MessageType.Email ? `[${message.ToAddress}] ` :
                                            message.MessageType === Enums.MessageType.SMS ? `[${message.MobileNumber}] ` : ''}
                                    </Text>
                                    <Text size="sm" c={'dimmed'}>
                                        {`${time.toISOString(message.CreatedDate, false, true, false)}`}
                                    </Text>

                                    <Flex gap={3} align={'center'} mt={-4}>

                                        <Tooltip
                                            label={'' + Enums.getEnumStringValue(Enums.UserType, message.UserType, true)}
                                            color={'scBlue.9'}
                                            openDelay={500}
                                        >
                                            <Box c={'scBlue.9'} style={{ cursor: 'help' }}>
                                                {message.UserType === Enums.UserType.Customer ? <IconUser size={18} color={'var(--mantine-color-scBlue-9)'} /> :
                                                    message.UserType === Enums.UserType.Employee ? <IconUserCog size={18} color={'var(--mantine-color-scBlue-9)'} /> :
                                                        <IconUserCircle size={18} color={'var(--mantine-color-scBlue-9)'} />}
                                            </Box>
                                        </Tooltip>

                                        {
                                            message.MessageSource !== Enums.MessageSource.None &&
                                            <Tooltip
                                                label={
                                                    message.MessageSource === Enums.MessageSource.Trigger ?
                                                        'Sent with Trigger ' :
                                                        message.MessageSource === Enums.MessageSource.Custom ?
                                                            'Sent by ' + message.CreatedBy :
                                                            'Sent by ' + Enums.getEnumStringValue(Enums.MessageSource, message.MessageSource, true)
                                                }
                                                color={'scBlue.9'}
                                                openDelay={500}
                                            >
                                                <Box c={'scBlue.9'} style={{ cursor: 'help' }}>
                                                    {message.MessageSource === Enums.MessageSource.Trigger ? <IconSettingsAutomation size={18} color={'var(--mantine-color-scBlue-9)'} /> :
                                                        message.MessageSource === Enums.MessageSource.Appointment ? <IconCalendarEvent size={18} color={'var(--mantine-color-scBlue-9)'} /> :
                                                            message.MessageSource === Enums.MessageSource.Custom ? <IconPlayerPlay size={18} color={'var(--mantine-color-scBlue-9)'} /> :
                                                                <IconBolt size={18} color={'var(--mantine-color-scBlue-9)'} />
                                                    }
                                                </Box>
                                            </Tooltip>
                                        }

                                        {
                                            message.AttachmentFilePath &&
                                            <ActionIcon c={'scBlue.9'} variant={'subtle'} miw={23} mt={-2}
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    onViewAttachments()
                                                }}
                                            >
                                                <Text size={"sm"}>{attachmentCount + ''}</Text>
                                                <IconPaperclip size={18} stroke={2.2} />
                                            </ActionIcon>
                                        }
                                    </Flex>
                                </Flex>
                                {
                                    message.CCAddress && <>

                                        <Flex gap={'sm'} mt={3}>
                                            <Text miw={60} c={'dark'} ta={'left'}>
                                                cc:
                                            </Text>

                                            <Text c={'dimmed'}>
                                                [{message.CCAddress}]
                                            </Text>

                                        </Flex>
                                    </>
                                }
                                {message.MessageType === Enums.MessageType.Email ? <Flex gap={'sm'} mt={3}>
                                    <Text miw={60} c={'dark'} ta={'left'}>
                                        Subject:
                                    </Text>

                                    <Text fw={"bold"} lineClamp={1}
                                        // miw={expanded ? 'auto' : (message.Subject.length * 8) + 'px'}
                                        miw={"fit-content"}
                                    >
                                        {message.Subject}
                                    </Text>

                                    {message.MessageType === Enums.MessageType.Email && !expanded && <>
                                        <Text lineClamp={1}>{PlainTextEmail({ htmlContent: messageBody })}</Text>
                                    </>}

                                </Flex> : !expanded ?
                                    <Flex gap={'sm'} mt={3}>
                                        <Text lineClamp={1}>
                                            {messageBody}
                                        </Text>
                                    </Flex> : <Flex gap={'sm'} mt={3}>
                                        <Text >
                                            {messageBody}
                                        </Text>
                                    </Flex>}
                            </Flex>

                        </Flex>

                        <Flex gap={3} ml={'auto'} w={{ base: '100%', sm: 'max-content' }} >
                            <Flex gap={3}>
                                {
                                    inError && errorMessage ?
                                        <div>
                                            <HelpDialog message={errorMessage} position={"bottom"} width={250}
                                                {...{} as any}
                                            /></div>
                                        :
                                        <Box style={{width: "max-content"}}>
                                            {
                                                message.MessageStatus === Enums.MessageStatus.OutOfCredits &&
                                                <Button leftSection={<IconRefresh size={16} />} variant="outline" color={'gray.7'} size="compact-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        retrySend(message)
                                                    }}
                                                >
                                                    Retry
                                                </Button>
                                                /*<LegacyButton text="Retry" icon="send" extraClasses="grey-overlay"
                                                             onClick={() => retrySend(message)}/>*/

                                            }

                                            <StatusBadge minWidth={120} value={message.MessageStatus} statusEnum={Enums.MessageStatus} statusColors={Enums.MessageStatusColorMapping} />
                                            {/*<CellStatus value={message.MessageStatus} valueEnum={"MessageStatus"}/>*/}
                                        </Box>
                                }
                            </Flex>
                            <ActionIcon size={'md'} ml={'sm'} color={'dark.7'} variant={'transparent'}>
                                <motion.div
                                    initial={{ maxHeight: minimisedHeight }}
                                    animate={{
                                        rotate: expanded ? '-180deg' : '0deg',
                                    }} // Set max height based on state
                                    transition={springConfig}
                                    style={{
                                        overflow: expanded ? 'auto' : 'hidden',
                                        position: "relative",
                                    }}
                                >

                                    <IconChevronDown
                                    /*style={{
                                        rotate: expanded ? '-180deg' : '0deg',
                                        transition: 'rotate 0.2s ease-in-out',
                                    }}*/
                                    />
                                </motion.div>
                            </ActionIcon>
                        </Flex>

                    </Flex>

                    {expanded && message.MessageType === Enums.MessageType.Email &&
                        <Box
                            mt={'sm'}
                            mih={minimisedHeight}
                            style={{ position: "relative", overflow: "hidden" }}
                        >
                            <motion.div
                                className={styles.inner}
                                onClick={e => expanded && e.stopPropagation()}
                                initial={{ overflow: "hidden" }}
                                animate={{
                                    //border: expanded ? '0.5px solid var(--mantine-color-gray-3)' : '0.5px solid transparent',
                                    //backgroundColor: expanded ? 'white' : 'transparent',
                                    //borderRadius: expanded ? '5px' : 0,
                                    // maxHeight: expanded ? maxExpandedHeight : 50,
                                    // overflow: expanded ? 'auto' : 'hidden',
                                }} // Set max height based on state
                                transition={springConfig}
                                style={{
                                    cursor: 'initial',
                                    position: "relative",
                                    overflow: 'hidden',
                                    minHeight: minimisedHeight,
                                    // height: expanded ? 'auto' : '50px',
                                }}
                            >
                                {/*<ScrollArea.Autosize mah={maxExpandedHeight} offsetScrollbars scrollbars={expanded ? 'xy' : false}>
                                <div className={styles.stripNewlines}
                                     dangerouslySetInnerHTML={{ __html: message.MessageBody }}
                                />
                            </ScrollArea.Autosize>*/}
                                <motion.div
                                    initial={{ maxHeight: minimisedHeight }}
                                    animate={{
                                        maxHeight: expanded ? maxExpandedHeight : minimisedHeight,
                                        minHeight: minimisedHeight,
                                    }}
                                    style={{
                                        overflow: expanded ? 'auto' : 'hidden',
                                        //padding: expanded ? '5px 30px 0 30px' : 0,
                                    }}
                                >
                                    <div className={styles.stripNewlines}
                                        dangerouslySetInnerHTML={{ __html: messageBody }}
                                    />
                                </motion.div>
                                <div>
                                    {
                                        expanded && message.AttachmentFilePath &&
                                        <>
                                            <Fieldset
                                                bg={"transparent"}
                                                style={{
                                                    borderLeft: "none",
                                                    borderRight: "none",
                                                    borderBottom: "none",
                                                    borderRadius: 0
                                                }}
                                                ref={attachmentsRef}
                                                p={0}
                                                pt={"1rem"}
                                            >
                                                <Text mb="md" fw={"bold"}>Attachments</Text>
                                                <motion.div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '5px',
                                                        flexWrap: 'wrap',

                                                    }}

                                                    variants={containerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                >
                                                    <AnimatePresence>

                                                        {/* Render linked attachment item with animations */}
                                                        {linkedAttachmentItem && (
                                                            <motion.div
                                                                key="linkedAttachment" // Ensure a unique key
                                                                variants={itemVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit"
                                                            >
                                                                {linkedAttachmentItem}
                                                            </motion.div>
                                                        )}

                                                        {/* Render attachmentItems in staggered animation */}
                                                        {attachmentItems && attachmentItems.map((item, index) => (
                                                            <motion.div
                                                                key={`attachment-${index}`} // Ensure each attachment has a unique key
                                                                variants={itemVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit"
                                                            >
                                                                {item}
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </motion.div>

                                            </Fieldset>
                                        </>
                                    }
                                </div>


                            </motion.div>
                            {/* Gradient Overlay */}
                            {/* {!expanded && (
                                <div
                                    className={styles.gradientOverlay}
                                />
                            )} */}
                        </Box>
                    }
                </Flex>
            </Flex>


            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />
        </>

    );
};

export default Communication;

