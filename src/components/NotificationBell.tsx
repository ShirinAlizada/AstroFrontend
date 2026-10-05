import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffectivePlan } from "@/hooks/useSubscription";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
  type NotificationRecord,
} from "@/hooks/useNotifications";
import {
  getPushPermission,
  isPushSupported,
  useIsPushSubscribed,
  useSubscribeToPush,
  useUnsubscribeFromPush,
} from "@/hooks/usePushSubscription";

type DisplayItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string | null;
  isVirtual: boolean;
};

function formatRelativeTime(iso: string, t: (key: string) => string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return t("time.just_now");
  if (mins < 60) return t("time.minutes_ago").replace("{n}", String(mins));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("time.hours_ago").replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  return t("time.days_ago").replace("{n}", String(days));
}

function toDisplay(n: NotificationRecord): DisplayItem {
  return { id: n.id, title: n.title, body: n.body, link: n.link, isRead: n.isRead, createdAt: n.createdAt, isVirtual: false };
}

/**
 * Bildirişlər zəngi: verilənlər bazasındakı bildirişlər (forum cavabı, sifariş
 * statusu) ilə yanaşı, abunəliyin bitməsinə 3 gündən az qalıbsa, "canlı"
 * hesablanan (DB-də saxlanmayan) xəbərdarlıq da göstərir — bax:
 * supabase/migrations/20260930190000_notifications.sql.
 */
export function NotificationBell() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const { data } = useMyNotifications();
  const { subscription } = useEffectivePlan();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const pushSupported = isPushSupported();
  const { data: isPushSubscribed } = useIsPushSubscribed();
  const subscribeToPush = useSubscribeToPush();
  const unsubscribeFromPush = useUnsubscribeFromPush();
  const pushDenied = pushSupported && getPushPermission() === "denied";

  function handleTogglePush() {
    if (isPushSubscribed) {
      unsubscribeFromPush.mutate();
      return;
    }
    subscribeToPush.mutate(undefined, {
      onError: () => toast.error(t("notif.push_error")),
    });
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const daysLeft = subscription
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / 86_400_000)
    : null;
  const showExpiryNotice = subscription?.status === "active" && daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  const virtualItems: DisplayItem[] = showExpiryNotice
    ? [
        {
          id: "virtual-sub-expiry",
          title: t("notif.subscription_expiring_title"),
          body: daysLeft === 0 ? t("notif.subscription_expiring_today") : t("notif.subscription_expiring_days").replace("{n}", String(daysLeft)),
          link: "/paketler",
          isRead: false,
          createdAt: null,
          isVirtual: true,
        },
      ]
    : [];

  const dbItems = (data ?? []).map(toDisplay);
  const items = [...virtualItems, ...dbItems];
  const unreadCount = virtualItems.length + dbItems.filter((n) => !n.isRead).length;
  const hasUnreadDb = dbItems.some((n) => !n.isRead);

  function handleItemClick(item: DisplayItem) {
    if (!item.isVirtual && !item.isRead) {
      markRead.mutate(item.id);
    }
    setOpen(false);
    if (item.link) {
      // item.link məlumat bazasından/qaydadan gələn sərbəst mətn yoldur (məs. "/forum/{id}"),
      // TanStack Router-in statik tipli marşrut siyahısına uyğun deyil — buna görə "as any".
      navigate({ to: item.link as any });
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-label={t("nav.notifications_aria")}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-mist hover:text-white transition"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-gold text-ink text-[10px] font-semibold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-white/10 bg-ink2/95 backdrop-blur shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-semibold text-white">{t("notif.heading")}</span>
            {hasUnreadDb && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="text-xs text-goldsoft hover:text-gold transition"
              >
                {t("notif.mark_all_read")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-6 text-center text-xs text-mist">{t("notif.empty")}</p>}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition ${
                  item.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!item.isRead && <span className="mt-1.5 size-1.5 rounded-full bg-gold shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-sm text-white">{item.title}</div>
                    {item.body && <div className="text-xs text-mist mt-0.5 line-clamp-2">{item.body}</div>}
                    {item.createdAt && (
                      <div className="text-[10px] text-mist/70 mt-1">{formatRelativeTime(item.createdAt, t)}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {pushSupported && (
            <div className="border-t border-white/5 px-4 py-2.5">
              <button
                type="button"
                onClick={handleTogglePush}
                disabled={pushDenied || subscribeToPush.isPending || unsubscribeFromPush.isPending}
                title={pushDenied ? t("notif.push_denied") : undefined}
                className="w-full flex items-center gap-2 text-xs text-mist hover:text-goldsoft transition disabled:opacity-50 disabled:hover:text-mist"
              >
                {isPushSubscribed ? <BellRing className="size-3.5 text-goldsoft" /> : <BellOff className="size-3.5" />}
                <span>
                  {pushDenied
                    ? t("notif.push_denied")
                    : isPushSubscribed
                      ? t("notif.push_disable")
                      : t("notif.push_enable")}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
