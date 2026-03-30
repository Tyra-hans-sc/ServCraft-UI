import { WidgetConfig } from "@/PageComponents/Dashboard/DashboardModels";
import { FC, useEffect, useState } from "react";
import * as Enums from "@/utils/enums";
import SCWidgetCard from "./sc-widget-card";
import { Button, Center, Title } from "@mantine/core";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import helper from "@/utils/helper";
import SCIcon from "../../misc/sc-icon";
import SCWidgetTitle from "./sc-widget-title";

const SCWidgetQuickActions: FC<{
    widget: WidgetConfig
    onDismiss: (() => void) | undefined
    key: any
}> = ({ widget, onDismiss, key }) => {



    return (<>
        <SCWidgetCard height={widget.heightPX as any}>
            <SCWidgetTitle title="Quick Actions" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                    <div style={{ marginBottom: "1rem" }}>
                        <Link href={'/job/create'} onClick={() => helper.nextLinkClicked('/job/create')}>
                            <Button color={'scBlue'} w={150} rightSection={<IconPlus size={14} />}>
                                Add Job
                            </Button>
                        </Link>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <Link href={'/quote/create'} onClick={() => helper.nextLinkClicked('/quote/create')}>
                            <Button color={'scBlue'} w={150} rightSection={<IconPlus size={14} />}>
                                Add Quote
                            </Button>
                        </Link>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <Link href={'/invoice/create'} onClick={() => helper.nextLinkClicked('/invoice/create')}>
                            <Button color={'scBlue'} w={150} rightSection={<IconPlus size={14} />}>
                                Add Invoice
                            </Button>
                        </Link>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <Link href={'/customer/create'} onClick={() => helper.nextLinkClicked('/customer/create')}>
                            <Button color={'scBlue'} w={150} rightSection={<IconPlus size={14} />}>
                                Add Customer
                            </Button>
                        </Link>
                    </div>
                </div>
                <Center>
                    <div style={{ background: "#e7f5ff", padding: 16, borderRadius: 200 }}>
                        <img src={"/specno-icons/fast_forward_white.svg"} style={{ height: 100 }} />
                    </div>
                </Center>
                <div></div>
            </div>
        </SCWidgetCard>
    </>);
};

export default SCWidgetQuickActions;