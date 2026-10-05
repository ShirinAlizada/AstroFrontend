// Bildirişlər zəngi üçün data qatı. Yazılar (forum cavabı, sifariş statusu
// dəyişikliyi) yalnız verilənlər bazasındakı SECURITY DEFINER trigger
// funksiyaları vasitəsilə yaranır (bax: supabase/migrations/20260930190000_notifications.sql) —
// bu fayl yalnız oxumaq/oxunmuş etmək/silmək üçündür.
import { supabase } from "@/integrations/supabase/client";

export interface NotificationRecord {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

/** İstifadəçinin bütün bildirişləri (ən yenidən köhnəyə), zəng menyusu üçün. */
export async function fetchMyNotifications(userId: string): Promise<NotificationRecord[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    link: r.link,
    isRead: r.is_read,
    createdAt: r.created_at,
  }));
}

/** Tək bir bildirişi oxunmuş kimi işarələyir. */
export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw error;
}

/** İstifadəçinin bütün bildirişlərini oxunmuş kimi işarələyir. */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw error;
}
