import { colors } from '../../../theme';
import AS from '../../../services/asset/asset-service';
import Time from '../../../utils/time';


export default function KendoCellWarrantyIndicator(props) {

  const purchaseDate = props.dataItem.PurchaseDate;
  const warrantyPeriod = props.dataItem.WarrantyPeriod;
  const refDate = props.refDate || Time.now();


  return (<td>

    {AS.inWarranty(purchaseDate, warrantyPeriod, refDate) ? <div className="in-warranty" title={`Asset is in warranty until ${Time.toISOString(AS.expiryDate(purchaseDate, warrantyPeriod), false, false)}`}>
      IW
    </div> : ""}

    {AS.outOfWarranty(purchaseDate, warrantyPeriod, refDate) ? <div className="out-warranty" title={`Asset is out of warranty since ${Time.toISOString(AS.expiryDate(purchaseDate, warrantyPeriod), false, false)}`}>
      OW
    </div> : ""}

    <style jsx>{`
    .in-warranty {
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${colors.green};
        width: 22px;
        height: 22px;
        border: 1px solid ${colors.green};
        font-size: 0.7rem;
      }

      .out-warranty {
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${colors.warningRed};
        width: 22px;
        height: 22px;
        border: 1px solid ${colors.warningRed};
        font-size: 0.7rem;
      }
    `}</style>
  </td>);
};
