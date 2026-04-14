import React, { forwardRef, UIEvent } from 'react';
import Image from 'next/image';
import {
    CropperTransitions,
    CropperImage,
    CropperState,
    getBackgroundStyle
} from 'react-advanced-cropper'

interface DesiredCropperRef {
    getState: () => CropperState;
    getTransitions: () => CropperTransitions;
    getImage: () => CropperImage;
}

interface Props {
    className?: string;
    cropper: DesiredCropperRef;
    crossOrigin?: 'anonymous' | 'use-credentials' | boolean;
    brightness?: number;
    saturation?: number;
    hue?: number;
    contrast?: number;
}

export const CropperBackgroundImage = forwardRef<HTMLImageElement, Props>(
    ({ className, cropper, crossOrigin, brightness, saturation, hue, contrast }: Props, ref) => {
        const state = cropper.getState();
        const transitions = cropper.getTransitions();
        const image = cropper.getImage();
        const style = image && state ? getBackgroundStyle(image, state, transitions) : {};

        const src = image ? image.src : undefined;
        return src ? (
            <Image src={src} alt="Cropper Background"
                className={className}
                width={image.width} height={image.height}
                style={{
                    ...style,
                    filter: `brightness(${brightness}%) saturate(${saturation}%) hue-rotate(${hue}deg) contrast(${contrast}%)`
                }}
                crossOrigin={crossOrigin as any} ref={ref} />
        ) : null;
    },
);

CropperBackgroundImage.displayName = 'CropperBackgroundImage';
export default CropperBackgroundImage;