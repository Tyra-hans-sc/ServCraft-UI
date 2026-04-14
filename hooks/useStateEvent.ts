import { useEffect, useRef, useState } from "react";

export default function useStateEvent() {

    const [debounce, setDebounce] = useState<boolean>(false);
    const isDebouncing = useRef(false);
    const callbackRef = useRef<(() => void) | undefined>(undefined);

    const onDebounce = (func: () => void, delay: number = 50) => {

        if (isDebouncing.current) {
            console.warn("Debounce still in effect, ignoring event");
            return;
        }
        isDebouncing.current = true;

        callbackRef.current = func;

        setTimeout(() => {
            setDebounce(_ => true);
        }, delay);
    }

    useEffect(() => {
        if (!!callbackRef.current && isDebouncing.current) {
            callbackRef.current();
            setDebounce(_ => false);
            isDebouncing.current = false;
        }
    }, [debounce]);

    return onDebounce;
};