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
import InvoiceTotals from './invoice-totals';
import Link from 'next/link';
import Button from '../../button';
import ScTextAreaControl from "@/components/sc-controls/form-controls/v2/ScTextAreaControl";

function InvoiceDetail(props: any) {

  let invoice = props.invoice;
  const [showPrint, setShowPrint] = useState(props.showPrint);
  const [showTotals, setShowTotals] = useState(props.showTotals);
  const [showHyperlink, setShowHyperlink] = useState(props.showHyperlink);

  const exportDocument = (endPoint) => {
    DownloadService.downloadFile("GET", `/CustomerZone/GetInvoiceDocument?invoiceID=${invoice.ID}`, null, true, false, props.tenantID, props.customerID, props.apiUrlOverride);
  };

  return (<>
    <div className="row">
      <div className="card">

        <div className="row">
          <div className="column">
            <h2 className="item-heading">Invoice Detail</h2>
          </div>
          <div className="column-end">
            <CellStatus extraClasses="no-min-width" value={invoice.InvoiceStatus} valueEnum={"InvoiceStatus" as any} />
          </div>
        </div>

        <div className="row">
          {showHyperlink ? <div className="column">
            <div className="row">
              <span className="invoice-number">{invoice.InvoiceNumber}</span>
              <div className="link">
                <Link legacyBehavior={true} href={`/customerzone/viewinvoice?t=${props.tenantID}&c=${props.customerID}&i=${invoice.ID}`}>
                  <a onClick={() => Helper.nextLinkClicked(`/customerzone/viewinvoice?t=${props.tenantID}&c=${props.customerID}&i=${invoice.ID}`)}><img src="/icons/edit.svg" alt="edit" className="edit" /></a>
                </Link>
              </div>
            </div>
          </div> : <></>}
          {showPrint ? <div className="column-end">
            <Button
              extraClasses="auto no-margin"
              onClick={exportDocument}
              text="Print"
            />
          </div> : <></>}
        </div>


        <div className="row">
          <div className="column">
            <div className="row">
              <TextInput
                readOnly={true}
                label="Reference number"
                required={false}
                value={invoice.Reference}
                extraClasses="white"
              />
            </div>
            <div className={props.mobileView ? "" : "row"}>
              <div className={props.mobileView ? "row" : "column right-padding"}>
                <TextInput
                  disabled={true}
                  label="Invoice date"
                  required={false}
                  value={invoice.InvoiceDate ? Time.toISOString(Time.parseDate(invoice.InvoiceDate), false, false) : ""}
                  extraClasses="white"
                />
              </div>
              <div className={props.mobileView ? "row" : "column left-padding"}>
                <TextInput
                  disabled={true}
                  label="Due date"
                  required={false}
                  value={invoice.DueDate ? Time.toISOString(Time.parseDate(invoice.DueDate), false, false) : ""}
                  extraClasses="white"
                />
              </div>
            </div>
          </div>
          {props.mobileView ? "" : <div className="column">
            {/*<TextArea
              readOnly={true}
              label="Comments"
              value={invoice.Comment}
              extraClasses="white"
            />*/}
            <ScTextAreaControl
                readOnly={true}
                label="Comments"
                value={invoice.Comment}
                autosize
                maxRows={15}
                maw={'100%'}
                styles={{
                  input: {border: 0},
                  label: {fontSize: 12, color: '#777e82'}
                }}
            />
          </div>}

        </div>
        {props.mobileView ?
          <div className="row">
            <div className="column">
              {/*<TextArea
                readOnly={true}
                label="Comments"
                value={invoice.Comment}
                extraClasses="white"
              />*/}
              <ScTextAreaControl
                  readOnly={true}
                  label="Comments"
                  value={invoice.Comment}
                  autosize
                  maxRows={10}
                  maw={'100%'}
                  styles={{
                    input: {border: 0},
                    label: {fontSize: 12, color: '#777e82'}
                  }}
              />
            </div>
          </div>
          : ""}
      </div>



    </div>
    {showTotals === true ? <div className="row">
     {props.mobileView ? <></> : <div className="column"></div>} 
      <div className={props.mobileView ? "column" : "column-end"}>
        <InvoiceTotals invoice={invoice} mobileView={props.mobileView} />
      </div>
    </div> : <></>}
    <style jsx>{`

        .link {
          margin: -8px 0 0 -8px;
          display: inline-block;
        }

        .invoice-number {
          font-weight: bold;
        }

        .item-heading {
          margin: 0 0 1rem 0;
          padding: 0;
          font-size: 1.1rem;
          width: 120px;
        }

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
            padding: 0.5rem;
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

export default InvoiceDetail;