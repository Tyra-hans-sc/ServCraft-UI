import { colors, layout, tickSvg } from '../../../theme';
import Helper from '../../../utils/helper';

export default function KendoCellCurrency(props) {

    const currencySymbol = props.currencySymbol ? props.currencySymbol : 'R';

    const field = props.field || "";
    const value = props.dataItem[field];

    let currValue = value !== undefined && value !== null ? Helper.roundToTwo(value).toFixed(2) : "0.00";
    let spacePos = currValue.indexOf('.');
    while (spacePos > 3) {
        spacePos = spacePos - 3;
        currValue = [currValue.slice(0, spacePos), ' ', currValue.slice(spacePos)].join('');
    }
    currValue = `${currencySymbol} ` + currValue;
    return (
        <td>
            <div className="currency">
                {currValue}
                <style jsx>{`
        .currency {
          text-align: right;
          display: contents;
        }
      `}</style>
            </div>
        </td>
    )
}