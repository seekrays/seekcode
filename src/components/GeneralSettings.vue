<template>
  <div class="space-y-6">
    <!-- 开机启动设置 -->
    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center"
          >
            <i class="fas fa-rocket text-blue-600 dark:text-blue-400"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ $t("settings.autostart") }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t("settings.autostartDesc") }}
            </p>
          </div>
        </div>

        <!-- 开机启动开关 -->
        <div class="flex items-center">
          <button
            @click="handleToggleAutostart"
            :disabled="loading"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800',
              isAutostartEnabled
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700',
              loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                isAutostartEnabled ? 'translate-x-6' : 'translate-x-1',
              ]"
            />
          </button>
          <span
            class="ml-3 text-sm font-medium text-gray-900 dark:text-white"
            :class="{ 'opacity-50': loading }"
          >
            {{
              isAutostartEnabled
                ? $t("settings.enabled")
                : $t("settings.disabled")
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- 语言设置 -->
    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center"
          >
            <i class="fas fa-language text-green-600 dark:text-green-400"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ $t("settings.language") }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t("settings.languageDesc") }}
            </p>
          </div>
        </div>

        <!-- 语言选择下拉 -->
        <div class="flex items-center">
          <div class="flex-shrink-0 ml-4 relative">
            <select
              :value="currentLanguageSetting"
              @change="handleLanguageChange"
              :disabled="loading"
              class="min-w-32 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm appearance-none cursor-pointer transition-all duration-200 text-gray-700 dark:text-gray-200"
              :class="{ 'opacity-50 cursor-not-allowed': loading }"
            >
              <option
                v-for="option in LANGUAGE_OPTIONS"
                :key="option.code"
                :value="option.code"
              >
                {{ option.nativeName }}
              </option>
            </select>
            <i
              class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-3 h-3 pointer-events-none"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4"
    >
      <div class="flex items-start gap-3">
        <i class="fas fa-exclamation-triangle text-red-500 mt-0.5"></i>
        <div class="flex-1">
          <h4 class="font-medium text-red-800 dark:text-red-200 mb-1">
            {{ $t("settings.settingsError") }}
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useUserSettings } from "../composables/useUserSettings";
import type { SupportedLocale } from "../composables/useLanguage";

const {
  isAutostartEnabled,
  loading,
  error,
  toggleAutostart,
  initializeUserSettings,
  clearError,
  // 语言设置相关
  currentLanguageSetting,
  LANGUAGE_OPTIONS,
  setLanguage,
} = useUserSettings();

// 处理开机启动切换
const handleToggleAutostart = async () => {
  const success = await toggleAutostart();
  if (success) {
    console.log("开机启动状态已更新:", isAutostartEnabled.value);
  }
};

// 处理语言变更
const handleLanguageChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newLanguage = target.value as SupportedLocale;
  const success = await setLanguage(newLanguage);
  if (success) {
    console.log("语言设置已更新:", newLanguage);
  }
};

// 组件挂载时初始化设置
onMounted(async () => {
  await initializeUserSettings();
});
</script>
