// import { useState, useRef } from 'react';
// /**
//  * The purpose of this hook is to provide a tightly bound, instantly accessible value assigned to the state through the MutableRefObject.
//  * 
//  * The MutableRefObject can be used to update the state in cases where timeouts and other initialisation quirks make state assume pre-existing values.
//  * 
//  * suppressSetStateIfUnchanged avoids setting the state if the update does not affect the expected value, reducing the cost of rerendering.
//  * 
//  * returns [state, setState, getStateValue]
//  */
// function useRefState(initialValue) {

//     const [hookState, setHookState] = useState(initialValue);
//     const hookRef = useRef(initialValue);

//     const executeNewVal = (func) => {
//         return func(hookRef.current);
//     };

//     const setState = (newVal, suppressSetStateIfUnchanged = true) => {
//         if (typeof newVal === "function") {
//             hookRef.current = executeNewVal(newVal);
//         }
//         else {
//             hookRef.current = newVal;
//         }

//         if (hookRef.current !== hookState || !suppressSetStateIfUnchanged) {
//             setHookState(hookRef.current);
//         }
//     };

//     const getStateValue = () => {
//         return hookRef.current;
//     };

//     return [
//         hookState,
//         setState,
//         getStateValue
//     ];
// };

// export default useRefState;

import { useState, useRef } from 'react';
/**
 * The purpose of this hook is to provide a tightly bound, instantly accessible value assigned to the state through the MutableRefObject.
 * 
 * The MutableRefObject can be used to update the state in cases where timeouts and other initialisation quirks make state assume pre-existing values.
 * 
 * suppressSetStateIfUnchanged avoids setting the state if the update does not affect the expected value, reducing the cost of rerendering.
 * 
 * returns [state, setState, getStateValue]
 */
function useRefState<T>(initialValue: T): [T, (newVal: T | ((newValInner: T) => T), suppressSetStateIfUnchanged?: boolean | undefined) => void, () => T] {

    const [hookState, setHookState] = useState<T>(initialValue);
    const hookRef = useRef<T>(initialValue);

    const executeNewVal = (func: (_: T) => T): T => {
        return func(hookRef.current);
    };

    const setState = (newVal: T | ((_: T) => T), suppressSetStateIfUnchanged: boolean = true): void => {
        if (typeof newVal === "function") {
            hookRef.current = executeNewVal(<(_: T) => T>newVal);
        }
        else {
            hookRef.current = newVal;
        }

        if (hookRef.current !== hookState || !suppressSetStateIfUnchanged) {
            setHookState(hookRef.current);
        }
    };

    const getStateValue = (): T => {
        return hookRef.current;
    };

    return [
        hookState,
        setState,
        getStateValue
    ];
};

export default useRefState;