import { useI18n } from "vue-i18n";

export function formatTime(dateInput: Date | string): string {
  const { t, locale } = useI18n();

  let date: Date;

  if (typeof dateInput === "string") {
    // 尝试解析时间字符串
    let parsedDate: Date | null = null;

    // 尝试直接解析
    try {
      parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
      } else {
        // 尝试将空格替换为 T 来解析
        const isoStr = dateInput.replace(" ", "T");
        parsedDate = new Date(isoStr);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate;
        } else {
          return t("time.invalid_date");
        }
      }
    } catch {
      return t("time.invalid_date");
    }
  } else {
    date = dateInput;
  }

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
