<template>
  <div class="space-y-6">
    <div>
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {{ $t("settings.appearanceTitle") }}
      </h4>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {{ $t("settings.appearanceDesc") }}
      </p>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <!-- 跟随系统 -->
      <div
        @click="setTheme('system')"
        :class="[
          'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center',
          currentTheme === 'system'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
        ]"
      >
        <div class="flex flex-col items-center space-y-3">
          <div
            class="w-12 h-12 rounded-full bg-gradient-to-r from-gray-300 to-gray-700 flex items-center justify-center"
          >
            <i class="fas fa-desktop text-white text-lg"></i>
          </div>
          <div>
            <h5 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ $t("settings.followSystem") }}
            </h5>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t("settings.currentTheme") }}:
              {{
                systemTheme === "dark"
                  ? $t("settings.dark")
                  : $t("settings.light")
              }}
            </p>
          </div>
          <div
            :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              currentTheme === 'system'
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 dark:border-gray-600',
            ]"
          >
            <i
              v-if="currentTheme === 'system'"
              class="fas fa-check text-white text-xs"
            ></i>
          </div>
        </div>
      </div>

      <!-- 浅色主题 -->
      <div
        @click="setTheme('light')"
        :class="[
          'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center',
          currentTheme === 'light'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
        ]"
      >
        <div class="flex flex-col items-center space-y-3">
          <div
            class="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center"
          >
            <i class="fas fa-sun text-yellow-500 text-lg"></i>
          </div>
          <div>
            <h5 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ $t("settings.light") }}
            </h5>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t("settings.lightDesc") }}
            </p>
          </div>
          <div
            :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              currentTheme === 'light'
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 dark:border-gray-600',
            ]"
          >
            <i
              v-if="currentTheme === 'light'"
              class="fas fa-check text-white text-xs"
            ></i>
          </div>
        </div>
      </div>

      <!-- 深色主题 -->
      <div
        @click="setTheme('dark')"
        :class="[
          'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center',
          currentTheme === 'dark'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
        ]"
      >
        <div class="flex flex-col items-center space-y-3">
          <div
            class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <i class="fas fa-moon text-blue-400 text-lg"></i>
          </div>
          <div>
            <h5 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ $t("settings.dark") }}
            </h5>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t("settings.darkDesc") }}
            </p>
          </div>
          <div
            :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              currentTheme === 'dark'
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 dark:border-gray-600',
            ]"
          >
            <i
              v-if="currentTheme === 'dark'"
              class="fas fa-check text-white text-xs"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="mt-6">
      <h5 class="font-medium text-gray-900 dark:text-white mb-3">
        {{ $t("settings.previewTitle") }}
      </h5>
      <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600"
        >
          <div class="flex items-center gap-3 mb-2">
            <div
              class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <i class="fas fa-code text-white text-xs"></i>
            </div>
            <div>
              <h6 class="font-medium text-gray-900 dark:text-white text-sm">
                SeekCode
              </h6>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{ $t("settings.currentTheme") }}:
                {{
                  appliedTheme === "dark"
                    ? $t("settings.dark")
                    : $t("settings.light")
                }}
              </p>
            </div>
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            {{ $t("settings.previewDesc") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserSettings } from "../composables/useUserSettings";

const { currentTheme, systemTheme, appliedTheme, setTheme } = useUserSettings();
</script>
