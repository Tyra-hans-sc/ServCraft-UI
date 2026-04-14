import config from './config';
import * as Enums from '../utils/enums';
import Storage from '../utils/storage';
import { getApiHost } from '../utils/auth';
import Helper from '../utils/helper';

function downloadDataUrl(filename, dataUrl, viewFile, printFile) {
    if (viewFile === undefined || viewFile === null) {
        viewFile = false;
    }
    if (printFile === undefined || printFile === null) {
        printFile = false;
    }

    let a = document.createElement("a");
    a.href = URL.createObjectURL(dataUrl);

    filename = filename.replace(/"/g, '');

    if (viewFile) {
        let win = window.open("", "_blank");
        win.document.body.appendChild(a);
        a.click();
        win.document.body.removeChild(a);
        if (printFile) {
            setTimeout(function () {
                win.print();
            }, 500);
        }
    } else {
        a.setAttribute("download", filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

async function downloadFile(method, url, params, viewFile, printFile, tenantID = "", customerID = "", apiUrlOverride = null, mobileView = false, complete = null) {

    if (mobileView) viewFile = false;

    // const hasAdBlock = await Helper.hasAdblock();
    // if (hasAdBlock) {
    //     alert("Ad blockers can interfere with some of ServCraft's functionality. Please disable your ad blocker and restart your browser.");
    // }

    const https = require("https");
  
    const agentDebugging = new https.Agent({
      rejectUnauthorized: false
    });
  
    const agentLive = new https.Agent({
      rejectUnauthorized: true
    });
  
    const getAgent = () => {
      if (config.isDebugging()) {
        return agentDebugging;
      } else {
        return agentLive;
      }
    };

    const token = Storage.getCookie(Enums.Cookie.token);
    const deviceid = Storage.getCookie(Enums.Cookie.fingerPrint);
    tenantID = tenantID ? tenantID : Storage.getCookie(Enums.Cookie.tenantID);
    customerID = customerID ? customerID : "";

    const apiHost = getApiHost(null, apiUrlOverride);

    if (method === 'GET') {
        fetch(`${apiHost}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'tenantid': tenantID,
                'customerid': customerID,
                'deviceid': deviceid
            },
            agent: getAgent()
        }).then(async response => {

            if (response.status === 200) {
                let filename = response.headers.get(`content-disposition`);
                filename = filename.substring(filename.indexOf('filename=') + 9, filename.length);

                const blob = await response.blob();
                downloadDataUrl(filename, blob, viewFile, printFile);
            }
        }, error => {
            console.log(error);
            alert("There was an issue downloading the document. Please make sure that ad blockers are disabled and the browser allows for popups.");
        }).catch(error => {
            console.log(error);
            alert("There was an issue downloading the document. Please make sure that ad blockers are disabled and the browser allows for popups.");
        }).finally(() => {
            complete && complete();
        });
    }
    else if (method === 'POST') {
        fetch(`${apiHost}${url}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'tenantid': tenantID,
                'customerid': customerID,
                'deviceid': deviceid
            },
            body: JSON.stringify(params),
            agent: getAgent()
        }).then(async response => {
            if (response.status === 200) {
                let filename = response.headers.get(`content-disposition`);
                filename = filename.substring(filename.indexOf('filename=') + 9, filename.length);

                const blob = await response.blob();
                downloadDataUrl(filename, blob, viewFile, printFile);
            }
        }, error => {
            console.log(error);
            alert("There was an issue downloading the document. Please make sure that ad blockers are disabled and the browser allows for popups.");
        }).catch(error => {
            console.log(error);
            alert("There was an issue downloading the document. Please make sure that ad blockers are disabled and the browser allows for popups.");
        }).finally(() => {
            complete && complete();
        });
    }
}

function downloadURI(uri, name) {

    let a = document.createElement('a');
    a.setAttribute('download', name);
    a.href = uri;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
/**
 * Fetches a file and returns a Blob object URL and filename without triggering a download or opening a new tab.
 * Caller is responsible for URL.revokeObjectURL on the returned url when no longer needed.
 *
 * @param {'GET'|'POST'} method
 * @param {string} url relative api path (e.g., '/Job/GetJobDocument?...')
 * @param {any} params body for POST requests
 * @param {string} tenantID optional override
 * @param {string} customerID optional override
 * @param {string|null} apiUrlOverride optional api root override
 * @returns {Promise<{ url: string, filename: string | null }>}
 */
  async function fetchFileObjectUrl(method, url, params = {}, tenantID = "", customerID = "", apiUrlOverride = null) {

    const https = require("https");

    const agentDebugging = new https.Agent({
        rejectUnauthorized: false
    });

    const agentLive = new https.Agent({
        rejectUnauthorized: true
    });

    const getAgent = () => {
        if (config.isDebugging()) {
            return agentDebugging;
        } else {
            return agentLive;
        }
    };

    const token = Storage.getCookie(Enums.Cookie.token);
    const deviceid = Storage.getCookie(Enums.Cookie.fingerPrint);
    tenantID = tenantID ? tenantID : Storage.getCookie(Enums.Cookie.tenantID);
    customerID = customerID ? customerID : "";

    const apiHost = getApiHost(null, apiUrlOverride);

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'tenantid': tenantID,
        'customerid': customerID,
        'deviceid': deviceid
    };

    const fetchInit = {
        method,
        headers,
        agent: getAgent()
    };

    if (method === 'POST') {
        fetchInit.body = JSON.stringify(params || {});
    }

    const response = await fetch(`${apiHost}${url}`, fetchInit);
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Failed to fetch file (${response.status})`);
    }

    let filename = null;
    try {
        filename = response.headers.get('content-disposition');
        if (filename) {
            filename = filename.substring(filename.indexOf('filename=') + 9, filename.length);
            filename = filename.replace(/"/g, '');
        }
    } catch { /* ignore */ }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return { url: objectUrl, filename };
}

export default {
    downloadFile,
    downloadURI,
    fetchFileObjectUrl
};
