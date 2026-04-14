let apiHost = process.env.NEXT_PUBLIC_API_URL;
if (apiHost.indexOf('localhost') > 0 && !apiHost.endsWith('api')) apiHost = apiHost + '/api';
let managerHost = process.env.NEXT_PUBLIC_MANAGER_URL;
if (managerHost.indexOf('localhost') > 0 && !managerHost.endsWith('api')) managerHost = managerHost + '/api';

// NB: do not change anything in this method for debug mode
const isDebugging = () => {
  return process.env.NODE_ENV === 'development';
};

// NB: do not change anything in this method for debug modenpm stpo
const isDebuggingManager = () => {
  return process.env.NODE_ENV === 'development';
};

export default {
  isDebugging,
  isDebuggingManager,
  apiHost,
  managerHost
}
