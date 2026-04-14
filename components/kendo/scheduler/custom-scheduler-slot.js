import { SchedulerSlot, useSchedulerEditSlotFormItemContext } from "@progress/kendo-react-scheduler";
import React, { useCallback, useState, useContext, useEffect, useRef } from "react";
import ManageAppointment from "../../modals/appointment/manage-appointment";
import Time from '../../../utils/time';
import SubscriptionContext from '../../../utils/subscription-context';
import CustomKendoSchedulerContext from "../../../utils/custom-kendo-scheduler-context";
import * as Enums from '../../../utils/enums';
import { colors } from "../../../theme";
import KendoTooltip from "../kendo-tooltip";

export default function CustomSchedulerSlot(props) {

    const suppressHover = true;
    const thisRef = useRef();

    const monthView = props.monthView;
    const subscriptionContext = useContext(SubscriptionContext);
    const customKendoSchedulerContext = useContext(CustomKendoSchedulerContext);

    const defaultModule = useRef(null);
    const defaultModuleID = useRef(null);
    const defaultCustomerID = useRef(null);
    const defaultEmployees = useRef([]);
    const defaultStore = useRef(null);
    const [hover, setHover] = useState(false);
    const [addOverlay, setAddOverlay] = useState(false);

    const [, setFormItem] = useSchedulerEditSlotFormItemContext();
    const [showModal, setShowModal] = useState(false);

    const createDataItemFromSlot = React.useCallback(() => {
        const dataItem = {};
        dataItem.start = new Date(props.start.getTime());
        dataItem.end = new Date(new Date(props.end.getTime()));
        dataItem.isAllDay = props.isAllDay;
        return dataItem;
    }, [props.end, props.isAllDay, props.start]);

    const handleClick = useCallback((event) => {

        // instead of this, add using the standard component as a modal popup
        // const dataItem = createDataItemFromSlot();
        // setFormItem(dataItem);

        if (customKendoSchedulerContext.readOnly) return;

        setShowModal(true);

        if (props.onClick) {
            props.onClick(event);
        }
    }, [createDataItemFromSlot, props, setFormItem]);

    const onSavedAppointment = useCallback(() => {
        setShowModal(false);

        // triggers a refresh using custom context as not sure how to pass in props
        customKendoSchedulerContext.setRefreshData(customKendoSchedulerContext.refreshData + 1);
    });

    const updateHover = (isHover) => {
        if (suppressHover) {
            thisRef.current.style.background = isHover ? colors.formGrey : "transparent";
        } else {
            setHover(isHover);
        }
    }

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        updateHover(true);
    });

    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        updateHover(false);
    });


    const onDrop = useCallback((e) => {
        let item = JSON.parse(e.dataTransfer.getData("item"));
        let type = e.dataTransfer.getData("type");
        if (type === "job") {
            defaultModuleID.current = item.ID;
            defaultModule.current = Enums.Module.JobCard;
            defaultCustomerID.current = item.CustomerID;
            defaultEmployees.current = item.Employees;
            defaultStore.current = item.Store;
            setShowModal(true);
            updateHover(false);
        }
    });

    useEffect(() => {
        if (!showModal) {
            defaultModuleID.current = null;
            defaultModule.current = null;
            defaultCustomerID.current = null;
            defaultEmployees.current = [];
            defaultStore.current = null;
        }
    }, [showModal]);

    const onMouseEnter = useCallback((e) => {
        updateHover(true);
    });

    const onMouseLeave = useCallback((e) => {
        updateHover(false);
    });

    const outerMouseOver = useCallback((e) => {
        setAddOverlay(true);
    });

    const outerMouseOut = useCallback((e) => {
        setAddOverlay(false);
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


    return (<>
        <div ref={thisRef} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLeave} className="droppable-container" >
            <SchedulerSlot onClick={handleClick} onMouse {...props} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} >
                {monthView && Time.parseDate(props.start).getDate()}
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

            .droppable-container {
                width: inherit;
                background: ${hover ? colors.formGrey : "transparent"};
                cursor: pointer;
            }

            .hover {
                font-size: 0.7rem;
                opacity: 0.5;
                pointer-events: none;
            }
            `}</style>
    </>);
};