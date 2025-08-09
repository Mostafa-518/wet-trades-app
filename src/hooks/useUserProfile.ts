
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';

export function useUserProfile() {
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authService.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    userProfile,
    isLoading,
    error,
  };
}
