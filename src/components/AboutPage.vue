<template>
  <div class="space-y-8">
    <!-- 应用信息 -->
    <div class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <img
          src="/icon.png"
          alt="SeekCode"
          class="w-full h-full object-contain rounded-2xl"
        />
      </div>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        SeekCode
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ $t("settings.appSubtitle") }}
      </p>
      <div class="flex items-center justify-center gap-2">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
        >
          <i class="fas fa-tag"></i>
          {{ $t("settings.version") }} {{ appVersion }}
        </div>
        <!-- 更新按钮 -->
        <button
          @click="checkForUpdates"
          :disabled="isChecking"
          class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors duration-200"
        >
          <i class="fas fa-sync" :class="{ 'animate-spin': isChecking }"></i>
          <span>{{
            isChecking ? $t("common.loading") : $t("settings.checkUpdate")
          }}</span>
        </button>
      </div>
    </div>

    <!-- 链接和联系方式 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <!-- 官网 -->
      <a
        href="https://seekrays.com/seekcode"
        target="_blank"
        class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200"
      >
        <div
          class="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <i class="fas fa-globe text-blue-600 dark:text-blue-400"></i>
        </div>
        <div>
          <h5 class="font-medium text-gray-900 dark:text-white">
            {{ $t("settings.website") }}
          </h5>
        </div>
      </a>

      <!-- 反馈 -->
      <a
        href="https://seekrays.com/seekcode/redirect?t=feedback"
        target="_blank"
        class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200"
      >
        <div
          class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <i
            class="fas fa-comment-dots text-yellow-600 dark:text-yellow-400"
          ></i>
        </div>
        <div>
          <h5 class="font-medium text-gray-900 dark:text-white">
            {{ $t("settings.feedback") }}
          </h5>
        </div>
      </a>

      <!-- 联系我们 -->
      <a
        href="https://seekrays.com/seekcode/redirect?t=email"
        target="_blank"
        class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200"
      >
        <div
          class="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <i class="fas fa-envelope text-green-600 dark:text-green-400"></i>
        </div>
        <div>
          <h5 class="font-medium text-gray-900 dark:text-white">
            {{ $t("settings.contact") }}
          </h5>
        </div>
      </a>
    </div>

    <!-- 功能特性 -->
    <div>
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {{ $t("settings.mainFeatures") }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div
            class="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-code text-green-600 dark:text-green-400"></i>
          </div>
          <div>
            <h5 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ $t("settings.codeManagement") }}
            </h5>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t("settings.codeManagementDesc") }}
            </p>
          </div>
        </div>

        <div
          class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div
            class="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-clipboard text-blue-600 dark:text-blue-400"></i>
          </div>
          <div>
            <h5 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ $t("settings.clipboardManagement") }}
            </h5>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t("settings.clipboardManagementDesc") }}
            </p>
          </div>
        </div>

        <div
          class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div
            class="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-search text-purple-600 dark:text-purple-400"></i>
          </div>
          <div>
            <h5 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ $t("search.title") }}
            </h5>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t("search.description") }}
            </p>
          </div>
        </div>

        <div
          class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div
            class="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-palette text-orange-600 dark:text-orange-400"></i>
          </div>
          <div>
            <h5 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ $t("settings.themeFeature") }}
            </h5>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t("settings.themeFeatureDesc") }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 版权信息 -->
    <div
      class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-600"
    >
      <p>&copy; 2025 SeekCode. {{ $t("settings.copyright") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getVersion } from "@tauri-apps/api/app";
import { useAppUpdater } from "../composables/useAppUpdater";

const appVersion = ref("");
const { isChecking, checkForUpdates } = useAppUpdater();

onMounted(async () => {
  try {
    appVersion.value = await getVersion();
  } catch {}
});
</script>
