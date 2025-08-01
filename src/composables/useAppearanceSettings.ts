import { ref, computed, watch } from "vue";
import type { ThemeMode } from "../types";
import { useSettingsDatabase } from "./useSettingsDatabase";

// 外观设置状态
const currentTheme = ref<ThemeMode>("system");
const systemTheme = ref<"light" | "dark">("light");
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const error = ref<string | null>(null);
const loading = ref(false);

// 计算实际应用的主题
const appliedTheme = computed(() => {
  if (currentTheme.value === "system") {
    return systemTheme.value;
  }
  return currentTheme.value;
});

export function useAppearanceSettings() {
  const { saveSetting, getSetting } = useSettingsDatabase();

  // 更新系统主题状态
  const updateSystemTheme = () => {
    systemTheme.value = mediaQuery.matches ? "dark" : "light";
  };

  // 应用主题到DOM
  const applyTheme = () => {
    const isDark = appliedTheme.value === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  };

  // 从数据库获取主题设置
  const getThemeFromDatabase = async (): Promise<ThemeMode> => {
    try {
      const theme = await getSetting("theme");
      return (theme as ThemeMode) || "system"; // 默认值
    } catch (err) {
      console.error("Failed to get theme from database:", err);
      error.value = err instanceof Error ? err.message : "获取主题设置失败";
      return "system";
    }
  };

  // 设置主题
  const setTheme = async (theme: ThemeMode): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      await saveSetting("theme", theme);
        currentTheme.value = theme;
        applyTheme(); // 立即应用主题
      return true;
    } catch (err) {
      console.error("Failed to set theme:", err);
      error.value = err instanceof Error ? err.message : "设置主题失败";
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 初始化外观设置
  const initializeAppearanceSettings = async (): Promise<void> => {
    // 初始化系统主题检测
    updateSystemTheme();
    mediaQuery.addEventListener("change", updateSystemTheme);

    // 从数据库加载主题设置
    const theme = await getThemeFromDatabase();
    currentTheme.value = theme;

    // 应用主题
    applyTheme();
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  // 监听主题变化并应用
  watch(appliedTheme, applyTheme);

  return {
    // 状态
    currentTheme: computed(() => currentTheme.value),
    appliedTheme,
    systemTheme: computed(() => systemTheme.value),
    error: computed(() => error.value),
    loading: computed(() => loading.value),

    // 兼容性属性
    settings: computed(() => ({
      theme: currentTheme.value,
    })),

    // 方法
    setTheme,
    initializeAppearanceSettings,
    clearError,
  };
}
