import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconEdit,
    IconTableExport
} from "@tabler/icons";
import { IconEyeEdit, IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import DownloadService from "@/utils/download-service";
import ScDataPreview, { ScDataPreviewProps } from "@/PageComponents/Table/ScDataPreview";
import Link from "next/link";
import Helper from "@/utils/helper";
import * as Enums from '@/utils/enums';
import { ResultResponse, SignatureTemplate } from "@/interfaces/api/models";


const SignatureTemplatesTable: FC = () => {


    const onDataLoad = (data: ResultResponse<any>) => {
        if (!data) return;
        let dataAs = data.Results as SignatureTemplate[];

        dataAs.forEach(temp => {
            if (temp.SignatureType === Enums.SignatureType.Employee) {
                temp.UseQRCode = undefined;
            }
        })
    }

    const signatureTemplatesTableProps = useMemo<ScTableProps>(() => (
        {
            staticColumnMapping: [
                {
                    ColumnName: 'Name',
                    Label: 'Name',
                    ID: 'signtempName',
                    CellType: 'link',
                    Sortable: false,
                    MetaData: JSON.stringify({
                        href: '/settings/signaturetemplate/',
                        slug: 'ID'
                    }),
                    IsRequired: true
                },
                // {
                //     ColumnName: 'Module',
                //     Label: 'Module',
                //     CellType: 'status',
                //     ID: 'signtempModule',
                //     MetaData: JSON.stringify({
                //         mappingValues: Enums.Module,
                //     })
                // },
                {
                    ColumnName: 'SignatureType',
                    Label: "Signature Type",
                    CellType: 'status',
                    ID: 'signtempSignatureType',
                    MetaData: JSON.stringify({
                        mappingValues: Enums.SignatureType
                    })
                },
                {
                    ColumnName: 'UseQRCode',
                    Label: "QR Code",
                    CellType: "iconnull",
                    ID: 'signtempUseQRCode',
                },
                {
                    ColumnName: 'AllowResign',
                    Label: "Resignable",
                    CellType: "icon",
                    ID: 'signtempAllowResign',
                },
                {
                    ColumnName: 'HideSignature',
                    Label: "Hide Signature",
                    CellType: "icon",
                    ID: 'signtempHideSignature',
                }
            ],
            tableDataEndpoint: '/Signature/SearchTemplates',
            tableName: 'signatureTemplates',
            tableNoun: 'Signature Template',
            tableAltMultipleNoun: 'Signature Template',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'ModuleList',
                        hardcodedOptions: Object.entries(Enums.Module)
                            .map(
                                ([l, v]) => ({
                                    label: Enums.getEnumStringValue(Enums.Module, v, true) || '',
                                    value: l
                                })
                            ).sort((a, b) => a.label < b.label ? -1 : 1),
                        label: 'Module',
                    },
                    {
                        filterName: 'SignatureTypeList',
                        hardcodedOptions: Object.entries(Enums.SignatureType)
                            .map(
                                ([l, v]) => ({
                                    label: Enums.getEnumStringValue(Enums.SignatureType, v, true) || '',
                                    value: l
                                })
                            ).sort((a, b) => a.label < b.label ? -1 : 1),
                        label: 'Signature Type',
                    }
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Signature Template',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',
            tableDataOnLoad: (data) => {
                onDataLoad(data);
            }
        }
    ), [])

    const router = useRouter()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({});

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/settings/signaturetemplate/' + item.ID)
        }
    }, [])

    const [refreshToggle, setRefreshToggle] = useState(false)

    return (
        <>
            <ScTable
                {...signatureTemplatesTableProps}
                actionStates={actionStates}
                onAction={onAction}
                forceDataRefreshFlipFlop={refreshToggle}
            >

                <Link href={'/settings/signaturetemplate/create'} onClick={() => Helper.nextLinkClicked('/settings/signaturetemplate/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add Signature Template
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default SignatureTemplatesTable