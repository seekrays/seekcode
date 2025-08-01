import { ref, computed } from "vue";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useSettingsDatabase } from "./useSettingsDatabase";

// 通用设置状态
const isAutostartEnabled = ref(false);
const error = ref<string | null>(null);
const loading = ref(false);

export function useGeneralSettings() {
  const { saveSetting, getSetting } = useSettingsDatabase();

  // 启用开机启动
  const enableAutostart = async (): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      // 1. 启用系统开机启动
      await enable();

      // 2. 保存设置到数据库
      await saveSetting("autostart_enabled", "true");
        isAutostartEnabled.value = true;

      return true;
    } catch (err) {
      console.error("Failed to enable autostart:", err);
      error.value = err instanceof Error ? err.message : "启用开机启动失败";
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 禁用开机启动
  const disableAutostart = async (): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      // 1. 禁用系统开机启动
      await disable();

      // 2. 保存设置到数据库
      await saveSetting("autostart_enabled", "false");
        isAutostartEnabled.value = false;

      return true;
    } catch (err) {
      console.error("Failed to disable autostart:", err);
      error.value = err instanceof Error ? err.message : "禁用开机启动失败";
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 切换开机启动状态
  const toggleAutostart = async (): Promise<boolean> => {
    if (isAutostartEnabled.value) {
      return await disableAutostart();
    } else {
      return await enableAutostart();
    }
  };

  // 检查开机启动状态
  const checkAutostartStatus = async (): Promise<boolean> => {
    try {
      // 1. 检查系统开机启动状态
      const systemEnabled = await isEnabled();

      // 2. 检查数据库中的设置
      const dbSetting = await getSetting("autostart_enabled");
      const dbEnabled = dbSetting === "true";

      // 3. 如果两者不一致，以系统状态为准并更新数据库
      if (systemEnabled !== dbEnabled) {
        await saveSetting("autostart_enabled", systemEnabled.toString());
      }

      // 4. 更新本地状态
      isAutostartEnabled.value = systemEnabled;

      return systemEnabled;
    } catch (err) {
      console.error("Failed to check autostart status:", err);
      error.value = err instanceof Error ? err.message : "检查开机启动状态失败";
      return false;
    }
  };

  // 初始化通用设置
  const initializeGeneralSettings = async (): Promise<void> => {
    await checkAutostartStatus();
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  return {
    // 状态
    isAutostartEnabled: computed(() => isAutostartEnabled.value),
    error: computed(() => error.value),
    loading: computed(() => loading.value),

    // 方法
    enableAutostart,
    disableAutostart,
    toggleAutostart,
    checkAutostartStatus,
    initializeGeneralSettings,
    clearError,
  };
}
