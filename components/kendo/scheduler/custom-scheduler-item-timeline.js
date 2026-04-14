import { SchedulerItem } from "@progress/kendo-react-scheduler";
import { useCallback, useRef, useState, useContext } from "react";
import CustomKendoSchedulerContext from "../../../utils/custom-kendo-scheduler-context";
import Fetch from "../../../utils/Fetch";
import ManageAppointment from "../../modals/appointment/manage-appointment";
import Time from "../../../utils/time";
import { colors } from '../../../theme';
import KendoTooltip from '../kendo-tooltip';
import Helper from "../../../utils/helper";
import {Flex} from "@mantine/core";

export default function CustomSchedulerItemTimeline(props) {
  const seed = useRef(Helper.newGuid());
  const customKendoSchedulerContext = useContext(CustomKendoSchedulerContext);
  const [showModal, setShowModal] = useState(false);

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
  }, [props, customKendoSchedulerContext.readOnly]);

  const onSavedAppointment = useCallback(() => {
    setShowModal(null);

    // triggers a refresh using custom context as not sure how to pass in props
    customKendoSchedulerContext.setRefreshData(customKendoSchedulerContext.refreshData + 1);
  });

  const toolTemplate = () => {
    let includeDate = Time.today(props.dataItem.start) !== Time.today(props.dataItem.end);
    return (<>
      <div className="inner-text"><b>{props.dataItem.title}</b></div>
      <div className="inner-text">Item Number: {props.dataItem.itemNumber}</div>
      <div className="inner-text">Customer: {props.dataItem.customerName}</div>
      <div className="inner-text">Contact: {props.dataItem.contactName}</div>
      <div className="inner-text">Address: {props.dataItem.location ? props.dataItem.location : "N/A"}</div>
      <div className="inner-text">Employees: {props.dataItem.employees && props.dataItem.employees.length > 0 ? props.dataItem.employees && props.dataItem.employees.map(x => x.FullName).join(",") : "N/A"}</div>
      <div className="inner-text">Start: {Time.toISOString(props.dataItem.start, false, true, false, "-", includeDate)}</div>
      <div className="inner-text">End: {Time.toISOString(props.dataItem.end, false, true, false, "-", includeDate)}</div>
    </>);
  };

  return (
    <>
      <SchedulerItem
        {...props}
        onClick={handleClick}
        style={{height: 40}}
      >
        <div className={`item-container-timeline`} style={{height: '100%'}}>
          <div className={"container-box " + employeeColour.current} style={{height: '100%'}}>
            <KendoTooltip parentTitle={true} content={toolTemplate}>
              <Flex align={'center'} justify={'start'} gap={'sm'} wrap={'wrap'} py={3}>
                <div className="inner-text"><b>{props.dataItem.title}</b></div>
                {props.dataItem.itemNumber ?
                  <div className="inner-text"><b>N: </b> {props.dataItem.itemNumber}</div>
                  : ""}
                <div className="inner-text"><b>C: </b> {`${props.dataItem.customerName}${props.dataItem.contactName !== props.dataItem.customerName ? ` - ${props.dataItem.contactName}` : ""}`}</div>
              </Flex>
            </KendoTooltip>
          </div>

          <style jsx>{`
            .item-container-timeline {
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
    </>
  );
}