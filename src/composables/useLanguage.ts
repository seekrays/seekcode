import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSettingsDatabase } from "./useSettingsDatabase";
import { getSystemLocale } from "../i18n";

// 可用语言列表
export type SupportedLocale = "zh-CN" | "en-US" | "system";

export interface LanguageOption {
  code: SupportedLocale;
  name: string;
  nativeName: string;
}

// 语言选项列表
export function getLanguageOptions(
  t: (key: string) => string
): LanguageOption[] {
  return [
    {
      code: "system",
      name: t("settings.systemLanguage"),
      nativeName: t("settings.systemLanguage"),
    },
    {
      code: "zh-CN",
      name: "Chinese (Simplified)",
      nativeName: t("settings.chinese"),
    },
    {
      code: "en-US",
      name: "English",
      nativeName: t("settings.english"),
    },
  ];
}

// 语言设置管理
export function useLanguage() {
  const { locale, t } = useI18n();
  const { saveSetting, getSetting } = useSettingsDatabase();

  // 当前选择的语言设置（可能是 system）
  const currentLanguageSetting = ref<SupportedLocale>("system");
  const error = ref<string | null>(null);
  const loading = ref(false);

  // 语言选项列表
  const languageOptions = computed(() => getLanguageOptions(t));

  // 实际应用的语言（不会是 system）
  const actualLocale = computed(() => {
    if (currentLanguageSetting.value === "system") {
      return getSystemLocale();
    }
    return currentLanguageSetting.value;
  });

  // 从数据库获取语言设置
  const getLanguageFromDatabase = async (): Promise<SupportedLocale> => {
    try {
      const language = await getSetting("language");

      if (!language) {
        return "system"; // 默认值
      }

      const value = language as SupportedLocale;
      if (value === "system" || value === "zh-CN" || value === "en-US") {
        return value;
      }

      return "system";
    } catch (err) {
      console.error("Failed to get language from database:", err);
      error.value = err instanceof Error ? err.message : "获取语言设置失败";
      return "system";
    }
  };

  // 从数据库加载语言设置
  const loadLanguageSettings = async () => {
    const language = await getLanguageFromDatabase();
    currentLanguageSetting.value = language;

    // 应用实际的语言
    locale.value = actualLocale.value;
  };

  // 设置语言
  const setLanguage = async (language: SupportedLocale): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      await saveSetting("language", language);
      currentLanguageSetting.value = language;
      locale.value = actualLocale.value;
      return true;
    } catch (err) {
      console.error("Failed to set language:", err);
      error.value = err instanceof Error ? err.message : "设置语言失败";
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 获取语言显示名称
  const getLanguageName = (code: SupportedLocale, useNativeName = false) => {
    const option = languageOptions.value.find(
      (opt: LanguageOption) => opt.code === code
    );
    return option ? (useNativeName ? option.nativeName : option.name) : code;
  };

  // 初始化语言设置
  const initializeLanguageSettings = async (): Promise<void> => {
    await loadLanguageSettings();
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  return {
    // 状态
    currentLanguageSetting: computed(() => currentLanguageSetting.value),
    actualLocale,
    error: computed(() => error.value),
    loading: computed(() => loading.value),

    // 方法
    setLanguage,
    getLanguageName,
    initializeLanguageSettings,
    clearError,

    // 常量
    LANGUAGE_OPTIONS: languageOptions,
  };
}
