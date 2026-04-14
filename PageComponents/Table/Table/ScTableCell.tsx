import { FC, useMemo, useState } from "react";
import { ColumnMappingData, ColumnMappingMetaData } from "@/PageComponents/Table/table-model";
import { Anchor, Avatar, Flex, Group, HoverCard, Stack, Text, ThemeIcon } from "@mantine/core"
import ScStatusData from "@/PageComponents/Table/Table/ScStatusData";
import { formatDate } from "@/PageComponents/Table/table-helper";
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import ScTableLinkCell from "@/PageComponents/Table/Table/ScTableLinkCell";
import ScTableIconCell from "@/PageComponents/Table/Table/ScTableIconCell";
import Link from "next/link";
import WarrantyIndicator from "@/components/product/warranty-indicator";
import Helper from "@/utils/helper";
import DataAvatar from "@/PageComponents/Table/DataAvatar";
import * as Enums from '@/utils/enums';
import StockItemTypeIcon from "@/PageComponents/Inventory/StockItemTypeIcon";

const tableItemFontSize = 'sm'

const ScTableCell: FC<{ data: any; col: ColumnMappingData; currencySymbol: string, onAction?: (actionName: string, data: any) => void }> =
    (
        { data, col, currencySymbol, onAction }
    ) => {

        return useMemo(() => {
            switch (col?.CellType) {
                case ('status'): {
                    if (typeof data[col.ColumnName] === 'string') {
                        const colStatusColorIndex = data[col.ColumnName].includes(',') && data[col.ColumnName].lastIndexOf(',')
                        const colorKeyName = col.MetaData && (JSON.parse(col.MetaData) as ColumnMappingMetaData).displayColorKeyName
                        return <>
                            {
                                data[col.ColumnName] &&
                                <Flex>
                                    <ScStatusData
                                        key={data[col.ColumnName]?.ID}
                                        value={colStatusColorIndex ? data[col.ColumnName].substring(0, colStatusColorIndex) : data[col.ColumnName]}
                                        color={colStatusColorIndex && data[col.ColumnName].substring(colStatusColorIndex + 1).trim() || colorKeyName && data[colorKeyName] || ''}
                                    />
                                </Flex>
                            }
                        </>
                    } else if (typeof data[col.ColumnName] === 'number' && col.MetaData) {
                        const { mappingValues, colourMappingValues } = JSON.parse(col.MetaData) as ColumnMappingMetaData// enums with keyname as label and value as value - need the label

                        // get status value from enum mappingvalues
                        const mappingEntries = mappingValues && Object.entries(mappingValues)
                        const entry = mappingEntries?.find(x => x[1] === data[col.ColumnName])
                        const val = entry && entry[0]
                        // get possible status colour if provided by colourMappingValues
                        const colorEnumEntry = colourMappingValues && Object.entries(colourMappingValues)
                            .find(([, statusEnum]) => data[col.ColumnName] === statusEnum
                            )

                        return <ScStatusData
                            key={data[col.ColumnName]?.ID}
                            value={val || ''}
                            color={colorEnumEntry?.[0]}
                        />

                    } else {
                        return <></>
                    }

                }
                case ('jobstatus'): {
                    return <>
                        <Flex>
                            <ScStatusData
                                key={data[col.ColumnName]?.ID}
                                value={data[col.ColumnName].Description}
                                color={data[col.ColumnName].DisplayColor}
                            />
                        </Flex>
                    </>
                }
                case ('statusList'): {
                    if (col.MetaData) {
                        const { mappingValues, colourMappingValues, link, display, valueKey, docNumName, totalColumn, displayColorKeyName } = JSON.parse(col.MetaData) as ColumnMappingMetaData// enums with keyname as label and value as value - need the label
                        // get status value from enum mappingvalues
                        const mappingEntries = mappingValues && Object.entries(mappingValues)
                        // return <Avatar.Group spacing={'xs'}>
                        return <>
                            <Flex gap={4}>
                                {
                                    data[col.ColumnName].map(
                                        (opt, i) => {
                                            const entry = mappingEntries?.find(x => x[1] === opt[valueKey || ''])
                                            let val = entry && entry[0]
                                            if (!val && !!valueKey) {
                                                val = opt[valueKey];
                                            }
                                            // get possible status colour if provided by colourMappingValues
                                            const colorEnumEntry = colourMappingValues && Object.entries(colourMappingValues)
                                                .find(([, statusEnum]) => opt[valueKey || ''] === statusEnum);



                                            let currValue: string = "";
                                            if (!!totalColumn) {
                                                const totalValue = opt[totalColumn];
                                                currValue = +totalValue ? Helper.roundToTwo(totalValue).toFixed(2) : "0.00";
                                                let spacePos = currValue.indexOf('.');
                                                while (spacePos > 3) {
                                                    spacePos = spacePos - 3;
                                                    currValue = [currValue.slice(0, spacePos), ' ', currValue.slice(spacePos)].join('');
                                                }
                                                currValue = `${currencySymbol} ` + currValue;
                                            }

                                            return (
                                                <HoverCard
                                                    shadow="md"
                                                    withArrow
                                                    position={'top'}
                                                    key={(opt?.ID || data?.ID) + i + 'statusList'}
                                                >
                                                    <HoverCard.Target>

                                                        <div>
                                                            <ScStatusData
                                                                // key={opt?.ID + 'jIl'}
                                                                value={opt[display || '']}
                                                                color={colorEnumEntry?.[0] ?? opt[displayColorKeyName ?? ""]}
                                                            />
                                                        </div>
                                                    </HoverCard.Target>
                                                    <HoverCard.Dropdown>
                                                        <Group justify={'space-between'} mb={"xs"}>
                                                            <Text size={'xs'} c={'dimmed'} fw={600}>
                                                                {docNumName}:
                                                            </Text>

                                                            <ScTableLinkCell col={{
                                                                ColumnName: display ?? "",
                                                                Label: display ?? "",
                                                                ID: col.ID,
                                                                MetaData: JSON.stringify({
                                                                    triggerAction: "openitem",
                                                                    href: link?.href,
                                                                    slug: "ID"
                                                                })
                                                            }} data={opt} tableItemFontSize={tableItemFontSize}
                                                                onAction={(actionName) => {
                                                                    onAction && onAction(actionName, link?.href + opt[link?.slug || '']);
                                                                }}
                                                            />
                                                        </Group>
                                                        <Group justify={'space-between'} mb={"xs"}>
                                                            <Text size={'xs'} c={'dimmed'} fw={600}>
                                                                Status:
                                                            </Text>
                                                            <ScStatusData
                                                                key={opt?.ID || data?.ID + i + 'statusList'}
                                                                value={val || ''}
                                                                color={colorEnumEntry?.[0] ?? opt[displayColorKeyName ?? ""]}
                                                            />
                                                        </Group>
                                                        {totalColumn &&
                                                            <Group justify={'space-between'} mb={5}>
                                                                <Text size={'xs'} c={'dimmed'} fw={600}>
                                                                    Total:
                                                                </Text>
                                                                <Text
                                                                    size={tableItemFontSize}
                                                                    c={'gray.7'}
                                                                    lineClamp={1}
                                                                    style={{ wordBreak: 'break-all' }}
                                                                >
                                                                    {currValue}
                                                                </Text>
                                                            </Group>
                                                        }
                                                    </HoverCard.Dropdown>
                                                </HoverCard>
                                            )
                                        }
                                    )
                                }
                            </Flex>




                        </>

                    }
                }
                case ('icon'): {
                    return <ScTableIconCell col={col} data={data} />
                }
                case ('iconnull'): {
                    return <ScTableIconCell col={col} data={data} emptyState={"N/A"} />
                }
                /** column mapping config specifies EmployeeList for some tenants and EmployeeName for others - meta data is used to provide different keyname for array for name + color*/
                case ('employee'): {
                    // const names = data[col.ColumnName].trim().split(' ');
                    /** employee object is an array **/
                    const meta = col.MetaData ? JSON.parse(col.MetaData) as ColumnMappingMetaData : null
                    if (Array.isArray(data[col?.ColumnName])) {
                        return <Group
                            miw={80}
                            align={'center'}
                            justify={'left'}
                            gap={3}
                        >
                            {
                                data[col?.ColumnName].map(
                                    (x, i) => <EmployeeAvatar name={x.FullName} color={x.DisplayColor}
                                        key={data?.ID + 'empCell' + i + x.FullName}
                                    />
                                )
                            }
                        </Group>

                        /** employee object is an object **/
                    } else if (data[col?.ColumnName] && typeof data[col?.ColumnName] === 'object' && !data[col?.ColumnName].hasOwnProperty('length')) {
                        return <Group
                            miw={80}
                            align={'center'}
                            justify={'left'}
                            gap={3}
                        >
                            <EmployeeAvatar
                                name={data[col?.ColumnName].FullName}
                                color={data[col?.ColumnName].DisplayColor}
                                key={data?.ID + 'empCell'}
                            />


                        </Group>

                        /** alternative array to use is defined in metadata **/
                    } else if (meta?.multipleItems && data[meta.multipleItems.keyName]) {
                        return <Group
                            miw={80}
                            align={'center'}
                            justify={'left'}
                            gap={3}
                        >
                            {
                                data[meta.multipleItems.keyName].hasOwnProperty('length') && data[meta.multipleItems.keyName].map(
                                    (x, k) => {
                                        const display = x[meta!.multipleItems!.itemLabelKey]
                                        const color = x[meta!.multipleItems!.colorName || ''] || ''
                                        return <EmployeeAvatar name={display} color={color}
                                            key={data[col.ColumnName] + k + display} />
                                    }
                                ) || typeof data[meta.multipleItems.keyName] === 'object' && <>
                                    <EmployeeAvatar name={data[meta.multipleItems.keyName]?.[meta.multipleItems.itemLabelKey] || ''}
                                        color={data[meta.multipleItems.keyName]?.[meta.multipleItems.colorName || 'DisplayColor']}
                                    />
                                </>
                            }
                        </Group>
                    } else if (
                        meta?.displayColorKeyName
                    ) {
                        return <>
                            <Flex gap={7} align={'center'}>
                                <EmployeeAvatar
                                    name={data[col?.ColumnName]}
                                    color={data[meta.displayColorKeyName]}
                                />
                                {meta?.href && meta?.slug &&
                                    <ScTableLinkCell
                                        col={col}
                                        data={data}
                                        tableItemFontSize={tableItemFontSize}
                                        onAction={(actionName) => onAction && onAction(actionName, data)}
                                    />
                                }
                            </Flex>
                        </>
                    }
                    /** default **/
                    return <>
                        <Text size={tableItemFontSize} c={'dimmed'} lineClamp={1}>
                            {data[col?.ColumnName]}
                        </Text>
                    </>
                }
                case ('initials'): {
                    // const names = data[col.ColumnName].trim().split(' ');
                    return <Flex
                        // miw={250}
                        align={'center'}
                        gap={5}
                    >
                        <EmployeeAvatar name={data[col?.ColumnName]} />
                        <Text size={tableItemFontSize} c={'dimmed'} lineClamp={1}>
                            {data[col?.ColumnName]}
                        </Text>
                    </Flex>
                }
                case ('check'): case ('link'): {
                    return <ScTableLinkCell col={col} data={data} tableItemFontSize={tableItemFontSize}
                        onAction={(actionName) => onAction && onAction(actionName, data)}
                    />
                }
                case ('index'): {
                    const link = col.MetaData && JSON.parse(col.MetaData)
                    return (
                        <Link href={link?.href + data[link?.slug]} style={{ textDecoration: "none" }} >
                            <Anchor
                                size={tableItemFontSize} underline={'never'} c={'scBlue'} fw={'bolder'} lineClamp={1}
                            >
                                Open
                            </Anchor>
                        </Link>)
                }
                case ('bold'): {
                    return <>
                        <Text size={tableItemFontSize} c={'gray.7'} fw={'bolder'} lineClamp={1}>
                            {data[col?.ColumnName]}
                        </Text>
                    </>
                }
                case ('date'): {
                    return <Text size={tableItemFontSize} c={'gray.7'} lineClamp={1}>
                        {formatDate(data[col?.ColumnName])} {/*{Time.getTime(data[col.ColumnName])}*/}
                    </Text>
                }
                case ('currency'): {

                    const value = data[col?.ColumnName]

                    let currValue = +value ? Helper.roundToTwo(value).toFixed(2) : "0.00";
                    let spacePos = currValue.indexOf('.');
                    while (spacePos > 3) {
                        spacePos = spacePos - 3;
                        currValue = [currValue.slice(0, spacePos), ' ', currValue.slice(spacePos)].join('');
                    }
                    currValue = `${currencySymbol} ` + currValue;

                    return <Text
                        size={tableItemFontSize}
                        c={'gray.7'}
                        lineClamp={1}
                        style={{ wordBreak: 'break-all' }}
                    >
                        {currValue}
                    </Text>
                }
                case ('warranty'): {
                    return <WarrantyIndicator
                        warrantyPeriod={data.WarrantyPeriod}
                        purchaseDate={data.PurchaseDate}
                    />
                }
                case ('warrantyperiod'): {
                    const value = data?.[col?.ColumnName || ''];
                    const displayValue = value != null ? `${value} months` : '';

                    return (
                        <Text
                            size={tableItemFontSize}
                            c={'gray.7'}
                            lineClamp={1}
                            style={{ wordBreak: 'break-all' }}
                        >
                            {displayValue}
                        </Text>
                    );
                }
                case ('stockItemType'): {
                    const enumVal = typeof data?.[col?.ColumnName] === 'string' ? Enums.StockItemType[data?.[col?.ColumnName]] : data?.[col?.ColumnName];
                    const enumString = typeof data?.[col?.ColumnName] === 'string' ? data?.[col?.ColumnName] : Enums.getEnumStringValue(Enums.StockItemType, data?.[col?.ColumnName]);

                    return (
                        <Flex align={'center'} gap={5}>
                            <StockItemTypeIcon stockItemType={enumVal}></StockItemTypeIcon>
                            <Text
                                size={tableItemFontSize}
                                c={'gray.7'}
                                lineClamp={1}
                                style={{ wordBreak: 'break-all' }}
                            >

                                {enumString}
                            </Text>
                        </Flex>
                    );
                }
                default: {
                    return (
                        col.DisplayValueFunction ? col.DisplayValueFunction(data) :
                        <Text
                            size={tableItemFontSize}
                            c={'gray.7'}
                            lineClamp={1}
                            style={{ wordBreak: 'break-all' }}
                        >
                            {data?.[col?.ColumnName || '']}
                        </Text>
                    )
                }
            }
        }, [data, col, currencySymbol])
    }

export default ScTableCell

