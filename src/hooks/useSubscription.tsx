import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchPlans,
  fetchMySubscription,
  fetchMyPayments,
  getEffectivePlan,
  FREE_PLAN,
  type SubscriptionPlan,
  type UserSubscription,
  type PaymentRecord,
} from "@/lib/subscription";

export function usePlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: fetchPlans,
    staleTime: 5 * 60_000,
  });
}

export function useMySubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-subscription", user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchMySubscription(user!.id),
  });
}

/** Bu istifadəçi üçün hər iki sorğunu invalidasiya edən köməkçi — checkout/ləğv sonrası. */
export function useInvalidateSubscription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["my-subscription", user?.id] });
  };
}

/** Cari effektiv paket: aktiv ödənişli abunəlik yoxdursa "Pulsuz" paketi qaytarır. */
export function useEffectivePlan(): {
  plan: SubscriptionPlan;
  subscription: UserSubscription | null;
  isLoading: boolean;
} {
  const plansQ = usePlans();
  const subQ = useMySubscription();
  const plan = getEffectivePlan(plansQ.data ?? [], subQ.data ?? null);
  return { plan, subscription: subQ.data ?? null, isLoading: plansQ.isLoading || subQ.isLoading };
}

/** İstifadəçinin ödəniş qəbzləri (Ödənişlərim səhifəsi üçün). */
export function useMyPayments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-payments", user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchMyPayments(user!.id),
  });
}

export { FREE_PLAN };
export type { SubscriptionPlan, UserSubscription, PaymentRecord };
