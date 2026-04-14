import Fetch from '../../utils/Fetch';

const getCustomerAppointments = async (customerID, context = null) => {
    let request = await Fetch.get({
        url: '/Appointment/GetCustomerAppointments',
        params: {
          IncludeClosed: true,
          CustomerId: customerID,
        },
        ctx: context
    });

    return {data: request.Results, total: request.TotalResults};
};

const getItemAppointments = async (itemID, context = null) => {
    const request = await Fetch.get({
        url: '/Appointment/GetItemAppointments',
        params: {
            IncludeClosed: true,
            ItemId: itemID
        },
        ctx: context
    });

    return {data: request.Results, total: request.TotalResults};
};

const getProjectAppointments = async (projectID, context = null) => {
    const request = await Fetch.get({
        url: '/Appointment/GetProjectAppointments',
        params: {
            IncludeClosed: true,
            ProjectId: projectID,
        },
        ctx: context
    });

    return {data: request.Results, total: request.TotalResults};
};

const getTodaysAppointments = async (storeID = null, context = null) => {
    let request = await Fetch.get({
        url: `/Appointment/GetTodaysAppointments?storeid=${storeID}`,
        ctx: context
    });

    return {data: request.Results, total: request.TotalResults};
};

const getAppointmentEmployeeDetails = (appointment) => {
    let employeeInitials = "";
    let employeeName = "";

    if (appointment.Employees && appointment.Employees.length > 0) {
        employeeName = appointment.Employees[0].FullName;
        if (appointment.Employees.length > 1){
            employeeName = employeeName + " + " + (appointment.Employees.length - 1);
        }
        let employeeNames = appointment.Employees[0].FullName.split(' ');
        employeeInitials = employeeNames[0][0] + employeeNames[1][0]        
    }

    return {employeeName, employeeInitials};
};

export default {
    getCustomerAppointments,
    getItemAppointments,
    getProjectAppointments,
    getTodaysAppointments,
    getAppointmentEmployeeDetails,
};
