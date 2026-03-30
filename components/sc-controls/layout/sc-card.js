import {useState} from "react";
import NoSSR from '../../../utils/no-ssr';
import { Card, CardBody } from "@progress/kendo-react-layout";

function SCCard({body}) {

    return (
        <NoSSR>
            <Card 
                orientation={"horizontal"}
            >
                <CardBody>
                    {body}
                </CardBody>
            </Card>
        </NoSSR>
    )
}

export default SCCard;
