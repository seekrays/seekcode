<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed top-4 right-4 z-50 max-w-sm">
      <Transition
        enter-active-class="transition-all duration-300 ease-out transform"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in transform"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-if="visible"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border',
            typeClasses[type],
          ]"
        >
          <div class="flex items-center space-x-2">
            <div class="flex-shrink-0">
              <component :is="iconComponent" class="w-5 h-5" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ message }}</p>
            </div>
            <button
              v-if="closable"
              @click="close"
              class="flex-shrink-0 ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  closable?: boolean;
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: "success",
  duration: 3000,
  closable: true,
});

const emit = defineEmits<{
  close: [];
}>();

const visible = ref(false);
let timer: NodeJS.Timeout | null = null;

const typeClasses = {
  success:
    "bg-green-50/95 dark:bg-green-900/95 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700",
  error:
    "bg-red-50/95 dark:bg-red-900/95 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700",
  warning:
    "bg-yellow-50/95 dark:bg-yellow-900/95 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700",
  info: "bg-blue-50/95 dark:bg-blue-900/95 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700",
};

const iconComponent = computed(() => {
  switch (props.type) {
    case "success":
      return {
        template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`,
      };
    case "error":
      return {
        template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>`,
      };
    case "warning":
      return {
        template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>`,
      };
    case "info":
      return {
        template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
      };
    default:
      return null;
  }
});

const show = () => {
  visible.value = true;

  if (props.duration > 0) {
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
};

const close = () => {
  visible.value = false;

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  setTimeout(() => {
    emit("close");
  }, 200);
};

onMounted(() => {
  show();
});

defineExpose({
  show,
  close,
});
</script>
