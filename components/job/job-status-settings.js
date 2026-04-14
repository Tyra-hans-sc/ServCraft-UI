import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import Router from 'next/router';
import Button from '../button';
import StatusField from '../status-field';
import { colors, layout, shadows } from '../../theme';
import Fetch from '../../utils/Fetch';
import StatusOptions from '../modals/status-options';
import ToastContext from '../../utils/toast-context';
import { SketchPicker } from 'react-color';
import { useOutsideClick } from "rooks";
import Helper from '../../utils/helper';
import ConfirmAction from '../modals/confirm-action';
import Reorder, { reorder } from 'react-reorder';
import * as Enums from '../../utils/enums';
import Storage from '../../utils/storage';
import TriggerList from '../modals/trigger/trigger-list';
import Constants from '../../utils/constants';
import Search from '../search';
import WorkflowSelector from '../selectors/workflow-selector';

import SCInput from '../sc-controls/form-controls/sc-input';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import SCMultiSelect from '../sc-controls/form-controls/sc-multiselect';
import SCChipList from '../sc-controls/form-controls/sc-chiplist';
import ScSwitch from "../sc-controls/form-controls/sc-switch";
import { IconCheck, IconEdit, IconPlus, IconX } from '@tabler/icons-react';
import { Box, Flex, Button as MantineButton } from '@mantine/core';
import SimpleTable from '../../PageComponents/SimpleTable/SimpleTable';
import SCWidgetTitle from '../sc-controls/widgets/new/sc-widget-title';
import ScStatusData from '../../PageComponents/Table/Table/ScStatusData';
import constants from '../../utils/constants';
import featureService from '../../services/feature/feature-service';

function JobStatusSettings({ customFields, isWorkflow }) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});
  const [hasStockControl, setHasStockControl] = useState();

  const [statuses, setStatuses] = useState([]);
  const [connections, setConnections] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState();
  const [initialStatusName, setInitialStatusName] = useState('');
  const [statusName, setStatusName] = useState();
  const [statusColor, setStatusColor] = useState('Black');
  const [closeStatus, setCloseStatus] = useState(false);
  const [canContractorProceed, setContractorCanProceed] = useState(false);
  const [startTimer, setStartTimer] = useState(false);
  const [endTimer, setEndTimer] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [formCompleted, setFormCompleted] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [materialsInProgress, setMaterialsInProgress] = useState(false);
  const [materialsUsed, setMaterialsUsed] = useState(false);
  const [jobCardAttach, setJobCardAttach] = useState(false);
  const [workshopAttach, setWorkshopAttach] = useState(false);
  const [signedOffAttach, setSignedOffAttach] = useState(false);
  const [selectedStatusOptions, setSelectedStatusOptions] = useState();
  const [addingOptions, setAddingOptions] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
  const [triggerListVisible, setTriggerListVisible] = useState(false);
  const [triggersForStatus, setTriggersForStatus] = useState([]);

  const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
  const [flowType, setFlowType] = useState(Enums.FlowType.Flowless);
  const [selectedWorkflow, setSelectedWorkflow] = useState();

  const getDefaultWorkflow = async () => {
    let workflowResult = await Fetch.get({
      url: `/Workflow/GetDefaultWorkflow`,
    });
    setSelectedWorkflow(workflowResult);
  };

  useEffect(() => {
    // if (selectedWorkflow) {
    getJobStatuses("[selectedWorkflow]");
    // }
    setFlowType(selectedWorkflow ? selectedWorkflow.FlowType : Enums.FlowType.Flowless);
  }, [selectedWorkflow]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
      setHasStockControl(!!feature);
    })
    getDefaultWorkflow();
    getAccessStatus();
    setIsLoaded(true);
  }, []);

  const getAccessStatus = () => {
    let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
    if (subscriptionInfo) {
      setAccessStatus(subscriptionInfo.AccessStatus);
    }
  };

  const getJobStatuses = async (location) => {

    if (isWorkflow && !selectedWorkflow) {
      return;
    }

    // console.log("getJobStatuses", location);

    let url = '';
    if (isWorkflow) {
      url = `/JobStatus?onlyActive=${!ancillaryFilters['ShowDisabled']}&workflowID=${selectedWorkflow.ID}`;
    } else {
      url = `/JobStatus?onlyActive=${!ancillaryFilters['ShowDisabled']}`;
    }

    const getResponse = await Fetch.get({
      url: url
    });

    let jobStatusResults = getResponse.Results;
    setStatuses(jobStatusResults);
  };

  const getFilteredStatuses = () => {
    let statusesFiltered = [...statuses];
    if (!Helper.isNullOrWhitespace(searchVal)) {

      if (flowType === Enums.FlowType.WorkFlow) {
        let tempList = connections.length > 0 ? connections.filter(x => x.FromJobCardStatusDescription.toLowerCase().replace(/\s/g, '').includes(searchVal.toLowerCase().replace(/\s/g, ''))
          || x.ToJobCardStatusDescription.toLowerCase().replace(/\s/g, '').includes(searchVal.toLowerCase().replace(/\s/g, ''))) : [];

        let statusIDList = tempList.map(x => x.FromJobCardStatusID);
        statusesFiltered = statusesFiltered.filter(x => {
          return (statusIDList.some(y => y === x.ID) || x.Description.toLowerCase().replace(/\s/g, '').includes(searchVal.toLowerCase().replace(/\s/g, '')));
        });
      } else {
        statusesFiltered = statusesFiltered.filter(x => x.Description.toLowerCase().replace(/\s/g, '').includes(searchVal.toLowerCase().replace(/\s/g, '')));
      }
    }
    return statusesFiltered;
  };

  useEffect(() => {
    if (accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      Helper.nextRouter(Router.replace, "/");
    }
  }, [accessStatus]);

  Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, updateSettings);

  const [availableJobStatusConnections, setAvailableJobStatusConnections] = useState([]);
  const [selectedJobStatusConnections, setSelectedJobStatusConnections] = useState([]);

  const getAvailableJobStatusConnections = (status) => {
    let availableItems = statuses ? statuses.filter(x => x.ID != status.ID) : [];
    availableItems = Helper.sortObjectArray(availableItems, 'Description');
    setAvailableJobStatusConnections(availableItems);
  };

  const handleSelectedJobStatusConnectionChange = (statusConnections) => {
    setSelectedJobStatusConnections(statusConnections);
  };

  const getSelectedJobStatusConnections = async (jobStatusID) => {

    let availableItems = statuses ? statuses.filter(x => x.ID != jobStatusID) : [];

    const getResponse = await Fetch.get({
      url: `/JobStatus/JobStatusConnectionsForJobStatus?jobStatusID=${jobStatusID}&onlyActive=${true}`
    });

    let results = getResponse.Results;

    if (results) {
      availableItems = availableItems.filter(x => {
        return results.some(y => y.ToJobCardStatusID == x.ID);
      });
      setSelectedJobStatusConnections(availableItems);
    } else {
      setSelectedJobStatusConnections([]);
    }
  };

  const [searchVal, setSearchVal] = useState('');

  const [ancillaryFilters, setAncillaryFilters] = useState({ ShowDisabled: false });

  let ancillaryFilterList = useRef({
    ShowDisabled: [{
      type: Enums.ControlType.Switch,
      label: 'Include disabled items',
    }],
  });

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      let oldFilters = { ...ancillaryFilters };
      Object.keys(oldFilters).filter(key => !result.ignore.includes(key)).forEach(key => oldFilters[key] = false);
      setAncillaryFilters(oldFilters);
    } else {
      setAncillaryFilters({
        ...ancillaryFilters,
        [result.key]: result.checked
      });
    }
  };

  const getJobStatusConnections = async () => {
    const getResponse = await Fetch.get({
      url: `/JobStatus/JobStatusConnections?onlyActive=${true}`
    });
    setConnections(getResponse.Results);
  };

  useEffect(() => {
    getJobStatuses("[ancillaryFilters, searchVal]");
  }, [ancillaryFilters, searchVal]);

  const getNextJobStatuses = (status) => {
    let tempList = connections.length > 0 ? connections.filter(x => x.FromJobCardStatusID == status.ID) : [];
    tempList = Helper.sortObjectArray(tempList, 'ToJobCardStatusDescription');
    return tempList;
  }

  const getJobStatusMultiSelect = (status, index) => {
    let tempList = getNextJobStatuses(status);
    return <SCChipList key={index} disabled={true} options={tempList} textField={'ToJobCardStatusDescription'} valueField={'ID'} />;
  };

  useEffect(() => {
    if (flowType == Enums.FlowType.WorkFlow) {
      getJobStatusConnections();
    }
  }, [flowType]);

  let currPath = "";
  if (Router.router) {
    currPath = Router.router.asPath;
  }

  const pickerRef = useRef();
  useOutsideClick(pickerRef, () => {
    if (showPicker) {
      setShowPicker(false);
    }
  });

  const validate = () => {
    let inputs = [
      { key: 'StatusName', value: statusName, required: true, type: Enums.ControlType.Text },
    ];

    if (isWorkflow) {
      inputs = [...inputs,
      { key: 'Workflow', value: selectedWorkflow, required: true, type: Enums.ControlType.Select },
      ];
    }

    const { isValid, errors } = Helper.validateInputs(inputs);
    setInputErrors(errors);

    return isValid;
  };

  async function updateSettings() {
    setSubmitting(true);

    let isValid = validate();

    if (isValid) {

      let settingsUpdateResult;
      let jobStatusParams = {
        ...selectedStatus,
        Description: statusName,
        DisplayColor: statusColor,
        CloseStatus: closeStatus,
        CanContractorProceed: canContractorProceed,
        AttachJobCard: jobCardAttach,
        AttachWorkshop: workshopAttach,
        AttachSignOff: signedOffAttach,
        StartTimer: startTimer,
        EndTimer: endTimer,
        FormCompleted: formCompleted,
        TaskCompleted: taskCompleted,
        WorkCompleted: materialsUsed,
        WorkInProgress: materialsInProgress
      };

      if (isWorkflow) {
        jobStatusParams = {
          ...jobStatusParams,
          WorkflowID: selectedWorkflow ? selectedWorkflow.ID : null,
        };
      }

      if (selectedStatus.ID) {
        settingsUpdateResult = await Fetch.put({
          url: '/JobStatus',
          params: {
            JobStatus: {
              ...jobStatusParams,
              IsActive: isActive,
            },
            JobStatusOptions: selectedStatusOptions,
            JobStatusIDList: selectedJobStatusConnections.length > 0 ? selectedJobStatusConnections.map(x => x.ID) : [],
          },
          toastCtx: toast
        });
      } else {
        settingsUpdateResult = await Fetch.post({
          url: '/JobStatus',
          params: {
            JobStatus: jobStatusParams,
            JobStatusOptions: selectedStatusOptions,
            JobStatusIDList: selectedJobStatusConnections.length > 0 ? selectedJobStatusConnections.map(x => x.ID) : [],
          },
          toastCtx: toast
        });
      }

      if (settingsUpdateResult.ID) {
        toast.setToast({
          message: 'Status updated successfully',
          show: true,
          type: 'success'
        });
      }

      setSearchVal(null);
      const statusesResponse = await Fetch.get({
        url: `${isWorkflow ? `/JobStatus?workflowID=${selectedWorkflow?.ID ?? null}` : `/JobStatus`}`,
        toastCtx: toast
      });
      setStatuses(statusesResponse.Results);

      setSelectedStatus(undefined);
      setSelectedStatusOptions(undefined);
      getJobStatusConnections();

      setFormIsDirty(false);
    } else {
      toast.setToast({
        message: 'Status name or workflow is not set',
        show: true,
        type: Enums.ToastType.error,
      });
    }

    setSubmitting(false);
    return true;
  }

  async function getStatusOptions(status) {
    const statusOptionsResult = await getOptions(status);
    if (statusOptionsResult.Results) {
      let options = statusOptionsResult.Results;
      //console.log(options);
      setSelectedStatusOptions(options);
    }
  }

  async function newStatus() {

    setStatusName('');
    setInitialStatusName('');
    setStatusColor("Black");
    let options = [];
    Object.keys(Enums.JobStatusOptionName).forEach((key, idx) => {
      options[idx] = {
        JobStatusOptionName: Enums.JobStatusOptionName[key],
        OptionConfiguration: 0,
        IsActive: false
      }
    });

    setSelectedStatusOptions(options)
    setSelectedStatus({
      CloseStatus: false,
      DisplayColor: 'Black',
      IsActive: true,
      Location: null,
      StatusNode: null,
      StatusOrder: statuses.length + 1,
      StartStatus: false,
      ID: Helper.emptyGuid()
    });
    setFormIsDirty(false);
  }

  useEffect(() => {
    if (selectedStatus) {
      getStatusOptions(selectedStatus);
      setStatusName(selectedStatus.Description);
      setInitialStatusName(selectedStatus.Description);
      setStatusColor(selectedStatus.DisplayColor);
      setCloseStatus(selectedStatus.CloseStatus);
      setContractorCanProceed(selectedStatus.CanContractorProceed);
      setJobCardAttach(selectedStatus.AttachJobCard);
      setWorkshopAttach(selectedStatus.AttachWorkshop);
      setSignedOffAttach(selectedStatus.AttachSignOff);
      setStartTimer(selectedStatus.StartTimer);
      setEndTimer(selectedStatus.EndTimer);
      setFormCompleted(selectedStatus.FormCompleted);
      setTaskCompleted(selectedStatus.TaskCompleted);
      setMaterialsInProgress(selectedStatus.WorkInProgress);
      setMaterialsUsed(selectedStatus.WorkCompleted);

      if (flowType == Enums.FlowType.WorkFlow) {
        getAvailableJobStatusConnections(selectedStatus);
        getSelectedJobStatusConnections(selectedStatus.ID);
      }

      setIsActive(selectedStatus.IsActive);
    }

    getTriggersForStatus();
  }, [selectedStatus]);

  const getTriggersForStatus = () => {
    if (selectedStatus) {
      Fetch.post({
        url: '/Trigger/GetTriggers',
        params: {
          ModuleList: [Enums.getEnumStringValue(Enums.Module, Enums.Module.JobCard)],
          PageSize: 1000
        }
      }).then(response => {
        let results = response.Results.filter(x => {
          let meta = JSON.parse(x.TriggerConditions[0].MetaData);
          return meta && ((Array.isArray(meta.JobStatusIDs) && meta.JobStatusIDs.includes(selectedStatus.ID)) || meta.JobStatusID === selectedStatus.ID)
        });
        // console.log(results, response.Results);
        setTriggersForStatus(results);
      });
    } else {
      setTriggersForStatus([]);
    }
  }

  function updateStatusOption(optionName, newValue) {
    let newStatusOptions = [...selectedStatusOptions];
    let editOption = newStatusOptions.find(option => option.JobStatusOptionName == optionName)
    editOption.OptionConfiguration = newValue;
    setSelectedStatusOptions(newStatusOptions)
    setFormIsDirty(true);
  }

  function removeStatusOption(optionName, newValue) {
    // let newStatusOptions = selectedStatusOptions.filter(option => option.JobStatusOptionName != optionName)
    // setSelectedStatusOptions(newStatusOptions)

    let newStatusOptions = [...selectedStatusOptions]
    let changeOption = newStatusOptions.find(option => option.JobStatusOptionName == optionName)
    changeOption.OptionConfiguration = 0;
    changeOption.IsActive = false;
    setSelectedStatusOptions(newStatusOptions)
    setFormIsDirty(true);
  }

  function saveOptions(addedOptions) {
    let newOptions = [
      ...selectedStatusOptions
    ]
    addedOptions.map(function (addedOption) {
      let changeOption = newOptions.find(option => option.JobStatusOptionName == addedOption.JobStatusOptionName);
      changeOption.OptionConfiguration = 1;
      changeOption.IsActive = true;
    })
    setSelectedStatusOptions(newOptions);
    setAddingOptions(false);
    setFormIsDirty(true);
  }

  const [disableReorder, setReorderToDisabled] = useState(true);

  const onStatusItemClick = (status) => {
    if (status.IsActive) {
      setFormIsDirty(false);
    }
    setSelectedStatus(status);
  };

  const updateAllOnReorder = async (statusesUpdate) => {
    await Fetch.put({
      url: '/JobStatus/PutJobStatus',
      params: statusesUpdate,
      toastCtx: toast
    });
  };

  const refetchData = async () => {
    const statusesResponse = await Fetch.get({
      url: `${isWorkflow ? `/JobStatus?workflowID=${selectedWorkflow?.ID ?? null}` : `/JobStatus`}`,
      toastCtx: toast
    });
    setStatuses(statusesResponse.Results);

    setSelectedStatus(undefined);
    setSelectedStatusOptions(undefined);
  };

  const getOptions = async (status) => {
    return await Fetch.get({
      url: '/JobStatus/JobStatusOption',
      params: {
        jobStatusID: status.ID
      }
    });
  };

  async function onReorderSimpleTable(statusesInOrder) {

    console.log('new order', statusesInOrder)

    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    let tempStatuses = statusesInOrder.map(sts => {
      return { ...sts };
    });

    tempStatuses.map((s, i) => {
      s.StatusOrder = i + 1;
    });

    setStatuses(tempStatuses);

    await updateAllOnReorder(tempStatuses);

    refetchData();
  }

  async function onReorder(event, previousIndex, nextIndex, fromId, toId) {

    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    let tempStatuses = statuses.map(sts => {
      return { ...sts };
    });

    const item = tempStatuses.splice(previousIndex, 1);
    tempStatuses.splice(nextIndex, 0, item[0]);

    tempStatuses.map((s, i) => {
      s.StatusOrder = i + 1;
    });

    reorder(tempStatuses, previousIndex, nextIndex);
    setStatuses(tempStatuses);

    await updateAllOnReorder(tempStatuses);

    refetchData();
  }

  useEffect(() => {
    if (!triggerListVisible) {
      getTriggersForStatus();
    }
  }, [triggerListVisible]);

  const tableControls = useMemo(() => {
    return [
      {
        label: 'Remove',
        activeLabel: 'Removing',
        name: 'remove',
        type: 'warning',
        icon: <IconX />,
        conditionalDisable: (x) => {
          return x.StartStatus;
        }
      }
    ]
  }, [getFilteredStatuses()])

  if (!isLoaded) {
    return <></>;
  }

  return (
    <div className="">
      <div className="row">
        <div style={{ width: "100%" }}>
          <SCWidgetTitle marginTop={"1rem"} title='Job Statuses' />

          {!selectedStatus ?
            <>
              <div style={{ maxWidth: "490px" }}>
                <Search
                  placeholder="Search"
                  searchVal={searchVal}
                  setSearchVal={setSearchVal}
                  searchFunc={() => getJobStatuses("Search")}
                  ancillaryFilters={ancillaryFilterList.current}
                  setAncillaryFilters={handleAncillaryFilterChange}
                  initialAncillaryFilters={ancillaryFilters["ShowDisabled"] ? ancillaryFilterList : null}
                />
              </div>

              {isWorkflow ?
                <div className="row">
                  <div className="column">
                    <WorkflowSelector selectedWorkflow={selectedWorkflow} setSelectedWorkflow={setSelectedWorkflow}
                      accessStatus={accessStatus} required={true} searchable={true} error={inputErrors.Workflow}
                    />
                  </div>
                </div> : ''
              }

              {/* <div className="small-titles">
                <div className="small-title small-title1">Created statuses</div>
                {flowType == Enums.FlowType.WorkFlow ?
                  <div className="small-title small-title2">Linked statuses</div>
                  : ''
                }
              </div> */}
            </> : ''
          }

          <div className="status-block">

            {!selectedStatus && getFilteredStatuses().length >= 0 ? <>


              {/* STATUS CONFIG SIMPLE TABLE GOES HERE */}

              <Box p={'sm'} w={`calc(${constants.maxFormWidth} - 100px)`}>
                <SimpleTable
                  stylingProps={{ compact: false, darkerText: true, rows: false }}
                  data={getFilteredStatuses().map(x => ({ ...x, data: { color: x.IsActive ? x.DisplayColor : "Grey", value: x.Description + (x.IsActive ? "" : " [Deactivated]") } }))}
                  height={'100%'}
                  onReorder={Helper.isNullOrWhitespace(searchVal) && !getFilteredStatuses().some(x => !x.IsActive) && ((items) => onReorderSimpleTable(items))}
                  onAction={(actionName, actionItem, actionItemIndex) => {
                    console.log(actionName, actionItem);
                    if (actionName === "open") onStatusItemClick(actionItem);
                    //actionName === 'remove' && handleFieldUpdate('IsActive', actionItem, false);
                  }}
                  mapping={[
                    {
                      label: 'Description',
                      key: 'Description',
                      valueFunction: (status) => {
                        return <div onClick={() => onStatusItemClick(status)}>
                          <ScStatusData
                            value={status.Description}
                            key={`${status.ID}`}
                            color={status.DisplayColor}
                            extraStyles={{
                              fontSize: "1rem",
                              cursor: "pointer"
                            }}
                          />
                        </div>
                      }
                    },
                    {
                      label: 'Start',
                      key: 'StartStatus',
                      valueFunction: (x) => {
                        return x.StartStatus ? <IconCheck /> : <></>;
                      },
                    },
                    {
                      label: 'Close',
                      key: 'CloseStatus',
                      valueFunction: (x) => {
                        return x.CloseStatus ? <IconCheck /> : <></>;
                      }
                    },
                    ...(hasStockControl ? [{
                      label: 'Uses Materials',
                      key: 'WorkCompleted',
                      valueFunction: (x) => {
                        return x.WorkCompleted ? <IconCheck /> : <></>;
                      }
                    }] : []),
                    {
                      label: selectedWorkflow && selectedWorkflow.FlowType === Enums.FlowType.WorkFlow ? 'Next Statuses' : '',
                      key: 'x',
                      valueFunction: (status) => {
                        let nextStatuses = getNextJobStatuses(status);
                        //console.log(nextStatuses);
                        return nextStatuses && nextStatuses.length > 0 ? <Flex> {nextStatuses.map((x, idx) => {
                          let id = x.ToJobCardStatusID;
                          let status = statuses.find(x => x.ID === id);
                          return <div style={{ marginRight: "0.5rem" }}>
                            <ScStatusData
                              value={x.ToJobCardStatusDescription}
                              key={`${x.FromJobCardStatusID}_${idx}`}
                              color={status?.DisplayColor}
                              showTooltipDelay={500}
                            /></div>
                        })}</Flex> : <></>;
                      },
                    }
                  ]}
                  tableItemInputMetadataByKeyName={{}}
                  controls={[
                    {
                      type: 'default',
                      icon: <><IconEdit height={16} /></>,
                      name: "open",
                      label: "Edit"

                    }
                  ]} //tableControls
                  tableActionStates={{}}
                  showControlsOnHover={false}
                  addButton={{
                    customComponent:
                      <Box
                      // p={'sm'}
                      >
                        {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && !selectedStatus &&
                          <MantineButton
                            rightSection={<IconPlus height={16} />}
                            onClick={newStatus}
                          >
                            Add Status
                          </MantineButton>
                        }
                      </Box>,
                    label: '',
                  }}
                />
              </Box>

            </> : ""}

            {selectedStatusOptions
              ? <div className="status-setup">
                <div className="status-header">
                  <h1>{initialStatusName}</h1>
                </div>
                {selectedStatus && selectedStatus.ID !== Helper.emptyGuid() ?
                  <Button text={`Triggers (${triggersForStatus.length})`} extraClasses={"fit-content trigger" + (triggersForStatus.length > 0 ? "" : " white-action")} onClick={() => {
                    setTriggerListVisible(true);
                  }} /> : ""}
                <Button text="Cancel" extraClasses="white-action fit-content cancel" onClick={() => {
                  setSelectedStatus(undefined);
                  setSelectedStatusOptions(undefined);
                  setFormIsDirty(false);
                }} />
                <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                  text={submitting ? "Saving" : "Save"} extraClasses="fit-content save" onClick={updateSettings} />
                <div className="detail-row">
                  <div className="detail-column">
                    <SCInput
                      onChange={(e) => { setStatusName(e.value); setFormIsDirty(true); }}
                      name="statusName"
                      label={"Status"}
                      value={statusName}
                      error={inputErrors.StatusName}
                      cypress="data-cy-status"
                    />
                  </div>
                  <div className="detail-column">
                    <div className={`color-block color-block-selected b-${statusColor}`} style={{ marginTop: '39px' }}></div>
                  </div>
                  <div className="detail-column end">

                    {selectedStatus?.StartStatus === true && <div className="detail-row end-box-container">
                      <SCCheckbox
                        disabled={true}
                        label="Start Status"
                        labelPlacement="before"
                        value={true}
                      />
                    </div>
                    }

                    <div className="detail-row end-box-container">
                      <SCCheckbox
                        onChange={() => { setCloseStatus(!closeStatus); if (!closeStatus) { setMaterialsUsed(true); } setFormIsDirty(true); }}
                        label="Close Job"
                        labelPlacement="before"
                        value={closeStatus}
                      />
                    </div>

                    {/* {selectedStatus && !selectedStatus.StartStatus ? <div className="detail-row end-box-container">
                      <SCCheckbox
                        onChange={() => {
                          setMaterialsInProgress(!materialsInProgress);
                          setFormIsDirty(true);
                        }}
                        label="Mark Materials as In Progress"
                        labelPlacement="before"
                        value={materialsInProgress}
                        disabled={materialsUsed}
                      />
                    </div> : ""} */}

                    {selectedStatus && hasStockControl && !selectedStatus.StartStatus ? <div className="detail-row end-box-container">
                      <SCCheckbox
                        onChange={() => {
                          setMaterialsUsed(!materialsUsed);
                          setFormIsDirty(true);
                        }}
                        label="Mark Materials as Used"
                        labelPlacement="before"
                        value={materialsUsed}
                        disabled={materialsInProgress}
                      />
                    </div> : ""}

                    {/* <div className="detail-row end-box-container">
                      <SCCheckbox
                        onChange={() => { setContractorCanProceed(!canContractorProceed); setFormIsDirty(true); }}
                        label="Supplier Status"
                        labelPlacement="before"
                        value={canContractorProceed}
                      />
                    </div> */}
                    <div className="detail-row end-box-container">
                      <SCCheckbox
                        onChange={() => {
                          if (!startTimer) setEndTimer(false);
                          setStartTimer(!startTimer);
                          setFormIsDirty(true);
                        }}
                        label="Start Timer"
                        labelPlacement="before"
                        value={startTimer}
                      />
                    </div>
                    <div className="detail-row end-box-container">
                      <SCCheckbox
                        onChange={() => {
                          if (!endTimer) setStartTimer(false);
                          setEndTimer(!endTimer);
                          setFormIsDirty(true);
                        }}
                        label="End Timer"
                        labelPlacement="before"
                        value={endTimer}
                      />
                    </div>

                    {selectedStatus && !selectedStatus.StartStatus ? <div className="detail-row end-box-container">
                      <SCCheckbox
                        onChange={() => {
                          setFormCompleted(!formCompleted);
                          setFormIsDirty(true);
                        }}
                        label="Complete Forms"
                        labelPlacement="before"
                        value={formCompleted}
                      />
                    </div> : ""}

                    {selectedStatus && !selectedStatus.StartStatus ? <div className="detail-row end-box-container">
                      <SCCheckbox
                        onChange={() => {
                          setTaskCompleted(!taskCompleted);
                          setFormIsDirty(true);
                        }}
                        label="Complete Tasks"
                        labelPlacement="before"
                        value={taskCompleted}
                      />
                    </div> : ""}

                    {selectedStatus && selectedStatus.ID !== Helper.emptyGuid() ?
                      <div className="switch">
                        <ScSwitch label="Active" checked={isActive}
                          onToggle={() => { setIsActive(!isActive); setFormIsDirty(true); }} />
                        {/*<ReactSwitch label="Active" checked={isActive}
                          handleChange={() => { setIsActive(!isActive); setFormIsDirty(true); }} />*/}
                      </div> : ''
                    }
                  </div>
                </div>
                <div className="small-title">Select status colour</div>
                <div className="row">
                  <div className="color-block b-Red" onClick={() => { setStatusColor('Red'); setFormIsDirty(true); }}></div>
                  <div className="color-block b-Orange" onClick={() => { setStatusColor('Orange'); setFormIsDirty(true); }}></div>
                  <div className="color-block b-Yellow" onClick={() => { setStatusColor('Yellow'); setFormIsDirty(true); }}></div>
                  <div className="color-block b-Green" onClick={() => { setStatusColor('Green'); setFormIsDirty(true); }}></div>
                  <div className="color-block b-Blue" onClick={() => { setStatusColor('Blue'); setFormIsDirty(true); }}></div>
                  <div className="color-block b-Purple" onClick={() => { setStatusColor('Purple'); setFormIsDirty(true); }}></div>
                  <div className="color-block b-Black" onClick={() => { setStatusColor('Black'); setFormIsDirty(true); }}></div>
                  <div className="color-block b-Grey" onClick={() => { setStatusColor('Grey'); setFormIsDirty(true); }}></div>
                  <div className="color-block b-LightGrey" onClick={() => { setStatusColor('LightGrey'); setFormIsDirty(true); }}></div>
                  <div className="color-picker" ref={showPicker ? pickerRef : null}>
                    <div className="color-block add-color" onClick={() => setShowPicker(true)}>+</div>
                    {showPicker
                      ? <SketchPicker
                        disableAlpha={true}
                        color={statusColor}
                        onChangeComplete={(color) => { setStatusColor(color.hex); setFormIsDirty(true); }}
                        presetColors={[]}
                      />
                      : ''
                    }
                  </div>
                </div>

                {flowType == Enums.FlowType.WorkFlow ?
                  <>
                    <SCMultiSelect
                      availableOptions={availableJobStatusConnections}
                      selectedOptions={selectedJobStatusConnections}
                      textField="Description"
                      dataItemKey="ID"
                      label="Next Statuses"
                      onChange={handleSelectedJobStatusConnectionChange}
                    />
                  </>
                  : ''
                }

                <div className="small-title">Select required field for statuses</div>
                <div className="status-options">
                  {selectedStatusOptions.map(function (statusOption, index) {
                    return (
                      statusOption.IsActive
                        ? <StatusField statusOption={statusOption} key={index} updateStatusOption={updateStatusOption}
                          deleteFunc={removeStatusOption} customFields={customFields} workflow={selectedWorkflow} />
                        : ''
                    )
                  })}
                  <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                    text="Add field" icon="plus-circle" extraClasses="fit-content" onClick={() => setAddingOptions(true)} />
                </div>
                {addingOptions
                  ? <StatusOptions
                    availableOptions={selectedStatusOptions.filter(option => option.IsActive != true)}
                    setAddingOptions={setAddingOptions}
                    saveOptions={saveOptions}
                    customFields={customFields}
                    workflow={selectedWorkflow}
                  />
                  : ''
                }
              </div>
              : ''
            }

          </div>
          {/* {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && !selectedStatus ? <>
            <div className="status-add">
              <div className="status" onClick={newStatus}>
                <img src="/icons/plus-circle-blue.svg" alt="plus" />
                Add Status
              </div>
            </div>
          </> : ""} */}

        </div>
      </div>

      {triggerListVisible ?
        <TriggerList
          setTriggerListVisible={setTriggerListVisible}
          module={Enums.Module.JobCard}
          conditionSetting1={selectedStatus.ID}
          defaultTriggerName={selectedStatus.Description}
          defaultRuleName={Constants.appStrings.TriggerRuleJobStatusChange}
          readonlyConditions={["JobStatus"]}
        /> : ""}

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .re-status-block {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .re-status-container {
          display: flex;
          flex-direction: row;
          background-color: ${colors.white};
          border-radius: ${layout.buttonRadius};
          height: 3rem;
          margin: 1rem 0 0 1rem;
        }
        .re-status-connections {
          margin: 1rem 0 0 1rem;
        }
        .re-status {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          width: 200px;
          font-size: 0.875rem;
          font-weight: bold;
          height: 3rem;
          justify-content: center;
          padding: 0 1rem;
          text-align: center;
        }
        .move {
          display: flex;
          align-items: center;
          cursor: move;
          margin-top: 1rem;
        }
        .not-move {
          display: flex;
          align-items: center;
          cursor: move;
          margin-top: 1rem;
          margin-left: 1.5rem;
        }
        .column {
          display: flex;
          flex-direction: column;
          
        }
        .column-margin {
          margin-left: 24px;
        }
        p {
          color: ${colors.darkPrimary};
        }
        .button-container {
          flex-shrink: 0;
          width: 10rem;
        }
        .button-container :global(.button){
          margin-top: 0.5rem;
        }
        .title {
          width: 100%;
          color: ${colors.darkPrimary};
        }
        .title h1 {
          font-size: 24px;
          margin: 6px 0 2rem 0;
        }
        .title p {
          font-size: 14px;
          margin: 0;
        }
        .row {
          display: flex;
        }
        .space-between {
          justify-content: space-between;
        }
        .split {
          display: flex;
        }
        .detail-row {
          display: flex;
          margin-left: -1.5rem;
        }
        .detail-column {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          margin-top: .5rem;
          margin-left: 1.5rem;
          max-width: 50%;
        }
        .end {
          align-items: flex-end;
        }
        .end-box-container {
          width: 100%;
          justify-content: flex-end;
        }
        .end-box-title {
          margin-right: 1rem;
          margin-top: 1.25rem;
          color: ${colors.darkPrimary};
          font-size: 0.875rem;
          font-weight: bold;
        }
        h2 {
          color: ${colors.darkPrimary};
          font-size: 1.75rem;
          font-weight: lighter;
          margin: 1rem 0 1rem;
        }
        .section-title {
          background-color: ${colors.background};
          border-radius: ${layout.cardRadius};
          /* box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); */
          color: ${colors.bluePrimary};
          font-size: 1.25rem;
          font-weight: bold;
          opacity: 0.9;
          padding: 1rem;
        }
        .small-titles {
          display: flex;
        }
        .small-title {
          color: ${colors.darkPrimary};
          font-size: 0.875rem;
          font-weight: bold;
          margin-top: 2rem;
        }        
        .small-title1 {
          width: 240px;
        }
        .small-title2 {
          margin-left: 1rem;
        }
        .status-block {
          display: flex;
          width: 100%;
        }
        .status {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          width: 200px;
          font-size: 0.875rem;
          font-weight: bold;
          height: 3rem;
          justify-content: center;
          padding: 0 1rem;
          text-align: center;
        }
        .status-container {
          display: flex;
          flex-direction: row;
          background-color: ${colors.white};
          border-radius: ${layout.buttonRadius};
          height: 3rem;
          margin: 1rem 0 0 1rem;
        }
        .status-header {
          height: 2rem;
        }
        .statuses {
          display: flex;
          flex-direction: column;
          width: fit-content;
          flex-wrap: wrap;
          margin: 0 1rem 1rem -1rem;
        }
        .status-add {
          background: none;
          border: 1px solid ${colors.bluePrimary};
          box-sizing: border-box;
          margin-left: 2.5rem;
          margin-top: 1rem;
          width: 200px;
        }
        .status-add img {
          margin-right: 0.5rem;
        }
        .status-add .status {
          background: none;
          color: ${colors.bluePrimary};
        }
        .status-setup {
          border: 1px solid ${colors.bluePrimary};
          border-radius: ${layout.cardRadius};
          margin-top: 1rem;
          margin-left: 1rem;
          padding: 1rem;
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .status-setup h1 {
          color: ${colors.darkPrimary};
          font-size: 1.5rem;
          font-weight: normal;
          margin: 0 0 0.5rem;
        }
        .status-setup :global(.save) {
          margin-top: 0px;
          position: absolute;
          right: 1rem;
          top: 1rem;
        }

        .status-setup :global(.cancel) {
          margin-top: 0px;
          position: absolute;
          right: 6rem;
          top: 1rem;
        }

        .status-setup :global(.trigger) {
          cursor: pointer;
          margin-top: 0px;
          position: absolute;
          right: 12rem;
          top: 1rem;
        }

        .status-setup :global(.delete) {
          cursor: pointer;
          margin-top: 0px;
          position: absolute;
          right: 20rem;
          top: 1.5rem;
        }
        .status-options {
          width: 100%;
        }
        .color-block {
          border-radius: ${layout.cardRadius};
          background-color: #4F4F4F;
          cursor: pointer;
          height: 2rem;
          margin-right: 1rem;
          margin-top: 1rem;
          position: relative;
          width: 2rem;
          z-index: 1;
        }
        .add-color {
          align-items: center;
          background: none;
          border: 1px solid ${colors.darkPrimary};
          color: ${colors.darkPrimary};
          display: flex;
          justify-content: center;
        }
        .color-block-selected {
          background-color: ${selectedStatus ? statusColor ? statusColor.includes('#') ? statusColor : "" : "" : ""};
        }
        .color-picker {
          position: relative;
        }
        .color-picker :global(.sketch-picker) {
          left: 0;
          position: absolute;
          top: calc(100% + 0.5rem);
          z-index: 99;
        }

        /*REMOVE DUPLICATE COLOR CODE*/
        .Red {
          background-color: rgba(252, 46, 80, 0.2); /*#FC2E50;*/
          color: #FC2E50 !important;
        }
        .b-Red {
          background-color: #FC2E50;
        }
        .Orange {
          background-color: rgba(242, 97, 1, 0.2);
          color: #F26101 !important;
        }
        .b-Orange {
          background-color: #F26101;
        }
        .Yellow {
          background-color: rgba(255, 201, 64, 0.2);
          color: #FFC940 !important;
        }
        .b-Yellow {
          background-color: #FFC940;
        }
        .Green {
          background-color: rgba(81, 203, 104, 0.2);
          color: #51CB68 !important;
        }
        .b-Green {
          background-color: #51CB68;
        }
        .Blue {
          background-color: rgba(90, 133, 225, 0.2);
          color: #5A85E1 !important;
        }
        .b-Blue {
          background-color: #5A85E1;
        }
        .Purple {
          background-color: rgba(128, 100, 250, 0.2);
          color: #735AE1 !important;
        }
        .b-Purple {
          background-color: #735AE1;
        }
        .Black {
          background-color: rgba(79, 79, 79, 0.2);
          color: #4F4F4F !important;
        }
        .b-Black {
          background-color: #4F4F4F;
        }
        .Grey {
          background-color: rgba(130, 130, 130, 0.2);
          color: #828282 !important;
        }
        .b-Grey {
          background-color: #828282;
        }
        .LightGrey {
          background-color: rgba(189, 189, 189, 0.2);
          color: #BDBDBD !important;
        }
        .b-LightGrey {
          background-color: #BDBDBD;
        }

        .switch {
          flex-direction: row-reverse;
          display: flex;
        }
      `}</style>
    </div>
  );
}

export default JobStatusSettings;
