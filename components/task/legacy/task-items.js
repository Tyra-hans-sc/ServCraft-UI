import React, { useState, useEffect, useContext } from 'react';
import Button from '../button';
import InlineTextInput from '../inline-text-input';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import ManageTaskItem from '../modals/task/manage-task-item';
import AddTaskItems from '../modals/task-template/add-task-items';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Time from '../../utils/time';
import Reorder from 'react-reorder';
import ToastContext from '../../utils/toast-context';
import CellCheckbox from '../cells/checkbox';
import Storage from '../../utils/storage';
import CompleteTaskItem from '../modals/task/complete-task-item';
import Fetch from '../../utils/Fetch';
import ConfirmAction from '../modals/confirm-action';
import PS from '../../services/permission/permission-service';
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import {IconCirclePlus} from "@tabler/icons-react";
import {Flex, Text} from "@mantine/core";

// module: Query / JobCard
// data: job / query
// updateData: updateData("TaskItems", data);
function TaskItems({ module, data, accessStatus, updateSignatures, updateForms, requiredFormDefinitions }) {

  const toast = useContext(ToastContext);

  const [viewOnlyPermission] = useState(PS.hasPermission(Enums.PermissionName.Technician, true));

  const [addTaskItemPermission] = useState(PS.hasPermission(Enums.PermissionName.AddTaskItems));

  const [userName] = useState(Storage.getCookie(Enums.Cookie.servUserName));
  const [taskItems, setTaskItems] = useState([]);

  const [createTaskItem, setCreateTaskItem] = useState(false);
  const [editTaskItem, setEditTaskItem] = useState(false);
  const [taskItemToEdit, setTaskItemToEdit] = useState(null);
  const [taskItemEditIndex, setTaskItemEditIndex] = useState(-1);
  const [hasEmployee] = useState(Storage.hasCookieValue(Enums.Cookie.employeeID) && !data.IsClosed);
  const [completeTaskItem, setCompleteTaskItem] = useState(null);

  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  useEffect(() => {
    getTaskItems();
  }, []);

  useEffect(() => {
    if (taskItems && taskItems.length > 0) {
      processSignatureTypes(taskItems);
      processFormTypes(taskItems);
    }
  }, [updateSignatures, data, updateForms]);

  const getFormExpired = (formHeader) => {
    if (!formHeader.ExpireDate) {
      return false;
    }
    return Time.now().valueOf() > Time.parseDate(formHeader.ExpireDate).valueOf();
  };

  const processFormTypes = async (tItems, saveTaskItem = true) => {

    let formTypes = tItems.filter(x => (x.ItemDataType === "CompleteForms")
      && x.Complete === false && x.IsActive === true);

    if (formTypes.length === 0) return;

    let formHeaderResponse = await Fetch.get({
      url: "/Form/GetByItemID",
      params: {
        itemID: data.ID,
        itemModule: module
      }
    });

    const formHeaders = formHeaderResponse.Results;
    let canContinue = true;
    if (requiredFormDefinitions) {
      requiredFormDefinitions.filter(x => x.IsActive).forEach(formDefinition => {
        let header = formHeaders.find(x => x.FormDefinitionID === formDefinition.ID);
        if (!header || header.FormStatus !== Enums.FormStatus.Completed || getFormExpired(header)) {
          canContinue = false;
        }
      });
    }

    formTypes.forEach(async (formType) => {
      if (canContinue) {
        formType.Complete = true;
        formType.ItemDataResult = "Completed"
        // save
        if (saveTaskItem) {
          await onTaskItemSave(formType);
        }
      }
    });

  };

  const processSignatureTypes = async (tItems, saveTaskItem = true) => {
    let sigTypes = tItems.filter(x => (x.ItemDataType === "CustomerSignature" || x.ItemDataType === "EmployeeSignature")
      && x.Complete === false && x.IsActive === true);

    if (sigTypes.length === 0) return;

    const attachmentResults = await Fetch.get({
      url: '/Attachment/GetItemAttachments',
      params: {
        itemID: data.ID,
        excludeSignatures: false
      }
    });

    const custSig = attachmentResults.Results.filter(x => x.AttachmentType === Enums.AttachmentType.CustomerSignature && x.IsActive);
    const empSig = attachmentResults.Results.filter(x => x.AttachmentType === Enums.AttachmentType.TechnicianSignature && x.IsActive);

    sigTypes.forEach(async (sigType) => {
      if (sigType.ItemDataType === "CustomerSignature" && custSig.length > 0) {
        sigType.Complete = true;
        sigType.ItemDataResult = custSig[0].ID;
        // save
        if (saveTaskItem) {
          await onTaskItemSave(sigType);
        }
      } else if (sigType.ItemDataType === "EmployeeSignature" && empSig.length > 0) {
        sigType.Complete = true;
        sigType.ItemDataResult = empSig[0].ID;
        // save
        if (saveTaskItem) {
          await onTaskItemSave(sigType);
        }
      }
    });

  };

  const getCurrentLineNumber = () => {
    if (taskItems.filter(x => x.IsActive).length > 0) {
      let displayOrders = taskItems.filter(x => x.IsActive).map((item, i) => {
        return parseInt(item.DisplayOrder);
      });
      return Math.max(...displayOrders) + 1;
    } else {
      return 1;
    }
  };

  const getTaskItems = async () => {
    const taskItemResponse = await Fetch.get({
      url: '/TaskItem/GetTaskItemsForItem',
      params: {
        itemID: data.ID
      }
    });

    setTaskItems(taskItemResponse.Results);
  };

  const updateData = async (itemsToSave) => {

    let response = await Fetch.post({
      url: '/TaskItem',
      params: {
        TaskItems: itemsToSave
      }
    });

    setTaskItems(response.Results);
  }

  const onTaskItemSaveFromManage = async (taskItem) => {
    if (taskItem) {
      await processSignatureTypes([taskItem], false);
    }
    await onTaskItemSave(taskItem);
  }

  const onTaskItemSave = async (taskItem) => {
    if (taskItem) {
      let oldTaskItems = [];
      if (createTaskItem) {
        taskItem.DisplayOrder = getCurrentLineNumber();
        oldTaskItems = !taskItems ? [] : [...taskItems];
      } else {
        oldTaskItems = !taskItems ? [] : [...taskItems.filter(x => x.ID != taskItem.ID)];
      }

      let index = taskItems.findIndex(x => x.ID == taskItem.ID);
      oldTaskItems.splice(index, 0, taskItem);

      await updateData(Helper.sortObjectArray(oldTaskItems, 'DisplayOrder'));
      setCreateTaskItem(false);
      setEditTaskItem(false);

    } else { // cancelling
      setCreateTaskItem(false);
      setEditTaskItem(false);
    }

    setCompleteTaskItem(null);
  };

  const removeTaskItem = (item) => {

    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: "Delete",
      heading: "Delete Task Item",
      text: "This will remove the task item from the list",
      onConfirm: async () => {
        let oldTaskItems = !taskItems ? [] : [...taskItems];
        let index = oldTaskItems.findIndex(x => x.ID == item.ID);
        if (index > -1) {
          oldTaskItems[index].IsActive = false;
        }
        updateData(oldTaskItems);
      },
      display: true,
      showCancel: true
    });

  };

  const toggleManageTaskItemModal = (item, index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !hasEmployee) {
      return;
    }

    setCreateTaskItem(false);
    setEditTaskItem(true);
    setTaskItemToEdit(item);
    setTaskItemEditIndex(index);
  };

  const addTaskItem = () => {
    setTaskItemToEdit(null);
    setCreateTaskItem(true);
  };

  const [addTaskItems, setAddTaskItems] = useState(false);

  const addTaskItemsFromTemplate = () => {
    setAddTaskItems(true);
  };

  const onTaskItemsFromTemplateAdd = (items) => {
    if (items) {
      let currentLineNumber = getCurrentLineNumber();
      let temp = [];
      items.forEach(item => {
        temp.push({
          ID: Helper.emptyGuid(),
          Description: item.Description,
          DueDate: null,
          Complete: false,
          CompletedDate: null,
          IsActive: true,
          DisplayOrder: currentLineNumber,
          Module: module,
          ItemID: data.ID,
          ItemDataType: item.DataType,
          ItemDataOption: item.DataOption
        });
        currentLineNumber++;
      });

      temp = temp.concat([...taskItems]);
      updateData(Helper.sortObjectArray(temp, 'DisplayOrder'));
      setAddTaskItems(false);

    } else {
      setAddTaskItems(false);
    }
  };

  const toggleItemCompleted = (item, index) => {
    if (Helper.isNullOrWhitespace(item.ItemDataType)) {
      item.Complete = !item.Complete;
      updateTaskItem(item, index);
    } else {
      toggleCompleteTaskItemModal(item, index);
    }
  };

  const toggleCompleteTaskItemModal = (item, index) => {
    setCompleteTaskItem(item);
  };


  const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {

    let tempItems = [...taskItems.filter(x => x.IsActive === true)];
    let item = tempItems.splice(previousIndex, 1);
    tempItems.splice(nextIndex, 0, item[0]);

    tempItems.filter(x => x.IsActive === true).map((item, i) => {
      item.DisplayOrder = i + 1;
    });

    updateData(tempItems);
  };

  const updateTaskItem = (item) => {
    updateData([item]);
  };

  const getEmployeeInformation = (item) => {
    if (item.TaskItemEmployees && item.TaskItemEmployees.length > 0) {
      let employeeName = item.TaskItemEmployees[0].EmployeeFullName;
      if (item.TaskItemEmployees.length > 1) {
        employeeName = employeeName + " + " + (item.TaskItemEmployees.length - 1);
      }
      const employeeNames = item.TaskItemEmployees[0].EmployeeFullName.split(' ');
      const employeeInitials = employeeNames[0][0] + employeeNames[1][0]
      return (
        <>
          <div>{employeeInitials}</div>
          <p>{employeeName}</p>
        </>
      )
    }
    else {
      return (
        <>
          <div>NA</div>
          <p>Unassigned</p>
        </>
      )
    }
  };

  const formatItemDataResult = (itemDataResult, itemDataType) => {
    let result = itemDataResult;
    let resultItems = Helper.deserializeCustomCSV(result);
    if (itemDataType) {
      switch (itemDataType) {
        case "Attachment":
          result = `${resultItems.length} attachment${resultItems.length > 1 ? 's' : ''}`;
          break;
        case "MultiSelect":
          result = `${resultItems.join(", ")}`;
          break;
        case "CustomerSignature":
        case "EmployeeSignature":
          result = null;
          break;
        case "Date":
          result = result ? result.substr(0, 10) : null;
          break;
      }
    }

    return result;
  }

  return (
    <div className="item-container">
      {/*<Flex align={'center'} gap={'xs'} mt={18} mb={-12}>
        {
          taskItems && taskItems.length > 0 &&
            <Text size={'md'} fw={600}>
              Tasks
            </Text>
        }
      </Flex>*/}

      {/*<div className="row">
        {taskItems && taskItems.length > 0 ? <div className="column heading" >
          Tasks
        </div> : ''}
      </div>*/}
      <div className="row">
        {taskItems && taskItems.length > 0 ? <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="header-item-move">
                  </th>
                  <th className="header-item-completed">
                    COMPLETED
                  </th>
                  <th className="header-item-desc">
                    DESCRIPTION
                  </th>
                  <th className="header-item-type">
                    TYPE
                  </th>
                  <th className="header-item-required">
                    REQUIRED
                  </th>
                  <th className="header-item-desc">
                    RESULT
                  </th>
                  <th className="header-item-duedate">
                    DUE DATE
                  </th>
                  <th className="header-item-completeddate">
                    COMPLETED DATE
                  </th>
                  <th className="header-item-employee">
                    EMPLOYEES
                  </th>
                  <th className="header-item-delete">
                  </th>
                </tr>
              </thead>
              <Reorder reorderId={`task-item-list`} onReorder={onReorder} lock='horizontal' component='tbody'
                placeholderClassName='reorder-placeholder' draggedClassName='reorder-dragged' disabled={disableReorder || !hasEmployee}>
                {taskItems.filter(x => x.IsActive === true).map((item, index) => {

                  let canEditTask = !viewOnlyPermission || userName === item.CreatedBy;

                  return <tr key={index}>
                    <td className="body-item-move" title="Click and drag to reorder"
                      onMouseEnter={() => setReorderToDisabled(false)} onMouseLeave={() => setReorderToDisabled(true)}>
                      <img src="/icons/menu-light.svg" alt="move" />
                    </td>
                    <td className="body-item-completed">
                      <CellCheckbox value={item.Complete} itemId={item.ID} selectedItems={[item.Complete ? item.ID : null]}
                        setSelectedItems={() => { toggleItemCompleted(item, index) }} />
                    </td>
                    <td className="body-item-desc"  >
                      {item.Description}
                    </td>
                    <td>
                      {Enums.TaskTemplateDataTypes[item.ItemDataType]}
                    </td>
                    <td>
                      <CellCheckbox value={item.Required} itemId={item.ID} selectedItems={[item.Required ? item.ID : null]} disabled={true} />
                    </td>
                    <td className="body-item-desc" title='Result'>
                      {formatItemDataResult(item.ItemDataResult, item.ItemDataType)}
                    </td>
                    <td className="body-item-duedate">
                      {item.DueDate ? Time.getDateFormatted(item.DueDate, 'yyyy-MM-dd') : ''}
                    </td>
                    <td className="body-item-completeddate">
                      {item.CompletedDate ? Time.getDateFormatted(item.CompletedDate, 'yyyy-MM-dd') : ''}
                    </td>
                    <td className="body-item-employee">
                      <div className="employee">
                        {getEmployeeInformation(item)}
                      </div>
                    </td>
                    <td className="body-item-delete" title="Delete task item">
                      {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && hasEmployee ? <>
                        {canEditTask ? <Flex direction={'column'} gap={0} align={'center'}>
                          <img className="pointer" src="/icons/edit.svg" alt="edit" onClick={() => toggleManageTaskItemModal(item, index)} /> &nbsp;
                          <img className="pointer" src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeTaskItem(item)} />
                        </Flex> : ""}
                      </> : ''}
                    </td>
                  </tr>
                })}
              </Reorder>
            </table>
          </div>
        </> : ''}
      </div>

      <ToolbarButtons justify={'start'} wrap={'wrap'} mt={'md'} buttonGroups={[
          [
            {
              show: hasEmployee,
              type: 'button',
              icon: <IconCirclePlus />,
              variant: 'outline',
              onClick: () => addTaskItem(),
              children: ['Add Task'],
              disabled: accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !addTaskItemPermission,
            }
          ],
          [
            {
              show: hasEmployee,
              type: 'button',
              icon: <IconCirclePlus />,
              variant: 'outline',
              onClick: () => addTaskItemsFromTemplate(),
              children: ['Add Tasks from Template'],
              disabled: accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !addTaskItemPermission,
            }
          ]
      ]}
      />
      {/*<div className="button-row">
        {hasEmployee  ?
          <React.Fragment>
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !addTaskItemPermission}
              text="Add Task" icon="plus-circle-blue" extraClasses="hollow fit-content right-margin" onClick={() => addTaskItem()} />
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !addTaskItemPermission}
              text="Add Tasks from Template" icon="plus-circle-blue" extraClasses="hollow fit-content" onClick={() => addTaskItemsFromTemplate()} />
          </React.Fragment>
          : ""}
      </div>*/}

      {createTaskItem || editTaskItem ?
        <ManageTaskItem isNew={createTaskItem} module={module} taskItem={taskItemToEdit} onTaskItemSave={onTaskItemSaveFromManage}
          data={data} accessStatus={accessStatus} />
        : ''}

      {completeTaskItem ?
        <CompleteTaskItem taskItem={completeTaskItem} onTaskItemSave={onTaskItemSave} accessStatus={accessStatus} setCompleteTaskItem={setCompleteTaskItem}
          requiredFormDefinitions={(module === Enums.Module.JobCard && data.JobType ? data.JobType.FormDefinitions : [])}
        />
        : ''}

      {addTaskItems ?
        <AddTaskItems module={module} onTaskItemsAdd={onTaskItemsFromTemplateAdd} accessStatus={accessStatus} />
        : ''
      }

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }
        .button-row {
          display: flex;
          justify-content: flex-start;
        }
        .column {
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
        }
        .column :global(.textarea-container) {
          height: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
        }
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
          //cursor: pointer;
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
        .header-item-move {
          width: 5%;
          min-width: 30px;
        }
        .header-item-duedate {
          width: 5%;
          min-width: 100px;
        }
        .header-item-desc {
          min-width: 100px;
        }
        .header-item-type {
          min-width: 80px;
        }
        .header-item-employee {
          width: 200px;
          min-width: 200px;
        }
        .header-item-delete {
          width: 5%;
          min-width: 30px;
        }

        .body-item-move {
          cursor: move;
        }
        .body-item-desc {
          // color: ${colors.bluePrimary};
          // cursor: pointer;
        }
        .body-item-duedate {

        }
        .body-item-employee {
          min-width: 200px;
        }

        .employee {
          align-items: center;
          display: flex;
        }
        .employee :global(div){
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 12px;
          color: ${colors.white};
          display: flex;
          font-size: 12px;
          font-weight: bold;
          height: 24px;
          justify-content: center;
          margin-right: 4px;
          width: 24px;
        }
        .employee :global(p){
          color: ${colors.bluePrimary};
          font-size: 12px;
        }

        .pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default TaskItems;
