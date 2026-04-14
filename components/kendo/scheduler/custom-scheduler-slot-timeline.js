import { SchedulerSlot } from "@progress/kendo-react-scheduler";
import React, { useCallback, useState, useContext, useRef } from "react";
import ManageAppointment from "../../modals/appointment/manage-appointment";
import Time from '../../../utils/time';
import SubscriptionContext from '../../../utils/subscription-context';
import CustomKendoSchedulerContext from "../../../utils/custom-kendo-scheduler-context";
import * as Enums from '../../../utils/enums';
import { colors } from "../../../theme";

export default function CustomSchedulerSlotTimeline(props) {
    const thisRef = useRef();
    const subscriptionContext = useContext(SubscriptionContext);
    const customKendoSchedulerContext = useContext(CustomKendoSchedulerContext);

    const defaultModule = useRef(null);
    const defaultModuleID = useRef(null);
    const defaultCustomerID = useRef(null);
    const defaultEmployees = useRef([]);
    const defaultStore = useRef(null);
    const [showModal, setShowModal] = useState(false);

    const createDataItemFromSlot = React.useCallback(() => {
        const dataItem = {};
        dataItem.start = new Date(props.start.getTime());
        dataItem.end = new Date(new Date(props.end.getTime()));
        dataItem.isAllDay = props.isAllDay;
        return dataItem;
    }, [props.end, props.isAllDay, props.start]);

    const handleClick = useCallback((event) => {
        if (customKendoSchedulerContext.readOnly) return;

        console.log(props.group, props.group.resources, props.group.resources[0].value);

        if (props.group && props.group.resources && props.group.resources.length > 0) {
            // Get the employee ID from the resources
            defaultEmployees.current = props.group.resources

        }

        setShowModal(true);

        if (props.onClick) {
            props.onClick(event);
        }
    }, [createDataItemFromSlot, props, customKendoSchedulerContext.readOnly, customKendoSchedulerContext.employees]);

    const onSavedAppointment = useCallback(() => {
        setShowModal(false);

        // triggers a refresh using custom context as not sure how to pass in props
        customKendoSchedulerContext.setRefreshData(customKendoSchedulerContext.refreshData + 1);
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
        let start = Time.parseDate(props.start);
        return start;
    }

    const getEnd = () => {
        let end = getStart();
        end.setHours(end.getHours() + 1);
        return end;
    }

    return (<>
        <div ref={thisRef} className="timeline-slot-container">
            <SchedulerSlot onClick={handleClick} {...props}>
                {props.children}
            </SchedulerSlot>
        </div>
        {showModal ?
            <>
                <ManageAppointment isNew={true} appointment={null} onSavedAppointment={onSavedAppointment}
                    defaultStartDate={Time.parseDate(props.start)} defaultStartDateTime={getStart()} defaultEndDateTime={getEnd()}
                    accessStatus={subscriptionContext.subscriptionInfo.AccessStatus} module={defaultModule.current} moduleID={defaultModuleID.current}
                    customerID={defaultCustomerID.current} employees={defaultEmployees.current} store={defaultStore.current} readOnly={CustomKendoSchedulerContext.readOnly}
                />
            </> : ""}

        <style jsx>{`
            .timeline-slot-container {
                width: inherit;
                cursor: pointer;
                &:hover {
                    background: ${colors.formGrey};
                }
            }
            `}</style>
    </>);
};
