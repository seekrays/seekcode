import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSettingsDatabase } from "./useSettingsDatabase";
import { toast } from "./useToast";

// 剪贴板设置状态
const maxClipboardItems = ref(100);
const error = ref<string | null>(null);
const loading = ref(false);

export function useClipboardSettings() {
  const { t } = useI18n();
  const { saveSetting, getSetting } = useSettingsDatabase();

  // 保存剪贴板设置
  const saveClipboardSettings = async (maxItems: number): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      // 保存设置到数据库
      await saveSetting("max_clipboard_items", maxItems.toString());
      maxClipboardItems.value = maxItems;

      toast.success(t("settings.clipboardSettingsSaved"));
      return true;
    } catch (err) {
      console.error("Failed to save clipboard settings:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("settings.saveClipboardSettingsFailed");
      toast.error(t("settings.saveSettingsFailed"));
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 加载剪贴板设置
  const loadClipboardSettings = async (): Promise<void> => {
    try {
      const setting = await getSetting("max_clipboard_items");
      if (setting) {
        maxClipboardItems.value = parseInt(setting) || 100;
      }
    } catch (err) {
      console.error("Failed to load clipboard settings:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("settings.loadClipboardSettingsFailed");
    }
  };

  // 初始化剪贴板设置
  const initializeClipboardSettings = async (): Promise<void> => {
    await loadClipboardSettings();
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  return {
    // 状态
    maxClipboardItems: computed(() => maxClipboardItems.value),
    error: computed(() => error.value),
    loading: computed(() => loading.value),

    // 方法
    saveClipboardSettings,
    loadClipboardSettings,
    initializeClipboardSettings,
    clearError,
  };
}
