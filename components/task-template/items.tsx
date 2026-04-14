import React, {useState, useEffect, useMemo} from 'react';
import { colors, layout} from '../../theme';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ManageTaskItemTemplate from '../modals/task-template/manage-task-item-template';
import SectionTable from "@/PageComponents/SectionTable/SectionTable";
import {IconEdit, IconPlus, IconTrash} from "@tabler/icons-react";
import {Box, Button, Flex} from "@mantine/core";
import {useDidUpdate} from "@mantine/hooks";

const TaskTemplateItems = ({taskItemTemplates: inputTaskItemTemplates, updateTaskItemTemplates, inputErrors, accessStatus}) => {

  const [taskItemTemplates, setTaskItemTemplates] = useState(
      inputTaskItemTemplates
          .sort((a, b) => a.DisplayOrder > b.DisplayOrder ? 1 : -1)
          .map((item, i) => ({...item, LineNumber: item.DisplayOrder + 1}))
  );

  useDidUpdate(() => {
    setTaskItemTemplates(inputTaskItemTemplates
        .sort((a, b) => a.DisplayOrder > b.DisplayOrder ? 1 : -1)
        .map((item) => ({...item, LineNumber: item.DisplayOrder + 1}))
    )
  }, [inputTaskItemTemplates]);

  // const [disableReorder, setReorderToDisabled] = useState(true);

  /*const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {

    let tempItems = [...taskItemTemplates];
    let item = tempItems.splice(previousIndex, 1);
    tempItems.splice(nextIndex, 0, item[0]);

    tempItems.map((item, i) => {
      item.DisplayOrder = i + 1;
    });

    reorder(tempItems, previousIndex, nextIndex);
    updateTaskItemTemplates(tempItems);
  };*/

  /*const handleDescriptionChange = (item, e) => {
    item.Description = e.target.value;
    updateTaskItemTemplate(item);
  };*/

  /*const [descriptionEditEnabled, setDescriptionEditEnabled] = useState(false);
  const [descriptionEditIndex, setDescriptionEditIndex] = useState(null);
  const [descriptionFocus, setDescriptionFocus] = useState(false);
  
  const toggleDescriptionEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setDescriptionEditIndex(index);
    setDescriptionEditEnabled(true);
    setDescriptionFocus(true);
  };*/

  /*const resetEdits = () => {
    setDescriptionEditIndex(null);
    setDescriptionEditEnabled(false);
    setDescriptionFocus(false);
  };*/

  const [showManageTaskItemTemplateModal, setShowManageTaskItemTemplateModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemEditIndex, setItemEditIndex] = useState(-1);
  const [isNewItem, setIsNewItem] = useState(true);

  const toggleManageTaskItemTemplateModal = (item, index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess
      || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    setShowManageTaskItemTemplateModal((show) => !show);
    setItemToEdit(item);
    setItemEditIndex(index);
    setIsNewItem(item === null);
  };


  const [currentLineNumber, setCurrentLineNumber] = useState(0);

  const saveTaskItemTemplate = (item) => {

    if (item) {
      if (isNewItem) {
        item.ID = Helper.newGuid();
        item.DisplayOrder = taskItemTemplates.length + 1;
        item.LineNumber = taskItemTemplates.length + 1;
        setTaskItemTemplates((p) => {
          const newItems = [...p, item]
          updateTaskItemTemplates(newItems);
          return newItems;
        });
        // bad code below
        inputTaskItemTemplates.push(item)
        // taskItemTemplates.push(item);
        // setCurrentLineNumber(currentLineNumber + 1);
      } else {

        setTaskItemTemplates(p => {
          const newItems = (
              p.map((x, i) => i === itemEditIndex ? {...x, ...item} : x)
          )
          updateTaskItemTemplates(newItems)
          return newItems;
        })
        /*
        let temp = {
          ...taskItemTemplates[itemEditIndex],
          Description: item.Description,
          DataType: item.DataType,
          DataOption: item.DataOption
        };
        taskItemTemplates[itemEditIndex] = temp;
        setTaskItemTemplates([...taskItemTemplates]);
        console.log('update task item template', taskItemTemplates[itemEditIndex])
      }*/

        // updateTaskItemTemplates(taskItemTemplates);
      }
    }

    setItemEditIndex(-1);
    setItemToEdit(null);
    setShowManageTaskItemTemplateModal(false);
  };


  const updateTaskItemTemplate = (item) => {
    let temp = [...taskItemTemplates];
    let index = temp.findIndex(x => x.ID == item.ID);
    if (index > -1) {
      temp[index] = item;
      updateTaskItemTemplates(temp);
    }
  };

  const removeTaskItemTemplate = (item) => {
    let temp = [...taskItemTemplates];
    let indexToRemove = temp.findIndex(x => x.ID == item.ID);
    if (indexToRemove > -1) {
      temp.splice(indexToRemove, 1);
      updateTaskItemTemplates(temp);
    }
  };

  useEffect(() => {
    getCurrentLineNumber();
  }, []);

  const getCurrentLineNumber = () => {
    if (taskItemTemplates.length > 0) {
      let displayOrders = taskItemTemplates.map((item, i) => {
        return parseInt(item.DisplayOrder);
      });
      setCurrentLineNumber(Math.max(...displayOrders) + 1);
    } else {
      setCurrentLineNumber(0);
    }
  };

  const editTaskItemTemplate = (taskItemTemplate, index) => {
    toggleManageTaskItemTemplateModal(taskItemTemplate, index);
  };

  // console.log(isNewItem, itemToEdit)

  const handleAction = (actionName: string, actionItem: any, actionItemIndex: number, group: any) => {
    // console.log(actionName, actionItem, actionItemIndex, group, 'delete')

    if(actionName === 'edit') {
      editTaskItemTemplate(actionItem, actionItemIndex);
    } else if (actionName === 'delete') {
      removeTaskItemTemplate(actionItem);
    }
  }

  const sectionTableInputErrorsByIdKeyName = useMemo(() => {
    return taskItemTemplates.reduce((p, c) => ({...p, [c.ID]: {Description: {error: c.Description.trim() === '' ? 'Please provide a description' : null}}}), {})
  }, [taskItemTemplates])

  // console.log(sectionTableInputErrorsByIdKeyName)

  return (
    <div className="container">
      <Box mt={'sm'}>
        <SectionTable
            data={taskItemTemplates}
            // rerenderTableTriggerVal={taskItemTemplates.length}
            mapping={[
              {
                type: 'textArea',
                label: 'Description',
                key: 'Description',
                required: true,

              },
              {
                label: 'Type',
                key: 'DataType',
                linkAction: 'edit',
                valueFunction: (item) => Enums.TaskTemplateDataTypes[item.DataType]
              },
            ]}
            onInputChange={(name, item, value) => {
              if(name === 'Description') {
                updateTaskItemTemplate({...item, Description: value});
              }
            }}
            onDataUpdate={(items) => {
              updateTaskItemTemplates(items.map((item, i) => ({...item, DisplayOrder: item.LineNumber - 1})));
            }}
            sectionControls={[]}
            sectionTitleKey={'SectionGroupName'}
            sectionIdKey={'SectionID'}
            module={Enums.Module.None} itemId={''}
            onSectionItem={console.log}
            allowSections={false}
            controls={[
              {
                type: 'default',
                name: 'edit',
                icon: <IconEdit />,
                label: 'Edit'
              },
              {
                type: 'warning',
                buttonProps: {ml: 20},
                name: 'delete',
                icon: <IconTrash />,
                label: 'Delete'
              }
            ]}
            tableItemInputMetadataByKeyName={
              sectionTableInputErrorsByIdKeyName
            }
            onAction={handleAction}
            showControlsOnHover={false}
            onItemClicked={(item, column) => {
              if(column === 'Type') {
                editTaskItemTemplate(item, -1);
            }}}
            stylingProps={{
              darkerText: true,
              compact: true,
              clearHeader: false,
            }}
            // canEdit={}

        />
      </Box>


      {/*<div className="table-container">
      {taskItemTemplates.length > 0 ?
        <table className={`${inputErrors.TaskItems ? 'error' : ''} table`}>
          <thead>
            <tr>
              <th className="header-item-move">
              </th>
              <th className="header-item-desc">
                DESCRIPTION
              </th>
              <th className="header-item-type">
                TYPE
              </th>
              <th className="header-item-delete">
              </th>
            </tr>
          </thead>          
          <Reorder reorderId="task-item-template-list" onReorder={onReorder} lock='horizontal' component='tbody'
            placeholderClassName='reorder-placeholder' draggedClassName='reorder-dragged' disabled={disableReorder}>
            {
              taskItemTemplates.map(function (item, index) {
                return (
                  <tr key={index}>
                    <td className="body-item-move" title="Click and drag to reorder"
                      onMouseEnter={() => setReorderToDisabled(false)} onMouseLeave={() => setReorderToDisabled(true)}>
                      <img src="/icons/menu-light.svg" alt="move" />
                    </td>
                    <td className="body-item-desc" onClick={() => { return }}>
                      {descriptionEditEnabled && index == descriptionEditIndex ?
                        <InlineTextInput
                          name={`description${index}`}
                          changeHandler={(e) => handleDescriptionChange(item, e)}
                          value={item.Description}
                          blurHandler={resetEdits}
                          inputFocus={descriptionFocus}
                        /> :
                        <span onClick={() => {editTaskItemTemplate(item, index)}} className="body-item-code">
                          {item.Description}
                        </span>
                      }
                    </td>
                    <td>
                      {Enums.TaskTemplateDataTypes[item.DataType]}
                    </td>
                    <td className="body-item-delete" title="Delete task item template">
                      {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
                        <img src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeTaskItemTemplate(item)} />
                      </> : ''}
                    </td>
                  </tr>
                );
              })
            }
          </Reorder>
        </table>
          : ''
        }
      </div>*/}

      {
        accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess &&
          <Flex justify={'start'} mt={'sm'} mx={'sm'}>
            <Button leftSection={<IconPlus size={15}/>} size={'sm'} onClick={() => toggleManageTaskItemTemplateModal(null, -1)} variant={'outline'}>
              Add Item
            </Button>
          </Flex>
      }

      {/*{accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
        <div className="row">
          <LegacyButton text="Add Item" icon="plus-circle-blue" extraClasses="hollow auto" onClick={() => toggleManageTaskItemTemplateModal(null, -1)} />
        </div>
      </> : ''}*/}

      {showManageTaskItemTemplateModal ?
        <ManageTaskItemTemplate taskItemTemplate={itemToEdit} saveTaskItemTemplate={saveTaskItemTemplate} isNew={isNewItem} /> : ''
      }

      <style jsx>{`
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table-container {
          overflow-x: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table {
          border-collapse: collapse;
          margin-top: 1.5rem;
          width: 100%;
        }
        .table thead tr {
          background-color: ${colors.backgroundGrey};
          height: 3rem;
          border-radius: ${layout.cardRadius};
          width: 100%;
        }
        .table th {
          color: ${colors.darkPrimary};
          font-size: 0.75rem;
          font-weight: normal;
          padding: 4px 1rem 4px 0; 
          position: relative;
          text-align: left;
          text-transform: uppercase;
          transform-style: preserve-3d;
          user-select: none;
          white-space: nowrap;
        }
        .table th.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table th:last-child {
          padding-right: 1rem;
          text-align: right;
        }
        .table th:first-child {
          padding-left: 0.5rem;
          text-align: left;
        }
        .table .spacer {
          height: 0.75rem !important;
        }
        .table tr {
          height: 4rem;
          cursor: pointer;
        }
        .table td {
          font-size: 12px;
          padding-right: 1rem;
        }
        .table td.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table tr:nth-child(even) td {
          background-color: ${colors.white};
        }
        .table td:last-child {
          border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
          text-align: right;
        }
        .table td:last-child :global(div){
          margin-left: auto;
        }
        .table td:first-child {
          border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
          padding-left: 1rem;
          text-align: left;
        }
        .table td:first-child :global(div){
          margin-left: 0;
        }

        .reorder-placeholder {

        }
        .reorder-dragged {
          width: 100%;
          height: 4rem !important;
        }
        .reorder-dragged td {
          font-size: 12px;
          min-width: 6rem;
          padding-right: 1rem;
        }

        .header-container {
          background-color: ${colors.backgroundGrey};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          flex-direction: row;
          justify-content: center;
          margin-top: 0.5rem;
          padding: 1.25rem 1rem;
          position: relative;
          width: 100%;
        }

        .header-item-move {
          width: 1%;
          min-width: 30px;
        }
        .header-item-code {
          width: 5%;
          min-width: 80px;
        }
        .header-item-desc {
          width: 50%;
        }
        .header-item-discount {
          width: 5%;
          min-width: 120px;
        }
        .header-item-taxrate {
          width: 5%;
          min-width: 120px;
        }
        .header-item-qty {
          width: 5%;
        }
        .header-item-price {
          width: 5%;
          min-width: 120px;
        }
        .header-item-amt {
          width: 5%;
          min-width: 120px;
        }
        .header-item-status {
          width: 5%;
          min-width: 120px;          
        }
        .header-item-delete {
          width: 1%;
          min-width: 30px;
        }
        .body-item-move {
          cursor: move;
        }
        .body-item-code {
          color: ${colors.bluePrimary};
          cursor: pointer;
        }
        .body-item-amt {
          text-align: right;
        }
        .body-item-status {
          
        }
        .status-error {
          color: ${colors.warningRed};
        }
        .status-synced {
          color: ${colors.green};
        }
        .total-container {
          margin-top: 1rem;
        }
        .total-row {
          line-height: 24px;
        }
        .grand-total {
          margin-top: 8px;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .column-fixed {
          display: flex;
          flex-direction: column;
          width: 500px;
        }
        .justify-end {
          justify-content: flex-end;
        }
        .end {
          align-items: flex-end;
        }
        .error {
          border: 1px solid ${colors.warningRed};
        }
      `}</style>
    </div>
  );
};

export default TaskTemplateItems;
