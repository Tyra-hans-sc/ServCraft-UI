import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import Router from 'next/router';
import { colors, shadows } from "../../theme";
import Fetch from '../../utils/Fetch';
import Time from '../../utils/time';
import Helper from '../../utils/helper';

function CardedJobWidget() {

    const [jobs, setJobs] = useState([]);

    const searchJobs = async () => {
    
        let today = Time.today();

        let params = {
          pageSize: 999,
          pageIndex: 0,
          startDate: today,
          IncludeClosed: false,
        };

        let searchRes = await Fetch.post({
            url: '/Job/GetJobs',
            params: {
                ...params,
            },
        });
    
        setJobs(searchRes.Results);
    };

    useEffect(() => {
        searchJobs();
    }, []);

    const navigateToJob = async (job) => {
        await Helper.waitABit();
        Helper.nextRouter(Router.push, `/job/[id]`, `/job/${job.ID}`);
    };

    const Card = (job, index) => {
        return <div key={index} className="card">

            <p className="job-card-number" title="Navigate to job" onClick={() => navigateToJob(job)}>{job.JobCardNumber}</p>
            <span style={{ position: "absolute", right: 8, top: 18, fontSize: "0.7rem", opacity: (job.Appointments && job.Appointments.length === 0 ? 0.3 : 1),
                fontWeight: (job.Appointments && job.Appointments.length === 0 ? "" : "bold") }}>
                        {job.Appointments && job.Appointments.length === 0 ? "No Appointments" :
                            job.Appointments && job.Appointments.length.toString() +
                            (job.Appointments && job.Appointments.length === 1 ? " Appointment" : " Appointments")}

            </span>
            <p className="contact-details">{job.Customer ? job.Customer.CustomerName : ""}</p>
            <p className="contact-details">{job.Contact ? job.Contact.FirstName : ""} {job.Contact ? job.Contact.LastName: ""}</p>
            <p className="contact-details">{job.Location ? job.Location.LocationDisplay : ""}</p>

            <style jsx>{`
                .card {
                    font-size: 0.85rem;
                    width: 44%;
                    max-width: 340px;
                    padding: 1rem;
                    box-shadow: ${shadows.card};
                    margin: 0 0 0.5rem 0;
                    border-radius: 3px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
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
            `}</style>
        </div>
    };
    
    return (
        <div className="card-container k-card-deck">

            {jobs && jobs.map((job, index) => {
                return (
                    Card(job, index)
                )
            })}

            <style jsx>{`
                .card-container {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                }
            `}</style>
        </div>
    );
}

export default CardedJobWidget;
