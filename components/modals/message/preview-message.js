import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import * as Enums from '../../../utils/enums';
//import { Editor, EditorTools } from '@progress/kendo-react-editor';

function PreviewMessage({message, setShowPreview}) {


  return (
    <div className="preview-overlay">
      <div className="preview-modal-container">
        <div className="preview-close">
          <img src="/icons/x-circle-dark.svg" alt='close' title='Close' onClick={() => setShowPreview(false)} />
        </div>
        {/* {message.MessageType == Enums.MessageType.Email ?
          <div className="preview" dangerouslySetInnerHTML={{
          __html: message.MessageBody
          }}></div> : 
          <div className="preview">
            {message.MessageBody}
          </div>
        } */}
        {message.MessageType == Enums.MessageType.Email ?
          <div className="preview">
            {/* <Editor
              value={message.MessageBody}
              tools={[]}
              contentStyle={{ width: "100%", height: "15rem" }}
            /> */}
            <div className="content" dangerouslySetInnerHTML={{
            __html: message.MessageBody
            }}></div>
          </div>
           : 
          <div className="preview">
            {message.MessageBody}
          </div>
        }
      </div>
      <style jsx>{`
        .preview-overlay {
          align-items: left;
          display: flex;
          justify-content: left;
          position: fixed;
          right: 29rem;
          top: 6rem;
          z-index: 110;
        }
        .preview-modal-container {
          background-color: var(--white-color);
          border-radius: var(--layout-card-radius);
          padding: 2rem 3rem;
          width: 30rem;
          max-height: 18rem;
          overflow-x: auto;
          box-shadow: 0 0 10px rgba(0,0,0,0.04), 0 0 25px rgba(0,0,0,0.1);
        }
        .preview-modal-container p {
          color: ${colors.blueGreyLight};
          font-size: 0.875rem;
          margin: 1rem 0 0.25rem 0
        }
        .preview-modal-container h1 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-left: 0.5rem;
        }
        .relative-position {
          position: relative;
        }
        .preview {
          align-items: center;
          border: 1px solid ${colors.borderGrey};
          border-radius: ${layout.cardRadius};
          display: flex;
          justify-content: center;
          object-fit: contain;
          overflow-y: auto;
          position: relative;
          width: 100%;
        }
        .thumb {
          width: 100%;
        }
        .info {
          align-items: center;
          color: ${colors.darkSecondary};
          display: flex;
          font-size: 0.75rem;
          justify-content: space-between;
          padding-top: 8px;
          width: 100%
        }
        .preview-edit {
          align-items: flex-end;
          bottom: 1rem;
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          font-size: 0.875rem;
          font-weight: bold;
          position: absolute;
          right: 1rem;
        }
        .preview-edit img {
          margin-right: 0.5rem;
        }
        .preview-close {
          align-items: flex-end;
          top: 0.5rem;
          cursor: pointer;
          display: flex;
          font-size: 0.875rem;
          font-weight: bold;
          position: absolute;
          right: 1.5rem;
        }
        .cancel {
          width: 6rem;
        }
      `}</style>
    </div>
  );
}

export default PreviewMessage;
