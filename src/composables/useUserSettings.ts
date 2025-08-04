import { computed } from "vue";
import { useGeneralSettings } from "./useGeneralSettings";
import { useAppearanceSettings } from "./useAppearanceSettings";
import { useSettingsModal } from "./useSettingsModal";
import { useLanguage } from "./useLanguage";

// 用户设置接口定义（保持兼容性）
export interface UserSetting {
  id?: number;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

export interface GeneralSettings {
  autostart_enabled: boolean;
  theme: string;
  language: string;
}

export interface SettingsState {
  isOpen: boolean;
  activeTab: "general" | "appearance" | "plugins" | "about";
}

export function useUserSettings() {
  // 组合各个模块
  const generalSettings = useGeneralSettings();
  const appearanceSettings = useAppearanceSettings();
  const settingsModal = useSettingsModal();
  const language = useLanguage();

  // 统一的初始化方法
  const initializeUserSettings = async (): Promise<void> => {
    await Promise.all([
      generalSettings.initializeGeneralSettings(),
      appearanceSettings.initializeAppearanceSettings(),
      language.initializeLanguageSettings(),
    ]);
  };

  // 统一的错误状态（优先显示通用设置的错误，其次是外观设置）
  const error = computed(
    () =>
      generalSettings.error.value ||
      appearanceSettings.error.value ||
      language.error.value
  );

  // 统一的加载状态
  const loading = computed(
    () =>
      generalSettings.loading.value ||
      appearanceSettings.loading.value ||
      language.loading.value
  );

  // 清除所有错误
  const clearError = () => {
    generalSettings.clearError();
    appearanceSettings.clearError();
    language.clearError();
  };

  return {
    // === 状态 ===
    error,
    loading,
    settingsState: settingsModal.settingsState,

    // === 通用设置 ===
    isAutostartEnabled: generalSettings.isAutostartEnabled,

    // === 外观设置 ===
    currentTheme: appearanceSettings.currentTheme,
    appliedTheme: appearanceSettings.appliedTheme,
    systemTheme: appearanceSettings.systemTheme,

    // === 语言设置 ===
    currentLanguageSetting: language.currentLanguageSetting,
    actualLocale: language.actualLocale,
    LANGUAGE_OPTIONS: language.LANGUAGE_OPTIONS,

    // === 方法 ===
    // 通用设置方法
    enableAutostart: generalSettings.enableAutostart,
    disableAutostart: generalSettings.disableAutostart,
    toggleAutostart: generalSettings.toggleAutostart,
    checkAutostartStatus: generalSettings.checkAutostartStatus,

    // 外观设置方法
    setTheme: appearanceSettings.setTheme,

    // 语言设置方法
    setLanguage: language.setLanguage,
    getLanguageName: language.getLanguageName,

    // 设置模态框方法
    openSettings: settingsModal.openSettings,
    closeSettings: settingsModal.closeSettings,
    setActiveTab: settingsModal.setActiveTab,

    // 统一方法
    initializeUserSettings,
    clearError,
  };
}
