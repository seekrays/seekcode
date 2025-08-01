import { createI18n } from "vue-i18n";
import zhCN from "./locales/zh-CN";
import enUS from "./locales/en-US";

// 获取系统语言
const getSystemLocale = (): string => {
  const language = navigator.language.toLowerCase();

  // 中文相关语言
  if (language.includes("zh")) {
    return "zh-CN";
  }

  // 默认英文
  return "en-US";
};

// 初始化时使用系统语言作为默认值
// 实际语言设置将在应用启动后从数据库加载并更新
const i18n = createI18n({
  legacy: false,
  locale: getSystemLocale(), // 使用系统语言作为初始值
  fallbackLocale: "en-US",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
});

export default i18n;
export { getSystemLocale };
