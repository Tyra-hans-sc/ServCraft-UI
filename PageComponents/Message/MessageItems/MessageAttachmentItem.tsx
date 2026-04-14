import { useQuery } from "@tanstack/react-query";
import { FC, useMemo, useRef, useState } from "react";
import attachmentService from "@/services/attachment-service";
import Image from 'next/image'
import { ActionIcon, Flex, Loader, Text, Tooltip } from "@mantine/core";
import {
    FileDetails,
    FormDetails,
} from "@/PageComponents/Message/Communication/CommunicationAttachments";
import styles from './MessageItem.module.css'
import { IconDownload } from "@tabler/icons";
import * as Enums from "@/utils/enums";
import { IconEye, IconFileCode, IconFileText, IconLockAccess, IconMusic, IconPdf, IconVideo, IconX } from "@tabler/icons-react";
import formService from "@/services/form/form-service";
import PS from "@/services/permission/permission-service";
import { Attachment } from "@/interfaces/api/models";
import PreviewAttachment from "@/PageComponents/Attachment/PreviewAttachmentComponent";
import ImageWithZoom from "@/PageComponents/Attachment/ImageWithZoom";

const iconSize = 40;

export interface FormItem {
    FormHeaderID: string;
    FormDefinitionFieldID: string;
    DisplayOrder: number;
    Section: string | null;
    DataResult: string;
    Description: string;
    Line: string | null;
    SectionGroup: string | null;
    DataType: string;
    Required: boolean;
    SectionID: string | null;
    SectionHeading: string | null;
    SectionDescription: string | null;
    SectionRepeatable: string | null;
    SectionDisplayOrder: string | null;
    ParentSectionID: string | null;
    ParentSectionGroup: number;
    ID: string;
    IsActive: boolean;
    CreatedBy: string;
    CreatedDate: string; // ISO 8601 date string
    ModifiedBy: string;
    ModifiedDate: string; // ISO 8601 date string
    RowVersion: string;
}

export interface FormDefinition {
    MasterID: string;
    Version: number;
    Name: string;
    Module: number;
    Description: string;
    FormRule: number;
    ExpireTimespan: number;
    StructureLocked: boolean;
    NonExpiring: boolean;
    FormDefinitionStatus: number;
    FormDefinitionFields: any[]; // Adjust type if necessary
    Sections: any[]; // Adjust type if necessary
    JobTypes: any[]; // Adjust type if necessary
    ID: string;
    IsActive: boolean;
    CreatedBy: string;
    CreatedDate: string; // ISO 8601 date string
    ModifiedBy: string;
    ModifiedDate: string; // ISO 8601 date string
    RowVersion: string;
}

export interface Form {
    FormDefinitionID: string;
    Module: number;
    ItemID: string;
    ExpireDate: string | null;
    FormStatus: number;
    AssociatedModule: number;
    AssociatedItemID: string;
    CompletedDate: string; // ISO 8601 date string
    Invalid: boolean;
    FormDefinitionDisplayName: string;
    FormDefinitionDescription: string;
    LatestFormDefinitionID: string;
    FormItems: FormItem[];
    FormDefinition: FormDefinition;
    ID: string;
    IsActive: boolean;
    CreatedBy: string;
    CreatedDate: string; // ISO 8601 date string
    ModifiedBy: string;
    ModifiedDate: string; // ISO 8601 date string
    RowVersion: string;
}


export function getTablerIconForContentType(contentType: string) {
    if (contentType.includes("pdf")) {
        return IconPdf;
    } else if (contentType.includes("audio")) {
        return IconMusic;
    } else if (contentType.includes("video")) {
        return IconVideo;
    } else if (contentType.includes("text") || contentType.includes("doc")) {
        return IconFileText;
    } else {
        return IconFileCode; // Default icon, can be adjusted
    }
}

const MessageAttachmentItem: FC<{ attachmentItemId: string, cardSize: number }> = ({ attachmentItemId, cardSize = 100 }) => {

    const [canViewSecureItem] = useState(PS.hasPermission(Enums.PermissionName.AttachmentSecure));

    const { data, isLoading } = useQuery<Attachment>(
        ['attachmentItem', attachmentItemId],
        () => attachmentService.getAttachment(attachmentItemId),
        {
            enabled: !attachmentItemId.startsWith('FormHeaderID:'),
            // onSuccess: console.log,
            onError: console.error,
        }
    )

    const IconComponent = useMemo(() => (
        data?.ContentType
            ? getTablerIconForContentType(data.ContentType)
            : IconFileText
    ), [data?.ContentType])

    const { data: formData } = useQuery<Form>(
        ['attachmentItem', attachmentItemId],
        () => formService.getForm(attachmentItemId.replace('FormHeaderID:', '')),
        {
            enabled: attachmentItemId.startsWith('FormHeaderID:'),
            // onSuccess: console.log,
            onError: console.error,
        }
    )

    const blockOpenFile = useRef(false);

    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);

    const isForm = useMemo(() => attachmentItemId.startsWith('FormHeaderID:'), [attachmentItemId])

    return <>
        {
            isLoading ?
                <Flex
                    pos={'relative'}
                    w={cardSize}
                    h={cardSize}
                    className={styles.attachmentCard}
                    style={{ cursor: 'not-allowed' }}
                    align={'center'}
                    justify={'center'}
                >
                    <Loader
                        size={22}
                    />
                </Flex>
                :
                !isForm && data?.ID ?
                    (
                        data.IsSecure && !canViewSecureItem ?
                            <Flex
                                pos={'relative'}
                                w={cardSize}
                                h={cardSize}
                                className={styles.attachmentCard}
                                style={{ cursor: 'not-allowed' }}
                            >
                                <Text size={'xs'}
                                    lineClamp={3}
                                    maw={cardSize}
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
                                    size={iconSize}
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
                            <Tooltip
                                label={FileDetails({ file: data })}
                                multiline
                                color={'scBlue.9'}
                                openDelay={1200}
                            >

                                <Flex
                                    pos={'relative'}
                                    w={cardSize}
                                    h={cardSize}
                                    className={styles.attachmentCard}
                                    onClick={() => !blockOpenFile.current && setShowAttachmentPreview(true)}
                                >

                                    {
                                        data.ContentType?.startsWith('image') ?
                                            <Image
                                                alt={''}
                                                src={data.UrlThumb || data.Url || ''}
                                                placeholder={'blur'}
                                                blurDataURL={data.UrlThumb}
                                                style={{
                                                    objectFit: 'cover',
                                                    objectPosition: 'center'
                                                }}
                                                fill
                                            />
                                            :
                                            <IconComponent
                                                size={iconSize}
                                                style={{
                                                    zIndex: 0,
                                                    position: 'absolute',
                                                    left: `calc(50% - ${iconSize / 2}px)`,
                                                    top: `calc(50% - ${iconSize / 2}px)`,
                                                    color: 'initial'
                                                }}
                                                stroke={2}
                                            />
                                    }

                                    <Text size={'xs'}
                                        lineClamp={3}
                                        maw={cardSize}
                                        c={'white'}
                                        style={{
                                            zIndex: 1,
                                            textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`
                                        }}
                                        ta={'right'}
                                        pos={'absolute'}
                                        bottom={5} right={5}
                                    >
                                        {data.Description}
                                    </Text>

                                    <a
                                        href={data.Url} // Link to the file URL
                                        target="_blank" // Open the link in a new tab
                                        rel="noopener noreferrer" // Prevent tab nabbing/security issue
                                        style={{ textDecoration: 'none' }} // Ensure no text decoration for the link
                                        onMouseOver={() => { blockOpenFile.current = true }}
                                        onMouseOut={() => { blockOpenFile.current = false }}
                                    >
                                        <ActionIcon size={'compact-xs'}
                                            pos={'absolute'}
                                            top={5}
                                            right={5}
                                        >
                                            <IconDownload size={16} />
                                        </ActionIcon>
                                    </a>
                                </Flex>

                            </Tooltip>
                    ) :
                    isForm && formData ?
                        <Tooltip
                            label={FormDetails({ form: formData! as any })}
                            multiline
                            color={'scBlue.9'}
                            openDelay={1200}
                        >
                            <Flex
                                w={cardSize}
                                h={cardSize}
                                className={styles.attachmentCard + ' ' + styles.formAttachment}
                                direction={'column'}
                                align={'center'}
                            >
                                <Text size={'9px'} mt={8} ms={8} me={19} c={'scBlue.7'} lineClamp={3} maw={cardSize}
                                    style={{ zIndex: 3 }}
                                // ta={'center'}
                                >
                                    {formData?.FormDefinition.Name}
                                </Text>
                                <IconFileText
                                    size={28}
                                    style={{
                                        zIndex: 0,
                                        marginInline: 'auto',
                                        marginTop: 5
                                        // position: 'absolute',
                                        // left: `calc(50% - ${size / 2}px)`,
                                        // top: `calc(50% )`
                                    }}
                                    stroke={2}
                                />
                            </Flex>
                        </Tooltip> : <></>
        }

        {data && showAttachmentPreview &&

            <PreviewAttachment
                onClose={() => setShowAttachmentPreview(false)}
                onUpdateAttachment={(values) => { }}
                attachment={data}
                readOnly={true}
            />
        }
    </>;
}

export default MessageAttachmentItem

