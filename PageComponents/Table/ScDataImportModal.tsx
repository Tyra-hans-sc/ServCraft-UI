import React, { FC, useContext, useState } from "react";
import SCModal from "@/PageComponents/Modal/SCModal";
import {Button, FileButton, Group, Loader, Title, Text, Box, Flex, Fieldset} from "@mantine/core";
import {IconDownload, IconExternalLink, IconFileDatabase, IconInfoCircle, IconUpload} from "@tabler/icons";
import DownloadService from "@/utils/download-service";
import Link from "next/link";
import Storage from "@/utils/storage";
import * as Enums from "@/utils/enums";
import { getApiHost } from "@/utils/auth";
import Helper from "@/utils/helper";
import constants from "@/utils/constants";
import BusyIndicatorContext from "@/utils/busy-indicator-context";
import ToastContext from "@/utils/toast-context";
import PS from '../../services/permission/permission-service';


const ScDataImportModal: FC<{
    open: boolean;
    onClose: () => void;
    tableNoun: string;
    tableAltMultipleNoun?: string;
    importType: number;
}> = (props) => {

    const [downloading, setDownloading] = useState(false)
    const [downloadingWithData, setDownloadingWithData] = useState(false);

    async function downloadFile() {
        if (!downloading) {
            setDownloading(true);
            await DownloadService.downloadFile('GET', `/Import?importType=${props.importType}`, null, false, false, "", "", null, false, (() => {
                setDownloading(false);
            }) as any);
        }
    }

    async function downloadFileWithData() {
        if (!downloadingWithData) {
            setDownloadingWithData(true);
            await DownloadService.downloadFile('GET', `/Import/DownloadTemplateWithData/?importType=${props.importType}`, null, false, false, "", "", null, false, (() => {
                setDownloadingWithData(false);
            }) as any);
        }
    }


    const [file, setFile] = useState<File | null>(null);
    // console.log('file', file)

    const [uploading, setUploading] = useState(false);
    const busyIndicator = useContext<any>(BusyIndicatorContext);
    const toast = useContext<any>(ToastContext);

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const ImportTypesWithData = [
        Enums.ImportType.Asset,
        Enums.ImportType.Customer,
        Enums.ImportType.Inventory,
        Enums.ImportType.CustomerContact
    ];

    const onSubmit = () => {

        setUploading(true);
        busyIndicator.setText("Uploading...");

        if (file && !uploading) {

            const token = Storage.getCookie(Enums.Cookie.token);
            const deviceid = Storage.getCookie(Enums.Cookie.fingerPrint);

            let reader = new FileReader();

            const apiHost = getApiHost();

            reader.onloadend = async function () {
                // Remove Data URI from B64 String
                const b64 = (reader.result as string)?.replace(/^data:.+;base64,/, '');
                const res = await fetch(apiHost + '/Import', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'deviceid': deviceid,
                        'tenantid': Storage.getCookie(Enums.Cookie.tenantID)
                    },
                    body: JSON.stringify({
                        FileName: file.name,
                        FileBase64: b64,
                        ImportType: props.importType,
                    })
                });

                if (res.status == 200) {
                    toast.setToast({
                        message: 'Import successfully uploaded for processing',
                        show: true,
                        type: 'success'
                    });
                    Helper.mixpanelTrack(constants.mixPanelEvents.createImport, {
                        importType: props.importType
                    } as any);
                    props.onClose();
                    setFile(null)
                    setUploading(false);
                } else {
                    toast.setToast({
                        message: 'Import failed',
                        show: true,
                        type: Enums.ToastType.error,
                    });
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } else {
            toast.setToast({
                message: 'Please choose a file to import',
                show: true,
                type: 'error'
            });
            setUploading(false);
            setFile(null)
        }
        busyIndicator.setText(null);
    }


    return <>
        <SCModal
            size={'md'}
            onClose={props.onClose}
            open={props.open}
        >
            <Title order={3} c={'scBlue'}>Import {props.tableAltMultipleNoun ?? props.tableNoun + 's'}</Title>
            <Button color={'scBlue'} w={'100%'} mt={'var(--mantine-spacing-xl)'} onClick={downloadFile} rightSection={downloading ? <Loader size={16} color={'blue.0'} /> : <IconDownload size={18} />}>
                Download Blank Template
            </Button>
            {ImportTypesWithData.includes(props.importType) && exportPermission && (
                <>
                    <Flex my={3} justify={'center'}>
                        <Text size={'sm'}>OR</Text>
                    </Flex>
                    <Button
                        variant={'gradient'}
                        color={'scBlue'}
                        w={'100%'}
                        onClick={downloadFileWithData}
                        rightSection={downloadingWithData ? <Loader size={16} color={'blue.0'} /> : <IconDownload size={18} />}
                    >
                        Download Template With Existing Data
                    </Button>
                </>
            )}
            <>
                <Fieldset
                    legend="Then"
                    w={'100%'}
                    mt={'xl'}
                    pb={'xs'}
                    disabled={uploading}
                    px={0}
                    styles={{
                        legend: {
                            textAlign: 'center',
                            margin: 'auto'
                        },
                        root: {
                            paddingTop: 2,
                            borderLeft: 'none',
                            borderRight: 'none',
                            borderBottom: 'none',
                            borderRadius: 0
                        }
                    }}
                >
                    <FileButton onChange={setFile} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
                        {(props) => <Button
                            {...props}
                            color={'scBlue'}
                            w={'100%'}
                            mt={'sm'}
                            rightSection={<IconFileDatabase size={16} />}
                        >
                            Select Your Import File
                        </Button>}
                    </FileButton>
                </Fieldset>
                {
                    !!file &&
                    <Text>
                        {file.name}
                    </Text>
                }

                {/*<ul>
                    {files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                    ))}
                </ul>*/}
            </>

            <Text size={'sm'} c={'dimmed'}>
                <Flex align={'center'} gap={5}>
                    <IconInfoCircle size={16}  /> <strong> How to use the template:</strong>
                </Flex>
                <ol style={{ paddingLeft: '1rem' }}>
                    <li>
                        Start by downloading the template with, or without, pre-existing data (if you haven&apos;t already).
                    </li>
                    <li>
                        Open the downloaded template on your device and add the items you wish to import.
                    </li>
                    <li>
                        Click &apos;Select Your Import File&apos; and choose your updated import template.
                    </li>
                    <li>
                        We will take care of the rest ; )
                    </li>
                </ol>
                <strong>Note:</strong>
                <br />
                - The file must be a .xlsx or .xls file.
                <br />
                - The file must be in the same format as the template.
            </Text>

            <Link href={'/settings/import/list'}>
                <Button color={'scBlue'} variant={'outline'} w={'100%'} mt={'sm'} rightSection={<IconExternalLink size={18} />}>
                    Navigate to Imports
                </Button>
            </Link>


            <Group mt={'var(--mantine-spacing-xl)'} justify={'right'} gap={15}>
                <Button variant={'subtle'} color={'gray.9'} onClick={props.onClose}>
                    Close
                </Button>
                <Button
                    color={'scBlue'}
                    rightSection={uploading ? <Loader size={16} color={'blue.0'} /> : <IconUpload size={18} />}
                    disabled={!file || uploading}
                    onClick={onSubmit}
                >
                    Import
                </Button>
            </Group>
        </SCModal >
    </>
}

export default ScDataImportModal
