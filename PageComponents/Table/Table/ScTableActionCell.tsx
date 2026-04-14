import { FC, useMemo } from "react";
import { getActionId } from "@/PageComponents/Table/table-helper";
import { ActionIcon, ActionIconProps, Flex, Loader, Tooltip } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons";
import { TableAction, TableActionStates } from "@/PageComponents/Table/table-model";


const ScTableActionCell: FC<{ actions?: TableAction[]; states?: TableActionStates; data: any, onAction?: (actionName: string) => void, mih?: number, actionIconPropsOverride?: ActionIconProps, tooltipShowDelay?: number, disableTabbing?: boolean }> = ({ states, actions, data, onAction, mih = 40, actionIconPropsOverride, tooltipShowDelay, disableTabbing }) => {


    return (
        <Flex
            mih={mih}
            align={'center'}
            justify={'center'}
            gap={5}
            px={2}
            style={{ backgroundColor: 'white', borderRadius: '1rem' }}
        >
            {
                actions?.map(
                    a => {
                        const state = (states && states[getActionId(a.name, data.ID)]) ?? 'none'
                        const meetsShowFunction = a.showFunction ? a.showFunction(data) : true
                        const meetsConditionalShow = a.conditionalShow ? data[a.conditionalShow.key] === a.conditionalShow.equals : true
                        const shown = meetsShowFunction && meetsConditionalShow

                        return shown && (
                            <Tooltip
                                events={{ hover: true, focus: true, touch: true }}
                                openDelay={tooltipShowDelay}
                                withinPortal={true}
                                zIndex={800}
                                color={'scBlue'}
                                label={state === 'loading' ? a.activeLabel : a.disabledLabel && a.conditionalDisable && a.conditionalDisable(data) ? a.disabledLabel : a.label}
                                key={'action' + a.name + data.ID}
                            >
                                <ActionIcon
                                    tabIndex={disableTabbing && -1 || undefined}
                                    disabled={state === 'loading' || a.conditionalDisable && a.conditionalDisable(data)}
                                    size={'sm'}
                                    key={'action' + a.name + data.ID}
                                    variant={'outline'}
                                    color={a.type === 'warning' ? 'yellow.8' : a.type === 'error' ? 'red.6' : 'scBlue'}
                                    onClick={() => onAction && onAction(a.name)}
                                    {...a.buttonProps}
                                    {...actionIconPropsOverride}
                                >
                                    {
                                        state === 'loading' ? (
                                            <Loader
                                                size={12}
                                                color={a.type === 'warning' ? 'yellow.8' : a.type === 'error' ? 'red.6' : 'scBlue'}
                                            />
                                        ) : state === 'error' ? <IconExclamationCircle />
                                            : a.icon
                                    }
                                </ActionIcon>
                            </Tooltip>
                        )
                    }
                )
            }
        </Flex>
    )
}


export default ScTableActionCell
