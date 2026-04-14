import { useEffect, useRef, useState } from "react";

function useAsyncState<T>(initialValue: T): [T, (newVal: T | ((newValInner: T) => T)) => void] {

    const [hookState, setHookState] = useState<T>(initialValue);
    const hookRef = useRef<T>(initialValue);
    const stateHasChangedRef = useRef(true);

    const executeNewVal = (func: (_: T) => T): T => {
        return func(hookRef.current);
    };

    const setState = async (newVal: T | ((_: T) => T)): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            if (typeof newVal === "function") {
                hookRef.current = executeNewVal(<(_: T) => T>newVal);
            }
            else {
                hookRef.current = newVal;
            }

            if (hookRef.current !== hookState) {
                setHookState(hookRef.current);
                stateHasChangedRef.current = false;
                let watchDog = 0;
                let interval = setInterval(() => {
                    if (stateHasChangedRef.current || watchDog > 1000) {
                        console.log("change received", watchDog);
                        clearInterval(interval);
                        resolve();
                    }
                    console.log("awaiting change");
                    watchDog++;
                }, 1);
            }
            else {
                resolve();
            }
        })
    };

    useEffect(() => {
        console.log("change noticed");
        stateHasChangedRef.current = true;
    }, [hookState]);

    return [
        hookState,
        setState
    ];
};

export default useAsyncState;