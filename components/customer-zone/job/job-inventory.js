import { useState } from 'react';
import * as Enums from '../../../utils/enums';
import { colors, layout } from '../../../theme';

export default function JobInventory({ jobInventory, mobileView }) {

  const [filteredJobInventory] = useState(jobInventory.filter(x => x.IsActive && x.StockItemStatus === Enums.StockItemStatus.WorkedOn));

  return (<>
    <h2 className="item-heading">Customer Assets</h2>
    <table className="table">
      <thead>
        <tr>
          <th className="header-item-code">
            CODE
          </th>
          <th className="header-item-desc">
            {mobileView ? "DESC" : "DESCRIPTION"}
          </th>
          <th className="header-item-qty number-column">
            {mobileView ? "QTY" : "QUANTITY"}
          </th>

        </tr>
      </thead>
      <tbody>
        {filteredJobInventory.sort((a, b) => a.LineNumber - b.LineNumber).map((item, index) => {
          return <tr key={index}>
            <td className="body-item-code">
              {item.ProductID ? item.ProductNumber : item.InventoryCode}
            </td>
            <td className="body-item-desc">
              {item.InventoryDescription}
            </td>

            <td className="body-item-qty number-column" >
              {item.QuantityRequested}
            </td>

          </tr>
        })}
      </tbody>
    </table>

    <style jsx>{`

            .item-heading {
                margin: 1.5rem 0 0.5rem 0;
                padding: 0;
                font-size: 1.1rem;
            }

            table.table {
                width: 100%;
                margin: 0.5rem 0;
                border-collapse: collapse;
            }

            .table thead tr {
                background-color: ${colors.backgroundGrey};
                height: 2rem;
                border-radius: ${layout.cardRadius};
                width: 100%;
              }
              .table th {
                color: ${colors.black};
                font-size: 0.75rem;
                font-weight: normal;
                padding: 4px 1rem 4px 0.5rem; 
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
                height: 2rem;
                // cursor: pointer;
              }
              .table td {
                font-size: 12px;
                padding-right: 0.5rem;
                padding-left: 0.5rem;
              }
              .table td.number-column {
                padding-right: 0.5rem;
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
                padding-left: 0.5rem;
                text-align: left;
              }
              .table td:first-child :global(div){
                margin-left: 0;
              }
          
              .header-item-code {
                max-width: 50px;
              }
              .header-item-serial {
                width: 10%;
                min-width: 200px;
              }

              .header-item-type {
                min-width: 80px;
              }
              .header-item-qty {
                max-width: 50px;
              }
              .header-item-delete {
                width: 5%;
                min-width: 30px;
              }

              .body-item-qty {
                text-align: right;
                max-width: 50px;
              }

        `}</style>

  </>);
};