import React, { useState, useEffect} from 'react';
import * as Enums from '@/utils/enums';
import Time from '@/utils/time';
import moment from 'moment';
import AppointmentService from '@/services/appointment/appointment-service';
import PS from '@/services/permission/permission-service';
import ManageAppointment from '../../../modals/appointment/manage-appointment';
import SCWidgetCard from "@/components/sc-controls/widgets/new/sc-widget-card";
import SCWidgetTitle from "@/components/sc-controls/widgets/new/sc-widget-title";
import {Anchor, Avatar, Box, Button, Card, Flex, SimpleGrid, Text, Tooltip} from "@mantine/core";
import Link from "next/link";
import styles from './carderd-appointment-widget.module.css';
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import {IconPlus} from "@tabler/icons-react";

function CardedAppointmentWidget({storeID = null, jobId = null, customerID = null, selectedEmployees = [], selectedStore = null, onDismiss = null}) {

    const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));
    const [jobPermission] = useState(PS.hasPermission(Enums.PermissionName.Job));
    const [queryPermission] = useState(PS.hasPermission(Enums.PermissionName.Query));

    const [appointments, setAppointments] = useState([]);

    const searchAppointments = async () => {
        let results;
        if (jobId) {
            // Fetch all appointments for the specific job (all time)
            results = await AppointmentService.getItemAppointments(jobId);
        } else {
            // Default to today's appointments by store
            results = await AppointmentService.getTodaysAppointments(storeID);
        }
        setAppointments(results.data);
    };

    useEffect(() => {
        searchAppointments();
    }, [storeID, jobId]);

    const getParsedDate = (date) => {
        return Time.parseDate(date);
    };

    const getModuleLink = (appointment) => {
        if (appointment.Module == Enums.Module.Customer && customerPermission) {
            return ('/customer/' + appointment.ItemID);
        } else if (appointment.Module == Enums.Module.JobCard && jobPermission) {
            return ('/job/' + appointment.ItemID);
        } else if (appointment.Module == Enums.Module.Query && queryPermission) {
            return ('/query/' + appointment.ItemID);
        } else if (appointment.Module == Enums.Module.Project && jobPermission) {
            return ('/project/' + appointment.ItemID);
        }
    }

    const [showManageAppointment, setShowManageAppointment] = useState(false);
    const [appointmentToEdit, setAppointmentToEdit] = useState(null);

        // const { data: kendoSchedulerFeature } = useQuery(['feature', 'SCHEDULER_KENDO'], () => featureService.getFeature(constants.features.SCHEDULER_KENDO));
        // const appointmentRoute = !kendoSchedulerFeature ? '/appointment/scheduler' : '/appointment';
        const appointmentRoute = '/appointment';

    const editAppointment = (appointment) => {
        setAppointmentToEdit(appointment);
        setShowManageAppointment(true);
    };

    const onAppointmentSave = (appointment) => {
        if (appointment) {
            searchAppointments();
        }
        setShowManageAppointment(false);
    };

    const AppointmentItem = (appointment, index) => {
        const now = moment();
        const start = moment(appointment.StartDateTime);
        const end = moment(appointment.EndDateTime);
        const isActive = now.isBetween(start, end, undefined, '[]');
        const isPast = end.isBefore(now);
        return <Card
            key={'appointmentCard' + index}
            onClick={() => editAppointment(appointment)}
            pos={'relative'}
            className={styles.appointmentCard}
            mih={200}
            style={{ opacity: isActive ? 1 : (isPast ? 0.6 : 1), border: isActive ? '1px solid var(--mantine-color-scBlue-2)' : undefined }}
        >

            <Flex direction={'column'} justify={'space-between'} h={'100%'}>
                <Flex wrap={"wrap-reverse"} justify={'space-between'} align={'center'} gap={1}>
                    <Text size={'xs'} c={'gray.8'}>
                        {getParsedDate(appointment.StartDateTime).toDateString()}
                    </Text>

                    {
                        appointment.ItemNumber &&
                        <Link href={getModuleLink(appointment) || ''} style={{textDecoration: 'none'}} onClick={e => e.stopPropagation()}>
                            <Anchor size={'sm'} fw={600} >{appointment.ItemNumber} </Anchor>
                        </Link>
                    }



                </Flex>

                <Text size={'sm'} c={'scBlue'}>
                    {Time.getTimeFormatted(getParsedDate(appointment.StartDateTime), 'hh:mm') + " - " + Time.getTimeFormatted(getParsedDate(appointment.EndDateTime), 'hh:mm')}
                </Text>
                <Text size={'md'} fw={600} c={'gray.9'} lineClamp={3}>
                    {appointment.Subject}
                </Text>
                <Text size={'sm'} className="customer">
                    {appointment.CustomerContactFullName}
                </Text>
                {appointment.Location
                    ? <Text lineClamp={3} size={'sm'} c={'gray.7'}>
                        {appointment.Location.LocationDisplay}
                    </Text>
                    : ''
                }

                <Flex align={'center'} gap={5}>
                    <Tooltip.Group openDelay={300} closeDelay={100}>
                        <Avatar.Group spacing={6} mt={3}>
                            {
                                appointment.Employees?.map(
                                    (x, i) => {
                                        // const nameSplit = x.FullName.split(' ')
                                        // const initials = nameSplit[0][0] + nameSplit[nameSplit.length - 1][0]
                                        return i < 5 && (
                                            /*<Tooltip key={'avatar' + x.ID} label={x.FullName} color={'scBlue'} withArrow>
                                                <Avatar size={'sm'} radius="xl" color={x.DisplayColor || 'scBlue'}
                                                        variant={'light'}>
                                                    {initials}
                                                </Avatar>
                                            </Tooltip>*/
                                            <Box ml={-4}>
                                                <EmployeeAvatar
                                                    name={x.FullName}
                                                    color={x.DisplayColor}
                                                />
                                            </Box>
                                        )
                                    }
                                )
                            }
                            {
                                appointment.Employees?.length > 5 &&
                                <Tooltip
                                    color={'scBlue'}
                                    key={'avatarrest'}
                                    withArrow
                                    label={
                                        <>
                                            {
                                                appointment.Employees?.map((x, i) => (
                                                    i > 4 && <div key={'employeeOther' + i}>{x.FullName}</div>
                                                ))
                                            }
                                        </>
                                    }
                                >
                                    <Avatar radius="xl" size={'sm'} ml={-4}
                                            color={'scBlue'}>+{appointment.Employees?.length - 5}</Avatar>
                                </Tooltip>
                            }
                        </Avatar.Group>
                    </Tooltip.Group>
                    {
                        appointment.Employees?.length === 1 &&
                        <Text c={appointment.Employees[0].DisplayColor === 'LightGrey' ? 'gray.6' : appointment.Employees[0].DisplayColor || 'scBlue'} size={'sm'} mt={4}>{appointment.Employees[0].FullName}</Text>
                    }
                </Flex>

            </Flex>

        </Card>
    };

    const getDefaultStartAndEnd = () => {
        const date = new Date().toISOString().substring(0, 10)
        const [hour, minutes] = new Date().toISOString().substring(11, 16).split(':')

        const newMinutes = minutes < '15' ? '15' : minutes < '30' ? '30' : minutes < '45' ? '45' : '00'
        let newHour = minutes < '45' ? hour : (+hour + 1) + ''

        if(+newHour < 10) {
            newHour = '0' + +newHour
        }

        const formatted = Time.parseDate(date + 'T' + newHour + ':' + newMinutes + ':00.000Z')

        if(!isNaN(formatted as any) && formatted instanceof Date) {
            return {
                // start: null,
                start: formatted,
                // end: null
                end: Time.addSeconds(3601, formatted)
            };
        } else {
            console.log('predicted date error!!!', formatted, Time.addSeconds(3601, formatted), date + 'T' + newHour + ':' + newMinutes + ':00.000Z')
            return {
                start: null,
                // start: formatted,
                end: null
                // end: Time.addSeconds(3601, formatted)
            }
        }



    }


    const appGrid = <div>
            <SimpleGrid cols={{base: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6}}>
                {
                    appointments && appointments.map((appointment, index) => {
                        return (
                            AppointmentItem(appointment, index)
                        )
                    })
                }

                <Card
                    // bg={'scBlue.1'}
                    key={'appointmentCard'}
                    onClick={() => {
                        setAppointmentToEdit(null)
                        setShowManageAppointment(true)
                    }}
                    pos={'relative'}
                    className={styles.appointmentCard}
                >
                    <Flex direction={'row'} justify={'Center'} align={'center'} h={'100%'} className={styles.addNew} mih={180} >
                        <IconPlus size={15} /><Text>Add new</Text>
                    </Flex>
                </Card>

            </SimpleGrid>
        </div>

    return (
        <>

            {
                onDismiss ?
                    <SCWidgetCard onDismiss={onDismiss} cardProps={{pb: 10}}>

                        <SCWidgetTitle title={`Today's Appointments`}/>

                        {
                            appGrid
                        }

                        <Link href={appointmentRoute}>
                            <Button
                                ml={'auto'}
                                mt={'sm'}
                                variant={'subtle'}
                                color={'gray.9'}
                                size={'xs'}
                            >
                                View All Appointments
                            </Button>
                        </Link>
                    </SCWidgetCard> :
                    appGrid
            }

            {showManageAppointment ?
                <ManageAppointment isNew={!appointmentToEdit} appointment={appointmentToEdit}
                                   onSavedAppointment={onAppointmentSave}
                                   defaultStartDate={Time.parseDate(new Date())}
                                   defaultStartDateTime={getDefaultStartAndEnd().start}
                                   defaultEndDateTime={getDefaultStartAndEnd().end}
                                   module={jobId ? Enums.Module.JobCard : undefined}
                                   moduleID={jobId || undefined}
                                   customerID={customerID || undefined}
                                   employees={!appointmentToEdit ? (selectedEmployees || []) : []}
                                   store={selectedStore || undefined}
                />
                : ''
            }
        </>


    );
}

export default CardedAppointmentWidget;
