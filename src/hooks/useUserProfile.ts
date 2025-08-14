
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useUserProfile() {
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authService.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Setup real-time subscription for user profiles
  useRealtimeSubscription({
    table: 'user_profiles',
    queryKeys: [['userProfile']],
  });

  return {
    userProfile,
    isLoading,
    error,
  };
}
