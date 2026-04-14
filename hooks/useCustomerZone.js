import { useContext, useEffect, useState } from "react";
import PageContext from "../utils/page-context";

export default function useCustomerZone() {

    const pageContext = useContext(PageContext);
    const [customerZone, setCustomerZone] = useState(pageContext.customerZone);
    const [tenantZone, setTenantZone] = useState(pageContext.tenantZone);

    useEffect(() => {
        setCustomerZone(pageContext.customerZone);
        setTenantZone(pageContext.tenantZone);
    }, [pageContext.customerZone, pageContext.tenantZone]);

    return [customerZone, tenantZone];
};