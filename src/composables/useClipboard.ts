import { ref, computed, readonly } from "vue";
import { useI18n } from "vue-i18n";
import type { ClipboardItem } from "../types";
import {
  clipboardApi,
  clipboardManagerApi,
  initDatabase,
} from "../services/tauri";

const clipboardItems = ref<ClipboardItem[]>([]);
const selectedClipboardItem = ref<ClipboardItem | null>(null);
const error = ref<string | null>(null);

// 监听状态
const isMonitoring = ref(false);
const lastClipboardContent = ref<string>("");
let monitoringInterval: number | null = null;

// 计算属性
const totalItems = computed(() => clipboardItems.value.length);
const recentItems = computed(() => clipboardItems.value.slice(0, 10));

export function useClipboard() {
  const { t } = useI18n();
  // 检查剪贴板内容变化
  const checkClipboardChange = async () => {
    try {
      const currentContent = await clipboardManagerApi.readText();

      // 检查内容是否有变化
      if (
        currentContent &&
        currentContent.trim() &&
        currentContent !== lastClipboardContent.value &&
        currentContent.trim().length >= 3
      ) {
        // 检查是否已存在相同内容（避免重复）
        const existing = clipboardItems.value.find(
          (item) => item.content === currentContent
        );
        if (!existing) {
          console.log(
            "New clipboard content detected:",
            currentContent.substring(0, 50) + "..."
          );
          await addClipboardItem(currentContent);
        }

        lastClipboardContent.value = currentContent;
      }
    } catch (err) {
      // 静默处理错误，避免频繁报错
      console.error("Failed to check clipboard:", err);
    }
  };

  // 初始化剪贴板历史
  const initializeClipboard = async () => {
    error.value = null;

    try {
      // 确保数据库已初始化
      await initDatabase();

      // 获取剪贴板历史
      clipboardItems.value = await clipboardApi.getHistory();

      // 获取当前剪贴板内容作为初始值
      try {
        const currentContent = await clipboardManagerApi.readText();
        if (currentContent) {
          lastClipboardContent.value = currentContent;
        }
      } catch (err) {
        console.warn("Failed to get initial clipboard content:", err);
      }
    } catch (err) {
      console.error("Failed to initialize clipboard:", err);
      error.value =
        err instanceof Error ? err.message : t("error.clipboardInitFailed");
    }
  };

  // 启动剪贴板监听
  const startClipboardMonitoring = async () => {
    if (isMonitoring.value) {
      return;
    }

    try {
      // 设置定时器，每2秒检查一次剪贴板变化
      monitoringInterval = window.setInterval(checkClipboardChange, 2000);
      isMonitoring.value = true;
      console.log("Clipboard monitoring started with 2s interval");
    } catch (err) {
      console.error("Failed to start clipboard monitoring:", err);
      error.value =
        err instanceof Error ? err.message : t("error.clipboardStartFailed");
    }
  };

  // 停止剪贴板监听
  const stopClipboardMonitoring = async () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
    isMonitoring.value = false;
    console.log("Clipboard monitoring stopped");
  };

  // 添加剪贴板项
  const addClipboardItem = async (content: string) => {
    if (!content.trim()) {
      throw new Error(t("error.contentEmpty"));
    }

    error.value = null;

    try {
      const newItem = await clipboardApi.add(content);

      // 重新从数据库获取最新列表，确保与数据库同步
      // 因为添加新项时可能已经删除了超出限制的旧数据
      const updatedItems = await clipboardApi.getHistory();
      clipboardItems.value = updatedItems;

      return newItem;
    } catch (err) {
      console.error("Failed to add clipboard item:", err);
      error.value =
        err instanceof Error ? err.message : t("error.clipboardAddFailed");
      throw err;
    }
  };

  // 删除剪贴板项
  const deleteClipboardItem = async (id: number) => {
    error.value = null;

    try {
      await clipboardApi.delete(id);

      // 从本地列表中移除
      clipboardItems.value = clipboardItems.value.filter(
        (item) => item.id !== id
      );

      // 如果删除的是当前选中的项，清除选中状态
      if (selectedClipboardItem.value?.id === id) {
        selectedClipboardItem.value = null;
      }
    } catch (err) {
      console.error("Failed to delete clipboard item:", err);
      error.value =
        err instanceof Error ? err.message : t("error.clipboardDeleteFailed");
      throw err;
    }
  };

  // 清空剪贴板历史
  const clearClipboardHistory = async () => {
    error.value = null;

    try {
      await clipboardApi.clear();

      // 清空本地列表
      clipboardItems.value = [];
      selectedClipboardItem.value = null;
    } catch (err) {
      console.error("Failed to clear clipboard history:", err);
      error.value =
        err instanceof Error ? err.message : t("error.clipboardClearFailed");
      throw err;
    }
  };

  // 选择剪贴板项
  const selectClipboardItem = (item: ClipboardItem | null) => {
    selectedClipboardItem.value = item;
  };

  // 复制到系统剪贴板
  const copyToSystemClipboard = async (content: string) => {
    const { copyText } = await import("../utils/clipboard");
    const success = await copyText(content);
    if (success) {
      // 更新最后的剪贴板内容，避免重复检测
      lastClipboardContent.value = content;
    }
    return success;
  };

  // 获取单个剪贴板项
  const getClipboardItemById = async (
    id: number
  ): Promise<ClipboardItem | null> => {
    try {
      return await clipboardApi.getById(id);
    } catch (err) {
      console.error("Failed to get clipboard item by id:", err);
      error.value = err instanceof Error ? err.message : "获取剪贴板项失败";
      return null;
    }
  };

  // 搜索剪贴板历史
  const searchClipboard = async (query: string) => {
    if (!query.trim()) {
      await initializeClipboard();
      return;
    }

    const searchTerm = query.toLowerCase();
    clipboardItems.value = clipboardItems.value.filter((item) =>
      item.content.toLowerCase().includes(searchTerm)
    );
  };

  // 按类型过滤
  const filterByType = async (contentType: string) => {
    if (!contentType || contentType === "all") {
      await initializeClipboard();
      return;
    }

    // 由于移除了 content_type 字段，这里可以简化为基于内容的过滤
    const query = contentType.toLowerCase();
    clipboardItems.value = clipboardItems.value.filter((item) =>
      item.content.toLowerCase().includes(query)
    );
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  // 刷新数据
  const refresh = async () => {
    await initializeClipboard();
  };

  return {
    // 状态
    clipboardItems: readonly(clipboardItems),
    selectedClipboardItem: readonly(selectedClipboardItem),
    error: readonly(error),
    isMonitoring: readonly(isMonitoring),

    // 计算属性
    totalItems,
    recentItems,

    // 方法
    initializeClipboard,
    addClipboardItem,
    deleteClipboardItem,
    clearClipboardHistory,
    selectClipboardItem,
    copyToSystemClipboard,
    getClipboardItemById,
    startClipboardMonitoring,
    stopClipboardMonitoring,
    searchClipboard,
    filterByType,
    clearError,
    refresh,
  };
}
