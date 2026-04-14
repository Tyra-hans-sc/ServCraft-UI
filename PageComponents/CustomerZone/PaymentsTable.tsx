import {FC} from "react";
import {Payment} from "@/PageComponents/Payments/payments";
import styles from "@/PageComponents/CustomerZone/TableStyles.module.css";
import {Table} from "@mantine/core";
import Time from "@/utils/time";
import Helper from "@/utils/helper";


const PaymentsTable: FC<{ paymentList: Payment[] }> = ({paymentList}) => {

    const rows = paymentList.length > 0 && paymentList.sort((a, b) => a.PaymentDate > b.PaymentDate ? 1 : -1).map(x => (
        <tr key={x.ID} className={styles.tableRow}>
            <td>{Time.getDate(x.PaymentDate)}</td>
            <td>{x.Reference}</td>
            <td>{x.Comment}</td>
            <td className={styles.textRight}>{Helper.getCurrencyValue(x.Amount)}</td>
        </tr>
    ))

    return <>
        <Table>
            {
                paymentList.length > 0 &&
                <thead>
                    <tr className={styles.tableHead} style={{height: 32}}>
                        <th>Payment Date</th>
                        <th>Reference</th>
                        <th>Description</th>
                        <th className={styles.textRight}>Amount</th>
                    </tr>
                </thead>
            }
            <tbody className={styles.tableBody}>{rows}</tbody>
        </Table>
    </>
}

export default PaymentsTable;
