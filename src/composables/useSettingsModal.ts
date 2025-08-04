import { ref, computed } from "vue";
import type { SettingsState } from "../types";

// 设置模态框状态
const settingsState = ref<SettingsState>({
  isOpen: false,
  activeTab: "general",
});

export function useSettingsModal() {
  // 打开设置弹窗
  const openSettings = (
    tab: "general" | "appearance" | "plugins" | "about" = "general"
  ) => {
    settingsState.value.isOpen = true;
    settingsState.value.activeTab = tab;
  };

  // 关闭设置弹窗
  const closeSettings = () => {
    settingsState.value.isOpen = false;
  };

  // 切换设置标签
  const setActiveTab = (
    tab: "general" | "appearance" | "plugins" | "about"
  ) => {
    settingsState.value.activeTab = tab;
  };

  return {
    // 状态
    settingsState: computed(() => settingsState.value),

    // 方法
    openSettings,
    closeSettings,
    setActiveTab,
  };
}
