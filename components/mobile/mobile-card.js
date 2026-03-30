import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import * as Enums from '../../utils/enums';
import Time from '../../utils/time';

function MobileCard({moduleCode, data, itemClick}) {

  const editItem = () => {
    itemClick(data);
  }

  const getCardContents = () => {
    switch (moduleCode) {
      case Enums.Module.Asset:
        return (<div onClick={editItem}>
          <div className="mobile-top-right">
            {Time.formatDate(data.PurchaseDate)}
          </div>
          <div className="mobile-contact-container">
            <div className="mobile-icon">
              <img src={`${Enums.Icon.User}`} />
            </div>
            <div className="mobile-heading">
              Contact
            </div>
            <div className="mobile-data">
              {data.CustomerContactFullName}
            </div>
          </div>
          <div className="mobile-contact-container">
            <div className="mobile-icon">
              <img src={`${Enums.Icon.MapPin}`} />
            </div>
            <div className="mobile-heading">
              Location
            </div>
            <div className="mobile-data">
              {data.LocationDescription}
            </div>
          </div>
          <div className="mobile-contact-container">
            More to come...
          </div>
          <style jsx>{`
            .mobile-top-right {
              display: flex;
              flex-direction: row-reverse;
            }
            .mobile-contact-container {
              display: flex;
              flex-direction: row;
              position: relative;
              height: 3rem;
            }
            .mobile-heading {
              left: 2rem;
              display: flex;
              position: absolute;   
              color: ${colors.blueGrey};
            }
            .mobile-data {
              display: flex;
              position: absolute;
              left: 2rem;
              top: 1rem;
              color: ${colors.darkPrimary};
              font-weight: bold;
            }
            .mobile-icon {
              display: flex;
              flex-direction: column;
            }
          `}</style>
        </div>);
    }
  }

  return (
    <div className="card-container">      

      {getCardContents()}
      
      <style jsx>{`
        .card-container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-shadow: ${shadows.card};
          box-sizing: border-box;
          color: ${colors.darkSecondary};
          cursor: pointer;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 13rem;
          margin-left: 1rem;
          margin-bottom: 1rem;
          opacity: 1;
          padding: 1rem;
          position: relative;
          transition: opacity 0.3s ease-in-out;
          width: 100%;
        }
        .card-container-faded {
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
}

export default MobileCard;
