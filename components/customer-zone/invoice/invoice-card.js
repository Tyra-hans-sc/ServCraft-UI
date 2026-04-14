import SCListCard from "../../sc-controls/layout/sc-list-card";
import { colors } from "../../../theme";
import Time from "../../../utils/time";
import * as Enums from '../../../utils/enums';
import Helper from "../../../utils/helper";

export default function InvoiceCard({ invoice, onClick, currencySymbol }) {

    const cardClick = () => {
        onClick && onClick(invoice);
    };

    return (<>
        <SCListCard onClick={cardClick}>

        <h4 className="list-card-heading">
                {invoice.InvoiceNumber}
            </h4>

            <table className="list-card-table">
                <tbody>
                    {invoice.ItemReference ? <tr>
                        <td className="list-card-icon-column">
                            <img src="/icons/quotes-black.svg" height="16" />
                        </td>
                        <td className="list-card-content-column">
                            {invoice.ItemReference}
                        </td>
                    </tr> : ""}
                    

                    <tr>
                        <td className="list-card-icon-column">
                            <img src="/icons/clock-black.svg" height="16" />
                        </td>
                        <td className="list-card-content-column">{Time.toISOString(Time.parseDate(invoice.DueDate), false, false)}</td>
                    </tr>


                    <tr>
                        <td className="list-card-icon-column">
                            <img src="/icons/excel-black.svg" height="16" />
                        </td>
                        <td className="list-card-content-column">{Helper.getCurrencyValue(invoice.TotalInclusive, currencySymbol)}</td>
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