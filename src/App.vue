<template>
  <div
    class="h-screen flex flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-slate-800 dark:text-slate-200 relative"
  >
    <!-- 顶部工具栏 -->
    <header
      class="h-14 md:h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-slate-300/50 dark:border-gray-700/80 flex items-center px-4 md:px-6 gap-4 md:gap-6 shadow-sm dark:shadow-lg"
    >
      <div class="flex-none">
        <h1
          class="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2"
        >
          <i class="fas fa-code text-xl md:text-2xl"></i>
          <span class="hidden sm:inline">SeekCode</span>
        </h1>
      </div>
      <div class="flex-1 flex justify-center items-center gap-3">
        <div class="relative w-full max-w-md md:max-w-lg">
          <div
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-900 dark:text-slate-300 z-10 pointer-events-none"
          >
            <i class="fas fa-search w-4 h-4"></i>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('search.placeholder')"
            class="w-full pl-10 pr-3 py-2 md:py-2.5 border border-slate-300 dark:border-gray-600/80 rounded-lg text-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:shadow-sm transition-all duration-200 text-slate-700 dark:text-slate-100 placeholder-slate-500 dark:placeholder-gray-400"
          />
        </div>

        <!-- 标签筛选按钮 -->
        <div class="relative tags-dropdown-container">
          <button
            ref="tagsButton"
            @click="toggleTagsDropdown"
            class="flex items-center gap-2 px-3 py-2 md:py-2.5 bg-white/95 dark:bg-gray-800/95 border border-slate-300 dark:border-gray-600/80 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-gray-700/95 transition-all duration-200 backdrop-blur-sm"
            :class="{
              'bg-blue-50 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300':
                selectedTags.length > 0 || showTagsDropdown,
            }"
          >
            <i class="fas fa-tags"></i>
            <span class="hidden sm:inline">{{ $t("search.tags") }}</span>
            <span
              v-if="selectedTags.length > 0"
              class="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full"
            >
              {{ selectedTags.length }}
            </span>
            <i
              class="fas fa-chevron-down text-xs transition-transform duration-200"
              :class="{ 'rotate-180': showTagsDropdown }"
            ></i>
          </button>
        </div>
      </div>

      <!-- 设置按钮 -->
      <div class="flex-none">
        <button
          @click="handleOpenSettings"
          class="w-10 h-10 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-all duration-200 flex items-center justify-center group"
          :title="$t('settings.title')"
        >
          <i
            class="fas fa-cog text-lg group-hover:rotate-90 transition-transform duration-200"
          ></i>
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧边栏 -->
      <aside
        class="w-72 bg-slate-50/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-slate-300/50 dark:border-gray-600/50 flex flex-col overflow-hidden shadow-sm"
      >
        <!-- 标签页切换 -->
        <div
          class="flex border-b border-slate-300/50 dark:border-gray-600/50 bg-slate-100/60 dark:bg-gray-700/60"
        >
          <button
            @click="activeTab = 'snippets'"
            :class="[
              'flex-1 px-3 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 flex items-center justify-center gap-2',
              activeTab === 'snippets'
                ? 'text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-900/80'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/50',
            ]"
          >
            <i class="fas fa-file-code text-base"></i>
            {{ $t("nav.codeSnippets") }}
          </button>
          <button
            @click="activeTab = 'clipboard'"
            :class="[
              'flex-1 px-3 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 flex items-center justify-center gap-2',
              activeTab === 'clipboard'
                ? 'text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-900/80'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/50',
            ]"
          >
            <i class="fas fa-clipboard text-base"></i>
            {{ $t("nav.clipboardHistory") }}
          </button>
        </div>

        <!-- 代码片段选项卡 -->
        <CodeSnippetList
          v-if="activeTab === 'snippets'"
          :snippets="filteredSnippetsList"
          :selected-snippet="selectedSnippet"
          :selected-language="selectedLanguage"
          @select="selectSnippet"
          @show-context-menu="showContextMenu"
          @update-language="selectedLanguage = $event"
          @clear-language="selectedLanguage = ''"
        />

        <!-- 剪贴板历史选项卡 -->
        <ClipboardHistory
          v-show="activeTab === 'clipboard'"
          :clipboard-items="filteredClipboardList"
          :selected-item="selectedClipboardItem"
          @select="selectClipboardItemWrapper"
          @copy="copyClipboardContent"
        />
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- 代码片段主内容区域 -->
        <SnippetMainContent
          v-if="activeTab === 'snippets'"
          :selected-snippet="selectedSnippet"
          @update-snippet="updateSnippet"
          @update-snippet-tags="updateSnippetTags"
          @copy-content="copyToClipboard"
        />

        <!-- 剪贴板主内容区域 -->
        <ClipboardMainContent
          v-else
          :selected-clipboard-item="selectedClipboardItem"
          @copy-content="copyToClipboard"
          @save-as-snippet="saveClipboardAsSnippet"
        />
      </main>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-slate-200 dark:border-gray-600 rounded-lg shadow-lg py-2 min-w-48"
      @click.stop
    >
      <button
        @click="handleContextMenuCopy"
        class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-gray-700/80 flex items-center gap-2"
      >
        <i class="fas fa-copy text-blue-500 dark:text-blue-400"></i>
        {{ $t("snippet.copyCode") }}
      </button>
      <hr class="my-1 border-slate-200 dark:border-gray-600" />
      <button
        @click="
          contextMenu.snippet && deleteSnippetFromMenu(contextMenu.snippet)
        "
        class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/80 flex items-center gap-2"
      >
        <i class="fas fa-trash text-red-500 dark:text-red-400"></i>
        {{ $t("snippet.deleteSnippet") }}
      </button>
    </div>

    <!-- 点击空白处关闭菜单 -->
    <div
      v-if="contextMenu.show"
      @click="hideContextMenu"
      class="fixed inset-0 z-40"
    ></div>

    <!-- 悬浮新建按钮 -->
    <button
      v-if="activeTab === 'snippets'"
      @click="startCreating"
      class="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl font-semibold z-10 group"
      :title="$t('snippet.newSnippet')"
    >
      <i
        class="fas fa-plus group-hover:scale-110 transition-transform duration-200"
      ></i>
    </button>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="fixed top-4 right-4 bg-red-50 dark:bg-red-900/80 border border-red-200 dark:border-red-700 rounded-lg p-4 shadow-lg z-50 max-w-md"
    >
      <div class="flex items-start gap-3">
        <i
          class="fas fa-exclamation-triangle text-red-500 dark:text-red-400 mt-0.5"
        ></i>
        <div class="flex-1">
          <h4 class="font-medium text-red-800 dark:text-red-200 mb-1">
            {{ $t("ui.errorLabel") }}
          </h4>
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
        <button
          @click="clearError"
          class="text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100 transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <SettingsModal />

    <!-- 更新弹窗 -->
    <UpdateDialog
      :visible="updateDialogVisible"
      :update="updateObj"
      :loading="updateLoading"
      :progress="updateProgress"
      @close="closeUpdateDialog"
      @update="handleUpdate"
    />

    <!-- 标签下拉面板 - 使用 Teleport 到 body -->
    <Teleport to="body">
      <div
        v-if="showTagsDropdown"
        class="fixed w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-slate-200 dark:border-gray-600 rounded-lg shadow-lg z-[99999] max-h-96 overflow-y-auto tags-dropdown-container"
        :style="dropdownStyle"
      >
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">
              {{ $t("ui.selectTags") }}
            </h3>
            <div class="flex items-center gap-2">
              <span
                v-if="selectedTags.length > 0"
                class="text-xs text-slate-500 dark:text-slate-400"
              >
                {{ $t("ui.selectedCount") }} {{ selectedTags.length }}
                {{ $t("ui.items") }}
              </span>
              <button
                v-if="selectedTags.length > 0"
                @click="clearTagsFilter"
                class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                {{ $t("ui.clearAll") }}
              </button>
            </div>
          </div>

          <div v-if="availableTags.length === 0" class="text-center py-8">
            <div class="text-slate-400 dark:text-slate-500 mb-2">
              <i class="fas fa-tags text-2xl"></i>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ $t("ui.noTags") }}
            </p>
          </div>

          <!-- 标签云 -->
          <div v-else class="flex flex-wrap gap-2">
            <button
              v-for="tag in availableTags"
              :key="tag"
              @click="toggleTag(tag)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              :class="{
                'bg-blue-500 text-white shadow-md hover:bg-blue-600':
                  selectedTags.includes(tag),
                'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600 border border-slate-200 dark:border-gray-600':
                  !selectedTags.includes(tag),
              }"
            >
              <i
                :class="{
                  'fas fa-check text-xs': selectedTags.includes(tag),
                  'fas fa-tag text-xs': !selectedTags.includes(tag),
                }"
              ></i>
              <span>{{ tag }}</span>
            </button>
          </div>

          <!-- 已选标签概览 -->
          <div
            v-if="selectedTags.length > 0"
            class="mt-4 pt-3 border-t border-slate-200 dark:border-gray-600"
          >
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">
              已选择的标签:
            </p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in selectedTags"
                :key="tag"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded text-xs"
              >
                {{ tag }}
                <button
                  @click="toggleTag(tag)"
                  class="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors duration-200"
                >
                  <i class="fas fa-times text-xs"></i>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { invoke } from "@tauri-apps/api/core";
import type {
  ContextMenuState,
  TabType,
  CodeSnippet,
  ClipboardItem,
} from "./types";
import { useSnippets } from "./composables/useSnippets";
import { useClipboard } from "./composables/useClipboard";
import { useUserSettings } from "./composables/useUserSettings";
import { useAppUpdater } from "./composables/useAppUpdater";
import { useSettingsDatabase } from "./composables/useSettingsDatabase";

import CodeSnippetList from "./components/CodeSnippetList.vue";
import ClipboardHistory from "./components/ClipboardHistory.vue";
import SnippetMainContent from "./components/SnippetMainContent.vue";
import ClipboardMainContent from "./components/ClipboardMainContent.vue";
import SettingsModal from "./components/SettingsModal.vue";
import UpdateDialog from "./components/UpdateDialog.vue";

// 页面状态
const activeTab = ref<TabType>("snippets");
const selectedLanguage = ref<string>("");
const searchQuery = ref<string>("");
const selectedTags = ref<string[]>([]);
const showTagsDropdown = ref<boolean>(false);
const tagsButton = ref<HTMLElement | null>(null);

// 右键菜单状态
const contextMenu = ref<ContextMenuState>({
  show: false,
  x: 0,
  y: 0,
  snippet: null,
});

// 更新相关状态
const {
  checkForUpdates,
  updateDialogVisible,
  updateObj,
  updateLoading,
  updateProgress,
  closeUpdateDialog,
  handleUpdate,
} = useAppUpdater();

// 使用 composables
const {
  snippets,
  selectedSnippet,
  error: snippetsError,
  availableTags,
  initializeSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  selectSnippet,
  clearError: clearSnippetsError,
} = useSnippets();

const {
  clipboardItems,
  selectedClipboardItem,
  error: clipboardError,
  initializeClipboard,
  addClipboardItem,
  selectClipboardItem,
  copyToSystemClipboard,
  startClipboardMonitoring,
  stopClipboardMonitoring,
  clearError: clearClipboardError,
} = useClipboard();

const { openSettings, initializeUserSettings } = useUserSettings();
const { getSetting } = useSettingsDatabase();

// 检查并自动启动MCP服务器
const checkAndStartMcpServer = async () => {
  try {
    // 获取MCP配置
    const configStr = await getSetting("mcp_server");
    if (configStr) {
      const config = JSON.parse(configStr);
      // 兼容旧版本的配置格式
      if (config.enabled !== undefined) {
        config.autoStart = config.enabled;
        delete config.enabled;
      }

      // 如果启用了自动启动，则启动MCP服务器
      if (config.autoStart) {
        const result = await invoke("start_mcp_server_command", {
          host: config.host || "127.0.0.1",
          port: config.port || 9800,
          allow_query:
            config.allow_query !== undefined ? config.allow_query : true,
          allow_create:
            config.allow_create !== undefined ? config.allow_create : true,
          allow_update:
            config.allow_update !== undefined ? config.allow_update : false,
          allow_delete:
            config.allow_delete !== undefined ? config.allow_delete : false,
        });
        console.log("MCP Server auto-started:", result);
      }
    }
  } catch (error) {
    console.error("Failed to auto-start MCP Server:", error);
  }
};

// 计算属性
const error = computed(() => snippetsError.value || clipboardError.value);

// 标签下拉菜单位置计算
const dropdownStyle = computed(() => {
  if (!tagsButton.value || !showTagsDropdown.value) {
    return {};
  }

  const rect = tagsButton.value.getBoundingClientRect();
  return {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
  };
});

// 过滤后的数据
const filteredSnippetsList = computed(() => {
  let filtered = snippets.value;

  // 按搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query) ||
        s.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  // 按语言过滤
  if (selectedLanguage.value) {
    filtered = filtered.filter((s) => s.language === selectedLanguage.value);
  }

  // 按标签过滤
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter((s) =>
      selectedTags.value.every((tag) =>
        s.tags.some((snippetTag) => snippetTag === tag)
      )
    );
  }

  return filtered;
});

const filteredClipboardList = computed(() => {
  if (!searchQuery.value) {
    return clipboardItems.value;
  }

  const query = searchQuery.value.toLowerCase();
  return clipboardItems.value.filter((item) =>
    item.content.toLowerCase().includes(query)
  );
});

// 方法
const selectClipboardItemWrapper = (item: ClipboardItem | null) => {
  selectClipboardItem(item);
};

const showContextMenu = (event: MouseEvent, snippet: CodeSnippet) => {
  event.preventDefault();
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    snippet,
  };
};

const hideContextMenu = () => {
  contextMenu.value.show = false;
};

const startCreating = async () => {
  try {
    // 立即创建一个空的代码片段
    const newSnippetData = {
      title: "",
      language: "text",
      code: "",
      tags: [],
    };

    const snippet = await createSnippet(newSnippetData);
    if (snippet) {
      // 直接进入编辑模式
      selectSnippet(snippet);
    }
  } catch (error) {
    console.error("Failed to create new snippet:", error);
  }
};

const updateSnippetTags = (tags: string[]) => {
  if (selectedSnippet.value && selectedSnippet.value.id) {
    updateSnippet(selectedSnippet.value.id, {
      tags: tags as readonly string[],
    });
  }
};

const handleContextMenuCopy = async () => {
  if (!contextMenu.value.snippet) return;

  try {
    // 使用统一的剪贴板 API 复制代码
    await copyToClipboard(contextMenu.value.snippet.code);
    hideContextMenu();
  } catch (error) {
    console.error("Failed to copy snippet code:", error);
  }
};

const deleteSnippetFromMenu = async (snippet: CodeSnippet) => {
  if (!snippet.id) return;

  try {
    await deleteSnippet(snippet.id);
    hideContextMenu();
  } catch (error) {
    console.error("Failed to delete snippet:", error);
  }
};

const copyToClipboard = async (content: string) => {
  try {
    const success = await copyToSystemClipboard(content);
    if (success) {
      // 添加到剪贴板历史
      await addClipboardItem(content);
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
  }
};

const copyClipboardContent = async (content: string) => {
  await copyToClipboard(content);
};

const saveClipboardAsSnippet = async (content: string) => {
  try {
    const { detectLanguage } = await import("./utils/language");
    const detectedLanguage = detectLanguage(content);

    // 创建代码片段
    const snippet = await createSnippet({
      title: `剪贴板内容 - ${new Date().toLocaleString()}`,
      language: detectedLanguage,
      code: content,
      tags: [],
    });

    if (snippet) {
      // 切换到代码片段选项卡并选中新创建的片段
      activeTab.value = "snippets";
      selectSnippet(snippet);
    }
  } catch (error) {
    console.error("Failed to save clipboard content as snippet:", error);
  }
};

const clearError = () => {
  clearSnippetsError();
  clearClipboardError();
};

const handleOpenSettings = () => {
  openSettings();
};

// 标签筛选相关方法
const toggleTagsDropdown = async () => {
  showTagsDropdown.value = !showTagsDropdown.value;

  if (showTagsDropdown.value) {
    // 等待 DOM 更新后再重新计算位置
    await nextTick();
  }
};

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
};

const clearTagsFilter = () => {
  selectedTags.value = [];
};

const closeTagsDropdown = () => {
  showTagsDropdown.value = false;
};

// 点击外部隐藏右键菜单
watch(
  () => contextMenu.value.show,
  (show) => {
    if (show) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest(".context-menu")) {
          hideContextMenu();
          document.removeEventListener("click", handleClickOutside);
        }
      };
      document.addEventListener("click", handleClickOutside);
    }
  }
);

// 点击外部隐藏标签下拉框
watch(
  () => showTagsDropdown.value,
  (show) => {
    if (show) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest(".tags-dropdown-container")) {
          closeTagsDropdown();
          document.removeEventListener("click", handleClickOutside);
        }
      };
      document.addEventListener("click", handleClickOutside);
    }
  }
);

// 组件挂载时初始化数据
onMounted(async () => {
  try {
    // 首先初始化用户设置（包括主题），确保界面主题正确显示
    await initializeUserSettings();
    // 然后初始化其他功能
    await Promise.all([initializeSnippets(), initializeClipboard()]);
    // 启动剪贴板监听
    await startClipboardMonitoring();
    // 检查更新
    await checkForUpdates();

    // 检查并自动启动MCP服务器
    await checkAndStartMcpServer();
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
});

// 组件卸载时清理
onUnmounted(async () => {
  try {
    await stopClipboardMonitoring();
  } catch (error) {
    console.error("Failed to cleanup:", error);
  }
});
</script>
