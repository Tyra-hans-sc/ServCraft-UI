import React, { useState, useEffect, useRef } from 'react';
import { ExternalDropZone, Upload } from "@progress/kendo-react-upload";
import * as Enums from '../../../utils/enums';
import FileService from '../../../services/file-service';
import ConfirmAction from '../../modals/confirm-action';
import Helper from '../../../utils/helper';
import { Dropzone} from '@mantine/dropzone';
import { Group, Image, SimpleGrid, Text, useMantineTheme } from '@mantine/core';
import { IconUpload, IconX } from '@tabler/icons';

const useLegacy = false;

function SCUploadDropzone({ hint, note, multiple = false, fileType, onChange, dropzoneOverlaySrc, onDelete, uploading = false }) {
    const theme = useMantineTheme();

    const uploadRef = useRef();

    const containerRef = useRef();
    const dropzoneRef = useRef();

    const hintContent = <span>{hint}</span>;

    const noteContent = <span>{note}</span>;


    const [style, setStyle] = useState({ backgroundColor: "white" });

    const [uploadRestrictions, setUploadRestrictions] = useState([]);

    const [files, setFiles] = useState([]);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

    const onAdd = (event) => {
        setFiles(event.newState);
    };

    const onRemove = (event) => {
        setFiles(event.newState);
    };

    const onBeforeUpload = (event) => {
        onChange(event);
    };

    const deleteFile = () => {
        if (onDelete) {
            setConfirmOptions({
                ...Helper.initialiseConfirmOptions(),
                display: true,
                heading: "Delete Logo",
                text: "Confirm that you want to delete the logo for this store? It will default to your company logo.",
                confirmButtonText: "Delete Logo",
                onConfirm: onDelete
            });
        }
    }


    useEffect(() => {
        if (fileType === Enums.FileType.Image) {
            setUploadRestrictions(FileService.imageExtensions());
        }
    }, []);

    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return (
            <Image
                key={index}
                src={imageUrl}
                imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
            />
        );
    });

    return (
        <div className="sc-upload-container" ref={containerRef}>

            {useLegacy ? <>

                {!dropzoneOverlaySrc ?
                    <ExternalDropZone
                        uploadRef={uploadRef}
                        customHint={hintContent}
                        customNote={noteContent}
                        style={style}
                    /> : ''
                }

                {dropzoneOverlaySrc ?
                    <div className="sc-upload-overlay">
                        <img src={dropzoneOverlaySrc} />
                        {onDelete ? <img src="/icons/x.svg" className="delete-icon" onClick={deleteFile} /> : ""}
                    </div>
                    : ''}

                <div className="sc-upload-dropzone" ref={dropzoneRef}>
                    <Upload
                        ref={uploadRef}
                        batch={false}
                        multiple={multiple}
                        defaultFiles={[]}
                        restrictions={{
                            allowedExtensions: uploadRestrictions
                        }}
                        withCredentials={false}
                        autoUpload={false}
                        files={files}
                        onAdd={onAdd}
                        onRemove={onRemove}
                        onBeforeUpload={onBeforeUpload}
                    />
                </div>

            </> : <>



                <Dropzone
                    onDrop={(files) => {
                        console.log('accepted files', files);
                        setFiles(files);
                        onChange({ target: { files } });
                    }}
                    onReject={(files) => console.log('rejected files', files)}
                    // maxSize={3 * 1024 ** 2}
                    accept={uploadRestrictions}
                    multiple={multiple}
                    style={{
                        border: '3px dashed #CCD8F6',
                        borderRadius: '6px'
                    }}
                    loading={uploading}
                >
                    <Group position="center" gap="xl" style={{ minHeight: 100, pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload
                                size={50}
                                stroke={1.5}
                                color={theme.colors[theme.primaryColor][6]}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                size={50}
                                stroke={1.5}
                                color={theme.colors.red[6]}
                            />
                        </Dropzone.Reject>
                        {/* <Dropzone.Idle>
                            <IconPhoto size={50} stroke={1.5} />
                        </Dropzone.Idle> */}

                        <Text size="xl" inline c={'scBlue'} my={50} mx={'auto'}>
                            + Drag & Drop or Select Files
                        </Text>
                        {/*<div>
                            <Text size="xl" inline style={`
                            color: #003ED0;
                            `}>
                                + Drag & Drop or Select Files
                            </Text>

                        </div>*/}
                    </Group>
                </Dropzone>

                {dropzoneOverlaySrc && previews.length === 0 ?
                    <div className="sc-upload-overlay">
                        <img src={dropzoneOverlaySrc} />
                        {onDelete ? <img src="/icons/x.svg" className="delete-icon" onClick={deleteFile} /> : ""}
                    </div>
                    : ''}

                <SimpleGrid
                    cols={1}
                    mt={previews.length > 0 ? 'var(--mantine-spacing-xl)' : 0}
                >
                    {previews}
                </SimpleGrid>
            </>}

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

            <style jsx>{`
                .sc-upload-container {
                    width: 360px;
                    position: relative;
                }
                .sc-upload-dropzone {
                    
                }

                .sc-upload-overlay {
                   
                }

                .sc-upload-overlay img {
                    height: auto;
                    width: 360px;
                }

                .delete-icon {
                    height: 1rem !important;
                    width: 1rem !important;
                    cursor: pointer;
                    position: absolute;
                    right: 0;
                    top: 0;
                    background: #ffffffaa;
                }
            `}</style>
        </div>
    )
}

export default SCUploadDropzone;
