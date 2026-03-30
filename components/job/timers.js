import React, { useEffect, useState, useContext, useRef } from 'react';
import moment from 'moment';
import NoSSR from '../../utils/no-ssr';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Table from '../table';
import Search from '../search';
import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import CellTech from '../cells/tech';
import CellBool from '../cells/bool';
import CellWide from '../cells/wide';
import Button from '../button';
import DownloadDropdown from '../download-dropdown';
import EditJobCardTime from '../modals/jobcard/edit-job-card-time';
import Fetch from '../../utils/Fetch';
import Time from '../../utils/time';
import * as Enums from '../../utils/enums';
import Storage from '../../utils/storage';
import ToastContext from '../../utils/toast-context';
import helper from '../../utils/helper';
import TimerService from '../../services/timer-service';
import TimerContext from '../../utils/timer-context';
import PS from '../../services/permission/permission-service';
import useInitialTimeout from '../../hooks/useInitialTimeout';
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import {
  IconCircleCaretRight,
  IconCirclePlus,
  IconPlayerStopFilled
} from "@tabler/icons-react";
import { Box, Center, Flex, ScrollArea } from "@mantine/core";

function Timers({ topMargin = true, timers, setTimers, jobCard, project, accessStatus, cypressTimer, refreshTimers }) {

  const timerContext = useContext(TimerContext);
  const [localJobCard, setLocalJobCard] = useState(jobCard);
  const [total, setTotal] = useState(calcTotal());

  const [manageMyTimersPermission] = useState(PS.hasPermission(Enums.PermissionName.ManageMyTimers));
  const [editOtherTimersPermission] = useState(PS.hasPermission(Enums.PermissionName.EditOtherTimers));
  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

  const toast = useContext(ToastContext);
  const interval = useRef(null);

  const [employeeID] = useState(Storage.getCookie(Enums.Cookie.employeeID));

  const [runningTimerDuration, setRunningTimerDuration] = useState(calcRunningDuration());

  const [timerRunning, setTimerRunning] = useState(TimerService.isTimerRunning(timers));
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [editingTimer, setEditingTimer] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useInitialTimeout(100, () => {
    if (timers.length === 0) {
      fetchTimers();
    }
  });

  useEffect(() => {

    startIntervalTimer();

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    }
  }, []);

  const startIntervalTimer = () => {
    if (interval.current) {
      clearInterval(interval.current);
    }

    interval.current = setInterval(() => {
      setTotal(calcTotal());
      setRunningTimerDuration(calcRunningDuration());

      columns = getColumns();

    }, 1000);
  }

  const oldTimerContextRunningTimers = useRef(timerContext.runningTimers);
  useEffect(() => {

    if (JSON.stringify(oldTimerContextRunningTimers.current) !== JSON.stringify(timerContext.runningTimers)) {
      refreshTimers(true);
    }

    oldTimerContextRunningTimers.current = timerContext.runningTimers;

  }, [timerContext.runningTimers]);

  function calcRunningDuration() {
    let runningTimer = TimerService.getRunningTimers(timers).find(x => x.EmployeeID === employeeID);
    if (!runningTimer) return "";
    return calcDuration(runningTimer.StartTime, runningTimer.EndTime);
  }

  function getStoreNow() {
    return Time.now();
  }

  

  function calcDuration(start, end) {
    const startDate = Time.parseDate(start);
    const endDate = end ? Time.parseDate(end) : getStoreNow();
    let diffSeconds = Math.abs(endDate - startDate) / 1000;

    return helper.formatDuration(diffSeconds);
  }

  function dateToTime(date, isTime, startTime) {
    if (date == null || startTime == null) {
      return "";
    }

    // making sure it's not a pure duration or legacy mobile issue (mobile timers were setting IsTime = false instead of true)
    if (isTime) {
      // return Time.parseDate(date).toLocaleTimeString();
      return moment(date).format('HH:mm:ss');
    }

    return "";
  }

  function calcTotal() {
    let totalSecs = 0;

    timers.map(timerx => {
      const startDate = Time.parseDate(timerx.StartTime);
      let end = timerx.EndTime;
      const endDate = end ? Time.parseDate(end) : getStoreNow();
      let diffSeconds = Math.abs(endDate - startDate) / 1000;
      totalSecs += diffSeconds;
    });

    return helper.formatDuration(totalSecs);
  }

  const getColumns = () => {
    let temp = [{
      Header: 'Employee',
      accessor: (row) => [row.Employee],
      Cell: ({ cell: { value } }) => <CellTech value={value} />
    },
    {
      Header: 'Description',
      accessor: (row) => [row.Description],
      Cell: ({ cell: { value } }) => <CellWide value={value} />
    },
    {
      Header: 'Billable',
      accessor: 'Billable',
      Cell: ({ cell: { value } }) => <CellBool value={value} />
    },
    {
      Header: 'Overtime',
      accessor: 'Overtime',
      Cell: ({ cell: { value } }) => <CellBool value={value} />
    },
    {
      Header: 'SLAtime',
      accessor: 'SLAtime',
      Cell: ({ cell: { value } }) => <CellBool value={value} />
    },
    {
      Header: 'Date',
      accessor: 'StartTime',
      Cell: ({ cell: { value } }) => <CellDate value={value} hideTime={true} />
    },
    {
      Header: 'Start Time',
      accessor: row => dateToTime(row.StartTime, row.IsTime, row.StartTime),
    },
    {
      Header: 'End Time',
      accessor: row => dateToTime(row.EndTime, row.IsTime, row.StartTime),
    },
    {
      Header: 'Duration',
      accessor: row => calcDuration(row.StartTime, row.EndTime),
      Cell: ({ cell: { value } }) => <CellBold color="blue" fontSize="14px" value={value} />
    },];

    if (project) {
      temp.splice(0, 0, {
        Header: 'Job',
        accessor: (row) => [row.JobCardNumber],
        Cell: ({ cell: { value } }) => <CellBold color="blue" fontSize="14px" value={value} />
      });
    }
    return temp;
  };

  // removed the React.useMemo
  let columns = getColumns();

  useEffect(() => {
    setTimerRunning(TimerService.isTimerRunning(timers));
    startIntervalTimer();
  }, [timers]);

  const myAncillaryFilters = useRef({
    IncludeDisabled: [{
      type: Enums.ControlType.Switch,
      label: 'Show disabled timers',
    }],
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ ShowDisabled: false });
  const handleAncillaryFilterChange = (result) => {
    setAncillaryFilters({ ShowDisabled: result.checked });
  };

  const [params, setParams] = useState({
    ItemID: jobCard ? jobCard.ID : project ? project.ID : null,
    IsActive: !ancillaryFilters["ShowDisabled"],
  });

  const oldAncillaryFilters = useRef(ancillaryFilters);
  useEffect(() => {

    if (JSON.stringify(oldAncillaryFilters.current) !== JSON.stringify(ancillaryFilters)) {
      fetchTimers();
      setParams({
        ItemID: jobCard ? jobCard.ID : project ? project.ID : null,
        IsActive: !ancillaryFilters["ShowDisabled"],
      });
    }

    oldAncillaryFilters.current = ancillaryFilters;
  }, [ancillaryFilters]);


  async function editTimer(id) {
    let timer = await Fetch.get({ url: "/JobTime?id=" + id });
    setEditingTimer(timer);
    setIsEditingTimer(true);
  }

  function createTimer() {
    setIsCreating(true);
    setEditingTimer({
      Billable: false,
      Description: null,
      Duration: 0,
      EmployeeFullName: null,
      EmployeeID: null,
      EndTime: Time.today(),
      IsTime: false,
      StartTime: Time.today(),
      JobCardID: localJobCard ? localJobCard.ID : null,
      JobCardNumber: localJobCard ? localJobCard.JobCardNumber : '',
    });
    setIsEditingTimer(true);
  }

  async function startTimer() {
    const getResult = await Fetch.get({
      url: "/JobTime/RunningTimers",
      params: {}
    });

    let runningTimers = getResult.Results;

    if (runningTimers.length > 0) {
      updateTimers();
      toast.setToast({
        message: "There are currently running timer(s) that need to be stopped",
        show: true,
        type: 'error'
      });

      return;
    }

    // let employeeID = Storage.getCookie(Enums.Cookie.employeeID);
    let userName = Storage.getCookie(Enums.Cookie.servUserName);

    let now = Time.now();

    let timer = {
      JobCardID: jobCard.ID,
      EmployeeID: employeeID,
      StartTime: Time.toISOString(now),
      EndTime: null,
      IsTime: true,
      Billable: false,
      Overtime: false,
      SLAtime: false,
      ID: helper.emptyGuid(),
      IsActive: true,
      CreatedBy: userName,
      CreatedDate: Time.toISOString(now),
      ModifiedBy: userName,
      ModifiedDate: Time.toISOString(now),
    };

    const result = await Fetch.post({
      url: "/JobTime",
      params: timer
    });

    await updateTimers();
    timerContext.updateRunningTimers(true);
  }

  async function stopTimer() {
    let applicableTimers = timers.filter(x => x.EndTime === null && x.EmployeeID === employeeID);
    if (applicableTimers.length === 0) {
      return;
    }

    let timer = applicableTimers[0];

    let now = Time.now();

    timer.EndTime = Time.toISOString(now);

    const result = await Fetch.put({
      url: "/JobTime",
      params: timer
    });

    if (result?.EndTime) { // verify that timer was successfully stopped
      await updateTimers();
      timerContext.updateRunningTimers(true);
    }
  }

  function rowClick(args) {

    let employeeID = args.original.EmployeeID;
    let myEmployeeID = Storage.getCookie(Enums.Cookie.employeeID);
    let isMatch = employeeID.toUpperCase() === myEmployeeID.toUpperCase();

    if (!manageMyTimersPermission && isMatch) return;
    if (!editOtherTimersPermission && !isMatch) return;

    if (args.original.EndTime) {
      editTimer(args.original.ID);
    } else {
      toast.setToast({
        message: "Cannot edit a running timer",
        show: true,
        type: 'error'
      })
    }
  }

  const fetchTimers = async () => {
    try {
      let timersRes;
      if (jobCard) {
        timersRes = await Fetch.get({
          url: '/Job/GetJobTimes',
          params: {
            JobId: localJobCard.ID,
            IsActive: !ancillaryFilters['ShowDisabled'],
          }
        });
      } else if (project) {
        timersRes = await Fetch.get({
          url: '/Project/GetJobTimes',
          params: {
            ProjectId: project.ID,
            IsActive: !ancillaryFilters['ShowDisabled'],
          }
        });
      }

      setTimers(timersRes.Results);
    } catch (e) {
      console.log("Fetching timers error", e);
    }
  };

  async function updateTimers() {
    setIsCreating(false);
    setIsEditingTimer(false);
    setEditingTimer(null);

    // refresh list

    fetchTimers();
  }

  const [exportOptions, setExportOptions] = useState(jobCard ? [
    { url: `/Job/GetExportedJobTimers`, method: 'POST', params: { ...params, ExportAll: false }, label: 'Filtered export' },
    { url: `/Job/GetExportedJobTimers`, method: 'POST', params: { ...params, ExportAll: true }, label: 'Full export' },
  ] : [
    { url: `/Job/GetExportedJobTimersForProject`, method: 'POST', params: { ...params, ExportAll: true }, label: 'Export' },
  ]
  );

  return (
    <div>
      <Flex justify={'space-between'} align={'start'} mt={topMargin ? 25 : 0}>
        <Box
          mr={'auto'}
          key={'timerTableFilter'}
          w={'250px'}
        // maw={'calc(100vw)'}
        >
          <Search
            ancillaryFilters={myAncillaryFilters.current}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </Box>
        <ToolbarButtons w={'100%'} buttonGroups={[
          [
            {
              type: 'custom', // must be menu
              show: accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission,
              children: [
                <DownloadDropdown key={'timerTableDropdown'} title={'Export'} options={exportOptions} menu />
              ]
            }
          ],
          [
            {
              show: TimerService.getRunningTimers(timers).filter(x => x.EmployeeID === employeeID).length === 0,
              type: 'button',
              breakpoint: 600,
              children: ['New Timer'],
              icon: <IconCirclePlus />,
              onClick: createTimer,
              disabled: accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !jobCard || !manageMyTimersPermission
            },
            {
              show: TimerService.getRunningTimers(timers).filter(x => x.EmployeeID === employeeID).length === 0,
              type: 'button',
              breakpoint: 600,
              children: ['Start Timer'],
              icon: <IconCircleCaretRight />,
              onClick: startTimer,
              color: '#3f9f5c',
              disabled: accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !jobCard
            },
            {
              show: TimerService.getRunningTimers(timers).filter(x => x.EmployeeID === employeeID).length !== 0,
              type: 'button',
              breakpoint: 600,
              children: ['Stop Timer ' + runningTimerDuration],
              icon: <IconPlayerStopFilled />,
              onClick: stopTimer,
              color: 'yellow.7',
              disabled: accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !jobCard
            },
          ]
        ]}
        />
      </Flex>
      {/*<div className="row">
        <NoSSR>
          <div className="w-hundred-percent">
            {jobCard ?
              <div className="search-container">
                <Search
                  ancillaryFilters={myAncillaryFilters.current}
                  setAncillaryFilters={handleAncillaryFilterChange}
                />
              </div> : ''}
          </div>

          {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
            <div className="download">

              <DownloadDropdown title={'Export'} options={exportOptions} />

            </div>
          </> : ''}
          <div className="actions">
            {TimerService.getRunningTimers(timers).filter(x => x.EmployeeID === employeeID).length === 0 ? <>
              <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !jobCard || !manageMyTimersPermission}
                icon="plus-circle" text="New Timer" onClick={createTimer} extraClasses="fit-button" />
              <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !jobCard}
                icon="plus-circle" text="Start Timer" onClick={startTimer} extraClasses="fit-button green" />
            </> : <>
              <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !jobCard}
                icon="x-circle-light" text={"Stop Timer " + runningTimerDuration} onClick={stopTimer} extraClasses="fit-button red-light" />
            </>}
          </div>
        </NoSSR>
      </div>*/}
      {timers.length > 0
        ? <>
          <ScrollArea.Autosize>
            <Table columns={columns} data={timers}
              rowClick={rowClick}
            />
          </ScrollArea.Autosize>
          <div className="total">
            <div>Total Hours:</div>
            <div>{total}</div>
          </div>
        </>
        : <Flex align={'center'} justify={'center'} h={'100%'} mih={'30vh'} direction={'column'}>
          <img src="/timer.svg" alt="Timers" />
          <h3>No job timers</h3>
        </Flex>
      }
      {isEditingTimer === true ? <EditJobCardTime jobCard={localJobCard} jobCardTime={editingTimer}
        updateTimers={updateTimers} isNew={isCreating} accessStatus={accessStatus} cypressEmployee={'data-cy-employee'} cypressDuration={'data-cy-duration'} cypressDescription={'data-cy-description'} cypressSave={'data-cy-save'} /> : ""}

      <style jsx>{`
        .w-hundred-percent {
          width: 100%;
        }
        .container {
          display: flex;
          flex-direction: column;
          height: 100%;
          margin-top: 2.5rem;
          position: relative;
        }
        .row {
          display: flex;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 1.5rem;
        }
        .total {
          align-items: center;
          border-bottom: 1px solid ${colors.formGrey};
          border-top: 1px solid ${colors.formGrey};
          color: ${colors.darkSecondary};
          display: flex;
          font-size: 1.125rem;
          font-weight: bold;
          height: 4rem;
          justify-content: space-between;
          margin-top: 1rem;
          padding: 0 1rem;
        }
        .empty {
          align-items: center;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          justify-content: center;
        }
        .empty img {
          margin-top: -3rem;
        }
        .actions {
          display: flex;
        }
        .actions :global(.button){
          margin-left: 0.5rem;
          margin-top: 0;
          padding: 0 1rem;
          white-space: nowrap;
        }
        .download {
          margin-right: 0.5rem;
          width: 6.2rem;
          margin-top: -0.5rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default Timers;
