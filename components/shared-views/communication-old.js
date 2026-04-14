import React, { useState } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import time from '../../utils/time';
import * as Enums from '../../utils/enums';
import CellStatus from '../cells/status-old';
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';
import Router from 'next/router';
import HelpDialog from '../help-dialog';
import Button from '../button';
import ConfirmAction from '../../components/modals/confirm-action';

function CommunicationOld({ message, fetchMessages, hasCreditsAvailable }) {

  const [showMore, setShowMore] = useState(false);
  const [inError, setInError] = useState(message.MessageStatus === Enums.MessageStatus.Error);
  const [errorMessage, setErrorMessage] = useState(message.ErrorMessage);

  function messageIcon() {
    switch (message.MessageType) {
      case Enums.MessageType.Email:
        return <img src="/messages/email.svg" alt="email" />
      case Enums.MessageType.SMS:
        return <img src="/messages/sms.svg" alt="sms" />
      default:
        return <img src="/messages/email.svg" alt="messages" />
    }
  }

  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
  
  const retrySendConfirm = async (message) => {
    const retryPost = await Fetch.post({
      url: `/Message/Retry`,
      params: {
        messageIDList: [message.ID],
      }
    });
    fetchMessages();
  }

  const retrySend = async (message) => {
    if (message.MessageStatus == Enums.MessageStatus.OutOfCredits) {

      if (hasCreditsAvailable) {

        setConfirmOptions({
          ...Helper.initialiseConfirmOptions(),
          confirmButtonText: "Retry Message",
          onConfirm: () => {
            retrySendConfirm(message);
          },
          display: true,
          heading: "Retry Message",
          text: "Are you sure you want to retry sending this message?",
        });
      } else {
        setConfirmOptions({
          ...Helper.initialiseConfirmOptions(),
          confirmButtonText: "Buy credits",
          onConfirm: () => {
            Helper.nextRouter(Router.push, `/settings/subscription/manage?tab=sms`);
          },
          display: true,
          heading: "Buy Credits",
          text: "You have run out of SMS credits. Click 'Buy credits' to buy more.",
        });
      }
    }
  }

  function messageHasAttachment() {
    return message.AttachmentFilePath
    || message.AttachInvoice
    || message.AttachJobCard
    || message.AttachQuote
    || message.AttachPurchaseOrder
    || message.AttachSignOff
    || message.AttachWorkshop
    || message.AttachJobSheet;
  };

  return (
    <div className="container">
      <div className="icon">
        {messageIcon()}
      </div>
      <div className={`details ${showMore ? "details-show" : ""}`}>
        <div className="row">
          <div className="recipient">To: <strong>{message.ToName}</strong> {
            (message.MessageType === Enums.MessageType.Email ? `[${message.ToAddress}] ` :
              message.MessageType === Enums.MessageType.SMS ? `[${message.MobileNumber}] ` : "") 
            } 
            <span>&nbsp;{`${time.toISOString(message.CreatedDate, false, true, false)}`}</span>
            { messageHasAttachment() ?  
              <div className="attachment">
                <img title="Contains attachment(s)" src="/messages/paperclip-bluegrey.svg" alt="attachment" />
              </div> : ''
            }
          </div>

          <div>
            <div className="row">
            {inError && errorMessage ? 
            <div>
            <HelpDialog message={errorMessage} position={"bottom"} width={250} hoverObjectRender={() => 
              <CellStatus value={message.MessageStatus} valueEnum={"MessageStatus"} />
            } /> </div>
            : 
            <>
              {message.MessageStatus === Enums.MessageStatus.OutOfCredits ? 
                <div><Button text="Retry" icon="send" extraClasses="grey-overlay" onClick={() => retrySend(message)} /></div> : ''
              }
              
              <CellStatus value={message.MessageStatus} valueEnum={"MessageStatus"} /> 
            </>}
            
            </div>
          </div>
        </div>
        <div className="subject">Subject: <strong>{message.Subject}</strong></div>
        <div className={`body ${(message.MessageBody && message.MessageBody.length <= 75 ? 'show-all' : '')}`} dangerouslySetInnerHTML={{ __html: message.MessageBody }}></div>
        { message.MessageBody && message.MessageBody.length > 75 ?
          showMore ?
            <div className="more" onClick={() => setShowMore(false)}>show less</div>
            :
            <div className="more" onClick={() => setShowMore(true)}>read more</div>
          : ''}
      </div>

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .container {
          background-color: ${colors.white};
          box-sizing: border-box;
          display: flex;
          margin: 0.5rem 0 0;
          padding: 1.5rem 1rem;
          position: relative;
          width: 100%;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .pointer {
          cursor: pointer;
        }
        .icon {
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 1.25rem;
          display: flex;
          flex-shrink: 0;
          height: 2.5rem;
          justify-content: center;
          margin-right: 1rem;
          width: 2.5rem;
        }
        .details {
          color: ${colors.blueGrey};
          width: 100%;
        }
        .recipient {
          display: flex;
          width: 100%;
        }
        .recipient p {
          margin: 0;
        }
        .recipient strong {
          color: ${colors.darkPrimary};
          margin: 0 0.75rem 0 0.5rem;
        }
        .attachment {
          display: flex;
          margin: 0 0.75rem 0 0.5rem;
        }
        .subject {
          display: flex;
          margin: 0.25rem 0 0.75rem;
        }
        .subject strong {
          color: ${colors.darkPrimary};
          margin-left: 0.5rem;
        }
        .body {
          height: 1.2rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 600px;
        }
        .body :global(p) {
          margin-top: 0;
        }
        .body :global(p:last-child) {
          margin-bottom: 0;
        }
        .more {
          color: ${colors.blueGreyLight};
          cursor: pointer;
          margin-top: 0.25rem;
        }
        
        .details-show :global(.body){
          height: auto;
          overflow: auto;
          white-space: normal;
        }
      `}</style>
    </div>
  )
}

export default CommunicationOld;
