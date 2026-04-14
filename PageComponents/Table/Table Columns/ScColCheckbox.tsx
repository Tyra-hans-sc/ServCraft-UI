import { ChangeEventHandler, FC } from "react";
import { Checkbox, Flex, Group, Tooltip } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from './ScColCheckbox.module.css';

const ScColCheckbox: FC<{ value: { label: string, key: string, checked?: boolean, disabled?: boolean, id: string }, onChange: ChangeEventHandler<HTMLInputElement>, draggable?: boolean, canSortAtAll?: boolean, isBeingDragged?: boolean }> =
    ({ value, onChange, draggable = true, canSortAtAll = true, isBeingDragged = false }) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: value.id
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isBeingDragged ? 0.4 : 1,
    }

    return (
        <div
            ref={setNodeRef} style={style}
        >
            <Flex
                align={'center'}
                my={!canSortAtAll ? 10 : 5}
            >
                {
                    canSortAtAll && draggable &&
                    <Tooltip label={'Drag to reorder'} openDelay={500} color={'scBlue'} events={{ hover: true, focus: false, touch: false }}>
                        <Group
                            {...attributes}
                            {...listeners}
                            mr={'sm'}
                            id={'grip'}
                            className={styles.gripHandle}
                            c={'gray.5'}
                        >
                            <IconGripVertical />
                        </Group>
                    </Tooltip>
                }
                {
                    canSortAtAll && !draggable &&
                    <Group mr={'sm'} c={'gray.3'}>
                        <IconGripVertical />
                    </Group>
                }
                {value.disabled
                    ? <Tooltip label={'Required — cannot be hidden'} color={'scBlue'} openDelay={300} events={{ hover: true, focus: true, touch: true }}>
                          <Checkbox
                              color={'scBlue'}
                              mt={0}
                              onChange={onChange}
                              {...value}
                          />
                      </Tooltip>
                    : <Checkbox
                          color={'scBlue'}
                          mt={0}
                          onChange={onChange}
                          {...value}
                      />
                }
            </Flex>
        </div>
    )
}

export default ScColCheckbox
