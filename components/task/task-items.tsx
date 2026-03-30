import React, { FC, useEffect, useMemo, useState } from 'react';
import ManageTaskItem from '../modals/task/manage-task-item';
import AddTaskItems from '../modals/task-template/add-task-items';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Time from '../../utils/time';
import CellCheckbox from '../cells/checkbox';
import Storage from '../../utils/storage';
import CompleteTaskItem from '../modals/task/complete-task-item';
import Fetch from '../../utils/Fetch';
import ConfirmAction from '../modals/confirm-action';
import PS from '../../services/permission/permission-service';
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import { IconCirclePlus, IconPencil, IconTrash } from "@tabler/icons-react";
import {Box, Flex, Text} from "@mantine/core";
import { showNotification } from '@mantine/notifications';
import SimpleTable, { SimpleColumnMapping } from "@/PageComponents/SimpleTable/SimpleTable";
import EmployeeGroup from "@/PageComponents/Employee/EmployeeGroup";

// Minimal prop typing to avoid broad refactors
interface TaskItemsProps {
  module: any;
  data: any; // job or query item
  accessStatus: number;
  updateSignatures?: any;
  updateForms?: any;
  requiredFormDefinitions?: any[];
}

const TaskItems: FC<TaskItemsProps> = ({ module, data, accessStatus, updateSignatures, updateForms, requiredFormDefinitions }) => {
  const [viewOnlyPermission] = useState(PS.hasPermission(Enums.PermissionName.Technician, true));
  const [addTaskItemPermission] = useState(PS.hasPermission(Enums.PermissionName.AddTaskItems));
  const [userName] = useState(Storage.getCookie(Enums.Cookie.servUserName));
  const [taskItems, setTaskItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [createTaskItem, setCreateTaskItem] = useState(false);
  const [editTaskItem, setEditTaskItem] = useState(false);
  const [taskItemToEdit, setTaskItemToEdit] = useState<any | null>(null);
  const [taskItemEditIndex, setTaskItemEditIndex] = useState<number>(-1);
  const [hasEmployee] = useState(Storage.hasCookieValue(Enums.Cookie.employeeID) && !data.IsClosed);
  const [completeTaskItem, setCompleteTaskItem] = useState<any | null>(null);

  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  useEffect(() => {
    getTaskItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (taskItems && taskItems.length > 0) {
      processSignatureTypes(taskItems);
      processFormTypes(taskItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSignatures, data, updateForms]);

  const getFormExpired = (formHeader: any) => {
    if (!formHeader.ExpireDate) return false;
    return Time.now().valueOf() > Time.parseDate(formHeader.ExpireDate).valueOf();
  };

  const processFormTypes = async (tItems: any[], saveTaskItem = true) => {
    const formTypes = tItems.filter(x => (x.ItemDataType === "CompleteForms") && x.Complete === false && x.IsActive === true);
    if (formTypes.length === 0) return;

    const formHeaderResponse = await Fetch.get({
      url: "/Form/GetByItemID",
      params: { itemID: data.ID, itemModule: module }
    });

    const formHeaders = formHeaderResponse.Results;
    let canContinue = true;
    if (requiredFormDefinitions) {
      requiredFormDefinitions.filter((x: any) => x.IsActive).forEach((formDefinition: any) => {
        const header = formHeaders.find((x: any) => x.FormDefinitionID === formDefinition.ID);
        if (!header || header.FormStatus !== Enums.FormStatus.Completed || getFormExpired(header)) {
          canContinue = false;
        }
      });
    }

    formTypes.forEach(async (formType: any) => {
      if (canContinue) {
        formType.Complete = true;
        formType.ItemDataResult = "Completed";
        if (saveTaskItem) {
          await onTaskItemSave(formType);
        }
      }
    });
  };

  const processSignatureTypes = async (tItems: any[], saveTaskItem = true) => {
    const sigTypes = tItems.filter(x => (x.ItemDataType === "CustomerSignature" || x.ItemDataType === "EmployeeSignature") && x.Complete === false && x.IsActive === true);
    if (sigTypes.length === 0) return;

    const attachmentResults = await Fetch.get({
      url: '/Attachment/GetItemAttachments',
      params: { itemID: data.ID, excludeSignatures: false }
    });

    const custSig = attachmentResults.Results.filter((x: any) => x.AttachmentType === Enums.AttachmentType.CustomerSignature && x.IsActive);
    const empSig = attachmentResults.Results.filter((x: any) => x.AttachmentType === Enums.AttachmentType.TechnicianSignature && x.IsActive);

    sigTypes.forEach(async (sigType: any) => {
      if (sigType.ItemDataType === "CustomerSignature" && custSig.length > 0) {
        sigType.Complete = true;
        sigType.ItemDataResult = custSig[0].ID;
        if (saveTaskItem) await onTaskItemSave(sigType);
      } else if (sigType.ItemDataType === "EmployeeSignature" && empSig.length > 0) {
        sigType.Complete = true;
        sigType.ItemDataResult = empSig[0].ID;
        if (saveTaskItem) await onTaskItemSave(sigType);
      }
    });
  };

  const getCurrentLineNumber = () => {
    const active = taskItems.filter(x => x.IsActive);
    if (active.length > 0) {
      const displayOrders = active.map((item) => parseInt(item.DisplayOrder));
      return Math.max(...displayOrders) + 1;
    } else {
      return 1;
    }
  };

  const getTaskItems = async () => {
    const taskItemResponse = await Fetch.get({
      url: '/TaskItem/GetTaskItemsForItem',
      params: { itemID: data.ID }
    });
    setTaskItems(taskItemResponse.Results);
  };

  const updateData = async (itemsToSave: any[], silent = true) => {
    setIsSaving(true);
    try {
      const response = await Fetch.post({
        url: '/TaskItem',
        params: { TaskItems: itemsToSave }
      });
      if (response.Results) {
        setTaskItems(response.Results);
        return true;
      } else {
        throw new Error(response.serverMessage || response.message || response.error || 'Something went wrong');
      }
    } catch (e: any) {
      showNotification({
        message: e.message || 'An error occurred while saving',
        color: 'yellow.7'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const onTaskItemSaveFromManage = async (taskItem: any) => {
    if (taskItem) {
      await processSignatureTypes([taskItem], false);
    }
    await onTaskItemSave(taskItem);
  };

  const onTaskItemSave = async (taskItem: any) => {
    if (taskItem) {
      let oldTaskItems: any[] = [];
      if (createTaskItem) {
        taskItem.DisplayOrder = getCurrentLineNumber();
        oldTaskItems = !taskItems ? [] : [...taskItems];
      } else {
        oldTaskItems = !taskItems ? [] : [...taskItems.filter(x => x.ID != taskItem.ID)];
      }

      const index = taskItems.findIndex(x => x.ID == taskItem.ID);
      oldTaskItems.splice(index, 0, taskItem);

      const success = await updateData(Helper.sortObjectArray(oldTaskItems, 'DisplayOrder'));
      if (success) {
        setCreateTaskItem(false);
        setEditTaskItem(false);
        setCompleteTaskItem(null);
      }
    } else {
      // cancelling
      setCreateTaskItem(false);
      setEditTaskItem(false);
      setCompleteTaskItem(null);
    }
  };

  const removeTaskItem = (item: any) => {
    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: "Delete",
      heading: "Delete Task Item",
      text: "This will remove the task item from the list",
      onConfirm: async () => {
        const oldTaskItems = !taskItems ? [] : [...taskItems];
        const index = oldTaskItems.findIndex(x => x.ID == item.ID);
        if (index > -1) {
          oldTaskItems[index].IsActive = false;
        }
        updateData(oldTaskItems);
      },
      display: true,
      showCancel: true
    });
  };

  const toggleManageTaskItemModal = (item: any, index: number) => {
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

  const addTaskItemsFromTemplate = () => setAddTaskItems(true);

  const onTaskItemsFromTemplateAdd = async (items: any[] | null) => {
    if (items) {
      let currentLineNumber = getCurrentLineNumber();
      let temp: any[] = [];
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
      const success = await updateData(Helper.sortObjectArray(temp, 'DisplayOrder'), true);
      if (success) {
        setAddTaskItems(false);
      }
    } else {
      setAddTaskItems(false);
    }
  };

  const onCompleteToggle = (item: any) => {
    if (Helper.isNullOrWhitespace(item.ItemDataType)) {
      item.Complete = !item.Complete;
      updateTaskItem(item);
    } else {
      setCompleteTaskItem(item);
    }
  };

  const updateTaskItem = (item: any) => updateData([item]);

  const getEmployeeInformation = (item: any) => {
    if (item.TaskItemEmployees && item.TaskItemEmployees.length > 0) {
      let employeeName = item.TaskItemEmployees[0].EmployeeFullName;
      if (item.TaskItemEmployees.length > 1) {
        employeeName = employeeName + " + " + (item.TaskItemEmployees.length - 1);
      }
      // const employeeNames = item.TaskItemEmployees[0].EmployeeFullName.split(' ');
      // const employeeInitials = (employeeNames[0]?.[0] || '') + (employeeNames[1]?.[0] || '')
      return (
        <Flex align={'center'} gap={3}>
            <Box mb={1}>
                <EmployeeGroup
                    employees={item.TaskItemEmployees.map(x => ({ID: x.EmployeeID, FullName: x.EmployeeFullName, DisplayColor: x.EmployeeDisplayColor, EmailAddress: x.EmployeeEmailAddress, MobileNumber: x.EmployeeMobileNumber}))}
                />
            </Box>
            <Text size={'sm'} mt={2}>{employeeName}</Text>
        </Flex>
      )
    }
    else {
      return (
        <>
          {/*<Text size={'sm'}>NA</Text>*/}
        </>
      )
    }
  };

  const formatItemDataResult = (itemDataResult: any, itemDataType: string) => {
    let result: any = itemDataResult;
    const resultItems = Helper.deserializeCustomCSV(result);
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

  const activeTaskItems = useMemo(() => (taskItems || []).filter(x => x.IsActive === true), [taskItems]);

  const columns: SimpleColumnMapping[] = useMemo(() => [
    {
      key: 'Complete',
      label: 'Completed',
        columnWidth: 300,
        minColumnWidth: 90,
      valueFunction: (item: any) => (
        <CellCheckbox
          value={item.Complete}
          itemId={item.ID}
          selectedItems={[item.Complete ? item.ID : null]}
          setSelectedItems={() => onCompleteToggle(item)}
        />
      ),
      columConfigOptions: { allowShowToggle: false }
    },
    {
      key: 'Description',
      label: 'Description',
        columnWidth: 300,
        minColumnWidth: 100,
      valueFunction: (item: any) => <Text size={'sm'} lineClamp={10} maw={500}>{item.Description}</Text>,
      stylingProps: { darkerText: true }
    },
    {
      key: 'ItemDataType',
      label: 'Type',
        columnWidth: 300,
        minColumnWidth: 100,
      valueFunction: (item: any) => Enums.TaskTemplateDataTypes[item.ItemDataType]
    },
    {
      key: 'Required',
      label: 'Required',
        columnWidth: 300,
        minColumnWidth: 100,
      valueFunction: (item: any) => (
        <CellCheckbox {...{} as any} value={item.Required} itemId={item.ID} selectedItems={[item.Required ? item.ID : null]} disabled={true} />
      ),
    },
    {
      key: 'ItemDataResult',
      label: 'Result',
        columnWidth: 300,
        minColumnWidth: 100,
      valueFunction: (item: any) => <Text size={'sm'} lineClamp={10} maw={500}>{formatItemDataResult(item.ItemDataResult, item.ItemDataType)}</Text>,
    },
    {
      key: 'DueDate',
      label: 'Due Date',
        columnWidth: 300,
        minColumnWidth: 100,
      valueFunction: (item: any) => item.DueDate ? Time.getDateFormatted(item.DueDate, 'yyyy-MM-dd') : ''
    },
    {
      key: 'CompletedDate',
      label: 'Completed Date',
        columnWidth: 300,
        minColumnWidth: 140,
      valueFunction: (item: any) => item.CompletedDate ? Time.getDateFormatted(item.CompletedDate, 'yyyy-MM-dd') : ''
    },
    {
      key: 'Employees',
      label: 'Employees',
        columnWidth: 300,
        minColumnWidth: 100,
      valueFunction: (item: any) => getEmployeeInformation(item)
    }
  ], [taskItems]);

  const onReorderSimpleTable = (newItems: any[]) => {
    const tempItems = [...newItems];
    tempItems.forEach((item, i) => item.DisplayOrder = i + 1);
    updateData(tempItems);
  };

  const canShowActions = (item: any) => {
    const canEditTask = !viewOnlyPermission || userName === item.CreatedBy;
    return accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && hasEmployee && canEditTask;
  }

  return (
    <div className="item-container">
      {activeTaskItems && activeTaskItems.length > 0 && (
        <div >
          <SimpleTable
            stylingProps={{ compact: true, darkerText: true, rows: false }}
            data={activeTaskItems}
            mapping={columns}
            onReorder={hasEmployee ? onReorderSimpleTable : undefined}
            controls={[
              {
                name: 'edit',
                label: 'Edit',
                icon: <IconPencil size={16} />,
                showFunction: (item: any) => canShowActions(item),
                lightMode: true
              },
              {
                name: 'delete',
                label: 'Delete',
                icon: <IconTrash size={16} />,
                showFunction: (item: any) => canShowActions(item),
                lightMode: true
              }
            ]}
            onAction={(actionName, actionItem, actionItemIndex) => {
              if (actionName === 'edit') toggleManageTaskItemModal(actionItem, actionItemIndex);
              if (actionName === 'delete') removeTaskItem(actionItem);
            }}
          />
        </div>
      )}

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
            isBusy: isSaving,
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
            isBusy: isSaving,
          }
        ]
      ] as any}
      />

      {createTaskItem || editTaskItem ? (
        <ManageTaskItem isNew={createTaskItem} module={module} taskItem={taskItemToEdit} onTaskItemSave={onTaskItemSaveFromManage}
          data={data} accessStatus={accessStatus} />
      ) : null}

      {completeTaskItem ? (
        <CompleteTaskItem taskItem={completeTaskItem} onTaskItemSave={onTaskItemSave} accessStatus={accessStatus} setCompleteTaskItem={setCompleteTaskItem}
          requiredFormDefinitions={(module === Enums.Module.JobCard && data.JobType ? data.JobType.FormDefinitions : [])}
        />
      ) : null}

      {addTaskItems ? (
        <AddTaskItems module={module} onTaskItemsAdd={onTaskItemsFromTemplateAdd} accessStatus={accessStatus} />
      ) : null}

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />
    </div>
  );
}

export default TaskItems;
