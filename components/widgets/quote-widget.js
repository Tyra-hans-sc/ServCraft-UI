import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import SCCard from '../sc-controls/layout/sc-card';
import Router from 'next/router';

function QuoteWidget() {

    const [draftCount, setDraftCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [acceptedCount, setAcceptedCount] = useState(0);
    const [declinedCount, setDeclinedCount] = useState(0);
    const [invoicedCount, setInvoicedCount] = useState(0);
    
    const getCounts = async () => {
        let countRequest = await Fetch.get({
            url: `/Quote/GetStatusCounts`,
        });
        let results = countRequest.Results;

        let draftResult = results.find(x => x.Key == Enums.QuoteStatus.Draft);
        let approvedResult = results.find(x => x.Key == Enums.QuoteStatus.Approved);
        let acceptedResult = results.find(x => x.Key == Enums.QuoteStatus.Accepted);
        let declinedResult = results.find(x => x.Key == Enums.QuoteStatus.Declined);
        let invoicedResult = results.find(x => x.Key == Enums.QuoteStatus.Invoiced);

        setDraftCount(draftResult ? draftResult.Value : 0);
        setApprovedCount(approvedResult ? approvedResult.Value : 0);
        setAcceptedCount(acceptedResult ? acceptedResult.Value : 0);
        setDeclinedCount(declinedResult ? declinedResult.Value : 0);
        setInvoicedCount(invoicedResult ? invoicedResult.Value : 0);
    };

    useEffect(() => {
        getCounts();
    }, []);

    const navigateToQuoteList = async (tab) => {
        await Helper.waitABit();
        Helper.nextRouter(Router.push, `quote/list?tab=${tab}`);
    };

    const body = () => (
        <div className="body-container">
            <div className="body-item" onClick={() => navigateToQuoteList("drafts")}>
                <div className="body-text">Draft</div>
                <div className="item">
                    <div className={"number"} style={{backgroundColor: colors.cyanStatus}}>{draftCount}</div>
                </div>
            </div>
            <div className="body-item" onClick={() => navigateToQuoteList("awaiting")}>
                <div className="body-text">Awaiting Acceptance</div>
                <div className="item">
                    <div className={"number"} style={{backgroundColor: colors.blueStatus}}>{approvedCount}</div>
                </div>                
            </div>
            <div className="body-item" onClick={() => navigateToQuoteList("accepted")}>
                <div className="body-text">Accepted</div>
                <div className="item">
                    <div className={"number"} style={{backgroundColor: colors.greenStatus}}>{acceptedCount}</div>
                </div>                
            </div>
            <div className="body-item" onClick={() => navigateToQuoteList("declined")}>
                <div className="body-text">Declined</div>
                <div className="item">
                    <div className={"number"} style={{backgroundColor: colors.redStatus}}>{declinedCount}</div>
                </div>                
            </div>
            <div className="body-item" onClick={() => navigateToQuoteList("invoiced")}>
                <div className="body-text">Invoiced</div>
                <div className="item">
                    <div className={"number"} style={{backgroundColor: colors.orangeStatus}}>{invoicedCount}</div>
                </div>                
            </div>

            <style jsx>{`
                .body-container {
                    
                }
                .body-item {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }
                .body-text {
                    
                }
                .item {
                    align-items: center;
                    box-sizing: border-box;
                    cursor: pointer;
                    display: flex;
                    height: 100%;
                    padding: 3px 6px 3px 3px;
                    justify-content: flex-end;
                  }
                .number {
                    align-items: center;
                    background-color: #E3E9EC;
                    border-radius: 20px;
                    color: ${colors.white};
                    display: flex;
                    font-size: 16px;
                    font-weight: bold;
                    height: 40px;
                    justify-content: center;
                    margin-right: 12px;
                    width: 40px;
                  }
            `}</style>
        </div>
    );

    return (
        <div className="quote-widget-container">

            <SCCard body={body()} />

            <style jsx>{`
                .quote-widget-container {
                    
                }
            `}</style>
        </div>
    )
}

export default QuoteWidget;
