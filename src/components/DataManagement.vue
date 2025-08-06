<template>
  <div class="space-y-6">
    <!-- 数据导出 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-4">
        <h3
          class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"
        >
          <i class="fas fa-download text-green-500"></i>
          {{ $t("settings.exportData") }}
        </h3>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{ $t("settings.exportDataDesc") }}
      </p>

      <div class="space-y-3">
        <button
          @click="exportSnippets"
          :disabled="isExporting"
          class="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <i class="fas fa-code" :class="{ 'animate-spin': isExporting }"></i>
          {{
            isExporting
              ? $t("settings.exporting")
              : $t("settings.exportSnippets")
          }}
        </button>
      </div>
    </div>

    <!-- 数据导入 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-4">
        <h3
          class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"
        >
          <i class="fas fa-upload text-blue-500"></i>
          {{ $t("settings.importData") }}
        </h3>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{ $t("settings.importDataDesc") }}
      </p>

      <!-- 清空已有数据选项 -->
      <div
        class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
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
            class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div class="space-y-3">
        <button
          @click="importData"
          :disabled="isImporting"
          class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
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

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        @change="handleFileSelect"
        class="hidden"
      />
    </div>

    <!-- 数据统计 -->
    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {{ $t("settings.dataStatistics") }}
      </h4>
      <div class="flex items-center justify-between">
        <span class="text-gray-600 dark:text-gray-400">{{
          $t("settings.snippetsCount")
        }}</span>
        <span class="font-medium text-gray-900 dark:text-white">{{
          snippetsCount
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { snippetApi, initDatabase } from "../services/tauri";

const { t } = useI18n();

// 响应式数据
const isExporting = ref(false);
const isImporting = ref(false);
const clearExistingData = ref(false);
const snippetsCount = ref(0);
const fileInput = ref<HTMLInputElement>();

// 导出代码片段
const exportSnippets = async () => {
  isExporting.value = true;
  try {
    console.log("开始导出代码片段...");

    // 确保数据库已初始化
    await initDatabase();
    console.log("数据库已初始化");

    // 直接从前端数据库获取所有代码片段
    const snippets = await snippetApi.getAll();
    console.log("获取到代码片段数量:", snippets.length);

    if (snippets.length === 0) {
      console.log("没有代码片段可导出");
      alert("没有代码片段可导出");
      return;
    }

    const jsonData = JSON.stringify(snippets, null, 2);
    console.log("JSON数据长度:", jsonData.length);

    // 使用 Tauri 的文件对话框保存文件
    const fileName = `seekcode-snippets-${
      new Date().toISOString().split("T")[0]
    }.json`;
    console.log("准备保存文件:", fileName);

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
        console.log("文件已保存到:", filePath);
      } else {
        console.log("用户取消了文件保存");
      }
    } catch (error) {
      console.error("Tauri 文件保存失败，尝试浏览器下载:", error);

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
      console.log("使用浏览器下载完成");
    }

    console.log("导出完成");
  } catch (error) {
    console.error("Failed to export snippets:", error);
    alert("导出失败: " + error);
  } finally {
    isExporting.value = false;
  }
};

// 导入数据
const importData = () => {
  fileInput.value?.click();
};

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isImporting.value = true;
  try {
    // 确保数据库已初始化
    await initDatabase();

    const text = await file.text();
    const snippets = JSON.parse(text);

    // 如果需要清空现有数据
    if (clearExistingData.value) {
      // 获取所有现有代码片段并删除
      const existingSnippets = await snippetApi.getAll();
      for (const snippet of existingSnippets) {
        if (snippet.id) {
          await snippetApi.delete(snippet.id);
        }
      }
    }

    // 导入新的代码片段
    for (const snippet of snippets) {
      await snippetApi.create({
        title: snippet.title,
        language: snippet.language,
        code: snippet.code,
        tags: snippet.tags,
      });
    }

    // 重新加载数据统计
    await loadDataStatistics();

    // 清空文件输入
    target.value = "";
  } catch (error) {
    console.error("Failed to import data:", error);
  } finally {
    isImporting.value = false;
  }
};

// 加载数据统计
const loadDataStatistics = async () => {
  try {
    console.log("开始加载数据统计...");

    // 确保数据库已初始化
    await initDatabase();
    console.log("数据库已初始化");

    // 直接从前端数据库获取代码片段数量
    const snippets = await snippetApi.getAll();
    console.log("获取到代码片段:", snippets);
    snippetsCount.value = snippets.length;
    console.log("代码片段数量:", snippetsCount.value);
  } catch (error) {
    console.error("Failed to load data statistics:", error);
  }
};

// 组件挂载时加载数据统计
onMounted(() => {
  loadDataStatistics();
});
</script>
