import { colors, layout, tickSvg} from '../../theme'
import Helper from '../../utils/helper';

function CellCurrency({value, currencySymbol}) {

  if (!currencySymbol) currencySymbol = 'R';

  let currValue = value !== undefined && value !== null ? Helper.roundToTwo(value).toFixed(2).toString() : "0.00";
  let spacePos = currValue.indexOf('.');
  while (spacePos > 3) {
    spacePos = spacePos - 3;
    currValue = [currValue.slice(0, spacePos), ' ', currValue.slice(spacePos)].join('');
  }
  currValue = `${currencySymbol} ` + currValue;
  return (
    <div className="currency">
      {currValue}
      <style jsx>{`
        .currency {
          text-align: right;
          display: contents;
        }
      `}</style>
    </div>
  )
}

export default CellCurrency
