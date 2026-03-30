import React, { useState, useEffect, useRef } from 'react';
import KendoScheduler from '../kendo/scheduler/kendo-scheduler';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';

function AppointmentWidget({accessStatus}) {

    const [employees, setEmployees] = useState([]);
    const [employeeGroup, setEmployeeGroup] = useState(null);

    useEffect(() => {
        if (employees && employees.length > 0) {
            let group = {
                Name: 'Employees',
                Field: 'EmployeeID',
                ValueField: 'EmployeeID',
                TextField: 'text',
                Data: employees.map((employee) => ({
                    text: employee.FullName,
                    value: employee.ID,
                })),
            };
            setEmployeeGroup(group);
        }
    }, [employees]);

    const [appointments, setAppointments] = useState([]);
    const [defaultView, setDefaultView] = useState(Enums.SchedulerView.day);
    const [startRange, setStartRange] = useState(null);
    const [endRange, setEndRange] = useState(null);

    const searchAppointments = async (start, end, view) => {

        setStartRange(start);
        setEndRange(end);
        setDefaultView(view);

        const paramsToSend = {
            pageSize: 999,
            pageIndex: 0,
            StartDateTime: start,
            EndDateTime: end,
            EmployeeIDList: null,
            StoreIDList: null,
            IncludeUnassigned: false
        };

        const appointmentResults = await Fetch.post({
            url: `/Appointment/GetAppointments`,
            params: paramsToSend
        });
        
        let results = appointmentResults.Results;

        const employeeList = [];

        if (results && results.length > 0) {
            for (let result of results) {
                if (result.Employees && result.Employees.length > 0) {
                    for (let employee of result.Employees) {
                        if (!employeeList.some(x => x.ID == employee.ID)) {
                            employeeList.push(employee);
                        }
                    }
                }
            }
        }
        setEmployees(employeeList);
        setAppointments(results ? results : []);
    };

    const onDateRangeChange = (start, end, view) => {
        searchAppointments(start, end, view);
    };

    return (
        <div className="appointment-widget-container">

            <KendoScheduler data={appointments} onDateRangeChange={onDateRangeChange} defaultView={Enums.SchedulerView.day} showHeader={false}
                group={employeeGroup} readOnly={true} dontResize={true} accessStatus={accessStatus} />

            <style jsx>{`
                .appointment-widget-container {
                    position: relative;
                }
            `}</style>
        </div>
    )
}

export default AppointmentWidget;
