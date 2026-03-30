import Storage from "../../../utils/storage";
import * as Enums from '../../../utils/enums';
import { colors, shadows } from "../../../theme";
import PageContext from "../../../utils/page-context";
import { useContext, useState, useEffect } from "react";
import NoSSR from "../../../utils/no-ssr";
import {Burger, Flex} from "@mantine/core";

export default function SCMobileHeader({ customerZone }) {

    const pageContext = useContext(PageContext);
    const [tenantName, setTenantName] = useState(customerZone ? pageContext.tenantName : Storage.getCookie(Enums.Cookie.servCompanyName));

    useEffect(() => {
        setTenantName(customerZone ? pageContext.tenantName : Storage.getCookie(Enums.Cookie.servCompanyName));
    }, [pageContext.tenantName]);

    const [xpanded, setXpanded] = useState(pageContext.mobileSidebarExpanded)

    useEffect(() => {
        setXpanded(pageContext.mobileSidebarExpanded)
    }, [pageContext.mobileSidebarExpanded]);

    return (<NoSSR>
        <div className="header">
            {
                /*
            <div className="hamburger">
                <img src="/icons/hamburger-black.svg" height="36" onClick={openSidebar} />
            </div>
            */
            }
            <Flex
                align={'center'}
                gap={'lg'}
            >
                <Burger
                    ml={'sm'}
                    onClick={() => {
                        setXpanded(p => {
                            pageContext.setMobileSidebarExpanded(!p);
                            return !p
                        });
                    }}
                    opened={xpanded}
                    size={20}
                />
                <div className="tenant-name-container">
                    <h2 className="tenant-name">
                        {tenantName}
                    </h2>
                </div>
            </Flex>
        </div>

        <style jsx>{`

            .header {
                overflow: hidden;
                overflow-wrap: break-word;
                background: ${colors.white};
                padding: 0;
                display: flex;
                box-shadow: ${shadows.cardSmall};
                z-index: 1;
                position: relative;
            }

            .hamburger {
                margin-left: 0.5rem;
                margin-top: 0.5rem;
            }

            .tenant-name-container {
                //display: inline-block;
            }

            h2.tenant-name {
                //display: inline-block;
                //margin: 1rem 0 0 0.5rem;
                font-size: 1.1rem;
                //vertical-align: top;
            }

        `}</style>
    </NoSSR>);
};
