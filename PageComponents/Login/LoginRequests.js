import config from "../../utils/config";

/**
 * Safely parses and checks manager API responses
 * @param {Response} response - Fetch response object
 * @param {string} actionPrefix - e.g. "Login failed"
 */
async function handleManagerResponse(response, actionPrefix) {
    const statusCode = response.status;
    const supportMsg = "Try again shortly or contact Support for help";
    const defaultErrorMessage = `${actionPrefix}. ${supportMsg}.`;
    let json = null;
    let text = "";

    try {
        text = await response.text();
        json = text ? JSON.parse(text) : {};
    } catch (e) {
        // Not JSON or body read failed - continue with status code only
    }

    const serverMsg = json?.Message || json?.serverMessage || json?.message;
    const httpStatusCode = typeof json?.HttpStatusCode === 'number' ? json.HttpStatusCode : undefined;

    if (response.ok) {
        if (httpStatusCode !== undefined && httpStatusCode !== 200) {
            if (serverMsg) {
                const error = new Error(serverMsg);
                error.isHandledManagerError = true;
                throw error;
            }
            const error = new Error(`${defaultErrorMessage} Code:${httpStatusCode}`);
            error.isHandledManagerError = true;
            throw error;
        }
        return json;
    } else {
        if (serverMsg) {
            const error = new Error(serverMsg);
            error.isHandledManagerError = true;
            throw error;
        }
        const error = new Error(`${defaultErrorMessage} Code:${statusCode}`);
        error.isHandledManagerError = true;
        throw error;
    }
}

/**
 * Handles network errors (Failed to fetch)
 * @param {Error} error
 * @param {string} actionPrefix
 */
function handleManagerError(error, actionPrefix) {
    // If it's already our custom error or has a Code, just re-throw it
    if (error.isHandledManagerError || (error.message && error.message.toLowerCase().includes('code:'))) {
        throw error;
    }

    console.error(`Manager API Error [${actionPrefix}]:`, error);

    const isNetworkError = error.name === 'TypeError' && 
                          (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network'));

    if (isNetworkError) {
        throw new Error(`${actionPrefix}. Please check your network connection and try again, or contact Support for help. Code:0`);
    }

    // Fallback for other unexpected errors
    throw new Error(`${actionPrefix}. Try again shortly or contact Support for help. Code:1`);
}

export const preLogin = async ({ userName, password, managerServCraftLoginCredentials }) => {

  const https = require("https");

  const opts = {
    method: "POST",
    body: JSON.stringify({
      userName,
      password,
      managerServCraftLoginCredentials: managerServCraftLoginCredentials
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    agent: new https.Agent({
      rejectUnauthorized: !config.isDebuggingManager()
    })
  };

  const actionPrefix = "Login failed";
  try {
    const response = await fetch(config.managerHost + "/Authentication/PreLogin", opts);
    return await handleManagerResponse(response, actionPrefix);
  } catch (error) {
    handleManagerError(error, actionPrefix);
  }
}

export const loginComplete = async ({api, email, password, deviceId, managerServCraftLoginCredentials}) => {
  const actionPrefix = "Login failed";
  try {
    const response = await fetch(api + '/account/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        deviceId,
        managerServCraftLoginCredentials
      })
    });
    return await handleManagerResponse(response, actionPrefix);
  } catch (error) {
    handleManagerError(error, actionPrefix);
  }
}

export const sendResetPasswordEmail = async ({email}) => {
  const actionPrefix = "Password reset request failed";
  try {
    const response = await fetch(config.managerHost + '/Authentication/PasswordResetRequest', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    });
    return await handleManagerResponse(response, actionPrefix);
  } catch (error) {
    handleManagerError(error, actionPrefix);
  }
}

export const completeResetPassword = async ({password, token}) => {
  const actionPrefix = "Password reset failed";
  try {
    const response = await fetch(config.managerHost + '/Authentication/PasswordReset', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password,
        token
      })
    });
    return await handleManagerResponse(response, actionPrefix);
  } catch (error) {
    handleManagerError(error, actionPrefix);
  }
}

// Activation API functions

export const validateActivationToken = async (token) => {
  const actionPrefix = "Activation validation failed";
  try {
    const response = await fetch(config.managerHost + '/Authentication/ValidateActivationToken?token=' + encodeURIComponent(token), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return await handleManagerResponse(response, actionPrefix);
  } catch (error) {
    handleManagerError(error, actionPrefix);
  }
}

export const completeActivation = async ({ password, token }) => {
  const actionPrefix = "Account activation failed";
  try {
    const response = await fetch(config.managerHost + '/Authentication/ActivateAccount', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password,
        token
      })
    });

    const json = await handleManagerResponse(response, actionPrefix);
    if (json && json.success) {
      return json;
    } else {
      const serverMsg = json?.Message || json?.serverMessage || json?.message;
      if (serverMsg) {
        const error = new Error(serverMsg);
        error.isHandledManagerError = true;
        throw error;
      }
      const error = new Error(`${actionPrefix}. Try again shortly or contact Support for help. Code:1`);
      error.isHandledManagerError = true;
      throw error;
    }
  } catch (error) {
    handleManagerError(error, actionPrefix);
  }
}

export const requestActivationLink = async ({ email }) => {
  const actionPrefix = "Activation link request failed";
  try {
    const response = await fetch(config.managerHost + '/Authentication/RequestActivationLink', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    });
    return await handleManagerResponse(response, actionPrefix);
  } catch (error) {
    handleManagerError(error, actionPrefix);
  }
}

