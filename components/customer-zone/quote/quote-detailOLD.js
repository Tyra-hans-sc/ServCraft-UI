import React, { useState, useEffect } from 'react';
import Time from '../../../utils/time';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import CellStatus from '../../cells/status';
import KendoDatePicker from '../../kendo/kendo-date-picker';
import TextInput from '../../text-input';
import TextArea from '../../text-area';
import ButtonDropdown from '../../button-dropdown';
import DownloadService from '../../../utils/download-service';
import QuoteTotals from './quote-totals';
import Link from 'next/link';

function QuoteDetail(props) {

    let quote = props.quote;
    const [showPrint, setShowPrint] = useState(props.showPrint);
    const [showTotals, setShowTotals] = useState(props.showTotals);
    const [showHyperlink, setShowHyperlink] = useState(props.showHyperlink);

    const exportDocument = (endPoint) => {
        DownloadService.downloadFile("GET", `/CustomerZone/${endPoint}`, null, true, false, props.tenantID, props.customerID, props.apiUrlOverride);
    };

    const printOptions = [
        { text: 'Quote', link: `GetQuoteDocument?quoteID=${quote.ID}` }
    ];

    return (<>
    <div className="row">
        <div className="card">
            <div className="row line-height-2rem">
                <div className="heading width-100">Quote Details: {quote.QuoteNumber}
                
                {showHyperlink ? <>
                    <Link legacyBehavior={true} href={`/customerzone/viewquote?t=${props.tenantID}&c=${props.customerID}&i=${quote.ID}`}>
                      <a onClick={() => Helper.nextLinkClicked(`/customerzone/viewquote?t=${props.tenantID}&c=${props.customerID}&i=${quote.ID}`)}><img src="/icons/edit.svg" alt="edit" className="edit"/></a>
                      </Link>
                </> : <></>}
                </div>
                <CellStatus value={quote.QuoteStatus} valueEnum="QuoteStatus" />
                {showPrint ? <>
                    <ButtonDropdown
                        extraClasses="top-margin0 width240 left-margin16"
                        action={exportDocument}
                        text="Print"
                        options={printOptions}
                    />
                </> : <></>}
            </div>
            <br />
            <div className="row">
                <div className="column">
                    <div className="row">
                        <TextInput
                            readOnly={true}
                            label="Reference number"
                            required={false}
                            value={quote.Reference}
                        />
                    </div>
                    <div className="row">
                        <div className="column right-padding">
                            <KendoDatePicker
                                disabled={true}
                                label="Quote date"
                                required={false}
                                value={quote.QuoteDate}
                            />
                        </div>
                        <div className="column left-padding">
                            <KendoDatePicker
                                disabled={true}
                                label="Expiry date"
                                required={false}
                                value={quote.ExpiryDate}
                            />
                        </div>
                    </div>
                </div>
                <div className="column">
                    <TextArea
                        readOnly={true}
                        label="Comments"
                        value={quote.Comment}
                    />
                </div>
            </div>


        </div>

        {showTotals === true ? <>
            <QuoteTotals quote={quote} />
        </> : <></>}

        </div>
        <style jsx>{`

        :global(.top-margin0) {
            margin-top: 0 !important;
        } 

        :global(.width240) {
            width: 240px !important;
        }

        :global(.left-margin16) {
            margin-left: 16px;
        }

        .card {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            box-shadow: ${shadows.card};
            box-sizing: border-box;
            padding: 1rem 2rem;
            position: relative;
            width: 100%;
        }

        .column-fixed {
            display: flex;
            flex-direction: column;
            width: 500px;
        }

        .width-100 {
            width: 100%;
        }

        .card h3 {
            margin-top: 0;
        }

        .line-height-2rem {
            line-height: 2rem;
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
            margin-top: 1.5rem;
            width: 100%;
          }
          .table thead tr {
            background-color: ${colors.backgroundGrey};
            height: 3rem;
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
            height: 4rem;
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
            padding-left: 1rem;
            text-align: left;
          }
          .table td:first-child :global(div){
            margin-left: 0;
          }
       
      `}</style>
    </>);
}

export default QuoteDetail;