<template>
  <div class="space-y-6">
    <!-- 数据统计 -->
    <div
      class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700"
    >
      <h3
        class="text-lg font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-4"
      >
        <i class="fas fa-chart-bar text-blue-600 dark:text-blue-400"></i>
        {{ $t("settings.dataStatistics") }}
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-600"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
              >
                <i
                  class="fas fa-code text-green-600 dark:text-green-400 text-lg"
                ></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ $t("settings.snippetsCount") }}
                </p>
                <p
                  class="text-2xl font-bold text-green-600 dark:text-green-400"
                >
                  {{ snippetsCount }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-600"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"
              >
                <i
                  class="fas fa-clipboard text-purple-600 dark:text-purple-400 text-lg"
                ></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ $t("settings.clipboardCount") }}
                </p>
                <p
                  class="text-2xl font-bold text-purple-600 dark:text-purple-400"
                >
                  {{ clipboardCount }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 代码片段数据管理 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-6">
        <h3
          class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"
        >
          <i class="fas fa-file-code text-indigo-500"></i>
          {{ $t("settings.codeSnippetDataManagement") }}
        </h3>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 数据导出 -->
        <div class="space-y-4">
          <div>
            <h4
              class="text-base font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"
            >
              <i class="fas fa-download text-green-500"></i>
              {{ $t("settings.exportData") }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {{ $t("settings.exportDataDesc") }}
            </p>
            <button
              @click="exportSnippets"
              :disabled="isExporting"
              class="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <i
                class="fas fa-code"
                :class="{ 'animate-spin': isExporting }"
              ></i>
              {{
                isExporting
                  ? $t("settings.exporting")
                  : $t("settings.exportSnippets")
              }}
            </button>
          </div>
        </div>

        <!-- 数据导入 -->
        <div class="space-y-4">
          <div>
            <h4
              class="text-base font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"
            >
              <i class="fas fa-upload text-blue-500"></i>
              {{ $t("settings.importData") }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {{ $t("settings.importDataDesc") }}
            </p>
          </div>

          <!-- 清空已有数据选项 -->
          <div
            class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="fas fa-exclamation-triangle text-yellow-500"></i>
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {{ $t("settings.clearExistingData") }}
                  </label>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ $t("settings.clearExistingDataDesc") }}
                  </p>
                </div>
              </div>
              <input
                v-model="clearExistingData"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <!-- 文件选择区域 -->
          <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center"
          >
            <div v-if="!selectedFile" class="space-y-2">
              <i class="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ $t("settings.clickToSelectOrDrag") }}
              </p>
              <button
                @click="selectFile"
                class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {{ $t("settings.selectJsonFile") }}
              </button>
            </div>
            <div v-else class="space-y-2">
              <i class="fas fa-file-code text-xl text-blue-500"></i>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatFileSize(selectedFile.size) }}
              </p>
              <button
                @click="clearSelectedFile"
                class="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                {{ $t("settings.reselect") }}
              </button>
            </div>
          </div>

          <!-- 导入按钮 -->
          <button
            @click="executeImport"
            :disabled="isImporting || !selectedFile"
            class="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <i
              class="fas fa-file-import"
              :class="{ 'animate-spin': isImporting }"
            ></i>
            {{
              isImporting ? $t("settings.importing") : $t("settings.importData")
            }}
          </button>
        </div>
      </div>

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        @change="handleFileSelect"
        class="hidden"
      />
    </div>

    <!-- 剪贴板数据管理 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-4">
        <h3
          class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"
        >
          <i class="fas fa-clipboard text-purple-500"></i>
          {{ $t("settings.clipboardManagement") }}
        </h3>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{ $t("settings.clipboardManagementDesc") }}
      </p>

      <div class="space-y-4">
        <!-- 保留条数设置 -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t("settings.maxClipboardItems") }}
          </label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="localMaxClipboardItems"
              type="number"
              min="10"
              max="1000"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
              :placeholder="$t('settings.maxClipboardItemsPlaceholder')"
            />
            <button
              @click="saveClipboardSettings"
              :disabled="clipboardSettings.loading.value"
              class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              <i
                class="fas fa-save"
                :class="{ 'animate-spin': clipboardSettings.loading.value }"
              ></i>
              {{ $t("settings.save") }}
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t("settings.maxClipboardItemsDesc") }}
          </p>
        </div>

        <!-- 清空剪贴板数据 -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t("settings.clearClipboardData") }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ $t("settings.clearClipboardDataDesc") }}
              </p>
            </div>
            <button
              @click="clearClipboardData"
              :disabled="isClearingClipboard"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              <i
                class="fas fa-trash"
                :class="{ 'animate-spin': isClearingClipboard }"
              ></i>
              {{ $t("settings.clearClipboard") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { invoke } from "@tauri-apps/api/core";
import { save, confirm } from "@tauri-apps/plugin-dialog";
import { snippetApi, initDatabase, clipboardApi } from "../services/tauri";
import { toast } from "../composables/useToast";
import { useClipboardSettings } from "../composables/useClipboardSettings";

const { t } = useI18n();

// 响应式数据
const isExporting = ref(false);
const isImporting = ref(false);
const clearExistingData = ref(false);
const snippetsCount = ref(0);
const clipboardCount = ref(0);
const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const isClearingClipboard = ref(false);
const localMaxClipboardItems = ref(100);

// 使用剪贴板设置
const clipboardSettings = useClipboardSettings();

// 导出代码片段
const exportSnippets = async () => {
  isExporting.value = true;
  try {
    // 确保数据库已初始化
    await initDatabase();

    // 直接从前端数据库获取所有代码片段
    const snippets = await snippetApi.getAll();

    if (snippets.length === 0) {
      toast.warning(t("settings.noSnippetsToExport"));
      return;
    }

    // 导出时排除 id 字段，避免导入时出现 ID 冲突
    const snippetsForExport = snippets.map(
      ({ id, created_at, updated_at, ...snippet }) => snippet
    );
    const jsonData = JSON.stringify(snippetsForExport, null, 2);

    // 使用 Tauri 的文件对话框保存文件
    const fileName = `seekcode-snippets-${
      new Date().toISOString().split("T")[0]
    }.json`;

    try {
      const filePath = await save({
        defaultPath: fileName,
        filters: [
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
      });

      if (filePath) {
        // 使用 Tauri 的 invoke 写入文件
        await invoke("write_text_file", {
          path: filePath,
          contents: jsonData,
        });
        toast.success(t("settings.exportSnippetsSuccess"));
      }
    } catch (error) {
      console.error("Tauri file save failed, trying browser download:", error);

      // 回退到浏览器下载
      const blob = new Blob([jsonData], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("settings.exportSnippetsSuccess"));
    }
  } catch (error) {
    console.error("Failed to export snippets:", error);
    toast.error(
      t("settings.exportFailed") +
        ": " +
        (error instanceof Error ? error.message : String(error))
    );
  } finally {
    isExporting.value = false;
  }
};

// 选择文件
const selectFile = () => {
  fileInput.value?.click();
};

// 清空选中的文件
const clearSelectedFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 执行导入操作
const executeImport = async () => {
  if (!selectedFile.value) return;
  await performImport(selectedFile.value, fileInput.value!);
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 设置选中的文件
  selectedFile.value = file;
};

// 执行导入操作
const performImport = async (file: File, target: HTMLInputElement) => {
  isImporting.value = true;
  try {
    // 确保数据库已初始化
    await initDatabase();

    const text = await file.text();
    const snippets = JSON.parse(text);

    // 如果需要清空现有数据，先弹出确认对话框
    if (clearExistingData.value) {
      // 获取现有代码片段数量用于显示
      const existingSnippets = await snippetApi.getAll();
      const existingCount = existingSnippets.length;

      const confirmed = await confirm(
        `${t("settings.confirmClearExistingData")}\n\n${t(
          "settings.confirmClearExistingDataDesc",
          { count: existingCount }
        )}\n\n${t("settings.importFileContains", { count: snippets.length })}`,
        {
          title: t("settings.confirmClearExistingDataTitle"),
          kind: "warning",
        }
      );

      if (!confirmed) {
        return;
      }

      // 删除所有现有代码片段
      for (const snippet of existingSnippets) {
        if (snippet.id) {
          await snippetApi.delete(snippet.id);
        }
      }

      toast.success(
        t("settings.clearedExistingSnippets", { count: existingCount })
      );
    }

    // 导入新的代码片段，只使用必要的字段
    toast.info(t("settings.importingSnippets", { count: snippets.length }));

    for (const snippet of snippets) {
      await snippetApi.create({
        title: snippet.title || "",
        language: snippet.language || "text",
        code: snippet.code || "",
        tags: snippet.tags || [],
      });
    }

    // 重新加载数据统计
    await loadDataStatistics();

    // 显示成功通知
    if (clearExistingData.value) {
      toast.success(
        t("settings.dataReplacementComplete", { count: snippets.length })
      );
    } else {
      toast.success(
        t("settings.importSnippetsSuccess", { count: snippets.length })
      );
    }

    // 清空文件输入
    target.value = "";
  } catch (error) {
    console.error("Failed to import data:", error);
    toast.error(
      t("settings.importFailed") +
        ": " +
        (error instanceof Error ? error.message : String(error))
    );
  } finally {
    isImporting.value = false;
  }
};

// 加载数据统计
const loadDataStatistics = async () => {
  try {
    // 确保数据库已初始化
    await initDatabase();
    // 直接从前端数据库获取代码片段数量
    const snippets = await snippetApi.getAll();
    snippetsCount.value = snippets.length;

    // 获取剪贴板数据数量
    const clipboardItems = await clipboardApi.getCount();
    clipboardCount.value = clipboardItems;
  } catch (error) {
    console.error("Failed to load data statistics:", error);
    toast.error(t("settings.loadDataStatisticsFailed"));
  }
};

// 保存剪贴板设置
const saveClipboardSettings = async () => {
  await clipboardSettings.saveClipboardSettings(localMaxClipboardItems.value);
};

// 清空剪贴板数据
const clearClipboardData = async () => {
  // 使用 Tauri 的确认对话框
  const confirmed = await confirm(
    "确定要清空所有剪贴板数据吗？此操作不可恢复。",
    {
      title: "清空剪贴板数据",
      kind: "warning",
    }
  );

  // 如果用户取消，直接返回，不执行任何操作
  if (!confirmed) {
    return;
  }

  // 用户确认后，开始清空操作
  isClearingClipboard.value = true;
  try {
    // 清空剪贴板数据
    await clipboardApi.clear();
    toast.success(t("settings.clipboardDataCleared"));
    // 重新加载数据统计
    await loadDataStatistics();
  } catch (error) {
    console.error("Failed to clear clipboard data:", error);
    toast.error(t("settings.clearClipboardDataFailed"));
  } finally {
    isClearingClipboard.value = false;
  }
};

// 组件挂载时加载数据统计和设置
onMounted(async () => {
  await loadDataStatistics();
  await clipboardSettings.initializeClipboardSettings();
  localMaxClipboardItems.value = clipboardSettings.maxClipboardItems.value;
});
</script>
