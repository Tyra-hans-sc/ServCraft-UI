import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';
import Button from '../../button';
import Helper from '../../../utils/helper';
import Time from '../../../utils/time';
import * as Enums from '../../../utils/enums';
import StarRating from '../../job/rating/star-rating';

function JobRatingFeedback({jobCard, feedbackList, onCancel}) {

    const [activeFeedback, setActiveFeedback] = useState();
    const [total, setTotal] = useState(feedbackList.length);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (feedbackList && feedbackList.length > 0) {
            setActiveFeedback(feedbackList[0]);
        }
    }, [feedbackList]);

    const goLeft = () => {
        if (currentIndex > 0) {
            setActiveFeedback(feedbackList[currentIndex - 1]);
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goRight = () => {
        if (currentIndex < total - 1) {
            setActiveFeedback(feedbackList[currentIndex + 1]);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const activeFeedbackItem = (feedback) => {
        return (
            <>
                <div className='scroll-row'>
                    <div className='row'>
                        <div className='left-arrow'>
                            <img src={`/icons/${currentIndex === 0 ? 'chevron-left' : 'chevron-left-black'}.svg`} onClick={goLeft} title="Previous" />
                        </div>

                        <div className='score'>
                            <div className='score-text'>
                                <span>Score</span>
                            </div>
                            <div className='score-value'>                        
                                {StarRating(feedback.Rating)}
                            </div>
                        </div>
                        <div className='completed'>
                            <div className='completed-text'>
                                <span>Completed</span>
                            </div>
                            <div className='completed-date'>                           
                                {Time.toISOString(feedback.CompletedDate, false, true, false)}                                
                            </div>
                        </div>
                        <div className='ratings-recieved'>
                            <div className='ratings-text'>
                                <span>Ratings received on this Job</span>
                            </div>
                            <div className='ratings-value'>
                                {currentIndex + 1} out of {total}
                            </div>
                        </div>
                        
                        <div className='right-arrow'>
                            <img src={`/icons/${currentIndex === total - 1 ? 'chevron-right' : 'chevron-right-black'}.svg`} onClick={goRight} title="Next" />
                        </div>                        
                    </div>

                    <hr className='blue-hr' />

                </div>
                <div className='from'>
                    <b>From:</b> <span>{feedback.CustomerContactEmailAddress}</span>
                </div>

                <hr className='grey-hr' />

                <div className='body'>
                    {feedback.Comment}
                </div>

                <style jsx>{`
                    .row {
                        display: flex;
                        justify-content: space-between;
                    }
    
                    .left-arrow {
                        position: absolute;
                        top: 47%;
                        left: 0.25rem;
                    }
                    .left-arrow img {
                        cursor: ${currentIndex > 0 ? 'pointer' : 'initial'};
                    }
                    .right-arrow {
                        position: absolute;
                        top: 47%;
                        right: 0.25rem;                        
                    }
                    .right-arrow img {
                        cursor: ${currentIndex < total - 1 ? 'pointer' : 'initial'};
                    }
    
                    hr.blue-hr {
                        border-top 1px solid ${colors.bluePrimary};
                    }

                    hr.grey-hr {
                        border-top 1px solid ${colors.borderGrey};
                    }
    
                    .score {
                        display: flex;
                        flex-direction: column;
                    }
                    .score-value {
                        display: flex;
                    }

                    .ratings-value {
                        color: ${colors.bluePrimary};
                    }
    
                    .from {
                        margin-top: 1rem;
                    }
    
                    .body {
                        margin-top: 1rem;
                    }
                `}</style>
            </>
        )
    };

    return (
        <div className='overlay' onClick={(e) => e.stopPropagation()}>
            <div className='modal-container'>
                <div className='close-button'>
                    <img src="/icons/x.svg" onClick={onCancel} title="Close" />
                </div>

                <div className='title'>
                   Job {jobCard.JobCardNumber}
                </div>

                {activeFeedback ? activeFeedbackItem(activeFeedback) : ''}
            </div>

            <style jsx>{`
                .modal-container {
                    position: relative;
                    padding-left: 2rem;
                    padding-right: 2rem;
                }
                .title {
                    color: ${colors.bluePrimary};
                    font-size: 1.125rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }                

                .column {
                    display: flex;
                    align-items: center;
                    margin-right: 1rem;
                }    
                .close-button {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    cursor: pointer;
                }        
            `}</style>
        </div>
    )
}

export default JobRatingFeedback;
