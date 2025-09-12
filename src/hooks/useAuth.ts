import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthState => {
  const { user } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      try {
        // In a real app, this would validate tokens, etc.
        // For now, we just use the stored user
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
  };
};