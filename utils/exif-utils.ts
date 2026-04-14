/**
 * EXIF Utility Module
 * 
 * Provides functions to extract, preserve, and re-inject EXIF metadata
 * when performing image manipulations like rotate and crop.
 * 
 * Uses piexifjs library for EXIF manipulation.
 */

import piexif from 'piexifjs';

// Type for EXIF object from piexifjs
type PiexifObject = ReturnType<typeof piexif.load>;

export interface ExifData {
    raw: PiexifObject;
    orientation?: number;
}

/**
 * Extracts EXIF data from a base64 image string or data URL
 * @param dataUrl - The image as a data URL (e.g., "data:image/jpeg;base64,...")
 * @returns The EXIF data object or null if extraction fails
 */
export const extractExifData = (dataUrl: string): ExifData | null => {
    try {
        // Only JPEG images contain EXIF data
        if (!dataUrl.includes('image/jpeg') && !dataUrl.includes('image/jpg')) {
            return null;
        }
        
        const exifObj = piexif.load(dataUrl);
        
        return {
            raw: exifObj,
            orientation: exifObj?.['0th']?.[piexif.ImageIFD.Orientation] ?? undefined,
        };
    } catch (error) {
        console.warn('Failed to extract EXIF data:', error);
        return null;
    }
};

/**
 * Injects EXIF data into a base64 image string
 * @param dataUrl - The image as a data URL
 * @param exifData - The EXIF data to inject
 * @returns The image data URL with EXIF data, or original if injection fails
 */
export const injectExifData = (dataUrl: string, exifData: ExifData | null): string => {
    if (!exifData?.raw) {
        return dataUrl;
    }
    
    try {
        // Only inject into JPEG images
        if (!dataUrl.includes('image/jpeg') && !dataUrl.includes('image/jpg')) {
            return dataUrl;
        }
        
        const exifBytes = piexif.dump(exifData.raw);
        return piexif.insert(exifBytes, dataUrl);
    } catch (error) {
        console.warn('Failed to inject EXIF data:', error);
        return dataUrl;
    }
};

/**
 * Updates the orientation tag in EXIF data after rotation
 * @param exifData - The original EXIF data
 * @param rotationDegrees - The rotation applied (90, 180, 270, etc.)
 * @returns Updated EXIF data with corrected orientation
 */
export const updateExifOrientation = (
    exifData: ExifData | null, 
    rotationDegrees: number
): ExifData | null => {
    if (!exifData?.raw) {
        return exifData;
    }
    
    try {
        const updatedExif = { ...exifData, raw: { ...exifData.raw } };
        
        // Reset orientation to normal (1) since we've applied the transformation
        // The image is now correctly oriented, so we set orientation to "normal"
        if (updatedExif.raw['0th']) {
            updatedExif.raw['0th'] = { ...updatedExif.raw['0th'] };
            updatedExif.raw['0th'][piexif.ImageIFD.Orientation] = 1;
        }
        
        updatedExif.orientation = 1;
        
        return updatedExif;
    } catch (error) {
        console.warn('Failed to update EXIF orientation:', error);
        return exifData;
    }
};

/**
 * Fetches an image and returns it as a data URL
 * @param url - The image URL
 * @returns Promise resolving to the data URL
 */
export const fetchImageAsDataUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Preserves EXIF data through an image transformation
 * This is a convenience function that extracts EXIF from the original,
 * and returns a function to inject it into the transformed image.
 * 
 * @param originalDataUrl - The original image data URL
 * @returns Object with the extracted EXIF and a function to apply it
 */
export const createExifPreserver = (originalDataUrl: string) => {
    const exifData = extractExifData(originalDataUrl);
    
    return {
        exifData,
        /**
         * Applies the preserved EXIF data to a transformed image
         * @param transformedDataUrl - The transformed image data URL
         * @param wasRotated - Whether the image was rotated
         * @returns The transformed image with EXIF data preserved
         */
        applyToTransformed: (transformedDataUrl: string, wasRotated = false): string => {
            let finalExif = exifData;
            
            if (wasRotated && exifData) {
                finalExif = updateExifOrientation(exifData, 0);
            }
            
            return injectExifData(transformedDataUrl, finalExif);
        }
    };
};

// EXIF orientation values for 0°, 90° CW, 180°, 270° CW (non-flip variants only)
const EXIF_ROTATION_CYCLE = [1, 6, 3, 8];

/**
 * Computes the new EXIF orientation after applying N clockwise 90° rotations.
 * Returns -1 for unsupported orientations (flip variants: 2, 4, 5, 7).
 */
export function composeClockwiseRotation(orientation: number, rotations: number): number {
    const idx = EXIF_ROTATION_CYCLE.indexOf(orientation);
    if (idx === -1) return -1;
    return EXIF_ROTATION_CYCLE[(idx + rotations) % 4];
}

/**
 * Sets the EXIF orientation tag in a JPEG data URL without re-encoding the image.
 * Creates EXIF data if the image has none.
 */
export function setJpegOrientation(dataUrl: string, orientation: number): string {
    try {
        let exifObj: PiexifObject;
        try {
            exifObj = piexif.load(dataUrl);
        } catch {
            exifObj = { '0th': {}, '1st': {}, Exif: {}, GPS: {}, Interop: {}, thumbnail: null };
        }
        if (!exifObj['0th']) exifObj['0th'] = {};
        exifObj['0th'][piexif.ImageIFD.Orientation] = orientation;
        const exifBytes = piexif.dump(exifObj);
        return piexif.insert(exifBytes, dataUrl);
    } catch {
        return dataUrl;
    }
}

export default {
    extractExifData,
    injectExifData,
    updateExifOrientation,
    fetchImageAsDataUrl,
    createExifPreserver,
    composeClockwiseRotation,
    setJpegOrientation,
};
