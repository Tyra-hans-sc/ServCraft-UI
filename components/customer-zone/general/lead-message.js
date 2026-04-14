import { useState } from "react";
import { colors, layout, shadows } from "../../../theme";

export default function LeadMessage({ tenantID, customerID, itemID = '', page }) {

    const options = [
        "Click here to win more business with ServCraft",
        "Click here to get paid faster with ServCraft",
        "Click here to take control with ServCraft",
        "Click here to free up time with ServCraft",
        "Click here to save 50% time on admin with ServCraft",
        // "ServCraft - SA's #1 Job Management System"
    ];

    const rand = Math.random() * options.length;

    const [idx, setIdx] = useState(Math.floor(rand));

    const navigateToServcraft = () => {
        window.open(`https://www.servcraft.co.za?utm_source=customer_zone&utm_medium=button&utm_campaign=customer_zone_referral&utm_tenant=${tenantID}&utm_customer=${customerID}&utm_item=${itemID}&utm_page=${encodeURIComponent(page)}&utm_ctatext=${encodeURIComponent(options[idx])}`, "_blank");
        //window.open(`https://www.servcraft.co.za/securitycustomerzone?utm_source=customer_zone&utm_medium=button&utm_campaign=customer_zone_referral&utm_tenant=${tenantID}&utm_customer=${customerID}&utm_item=${itemID}&utm_page=${encodeURIComponent(page)}&utm_ctatext=${encodeURIComponent(options[idx])}`, "_blank");
    };

    const disabled = false;
    const allowedTenantIDs = ["42d24109-8f35-4360-adac-58f28d06e8f1", "2dce8a8c-59d0-46b9-9132-30baad32a6f3", "1e7ef40b-a9f3-4c6d-a322-cbcc599a7080"]; // "Regal", "PhilCo", "Security Stars"
    if (disabled || (!allowedTenantIDs.includes(tenantID.toLowerCase()))) {
        return (<></>);
    }

    return (<>
        <div className="message-box" onClick={navigateToServcraft}>
            {options[idx]}
        </div>
        <style jsx>{`
        
        .message-box {
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            background: ${colors.yellowStatus};
            border-radius: ${layout.buttonRadius};
            box-shadow: ${shadows.cardSmall};
            cursor: pointer;
            color: ${colors.bluePrimary};
            font-weight: bold;
            // text-shadow: 1px 1px white;
            text-align: center;
        }

        `}</style>
    </>);
}