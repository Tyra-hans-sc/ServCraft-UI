import Fetch from '../utils/Fetch';
import * as Enums from '../utils/enums';

const getIntegration = async (ctx = null) => {

  let result = null;

  const integrations = await Fetch.get({
    url: '/Integration',
    ctx: ctx
  });

  if (integrations.TotalResults > 0) {
    let integrationList = integrations.Results;
    result = integrationList.find(x => x.Status == Enums.IntegrationStatus.Live && x.Type == Enums.IntegrationType.Accounting);    
  }
// return null instead of undefined for useQuery data to distinguish between initial undefined value and no value
  return result || null;
};

export default {
  getIntegration
};
