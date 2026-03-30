import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Flex, ActionIcon, ScrollArea } from '@mantine/core';
import { IconGripHorizontal, IconTrash } from '@tabler/icons-react';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Helper from '../../../utils/helper';
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";

const SortableItem = ({ id, value, updateOption, keyPress, removeOption, disabled, checkIfFocused }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Flex
      ref={setNodeRef}
      align={'center'}
      justify={'space-between'}
      style={{ ...style, alignItems: 'center' }}
      gap="sm"
    >
      {/* Drag handle */}
      <ActionIcon
        {...attributes}
        {...listeners}
        variant="transparent"
        size="sm"
      >
        <IconGripHorizontal size={20} />
      </ActionIcon>
      {/* Input Field */}
      <ScTextControl id={id}
                     autoFocus={checkIfFocused(id)}
                     onChange={(e) => updateOption({value: e.currentTarget.value}, id)}
                     type="text"
                     value={value}
                     size={'xs'}
                     mb={0}
                     mt={0}
                     w={'100%'}
                     onKeyDown={keyPress}
                     readOnly={disabled}
                     {...{} as any}
      />
      {/* Remove Option Icon */}
      <ActionIcon
        disabled={disabled}
        variant={'transparent'}
        size={'sm'}
        color={'yellow.7'}
        onClick={() => removeOption(id)}
      >
        <IconTrash size={20} />
      </ActionIcon>
    </Flex>
  );
};

/**
 * TaskItemTemplateReorderListDnDKit:
 * A reusable component for managing a list of task item templates with drag-and-drop functionality, following the existing FormDefinitionFieldListOptions.
 */
const TaskItemTemplateReorderListDnDKit = ({ dataOption, setDataOption, error, disabled }) => {
  const [options, setOptions] = useState([{ id: crypto.randomUUID(), label: '' }]);
  const [focusedItem, setFocusedItem] = useState('');

  // Populate options from `dataOption` on component mount
  useEffect(() => {
    const parsedOptions = parseOptions();
    setOptions(parsedOptions);
  }, []);

  // Parse options from the serialized dataOption provided as props
  const parseOptions = () => {
    let opts = [{ id: crypto.randomUUID(), label: '' }];
    if (dataOption && dataOption.length > 0) {
      opts = Helper.deserializeCustomCSV(dataOption).map((label) => ({
        id: crypto.randomUUID(),
        label,
      }));
    }
    return opts;
  };

  // Update an option value on text input change
  const updateOption = (event, id) => {
    const newValue = event.value;
    const updatedOptions = options.map((opt) =>
      opt.id === id ? { ...opt, label: newValue } : opt
    );
    setOptions(updatedOptions);
  };

  // Remove an option from the list
  const removeOption = (id) => {
    const updatedOptions = options.filter((opt) => opt.id !== id);
    setOptions(updatedOptions);
  };

  // Serialize options back to `dataOption`
  const serializeOptions = () => {
    const filteredOptions = options
      .filter((opt) => !Helper.isNullOrWhitespace(opt.label))
      .map((opt) => opt.label);
    return filteredOptions.length > 0
      ? Helper.serializeCustomCSV(filteredOptions)
      : '';
  };

  useEffect(() => {
    // Update the parent component with serialized options
    setDataOption(serializeOptions());
  }, [options]);

  // Handle drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOptions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleKeyPress = (event, index) => {
    const currentValue = options[index];
    if (event.key === 'Enter' && !Helper.isNullOrWhitespace(currentValue.label)) {
      if (index < options.length - 1) {
        // If there are more items, focus the next one
        setFocusedItem(options[index + 1].id);
      } else {
        // Add a new item if it's the last one
        addOption();
      }
    }
  };

  const addOption = () => {
    const newOption = { id: crypto.randomUUID(), label: '' };
    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    setFocusedItem(newOption.id); // Focus the new option
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className={`${error ? 'error' : ''}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea.Autosize
            mah={300}
            offsetScrollbars
            type={'always'}
        >
          <SortableContext items={options.map((x) => x.id)} strategy={verticalListSortingStrategy}>
            <Flex direction="column" gap="sm">
              {options.map((option, index) => (
                  <SortableItem
                      key={option.id}
                      id={option.id}
                      value={option.label}
                      updateOption={updateOption}
                      keyPress={(event) => handleKeyPress(event, index)}
                      removeOption={removeOption}
                      disabled={disabled}
                      checkIfFocused={(id) => focusedItem === id}
                  />
              ))}
            </Flex>
          </SortableContext>
        </ScrollArea.Autosize>
      </DndContext>

      {!disabled && (
          <Flex justify={'center'}>
            <Button
                variant="outline"
                size="xs"
                mt="sm"
                onClick={addOption}
            >
              Add Option
            </Button>
          </Flex>
      )}

      {error && <p className="error-text">At least one option is required</p>}

      <style jsx>{`
        .error {
          border: 1px solid var(--mantine-color-yellow-7);
          border-radius: 3px;
          padding: 8px;
        }

        .error-text {
          color: var(--mantine-color-yellow-7);
          font-size: 0.8rem;
        }

        input.task-input {
          width: 100%;
          padding: 4px 8px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default TaskItemTemplateReorderListDnDKit;