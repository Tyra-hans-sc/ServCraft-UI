import {FC, useEffect, useMemo, useState} from "react";
import {ColumnMappingData} from "@/PageComponents/Table/table-model";
import ScColCheckbox from "@/PageComponents/Table/Table Columns/ScColCheckbox";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";

const ScActiveColumns: FC<
    {
        columnMapping: ColumnMappingData[];
        onChange: (newColMapping: ColumnMappingData[], itemChanged?: {key: string, checked: boolean}) => void
        hideRequired?: boolean

    }> = (props) => {

    const [items, setItems] = useState(
        props.columnMapping
            .sort((a, b) => (
                typeof a.Order === "number" && typeof b.Order === "number" ? (a.Order - b.Order) : 0
            ))
            .filter(x => (x.IsHidden !== true) && (!props.hideRequired || x?.IsRequired === false))
            .map(x => (
                {
                    label: x.ColReorderLabel ?? x.Label,
                    key: x.ID,
                    checked: x.Show ?? true,
                    // disabled: x.IsRequired || x.Disabled,
                    sortable: x.Sortable ?? true,
                    id: x.ID
                }
            ))
    );

    useEffect(() => {
        setItems(props.columnMapping
            .sort((a, b) => (
                typeof a.Order === "number" && typeof b.Order === "number" ? (a.Order - b.Order) : 0
            ))
            .filter(x => (x.IsHidden !== true) && (!props.hideRequired || x?.IsRequired === false))
            .map(x => (
                {
                    label: x.ColReorderLabel ?? x.Label,
                    key: x.ID,
                    checked: x.Show ?? true,
                    disabled: x.IsRequired || x.Disabled,
                    sortable: x.Sortable ?? true,
                    id: x.ID
                }
            )))
    }, [props.columnMapping])


    const [activeId, setActiveId] = useState(null);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event) {
        const {active} = event;
        setActiveId(active.id);
    }

    function handleDragEnd(event) {
        const {active, over} = event;
        if(props.columnMapping.find(x => x.ID === over.id)?.Sortable) {  // make sure it is being swapped with a sortable item
            if (active && over && active.id !== over.id) {
                setItems((items) => {
                    const oldIndex = items.findIndex(x => x.id === active.id);
                    const newIndex = items.findIndex(x => x.id === over.id);
                    // console.log('moving from ', oldIndex, newIndex)
                    const newItems = arrayMove(items, oldIndex, newIndex)
                    props.onChange(newItems.map((x, i) => ({...props.columnMapping.find(y => y.ID === x.key), Order: i} as ColumnMappingData)))
                    return newItems;
                })
            }
        }
        setActiveId(null)
    }

    const canSortAtAll = useMemo(() => {
        return props.columnMapping.some(x => x.Sortable)
    }, [props.columnMapping])

    const activeItem = useMemo(() => items.find(x => x.id === activeId), [activeId, items])

    return <>

        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
            >
                {
                    items.map(val => (
                        <ScColCheckbox
                            canSortAtAll={canSortAtAll}
                            draggable={val?.sortable ?? true}
                            key={val.id}
                            value={val}
                            isBeingDragged={val.id === activeId}
                            onChange={(event) => {
                                if(event.currentTarget) {
                                    props.onChange(
                                        props.columnMapping.map(x => (
                                            x.ID === val.id ? {...x, Show: event.currentTarget?.checked} : {...x}
                                        )),
                                        {key: val.key, checked: event.currentTarget?.checked}
                                    )
                                    setItems(p =>
                                        p.map(
                                            (x) => x.id === val.id ? {...x, checked: event.currentTarget?.checked} : {...x}
                                        )
                                    )
                                }

                            }}
                        />
                    ))
                }
            </SortableContext>
            <DragOverlay>
                {activeItem ? (
                    <div style={{
                        background: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        opacity: 0.95
                    }}>
                        <ScColCheckbox
                            canSortAtAll={canSortAtAll}
                            draggable={false}
                            value={activeItem}
                            onChange={() => {}}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>

    </>
}

export default ScActiveColumns
