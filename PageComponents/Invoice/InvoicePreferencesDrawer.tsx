import {FC, useEffect, useMemo, useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import * as Enums from "@/utils/enums"
import UserConfigService from "@/services/option/user-config-service";
import SCModal from "../Modal/SCModal";
import {ColumnMappingData} from "@/PageComponents/Table/table-model";
import ScActiveColumns from "@/PageComponents/Table/Table Columns/ScActiveColumns";
import {Alert, Drawer, Flex, Title} from "@mantine/core";
import {SimpleColumnMapping} from "@/PageComponents/SimpleTable/SimpleTable";
import {useDebouncedValue, useDidUpdate} from "@mantine/hooks";
import {
    IconAdjustmentsStar,
} from "@tabler/icons-react";
import {IconCheckbox, IconInfoCircle} from "@tabler/icons";
import ScSwitch from "@/components/sc-controls/form-controls/sc-switch";

const COL_MAPPING_NAME = 'columns'
const LS_COL_MAPPING_NAME = 'invoice-doc'

const getLsColumnMapping: (tableName: string) => ColumnMappingData[] | undefined = (tableName) => {
    try {
        const ls = localStorage.getItem(tableName + '-columns-')
        return ls && JSON.parse(ls) || undefined
    } catch (e) {
        return undefined
    }
}

const setLsColumnMapping = (tableName: string, columnMapping: ColumnMappingData[]) => {
    localStorage && localStorage.setItem(tableName + '-columns-', JSON.stringify(columnMapping))
}

const InvoicePreferencesDrawer: FC<{
        open: boolean;
        onClose: () => void;
        onUserConfigLoaded?: (userAuthConfig) => void;
        onUserColumnConfigLoaded?: (columnMapping: ColumnMappingData[]) => void;
        columnMappingModelName?: string;
        mapping: SimpleColumnMapping[]
    }> = ({open, onClose, ...props}) => {


    const [userConfig, setUserConfig] = useState<any>()
    const [userConfigModified, setUserConfigModified] = useState(false)
    const [metaDataColumnMapping, setMetaDataColumnMapping] = useState<ColumnMappingData[]>(
        getLsColumnMapping(LS_COL_MAPPING_NAME) ?? []
    )
    useEffect(() => {
        if (metaDataColumnMapping) {
            setLsColumnMapping(LS_COL_MAPPING_NAME, metaDataColumnMapping)
            props.onUserColumnConfigLoaded && props.onUserColumnConfigLoaded(metaDataColumnMapping)
        }
        console.log('metadata column mapping', metaDataColumnMapping)
    }, [metaDataColumnMapping]);

    const usingInclusivePrice = useMemo(() =>
            metaDataColumnMapping.some(x => x.ColumnName === 'UnitPriceInclusive' && x.Show === true),
        [metaDataColumnMapping]
    )

    const handleUsingInclusivePriceChange = (useInclusivePrice) => {
        const newColumnMapping = metaDataColumnMapping.map(
            x => (
                x.ColumnName === 'UnitPriceInclusive' ? {
                        ...x,
                        Show: useInclusivePrice,
                    } :
                    x.ColumnName === 'UnitPriceExclusive' ? {
                            ...x,
                            Show: !useInclusivePrice,
                        } :
                        x
            )
        )

        handleColumnMappingChange(newColumnMapping, {key: useInclusivePrice ? 'UnitPriceInclusive' : 'UnitPriceExclusive', checked: true})
    }

    const handleNewReceivedColumnMapping = (newColumnMapping: ColumnMappingData[] | null) => {
        console.log('new column mapping', newColumnMapping, props.mapping)

        const columnMapping = props.mapping.map((x, i) => {


            const colMappingData = newColumnMapping?.find(y => y.ID === x.key)
            return (
                colMappingData ? {
                        ...colMappingData,
                        Sortable: !!x.columConfigOptions?.allowReorder, // ensures stored props can be overwritten safely if local config changes
                        IsRequired: !x.columConfigOptions?.allowShowToggle, // ensures stored props can be overwritten safely if local config changes
                        Label: x.label as string || colMappingData.Label,
                        Order: i, // force order as reordering is disabled on quote sections
                        Disabled: x.columConfigOptions?.disabled,
                        Show: x.columConfigOptions?.defaultShown === true && (!x.columConfigOptions?.allowShowToggle || x.columConfigOptions?.disabled) ? true : colMappingData.Show,
                    } :
                    {
                        Show: x.columConfigOptions?.defaultShown ?? true,
                        Sortable: !!x.columConfigOptions?.allowReorder,
                        ID: x.key,
                        Label: typeof x.label === 'string' ? x.label : '!!invalid-label-type!!',
                        ColumnName: x.key,
                        IsRequired: !x.columConfigOptions?.allowShowToggle,
                        Disabled: x.columConfigOptions?.disabled,
                        Order: i
                    })
        })
        setMetaDataColumnMapping(columnMapping)
    }

   useQuery(['authConfig', Enums.ConfigurationSection.Invoice], () => UserConfigService.getSettings(Enums.ConfigurationSection.Invoice, Enums.ConfigurationType.CRUD),
        {
        onSuccess: (userConfig) => {
            props.onUserConfigLoaded && props.onUserConfigLoaded(userConfig)
            setUserConfig(userConfig)

            // console.log('user config loaded', userConfig)
            handleNewReceivedColumnMapping(UserConfigService.getMetaDataValue(userConfig, COL_MAPPING_NAME))
        },
        onError: console.error
    })

    const authConfigMutation = useMutation(['invoiceDocAutConfig'], UserConfigService.saveConfig)

    const [debouncedUserConfig] = useDebouncedValue(userConfig, 600)

    useDidUpdate(() => {
        if (userConfigModified) {
            setUserConfigModified(false)
            debouncedUserConfig && authConfigMutation.mutate(debouncedUserConfig)
        }
    }, [debouncedUserConfig])

    const handleAuthConfigChange = (newConfig: any) => {
        setUserConfig(newConfig)
        props.onUserConfigLoaded && props.onUserConfigLoaded(newConfig)
        setUserConfigModified(true)
    }

    const handleColumnMappingChange = (cm: ColumnMappingData[], itemChanged?: {key: string, checked: boolean}) => {
        let newColMapping = [...cm]
        if(
            (itemChanged?.key === 'UnitCostPrice' || itemChanged?.key === 'UnitPriceExclusive' || itemChanged?.key === 'UnitPriceInclusive') && !itemChanged?.checked
        ) {
            newColMapping = newColMapping.map(x =>
                (x.ColumnName === 'UnitPriceMarkup') && x.Show ? {...x, Show: false} : x
            )
        } else if (itemChanged?.key === 'UnitPriceMarkup' && itemChanged?.checked) {
            const inclusiveShown = newColMapping.find(x => x.ColumnName === 'UnitPriceInclusive')?.Show
            newColMapping = newColMapping.map(x =>
                (x.ColumnName === 'UnitCostPrice') ? {...x, Show: true} :
                    (x.ColumnName === 'UnitPriceExclusive') ? {...x, Show: !inclusiveShown} :
                    (x.ColumnName === 'UnitPriceInclusive') ? {...x, Show: inclusiveShown} : x
            )
        }

        setMetaDataColumnMapping(newColMapping)
        if(userConfig) {
            props.onUserColumnConfigLoaded && props.onUserColumnConfigLoaded(newColMapping)
            handleAuthConfigChange({
                ...userConfig,
                MetaData: JSON.stringify({
                    ...(JSON.parse(userConfig.MetaData)),
                    [COL_MAPPING_NAME]: newColMapping
                })
            })
        } else {
            console.error('user config not loaded')
        }
    }


    return <>
        <Drawer
            opened={open}
            onClose={onClose}
            position={'right'}
            title={
                <Title order={4} c={'scBlue.9'}>
                    <Flex align={'center'} gap={5}>
                        <IconAdjustmentsStar size={20}/>
                        My Invoice Preferences
                    </Flex>
                </Title>
            }
            overlayProps={{
                color: 'var(--mantine-color-scBlue-5)',
                blur: 10,
                opacity: .15
            }}
            // size={'xs'}
        >

            {
                metaDataColumnMapping && <>
                    <Title order={5} c={'scBlue.9'}>
                        <Flex align={'center'} gap={5}>
                            <IconCheckbox size={20}/>
                            Displayed Columns
                        </Flex>
                    </Title>
                    <ScActiveColumns
                        columnMapping={metaDataColumnMapping}
                        onChange={handleColumnMappingChange}
                        hideRequired
                    />

                <ScSwitch
                    label={'Use Inclusive Pricing'}
                    checked={usingInclusivePrice}
                    onToggle={(checked) => handleUsingInclusivePriceChange(checked)}
                />
                </>
            }
            <Alert
                mt={'md'}
                variant={'light'}
                color={'teal'}
                icon={<IconInfoCircle />}
                // title={`Quote Columns`}
            >
                Updates won&apos;t affect the Invoice PDF.
            </Alert>
        </Drawer>
    </>
}

export default InvoicePreferencesDrawer