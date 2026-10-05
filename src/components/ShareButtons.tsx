import { useState } from "react";
import { MessageCircle, Send, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ShareButtonsProps {
  /** URL to share. Defaults to the current page's URL. */
  url?: string;
  /** Title/text used by the native share sheet and WhatsApp/Telegram messages. */
  title: string;
  className?: string;
}

/**
 * A small row of share actions: native share sheet (mobile), WhatsApp,
 * Telegram and copy-link, with a clipboard fallback whenever
 * navigator.share isn't available.
 */
export function ShareButtons({ url, title, className }: ShareButtonsProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // istifadəçi ləğv etdi — heç nə etmə
      }
    } else {
      await copyLink();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("share.link_copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("share.link_copied"));
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          type="button"
          onClick={nativeShare}
          aria-label={t("share.label")}
          title={t("share.label")}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:border-gold/40 text-mist hover:text-goldsoft transition"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("share.whatsapp_aria")}
        title={t("share.whatsapp_aria")}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:border-gold/40 text-mist hover:text-goldsoft transition"
      >
        <MessageCircle className="w-4 h-4" />
      </a>
      <a
        href={telegramHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("share.telegram_aria")}
        title={t("share.telegram_aria")}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:border-gold/40 text-mist hover:text-goldsoft transition"
      >
        <Send className="w-4 h-4" />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label={t("share.copy_aria")}
        title={t("share.copy_aria")}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:border-gold/40 text-mist hover:text-goldsoft transition"
      >
        {copied ? <Check className="w-4 h-4 text-gold" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
