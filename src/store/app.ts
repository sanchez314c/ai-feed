import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppState, Notification, User, UserPreferences } from '@/types';

interface AppStore extends AppState {
  // Actions
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    desktop: true,
    mobile: true,
    frequency: 'realtime',
    keywords: [],
  },
  dashboard: {
    layout: 'grid',
    density: 'comfortable',
    itemsPerPage: 20,
    autoRefresh: true,
    refreshInterval: 300, // 5 minutes
  },
  sources: {
    arxiv: true,
    news: true,
    youtube: true,
    blogs: true,
    github: true,
    twitter: true,
  },
  categories: [
    'Research',
    'Applications',
    'Business',
    'Ethics',
    'Tools',
    'Tutorials',
    'Hardware',
    'Theory',
    'Community',
  ],
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        theme: 'light',
        sidebarOpen: true,
        loading: false,
        error: null,
        notifications: [],

        // Actions
        initialize: async () => {
          set({ loading: true, error: null });

          try {
            // Initialize app settings
            const storedTheme = (await window.electronAPI?.store.get('theme')) as 'light' | 'dark';
            const storedSidebar = (await window.electronAPI?.store.get('sidebarOpen')) as boolean;

            if (storedTheme) {
              set({ theme: storedTheme });
              document.documentElement.setAttribute('data-theme', storedTheme);
            }

            if (typeof storedSidebar === 'boolean') {
              set({ sidebarOpen: storedSidebar });
            }

            // Create default user if none exists
            const existingUser = (await window.electronAPI?.store.get('user')) as User;
            if (!existingUser) {
              const defaultUser: User = {
                id: 'local-user',
                email: 'user@aifeed.local',
                name: 'AIFEED User',
                preferences: defaultPreferences,
                teams: [],
                role: 'user',
                createdAt: new Date(),
                lastActive: new Date(),
              };

              await window.electronAPI?.store.set('user', defaultUser);
              set({ user: defaultUser });
            } else {
              set({ user: existingUser });
            }

            set({ loading: false });

            if (window.electronAPI) {
              await window.electronAPI.log.info('App initialized successfully');
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to initialize app';
            set({ error: errorMessage, loading: false });

            if (window.electronAPI) {
              await window.electronAPI.log.error('App initialization failed', error);
            }
          }
        },

        setUser: user => {
          set({ user });
          if (window.electronAPI && user) {
            window.electronAPI.store.set('user', user);
          }
        },

        setTheme: theme => {
          set({ theme });
          document.documentElement.setAttribute('data-theme', theme);

          if (window.electronAPI) {
            window.electronAPI.store.set('theme', theme);
          }
        },

        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        setSidebarOpen: sidebarOpen => {
          set({ sidebarOpen });
          if (window.electronAPI) {
            window.electronAPI.store.set('sidebarOpen', sidebarOpen);
          }
        },

        toggleSidebar: () => {
          const { sidebarOpen } = get();
          get().setSidebarOpen(!sidebarOpen);
        },

        setLoading: loading => set({ loading }),

        setError: error => set({ error }),

        addNotification: notification => {
          const newNotification: Notification = {
            ...notification,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
          };

          set(state => ({
            notifications: [...state.notifications, newNotification],
          }));

          // Auto-remove notifications after duration
          if (notification.duration && !notification.persistent) {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, notification.duration);
          }
        },

        removeNotification: id => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }));
        },

        clearNotifications: () => {
          set({ notifications: [] });
        },

        updateUserPreferences: async preferences => {
          const { user } = get();
          if (!user) return;

          const updatedUser = {
            ...user,
            preferences: {
              ...user.preferences,
              ...preferences,
            },
          };

          set({ user: updatedUser });

          if (window.electronAPI) {
            await window.electronAPI.store.set('user', updatedUser);
          }

          // Apply theme if changed
          if (preferences.theme && preferences.theme !== get().theme) {
            get().setTheme(preferences.theme);
          }
        },
      }),
      {
        name: 'aifeed-app-store',
        partialize: state => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);
