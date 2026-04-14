import { useRef } from "react";
import useRefState from "./useRefState";

export default function useDebounce() {

    const [debounceBlocked, setDebounceBlocked, getDebounceBlockedValue] = useRefState(false);

    const debounceTimeoutRef = useRef<any>();

    function canProceed(debounceTimeout: number = 250): boolean {

        if (getDebounceBlockedValue()) {
            return false;
        }

        setDebounceBlocked(true);

        setTimeout(() => {
            setDebounceBlocked(false);
        }, debounceTimeout);

        return true;
    }

    function deferProceed(debounceTimeout: number = 250, callback: Function): void {
        clearTimeout(debounceTimeoutRef.current);

        debounceTimeoutRef.current = setTimeout(() => {
            callback && callback();
        }, debounceTimeout);
    }

    return {
        canProceed,
        deferProceed
    };
}