import { apiClient } from '../apiClient';

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'notice' | 'complaint' | 'billing' | 'visitor' | 'general';
  reference_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unread_count: number;
}

export const notificationsApi = {
  /** Fetch all in-app notifications for the logged-in user */
  getAll: async (): Promise<{ success: boolean; data: NotificationsResponse }> => {
    return apiClient.get('/notices/notifications');
  },

  /** Mark specific notification IDs as read. Pass empty array to mark all. */
  markRead: async (ids: number[] = []): Promise<{ success: boolean; message: string }> => {
    return apiClient.put('/notices/notifications/read', { ids });
  },
};
