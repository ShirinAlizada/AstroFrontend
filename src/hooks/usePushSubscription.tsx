import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getExistingSubscription,
  getPushPermission,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";

/** Whether this browser currently has an active push subscription for the signed-in user. */
export function useIsPushSubscribed() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["push-subscribed", user?.id],
    enabled: Boolean(user) && isPushSupported(),
    queryFn: async () => Boolean(await getExistingSubscription()),
  });
}

export function useSubscribeToPush() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: () => subscribeToPush(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-subscribed", user?.id] });
    },
  });
}

export function useUnsubscribeFromPush() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: () => unsubscribeFromPush(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-subscribed", user?.id] });
    },
  });
}

export { isPushSupported, getPushPermission };
