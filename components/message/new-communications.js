import React, { useState, useEffect, useRef, useContext } from 'react';
import Router from 'next/router';
import CommunicationOld from '../shared-views/communication-old';
import ButtonDropdown from '../button-dropdown';
import KendoPager from '../kendo/kendo-pager';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import BillingService from '../../services/billing-service';
import SubscriptionContext from '../../utils/subscription-context';
import Helper from '../../utils/helper';

function Communications({ customerID, itemId, module, accessStatus }) {

  const disableCreateButtons = accessStatus === Enums.AccessStatus.LockedWithAccess 
    || accessStatus === Enums.AccessStatus.LockedWithOutAccess
    || Helper.isNullOrUndefined(customerID);

  const [messages, setMessages] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);

  const [hasCreditsAvailable, setHasCreditsAvailable] = useState(false);
  const subscriptionContext = useContext(SubscriptionContext);

  const getCreditsAvailable = async () => {
    const [subscriptionInfo, message] = await BillingService.getSubcriptionInfo(subscriptionContext);
    if (subscriptionInfo) {
      setHasCreditsAvailable(subscriptionInfo.SMSCreditsPurchased - (subscriptionInfo.SMSCreditsUsed ? subscriptionInfo.SMSCreditsUsed : 0) > 0);
    }
  };

  useEffect(() => {
    getCreditsAvailable();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  const firstUpdatePage = useRef(true);
  useEffect(() => {
    // if (firstUpdatePage.current) {
    //   firstUpdatePage.current = false;
    //   return;
    // }

    fetchMessages();
  }, [currentPage]);

  const fetchMessages = async () => {
    const request = await Fetch.post({
      url: '/Message/GetMessages',
      params: {
        ItemId: itemId,
        pageIndex: (currentPage - 1),
        pageSize: pageSize
      }
    });
    setMessages(request.Results);
    setTotalMessages(request.TotalResults);
  };

  const [optionButtons, setOptionButtons] = useState([
    { text: 'Create SMS', link: `CreateSMS` },
    { text: 'Create Email', link: `CreateEmail` },
    { text: 'Create SMS & Email', link: `CreateSMSEmail` },
  ]);

  const optionsClick = (link) => {
    switch (link) {
      case 'CreateSMS':
        Helper.nextRouter(Router.push, '/new-communication/[id]?moduleCode=' + module + '&method=sms', '/new-communication/' + itemId + '?moduleCode=' + module + '&method=sms');
        break;
      case 'CreateEmail':
        Helper.nextRouter(Router.push, '/new-communication/[id]?moduleCode=' + module + '&method=email', '/new-communication/' + itemId + '?moduleCode=' + module + '&method=email');
        break;
      case 'CreateSMSEmail':
        Helper.nextRouter(Router.push, '/new-communication/[id]?moduleCode=' + module + '&method=both', '/new-communication/' + itemId + '?moduleCode=' + module + '&method=both');
        break;
    }
  };

  return (
    <div className={`tab-list-container ${messages.length == 0 ? 'full-height': '' }`}>  
      <div className="row end">
        <div className="search-container">
        </div>
        <div className="button">
          <ButtonDropdown
            disabled={disableCreateButtons}
            text="Create New"
            options={optionButtons}
            action={optionsClick}
          />
        </div>
      </div>
      { messages.length > 0
        ? <div>
          <div className="messages">
            {messages.map((message, key) =>
              <CommunicationOld message={message} fetchMessages={fetchMessages} key={key} hasCreditsAvailable={hasCreditsAvailable} />
            )}
          </div>
          
        <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalMessages} parentPageNumber={currentPage}/>

        </div>
        : <div className="empty">
          <img src="/quotes-box.svg" alt="Quote Box" />
          <h3>No messages</h3>
        </div>
      }
      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }
        .search-container :global(.search) {
          width: 528px;
          }
        .end {
          align-items: flex-end;
        }
        .button {
          width: 13.5rem;
        }
        .empty {
          align-items: center;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          justify-content: center;
        }
        .empty img {
          margin-top: -3rem;
        }
      `}</style>
    </div>
  )
}

export default Communications;
