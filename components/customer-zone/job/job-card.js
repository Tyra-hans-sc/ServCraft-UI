import SCListCard from "../../sc-controls/layout/sc-list-card";
import { colors } from "../../../theme";
import Time from "../../../utils/time";

export default function JobCard({ job, onClick, now }) {

    const cardClick = () => {
        onClick && onClick(job);
    };

    const getAppointment = () => {
        let apps = job.Appointments ? job.Appointments.filter(x => x.IsActive).sort((a, b) => a.StartDateTime > b.StartDateTime ? 1 : -1) : [];

        let today = Time.parseDate(Time.today(now));
        let tomorrow = Time.parseDate(Time.today(now));
        tomorrow.setDate(tomorrow.getDate() + 1);
        let todaysApps = apps.filter(x => Time.parseDate(x.StartDateTime).valueOf() >= today.valueOf() && Time.parseDate(x.StartDateTime).valueOf() < tomorrow.valueOf());
        let pastApps = apps.filter(x => Time.parseDate(x.StartDateTime).valueOf() < today.valueOf());
        let futureApps = apps.filter(x => Time.parseDate(x.StartDateTime).valueOf() >= tomorrow.valueOf());

        if (todaysApps && todaysApps.length > 0) {
            return todaysApps[0];
        } else if (futureApps && futureApps.length > 0) {
            return futureApps[0];
        } else if (pastApps && pastApps.length > 0) {
            return pastApps[pastApps.length - 1];
        } else {
            return null;
        }
    };

    const appointment = getAppointment();

    return (<>
        <SCListCard onClick={cardClick}>
            <h4 className="list-card-heading">
                {job.JobCardNumber}
            </h4>

            <table className="list-card-table">
                <tbody>
                    <tr>
                        <td className="list-card-icon-column">
                            <img src="/icons/quotes-black.svg" height="16" />
                        </td>
                        <td className="list-card-content-column">
                            <b>{job.JobCardStatusDescription}</b>
                        </td>
                    </tr>
                    {job.Location ?
                        <>
                            <tr>
                                <td className="list-card-icon-column">
                                    <img src="/icons/map-pin.svg" height="16" />
                                </td>
                                <td className="list-card-content-column">{job.Location.AddressLine1}</td>
                            </tr>

                            {job.Location.AddressLine2 ? <tr>
                                <td className="list-card-icon-column">
                                </td>
                                <td className="list-card-content-column">{job.Location.AddressLine2}</td>
                            </tr> : ""}

                            {job.Location.AddressLine3 ? <tr>
                                <td className="list-card-icon-column">
                                </td>
                                <td className="list-card-content-column">{job.Location.AddressLine3}</td>
                            </tr> : ""}

                            {job.Location.AddressLine4 ? <tr>
                                <td className="list-card-icon-column">
                                </td>
                                <td className="list-card-content-column">{job.Location.AddressLine4}</td>
                            </tr> : ""}

                            {job.Location.AddressLine5 ? <tr>
                                <td className="list-card-icon-column">
                                </td>
                                <td className="list-card-content-column">{job.Location.AddressLine5}</td>
                            </tr> : ""}

                        </> : ""}


                    {appointment ?
                        <tr>
                            <td className="list-card-icon-column">
                                <img src="/icons/appointments-black.svg" height="16" />
                            </td>
                            <td className="list-card-content-column">{Time.toISOString(Time.parseDate(appointment.StartDateTime), false, true, false)}</td>
                        </tr>
                        : <></>}
                </tbody>
            </table>
        </SCListCard>

        <style jsx>{`
            .list-card-heading {
                margin: 0;
            }

            table.list-card-table {
                width: 100%;
                margin-top: 0.5rem;
            }

            .list-card-icon-column {
                min-width: 2rem;
                max-width: 2rem;
                vertical-align: top;
            }

            .list-card-content-column {
                width: 100%;
                vertical-align: top;
            }

            .list-card-content-column p {
                margin: 0 0 0.5rem 0;
            }
        `}</style>
    </>);
}