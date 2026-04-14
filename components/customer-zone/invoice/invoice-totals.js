import React, { useState, useEffect } from 'react';
import Helper from '../../../utils/helper';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';


function InvoiceTotals(props) {

  const [invoice, setInvoice] = useState(props.invoice);

  const [lessPayments, setLessPayments] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  useEffect(() => {
        if (!!props.paymentList) {
          let total = 0;
          let amountDue = +invoice.TotalInclusive;
          props.paymentList.forEach((x) => {
            total = total + +x.Amount;
            amountDue = amountDue - +x.Amount;
          })
          setLessPayments(total);
          setAmountDue(amountDue);
        }
      }, [props.paymentList]
  );

    return (<>
    <div className="row">
        <div className="column-fixed card">
          {invoice.DiscountPercentage > 0 ? 
            <div className="row total-row">
              <div className="column">
                Total Discount %
              </div>
              <div className="column end">
                {invoice.DiscountPercentage}
              </div>
            </div> : ''
          }
          <div className="row total-row">
            <div className="column">
              Subtotal Excl VAT
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(invoice.SubTotalExclusive, props.currencySymbol)}
            </div>
          </div>
          {invoice.DiscountPercentage > 0 ? 
            <div className="row total-row">
              <div className="column">
                Discount
              </div>
              <div className="column end">
                {Helper.getCurrencyValue(-(invoice.SubTotalExclusive - invoice.TotalExclusive), props.currencySymbol)}
              </div>
            </div>
            : '' 
          }
          <div className="row total-row">
            <div className="column">
              Total Excl Vat
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(invoice.TotalExclusive, props.currencySymbol)}
            </div>
          </div>
          <div className="row total-row">
            <div className="column">
              VAT ({props.taxPercentage}%)
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(invoice.TotalTax, props.currencySymbol)}
            </div>
          </div>
          <div className="row total-row grand-total">
            <div className="column">
              Total Incl VAT
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(invoice.TotalInclusive, props.currencySymbol)}
            </div>
          </div>

          {
            !!props.paymentList && props.paymentList.length > 0 && <>
                <div className="row total-row">
                  <div>
                    Payments Received
                  </div>
                  <div className="column end">
                    {Helper.getCurrencyValue(lessPayments, props.currencySymbol)}
                  </div>
                </div>

                <div className="row total-row">
                  <div className="column">
                    Amount Due
                  </div>
                  <div className="column end">
                    {Helper.getCurrencyValue(amountDue, props.currencySymbol)}
                  </div>
                </div>
              </>
          }

        </div>
      </div>


      <style jsx>{`

        .card {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            box-shadow: ${shadows.card};
            box-sizing: border-box;
            padding: 0.5rem;
            position: relative;
            width: 100%;
            font-size: 0.75rem;
        }

        .card h3 {
            margin-top: 0;
        }

        .end {
          text-align: right;
          padding-right: 1em;
        }

        .container {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
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

        .column-fixed {
            display: flex;
            flex-direction: column;
            ${props.mobileView ? "width: 100%;" : "width: 300px;"}
            
        }
        .total-row {
            line-height: 24px;
        }
        .grand-total {
            margin-top: 8px;
            margin-bottom: 8px;
            font-weight: bold;
        }

      `}</style>
      
    </>);
}

export default InvoiceTotals;
