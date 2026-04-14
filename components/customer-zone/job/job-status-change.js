import React, { useState, useEffect } from 'react';
import Time from '../../../utils/time';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';


function JobStatusChange(props) {
    const [jobStatusChanges, setJobStatusChanges] = useState(props.jobStatusChanges);

    return (<>
        <div className="card">
            <h2 className="item-heading">Status Flow</h2>
            <br />
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobStatusChanges.length > 0 ?
                            jobStatusChanges.map(function (item, index) {
                                return (
                                    <tr key={index}>
                                        <td>
                                            {Time.toISOString(item.CreatedDate, false)}
                                        </td>
                                        <td>
                                            {item.JobCardStatusDescription}
                                        </td>
                                        <td></td>
                                    </tr>
                                );
                            })
                            : ""
                        }
                    </tbody>
                </table>
            </div>

        </div>

        <style jsx>{`

        .item-heading {
            margin: 0;
            padding: 0;
            font-size: 1.1rem;
        }

        .card {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            box-shadow: ${shadows.card};
            box-sizing: border-box;
            padding: 0.5rem;
            position: relative;
            width: 100%;
        }

        .card h3 {
            margin-top: 0;
        }

        .container {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 1.5rem 3rem;
            overflow-x: hidden;
          }
          .row {
            display: flex;
          }
          .column {
            display: flex;
            flex-basis: 0;
            flex-direction: column;
            flex-grow: 1;
          }
          .column :global(.textarea-container) {
            height: 100%;
          }
          .column + .column {
            margin-left: 1.25rem;
          }
          .contact {
            color: ${colors.blueGrey};
            width: 100%;
            padding-right: 16px;
          }
          .contact h1 {
            color: ${colors.darkPrimary};
            font-size: 2rem;
            margin: 0 0 0.75rem;
          }
          .contact p {
            margin: 3px 0 0;
            opacity: 0.8;
          }
          .heading {
            color: ${colors.blueGrey};
            font-weight: bold;
          }
          .new-comment {
            position: relative;
          }
          .new-comment :global(.textarea-container){
            height: 5rem;
          }
          .new-comment img{
            position: absolute;
            right: 1rem;
            top: 1rem;
          }
          .loader {
            border-color: rgba(113, 143, 162, 0.2);
            border-left-color: ${colors.blueGrey};
            display: block;
            margin-bottom: 1rem;
            margin-top: 1rem;
          }
  
          .comment {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            box-sizing: border-box;
            color: ${colors.blueGrey};
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-top: 0.5rem;
            padding: 1.25rem 1rem;
            position: relative;
            width: 100%;
          }
          .comment-info {
            align-items: center;
            display: flex;
            margin-bottom: 4px;
          }
          .job {
            color: ${colors.bluePrimary};
            font-weight: bold;
          }
          .name {
            color: ${colors.darkPrimary};
            font-weight: bold;
          }
          .time {
            color: ${colors.blueGrey};
            font-size: 12px;
            margin-left: 1rem;
          }
          .text {
            white-space: pre-wrap;
          }
          .edit {
            margin-top: 0.2rem;
            margin-left: 1rem;
          }
          .status {
            position: absolute;
            right: 0;
            top: 0;
            width: max-content;
          }
          .status :global(.input-container){
            background-color: ${colors.bluePrimary};
          }
          .status :global(input){
            color: ${colors.white};
          }
          .status :global(label){
            color: ${colors.white};
            opacity: 0.8;
          }
          .actions {
              width: 240px;
          }



          .table-container {
            overflow-x: auto;
            width: 100%;
            display: flex;
            flex-direction: column;
          }
          .table {
            border-collapse: collapse;
            margin-top: 0rem;
            width: 100%;
          }
          .table thead tr {
            background-color: ${colors.backgroundGrey};
            height: 2rem;
            border-radius: ${layout.cardRadius};
            width: 100%;
          }
          .table th {
            color: ${colors.darkPrimary};
            font-size: 0.75rem;
            font-weight: normal;
            padding: 4px 1rem 4px 0; 
            position: relative;
            text-align: left;
            text-transform: uppercase;
            transform-style: preserve-3d;
            user-select: none;
            white-space: nowrap;
          }
          .table th.number-column {
            padding-right: 0;
            text-align: right;
          }
          .table th:last-child {
            padding-right: 1rem;
            text-align: right;
          }
          .table th:first-child {
            padding-left: 0.5rem;
            text-align: left;
          }
          .table .spacer {
            height: 0.75rem !important;
          }
          .table tr {
            height: 2rem;
          }
          .table td {
            font-size: 12px;
            padding-right: 1rem;
          }
          .table td.number-column {
            padding-right: 0;
            text-align: right;
          }
          .table tr:nth-child(even) td {
            background-color: ${colors.white};
          }
          .table td:last-child {
            border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
            text-align: right;
          }
          .table td:last-child :global(div){
            margin-left: auto;
          }
          .table td:first-child {
            border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
            padding-left: 0.5rem;
            text-align: left;
          }
          .table td:first-child :global(div){
            margin-left: 0;
          }
       
      `}</style>
    </>);

}

export default JobStatusChange;