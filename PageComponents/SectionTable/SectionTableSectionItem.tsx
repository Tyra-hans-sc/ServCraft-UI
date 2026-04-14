import {Box, Flex} from "@mantine/core";
import {FC} from "react";
import {SimpleColumnMapping, SimpleData} from "@/PageComponents/SimpleTable/SimpleTable";
import styles from "./SectionTable.module.css";
import {TableAction, TableActionStates} from "@/PageComponents/Table/table-model";
import ScTableActionCell from "../Table/Table/ScTableActionCell";
import SimpleTableCell from "../SimpleTable/SimpleTableCell";
import {IconNewSection} from "@tabler/icons-react";

const SectionTableGroupRowWrapper: FC<{
    allowSections?: boolean
    data: SimpleData[]
    item: any
    group: {id: string, items: any[], isSection: boolean}
    index: number
    mapping: SimpleColumnMapping[]
    onItemClicked?: (item: any, column: string) => void
    onReorder?: (newItems: any[]) => void
    onReorderIndex?: (event, previousIndex, nextIndex) => void
    onAction?: (actionName: string, actionItem: any, actionItemIndex: number, group: any) => void
    canEdit?: boolean
    controls?: TableAction[]
    stylingProps?: {
        compact?: boolean
        rows?: boolean
        darkerText?: boolean
    }
    tableActionStates?: TableActionStates
    onInputChange?: (name: string, item: any, value: number | '') => void
    showControlsOnHover?: boolean
    tableItemInputMetadataByKeyName?: { [itemID: string]: { [itemValueKeyName: string]: { disabled: boolean; loading: boolean } }}
    onNewSection?: () => void
    lineClamp?: number
}> = (props) => {

    return (
        <>

            {
                props.mapping.map(
                    ({
                         key: itemKey, valueFunction, type, linkAction,
                         min, linkHrefFunction, colorKey, placeholderFunction, ...others
                     }, j) => {

                        const key = others.keyFunction ? others.keyFunction(props.item) : itemKey;
                        const color = others.colorFunction ? others.colorFunction(props.item) : colorKey && props.item[colorKey];

                        const shown = others.showFunction ? others.showFunction(props.item) : true;

                        const typeToCheck = others.typeFunction ? others.typeFunction(props.item) : type;

                        return (
                            <td key={'simp' + (props.item?.ID || props.item?.id) + 'row' + j + 'col'}
                                style={{maxWidth: '40vw'}}
                                // maw={'40vw' /* || type === 'numberInput' || linkAction || linkHrefFunction ? 'max-content'*/}
                            >
                                <Box
                                    // w={'max-content'}
                                    w={typeToCheck === "textArea" || typeToCheck === "textInput" ? "100%" : "max-content"}
                                    // w={type !== 'textInput' && 'max-content' || '100%'}
                                    maw={'100%'}
                                    miw={others.stylingProps?.miw}
                                    style={{cursor: props.onItemClicked && type === 'status' ? 'pointer' : 'default'}}
                                    onClick={() => props.onItemClicked && props.onItemClicked(props.item, key)}
                                    ml={others.alignRight || others.currencyValue ? 'auto' : 0}
                                    mr={others.alignRight || others.currencyValue ? 10 : 0}
                                >
                                    <Flex>
                                        {props.group?.isSection && j === 0 ? <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</> : j === 0 ? <>&nbsp;&nbsp;</> : '' }
                                        <SimpleTableCell
                                            key={props.item.ID + key + props.index}
                                            data={valueFunction ? valueFunction(props.item) : props.item[key]}
                                            type={others.typeFunction ? others.typeFunction(props.item) : type}
                                            onActionLinkClick={!linkAction ? undefined : (() => {
                                                props.onAction && props.onAction(linkAction, props.item, props.index, props.group)
                                            })}
                                            linkHref={linkHrefFunction ? linkHrefFunction(props.item) : undefined}
                                            canEdit={props.canEdit ?? true}
                                            stylingProps={props.stylingProps}
                                            onValueChange={(newVal) => props.onInputChange && props.onInputChange(key, props.item, newVal)}
                                            min={typeof min === 'function' ? min(props.item) : min}
                                            color={color}
                                            inputProps={props.tableItemInputMetadataByKeyName?.[props.item.ID]?.[key]}
                                            placeholder={!placeholderFunction ? undefined : placeholderFunction(props.item)}
                                            shown={shown}
                                            lineClamp={props.lineClamp}
                                            {...others}
                                            required={others.required ?? (others.requiredFunction && others.requiredFunction(props.item))}
                                            item={props.item}
                                            // onConfirmInputUpdate={() => !!props.onConfirmInputUpdate && props.onConfirmInputUpdate(props.item)}
                                        />
                                    </Flex>

                                </Box>
                            </td>
                        )
                    }
                )
            }

            <td className={styles.actions + ' ' + (props.showControlsOnHover === false ? styles.show : '')}>
                {
                    props.controls && props.controls.length !== 0 &&
                    <ScTableActionCell
                        tooltipShowDelay={500}
                        mih={0}
                        actions={[
                            ...(!props.group.isSection && props.allowSections !== false && [{
                                name: 'createSection',
                                label: 'Create Section',
                                icon: <IconNewSection/>
                            }] || []),
                            ...props.controls,
                        ]}
                        data={props.item}
                        onAction={(actionName) => {
                            actionName === 'createSection' ? props.onNewSection && props.onNewSection() : !!props.onAction && props.onAction(actionName, props.item, props.index, props.group)
                        }}
                        // alwaysShowIcons={true}
                        actionIconPropsOverride={{
                            // variant: 'transparent',
                            // color: 'gray',
                            size: 'xs',
                        }}
                        states={props.tableActionStates}
                    />
                }
            </td>
        </>
    )
}

export default SectionTableGroupRowWrapper
