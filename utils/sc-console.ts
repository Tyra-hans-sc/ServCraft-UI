function checkForSuppress(): boolean {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV !== "development") {
        true;
    }
    return false;
}

let logTest: {
    (...data: any[]): void; (message?: any, ...optionalParams: any[]): void;
} = (logDetail: any) => {
    if (checkForSuppress()) return;
    logTestUnsafe(logDetail);
};

let logTestUnsafe: {
    (...data: any[]): void; (message?: any, ...optionalParams: any[]): void;
} = (logDetail: any) => {
    console.log(logDetail);
};


function doNothing(): (...data: any[]) => void {
    return (_) => { };
}

function log(): (...data: any[]) => void {
    if (checkForSuppress()) return doNothing;
    return logUnsafe();
}

function error(...data: any[]): void {
    if (checkForSuppress()) return;
    errorUnsafe(data);
}

function debug(...data: any[]): void {
    if (checkForSuppress()) return;
    debugUnsafe(data);
}

function clear(): void {
    if (checkForSuppress()) return;
    clearUnsafe();
}

function logUnsafe(): (...data: any[]) => void {
    return console.log;
}

function errorUnsafe(...data: any[]): void {
    console.error(...data);
}

function debugUnsafe(...data: any[]): void {
    console.debug(...data);
}

function clearUnsafe(): void {
    console.clear();
}

export default {
    log,
    error,
    debug,
    clear,
    logUnsafe,
    errorUnsafe,
    debugUnsafe,
    clearUnsafe,
    logTest,
    logTestUnsafe
};