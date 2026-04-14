import React, { useState, useEffect } from 'react';
import * as Enums from '../../../../utils/enums';
import Time from '../../../../utils/time';
import Helper from '../../../../utils/helper';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../../theme';
import FeedbackService from '../../../../services/feedback-service';
import StarRating from '../../../job/rating/star-rating';

function JobRatings({customerID, tenantID, api, jobCardID}) {

    const [feedbackList, setFeedbackList] = useState();
    const [showJobRatings, setShowJobRatings] = useState(false);

    const getFeedback = async () => {
      
        const feedbackResponse = await FeedbackService.getFeedbackListCustomerZone(tenantID, customerID, api, jobCardID, Enums.Module.JobCard);
        let data = feedbackResponse.data;   
        let total = feedbackResponse.total;
  
        if (total > 0) {
            data = data.filter(x => x.Rating && x.CompletedDate);
            if (data.length > 0) {
                data = Helper.sortObjectArray(data, "CompletedDate", false);
                setShowJobRatings(true);
            }
        }
  
        setFeedbackList(data);
    };

    useEffect(() => {
        getFeedback();
    }, []);

    if (!showJobRatings) {
        return <></>;
    }

    return (
        <div className="card">

            <h2 className="item-heading">Job Rating</h2>
            <br />
            <div className='table-container'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Rating</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbackList && feedbackList.map(function (item, index) {
                                return (
                                    <tr key={index}>
                                        <td className='completed-date'>
                                            {Time.toISOString(item.CompletedDate, false)}
                                        </td>
                                        <td className='rating'>
                                            {StarRating(item.Rating)}
                                        </td>
                                        <td>
                                            <div className='description'>
                                                {item.Comment}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>

            <style jsx>{`
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

                .item-heading {
                    margin: 0;
                    padding: 0;
                    font-size: 1.1rem;
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

                  .completed-date {
                    width: 20%;
                  }
                  .rating {
                      display: flex;
                      margin-top: 0.5rem;
                  }
                  .description {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    -webkit-line-clamp: 2;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                  }

            `}</style>
        </div>
    )
}

export default JobRatings;
