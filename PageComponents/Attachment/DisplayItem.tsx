import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';
import PS from '../../services/permission/permission-service';

import { getTablerIconForContentType } from "@/PageComponents/Message/MessageItems/MessageAttachmentItem";
import {
    ActionIcon,
    AspectRatio, Badge,
    Box,
    Flex,
    Loader,
    Menu,
    Text,
    Textarea,
    Tooltip
} from "@mantine/core";
import styles from "@/PageComponents/Message/MessageItems/MessageItem.module.css";
import {
    IconCheck, IconChevronDown,
    IconEye,
    IconFileText,
    IconLock,
    IconLockAccess, IconLockOpen, IconStar, IconStarFilled, IconTrash
} from "@tabler/icons-react";
import Image from "next/image";
import { IconDownload, IconPencil } from "@tabler/icons";
import ConfirmAction from "@/components/modals/confirm-action";


import { Attachment } from "@/interfaces/api/models"
import { useMutation } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";
import { attachmentTypeOptions } from "@/components/shared-views/attachments";
import PreviewAttachmentComponent from "@/PageComponents/Attachment/PreviewAttachmentComponent";
import moment from "moment";

const iconSize = 50

// Define type for the Attachment prop
interface AttachmentProps {
    attachment: Attachment;
    refreshAttachments: () => void;
    primaryDisplayImageID: string;
    setPrimaryDisplayImageID: (id: string | null) => Promise<void>;
    allowPrimaryDisplayImage: boolean;
    readOnly?: boolean;
}

// Define type for confirm options
interface ConfirmOptions {
    confirmButtonText: string;
    onConfirm: (promptText?: string) => void;
    showCancel: boolean;
    display: boolean;
    heading: string;
    text?: string;
    isPrompt?: boolean;
    promptDefault?: string;
}

const updateAttachment = async (attachment: Attachment) => {
    const res = await Fetch.put({
        url: `/Attachment`,
        params: attachment,
    });

    if (res.ID) {
        return res
    } else {
        throw new Error(res.serverMessage || res.message || 'Something went wrong')
    }
}

const destroyAttachmentHttp = async (attachmentId: string) => {
    const res = await Fetch.destroy({
        url: `/Attachment?id=${attachmentId}`,
    })

    if (res.ID) {
        return res;
    } else {
        throw new Error(res.serverMessage || res.message || 'Failed to delete attachment');
    }
};

const makeAttachmentPrimaryHttp = async (props: any) => {

    let attachment = props.attachment as Attachment | null;
    let setPrimaryDisplayImageID = props.setMethod as (id: string | null) => Promise<void>;

    await setPrimaryDisplayImageID(attachment?.ID ?? null);
};


// Component Definition
const DisplayItem: React.FC<AttachmentProps> = ({ attachment: initialAttachment, refreshAttachments, primaryDisplayImageID, setPrimaryDisplayImageID, allowPrimaryDisplayImage, readOnly = false }) => {

    const [attachment, setAttachment] = useState<Attachment>(initialAttachment);
    useEffect(() => {
        setAttachment(initialAttachment)
    }, [initialAttachment]);


    // const toast = useContext<any>(ToastContext);
    // const [showOverlay, setShowOverlay] = useState(false);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [showAttachmentDetails, setShowAttachmentDetails] = useState(false);
    const [permissionSecure] = useState<boolean>(PS.hasPermission(Enums.PermissionName.AttachmentSecure));

    const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>(Helper.initialiseConfirmOptions());

    const descriptionMaxLength = 200;

    const attachmentMutation = useMutation(['attachment', attachment], updateAttachment, {
        onSuccess: (data) => {
            setAttachment(data);
            showNotification({
                id: 'attachmentDescription' + attachment.ID,
                message: !attachment.IsActive ? 'Attachment removed' : 'Attachment updated successfully',
                color: 'scBlue',
                autoClose: 1000
            })
            refreshAttachments();
        },
        onError: (error: Error) => {
            showNotification({
                id: 'attachmentDescription' + attachment.ID,
                message: error.message,
                color: 'yellow.7',
                autoClose: 4000
            })
        },
    }
    )

    const deleteMutation = useMutation(['deleteAttachment', attachment], destroyAttachmentHttp, {
        onSuccess: (data) => {
            showNotification({
                id: 'deleteAttachment' + attachment.ID,
                message: 'Attachment deleted successfully',
                color: 'scBlue',
                autoClose: 1000,
            });
            refreshAttachments();
            setAttachment(data)
        },
        onError: (error: Error) => {
            showNotification({
                id: 'deleteAttachment' + attachment.ID,
                message: error.message,
                color: 'yellow.7',
                autoClose: 4000,
            });
        },
    });

    const makePrimaryMutation = useMutation(['makePrimary', attachment], makeAttachmentPrimaryHttp, {
        onSuccess: (data) => {
            // showNotification({
            //     id: 'makePrimaryAttachment' + attachment.ID,
            //     message: 'Attachment updated successfully',
            //     color: 'scBlue',
            //     autoClose: 1000,
            // });


            Helper.waitABit(50).then(refreshAttachments)


            //setAttachment(data);
        },
        onError: (error: Error) => {
            showNotification({
                id: 'makePrimaryAttachment' + attachment.ID,
                message: error.message,
                color: 'yellow.7',
                autoClose: 4000,
            });
        },
    });

    const changeDescription = () => {
        setCurrentFileDescription(p => p.trim())
        attachmentMutation.mutate({ ...attachment, Description: currentFileDescription });
    };

    const changeType = (newAttachmentType) => {
        // setCurrentAttachmentType(+newAttachmentType)
        +newAttachmentType !== +(attachment.AttachmentType ?? 0) && attachmentMutation.mutate({ ...attachment, AttachmentType: !!newAttachmentType ? +newAttachmentType : Enums.AttachmentType.Other });
    };

    const deleteAttachment = () => {

        setConfirmOptions({
            ...Helper.initialiseConfirmOptions(),
            confirmButtonText: "Delete Attachment",
            onConfirm: () => deleteMutation.mutate(attachment?.ID as any),
            display: true,
            heading: "Delete Attachment",
            text: "Are you sure you want to delete this attachment?",
        });
    };

    const IconComponent = useMemo(() => (
        attachment.ContentType
            ? getTablerIconForContentType(attachment.ContentType)
            : IconFileText
    ), [attachment.ContentType])

    const [currentFileDescription, setCurrentFileDescription] = useState<string>(attachment.Description || '');
    const [currentAttachmentType, setCurrentAttachmentType] = useState<number>(attachment.AttachmentType || Enums.AttachmentType.Other);


    const descriptionChanged = useMemo(() => currentFileDescription !== attachment.Description, [currentFileDescription, attachment.Description]);


    const fileDescriptionInputRef = useRef<HTMLTextAreaElement>(null)

    const [attachmentTypeMenuOpen, setAttachmentTypeMenuOpen] = useState<boolean>(false);

    const attachmentType = useMemo(() => (
        <Menu shadow="sm"
            width={145}
            position={'bottom-start'}
            opened={attachmentTypeMenuOpen}
            onChange={setAttachmentTypeMenuOpen}
            offset={1}
        >
            <Menu.Target>
                <span onClick={e => e.stopPropagation()} style={{ cursor: 'pointer' }}>
                    <Badge
                        p={0} px={2} py={1} color={'dark.4'}
                        style={{ cursor: 'pointer', textTransform: 'none' }}
                        radius={4}
                        fw={400}
                        rightSection={
                            <IconChevronDown size={15} stroke={'3'} style={{ rotate: attachmentTypeMenuOpen ? '-180deg' : '0deg', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                        }
                    >
                        {Enums.getEnumStringValue(Enums.AttachmentType, attachment.AttachmentType, true)}
                    </Badge>
                </span>
            </Menu.Target>
            <Menu.Dropdown
                p={0}
                py={3}
                bg={'scBlue.0'}
            >
                {
                    attachmentTypeOptions.map(option => (
                        <Menu.Item
                            className={styles.attachmentTypeMenuItem}
                            py={1}
                            key={'attachmentTypeOption' + option.value}
                            bg={+option.value === attachment.AttachmentType ? 'scBlue.1' : undefined}
                            rightSection={+option.value === attachment.AttachmentType ? <IconCheck color={'var(--mantine-color-scBlue-7)'} size={17} /> : null}
                            onClick={e => {
                                e.stopPropagation()
                                changeType(option.value)
                            }}
                        >
                            <Text size={'sm'}>
                                {option.label}
                            </Text>
                        </Menu.Item>
                    ))
                }
            </Menu.Dropdown>
        </Menu>
    ), [attachment.AttachmentType, attachmentTypeMenuOpen]);

    const attachmentCard =
        <Flex
            pos={'relative'}
            w={'100%'}
            h={'100%'}
            // mih={{base: 200, xs: 150, sm: 140, lg: 150, xl: 170}}
            // w={cardSize}
            // h={cardSize}
            direction={'column'}
            // className={styles.attachmentCard}
            className={styles.imageHoverEffect}  // Add this line

            style={{
                cursor: attachment.ContentType?.startsWith('image') && 'pointer' || 'default'
            }}
        >

            <Image
                className={styles.image}
                alt={''}
                src={attachment.UrlThumb || attachment.Url || ''}
                placeholder={'blur'}
                blurDataURL={attachment.UrlThumb}
                style={{
                    // objectFit: 'cover', // :)
                    objectFit: 'contain', // :(
                    border: '0px solid transparent',
                    borderTopLeftRadius: '5px',
                    borderTopRightRadius: '5px',
                    objectPosition: 'top',
                    userDrag: 'none', // Prevents dragging in webkit browsers
                    WebkitUserDrag: 'none', // Safari specific
                } as any}
                fill
            />

            {allowPrimaryDisplayImage && attachment.ID === primaryDisplayImageID && <div style={{ position: 'absolute', top: 1, right: 1, padding: "4px 4px 0 4px", borderBottomRightRadius: "0.5rem", zIndex: 1, background: "#FFFFFFAA" }}>

                <ActionIcon size={'sm'}
                    color={'dark.4'}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (attachment.ID !== primaryDisplayImageID) {
                            makePrimaryMutation.mutate({ attachment: attachment, setMethod: setPrimaryDisplayImageID });
                        }
                        else {
                            makePrimaryMutation.mutate({ attachment: null, setMethod: setPrimaryDisplayImageID });
                        }
                    }}
                >
                    <IconStarFilled size={17} />
                </ActionIcon>
            </div>}
            {readOnly !== true &&
                <Flex
                    w={"100%"}
                    style={{ zIndex: 2 }}
                    gap={5}
                    p={5}
                    className={styles.attachmentToolContainer + (attachmentTypeMenuOpen ? ' ' + styles.opened : '')}
                >
                    <Flex
                        onClick={e => e.stopPropagation()}
                        style={{ zIndex: 2 }}
                        gap={5}
                        p={0}
                        ml={'auto'}
                    >
                        <ActionIcon size={'sm'}
                            color={'dark.4'}
                            className={styles.attachmentCardIcon}
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteAttachment();
                            }}
                        >
                            {
                                deleteMutation.isLoading ? <Loader color={'white'} size={13} /> :
                                    <IconTrash size={17} />
                            }
                        </ActionIcon>

                        <ActionIcon
                            size={'sm'}
                            color={'dark.4'}
                            component={'a'}
                            className={styles.attachmentCardIcon}
                            href={attachment.Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <IconDownload size={17} />
                        </ActionIcon>

                        {allowPrimaryDisplayImage &&
                            <ActionIcon size={'sm'}
                                color={'dark.4'}
                                className={styles.attachmentCardIcon}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (attachment.ID !== primaryDisplayImageID) {
                                        makePrimaryMutation.mutate({ attachment: attachment, setMethod: setPrimaryDisplayImageID });
                                    }
                                    else {
                                        makePrimaryMutation.mutate({ attachment: null, setMethod: setPrimaryDisplayImageID });
                                    }
                                }}
                            >
                                {
                                    makePrimaryMutation.isLoading ? <Loader color={'white'} size={13} /> :
                                        attachment.ID === primaryDisplayImageID ?
                                            <IconStarFilled size={17} />
                                            :
                                            <IconStar size={17} />
                                }
                            </ActionIcon>
                        }

                    </Flex>
                </Flex>
            }
        </Flex>;


    return (

        <Box
            className={styles.attachmentCard + ' ' + styles.attachmentCardHoverBlue}
        >
            <AspectRatio
                ratio={16 / 9}
                pos={'relative'}
            >
                {
                    (
                        attachment.IsSecure && !permissionSecure ?
                            <Flex
                                pos={'relative'}
                                // w={cardSize}
                                // h={cardSize}
                                style={{ cursor: 'not-allowed' }}
                            >
                                <Text size={'xs'}
                                    lineClamp={2}
                                    // maw={cardSize}
                                    c={'white'}
                                    style={{
                                        zIndex: 1,
                                        textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`
                                    }}
                                    ta={'right'}
                                    pos={'absolute'}
                                    bottom={5} right={5}
                                >
                                    Secure File
                                </Text>
                                <IconLockAccess
                                    // size={iconSize}
                                    style={{
                                        zIndex: 0,
                                        position: 'absolute',
                                        left: `calc(50% - ${iconSize / 2}px)`,
                                        top: `calc(50% - ${iconSize / 2}px)`,
                                        color: 'initial'
                                    }}
                                    stroke={2}
                                />
                            </Flex> :
                            <Box
                                h={'100%'}
                                onClick={e => {
                                    e.stopPropagation()
                                    attachment.ContentType?.startsWith('image') && setShowAttachmentPreview(true);
                                }}
                            >
                                {attachmentCard}
                            </Box>

                    )
                }

                <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

                {(showAttachmentPreview || showAttachmentDetails) &&
                    <PreviewAttachmentComponent
                        attachment={attachment}
                        onClose={
                            () => {
                                setShowAttachmentPreview(false)
                                setShowAttachmentDetails(false)
                            }
                        }
                        onUpdateAttachment={(values) => {
                            attachmentMutation.mutate({ ...attachment, ...values })
                            setCurrentFileDescription(values?.Description || '')
                            setCurrentAttachmentType(+(values?.AttachmentType || Enums.AttachmentType.Other))
                        }}
                        initialTab={showAttachmentPreview ? 'image' : 'details'}
                        readOnly={readOnly}
                    />
                    // <PreviewAttachment attachment={attachment} setShowAttachmentPreview={setShowAttachmentPreview} overlay={true} /> : ''
                }

            </AspectRatio>

        </Box>

    );
};

export default DisplayItem;