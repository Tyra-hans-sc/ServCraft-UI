import { useEffect, useState } from 'react';
import {ActionIcon, Button, Flex, ScrollArea} from '@mantine/core';
import SCInlineInput from '../../sc-controls/form-controls/sc-inline-input';
import Helper from '../../../utils/helper';
import { colors } from '../../../theme';

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor, KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {IconGripHorizontal} from "@tabler/icons";
import {restrictToParentElement, restrictToVerticalAxis} from "@dnd-kit/modifiers";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {IconPlus, IconTrash} from "@tabler/icons-react";

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
      justify={'space-evenly'}
      style={{ ...style, alignItems: 'center', justifyContent: 'space-between' }}
      gap="sm"
    >
      <ActionIcon
        {...attributes} {...listeners}
        variant={'transparent'}
        size={'compact-xs'}
      >
        <IconGripHorizontal size={20} />
      </ActionIcon>
      <ScTextControl id={id}
        w={'100%'}
        autoFocus={checkIfFocused(id)}
        onChange={(e) => updateOption({value: e.currentTarget.value}, id)}
        type="text"
        value={value}
        size={'xs'}
                     mb={0}
                     mt={0}
        onKeyDown={keyPress}
        readOnly={disabled}
        {...{} as any}
      />
      <ActionIcon
          tabIndex={-1}
          disabled={disabled}
          variant={'transparent'}
          size={'compact-xs'}
          color={'yellow.7'}
          onClick={() => removeOption(id)}
      >
        <IconTrash size={20} />
      </ActionIcon>
      {/*{!disabled && (
        <img
          src="/icons/trash-bluegrey.svg"
          alt="remove"
          onClick={() => removeOption(id)}
        />
      )}*/}
    </Flex>
  )
};

const FormDefinitionFieldListOptions = ({ dataOption, setDataOption, error, disabled }) => {
  const [options, setOptions] = useState([{id: crypto.randomUUID(), label: ''}]);
  const [focusKey, setFocusKey] = useState(-1);

  useEffect(() => {
    setOptions(parseOptions());
  }, []);

  const parseOptions = () => {
    let opts = [{id: crypto.randomUUID(), label: ''}];
    if (dataOption && dataOption.length > 0) {
      opts = Helper.deserializeCustomCSV(dataOption).map((label) => ({
        id: crypto.randomUUID(),
        label,
      }));
    }
    return opts;
  };

    const updateOption = (e, id) => {
      const newVal = e.value;
      const tempOpts = options.map((opt) =>
          opt.id === id ? {...opt, label: newVal} : opt
      );
      setOptions(tempOpts);
    };

    const removeOption = (id) => {
      const tempOpts = options.filter((opt) => opt.id !== id);
      setOptions(tempOpts);
    };

    const serializeOptions = () => {
      const optionsFiltered = options
          .filter((opt) => !Helper.isNullOrWhitespace(opt.label))
          .map((opt) => opt.label);
      return optionsFiltered.length > 0
          ? Helper.serializeCustomCSV(optionsFiltered)
          : '';
    };

    useEffect(() => {
      setDataOption(serializeOptions());
    }, [options]);

    const handleDragEnd = (event) => {
      const {active, over} = event;

      if (active.id !== over.id) {
        setOptions((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

    const keyPress = (e, key) => {
      const enterPressed = e.key === 'Enter';

      console.log(e)

      const currentValue = options[key];
      if (enterPressed && !Helper.isNullOrWhitespace(currentValue) ) {
        if (typeof options[key + 1] !== "undefined") {
          /*if(options[key + 1].label === '') {
            setFocusedItem(options[key + 1].id)
            // focus next item
            // const el = document.getElementById(options[key + 1].id);
            // console.log(el)
          } else {*/
            addOption();
          // }
        } else {
          addOption();
        }
      }


      /*const anyEmpty = options.filter((x) => Helper.isNullOrWhitespace(x)).length > 0;
      if (!Helper.isNullOrWhitespace(currentValue) && enterPressed && !anyEmpty) {
        const tempOptions = [...options, {id: crypto.randomUUID(), label: ''}];
        setOptions(tempOptions);
        setFocusKey(tempOptions.length - 1);
      }*/
    };


    const [focusedItem, setFocusedItem] = useState('');

    const checkIfFocused = (key) => key === focusKey;

    const addOption = () => {
      /*const anyEmpty = options.some((x) => Helper.isNullOrWhitespace(x.label));
      if (!anyEmpty) {

      }*/
      const newItem = {id: crypto.randomUUID(), label: ''};
      const tempOptions = [...options, newItem];
      setOptions(tempOptions);
      setFocusedItem(newItem.id)
      // returnFocus();
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

  /*const returnFocus = useFocusReturn({
    // Is region with focus trap active?
    // When it activates hook saves document.activeElement to the internal state
    // and focuses this element once focus trap is deactivated
    opened: false,

    // Determines whether focus should be returned automatically, true by default
    shouldReturnFocus: true,
  });*/

    return (
        <div className={`${error ? 'error' : ''}`}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={console.log}
                      onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
            <ScrollArea.Autosize
                mah={300}
                offsetScrollbars
                type={'always'}
            >
              <SortableContext strategy={verticalListSortingStrategy} items={options.map((x) => x.id)}>
                <Flex direction="column" gap="sm">
                  {options.map((option, i) => (
                      <SortableItem
                          key={option.id}
                          id={option.id}
                          value={option.label}
                          updateOption={updateOption}
                          keyPress={(e) => keyPress(e, i)}
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
              <div className="row">
                {/* Mantine Button */}
                <Button
                    mx={'auto'}
                    // ms={'auto'}
                    onClick={addOption}
                    variant="outline"
                    size="xs"
                    // w={'100%'}
                    // mt={'sm'}
                    leftSection={<IconPlus size={16} />}
                >
                  Add Option
                </Button>
              </div>
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

            .row {
              display: flex;
              justify-content: space-between;
            }
          `}</style>
        </div>
    );
  };


export default FormDefinitionFieldListOptions;
