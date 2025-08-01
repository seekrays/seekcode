<template>
  <div class="flex-1 overflow-y-auto scroll-smooth p-4 space-y-3">
    <div
      v-for="item in clipboardItems"
      :key="item.id"
      @click="$emit('select', item)"
      class="p-4 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-slate-200/60 dark:border-gray-600/60 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:border-slate-300/60 dark:hover:border-gray-500/60 hover:shadow-sm group"
      :class="{
        'ring-2 ring-blue-400/50 dark:ring-blue-500/50 bg-blue-50/80 dark:bg-blue-900/80 border-blue-300/60 dark:border-blue-600/60':
          selectedItem?.id === item.id,
      }"
    >
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1 mr-2 min-w-0">
          <p
            class="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 break-all overflow-hidden mb-3"
          >
            {{
              item.content.length > 120
                ? item.content.substring(0, 120) + "..."
                : item.content
            }}
          </p>
        </div>
      </div>
      <div
        class="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400"
      >
        <span>{{ formatTime(item.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClipboardItem } from "../types";
import { formatTime } from "../utils/time";

interface Props {
  clipboardItems: readonly ClipboardItem[];
  selectedItem: Readonly<ClipboardItem> | null;
}

defineProps<Props>();

defineEmits<{
  select: [item: ClipboardItem];
  copy: [content: string];
}>();
</script>
