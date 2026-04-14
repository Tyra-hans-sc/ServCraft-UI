import {CSSProperties, FC, useEffect, useMemo, useState} from "react";
import {
    Box,
    Card,
    Checkbox,
    Flex,
    Group,
    Text,
    FileButton,
    Button,
    Overlay,
    Tooltip,
    Stack,
    ActionIcon, rgba, ScrollArea
} from "@mantine/core";
import { NewCommunicationFormProps } from "./NewCommunicationForm";
import * as Enums from '@/utils/enums';
import {useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import Image from "next/image";
import {
    IconFile,
    IconFileCertificate, IconFileCheck,
    IconFileInvoice,
    IconFileMusic, IconFilePlus, IconFileText,
    IconFileTypeDoc, IconIdBadge2, IconSignature, IconTool,
    IconVideo, IconX
} from "@tabler/icons-react";
import moment from "moment";
import styles from './CommunicationAttachments.module.css'
import Constants from "@/utils/constants";
import Helper from "@/utils/helper";
import OptionService from "@/services/option/option-service";
import {showNotification} from "@mantine/notifications";
import {Attachment} from "@/interfaces/api/models";
import {getTablerIconForContentType} from "@/PageComponents/Message/MessageItems/MessageAttachmentItem";

const iconSize = 40
const smallIconSize = 30
const cardSize = 75

interface FormAttachment {
    FormDefinitionID: string;
    Module: number;
    ItemID: string;
    ExpireDate: string | null;
    FormStatus: number;
    AssociatedModule: number;
    AssociatedItemID: string;
    CompletedDate: string;
    Invalid: boolean;
    FormDefinitionDisplayName: string;
    FormDefinitionDescription: string;
    LatestFormDefinitionID: string;
    FormItems: {
        FormHeaderID: string;
        FormDefinitionFieldID: string;
        DisplayOrder: number;
        Section: string | null;
        DataResult: string;
        Description: string;
        Line: number | null;
        SectionGroup: number | null;
        DataType: string;
        Required: boolean;
        SectionID: string;
        SectionHeading: string;
        SectionDescription: string;
        SectionRepeatable: boolean;
        SectionDisplayOrder: number;
        ParentSectionID: string | null;
        ParentSectionGroup: number;
        ID: string;
        IsActive: boolean;
        CreatedBy: string;
        CreatedDate: string;
        ModifiedBy: string;
        ModifiedDate: string;
        RowVersion: string;
    }[];
    FormDefinition: {
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
        FormDefinitionFields: any[];
        Sections: any[];
        JobTypes: any[];
        ID: string;
        IsActive: boolean;
        CreatedBy: string;
        CreatedDate: string;
        ModifiedBy: string;
        ModifiedDate: string;
        RowVersion: string;
    };
    ID: string;
    IsActive: boolean;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedBy: string;
    ModifiedDate: string;
    RowVersion: string;
}

type DocItemType = 'quote' | 'invoice' | 'purchase_order' | 'job_card' | 'workshop' | 'sign_off' | 'job_sheet'

interface LocalFileAttachment {
    AttachmentType: number
    Description: string
    ItemID: string
    FileBase64: string
    FileName: string
    ID: string
    dataUrl: string
}

const readFile = async (itemId, file, fileSizeUnit = 'mb', fileSizeValue = 2) => {
    return new Promise<LocalFileAttachment | null>(resolve => {
        let reader = new FileReader();
        reader.onloadend = async function () {
            let b64 = (reader.result as string)?.replace(/^data:.+;base64,/, '');
            let uploadLength = 2;

            let dataUrl = ''
            const type = (reader.result as string)?.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0];
            if(type?.startsWith('image/')) {
                const blob = await fetch(`data:${type};base64,${b64}`)
                    .then(res => res.blob());
                // Create a URL from the Blob
                dataUrl = URL.createObjectURL(blob);
                // console.log('is image', blob, dataUrl)
            }


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

            if (uploadLength > +fileSizeValue) {
                resolve(null);
            } else {
                let attachment = {
                    AttachmentType: Enums.AttachmentType.Other,
                    Description: file.name,
                    ItemID: itemId,
                    FileBase64: b64,
                    FileName: file.name,
                    ID: Helper.emptyGuid(),
                    dataUrl: dataUrl
                };
                resolve(attachment);
            }
        };
        reader.readAsDataURL(file);
    });
};

const isDocumentSendingForms = (formRule: any, documentDefinitionMetaData: any, selectedDocuments: DocItemType[]) => {
    if (!documentDefinitionMetaData) {
        return false;
    }

    let jobDocuments = documentDefinitionMetaData.JobDocuments;
    let def:any = null;

    if (selectedDocuments.includes('job_card')) {
        def = jobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer);
        if (def) {
            if ((def.ShowJobForms && formRule === Enums.FormRule.Job) || (def.ShowCustomerForms && formRule === Enums.FormRule.Customer)) {
                return true;
            }
        }
    }
    if (selectedDocuments.includes('sign_off')) {
        def = jobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff);
        if (def) {
            if ((def.ShowJobForms && formRule === Enums.FormRule.Job) || (def.ShowCustomerForms && formRule === Enums.FormRule.Customer)) {
                return true;
            }
        }
    }
    if (selectedDocuments.includes('job_sheet')) {
        def = jobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet);
        if (def) {
            if ((def.ShowJobForms && formRule === Enums.FormRule.Job) || (def.ShowCustomerForms && formRule === Enums.FormRule.Customer)) {
                return true;
            }
        }
    }

    return false;
}

const getItemAttachments = (itemId: string, module: number, secondaryItemId?: string, secondaryModule?: number) => {
    return Promise.all([
        Fetch.get({
            url: '/Attachment/GetItemAttachmentsByModule',
            params: {
                itemID: itemId,
                module: module,
            }
        }).then(res => {
            if(!res.Results) {
                throw new Error(res.serverMessage || res.message || 'something went wrong')
            }
            return res.Results as Attachment[]
        }).catch(
            e => {
                throw new Error('Could not fetch item attachments')
            }
        ),
        secondaryItemId && secondaryModule !== undefined ? Fetch.get({
            url: '/Attachment/GetItemAttachmentsByModule',
            params: {
                itemID: secondaryItemId,
                module: secondaryModule,
            }
        }).then(res => {
            if(!res.Results) {
                throw new Error(res.serverMessage || res.message || 'something went wrong')
            }
            return res.Results as Attachment[]
        }).catch(
            e => {
                throw new Error('Could not fetch item attachments')
            }
        ) :
        [],
    ])
}
const getItemForms = async (itemId: string, itemModule: string) => {
    return Fetch.get({
        url: '/Form/GetByItemID',
        params: {
            itemID: itemId,
            itemModule: itemModule,
        }
    }).then(res => {
        if(!res.Results) {
            throw new Error(res.serverMessage || res.message || 'something went wrong')
        }
        return res.Results
    }).catch(
        e => {
            throw new Error('Could not fetch item forms')
        }
    )
}

export const FileDetails: FC<{ file: Attachment }> = ({ file }) => {
    return (
        <Stack gap={0}>
            <p style={{fontSize: 12, marginTop: 5, marginBottom: 5}}>
                <strong>Filename:</strong> {file.Description || file.FileName}<br/>
                {/*<strong>Description:</strong> {file.Description}<br/>*/}
                {file.FileSize && <><strong>File Size:</strong> {file.DisplayFileSize ?? file.FileSize + ' B'} <br/> </>}
                {file.ContentType && <><strong>Content Type:</strong> {file.ContentType}<br/></>}
                <strong>Attachment Type:</strong> {Enums.getEnumStringValue(Enums.AttachmentType, file.AttachmentType)}<br/>
                {file.CreatedBy && <><strong>Created By:</strong> { file.CreatedBy }<br/> </> }
                {file.CreatedDate && <><strong>Created Date:</strong> {moment(file.CreatedDate).format('DD MMMM, YYYY - hh:mm a')}</> }
                {/*{file.IsSecure && <><br/><strong>Is Secure:</strong> {file.IsSecure ? 'Yes' : 'No'}<br/> </> }*/}
                {/*<br />*/}
            </p>
        </Stack>
    );
};

export const FormDetails: FC<{ form: FormAttachment}> = ({ form }) => {
    return (
        <Stack gap={0}>
            <p style={{fontSize: 12, marginTop: 5, marginBottom: 5}}>
                <strong>Name:</strong> {form.FormDefinition.Name}<br/>
                <strong>Description:</strong> {form.FormDefinition.Description}<br/>
                <strong>Status:</strong>&nbsp;
                <span style={{color: form.FormStatus === Enums.FormStatus.Draft ? 'var(mantine-color-yellow-6)' : 'inherit'}}>
                    {Enums.getEnumStringValue(Enums.FormStatus, form.FormStatus)}
                </span><br/>
                <strong>Linked to:</strong> {Enums.getEnumStringValue(Enums.FormRule, form.FormDefinition.FormRule)}<br/>
                <strong>Completed By:</strong> {form.CreatedBy}<br/>
                <strong>Completed Date:</strong> {moment(form.CompletedDate).format('DD MMMM, YYYY - hh:mm a')}<br/>
                {
                    form.ExpireDate &&
                        <>
                            <strong>Expire Date:</strong> {moment(form.ExpireDate).format('DD MMMM, YYYY - hh:mm a')}<br/>
                        </>
                }
                {
                    form.FormDefinition.Sections.length > 0 && <>
                        <strong>Form Sections:</strong>
                        {
                            form.FormDefinition.Sections.map((section, index) => (
                                <div key={index}>
                                    <strong>Section {index + 1}:</strong> {section}<br/>
                                </div>
                            ))
                        }
                    </>
                }
            </p>
        </Stack>
    );
};



const getFileContentType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) {
        return 'unknown';
    }

    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
            return 'image';

        case 'pdf':
            return 'application/pdf';

        case 'doc':
        case 'docx':
            return 'application/msword';

        case 'xls':
        case 'xlsx':
            return 'application/vnd.ms-excel';

        case 'ppt':
        case 'pptx':
            return 'application/vnd.ms-powerpoint';

        case 'txt':
            return 'text/plain';

        case 'csv':
            return 'text/csv';

        case 'mp4':
        case 'mkv':
        case 'avi':
            return 'video';

        case 'mp3':
        case 'wav':
        case 'flac':
            return 'audio';

        case 'zip':
        case 'rar':
        case '7z':
            return 'application/zip';

        case 'html':
        case 'htm':
            return 'text/html';

        case 'json':
            return 'application/json';

        case 'xml':
            return 'application/xml';

        default:
            return 'unknown';
    }
};

const contentTypeIcon = (contentType: string) => {
    const Element = getTablerIconForContentType(contentType)
    return <Element size={iconSize}
                    style={{
                        zIndex: 0,
                        position: 'absolute',
                        left: `calc(50% - ${iconSize/2}px)`,
                        top: `calc(50% - ${iconSize/2}px)`,
                        color: 'initial'
                    }}
                    stroke={2}
    />
}

export const getIconForDoc = (dt: DocItemType) => {
    const size= iconSize
    const style: CSSProperties = {zIndex: 0, position: 'absolute', left: `calc(50% - ${size/2}px)`, top: `calc(50% + ${size/12}px - ${size/2}px)`}
    // const style: CSSProperties = {zIndex: 0, marginLeft: `calc(50% - ${size/2}px)`}
    // const style: CSSProperties = {zIndex: 0, position: 'absolute', right: `10%`, bottom: `10%`}
    switch (dt) {
        case 'quote':
            return <img src={'/sc-icons/quotes-blue.svg'} alt={''} style={{...style}} width={size} height={size}/>
        case 'invoice':
            return <img src={'/sc-icons/invoices-blue.svg'} alt={''} style={{...style}} width={size} height={size}/>
        case "job_card":
            return <img src={'/sc-icons/jobs-blue.svg'} alt={''} style={{...style}} width={size} height={size}/>
        case 'job_sheet':
            return <IconIdBadge2
                size={size}
                style={style}
                stroke={2}
            />
        case 'sign_off':
            return <IconSignature
                size={size}
                style={style}
                stroke={2}
            />
        case 'purchase_order':
            return <img src={'/sc-icons/purchases-blue.svg'} alt={''} style={{...style}} width={size} height={size}/>
        case 'workshop':
            return <IconTool
                size={size}
                style={style}
                stroke={2}
            />
        default:
            return <IconFile
                size={size}
                style={style}
                stroke={2}
            />

    }
}

const CommunicationAttachments: FC<
    NewCommunicationFormProps & {
    defaultDocs: DocItemType[]
    onDocumentsChanged: (docs: DocItemType[]) => void;
    onFormsChanged: (forms: FormAttachment[]) => void;
    onAttachmentsChanged: (attachments: (LocalFileAttachment| Attachment)[]) => void;
    onLocalAttachmentsChanged: (attachments: (LocalFileAttachment| Attachment)[]) => void;
}
> = ({defaultDocs, ...props}) => {

    const {data: moduleAttachments} = useQuery(
        ['moduleAttachments', props.item, props.moduleCode, props.customer?.ID, props.supplier?.ID],
        () => getItemAttachments(
            props.item.ID,
            +props.moduleCode,
            props.customer?.ID || props.supplier?.ID,
            props.customer ? Enums.Module.Customer : props.supplier ? Enums.Module.Supplier : undefined
        ))

    const {data: formAttachments} = useQuery<FormAttachment[]>(
        ['formAttachments', props.item],
        () => getItemForms(props.item.ID, props.item.Module),
        {
            enabled: +props.moduleCode === Enums.Module.JobCard || +props.moduleCode === Enums.Module.Customer
        })

    // Used memoization for selected attachment and forms
    const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
    const [selectedLocalFiles, setSelectedLocalFiles] = useState<LocalFileAttachment[]>([]);
    const [selectedForms, setSelectedForms] = useState<string[]>([]);
    const [selectedDocs, setSelectedDocs] = useState<DocItemType[]>(defaultDocs ?? []);

    /*useEffect(() => {
        console.log(
            'docs', selectedDocs,
            'forms', selectedForms,
            'attachments', selectedAttachments,
            'local files', selectedLocalFiles
        )

    }, [selectedAttachments, selectedForms, selectedDocs, selectedLocalFiles]);*/

    const handleAttachmentChange = (attachmentIds: string[]) => {
        setSelectedAttachments(attachmentIds);

        props.onAttachmentsChanged(
            attachmentIds.map(id => moduleAttachments && [...(moduleAttachments[0]), ...(moduleAttachments[1])]?.find(x => x.ID === id))as Attachment[]
        )
    }

    const removeAttachment = (x: string) => {
        setSelectedAttachments(p => {
            const newAttachments = p.filter(y => x !== y)
            props.onAttachmentsChanged(
                newAttachments.map(id => moduleAttachments && [...(moduleAttachments[0]), ...(moduleAttachments[1])]?.find(x => x.ID === id))as Attachment[]
            )
            return newAttachments
        })
    }

    const handleFormChange = (formIds: string[]) => {
        setSelectedForms(formIds);
        props.onFormsChanged(
            formIds.map(id => formAttachments?.find(x => x.ID === id)) as FormAttachment[]
        )
    }

    const removeForm = (x: string) => {
        setSelectedForms(p => {
            const newForms = p.filter(y => x !== y)
            props.onFormsChanged(
                newForms.map(id => formAttachments?.find(x => x.ID === id)) as FormAttachment[]
            )
            return newForms
        })
    }

    const handleDocChange = (docTypes: DocItemType[]) => {
        setSelectedDocs(docTypes);
        props.onDocumentsChanged(docTypes);
    }

    const removeDoc = (x: DocItemType) => {
        setSelectedDocs(p => {
            const newdocs = p.filter(y => x !== y)
            props.onDocumentsChanged(newdocs)
            return newdocs
        })
    }

    const {data: fileSizeSetting} = useQuery(
        ['fileSettings'],
        () => OptionService.getOption('System Settings', 'File Upload Size')
    )

    const handleFileChange = async (files: File[]) => {
        const newFiles: LocalFileAttachment[] = []

        for (const file of files) {
            const attachment = await readFile(props.itemId, file, fileSizeSetting?.Unit, fileSizeSetting?.OptionValue);
            if (attachment) {
                if (selectedLocalFiles.some(x => x.FileName === attachment.FileName)) {
                    showNotification({
                        id: 'fileTooLarge',
                        title: 'File already added ',
                        message: attachment.FileName,
                        color: 'yellow.7',
                        autoClose: 3000
                    })
                } else {
                    newFiles.push(attachment)
                }
            } else {
                showNotification({
                    id: 'fileTooLarge',
                    message: `All attachment(s) must be smaller than ${fileSizeSetting?.OptionValue ?? 2}${fileSizeSetting?.Unit ?? 'mb'}`,
                    color: 'yellow.7',
                    autoClose: 3000
                })
            }
        }
        setSelectedLocalFiles(p => {
            const newItems =  [...p, ...newFiles]
            props.onLocalAttachmentsChanged(newItems)
            return newItems
        })
    }

    const removeLocalFile = (x: LocalFileAttachment) => {
        setSelectedLocalFiles(p => {
            const newItems = p.filter(y => x.FileName !== y.FileName)
            props.onLocalAttachmentsChanged(newItems)
            return newItems
        })
    }

    const documentLabelMapping = useMemo(() => {
        return {
            'quote': 'Quote',
            'invoice': 'Invoice',
            'purchase_order': 'Purchase Order',
            'job_card': props.documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).IsActive && props.documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardCustomer).Title || 'Job Card',
            'workshop': 'Workshop',
            'sign_off': props.documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).IsActive && props.documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).Title || 'Sign Off',
            'job_sheet': props.documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).IsActive && props.documentDefinitionMetaData?.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).Title || 'Job Sheet',
        }
    }, [props.documentDefinitionMetaData?.JobDocuments])

    const documents = useMemo(() => {
        
        return (
            selectedDocs.map((x) => (
                <Box
                    key={x}
                    mt={2}
                >
                    <Card withBorder
                          radius="md"
                          w={cardSize}
                          h={cardSize}
                          p={0}
                          bg={'scBlue'}
                          c={'scBlue.1'}
                          className={styles.attachmentCheck}
                    >
                        {
                            <Box
                                pos={'relative'}
                                w={'100%'}
                                h={'100%'}
                            >
                                <Flex align={'stretch'}
                                      justify={'center'}
                                      direction={'column'}
                                >
                                    <Text size={'8px'} mt={8} ms={8} me={'xl'} c={'scBlue.0'} lineClamp={2}
                                          maw={cardSize}
                                        // ta={'center'}
                                    >
                                        {documentLabelMapping[x]}
                                    </Text>
                                </Flex>
                                <Tooltip
                                    label={'Remove'}
                                    color={'scBlue.3'}
                                    openDelay={800}
                                >
                                    <ActionIcon
                                        ml={'auto'}
                                        color={'scBlue.2'}
                                        variant={'filled'}
                                        size={'xs'}
                                        c={'white'}
                                        pos={'absolute'}
                                        right={3}
                                        top={3}
                                        style={{zIndex: 5}}
                                        onClick={() => removeDoc(x)}
                                    >
                                        <IconX/>
                                    </ActionIcon>
                                </Tooltip>
                                {
                                    getIconForDoc(x)
                                }
                            </Box>
                        }
                    </Card>
                </Box>
            ))
        )
    }, [selectedDocs])

    const forms = useMemo(() => (
        selectedForms.map((x) => {
            const size = smallIconSize
            const formAttachment = formAttachments?.find(y => y.ID === x)
            return (formAttachment &&
                <Tooltip
                    key={x}
                    label={FormDetails({form: formAttachment})}
                    multiline
                    color={'scBlue.9'}
                    openDelay={1200}
                >
                    <Box
                        mt={2}
                    >
                        <Card withBorder
                              radius="md"
                              w={cardSize}
                              h={cardSize}
                              p={0}
                              bg={'scBlue.0'}
                              c={'scBlue.7'}
                              className={styles.attachmentCheck}
                        >
                            {
                                <Box
                                    pos={'relative'}
                                    w={'100%'}
                                    h={'100%'}
                                >
                                    <Flex align={'stretch'}
                                          justify={'center'}
                                          direction={'column'}
                                    >
                                        <Text size={'9px'} mt={8} ms={8} me={19} c={'scBlue.7'} lineClamp={3} maw={cardSize} style={{zIndex: 3}}
                                            // ta={'center'}
                                        >
                                            {formAttachment.FormDefinition.Name}
                                        </Text>
                                        {
                                            formAttachment.FormStatus === Enums.FormStatus.Draft &&
                                                <Text size={'8px'} mt={3} ms={8} me={19} c={'yellow.6'} fw={'bolder'} lineClamp={3} maw={cardSize} style={{zIndex: 3}}>
                                                    Draft
                                                </Text>
                                        }
                                        {

                                            isDocumentSendingForms(formAttachment, props.documentDefinitionMetaData, selectedDocs) &&
                                            <Text size={'8px'} fw={'bolder'} mt={3} ms={8} me={19} c={'yellow.6'} lineClamp={3} style={{zIndex: 3}}
                                                  maw={cardSize}>
                                                In document
                                            </Text>

                                        }

                                    </Flex>
                                    <Tooltip
                                        label={'Remove'}
                                        color={'scBlue.3'}
                                        openDelay={800}
                                    >
                                        <ActionIcon
                                            ml={'auto'}
                                            color={'scBlue.2'}
                                            variant={'filled'}
                                            size={'xs'}
                                            c={'white'}
                                            pos={'absolute'}
                                            right={3}
                                            top={3}
                                            style={{zIndex: 5}}
                                            onClick={() => removeForm(x)}
                                        >
                                            <IconX/>
                                        </ActionIcon>
                                    </Tooltip>
                                    <Flex>
                                        {
                                            <IconFileText
                                                size={size}
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
                                        }
                                    </Flex>
                                </Box>
                            }
                        </Card>
                    </Box>
                </Tooltip>
            )
        })
    ), [selectedForms, selectedDocs])

    const attachments = useMemo(() => selectedAttachments.map(
            x => {
                const att = moduleAttachments?.flatMap(x => x)?.find(y => y.ID === x)
                return att && <Tooltip
                    multiline
                    key={x}
                    color={'scBlue.9'}
                    openDelay={1200}
                    label={FileDetails({file: att})}
                >
                    <Box
                        mt={2}
                    >
                        <Card withBorder radius="md" w={cardSize} h={cardSize}
                              p={0}
                              className={styles.attachmentCheck}
                        >
                            {
                                <Box
                                    pos={'relative'}
                                    w={'100%'}
                                    h={'100%'}
                                >
                                    <Tooltip
                                        label={'Remove'}
                                        color={'scBlue.3'}
                                        openDelay={800}
                                    >
                                        <ActionIcon
                                            ml={'auto'}
                                            color={'scBlue.2'}
                                            variant={'filled'}
                                            size={'xs'}
                                            c={'white'}
                                            pos={'absolute'}
                                            right={3}
                                            top={3}
                                            style={{zIndex: 5}}
                                            onClick={() => removeAttachment(x)}
                                        >
                                            <IconX/>
                                        </ActionIcon>
                                    </Tooltip>
                                    {
                                        att?.ContentType?.startsWith('image/') ?
                                            <Image
                                                fill
                                                objectFit={'center'}
                                                objectPosition={'center'}
                                                src={att.UrlThumb || ''}
                                                alt={''}
                                                style={{
                                                    objectPosition: 'center',
                                                    objectFit: 'contain',
                                                    zIndex: 0
                                                }}
                                            /> :
                                            contentTypeIcon(att.ContentType || '')
                                    }


                                    <Flex align={'stretch'}
                                          justify={'center'}
                                          direction={'column'}
                                          pos={'absolute'}
                                          bottom={0}
                                          c={'#fff'}
                                          pt={2}
                                          w={'100%'}
                                          style={{
                                              backgroundColor: rgba('var(--mantine-color-dark-1)', .4),
                                              color: 'white',
                                              textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`
                                          }}
                                    >
                                        <Text size={'9px'} ta={'right'} mr={1}>
                                            {moment(att.ModifiedDate).format('DD MMM, YY hh:mm')}
                                        </Text>
                                        <Text size={'xs'} lineClamp={1} maw={cardSize} ta={'right'}>
                                            {att.Description}
                                        </Text>
                                    </Flex>

                                </Box>
                            }
                        </Card>
                    </Box>
                </Tooltip>;
            }
        )
        , [selectedAttachments]);

    const files = useMemo(() => selectedLocalFiles.map(
            x => {
                return <Tooltip
                    multiline
                    key={x.FileName}
                    color={'scBlue.9'}
                    openDelay={1200}
                    label={FileDetails({file: x as any})}
                >
                    <Box
                        mt={2}
                    >
                        <Card withBorder radius="md" w={cardSize} h={cardSize}
                              p={0}
                              className={styles.attachmentCheck}
                        >
                            {
                                <Box
                                    pos={'relative'}
                                    w={'100%'}
                                    h={'100%'}
                                >
                                    <Tooltip
                                        label={'Remove'}
                                        color={'scBlue.3'}
                                        openDelay={800}
                                    >
                                        <ActionIcon
                                            ml={'auto'}
                                            color={'scBlue.2'}
                                            variant={'filled'}
                                            size={'xs'}
                                            c={'white'}
                                            pos={'absolute'}
                                            right={3}
                                            top={3}
                                            style={{zIndex: 5}}
                                            onClick={() => removeLocalFile(x)}
                                        >
                                            <IconX/>
                                        </ActionIcon>
                                    </Tooltip>
                                    {
                                        !!x.dataUrl ?
                                            <Image
                                                fill
                                                objectFit={'center'}
                                                objectPosition={'center'}
                                                src={x.dataUrl}
                                                alt={''}
                                                style={{
                                                    objectPosition: 'center',
                                                    objectFit: 'contain',
                                                    zIndex: 0
                                                }}
                                            /> : contentTypeIcon(getFileContentType(x.FileName))
                                    }


                                    <Flex align={'stretch'}
                                          justify={'center'}
                                          direction={'column'}
                                          pos={'absolute'}
                                          bottom={0}
                                          c={'#fff'}
                                          pt={2}
                                          w={'100%'}
                                          style={{
                                              backgroundColor: rgba('var(--mantine-color-dark-1)', .4),
                                              color: 'white',
                                              textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`
                                          }}
                                    >
                                        <Text size={'xs'} lineClamp={2} maw={cardSize} ta={'right'}>
                                            {x.FileName}
                                        </Text>
                                    </Flex>

                                </Box>
                            }
                        </Card>
                    </Box>
                </Tooltip>
            }
        ),
        [selectedLocalFiles]
    );
    return (
        <Card withBorder mb={'sm'}>
            <Flex gap={'lg'} wrap={'nowrap'} direction={{base: 'column', lg: 'row'}} w={'100%'}>
                <Box
                    // style={{flexGrow: 1}}
                    w={{base: '100%', lg: 500}}
                >
                    <Checkbox.Group
                        mb={'sm'}
                        value={selectedDocs}
                        label="Attach document"
                        onChange={(x => handleDocChange(x as DocItemType[]))}
                    >

                        <Group mt="xs">
                            {
                                +props.moduleCode === Enums.Module.Quote &&
                                <Checkbox value='quote' label={documentLabelMapping['quote']}/>
                            }
                            {
                                +props.moduleCode === Enums.Module.Invoice &&
                                <Checkbox value='invoice' label={documentLabelMapping['invoice']}/>
                            }
                            {
                                +props.moduleCode === Enums.Module.PurchaseOrder &&
                                <Checkbox value='purchase_order' label={documentLabelMapping['purchase_order']}/>
                            }
                            {
                                (+props.moduleCode === Enums.Module.JobCard || (props.item && +props.item.Module === Enums.Module.JobCard)) &&
                                <Checkbox value='job_card'
                                          label={documentLabelMapping['job_card']}
                                />
                            }
                            {
                                !props.documentDefinitionMetaData && (+props.moduleCode === Enums.Module.JobCard || (props.item && +props.item.Module === Enums.Module.JobCard)) &&
                                <Checkbox value='workshop' label={documentLabelMapping['workshop']}/>
                            }
                            {
                                (
                                    (+props.moduleCode === Enums.Module.JobCard || (props.item && +props.item.Module === Enums.Module.JobCard)) &&
                                    (!props.documentDefinitionMetaData || props.documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardSignOff).IsActive)
                                ) &&
                                <Checkbox value='sign_off'
                                          label={documentLabelMapping['sign_off']}
                                />
                            }
                            {
                                (+props.moduleCode === Enums.Module.JobCard || (props.item && +props.item.Module === Enums.Module.JobCard)) &&
                                (!props.documentDefinitionMetaData || props.documentDefinitionMetaData.JobDocuments.find(x => x.DocumentType === Enums.DocumentType.JobCardJobSheet).IsActive) &&
                                <Checkbox value='job_sheet'
                                          label={documentLabelMapping['job_sheet']}
                                />
                            }
                        </Group>
                    </Checkbox.Group>
                    <Box maw={{base: 'auto', lg: 500}}>
                        {
                            formAttachments && formAttachments.length !== 0 &&
                            <Checkbox.Group
                                mb={'sm'}
                                // defaultValue={defaultDocs}
                                value={selectedForms}
                                label="Related forms"
                                onChange={handleFormChange}
                            >
                                <Group mt="xs">
                                    {
                                        formAttachments?.map(
                                            x => <Checkbox
                                                key={x.ID} value={x.ID}
                                                label={
                                                    <Flex justify={'space-between'} align={'center'} gap={'sm'}>
                                                        <Flex align={'center'} gap={5} wrap={'wrap'}>
                                                            <Text size={'sm'}>{x.FormDefinition.Name}</Text>
                                                            <Text size={'xs'}
                                                                  c={'dimmed'}>{Enums.getEnumStringValue(Enums.FormStatus, x.FormStatus)}</Text>
                                                            {/*<Text size={'xs'} c={'dimmed'}>{Enums.getEnumStringValue(Enums.FormStatus, x.FormStatus)}</Text>*/}
                                                        </Flex>
                                                        {/*<Text size={'xs'} c={'gray.6'}>
                                                        {Enums.getEnumStringValue(Enums.FormRule, x.FormDefinition.FormRule)}
                                                    </Text>*/}
                                                        {/*<Text size={'xs'} c={'dimmed'} ml={'auto'}>{Enums.getEnumStringValue(Enums.FormStatus, x.FormStatus)}</Text>*/}
                                                    </Flex>
                                                }
                                            />
                                        )
                                    }
                                </Group>
                            </Checkbox.Group>
                        }
                    </Box>
                    {
                        moduleAttachments && [...(moduleAttachments[0]), ...(moduleAttachments[1])].length > 0 && <>
                            <Text size={'sm'}>
                                Related files
                            </Text>
                            <ScrollArea.Autosize
                                mah={100 * 3}
                            >
                                <Group>
                                    <Checkbox.Group
                                        // defaultValue={[]}
                                        value={selectedAttachments}
                                        // label="Select related attachment"
                                        // description="Select related attachment"
                                        withAsterisk
                                        onChange={handleAttachmentChange} // Attach the handler
                                    >

                                        <Flex gap={5} wrap={'wrap'}>
                                            {
                                                moduleAttachments && [...(moduleAttachments[0]), ...(moduleAttachments[1])]
                                                    ?.reduce((p, c, i, a) => (p.some(x => x.ID === c.ID) ? p : [...p, c]), []as Attachment[]) // filter duplicate items
                                                    ?.map(x => (
                                                        // !selectedAttachments.includes(x.ID) &&
                                                        <Tooltip
                                                            multiline
                                                            key={x.ID}
                                                            color={'scBlue.9'}
                                                            openDelay={1200}
                                                            label={FileDetails({file: x})}
                                                        >
                                                            <Box
                                                                key={x.ID}
                                                                mt={2}
                                                            >
                                                                <Checkbox.Card radius="md" value={x.ID} w={cardSize} h={cardSize}
                                                                               styles={{
                                                                                   card: {
                                                                                       borderColor: selectedAttachments.includes(x.ID!) ? 'var(--mantine-color-scBlue-6)' : ''
                                                                                   }
                                                                               }}
                                                                               className={styles.attachmentCheck}
                                                                >
                                                                    {
                                                                        <Box
                                                                            pos={'relative'}
                                                                            w={'100%'}
                                                                            h={'100%'}
                                                                        >
                                                                            {
                                                                                selectedAttachments.includes(x.ID!) &&
                                                                                <Overlay color="var(--mantine-color-scBlue-5)"
                                                                                         zIndex={5} backgroundOpacity={0.2}
                                                                                         blur={0}/>
                                                                            }
                                                                            {
                                                                                x?.ContentType?.startsWith('image/') ?
                                                                                    <Image
                                                                                        fill
                                                                                        objectFit={'center'}
                                                                                        objectPosition={'center'}
                                                                                        src={x.UrlThumb || ''}
                                                                                        alt={''}
                                                                                        style={{
                                                                                            objectPosition: 'center',
                                                                                            objectFit: 'contain',
                                                                                            zIndex: 0
                                                                                        }}
                                                                                    /> :
                                                                                    contentTypeIcon(x.ContentType || '')
                                                                            }

                                                                            <Checkbox.Indicator
                                                                                styles={{
                                                                                    // indicator: {backgroundColor: 'transparent'}
                                                                                }}
                                                                                size={'sm'}
                                                                                style={{position: 'absolute', left: 3, top: 3}}
                                                                                // iconColor={'scBlue'}
                                                                            />

                                                                            <Flex align={'stretch'}
                                                                                  justify={'center'}
                                                                                  direction={'column'}
                                                                                  pos={'absolute'}
                                                                                  bottom={0}
                                                                                  c={'#fff'}
                                                                                  pt={2}
                                                                                  w={'100%'}
                                                                                  style={{
                                                                                      backgroundColor: rgba('var(--mantine-color-dark-1)', .4),
                                                                                      color: 'white',
                                                                                      textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`
                                                                                  }}
                                                                            >
                                                                                <Text size={'9px'} ta={'right'} mr={1}>
                                                                                    {moment(x.ModifiedDate).format('DD MMM, YY hh:mm')}
                                                                                </Text>
                                                                                <Text size={'xs'} lineClamp={1} maw={cardSize}
                                                                                      ta={'right'}>
                                                                                    {x.Description}
                                                                                </Text>
                                                                            </Flex>
                                                                        </Box>
                                                                    }
                                                                </Checkbox.Card>
                                                            </Box>
                                                        </Tooltip>
                                                    ))
                                            }
                                        </Flex>
                                    </Checkbox.Group>
                                </Group>
                            </ScrollArea.Autosize>
                        </>
                    }

                    <Group justify="center" mt={'xs'}>
                        <FileButton onChange={handleFileChange}
                            // accept="image/png,image/jpeg"
                                    multiple
                        >
                            {(props) => <Button
                                {...props}
                                variant={'default'}
                                w={'100%'}
                            >
                                Choose file(s)
                            </Button>}
                        </FileButton>
                    </Group>
                </Box>
                <Box
                    style={{flexGrow: 0}}
                    w={{base: '100%', lg: 'calc(100% - 20px - 500px)'}}
                >
                    <Text size={'sm'} mb={9}>
                        Selected attachments:
                    </Text>
                    {
                        (documents.length !== 0 || attachments.length !== 0 || forms.length !== 0 || selectedLocalFiles.length !== 0) ? (
                            <Flex justify={'start'} align={'end'} gap={5} wrap={'wrap'}>
                                {documents} {forms} {attachments}
                                <>
                                    {files}
                                </>
                            </Flex>
                            // <Text size={'sm'}>Selected Attachments: </Text>

                        ) : (
                            <Text>No Attachment Selected</Text>
                        )
                    }
                </Box>
            </Flex>
        </Card>
    )
};

export default CommunicationAttachments