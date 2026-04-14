import { useDroppable } from "@dnd-kit/core";
import {FC, PropsWithChildren} from "react";
import styles from "@/PageComponents/SectionTable/SectionTable.module.css";

const Droppable: FC<PropsWithChildren<{id: string, style?: any, data: any, colspan: number, disabled?: boolean, groupId: string, /*oneItemGroup?: boolean, */sectionGroupBorder?: boolean, nextGroupId?: string, isSection?: boolean}>> = (props) => {

    const {setNodeRef, over, active} = useDroppable({
        id: props.id,
        data: props.data,
        disabled: props.disabled
    });

    // console.log(props.over, props.over === props.id)

    const outsideItemOverGroup =  ((over?.id === props.groupId || over?.data.current?.groupId === props.groupId) && active?.data.current?.groupId !== props.groupId)

    return (
        <tr ref={setNodeRef} style={{
            height: /*over?.id === props.id ? 20 :*/ 3,
            // backgroundColor: 'blueviolet'
            transition: 'border 200ms ease',
            backgroundColor: outsideItemOverGroup && props.data.type !== 'group-above' && props.data.type !== 'group-below' ? 'var(--mantine-color-scBlue-0)' : props.isSection ? 'rgba(248, 249, 250, 0.9)' : 'transparent'
        }}>
            <td
                className={
                    /*(
                        props.sectionGroupBorder ? styles.sectionBorderTop :
                            props.data.type === 'row-below' && (over?.data.current?.groupIndex - 1 !== props.data.groupIndex && over?.data.current?.groupIndex !== props.data.groupIndex ) ? styles.sectionBorderBottom : ''
                    ) + ' ' +*/
                    (over?.id === props.id ? ((props.data.type === 'row-below' || props.data.type === 'group-below') ? styles.dropRowB : styles.dropRow) : styles.dropRowDefault)
                }
                style={{
                    height: props.data.type === 'row-below' ? 5 : props.sectionGroupBorder ? 25 : 2,
                    // borderTop: `2px solid ${props.sectionGroupBorder /*&& over?.id !== props.id*/ ? 'var(--mantine-color-scBlue-1)' : 'transparent'}`,
                    borderBottom: `1px solid ${props.data.type === 'row-below' ? 'var(--mantine-color-gray-3)' : 'transparent'}`,
                }}
                colSpan={props.colspan}
            >

                {
                    over?.id === props.id &&
                        <hr style={{margin: 0}} />
                }

            </td>
        </tr>
    );
}

export default Droppable