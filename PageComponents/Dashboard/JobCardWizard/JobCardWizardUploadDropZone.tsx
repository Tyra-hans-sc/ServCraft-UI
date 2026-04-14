import { Flex, Box, Loader } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, FileRejection } from '@mantine/dropzone';
import styles from "./JobCardWizardUploadDropZone.module.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import React, { useState, useEffect } from 'react';
import { Text } from '@mantine/core';
import CompanyService from '@/services/company-service';
import FileService from '@/services/file-service';
import Image from 'next/image';

interface CompanyImageUploadComponentProps {
    newCompany?: any
    setNewCompany: (params: any) => void,
    multiple?: boolean
}

const JobCardWizardUploadDropZone = (props: CompanyImageUploadComponentProps) => {
    const maxFileSize = 3 * 1024 ** 2; // bytes can moved to constants
    const [uploadParams, setUploadParams] = useState<any | null>(null)
    const uploadRestrictions = FileService.imageExtensions().map(ext => `image/${ext}`);
    const [errors, setErrors] = useState<string[]>([])
    const [previewImageUrl, setPreviewImageUrl] = useState<null | string>(props.newCompany?.FileBase64 ? ('data:image/png;base64,' + props.newCompany?.FileBase64) : null)


    const { error: fetchCompanyError, data: company, isLoading, isFetched/*, refetch: refetchCompany*/ } = useQuery({
        queryKey: ['fetch company name'], //Should probably store this key globally
        queryFn: () => CompanyService.getCompany(),
    })

    const { isLoading: isUploading, error: uploadingError, mutate: uploadImageMutate } = useMutation({
        mutationKey: ['Update Company Logo'],//Should probably store this key globally
        mutationFn: CompanyService.saveCompany,
    })

    useEffect(() => {
        if (company) {
            setPreviewImageUrl(p => p || company.LogoUrl)
        }
    }, [company, isFetched])

    //handle errors http related errors
    useEffect(() => {
        if (fetchCompanyError) {
            setErrors([...errors, `Fetching company information.`])
        }
        if (uploadingError) {
            setErrors([...errors, `Uploading logo failed.`])
        }
    }, [fetchCompanyError, uploadingError])

    useEffect(() => {
        if (uploadParams && company) {
            // When setUploadingImageParams is set, we don't want to call the mutation directly, but instead use the setUploadImageParams callback to set the upload params.'
            props.setNewCompany && props.setNewCompany(uploadParams)
            // Mutate directly when props.setUploadImageParams is not provided
            !props.setNewCompany && uploadImageMutate(uploadParams)
        }
    }, [company, uploadParams, props.setNewCompany])

    const onRejectFile = (files: FileRejection[]) => {
        const file = files.length > 0 ? files[0] : null;
        const rejectionErrors: string[] = [];
        if (file) {
            file.errors.forEach((error) => {
                if (error.code === 'file-too-large')
                    rejectionErrors.push(`File is larger than ${maxFileSize / (1024 ** 2)} mb`)
                if (error.code === 'file-invalid-type')
                    rejectionErrors.push(`File type not supported`)
            })
        }
        setErrors(rejectionErrors)
    }

    const onLoadFile = (e) => {
        if (errors.length > 0)
            setErrors([])//clear errors
        let reader = new FileReader();
        let file = e.target.files[0];
        reader.onloadend = async function() {
            let readResultAsString = reader.result as string;
            let b64 = readResultAsString.replace(/^data:.+;base64,/, '');
            setUploadParams({ ...company, FileBase64: b64 });
        };
        reader.readAsDataURL(file);
        const imageUrl = URL.createObjectURL(file);
        setPreviewImageUrl(imageUrl)
    }

    const previewImage = () => {
        return <Flex className={styles.previewImageContainer} justify="center" align="center">
            <Image src={previewImageUrl || ''} alt={''} height={106} width={184}
                   style={{
                       objectFit: 'contain',
                   }}
            />
        </Flex>
    }

    return <>
        <Box className={`${styles.logoDropArea}  
            ${errors.length > 0 && styles.logoDropAreaWarning }`}>
            {isLoading || isUploading ?
                <Loader color={'scBlue'} size={22} /> :
                <Dropzone
                    onDrop={(files) => {
                        onLoadFile({ target: { files } });
                    }}
                    onReject={onRejectFile}
                    maxSize={maxFileSize}
                    accept={uploadRestrictions}
                    multiple={props.multiple}
                    maw={220}
                    mah={140}
                >

                    {
                        previewImageUrl ?
                            previewImage()
                            : <Flex className={styles.dropArea} justify="center" align="center"
                                style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <IconPhoto size={32} color="var(--mantine-color-scBlue-6)" stroke={1.8} />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconX size={32} color="var(--mantine-color-scBlue-6)" stroke={1.8} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconUpload size={32} color="var(--mantine-color-scBlue-6)" stroke={1.8} />
                                </Dropzone.Idle>
                            </Flex>
                    }
                </Dropzone>}
        </Box>
       {
            errors.map((error, index) =>
                <Text c={'#E03131'} key={index} size={'sm'} fw={600}>{error}</Text>)
        }
        <Text size={'sm'} c={'scBlue.6'} fw={600}>Upload your logo here</Text> 
    </>
}

export default JobCardWizardUploadDropZone;
