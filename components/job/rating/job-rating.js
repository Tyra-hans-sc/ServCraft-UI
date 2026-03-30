import React, { useState, useEffect } from 'react';
import {useRouter} from 'next/router';
import { colors} from '../../../theme';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import Constants from '../../../utils/constants';
import Time from '../../../utils/time';
import JobRatingFeedback from '../../modals/jobcard/job-rating-feedback';
import StarRating from './star-rating';
import constants from '../../../utils/constants';

function JobRating({jobCard, feedbackList}) {

    const router = useRouter();

    const [ratedFeedbackList, setRatedFeedbackList] = useState([]);
    const [lastFeedback, setLastFeedback] = useState();
    const [jobRatingsSetup, setJobRatingsSetup] = useState(true);

    const commentDisplayLength = 100;
    const [commentDisplayLengthExceeded, setCommentDisplayLengthExceeded] = useState(false);
    
    useEffect(() => {
        if (feedbackList && feedbackList.length > 0) {
            let ratedFeedback = feedbackList.filter(x => x.Rating);
            setRatedFeedbackList(ratedFeedback);
            if (ratedFeedback.length > 0) {
                let feedback = ratedFeedback[0];
                setLastFeedback(feedback);                
                setCommentDisplayLengthExceeded(feedback.Comment.length > commentDisplayLength);
            } else {
                setLastFeedback(undefined);
            }
            setJobRatingsSetup(true);
        } else {
            setJobRatingsSetup(false);
        }
    }, [feedbackList]);

    const newRatingLinkClick = () => {
        Helper.nextRouter(router.push, `/new-communication/[id]?moduleCode=${Enums.Module.JobCard}&method=email&templateID=${Constants.templateIDs.TemplateJobRating}`,
            `/new-communication/${jobCard.ID}?moduleCode=${Enums.Module.JobCard}&method=email&templateID=${Constants.templateIDs.TemplateJobRating}`);
    };

    const setupJobRating = () => {
        router.replace({
            query: {
                ...router.query,
                help: '/getting-started-with-servcraft/how-to-edit-and-create-message-templates'
            }
        });
    };

    const [showJobRatingFeedback, setShowJobRatingFeedback] = useState(false);

    const viewRatingsClick = () => {
        setShowJobRatingFeedback(true);
    };    

    const shortenComment = (comment) => {
        if (comment.length > commentDisplayLength) {
            return comment.trim().substring(0, commentDisplayLength) + '...';
        }
        return comment;
    };

    return (
        <div className='job-rating-container'>

            {/*<div className='heading'>
                <span>Job Rating</span>
            </div>*/}

            <div className='job-rating-contents'>

                <div className='job-rating-header'>                
                    
                    <div className='score'>
                        <div className='score-text'>
                            <span>Score</span>
                        </div>
                        <div className='score-value'>
                            {lastFeedback ? 
                                <>
                                    {StarRating(lastFeedback.Rating)}
                                </> 
                                : 
                                <>
                                    {StarRating()}
                                </>
                            }
                        </div>
                    </div>

                    <div className='completed'>
                        <div className='completed-text'>
                            <span>Completed</span>
                        </div>
                        <div className='completed-date'>
                            {lastFeedback ? 
                                <>
                                {Time.toISOString(lastFeedback.CompletedDate, false, true, false)}
                                </> 
                                : '-'
                            }
                        </div>
                    </div>

                    <div className='from'>
                        <div className='from-text'>
                            <span>From</span>
                        </div>
                        <div className='from-email'>
                            {lastFeedback ? <>{lastFeedback.CustomerContactEmailAddress}</> : '-'}
                        </div>
                    </div>

                </div>

                <div className='job-rating-body'>
                    {lastFeedback ? 
                        <>
                            {shortenComment(lastFeedback.Comment)}
                        </>
                        :
                        <>
                        {jobRatingsSetup ? <span>Customer hasn&apos;t provided feedback yet</span>
                            : <span>Ask your clients for their feedback related to the job and or service you have provided to them.</span>}
                        </>
                    }
                </div>

                <div className='job-rating-link'>
                    {lastFeedback ? 
                        commentDisplayLengthExceeded || ratedFeedbackList.length > 1 ? <span onClick={viewRatingsClick}>View Rating</span> : ''
                        : 
                        <>
                        {jobRatingsSetup ?
                            <span onClick={newRatingLinkClick}>Resend Rating</span>
                            : <span onClick={setupJobRating}>See how to set this up</span> }
                        </>
                    }

                </div>
            </div>

            {showJobRatingFeedback ?
                <JobRatingFeedback jobCard={jobCard} feedbackList={ratedFeedbackList} onCancel={() => setShowJobRatingFeedback(false)} /> : ''
            }

            <style jsx>{`
                .job-rating-container {                    
                    margin-bottom: 1rem;
                    max-width: ${constants.maxFormWidth};
                }

                .job-rating-contents {
                    display: flex;
                    flex-direction: column;
                    background-color: var(--form-grey-color);
                    padding: 1rem;
                    position: relative;
                }

                .job-rating-header {
                    display: flex;
                }

                .header {
                    font-size: 16px;
                }
                .completed {
                    margin-right: 2rem;
                }
                .completed-text, .completed-date, .from-text, .from-email {
                    color: ${colors.labelGrey};
                }
                .score {
                    display: flex;
                    flex-direction: column;
                    margin-right: 2rem;
                    color: ${colors.labelGrey};
                }
                .score-value {
                    display: flex;
                }

                .job-rating-body {
                    display: flex;
                    margin-top: 1rem;
                    width: 50%;
                }

                .job-rating-link {                   
                    display: flex;
                    margin-top: 1rem;
                    color: ${colors.bluePrimary};
                }

                .job-rating-link span {
                    cursor: pointer;
                }
            `}</style>
        </div>
    )
}

export default JobRating;
