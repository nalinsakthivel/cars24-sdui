import { SDUIPage } from '../../sdui/schema.types';
import MockData from '../../constants/MockData';
import { NETWORK_SIMULATED_LATENCY_MS } from '../../constants/AppConstants';
import { perf } from '../../utils/perf';

export const fetchHomePage = async (): Promise<SDUIPage> => {
  perf.mark('fetch_start');
  await new Promise<void>(resolve => setTimeout(resolve, NETWORK_SIMULATED_LATENCY_MS));
  perf.mark('parse_complete');
  return MockData;

  // Real server:
  // const response = await HttpsClient.get<SDUIPage>('/api/screen/home');
  // return response.data;
};
