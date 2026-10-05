import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRecord,
} from "@/lib/notifications";

/** DB-bildirişləri — 30 saniyədə bir yenilənir (zəngə "canlı" hiss vermək üçün, ayrıca real-time abunəlik olmadan). */
export function useMyNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-notifications", user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchMyNotifications(user!.id),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications", user?.id] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications", user?.id] });
    },
  });
}

export type { NotificationRecord };
