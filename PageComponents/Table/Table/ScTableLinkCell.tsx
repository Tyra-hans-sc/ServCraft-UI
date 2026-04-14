import {FC, useMemo} from "react";
import {ActionIcon, Anchor, Text, Flex, Tooltip, MantineFontSize} from "@mantine/core";
import Link from "next/link";
import {IconClipboardCopy, IconExternalLink} from "@tabler/icons-react";
import {useClipboard} from "@mantine/hooks";
import {ColumnMappingData, ColumnMappingMetaData} from "@/PageComponents/Table/table-model";
import {IconClipboardCheck} from "@tabler/icons";
import styles from './ScTableCell.module.css';

const ScTableLinkCell: FC<{col: ColumnMappingData, data: any, tableItemFontSize?: any, onAction: (actionName: string) => void}> = (
    {col, data, tableItemFontSize = 13, onAction}
) => {

    const clipboard = useClipboard({ timeout: 800 })

    const link = useMemo(() => col.MetaData && JSON.parse(col.MetaData) as ColumnMappingMetaData, [col, data])

    const displayValue = useMemo(() => {
        if (typeof col.DisplayValueFunction !== 'undefined') return col.DisplayValueFunction(data) ?? data[col?.ColumnName] ?? 'Open';
        return data[col?.ColumnName] ?? 'Open';
    }, [data, col]);

    const anchor = useMemo( () =>
        <Anchor
            size={tableItemFontSize} underline={'never'} color={'scBlue'} fw={'bolder'} lineClamp={1}
            onClick={() => link && link.triggerAction && onAction(link.triggerAction)}
        >
            {displayValue}
        </Anchor>, [displayValue, tableItemFontSize, link, onAction]
    )

    return <>
        <Flex gap={5} align={'center'} justify={'start'}
              className={styles.linkCellContainer}
        >
            {
                link && link.triggerAction && link?.href && link?.slug &&
                <Flex gap={1} align={'center'} justify={'start'}>

                    <Tooltip label={'Open'} color={'scBlue'} openDelay={700} events={{ hover: true, focus: true, touch: true }}>
                        {link.drawerAction
                            ? <ActionIcon
                                mt={3}
                                size={'sm'}
                                variant={'transparent'}
                                className={styles.copyItem}
                                onClick={() => onAction(link.drawerAction!)}
                            >
                                <IconExternalLink />
                            </ActionIcon>
                            : <Link href={link?.href + data[link?.slug]} style={{textDecoration: "none"}}>
                                <ActionIcon
                                    mt={3}
                                    size={'sm'}
                                    variant={'transparent'}
                                    className={styles.copyItem}
                                >
                                    <IconExternalLink />
                                </ActionIcon>
                            </Link>
                        }
                    </Tooltip>

                </Flex>
            }
            {
                link && !link.triggerAction && link?.href && link?.slug ?
                <Link href={link?.href + data[link?.slug]} style={{textDecoration: "none"}} >
                    {anchor}
                </Link> : anchor
            }
            {
                data[col?.ColumnName] &&
                <Tooltip opened={clipboard.copied} label={'Copied!'} color={'scBlue'} events={{ hover: true, focus: true, touch: true }}>
                    <ActionIcon onClick={() => clipboard.copy(data[col?.ColumnName])} size={'xs'} variant={'transparent'}
                                className={styles.copyItem}
                                style={{opacity: !clipboard.copied ? 0 : 1}}
                    >
                        {
                            clipboard.copied &&
                            <IconClipboardCheck color={'#003ED0'} /> ||
                            <IconClipboardCopy color={'darkgrey'} />
                        }
                    </ActionIcon>
                </Tooltip>
            }
        </Flex>
    </>}

export default ScTableLinkCell
