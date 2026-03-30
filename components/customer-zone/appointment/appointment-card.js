import SCListCard from "../../sc-controls/layout/sc-list-card";
import { colors } from "../../../theme";
import Time from "../../../utils/time";
import * as Enums from '../../../utils/enums';
import Helper from "../../../utils/helper";

export default function AppointmentCard({ appointment, onClick }) {

    const cardClick = () => {
        onClick && onClick(appointment);
    };

    return (<>
        <SCListCard onClick={cardClick}>

            <h4 className="list-card-heading">
                {Time.dayOfWeek(appointment.StartDateTime)}, {Time.formatDate(appointment.StartDateTime)}
            </h4>

            <table className="list-card-table">
                <tbody>

                    <tr>
                        <td className="list-card-icon-column">
                            <img src="/icons/clock-black.svg" height="16" />
                        </td>
                        <td className="list-card-content-column">{Time.toISOString(Time.parseDate(appointment.StartDateTime), false, true, false, null, false)}</td>
                    </tr>

                    {appointment.Location ?
                        <>
                            <tr>
                                <td className="list-card-icon-column">
                                    <img src="/icons/map-pin.svg" height="16" />
                                </td>
                                <td className="list-card-content-column">{appointment.Location.AddressLine1}</td>
                            </tr>

                            {appointment.Location.AddressLine2 ? <tr>
                                <td className="list-card-icon-column">
                                </td>
                                <td className="list-card-content-column">{appointment.Location.AddressLine2}</td>
                            </tr> : ""}

                            {appointment.Location.AddressLine3 ? <tr>
                                <td className="list-card-icon-column">
                                </td>
                                <td className="list-card-content-column">{appointment.Location.AddressLine3}</td>
                            </tr> : ""}

                            {appointment.Location.AddressLine4 ? <tr>
                                <td className="list-card-icon-column">
                                </td>
                                <td className="list-card-content-column">{appointment.Location.AddressLine4}</td>
                            </tr> : ""}

                            {appointment.Location.AddressLine5 ? <tr>
                                <td className="list-card-icon-column">
                                </td>
                                <td className="list-card-content-column">{appointment.Location.AddressLine5}</td>
                            </tr> : ""}

                        </> : ""}
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