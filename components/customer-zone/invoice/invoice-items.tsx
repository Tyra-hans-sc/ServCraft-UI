import React, { useState } from 'react';
import { colors, layout, shadows } from '../../../theme';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import {getGroupedItems} from "@/PageComponents/SectionTable/SectionTable";
import tableStyles from "@/PageComponents/CustomerZone/TableStyles.module.css";

const sectionIdKey = 'InventorySectionID'
const sectionNameKey = 'InventorySectionName'

function InvoiceItems(props: {invoiceItems: any[]; mobileView: boolean}) {
  const [orderedData, setOrderedData] = useState(
      props.invoiceItems.map((x, i) => (
          // !x.SectionID ? {...x, groupId: crypto?.randomUUID() || 'sectionForItem' + i + x.ID} : {...x}
          { ...x, groupId: x[sectionIdKey] || crypto?.randomUUID() || 'sectionForItem' + i + x.ID }
      )).sort((a: any, b: any) => (a.LineNumber > b.LineNumber ? 1 : a.LineNumber === b.LineNumber ? 0 : -1))
  )
  const [groupedData, setGroupedData] = useState(getGroupedItems(orderedData, sectionNameKey, sectionIdKey))


  return (<>

    <div className="card">
      <h2 className="item-heading">Invoice Items</h2>
      <table className="table">
        <thead className={tableStyles.tableHead}>
        <tr>
          {
              !props.mobileView &&
              <th className="header-item-code">
                CODE
              </th>
          }
          <th className="header-item-desc">
            {
              props.mobileView ? 'ITEM' : 'DESCRIPTION'
            }
          </th>
          <th className="header-item-qty number-column">
            {
              props.mobileView ? 'QTY' : 'QUANTITY'
            }
          </th>

          {
              !props.mobileView &&
              <th className="header-item-price number-column">
                PRICE
              </th>
          }

          {
              !props.mobileView &&
              <th className="header-item-discount number-column">
                DISCOUNT %
              </th>
          }
          <th className="header-item-amt number-column">
            {
              props.mobileView ? 'AMNT' : 'AMOUNT'
            }
          </th>
        </tr>
        </thead>
        <tbody>
        {
          groupedData.map(x => (
              [
                x.isSection && <tr
                    key={x.id}
                    style={{
                      fontWeight: 'bolder',
                      borderTop: x.hideLineItems ? 0 : '1px solid var(--mantine-color-gray-3)',
                      // borderBottom: x.hideLineItems ? '1px solid var(--mantine-color-gray-3)' : 0,
                      backgroundColor: x.hideLineItems ? 'transparent' : 'var(--mantine-color-gray-0)'
                    }}
                >
                  {!props.mobileView && <td/>}
                  <td
                      style={x.hideLineItems ? {fontWeight: 'normal'} : {}}
                      colSpan={props.mobileView ? 2 : 4}
                  >
                    {x.name}
                  </td>
                  <td className="number-column" style={{fontWeight: 'normal'}}>
                    {
                        (x.hideLineItems) &&
                        Helper.getCurrencyValue(x.subTotal)
                    }
                  </td>
                </tr>,
                (!x.isSection || !x.hideLineItems) && x.items.map((y, j) => (
                    <tr key={y.ID}
                        style={{
                          fontWeight: 'bolder',
                          borderBottom: x.isSection && !x.displaySubtotal && (j === x.items.length - 1) ? '1px solid var(--mantine-color-gray-3)' : 0,
                          backgroundColor: x.isSection ? 'var(--mantine-color-gray-0)' : ''
                        }}
                    >
                      {
                          !props.mobileView &&
                          <td className="body-item-code" style={{fontWeight: 'normal'}}>
                            {y.InventoryCode}
                          </td>
                      }
                      <td className="body-item-desc" style={{fontWeight: 'normal'}}>
                        {y.Description}
                      </td>

                      <td className="body-item-qty number-column" style={{fontWeight: 'normal'}}>
                        {y.InvoiceItemType === Enums.InvoiceItemType.Inventory ?
                            <>{y.Quantity}</>
                            :
                            ''
                        }
                      </td>
                      {
                          !props.mobileView &&
                          <td className="body-item-price number-column" style={{fontWeight: 'normal'}}>
                            {y.InvoiceItemType == Enums.InvoiceItemType.Inventory ?
                                <>{Helper.getCurrencyValue(y.UnitPriceExclusive)}</>
                                :
                                ''
                            }
                          </td>
                      }


                      {
                          !props.mobileView &&
                          <td className="body-item-discount number-column" style={{fontWeight: 'normal'}}>
                            {y.InvoiceItemType == Enums.InvoiceItemType.Inventory ?
                                <>{y.LineDiscountPercentage}</>
                                : ''
                            }
                          </td>
                      }

                      <td className="body-item-amt number-column" style={{fontWeight: 'normal'}}>
                        {y.InvoiceItemType == Enums.InvoiceItemType.Description ? y.LineTotalExclusive : Helper.getCurrencyValue(y.LineTotalExclusive)}
                      </td>
                    </tr>
                )),
                x.isSection && !x.hideLineItems && x.displaySubtotal &&
                <tr
                    key={x.id + 'subtotal'}
                    style={{
                      fontWeight: 'bolder',
                      borderBottom: '1px solid var(--mantine-color-gray-3)',
                      backgroundColor: x.isSection ? 'var(--mantine-color-gray-0)' : ''
                    }}
                    className={tableStyles.tableRow}
                >
                  {!props.mobileView && <td></td>}
                  <td className="number-column" colSpan={props.mobileView ? 3 : 5} style={{textAlign: 'right'}}>
                      <span style={{marginLeft: 'auto'}}>
                          Subtotal: &nbsp;&nbsp;&nbsp;
                      </span>
                    <span
                        style={{textDecoration: 'underline'}}
                    >
                      {
                        Helper.getCurrencyValue(x.subTotal)
                      }
                    </span>
                  </td>
                </tr>
              ]
          ))
        }
        </tbody>
      </table>
    </div>

    <style jsx>{`

      .item-heading {
        margin: 0 0 1rem 0;
        padding: 0;
        font-size: 1.1rem;
        width: 110px;
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

      .new-comment :global(.textarea-container) {
        height: 5rem;
      }

      .new-comment img {
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

      .status :global(.input-container) {
        background-color: ${colors.bluePrimary};
      }

      .status :global(input) {
        color: ${colors.white};
      }

      .status :global(label) {
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
        margin-top: 0.5rem;
        width: 100%;
      }

      .table thead tr {
        background-color: ${colors.backgroundGrey};
        height: 2rem;
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
        height: 2rem;
      }

      .table td {
        font-size: 12px;
        padding-right: 1rem;
      }

      .table td.number-column {
        padding-right: 0;
        text-align: right;
        white-space: nowrap;
        padding-left: 0.5rem;
      }

      .table tr:nth-child(even) td {
          //background-color: ${colors.white};
      }

      .table td:last-child {
        padding-right: 1rem;
        border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
        text-align: right;
      }

      .table td:last-child :global(div) {
        margin-left: auto;
      }

      .table td:first-child {
        border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
        padding-left: 0.5rem;
        text-align: left;
      }

      .table td:first-child :global(div) {
        margin-left: 0;
      }

    `}</style>
  </>);
}
export default InvoiceItems;
