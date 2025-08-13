<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- 语言过滤器 -->
    <div class="p-4 border-b border-slate-300/50 dark:border-gray-600/50">
      <div class="flex items-center justify-between mb-3">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">{{
          $t("snippet.languageFilter")
        }}</label>
        <button
          v-if="selectedLanguage"
          @click="$emit('clearLanguage')"
          class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          {{ $t("common.clear") }}
        </button>
      </div>
      <div class="relative">
        <select
          :value="selectedLanguage"
          @change="
            $emit('updateLanguage', ($event.target as HTMLSelectElement).value)
          "
          class="w-full pl-3 pr-8 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm appearance-none cursor-pointer transition-all duration-200 text-slate-700 dark:text-slate-200"
        >
          <option value="">{{ $t("snippet.allLanguages") }}</option>
          <option v-for="lang in languages" :key="lang" :value="lang">
            {{ lang }}
          </option>
        </select>
        <i
          class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 w-3 h-3 pointer-events-none"
        ></i>
      </div>
    </div>

    <!-- 代码片段列表 -->
    <div class="flex-1 overflow-y-auto scroll-smooth p-4 space-y-3">
      <div
        v-for="snippet in snippets"
        :key="snippet.id"
        @click="$emit('select', snippet)"
        @contextmenu="$emit('showContextMenu', $event, snippet)"
        class="p-4 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-slate-200/60 dark:border-gray-600/60 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:border-slate-300/60 dark:hover:border-gray-500/60 hover:shadow-sm group"
        :class="{
          'ring-2 ring-blue-400/50 dark:ring-blue-500/50 bg-blue-50/80 dark:bg-blue-900/80 border-blue-300/60 dark:border-blue-600/60':
            selectedSnippet?.id === snippet.id,
        }"
      >
        <!-- 标题行 -->
        <div class="flex items-center justify-between mb-3">
          <!-- 标题 -->
          <h3
            class="font-medium text-slate-800 dark:text-slate-200 truncate flex-1"
            :class="{
              'text-slate-500 dark:text-slate-400 italic':
                !snippet.title.trim(),
            }"
          >
            {{ snippet.title.trim() || $t("snippet.noTitle") }}
          </h3>

          <!-- 语言标签 -->
          <span
            class="text-xs px-2.5 py-1 bg-slate-200/80 dark:bg-gray-600/80 rounded-full text-slate-600 dark:text-slate-300 flex items-center gap-1 flex-shrink-0 font-medium"
          >
            {{ snippet.language }}
          </span>
        </div>

        <!-- 标签和时间行 -->
        <div class="flex items-center justify-between text-xs">
          <!-- 标签区域 -->
          <div class="flex flex-wrap gap-1 flex-1 min-w-0 mr-3">
            <!-- 无内容标记 -->
            <span
              v-if="!snippet.code.trim()"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0"
              :title="$t('ui.noContent')"
            >
              <i class="fas fa-exclamation-triangle text-xs mr-1"></i>
              {{ $t("ui.noContent") }}
            </span>
            <span
              v-for="tag in snippet.tags.slice(0, 3)"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 max-w-20 truncate"
              :title="tag"
            >
              {{ tag }}
            </span>
            <span
              v-if="snippet.tags.length > 3"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 flex-shrink-0"
              :title="$t('tags.moreTags', { count: snippet.tags.length - 3 })"
            >
              +{{ snippet.tags.length - 3 }}
            </span>
          </div>

          <!-- 更新时间 -->
          <div
            class="flex items-center gap-1 text-slate-500 dark:text-slate-400 flex-shrink-0"
          >
            <i class="fas fa-clock text-xs"></i>
            <span>{{
              formatTime(
                snippet.updated_at ||
                  snippet.created_at ||
                  new Date().toISOString()
              )
            }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div
        v-if="snippets.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <div
          class="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4"
        >
          <i class="fas fa-code text-2xl text-slate-400 dark:text-gray-500"></i>
        </div>
        <h3 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
          {{ $t("snippet.noSnippets") }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          {{ $t("snippet.createInstructions") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CodeSnippet } from "../types";
import { languages } from "../utils/language";
import { formatTime } from "../utils/time";

interface Props {
  snippets: readonly CodeSnippet[];
  selectedSnippet: Readonly<CodeSnippet> | null;
  selectedLanguage: string;
}

defineProps<Props>();

defineEmits<{
  select: [snippet: CodeSnippet];
  showContextMenu: [event: MouseEvent, snippet: CodeSnippet];
  updateLanguage: [language: string];
  clearLanguage: [];
}>();
</script>
