import { useEffect, useState } from "react";

export default function useInitialTimeout(intervalMS: number | undefined, eventCallback: (() => void) | undefined = undefined) {

    if (!intervalMS) {
        intervalMS = 100;
    }

    var [stateOn, setStateOn] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => {
            setStateOn(true);
        }, intervalMS);
    }, []);

    useEffect(() => {
        stateOn && eventCallback && eventCallback();
    }, [stateOn]);

    return stateOn;
}