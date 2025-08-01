<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm text-center"
    >
      <h3 class="text-lg font-bold mb-4">发现新版本</h3>
      <div v-if="!loading">
        <p class="mb-2" v-if="update && update.version">
          新版本：{{ update.version }}
        </p>
        <p class="mb-6" v-if="update && update.body">
          更新内容：{{ update.body }}
        </p>
        <p class="mb-6" v-else>检测到新版本，是否立即更新？</p>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded mr-2"
          @click="$emit('update')"
        >
          立即更新
        </button>
        <button
          class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
          @click="$emit('close')"
        >
          取消
        </button>
      </div>
      <div v-else>
        <p class="mb-2">正在下载更新...</p>
        <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            class="bg-blue-600 h-2 rounded-full"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <p v-if="progress > 0">{{ Math.round(progress) }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  visible: Boolean,
  update: { type: Object, default: null },
  loading: Boolean,
  progress: { type: Number, default: 0 },
});

const emit = defineEmits(["close", "update"]);
</script>
