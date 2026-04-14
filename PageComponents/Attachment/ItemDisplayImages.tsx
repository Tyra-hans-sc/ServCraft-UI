import { Attachment } from '@/interfaces/api/models';
import attachmentService from '@/services/attachment-service';
import { Flex, Loader, SimpleGrid, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconDragDrop, IconDragDrop2, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from "framer-motion";
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from "@/PageComponents/Message/MessageItems/MessageItem.module.css";
import AttachmentItem from "@/PageComponents/Attachment/AttachmentItem";
import BusyIndicatorContext from '@/utils/busy-indicator-context';
import constants from '@/utils/constants';
import ToastContext from '@/utils/toast-context';
import fileService from '@/services/file-service';
import { Module } from '@/utils/enums';
import DisplayItem from './DisplayItem';
import { Carousel } from '@mantine/carousel'
import * as Enums from '@/utils/enums';
import helper from '@/utils/helper';

// 
// for selection and identification (tech facing)
// for documents and customer zone (customer facing)

const ItemDisplayImages: FC<{
    itemID: string,
    module: number,
    primaryDisplayImageID?: string,
    onPrimaryDisplayImageUpdate?: (attachmentID: string | null) => Promise<void>,
    onImageUploaded?: () => void,
    readOnly?: boolean
}> = (props) => {

    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [uploading, setUploading] = useState(false);
    const busyIndicator = useContext<any>(BusyIndicatorContext);
    const toast = useContext<any>(ToastContext);
    const [attachmentType, setAttachmentType] = useState<number>(Enums.AttachmentType.DisplayImage);

    const [firstLoad, setFirstLoad] = useState(true);

    const openRef = useRef<() => void>(null);

    useEffect(() => {
        getAttachments();
    }, [props.itemID]);


    const updatePrimaryDisplayImageID = async (attachmentID: string | null) => {
        if (!props.onPrimaryDisplayImageUpdate) return;

        await props.onPrimaryDisplayImageUpdate(attachmentID);
    }

    const getAttachments = async () => {
        if (!props.itemID) return [];
        let data = (await attachmentService.getItemAttachments(props.itemID)).data.filter(x => x.AttachmentType === Enums.AttachmentType.DisplayImage);
        setAttachments(data);
        setFirstLoad(false);
        return data;
    }

    const sortedAttachments = useMemo(() => {
        let sorted = attachments.sort((a, b) => {
            if (a.ID === props.primaryDisplayImageID) return -1;
            if (b.ID === props.primaryDisplayImageID) return 1;
            return (a.CreatedDate ?? "") > (b.CreatedDate ?? "") ? 1 :
                (a.CreatedDate ?? "") < (b.CreatedDate ?? "") ? -1 : 0;
        });

        return sorted;
    }, [attachments, props.primaryDisplayImageID]);

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20, // Start with a slight downward motion
        },
        visible: {
            opacity: 1,
            y: 0, // Move into place
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            y: -20, // Exit upwards
            transition: {
                duration: 0.3,
                ease: "easeIn",
            },
        },
    };


    const handleAttachmentsChange = async (items: File[]) => {

        // only upload images
        items = items.filter(x => x.type.includes("image"));

        if (items.length === 0) {
            toast.setToast({
                message: `No applicable images were selected to upload.`,
                show: true,
                type: 'error'
            });
            return;
        }

        setUploading(true);
        busyIndicator.setText("Uploading...");

        let markAsPrimary = sortedAttachments.length === 0;

        let numberOfFiles = items.length + sortedAttachments.length;
        let maxFiles = constants.maximumDisplayImages;

        if (numberOfFiles > maxFiles) {
            setUploading(false);
            busyIndicator.setText(null);
            toast.setToast({
                message: `You can only have up to a maximum of ${maxFiles} display images.`,
                show: true,
                type: 'error'
            });
            return;
        }

        const fileUploadSize = await fileService.getFileUploadSize();

        let files = items.map((file: any) => {
            let reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.onload = async () => {
                    try {
                        if (reader.result && typeof reader.result === 'string') {
                            let returnObject: any = { ID: helper.newGuid(), Description: file.name, FileName: file.name };
                            let fileBase64 = reader.result.replace(/^data:.+;base64,/, '');

                            let isValid = await attachmentService.validateAttachment(fileBase64, fileUploadSize);

                            if (isValid) {
                                returnObject.FileBase64 = fileBase64;
                                resolve(returnObject);
                            } else {
                                returnObject.error = `The attachment ${file.name} must be smaller than ${fileUploadSize.Value}${fileUploadSize.Unit}`;
                                reject(returnObject);
                            }
                        }
                    } catch (e) {
                        console.error(e)
                    }
                };
                reader.readAsDataURL(file);
            });
        });

        try {
            let results = await Promise.all(files) as any[];

            let saveResponse = await attachmentService.saveAttachments(attachmentType, results, props.itemID, props.module, toast);

            if (saveResponse && saveResponse.ResponseStatus === 200) {
                toast.setToast({
                    message: 'Attachment(s) uploaded successfully',
                    show: true,
                    type: 'success'
                });
                // searchAttachments();
                // onRefresh();

                let savedAttachments = await getAttachments();

                if (markAsPrimary && props.onPrimaryDisplayImageUpdate && savedAttachments.length > 0) {
                    await props.onPrimaryDisplayImageUpdate(savedAttachments[0].ID)
                }

                props.onImageUploaded && props.onImageUploaded();
            }

            setUploading(false);
            busyIndicator.setText(null);
        }
        catch (result: any) {
            // console.log('Error:', result);
            toast.setToast({
                message: `${result.error}`,
                show: true,
                type: 'error'
            });
            setUploading(false);
            busyIndicator.setText(null);
        }
    };

    const refreshAttachments = async () => {


        getAttachments();
    };

    return (<>

        <Dropzone openRef={openRef}
            activateOnClick={false}
            onDrop={(files) => handleAttachmentsChange(files)}
            onReject={(files) => console.log('rejected files', files)}
            disabled={(firstLoad && attachments.length === 0) || props.readOnly === true}
        >
            {/* <AnimatePresence
                mode={'sync'}
            > */}

            <Carousel
                slideSize="45%"
                slideGap="md"
                controlsOffset="md"
                controlSize={30}
                withControls={sortedAttachments.length > 1}
                withIndicators={sortedAttachments.length > 1}
                skipSnaps
                align="start"
            >
                {
                    sortedAttachments.map((attachment, i) =>
                        <Carousel.Slide key={`${i}_${attachment.ID}`}>
                            <motion.div
                                key={attachment.ID}
                                variants={itemVariants}
                                initial={{
                                    opacity: 0,
                                    y: 20
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                transition={
                                    {
                                        ease: 'easeOut',
                                        duration: .15,
                                        delay: i * .05
                                        // delay: (attachmentsQuery.data?.Results?.length - (i + 1)) * .05
                                    }
                                }
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                    transition: {
                                        duration: .15,
                                        ease: "easeIn",
                                        // delay: (attachmentsQuery.data?.Results?.length - (i + 1)) * .05
                                        // delay: i * .05
                                    }
                                }}
                            >
                                <DisplayItem
                                    key={attachment.ID}
                                    attachment={attachment}
                                    refreshAttachments={refreshAttachments}
                                    primaryDisplayImageID={props.primaryDisplayImageID ?? ""}
                                    setPrimaryDisplayImageID={async (id) => await updatePrimaryDisplayImageID(id)}
                                    allowPrimaryDisplayImage={!!props.onPrimaryDisplayImageUpdate}
                                    readOnly={props.readOnly}
                                />
                            </motion.div>
                        </Carousel.Slide>
                    )
                }

                {props.readOnly !== true &&
                    <Carousel.Slide >
                        <Dropzone.Accept>
                            <Flex mih={attachments.length === 0 ? 150 : "100%"} gap={'xs'} direction={'column'} align={'center'} justify={'center'}
                                className={styles.placeholderCard} bg={'scBlue.0'} style={{ borderColor: 'var(--mantine-color-scBlue-5)' }}
                            >
                                <IconDragDrop size={32} color="var(--mantine-color-scBlue-5)" stroke={1.5} />
                                <Text size={'sm'} c={'scBlue'}>Drop to upload </Text>
                            </Flex>
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <Flex mih={attachments.length === 0 ? 150 : '100%'} gap={'xs'} direction={'column'} align={'center'} justify={'center'}
                                className={styles.placeholderCard}
                                bg={'yellow.0'} style={{ borderColor: 'var(--mantine-color-yellow-7)' }}
                            >
                                <IconX size={32} color="var(--mantine-color-yellow-7)" stroke={1.5} />
                                <Text size={'sm'} c={'yellow.7'}>File type not supported</Text>

                            </Flex>
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <Flex mih={attachments.length === 0 ? 150 : "100%"} miw={200} gap={'xs'} direction={'column'} align={'center'} justify={'center'}
                                className={styles.placeholderCard}
                                onClick={() => openRef.current?.()}
                            >
                                <IconDragDrop2 size={32} color="var(--mantine-color-dimmed)" stroke={1.5} />
                                <Text size={'sm'} c={'dimmed'}>{firstLoad && attachments.length === 0 ? "Loading..." : "Drag and drop files here"}</Text>
                            </Flex>
                        </Dropzone.Idle>
                    </Carousel.Slide>
                }

            </Carousel>


        </Dropzone>

        <style jsx>{`
            
        `}</style>
    </>);
};

export default ItemDisplayImages;