import Helper from "../../utils/helper";
import { colors, shadows } from "../../theme";
import { useState, useRef } from "react";
import Router from 'next/router';


export default function DraggableJobCard({ job, setSelectedItemID, selectedItemID, onDragOrClick }) {

    const [dragging, setDragging] = useState(false);

    const itemID = job.ID;

    const onDragStart = (e) => {
        e.dataTransfer.setData("item", JSON.stringify(job));
        e.dataTransfer.setData("type", "job");
        setDragging(true);
        onDragOrClick(job, true);
    };

    const onDragEnd = (e) => {
        setDragging(false);
    };

    const ignoreClick = useRef(false);
    const handleJobClick = (e) => {
        ignoreClick.current = true;
        Helper.nextRouter(Router.push, `/job/[id]`, `/job/${job.ID}`);
    };

    const handleClick = () => {
        if (ignoreClick.current) {
            ignoreClick.current = false;
            return;
        }
        setSelectedItemID(itemID === selectedItemID ? null : itemID);
        onDragOrClick(job, false);
    };

    return (<>
        <div className="card" draggable onClick={handleClick}
            onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <p className="job-card-number" title="Navigate to job" onClick={handleJobClick}>{job.JobCardNumber}</p>
            <span style={{ position: "absolute", right: 8, top: 18, fontSize: "0.7rem", opacity: (job.Appointments.length === 0 ? 0.3 : 1),
        fontWeight: (job.Appointments.length === 0 ? "" : "bold") }}>
                {job.Appointments.length === 0 ? "No Appointments" :
                    job.Appointments.length.toString() +
                    (job.Appointments.length === 1 ? " Appointment" : " Appointments")}

            </span>
            <p className="contact-details">{job.Customer.CustomerName}</p>
            <p className="contact-details">{job.Contact.FirstName} {job.Contact.LastName}</p>
            <p className="contact-details">{job.Location ? job.Location.LocationDisplay : ""}</p>

            {/* <div className="employee-container">
                {job.Employees && job.Employees.length > 0 ? <>
                    {job.Employees.map(function (employee, index) {
                        if (index < 3) {
                            return (
                                <div key={index} className={`circle circle-${index + 1} assigned`} title={employee.FullName}>
                                    {employee.FullName ? Helper.getInitials(employee.FullName) : Helper.getInitials(employee.EmployeeFullName)}
                                </div>
                            )
                        }
                    })}

                    {job.Employees.length > 3 ?
                        <div className="superscript">
                            +{job.Employees.length - 3}
                        </div> : ''
                    }

                </> : <div className="circle unassigned">
                    <img src="/icons/user-white.svg" alt="user" height="12" />
                </div>}

                <span style={{ position: "absolute", right: 0, top: 8, fontSize: "0.7rem", opacity: 0.5 }}>Appointments: {job.Appointments.length}</span>
            </div> */}

        </div>

        <style jsx>{`

        .card {
            font-size: 0.85rem;
            width: 240px;
            background: ${selectedItemID === itemID ? "#afd4ff" : "white"};
            padding: 1rem;
            box-shadow: ${shadows.card};
            margin: 0 0 0.5rem 0;
            border-radius: 3px;
            ${dragging ? "border: 1px solid rgba(0,0,0,0.5);" : ""}
            cursor: grab;
            position: relative;
            ${dragging ? "opacity: 0.1;" : ""}
        }

        .card:hover {
            transform: translateX(4px);
        }

        .job-card-number {
            font-weight: bold;
            margin: 0 0 0.2rem 0;
            width: fit-content;
            cursor: pointer;
            color: ${colors.bluePrimary};
        }

        .job-card-number:hover {
            color: ${colors.bluePrimary};
            text-decoration: underline;
        }

        .contact-details {
            margin: 0 0 0.2rem 0;
            font-size: 0.8rem;
        }

        .employee-container {
            position: relative;
            height: 1.25rem;
        }

          .circle {
            font-size: 0.5rem;
            align-items: center;
            border-radius: 0.75rem;
            color: ${colors.white};
            display: flex;
            font-weight: bold;
            height: 1.25rem;
            justify-content: center;
            left: 10.5rem;
            margin-right: 0.5rem;
            position: absolute;
            top: 0.25rem;
            width: 1.25rem;
          }
          .circle.unassigned {
            left: 0rem;
          }
          .circle-1 {
            left: 0rem;
          }
          .circle-2 {
            left: 1.5rem;
          }
          .circle-3 {
            left: 3rem;
          }
          .superscript {
            left: 4.5rem;
            margin-right: 1rem;
            position: absolute;
            top: 0.6rem;          
            width: 2.5rem;
            font-size: 0.8rem;
          }
          .assigned {
            background-color: ${colors.bluePrimary};
          }
          .unassigned {
            background-color: ${colors.blueGreyLight};
          }
    
    `}</style>
    </>);
}