import {useState} from "react";
import NoSSR from '../../../utils/no-ssr';
import { Avatar } from "@progress/kendo-react-layout";

function SCAvatar({content, size}) {

    return (
        <NoSSR>
            <Avatar type="text" size={"small"} shape={"circle"} themeColor="red">
                <span>{content}</span>
            </Avatar>
        </NoSSR>
    )
}

export default SCAvatar;
