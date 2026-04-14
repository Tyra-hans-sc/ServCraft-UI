import SCListCard from "../../sc-controls/layout/sc-list-card";
import { colors } from "../../../theme";
import Time from "../../../utils/time";
import * as Enums from '../../../utils/enums';
import Helper from "../../../utils/helper";

export default function QuoteCard({ quote, onClick, currencySymbol }) {

    const cardClick = () => {
        onClick && onClick(quote);
    };

    return (<>
        <SCListCard onClick={cardClick}>
            <h4 className="list-card-heading">
                {quote.QuoteNumber}
            </h4>

            <table className="list-card-table">
                <tbody>
                    {quote.ItemReference ? <tr>
                        <td className="list-card-icon-column">
                            <img src="/icons/quotes-black.svg" height="16" />
                        </td>
                        <td className="list-card-content-column">
                            {quote.ItemReference}
                        </td>
                    </tr> : ""}
                    

                    <tr>
                        <td className="list-card-icon-column">
                            <img src="/icons/clock-black.svg" height="16" />
                        </td>
                        <td className="list-card-content-column">{Time.toISOString(Time.parseDate(quote.ExpiryDate), false, false)}</td>
                    </tr>


                    <tr>
                        <td className="list-card-icon-column">
                            <img src="/icons/excel-black.svg" height="16" />
                        </td>
                        <td className="list-card-content-column">{Helper.getCurrencyValue(quote.TotalInclusive, currencySymbol)}</td>
                    </tr>
                </tbody>
            </table>
        </SCListCard>

        <style jsx>{`
            .list-card-heading {
                margin: 0;
            }

            table.list-card-table {
                width: 100%;
                margin-top: 0.5rem;
            }

            .list-card-icon-column {
                min-width: 2rem;
                max-width: 2rem;
                vertical-align: top;
            }

            .list-card-content-column {
                width: 100%;
                vertical-align: top;
            }

            .list-card-content-column p {
                margin: 0 0 0.5rem 0;
            }
        `}</style>
    </>);
}