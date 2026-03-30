import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import Reorder, { reorder } from 'react-reorder';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import InlineTextInput from '../inline-text-input';
import Button from '../button';
import CompanyService from '../../services/company-service';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';

function JobTerms({ accessStatus }) {

  const [terms, setTerms] = useState(null);

  const toast = useContext(ToastContext);

  const getTerms = async () => {
    const termResults = await Fetch.get({
      url: '/Term',
      toastCtx: toast
    });
    setTerms(termResults);
  }

  useEffect(() => {
    getTerms();
  }, []);


  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    const postResult = await Fetch.post({
      url: `/Term`,
      params: terms,
      toastCtx: toast
    });

    setTerms(postResult);
    toast.setToast({
      message: 'Terms saved successfully',
      show: true,
      type: 'success'
    });

    setSaving(false);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="column">
        </div>
        <div className="column column-end">
          <Button disabled={saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
            text={saving ? "Saving" : "Save"} extraClasses="auto save" onClick={save} />
        </div>
      </div>

      <div className="row">
        <div className="column">
          <SCTextArea
            name="JobTerms"
            label="Job Terms"
            onChange={(e) => setTerms(e.value)}
            value={terms}
            maxLength={15_000}
          />
        </div>
        <div className="column"></div>
      </div>

      <style jsx>{`      
        .section-title {
          background-color: ${colors.background};
          border-radius: ${layout.cardRadius};
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          color: ${colors.bluePrimary};
          font-size: 1.25rem;
          font-weight: bold;
          opacity: 0.9;
          padding: 1rem;
          margin-top: 2rem;
        }
        .term-add {
          background: none;
          border: 1px solid ${colors.bluePrimary};
          box-sizing: border-box;
          margin-left: 1rem;
          margin-top: 1rem;
          width: 200px;
        }
        .term-add img {
          margin-right: 0.5rem;
        }
        .term-add .term {
          background: none;
          color: ${colors.bluePrimary};
        }
        .term {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          width: 200px;
          font-size: 0.875rem;
          font-weight: bold;
          height: 3rem;
          justify-content: center;
          padding: 0 1rem;
          text-align: center;
        }
        .row {
          display: flex;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .column-end {
          align-items: flex-end;
        }
        .column-margin {
          margin-left: 24px;
        }
        .justify-end {
          justify-content: flex-end;
        }
        .end {
          align-items: flex-end;
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
          cursor: pointer;
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

        .reorder-dragged {
          width: 100%;
          height: 4rem !important;
        }
        .reorder-dragged td {
          font-size: 12px;
          min-width: 6rem;
          padding-right: 1rem;
        }

        .header-item-move {
          width: 5%;
          min-width: 30px;
        }
        .header-item-text {
          width: 90%;
        }
        .header-item-delete {
          width: 5%;
          min-width: 30px;
        }

        .body-item-move {
          cursor: move;
          width: 2rem;
        }        
        .body-item-delete {
          width: 2rem;
        }
      `}</style>
    </div>
  );
}

export default JobTerms;
