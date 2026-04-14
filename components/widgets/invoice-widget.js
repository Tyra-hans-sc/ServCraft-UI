import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import SCCard from '../sc-controls/layout/sc-card';

function InvoiceWidget() {

    const [draftCount, setDraftCount] = useState(0);
    const [unpaidCount, setUnpaidCount] = useState(0);
    const [overdueCount, setOverdueCount] = useState(0);
    const [paidCount, setPaidCount] = useState(0);

    const getCounts = async () => {
        let countRequest = await Fetch.get({
            url: `/Invoice/GetStatusCounts`,
        });
        let results = countRequest.Results;

        let draftResult = results.find(x => x.Key == Enums.InvoiceStatus.Draft);
        let unpaidResult = results.find(x => x.Key == Enums.InvoiceStatus.Unpaid);
        let overdueResult = results.find(x => x.Key == Enums.InvoiceStatus.Overdue);
        let paidResult = results.find(x => x.Key == Enums.InvoiceStatus.Paid);

        setDraftCount(draftResult ? draftResult.Value : 0);
        setUnpaidCount(unpaidResult ? unpaidResult.Value : 0);
        setOverdueCount(overdueResult ? overdueResult.Value : 0);
        setPaidCount(paidResult ? paidResult.Value : 0);
    };

    useEffect(() => {
        getCounts();
    }, []);

    const navigateToInvoiceList = async (tab) => {
        await Helper.waitABit();
        Helper.nextRouter(Router.push, `invoice/list?tab=${tab}`);
    };

    const body = () => (
        <div className="body-container">
            <div className="body-item" onClick={() => navigateToInvoiceList("drafts")}>
                <div className="body-text">Draft</div>
                <div className="item">
                    <div className={"number"} style={{backgroundColor: colors.cyanStatus}}>
                        {draftCount}
                    </div>
                </div>
            </div>
            <div className="body-item" onClick={() => navigateToInvoiceList("approved")}>
                <div className="body-text">Unpaid</div>
                <div className="item">
                    <div className={"number"} style={{backgroundColor: colors.greenStatus}}>{unpaidCount}</div>
                </div>                
            </div>
            <div className="body-item" onClick={() => navigateToInvoiceList("paid")}>
                <div className="body-text">Paid</div>
                <div className="item">
                    <div className={"number"} style={{backgroundColor: colors.blueStatus}}>{paidCount}</div>
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
        <div className="invoice-widget-container">
            <SCCard body={body()} />
        </div>
    )
}

export default InvoiceWidget;
