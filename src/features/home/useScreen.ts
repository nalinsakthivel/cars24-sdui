import { useHomePage } from '../../stores/hooks/useHomePage';

export const useScreen = () => {
  const { data: page, isLoading, isError, refetch } = useHomePage();
  return { page, isLoading, isError, refetch };
};
