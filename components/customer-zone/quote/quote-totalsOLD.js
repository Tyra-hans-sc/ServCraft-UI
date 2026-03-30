import React, { useState, useEffect } from 'react';
import Helper from '../../../utils/helper';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';


function QuoteTotals(props) {

    const [quote, setQuote] = useState(props.quote);

    return (<>
    <div className="row">
        <div className="column"></div>
        <div className="column-fixed card">
          <div className="row total-row">
            <div className="column">
              Total Discount %
            </div>
            <div className="column end">
              {quote.DiscountPercentage}
            </div>
          </div>
          <div className="row total-row">
            <div className="column">
              Subtotal Excl VAT
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(quote.SubTotalExclusive)}
            </div>
          </div>
          <div className="row total-row">
            <div className="column">
              Discount
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(-(quote.SubTotalExclusive - quote.TotalExclusive))}
            </div>
          </div>
          <div className="row total-row">
            <div className="column">
              Total Excl Vat
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(quote.TotalExclusive)}
            </div>
          </div>
          <div className="row total-row">
            <div className="column">
              VAT (15%)
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(quote.TotalTax)}
            </div>
          </div>
          <div className="row total-row grand-total">
            <div className="column">
              Total Incl VAT
            </div>
            <div className="column end">
              {Helper.getCurrencyValue(quote.TotalInclusive)}
            </div>
          </div>
        </div>
      </div>


      <style jsx>{`

        .card {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            box-shadow: ${shadows.card};
            box-sizing: border-box;
            padding: 1rem 2rem;
            position: relative;
            width: 100%;
        }

        .card h3 {
            margin-top: 0;
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
            width: 360px;
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

export default QuoteTotals;