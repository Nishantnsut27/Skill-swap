import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';

export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [loading, user, redirectTo, router]);

  return useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
    }),
    [user, loading],
  );
}
