import React from 'react';
import Link from 'next/link';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import * as Enums from '../../utils/enums';

function LookupSubMenu({type, setType}) {

  const types = [{type: 'customerType', title: 'Customer Type'}, 
    {type: 'customerStatus', title: 'Customer Status'}, 
    {type :'designation', title: 'Designation'}, 
    {type : 'faultCause', title: 'Fault Cause'},     
    {type: 'faultCode', title: 'Fault Code'}, 
    {type: 'faultReason', title: 'Fault Reason'}, 
    {type: 'industryType', title: 'Industry Type'}, 
    {type: 'mediaType', title: 'Media Type'}, 
    {type: 'queryType', title: 'Query Type'}, 
    {type: 'queryStatus', title: 'Query Status'}, 
    {type: 'queryReason', title: 'Query Reason'}];

  return (
    <div className="submenu">
      {types.map(function (item, index) {
        return (
          <div className={`link ${type == item.type ? 'current' : ''}`} onClick={() => setType(item.type)} key={index}>
            <div className={`submenu-type`}>
              {item.title}
            </div>
          </div>
        )
      })}
      <style jsx>{`
        .submenu {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-shadow: 0px 8px 16px 0px rgba(51,51,51,0.1);
          box-sizing: border-box;
          flex-shrink: 0;
          height: fit-content;
          margin-right: 1rem;
          padding: 0.5rem 0.5rem;
          width: fit-content;
        }
        .link {
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          padding: 0.5rem;
          text-decoration: none;
          width: 100%;
        }
        .link:hover {
          background-color: ${colors.backgroundGrey};
          color: ${colors.darkPrimary};
        }
        .current {
          background-color: ${colors.backgroundGrey};
          color: ${colors.darkPrimary};
        }
      `}</style>
    </div>
  );
}

export default LookupSubMenu
