import React, { useState, useEffect, useRef, useMemo } from 'react';
import Router from 'next/router';
import Fetch from '../../utils/Fetch';
import time from '../../utils/time';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';

function CommentWidget({storeID}) {

    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [showLoadMore, setShowLoadMore] = useState(false);

    const getComments = async () => {
        let request = await Fetch.get({
            url: `/Comment/CommentRetrieveTop?count=${commentCount}&storeid=${storeID}`
        });

        setShowLoadMore(request.Results.length > 0);
        setComments(request.Results);
        setCommentCount(count => count + 5);        
    };

    useEffect(() => {  
        getComments();
    }, [storeID]);

    const [hover, setHover] = useState(false);

    const getInitials = (comment) => {
        return Helper.getInitials(comment.EmployeeName ? comment.EmployeeName : comment.CreatedBy);
    };

    const getCommentLine = (comment) => {
        return `${comment.Reference} - ${comment.EmployeeName ? comment.EmployeeName : comment.CreatedBy}`;
    };

    const navigateToItem = async (comment) => {
        await Helper.waitABit();
        let url = '';
        switch (comment.Module) {
            case Enums.Module.Customer:
                url = `customer/${comment.ItemID}`;
                break;
            case Enums.Module.JobCard:
                url = `job/${comment.ItemID}`;
                break;
            case Enums.Module.Asset:
                url = `asset/${comment.ItemID}`;
                break;
            case Enums.Module.Invoice:
                url = `invoice/${comment.ItemID}`;
                break;
            case Enums.Module.Quote:
                url = `quote/${comment.ItemID}`;
                break;
            case Enums.Module.PurchaseOrder:
                url = `purchase/${comment.ItemID}`;
                break;
            case Enums.Module.Query:
                url = `query/${comment.ItemID}`;
                break;
        }
        Helper.nextRouter(Router.push, url);
    };

    const commentJSX = (comment, index) => {
        return <div className="comment" key={index} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="row">
                <div className="initials-container">
                <div className="initials">
                    {getInitials(comment)}
                </div>
                </div>
                <div className="comment-line" onClick={() => navigateToItem(comment)}>
                    {getCommentLine(comment)}
                </div>
                <div title={`${time.toISOString(comment.CreatedDate, false, true)}`} className="time">
                {time.toISOString(comment.CreatedDate, false, true, false)}
                </div>
            </div>
            <div className="text">
                {comment.CommentText}
            </div>
            <style jsx>{`
                .initials-container {
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                }
                .initials-container :global(.initials) {
                    align-items: center;
                    color: ${colors.white};
                    display: flex;
                    flex-shrink: 0;
                    font-size: 0.875rem;
                    height: 2.4rem;
                    justify-content: center;
                    margin-right: 0.5rem;
                    position: relative;
                    width: 2.4rem;
                    z-index: 2;
                }
                .initials-container :global(.initials:after) {
                    background-color: ${colors.bluePrimary};
                    border: 2px solid ${colors.white};
                    border-radius: 1.25rem;
                    box-sizing: border-box;
                    content: '';
                    height: 2.4rem;
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 2.4rem;
                    z-index: -1;
                }

                .comment {
                    background-color: ${colors.white};
                    border-radius: ${layout.cardRadius};
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    font-size: 14px;
                    height: 5rem;
                    justify-content: center;
                    margin-top: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    position: relative;
                    width: 100%;
                }
                .comment:nth-child(2n) {
                    background-color: ${colors.backgroundGrey};
                }
                .row {
                    align-items: center;
                    display: flex;
                    margin-bottom: 4px;
                }
                .comment-line {
                    color: ${colors.bluePrimary};
                    font-weight: bold;
                    cursor: pointer;
                }

                .comment-line:hover {
                    color: ${colors.bluePrimary};
                    text-decoration: underline;
                }
                .name {
                    color: ${colors.darkPrimary};
                    font-weight: bold;
                }
                .time {
                    color: ${colors.blueGrey};
                    font-size: 12px;
                    margin-left: 1rem;
                    z-index: 6; /* One less than overlay */
                }                
                .text {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    width: calc(100% - 2.4rem);
                    overflow: hidden;
                    margin-left: 3rem;
                }
            `}</style>
        </div>
    };

    return (
        <div className="container">
            {comments && comments.map(function (comment, index) {
                return (
                    commentJSX(comment, index)
                )     
            })}

            {showLoadMore ? 
                <div className="load-more">
                    <span onClick={loading ? null : getComments}>Load more</span>
                </div>: ''
            }

            <style jsx>{`
                .container {
                    display: flex;
                    flex-direction: column;
                    margin-top: -0.5rem;
                }   
                .load-more {
                    color: ${colors.bluePrimary};                
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 1rem;
                }
                .load-more span {
                    cursor: pointer;
                }      
            `}</style>
        </div>
    )
}

export default CommentWidget;
