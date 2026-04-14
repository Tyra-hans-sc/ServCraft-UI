import { useState, useRef, useCallback, useEffect, useContext } from "react";
import { Carousel } from "@mantine/carousel";
import { useForm } from "@mantine/form";
import { Flex, TextInput, Title, Text, ActionIcon, Divider, Tooltip, Stack, Group, Box, Button, Loader, Modal } from "@mantine/core";
import moment from "moment";
import { IconX, IconDeviceFloppy, IconFile, IconCalendar, IconUser, IconFileText, IconDownload, IconCrop, IconMinus, IconPlus, IconRotateClockwise2 } from "@tabler/icons-react";

import SCModal from "@/PageComponents/Modal/SCModal";
import { Attachment } from "@/interfaces/api/models";
import ImageEditor, { ImageEditorRef } from './ImageEditor/ImageEditor'
import styles from './PreviewImages.module.css'
import { Slider } from "@mui/material";
import attachmentService from "@/services/attachment-service";
import { useMutation } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";

/** Only render slides within this distance of the current slide (supports loop wrapping). */
const VIRTUALIZE_RANGE = 1;

function isSlideNearby(slideIndex: number, currentIndex: number, totalSlides: number): boolean {
    if (totalSlides <= VIRTUALIZE_RANGE * 2 + 1) return true;
    const distance = Math.min(
        Math.abs(slideIndex - currentIndex),
        totalSlides - Math.abs(slideIndex - currentIndex)
    );
    return distance <= VIRTUALIZE_RANGE;
}

export interface PreviewImagesProps {
    attachments: Attachment[],
    setAttachmentItems?: (attachments: Attachment[]) => void,
    attachment?: Attachment,
    id?: number,
    onClose?: () => void,
    onAttachmentUpdate?: (updatedAttachment: Attachment) => void,
    readOnly?: boolean
}

const filterImages = (attachments: Attachment[]) => {
    return attachments.filter(attachment => {
        const ext = attachment.FileName?.toLowerCase().split('.').pop();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext || '');
    })
};

const PreviewImages = ({
    attachments,
    attachment,
    onClose,
    readOnly = false,
    setAttachmentItems
}: PreviewImagesProps) => {
    const [imageAttachments, setImageAttachments] = useState<Attachment[]>(filterImages(attachments));
    const [currentIndex, setCurrentIndex] = useState(imageAttachments.findIndex(att => att.ID === attachment?.ID) || 0);
    const currentAttachment = imageAttachments[currentIndex];
    const [isEditing, setIsEditing] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [showCropConfirm, setShowCropConfirm] = useState(false);
    const [zoom, setZoom] = useState(0);
    const currentEditorRef = useRef<ImageEditorRef>(null);

    const updateAttachmentFileNameMutation = useMutation({
        mutationKey: ['updateAttachmentFileName'],
        mutationFn: (attachment: Attachment) => attachmentService.updateAttachment(attachment),
        onSuccess: (data) => {
            updateAttachment(data);
            showNotification({
                id: 'Attachment' + attachment?.ID,
                message: 'Changes saved successfully',
                color: 'scBlue',
                autoClose: 4000,
            });
            form.reset();
        },
        onError: (error) => {
            showNotification({
                id: 'Attachment' + attachment?.ID,
                message: 'Failed to rename file',
                color: 'yellow.7',
                autoClose: 4000,
            });
            form.reset();

        }
    });

    const form = useForm({
        initialValues: {
            fileName: currentAttachment?.Description || currentAttachment?.FileName || '',
        }
    })

    const [embla, setEmbla] = useState<any>(null);

    const jumpToKey = useCallback((key: string) => {
        if (!embla) return;
        const index = imageAttachments.findIndex(item => item.ID === key);
        if (index !== -1) {
            embla.scrollTo(index);
        }
    }, [embla, imageAttachments]);

    const updateAttachment = useCallback((updatedAttachment: Attachment) => {
        const index = attachments.findIndex(att => att.ID === updatedAttachment.ID);
        if (index !== -1) {
            const attachmentsCopy = [...attachments];
            attachmentsCopy[index] = { ...attachmentsCopy[index], ...updatedAttachment };
            setAttachmentItems?.(attachmentsCopy);
            setImageAttachments(filterImages(attachmentsCopy));
        }
    }, [attachments, setAttachmentItems]);

    useEffect(() => {
        if (embla && attachment) {
            jumpToKey(attachment.ID + '');
        }
    }, [embla]);

    useEffect(() => {
        if (!embla) return;
        embla.reInit({ watchDrag: !isEditing && zoom === 0 });
    }, [embla, isEditing, zoom]);

    // Keyboard arrow navigation for carousel
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!embla) return;
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.key === 'ArrowLeft' ? embla.scrollPrev() : embla.scrollNext();
                (document.activeElement as HTMLElement)?.blur();
            }
        }
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [embla]);

    useEffect(() => {
        setZoom(0);
        setIsEditing(false);
        setIsCropping(false);
        currentEditorRef.current?.handleZoom(0);
    }, [currentIndex]);

    useEffect(() => {
        form.setValues({ fileName: currentAttachment?.Description || currentAttachment?.FileName || '' });
        form.resetDirty();
    }, [currentIndex, imageAttachments])

    const formatFileSize = (bytes: number | undefined) => {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDownloadImage = () => {
        currentEditorRef.current?.downloadImage();
    }

    const handleZoom = (value: number) => {
        currentEditorRef.current?.handleZoom(value);
    }

    const rotateImage = () => {
        currentEditorRef.current?.rotateImage();
    }

    const handleSaveChanges = () => {
        if (isCropping) {
            setShowCropConfirm(true);
            return;
        }
        currentEditorRef.current?.saveChanges();
    }

    const handleConfirmCropSave = () => {
        setShowCropConfirm(false);
        currentEditorRef.current?.saveChanges();
    }

    const toggleActiveCropMode = () => {
        currentEditorRef.current?.toggleActiveMode();
    }

    const handleResetChanges = () => {
        currentEditorRef.current?.handleResetChanges();
    }

    const handleSaveFileName = () => {
        form.validate();
        if (!form.isValid()) return;
        const updatedAttachment = { ...currentAttachment, Description: form.values.fileName };
        updateAttachment(updatedAttachment);
        updateAttachmentFileNameMutation.mutate(updatedAttachment);
    }


    return (
        <SCModal
            size={'auto'}
            open
            onClose={onClose}
            modalProps={{
                keepMounted: false,
                styles: {
                    content: {
                        paddingInline: 0,
                        marginInline: 0,
                        overflowX: 'hidden',
                        background: 'white',
                        width: '90vw',
                        maxWidth: '90vw'
                    },
                    body: {
                        paddingInline: 0,
                        marginInline: 0,
                        background: 'white',
                        width: '90vw',
                        maxWidth: '90vw'
                    },
                }
            }}
            p={'xs'}
        >
            <Flex className={styles.container}>
                <Flex className={styles.topRightControls}>
                    <Tooltip label="Download Image" position="left">
                        <ActionIcon
                            size="lg"
                            variant="light"
                            color="scBlue"
                            onClick={handleDownloadImage}
                        >
                            <IconDownload size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label={"Close"} position="left">
                        <ActionIcon
                            size="lg"
                            variant="light"
                            color="scBlue"
                            onClick={() => onClose?.()}
                        >
                            <IconX size={18} />
                        </ActionIcon>
                    </Tooltip>
                </Flex>
                <Flex direction={'column'}>
                    <Carousel
                        getEmblaApi={setEmbla}
                        key={'with-info'}
                        style={{ width: 'calc(90vw - 300px)' }}
                        h={readOnly ? "80vh" : "calc(80vh - 40px)"}
                        className={styles.carousel}
                        onSlideChange={setCurrentIndex}
                        initialSlide={currentIndex}
                        slideSize="100%"
                        slideGap={0}
                        align="start"
                        slidesToScroll={1}
                        withControls={imageAttachments.length > 1}
                        loop
                    >
                        {imageAttachments.map((attachment, index) => {
                            const isNearby = isSlideNearby(index, currentIndex, imageAttachments.length);
                            return (
                                <Carousel.Slide key={attachment.ID} style={{ flex: '0 0 100%' }}>
                                    {isNearby ? (
                                        <ImageEditor
                                            readonly={readOnly}
                                            ref={index === currentIndex ? currentEditorRef : null}
                                            attachment={attachment}
                                            onSaveComplete={updateAttachment}
                                            onEditModeChange={setIsEditing}
                                            onCropModeChange={setIsCropping}
                                            onZoomChange={setZoom}
                                        />
                                    ) : (
                                        <Flex
                                            direction="column"
                                            align="center"
                                            justify="center"
                                            h={readOnly ? "80vh" : "calc(80vh - 40px)"}
                                            w="calc(90vw - 300px)"
                                            bg="white"
                                        >
                                            <Loader />
                                        </Flex>
                                    )}
                                </Carousel.Slide>
                            );
                        })}
                    </Carousel>{
                        !readOnly &&
                        <Flex w={'100%'} mih={'40px'} align={'center'} bg={'white'} wrap={'wrap'} justify={'flex-start'} px={'xl'} gap={'md'}>
                            <Tooltip label="Rotate 90°">
                                <Button
                                    leftSection={<IconRotateClockwise2 size={18} />}
                                    variant="light"
                                    color="scBlue"
                                    onClick={rotateImage}>
                                    Rotate
                                </Button>
                            </Tooltip>
                            <Tooltip label="Crop">
                                <Button
                                    leftSection={<IconCrop size={18} />}
                                    variant="light"
                                    color="scBlue"
                                    onClick={toggleActiveCropMode}
                                >
                                    Crop
                                </Button>
                            </Tooltip>
                            {isEditing &&

                                <Tooltip label="Reset Changes">
                                    <Button
                                        leftSection={<IconX size={18} />}
                                        color="scBlue"
                                        variant={'light'}
                                        onClick={handleResetChanges}
                                    >
                                        Cancel
                                    </Button>
                                </Tooltip>

                            }
                            {isEditing && <Tooltip label="Save Changes">
                                <Button
                                    leftSection={<IconDeviceFloppy size={18} />}
                                    color="scBlue"
                                    onClick={handleSaveChanges}
                                >
                                    Save Changes
                                </Button>
                            </Tooltip>

                            }
                            <Box className={styles.zoomControlBar}>
                                <ActionIcon
                                    variant={'transparent'}
                                    onClick={() => handleZoom(Math.max(0, zoom - 10))}
                                >
                                    <IconMinus size={12} />
                                </ActionIcon>
                                <Slider orientation={'horizontal'}
                                    onChange={(x, val) => handleZoom(val as number)}
                                    min={0} max={90}
                                    track={false}
                                    value={zoom}
                                    valueLabelFormat={(x) => `${x}%`}
                                    getAriaValueText={(x) => `${x}%`}
                                    valueLabelDisplay={'auto'}
                                    aria-label={'Zoom'}
                                />
                                <ActionIcon
                                    variant={'transparent'}
                                    onClick={() => handleZoom(Math.min(90, zoom + 10))}
                                >
                                    <IconPlus size={12} />
                                </ActionIcon>
                            </Box>

                        </Flex>
                    }
                </Flex>
                <Box className={styles.infoPanel} w={'300px'} h={'80vh'} >
                    <Stack gap="lg" p="xl">
                        <Title order={4} c="dark">Details</Title>
                        <Divider color="gray.3" />
                        <Stack gap="md">
                            <Group gap="sm" wrap="nowrap">
                                <IconFile size={18} color="var(--mantine-color-scBlue-6)" />
                                <Stack gap={4} style={{ flex: 1 }}>
                                    <Text size="xs" c="dimmed">File name</Text>
                                    <Flex align="center" gap={'xs'}>
                                        <TextInput
                                            size="sm"
                                            {...form.getInputProps('fileName')}
                                            variant="filled"
                                            styles={{
                                                input: {
                                                    backgroundColor: '#f1f3f5',
                                                    border: 'none',
                                                    color: 'var(--mantine-color-dark-7)',
                                                    padding: '0px 5px',
                                                    cursor: 'default',
                                                    maxWidth: '240px'
                                                }
                                            }}
                                        />{form.isDirty() && form.values.fileName?.trim() &&
                                            <Tooltip label="Save File Name">
                                                <ActionIcon
                                                    size="md"
                                                    variant="light"
                                                    color="scBlue"
                                                    onClick={handleSaveFileName}
                                                >
                                                    <IconDeviceFloppy size={24} />
                                                </ActionIcon>
                                            </Tooltip>
                                        }

                                    </Flex>
                                </Stack>
                            </Group>
                            {currentAttachment?.FileSize &&
                                <Group gap="sm" wrap="nowrap">
                                    <IconFileText size={18} color="var(--mantine-color-scBlue-6)" />
                                    <Stack gap={4} style={{ flex: 1 }}>
                                        <Text size="xs" c="dimmed">File size</Text>
                                        <Text size="sm" c="dark">
                                            {formatFileSize(currentAttachment.FileSize)}
                                        </Text>
                                    </Stack>
                                </Group>

                            }
                            {currentAttachment?.CreatedDate && (
                                <Group gap="sm" wrap="wrap">
                                    <IconCalendar size={18} color="var(--mantine-color-scBlue-6)" />
                                    <Stack gap={4} style={{ flex: 1 }}>
                                        <Text size="xs" c="dimmed">Created</Text>
                                        <Text size="sm" c="dark">
                                            {moment(currentAttachment.CreatedDate).format('MMM D, YYYY [at] h:mm A')}
                                        </Text>
                                    </Stack>
                                </Group>
                            )}
                            {currentAttachment?.ModifiedDate && (
                                <Group gap="sm" wrap="wrap">
                                    <IconCalendar size={18} color="var(--mantine-color-scBlue-6)" />
                                    <Stack gap={4} style={{ flex: 1 }}>
                                        <Text size="xs" c="dimmed">Modified</Text>
                                        <Text size="sm" c="dark">
                                            {moment(currentAttachment.ModifiedDate).format('MMM D, YYYY [at] h:mm A')}
                                        </Text>
                                    </Stack>
                                </Group>
                            )}
                            {currentAttachment?.CreatedBy && (
                                <Group gap="sm" wrap="wrap">
                                    <IconUser size={18} color="var(--mantine-color-scBlue-6)" />
                                    <Stack gap={4} style={{ flex: 1 }}>
                                        <Text size="xs" c="dimmed">Created by</Text>
                                        <Text size="sm" c="dark" style={{ wordBreak: 'break-word', width: 'calc(300px - 80px)' }}>
                                            {currentAttachment.CreatedBy}
                                        </Text>
                                    </Stack>
                                </Group>
                            )}

                        </Stack>
                    </Stack>
                </Box>
            </Flex>
            <Modal
                opened={showCropConfirm}
                onClose={() => setShowCropConfirm(false)}
                title={<Text fw={700}>Save cropped photo?</Text>}
                centered
                size="md"
            >
                <Text size="sm">This will replace the original.</Text>
                <Group justify="flex-end" mt="lg" mb="md" mr={'xs'}>
                    <Button variant="outline" color="gray" c="black" py={'xs'} px={24} style={{ minWidth: 'unset', height: 'auto' }} onClick={() => setShowCropConfirm(false)}>
                        Cancel
                    </Button>
                    <Button color="scBlue" py={'xs'} px={32} style={{ minWidth: 'unset', height: 'auto' }} onClick={handleConfirmCropSave}>
                        Save
                    </Button>
                </Group>
            </Modal>
        </SCModal>
    );
}

export default PreviewImages;