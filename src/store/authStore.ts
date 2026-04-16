import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: 'committee' | 'member' | 'security';
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: (state: Partial<AuthState>) => void, get: () => AuthState) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (token: string, user: User) => {
        if (typeof document !== 'undefined') {
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
          document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        }

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Set token in localStorage for API client
        localStorage.setItem('token', token);
      },

      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'token=; path=/; max-age=0; samesite=lax';
          document.cookie = 'role=; path=/; max-age=0; samesite=lax';
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser };
          set({ user: newUser });
          localStorage.setItem('user', JSON.stringify(newUser));
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
