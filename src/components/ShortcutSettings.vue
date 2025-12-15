<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium text-slate-900 dark:text-slate-100">
        {{ $t("settings.shortcut.title") }}
      </h3>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ $t("settings.shortcut.description") }}
      </p>
    </div>

    <!-- 快捷键录制 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
      <div class="p-4 sm:p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span class="inline-flex items-center gap-2">
              <i class="fas fa-desktop text-blue-500"></i>
              {{ $t("settings.shortcut.globalSection") }}
            </span>
          </label>
          <div class="ml-1 mb-2 text-xs text-slate-500 dark:text-slate-400">
            {{ $t("settings.shortcut.globalDescription") }}
          </div>
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 mt-3">
             {{ $t("settings.shortcut.toggleWindow") }}
          </label>
          <ShortcutRecorder
            :model-value="globalShortcut"
            :disabled="loading"
            @change="handleShortcutChange"
          />
          <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {{ $t("settings.shortcut.toggleWindowHint") }}
          </p>

          <div class="border-t border-slate-200 dark:border-gray-700 my-4"></div>

          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span class="inline-flex items-center gap-2">
              <i class="fas fa-window-maximize text-green-500"></i>
              {{ $t("settings.shortcut.appSection") }}
            </span>
          </label>
          <div class="ml-1 mb-2 text-xs text-slate-500 dark:text-slate-400">
            {{ $t("settings.shortcut.appDescription") }}
          </div>

          <div class="space-y-4">
             <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                   {{ $t("settings.shortcut.focusSearch") }}
                </label>
                <ShortcutRecorder
                  :model-value="localSearchShortcut"
                  :disabled="loading"
                  @change="handleLocalSearchChange"
                />
             </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ $t("ui.errorLabel") }}
              </h3>
              <div class="mt-1 text-sm text-red-700 dark:text-red-300">
                {{ error }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <i class="fas fa-spinner fa-spin"></i>
          <span>{{ $t("ui.saving") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useShortcutSettings } from "../composables/useShortcutSettings";
import ShortcutRecorder from "./ShortcutRecorder.vue";

const {
  globalShortcut,
  localSearchShortcut,
  loading,
  error,
  saveShortcutSetting,
  saveLocalShortcut,
  initializeShortcutSettings,
  clearError
} = useShortcutSettings();

const handleShortcutChange = async (shortcut: string) => {
  clearError();
  await saveShortcutSetting(shortcut);
};

const handleLocalSearchChange = async (shortcut: string) => {
  clearError();
  await saveLocalShortcut("local_shortcut_search", shortcut);
};

onMounted(() => {
  initializeShortcutSettings();
});
</script>
