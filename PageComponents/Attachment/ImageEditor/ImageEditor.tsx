import { useRef, useState, useImperativeHandle, forwardRef, useCallback, useEffect } from "react";
import { Cropper, CropperRef, ImageRestriction } from "react-advanced-cropper";
import { Box, Flex, Loader } from '@mantine/core';
import { Attachment } from "@/interfaces/api/models";
import 'react-advanced-cropper/dist/style.css';
import styles from './ImageEditor.module.css';
import { useMutation } from "@tanstack/react-query";
import attachmentService from "@/services/attachment-service";
import { downloadAttachment, getBase64FromDataUrl } from "@/utils/utils";
import { getZoomFactor, getAbsoluteZoom } from 'advanced-cropper/extensions/absolute-zoom';
import { extractExifData, injectExifData, updateExifOrientation, fetchImageAsDataUrl, ExifData, composeClockwiseRotation, setJpegOrientation } from '@/utils/exif-utils';
import { recompressPng } from '@/utils/png-utils';
import { showNotification } from "@mantine/notifications";

interface ImageEditorProps {
    attachment: Attachment;
    onEditModeChange?: (isEditing: boolean) => void;
    onCropModeChange?: (isCropping: boolean) => void;
    onZoomChange?: (zoom: number) => void;
    showInfo?: boolean;
    readonly?: boolean;
    onSaveComplete?: (updatedAttachment: Attachment) => void;
}

export interface ImageEditorRef {
    downloadImage: () => void;
    rotateImage: () => void;
    handleZoom: (value: number) => void;
    saveChanges: () => void;
    toggleActiveMode: () => void;
    handleResetChanges: () => void;
}

const ImageEditor = forwardRef<ImageEditorRef, ImageEditorProps>(({ attachment, onEditModeChange, onCropModeChange, readonly = false, onZoomChange, onSaveComplete }, ref) => {
    const cropperRef = useRef<CropperRef>(null);
    const pendingDisplayUrl = useRef<string | null>(null);
    const [imageSrc, setImageSrc] = useState(attachment.Url);
    const [isImageLoading, setIsImageLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [originalExifData, setOriginalExifData] = useState<ExifData | null>(null);
    const [originalPngHasAlpha, setOriginalPngHasAlpha] = useState(false);
    const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
    const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);
    const [hasRotated, setHasRotated] = useState(false);
    const [rotationCount, setRotationCount] = useState(0);

    const updateAttachmentMutation = useMutation({
        mutationKey: ['updateAttachment'],
        mutationFn: (attachment: Attachment) => attachmentService.updateAttachment(attachment),
        onSuccess: (data) => {
            // Use the locally-known data URL we just uploaded so the display updates
            // immediately without relying on the server URL (which may be cached).
            const displayUrl = pendingDisplayUrl.current ?? data.Url;
            pendingDisplayUrl.current = null;
            onSaveComplete?.({ ...data, Url: displayUrl, UrlThumb: displayUrl });
            showNotification({ id: 'Attachment' + attachment.ID, message: 'Changes saved successfully', color: 'scBlue', autoClose: 4000 });
            setIsCropping(false);
            onCropModeChange?.(false);
            setEditMode(false);
            setImageSrc(displayUrl);
        },
        onError: () => {
            showNotification({ id: 'Attachment' + attachment.ID, message: 'Failed to save changes', color: 'yellow.7', autoClose: 4000 });
            setIsCropping(false);
            onCropModeChange?.(false);
            setEditMode(false);
        }
    })

    const setEditMode = (isEditing: boolean) => {
        setEditing(isEditing);
        onEditModeChange?.(isEditing);
    }

    const downloadImage = useCallback(async () => {
        await downloadAttachment(attachment)
    }, [attachment]);

    const [zoom, setZoom] = useState(0);

    const handleZoom = useCallback((value: number) => {
        // value comes as 0-100 from slider, convert to 0-1 for the library
        const normalizedValue = Math.max(0, Math.min(90, value)) / 100;
        const state = cropperRef.current?.getState();
        const settings = cropperRef.current?.getSettings();

        if (state && settings && cropperRef.current) {
            const factor = getZoomFactor(state, settings, normalizedValue);
            cropperRef.current.zoomImage(factor, { transitions: true });
        }
        setZoom(value);
        onZoomChange?.(value);
    }, [onZoomChange]);

    const resetSaveState = () => {
        setIsImageLoading(true);
        setHasRotated(false);
        setRotationCount(0);
        setZoom(0);
        onZoomChange?.(0);
    };

    const finalizeSave = (canvas: HTMLCanvasElement) => {
        // No actual pixel change — skip re-encoding and upload the original bytes.
        if (!hasRotated && originalDataUrl && originalImageSize &&
            canvas.width === originalImageSize.width &&
            canvas.height === originalImageSize.height) {
            updateAttachmentMutation.mutate({ ...attachment, FileBase64: getBase64FromDataUrl(originalDataUrl) });
            resetSaveState();
            return;
        }

        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const mimeType = supportedTypes.includes(attachment.ContentType ?? '') ? attachment.ContentType! : 'image/jpeg';

        let outputCanvas = canvas;
        if (mimeType === 'image/png' && !originalPngHasAlpha) {
            // Redraw onto an opaque canvas so toDataURL emits 24-bit RGB instead of 32-bit RGBA.
            const opaqueCanvas = document.createElement('canvas');
            opaqueCanvas.width = canvas.width;
            opaqueCanvas.height = canvas.height;
            const opaqueCtx = opaqueCanvas.getContext('2d', { alpha: false });
            if (opaqueCtx) {
                opaqueCtx.drawImage(canvas, 0, 0);
                outputCanvas = opaqueCanvas;
            }
        }

        const quality = mimeType !== 'image/png' ? 0.85 : undefined;
        let newImageDataUrl = outputCanvas.toDataURL(mimeType, quality);
        if (mimeType === 'image/png') newImageDataUrl = recompressPng(newImageDataUrl);
        if (originalExifData) {
            // The canvas always has EXIF orientation baked in by the browser renderer,
            // so always reset orientation to 1 (normal) to prevent double-rotation.
            const exifToApply = updateExifOrientation(originalExifData, 0);
            newImageDataUrl = injectExifData(newImageDataUrl, exifToApply);
        }
        pendingDisplayUrl.current = newImageDataUrl;
        updateAttachmentMutation.mutate({ ...attachment, FileBase64: getBase64FromDataUrl(newImageDataUrl) });
        resetSaveState();
    };

    const handleSaveChanges = () => {
        if (!cropperRef.current) return;

        if (isCropping) {
            const canvas = cropperRef.current.getCanvas();
            if (canvas) finalizeSave(canvas);
        } else {
            // Lossless JPEG rotation: update EXIF orientation instead of re-encoding pixels.
            // This prevents file size growth caused by the browser's JPEG re-encoder.
            const isJpeg = attachment.ContentType === 'image/jpeg' || attachment.ContentType === 'image/jpg';
            if (hasRotated && originalDataUrl && isJpeg) {
                const originalOrientation = originalExifData?.orientation ?? 1;
                const newOrientation = composeClockwiseRotation(originalOrientation, rotationCount % 4);
                if (newOrientation !== -1) {
                    const newDataUrl = setJpegOrientation(originalDataUrl, newOrientation);
                    pendingDisplayUrl.current = newDataUrl;
                    updateAttachmentMutation.mutate({ ...attachment, FileBase64: getBase64FromDataUrl(newDataUrl) });
                    resetSaveState();
                    return;
                }
            }

            // Fall back to pixel baking: non-JPEG, unsupported EXIF orientation (flip variants), or missing original
            const img = new Image();
            img.onload = () => {
                const rotations = rotationCount % 4;
                const isVertical = rotations === 1 || rotations === 3;
                const canvas = document.createElement('canvas');
                canvas.width = isVertical ? img.naturalHeight : img.naturalWidth;
                canvas.height = isVertical ? img.naturalWidth : img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotations * Math.PI) / 2);
                ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
                finalizeSave(canvas);
            };
            img.onerror = () => {
                const canvas = cropperRef.current?.getCanvas();
                if (canvas) finalizeSave(canvas);
            };
            img.src = originalDataUrl || imageSrc || '';
        }
    };

    useEffect(() => {
        if (!attachment.Url) return;
        fetchImageAsDataUrl(attachment.Url).then(dataUrl => {
            setOriginalDataUrl(dataUrl);
            setOriginalExifData(extractExifData(dataUrl));

            const img = new Image();
            img.onload = () => setOriginalImageSize({ width: img.naturalWidth, height: img.naturalHeight });
            img.src = dataUrl;

            if (attachment.ContentType === 'image/png') {
                try {
                    // PNG color type is at byte 25: 4 = Grayscale+Alpha, 6 = RGBA
                    const header = atob((dataUrl.split(',')[1] ?? '').substring(0, 36));
                    const colorType = header.charCodeAt(25);
                    setOriginalPngHasAlpha(colorType === 4 || colorType === 6);
                } catch {
                    setOriginalPngHasAlpha(false);
                }
            }
        }).catch(error => console.warn('Could not load image metadata:', error));
    }, [attachment.Url]);

    const toggleActiveCropMode = () => {
        if (!editing) setEditMode(true);
        const newIsCropping = !isCropping;
        setIsCropping(newIsCropping);
        onCropModeChange?.(newIsCropping);

        if (newIsCropping && cropperRef.current) {
            cropperRef.current.setCoordinates((state) => ({
                width: state.imageSize.width * 0.8,
                height: state.imageSize.height * 0.8,
                left: state.imageSize.width * 0.1,
                top: state.imageSize.height * 0.1,
            }));
        }
    }

    const rotateImage = useCallback(() => {
        if (!editing) setEditMode(true);
        setHasRotated(true);
        setRotationCount(prev => (prev + 1) % 4);
        cropperRef.current?.rotateImage(90);

        // Reset cropper's internal zoom to 0 after rotation
        const state = cropperRef.current?.getState();
        const settings = cropperRef.current?.getSettings();
        if (state && settings && cropperRef.current) {
            const factor = getZoomFactor(state, settings, 0);
            cropperRef.current.zoomImage(factor, { transitions: true });
        }
        setZoom(0);
        onZoomChange?.(0);
    }, [editing, onZoomChange]);

    const handleResetChanges = () => {
        cropperRef.current?.reset();
        setIsCropping(false);
        onCropModeChange?.(false);
        setEditMode(false);
        setHasRotated(false);
        setRotationCount(0);
        setZoom(0);
        onZoomChange?.(0);
    }

    useImperativeHandle(ref, () => ({
        downloadImage,
        rotateImage,
        handleZoom,
        saveChanges: handleSaveChanges,
        toggleActiveMode: toggleActiveCropMode,
        handleResetChanges
    }), [downloadImage, rotateImage, handleZoom, handleSaveChanges, toggleActiveCropMode]);

    const zoomContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = zoomContainerRef.current;
        if (!container) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -5 : 5;
            const currentState = cropperRef.current?.getState();
            const currentSettings = cropperRef.current?.getSettings();
            let currentZoom = 0;
            if (currentState && currentSettings) {
                currentZoom = Math.min(90, Math.max(0, Math.round(getAbsoluteZoom(currentState, currentSettings) * 100)));
            }
            const newZoom = Math.max(0, Math.min(90, currentZoom + delta));
            handleZoom(newZoom);
        };
        container.addEventListener('wheel', onWheel, { passive: false, capture: true });
        return () => container.removeEventListener('wheel', onWheel, { capture: true });
    }, [handleZoom]);

    return (
        <Flex ref={zoomContainerRef} direction={'column'} className={styles.container} h={readonly ? "80vh" : "calc(80vh - 40px)"} w={'calc(90vw - 300px)'}>
            <Box
                w={'100%'}
                p={'sm'}
                h={'100%'}
                pos="relative"
                className={`${editing || zoom > 0 ? styles.cropperInteractive : styles.cropperPassthrough} ${zoom > 0 ? styles.cropperZoomed : ''}`}
            >
                <Cropper
                    canvas={true}
                    src={imageSrc}
                    ref={cropperRef}
                    imageRestriction={ImageRestriction.fitArea}
                    onReady={() => setIsImageLoading(false)}
                    onTransformImage={() => {
                        const state = cropperRef.current?.getState();
                        const settings = cropperRef.current?.getSettings();
                        if (state && settings) {
                            const absoluteZoom = Math.min(90, Math.max(0, Math.round(getAbsoluteZoom(state, settings) * 100)));
                            if (absoluteZoom !== zoom) {
                                setZoom(absoluteZoom);
                                onZoomChange?.(absoluteZoom);
                            }
                        }
                    }}
                    className={styles.cropper}
                    stencilProps={{
                        handlers: isCropping,
                        lines: isCropping,
                        movable: isCropping,
                        resizable: isCropping,
                        overlayClassName: isCropping ? styles.stencilOverlayCropActive : styles.stencilOverlay,
                    }}
                    defaultSize={(image) => ({
                        width: image.imageSize.width,
                        height: image.imageSize.height
                    })}
                />
                {isImageLoading && (
                    <Flex h={'100%'} w={'100%'} justify={'center'} align={'center'} pos="absolute" top={0} left={0} bg="white">
                        <Loader />
                    </Flex>
                )}
            </Box>
        </Flex>
    );
});

export default ImageEditor;