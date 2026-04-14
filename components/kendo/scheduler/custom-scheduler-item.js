import { SchedulerItem } from "@progress/kendo-react-scheduler";
import { useCallback, useRef, useState, useContext, useEffect } from "react";
// import SubscriptionContext from "../../../utils/subscription-context";
import CustomKendoSchedulerContext from "../../../utils/custom-kendo-scheduler-context";
import Fetch from "../../../utils/Fetch";
import ManageAppointment from "../../modals/appointment/manage-appointment";
import Time from "../../../utils/time";
import { colors } from '../../../theme';
import * as Enums from '../../../utils/enums';
import KendoTooltip from '../kendo-tooltip';
import Helper from "../../../utils/helper";

export default function CustomSchedulerItem(props) {

  const seed = useRef(Helper.newGuid());

  const customKendoSchedulerContext = useContext(CustomKendoSchedulerContext);

  const [showModal, setShowModal] = useState(false);
  const monthView = props.monthView;

  const employeeColour = useRef(props.dataItem.employees && props.dataItem.employees.length > 0
    && props.dataItem.employees[0].DisplayColor ? props.dataItem.employees[0].DisplayColor.includes('#') ? "custom-color" : props.dataItem.employees[0].DisplayColor :
    ("default-colour" + (!props.dataItem.employees || props.dataItem.employees.length === 0 ? " unassigned" : "")));

  const customColor = useRef(props.dataItem.employees && props.dataItem.employees.length > 0
    && props.dataItem.employees[0].DisplayColor ? props.dataItem.employees[0].DisplayColor : colors.bluePrimary);

  const handleClick = useCallback(async (event) => {

    if (customKendoSchedulerContext.readOnly) return;

    const appointment = await Fetch.get({
      url: "/Appointment",
      params: {
        id: event.target.props.dataItem.id
      }
    });

    setShowModal(appointment);

    if (props.onClick) {
      props.onClick(event);
    }
  }, [props]);

  const onSavedAppointment = useCallback(() => {
    setShowModal(null);
    setShowCreateModal(false);

    // triggers a refresh using custom context as not sure how to pass in props
    customKendoSchedulerContext.setRefreshData(customKendoSchedulerContext.refreshData + 1);
  });

  // const getTitle = () => {
  //   return `${props.dataItem.title}: ${(props.dataItem.itemNumber ? `${props.dataItem.itemNumber} - ` : "")} ${props.dataItem.customerName} (${Time.toISOString(props.dataItem.start, false, true, false)} - ${Time.toISOString(props.dataItem.end, false, true, false)})`;
  // };

  //const [draggingOver, setDraggingOver] = useState(false);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    //setDraggingOver(true);
  });

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    //setDraggingOver(false);
  });


  const defaultModule = useRef(null);
  const defaultModuleID = useRef(null);
  const defaultCustomerID = useRef(null);
  const defaultEmployees = useRef([]);
  const defaultStore = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const onDrop = useCallback((e) => {
    let item = JSON.parse(e.dataTransfer.getData("item"));
    let type = e.dataTransfer.getData("type");
    if (type === "job") {
      defaultModuleID.current = item.ID;
      defaultModule.current = Enums.Module.JobCard;
      defaultCustomerID.current = item.CustomerID;
      defaultEmployees.current = item.Employees;
      defaultStore.current = item.Store;
      setShowCreateModal(true);
      //setDraggingOver(false);
    }
  });


  const getWorkDayInfo = () => {
    let start = customKendoSchedulerContext.workDayStart,
      end = customKendoSchedulerContext.workDayEnd,
      startArray = start.split(":"),
      endArray = end.split(":"),
      startHour = parseInt(startArray[0]),
      startMinute = parseInt(startArray[1]),
      endHour = parseInt(endArray[0]),
      endMinute = parseInt(endArray[1]);

    return { startHour, startMinute, endHour, endMinute };
  };

  const getStart = () => {
    if (monthView || props.isAllDay) {
      let info = getWorkDayInfo();
      let start = Time.parseDate(props.start);
      start.setHours(info.startHour);
      start.setMinutes(info.startMinute);
      return start;
    } else {
      let start = Time.parseDate(props.start);
      return start;
    }
  }

  const getEnd = () => {
    if (monthView || props.isAllDay) {
      let info = getWorkDayInfo();
      let end = Time.parseDate(props.start);
      end.setHours(info.endHour);
      end.setMinutes(info.endMinute);
      return end;
    } else {
      let end = getStart();
      end.setHours(end.getHours() + 1);
      return end;
    }
  }

  useEffect(() => {
    if (!showCreateModal) {
      defaultModuleID.current = null;
      defaultModule.current = null;
      defaultCustomerID.current = null;
      defaultEmployees.current = [];
      defaultStore.current = null;
    }
  }, [showCreateModal]);

  const toolTemplate = () => {
    let includeDate = Time.today(props.dataItem.start) !== Time.today(props.dataItem.end);
    return (<>
      <div title="tesrrt" className="inner-text"><b>{props.dataItem.title}</b></div>
      <div className="inner-text">Item Number: {props.dataItem.itemNumber}</div>
      <div className="inner-text">Customer: {props.dataItem.customerName}</div>
      <div className="inner-text">Contact: {props.dataItem.contactName}</div>
      <div className="inner-text">Address: {props.dataItem.location ? props.dataItem.location : "N/A"}</div>
      <div className="inner-text">Employees: {props.dataItem.employees && props.dataItem.employees.length > 0 ? props.dataItem.employees && props.dataItem.employees.map(x => x.FullName).join(",") : "N/A"}</div>
      <div className="inner-text">Start: {Time.toISOString(props.dataItem.start, false, true, false, "-", includeDate)}</div>
      <div className="inner-text">End: {Time.toISOString(props.dataItem.end, false, true, false, "-", includeDate)}</div>
    </>);
  };

  const [displayItem, setDisplayItem] = useState("");

  useEffect(() => {
    // had to use this approach as the more elegant ones did not work at all
    try {
      if (!props.dataItem.employees.map(x => x.ID).includes(props.group.resources[0].value)) {
        setDisplayItem("display: none;")
      }
    } catch (error) {
    }
  }, []);

  return (
    <>

      <SchedulerItem
        {...props}
        onClick={handleClick}
      >
        <div className={`item-container-custom-${seed.current}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>

          <div className={"container-box " + employeeColour.current}>
            {props.monthView ?
              <KendoTooltip content={toolTemplate}>
                <div title="test" className="inner-text">
                  {(props.dataItem.itemNumber ? `${props.dataItem.itemNumber} - ` : `${props.dataItem.title} - `) + props.dataItem.customerName}
                </div>
              </KendoTooltip>
              :
              <KendoTooltip parentTitle={true} content={toolTemplate}>
                <div title="test">
                  <div className="inner-text"><b>{props.dataItem.title}</b></div>
                  {props.dataItem.itemNumber ?
                    <div className="inner-text"><b>N: </b> {props.dataItem.itemNumber}</div>
                    : ""}
                  <div className="inner-text"><b>C: </b> {`${props.dataItem.customerName}${props.dataItem.contactName !== props.dataItem.customerName ? ` - ${props.dataItem.contactName}` : ""}`}</div>
                  {props.dataItem.location ?
                    <div className="inner-text"><b>A: </b> {props.dataItem.location}</div>
                    : ""}

                  <div className="inner-text"><b>E: </b> {props.dataItem.employees && props.dataItem.employees.length > 0 ? props.dataItem.employees && props.dataItem.employees.map(x => x.FullName).join(",") : "N/A"}</div>
                </div>
              </KendoTooltip>

            }

          </div>


          <style jsx>{`
            
            .item-container-custom-${seed.current} {
              ${displayItem}
              width: 100%;
              height: 100%;
            }

            .container-box {
                width: inherit;
                height: inherit;
                ${props.dataItem.highlighted ? `border-left: 3px solid ${colors.bluePrimary};` : ""}
            }

            .default-colour {
                color: #FFFFFF;
                background: ${colors.bluePrimary};
                ${props.dataItem.highlighted ? `border-left: 2px solid ${colors.bluePrimary};` : ""}
                ${props.dataItem.highlighted ? `box-shadow: 3px 0 0 ${colors.white} inset;` : ""}
            }

            .inner-text {
                padding: 0 8px;
                margin: 0;
                margin-bottom: 6px;
            }

            .default-colour.unassigned {
              color: #000000;
              background: #EEEEEE;
              ${props.dataItem.highlighted ? `border-left: 2px solid #000000;` : ""}
              ${props.dataItem.highlighted ? `box-shadow: 3px 0 0 ${colors.white} inset;` : ""}
            }

              .Red {
                background-color: #FC2E50 !important;
                color: #FFFFFF !important;
              }
              .Orange {
                background-color: #F26101 !important;
                color: #FFFFFF !important;
              }
              .Yellow {
                background-color: #FFC940 !important;
                color: #FFFFFF !important;
              }
              .Green {
                background-color: #51CB68 !important;
                color: #FFFFFF !important;
              }
              .Blue {
                background-color: #5A85E1 !important;
                color: #FFFFFF !important;
              }
              .Purple {
                background-color: #735AE1 !important;
                color: #FFFFFF !important;
              }
              .Black {
                background-color: #4F4F4F !important;
                color: #FFFFFF !important;
              }
              .Grey {
                background-color: #828282 !important;
                color: #FFFFFF !important;
              }
              .LightGrey {
                background-color: #BDBDBD !important;
                color: #FFFFFF !important;
              }
              .Cyan {
                background-color: #13CACD !important;
                color: #FFFFFF !important;
              }

              .custom-color {
                background-color: ${customColor.current} !important;
                color: #FFFFFF !important;
              }

              .non-droppable {
                opacity: 0.3;
              }

          `}</style>

        </div>

      </SchedulerItem>



      {showModal ?
        <>
          <ManageAppointment isNew={false} appointment={showModal} onSavedAppointment={onSavedAppointment}
            defaultStartDate={Time.parseDate(showModal.StartDateTime)} defaultStartDateTime={Time.parseDate(showModal.StartDateTime)} defaultEndDateTime={Time.parseDate(showModal.EndDateTime)}
            accessStatus={props.dataItem.accessStatus}
          />
        </> : ""}

      {showCreateModal ?
        <>
          <ManageAppointment isNew={true} appointment={null} onSavedAppointment={onSavedAppointment}
            defaultStartDate={Time.parseDate(props.start)} defaultStartDateTime={getStart()} defaultEndDateTime={getEnd()}
            accessStatus={props.dataItem.accessStatus} module={defaultModule.current} moduleID={defaultModuleID.current}
            customerID={defaultCustomerID.current} employees={defaultEmployees.current} store={defaultStore.current}
          />
        </> : ""}

    </>
  );
}