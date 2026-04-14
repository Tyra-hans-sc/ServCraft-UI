import React, {useMemo} from 'react';
import {useSortable} from "@dnd-kit/sortable";
import {CSS, useCombinedRefs} from "@dnd-kit/utilities";
import DroppableRow from "@/PageComponents/SectionTable/DroppableRow";
import {Checkbox, Flex} from "@mantine/core";
import styles from "@/PageComponents/SectionTable/SectionTable.module.css";
import {IconCheck, IconMinus} from "@tabler/icons-react";
import {useMediaQuery} from "@mantine/hooks";

function DraggableRow(props: any) {
    // const Element = props.element || 'div';
    /*const {attributes, listeners, setNodeRef} = useDraggable({
        id: props.id,
    });*/

    const mobileView = useMediaQuery('(max-width: 1000px)');

    const {
        attributes: sortableAttributes,
        listeners: sortableListeners,
        setNodeRef: sortableNodeRef,
        transform: sortableTransform,
        transition: sortableTransition,
        active,
        over
    } = useSortable({
        id: props.id,
        disabled: {
            droppable: props.disableDrag
        },
        data: {
            groupId: props.groupId,
            groupIndex: props.groupIndex,
            itemIndex: props.itemIndex,
            itemId: props.id,
        }
    })

    // not needed to use draggable or droppable since sortable is combination of both
    /*const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }*/

    /*const {attributes: draggableAttributes, listeners: draggableListeners, setNodeRef: draggableNodeRef,
        transform: draggableTransform} = useDraggable({
        id: props.id + 'drag',
    });*/
    /*const draggablestyle = {
        transform: CSS.Translate.toString(draggabletransform),
    };*/

    const combinedRef = useCombinedRefs(sortableNodeRef/*, draggableNodeRef*/)

    const isDraggedWithinGroup = active?.data.current?.groupId === props.groupId

    const checked = useMemo(() => props.selectedItems.some(x => x.ID === props.id), [props.selectedItems])

    return (
        <>
            <DroppableRow
                id={props.id + '-above'}
                data={{
                    type: 'row-above',
                    groupId: props.groupId,
                    groupIndex: props.groupIndex,
                    itemIndex: props.itemIndex,
                    itemId: props.id,
                }}
                colspan={props.colspan}
                disabled={isDraggedWithinGroup || active?.data.current?.group?.isSection}
                groupId={props.groupId}
                isSection={props.group.isSection}
            />
            <tr ref={combinedRef}
                className={(props.group.isSection ? styles.sectionRow : '') + ' ' + (props.group.items.length - 1 === props.itemIndex ? styles.lastSectionRow : '') }
                style={{
                    transform: CSS.Transform.toString(sortableTransform/* || draggableTransform*/),
                    transition: sortableTransition,
                    ...((((over?.id === props.groupId || over?.data.current?.groupId === props.groupId) && !isDraggedWithinGroup)) && {
                        backgroundColor: 'var(--mantine-color-scBlue-0)',
                    })
                }}
            >

                { // row drag handle for each row
                    props.group.isSection &&
                    <td
                    style={{width: "46px"}}
                        {...(props.canEdit ?? true) && sortableListeners} {...(props.canEdit ?? true) && sortableAttributes}
                    >
                        {
                            (props.canEdit ?? true) &&
                            <Flex align={'center'} className={mobileView ? '' : styles.dragHandle} c={'gray'}
                                  ml={mobileView ? 17 : 10}
                                  style={{cursor: 'grab'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill={'#afafaf'} height="16" width="14"
                                     viewBox="0 0 448 512">
                                    <path
                                        d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"/>
                                </svg>
                            </Flex>
                        }


                        {
                            props.useSelectMode && <td>
                                <Checkbox
                                    mx={'auto'}
                                    ml={10}
                                    size={'xs'}
                                    color={'scBlue'}
                                    checked={checked}
                                    disabled={props.disableSelect}
                                    onChange={props.onItemCheckChange}
                                    icon={
                                        ({ indeterminate , className }) =>
                                            indeterminate ? <IconMinus className={className} strokeWidth={4} /> : <IconCheck className={className} strokeWidth={4} />
                                    }
                                />
                            </td>
                        }
                        {/*<IconGripHorizontal color={'gray'} style={{marginLeft: 5, cursor: 'grab'}} />*/}
                    </td>
                }

                {props.children}
            </tr>
            {
                props.lastItem &&
                <DroppableRow id={props.id + '-below'}
                              data={{
                                  type: 'row-below',
                                  groupId: props.groupId,
                                  groupIndex: props.groupIndex,
                                  itemIndex: props.itemIndex,
                                  itemId: props.id,
                              }}
                              // disabled={active?.id === props.group.id}
                              colspan={props.colspan}
                              disabled={isDraggedWithinGroup || active?.data.current?.group?.isSection}
                              groupId={props.groupId}
                              nextGroupId={props.nextGroupId}
                              isSection={props.group.isSection}
                />
            }
        </>
    );
}

export default DraggableRow;
