<template>
  <div class="h-full flex flex-col">
    <!-- 查看/编辑片段界面 -->
    <div
      v-if="selectedSnippet"
      class="flex-1 p-6 overflow-y-auto scroll-smooth"
    >
      <!-- 代码区域 -->
      <div
        class="border border-slate-300/60 dark:border-gray-600/60 rounded-xl overflow-hidden shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
      >
        <div
          class="bg-slate-100/90 dark:bg-gray-700/90 px-4 py-3 border-b border-slate-300/50 dark:border-gray-600/50 flex flex-col gap-3"
        >
          <!-- 标题区域 -->
          <div>
            <input
              :value="selectedSnippet.title"
              @input="
                selectedSnippet.id &&
                  $emit('updateSnippet', selectedSnippet.id, {
                    title: ($event.target as HTMLInputElement).value,
                  })
              "
              class="w-full text-lg font-semibold bg-transparent border-none focus:outline-none placeholder-slate-500 dark:placeholder-gray-400 text-slate-800 dark:text-slate-200"
              :placeholder="$t('snippet.titlePlaceholder')"
            />
          </div>

          <!-- 标签和操作区域 -->
          <div class="flex flex-wrap items-center gap-2 justify-between">
            <!-- 标签区域 -->
            <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              <!-- 现有标签badges -->
              <div
                v-for="(tag, index) in selectedSnippet.tags"
                :key="index"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-800/50 group"
              >
                <span>{{ tag }}</span>
                <button
                  @click="removeTag(index)"
                  class="w-3.5 h-3.5 rounded-full bg-blue-200 dark:bg-blue-800/50 hover:bg-blue-300 dark:hover:bg-blue-700/50 flex items-center justify-center transition-colors duration-200 group-hover:bg-blue-300 dark:group-hover:bg-blue-700/50"
                  title="删除标签"
                >
                  <i
                    class="fas fa-times text-blue-600 dark:text-blue-300 text-xs"
                  ></i>
                </button>
              </div>

              <!-- 添加标签输入 -->
              <div v-if="isAddingTag" class="inline-flex items-center gap-2">
                <input
                  ref="tagInput"
                  v-model="newTagInput"
                  @keydown="handleNewTagKeydown"
                  @blur="handleAddTagBlur"
                  type="text"
                  class="px-2.5 py-1 border border-blue-300 dark:border-blue-600 rounded-full text-xs bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50 dark:focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500 placeholder-slate-400 dark:placeholder-gray-500 text-slate-700 dark:text-slate-200 min-w-20"
                  placeholder="标签名"
                />
                <button
                  @click="addTag"
                  class="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors duration-200"
                  title="确认添加"
                >
                  <i class="fas fa-check text-white text-xs"></i>
                </button>
                <button
                  @click="cancelAddTag"
                  class="w-6 h-6 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center transition-colors duration-200"
                  title="取消"
                >
                  <i class="fas fa-times text-white text-xs"></i>
                </button>
              </div>

              <!-- 添加标签按钮 -->
              <button
                v-if="!isAddingTag"
                @click="startAddingTag"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-slate-400 dark:border-gray-500 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50"
              >
                <i class="fas fa-plus text-xs"></i>
                <span>{{ $t("snippet.addTag") }}</span>
              </button>
            </div>

            <!-- 操作按钮区域 -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- 语言选择 -->
              <div class="relative">
                <select
                  :value="selectedSnippet.language"
                  @change="
                    selectedSnippet.id &&
                      $emit('updateSnippet', selectedSnippet.id, {
                        language: ($event.target as HTMLSelectElement).value,
                      })
                  "
                  class="pl-3 pr-8 py-1.5 border border-slate-300 dark:border-gray-600 rounded-lg focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm appearance-none cursor-pointer transition-all duration-200 text-slate-700 dark:text-slate-200 text-sm"
                >
                  <option v-for="lang in languages" :key="lang" :value="lang">
                    {{ lang }}
                  </option>
                </select>
                <div
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
                >
                  <i
                    class="fas fa-chevron-down text-slate-400 dark:text-slate-500 text-xs"
                  ></i>
                </div>
              </div>
              <!-- 复制按钮 -->
              <button
                @click="$emit('copyContent', selectedSnippet.code)"
                class="px-3 py-1.5 border border-slate-400 dark:border-gray-600 rounded-lg text-xs hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300"
              >
                <i class="fas fa-copy"></i> {{ $t("snippet.copy") }}
              </button>
            </div>
          </div>
        </div>

        <!-- 代码编辑器 -->
        <div class="p-0">
          <CodeEditor
            :model-value="selectedSnippet.code"
            :language="selectedSnippet.language"
            @update:model-value="handleCodeUpdate"
            :placeholder="$t('snippet.codePlaceholder')"
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="text-slate-400 dark:text-slate-500 mb-4">
          <i class="fas fa-code text-6xl"></i>
        </div>
        <h3 class="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          {{ $t("snippet.selectSnippet") }}
        </h3>
        <p class="text-slate-500 dark:text-slate-500">
          {{ $t("snippet.createHint") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { CodeSnippet } from "../types";
import { languages } from "../utils/language";
import CodeEditor from "./CodeEditor.vue";

interface Props {
  selectedSnippet: Readonly<CodeSnippet> | null;
}

const props = defineProps<Props>();

// 标签管理状态
const isAddingTag = ref(false);
const newTagInput = ref("");
const tagInput = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  updateSnippet: [id: number, updates: Partial<CodeSnippet>];
  updateSnippetTags: [tags: string[]];
  copyContent: [content: string];
}>();

// 开始添加标签
const startAddingTag = async () => {
  isAddingTag.value = true;
  newTagInput.value = "";
  await nextTick();
  tagInput.value?.focus();
};

// 取消添加标签
const cancelAddTag = () => {
  isAddingTag.value = false;
  newTagInput.value = "";
};

// 添加标签
const addTag = () => {
  const tag = newTagInput.value.trim();
  if (tag && props.selectedSnippet) {
    const currentTags = [...props.selectedSnippet.tags];
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
      emit("updateSnippetTags", currentTags);
    }
  }
  cancelAddTag();
};

// 删除标签
const removeTag = (index: number) => {
  if (props.selectedSnippet) {
    const currentTags = [...props.selectedSnippet.tags];
    currentTags.splice(index, 1);
    emit("updateSnippetTags", currentTags);
  }
};

// 处理新标签输入键盘事件
const handleNewTagKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addTag();
  } else if (event.key === "Escape") {
    event.preventDefault();
    cancelAddTag();
  }
};

// 处理输入框失去焦点
const handleAddTagBlur = () => {
  // 延迟执行，给点击确认按钮留出时间
  setTimeout(() => {
    if (isAddingTag.value && !newTagInput.value.trim()) {
      cancelAddTag();
    }
  }, 150);
};

// 处理代码更新
const handleCodeUpdate = (code: string) => {
  if (props.selectedSnippet?.id) {
    emit("updateSnippet", props.selectedSnippet.id, { code });
  }
};
</script>
