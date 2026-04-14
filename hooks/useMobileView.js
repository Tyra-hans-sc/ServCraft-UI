import { useContext, useEffect, useState } from "react";
import PageContext from "../utils/page-context";

export default function useMobileView() {

    const pageContext = useContext(PageContext);
    const [mobileView, setMobileView] = useState(pageContext.mobileView);

    useEffect(() => {
        setMobileView(pageContext.mobileView);
    }, [pageContext.mobileView]);

    return [mobileView];
};