<template>
  <div
    class="flex-1 overflow-y-auto scroll-smooth bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
  >
    <!-- 剪贴板内容详情 -->
    <div
      v-if="selectedClipboardItem"
      class="flex-1 p-6 overflow-y-auto scroll-smooth"
    >
      <!-- 剪贴板信息 -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ formatTime(selectedClipboardItem.created_at) }}
            </span>
          </div>
          <div class="flex gap-2">
            <button
              @click="$emit('copyContent', selectedClipboardItem.content)"
              class="px-3 py-1.5 border border-slate-400 dark:border-gray-600 rounded-lg text-xs hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300"
            >
              <i class="fas fa-copy"></i> {{ $t("snippet.copy") }}
            </button>
            <button
              @click="$emit('saveAsSnippet', selectedClipboardItem.content)"
              class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs transition-all duration-200 flex items-center gap-1.5 font-medium"
            >
              <i class="fas fa-code"></i> {{ $t("snippet.storeAsSnippet") }}
            </button>
          </div>
        </div>
      </div>

      <!-- 剪贴板内容区域 -->
      <div
        class="border border-slate-300/60 dark:border-gray-600/60 rounded-xl overflow-hidden shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
      >
        <CodeEditor
          :model-value="selectedClipboardItem.content"
          :language="detectLanguage(selectedClipboardItem.content)"
          :readonly="true"
          :placeholder="$t('clipboard.placeholder')"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="text-slate-400 dark:text-slate-500 mb-4">
          <i class="fas fa-clipboard text-6xl"></i>
        </div>
        <h3 class="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          {{ $t("clipboard.selectItem") }}
        </h3>
        <p class="text-slate-500 dark:text-slate-500">
          {{ $t("clipboard.viewHistory") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClipboardItem } from "../types";
import { formatTime } from "../utils/time";
import CodeEditor from "./CodeEditor.vue";

interface Props {
  selectedClipboardItem: ClipboardItem | null;
}

defineProps<Props>();

defineEmits<{
  copyContent: [content: string];
  saveAsSnippet: [content: string];
}>();

import { detectLanguage } from "../utils/language";
</script>
