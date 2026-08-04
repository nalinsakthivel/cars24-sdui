import { useQuery } from '@tanstack/react-query';
import { fetchHomePage } from '../../services/apiServices/GetApiServices';
import { QUERY_KEYS } from '../../services/constants/QueryKeys';

export const useHomePage = () => {
  return useQuery({
    queryKey: QUERY_KEYS.HOME_PAGE,
    queryFn: fetchHomePage,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
