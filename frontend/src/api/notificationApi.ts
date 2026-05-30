import axiosClient from "./axiosClient.ts";
import { Notification } from "../types/Notification.ts";

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
}

export const notificationApi = {
  getNotificationsByUser: (userId: string): Promise<NotificationResponse> => {
    return axiosClient.get(`/notifications/${userId}`);
  },

  markAsRead: (notificationId: string): Promise<{ success: boolean }> => {
    return axiosClient.put(`/notifications/${notificationId}/mark-read`);
  }
};
