<template>
  <div
    v-if="settingsState.isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="closeSettings"
  >
    <div
      class="w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex"
    >
      <!-- 左侧导航 -->
      <div
        class="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <i class="fas fa-cog text-blue-500"></i>
            {{ $t("settings.title") }}
          </h2>
        </div>

        <nav class="flex-1 p-4">
          <ul class="space-y-2">
            <li>
              <button
                @click="setActiveTab('general')"
                :class="[
                  'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3',
                  settingsState.activeTab === 'general'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                ]"
              >
                <i class="fas fa-cogs text-lg"></i>
                <span class="font-medium">{{ $t("settings.general") }}</span>
              </button>
            </li>
            <li>
              <button
                @click="setActiveTab('appearance')"
                :class="[
                  'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3',
                  settingsState.activeTab === 'appearance'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                ]"
              >
                <i class="fas fa-palette text-lg"></i>
                <span class="font-medium">{{ $t("settings.appearance") }}</span>
              </button>
            </li>

            <li>
              <button
                @click="setActiveTab('mcpServer')"
                :class="[
                  'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3',
                  settingsState.activeTab === 'mcpServer'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                ]"
              >
                <i class="fas fa-server text-lg"></i>
                <span class="font-medium">{{ $t("settings.mcp") }}</span>
              </button>
            </li>

            <li>
              <button
                @click="setActiveTab('about')"
                :class="[
                  'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3',
                  settingsState.activeTab === 'about'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                ]"
              >
                <i class="fas fa-info-circle text-lg"></i>
                <span class="font-medium">{{ $t("settings.about") }}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- 右侧内容 -->
      <div class="flex-1 flex flex-col">
        <!-- 标题栏 -->
        <div
          class="p-8 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{
              settingsState.activeTab === "general"
                ? $t("settings.general")
                : settingsState.activeTab === "appearance"
                ? $t("settings.appearance")
                : settingsState.activeTab === "mcpServer"
                ? $t("settings.mcp")
                : $t("settings.about")
            }}
          </h3>
          <button
            @click="closeSettings"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 p-8 overflow-y-auto scroll-smooth">
          <!-- 通用设置 -->
          <GeneralSettings v-if="settingsState.activeTab === 'general'" />

          <!-- 外观设置 -->
          <ThemeSettings v-else-if="settingsState.activeTab === 'appearance'" />

          <!-- MCP 服务器管理 -->
          <McpServer v-else-if="settingsState.activeTab === 'mcpServer'" />

          <!-- 关于页面 -->
          <AboutPage v-else-if="settingsState.activeTab === 'about'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserSettings } from "../composables/useUserSettings";
import GeneralSettings from "./GeneralSettings.vue";
import ThemeSettings from "./ThemeSettings.vue";
import AboutPage from "./AboutPage.vue";
import McpServer from "./McpServer.vue";

const { settingsState, closeSettings, setActiveTab } = useUserSettings();
</script>
