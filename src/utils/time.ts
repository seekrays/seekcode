import { useI18n } from "vue-i18n";

export function formatTime(dateInput: Date | string): string {
  const { t, locale } = useI18n();
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return t("time.invalid_date");
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return t("time.just_now");
  if (minutes < 60) return t("time.minutes_ago", { minutes });
  if (hours < 24) return t("time.hours_ago", { hours });
  if (days < 30) return t("time.days_ago", { days });

  return date.toLocaleDateString(locale.value);
}
