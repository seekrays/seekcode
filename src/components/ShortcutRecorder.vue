<template>
  <div class="relative">
    <div
      class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg transition-all duration-200"
      :class="[
        recording
          ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50'
          : 'border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @click="startRecording"
    >
      <div class="flex-1 flex items-center flex-wrap gap-1.5 min-h-[1.5rem]">
        <template v-if="modelValue">
          <span
            v-for="(part, index) in displayParts"
            :key="index"
            class="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
          >
            {{ part }}
          </span>
        </template>
        <span
          v-else
          class="text-sm text-slate-400 dark:text-slate-500 italic"
        >
          {{
            recording
              ? $t("settings.shortcut.pressKeys")
              : $t("settings.shortcut.clickToRecord")
          }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          v-if="modelValue && !recording && !disabled"
          @click.stop="clearShortcut"
          class="p-1 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-lg transition-colors"
          :title="$t('settings.shortcut.clear')"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <!-- 提示信息 -->
    <p v-if="error" class="mt-1.5 text-xs text-red-500 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { type } from "@tauri-apps/plugin-os";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const recording = ref(false);
const error = ref("");
const osType = ref(type());

// 键位映射
const KEY_MAP: Record<string, string> = {
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  " ": "Space",
};

// 显示符号映射
const DISPLAY_MAP_MAC: Record<string, string> = {
  Command: "⌘",
  Control: "⌃",
  Alt: "⌥",
  Shift: "⇧",
  Enter: "↩",
  Backspace: "⌫",
  Delete: "⌦",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
};

const DISPLAY_MAP_WIN: Record<string, string> = {
  Command: "Win",
  Control: "Ctrl",
  Alt: "Alt",
  Shift: "Shift",
};

const displayParts = computed(() => {
  if (!props.modelValue) return [];
  
  const parts = props.modelValue.split("+");
  const isMac = osType.value === "macos";
  const map = isMac ? DISPLAY_MAP_MAC : DISPLAY_MAP_WIN;
  
  return parts.map(p => {
    // 替换 CommandOrControl
    if (p === "CommandOrControl") {
      return isMac ? "⌘" : "Ctrl";
    }
    // 替换其他修饰键
    return map[p] || p;
  });
});

const startRecording = () => {
  if (props.disabled || recording.value) return;
  
  recording.value = true;
  error.value = "";
  
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", stopRecording);
};

const stopRecording = () => {
  recording.value = false;
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  window.removeEventListener("blur", stopRecording);
};

const clearShortcut = () => {
  emit("update:modelValue", "");
  emit("change", "");
};

const handleKeyDown = (e: KeyboardEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  // 如果是单独的修饰键，不保存
  if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
    return;
  }
  
  const modifiers = [];
  if (e.metaKey) modifiers.push("Command"); // Tauri 使用 Command 代表 Meta
  if (e.ctrlKey) modifiers.push("Control");
  if (e.altKey) modifiers.push("Alt");
  if (e.shiftKey) modifiers.push("Shift");
  
  // 智能替换 CommandOrControl
  const isMac = osType.value === "macos";
  const hasCtrl = modifiers.includes("Control");
  const hasMeta = modifiers.includes("Command");
  
  // 移除原始修饰键，准备重组
  let finalModifiers = modifiers.filter(m => m !== "Control" && m !== "Command");
  
  if (isMac) {
    if (hasMeta) finalModifiers.push("CommandOrControl");
    if (hasCtrl) finalModifiers.push("Control"); // Mac 上 Control 真的是 Control
  } else {
    // Windows/Linux
    if (hasCtrl) finalModifiers.push("CommandOrControl");
    if (hasMeta) finalModifiers.push("Super"); // Win 键
  }
  
  // 规范化主键
  let key = KEY_MAP[e.key] || e.key.toUpperCase();
  
  // 如果没有修饰键，或者是指是修饰键本身，则忽略
  if (finalModifiers.length === 0 && ["SHIFT", "CONTROL", "ALT", "META"].includes(key)) {
    return;
  }
  
  // 构建快捷键字符串
  // Tauri 格式: Modifier1+Modifier2+Key
  const shortcut = [...finalModifiers, key].join("+");
  
  emit("update:modelValue", shortcut);
  emit("change", shortcut);
  stopRecording();
};

const handleKeyUp = (e: KeyboardEvent) => {
  // 如果松开了所有键但还没录制到有效快捷键，不做处理，等待主键
  // 逻辑已包含在 keydown 中，这里主要用于防止事件冒泡
  e.preventDefault();
  e.stopPropagation();
};

onBeforeUnmount(() => {
  stopRecording();
});
</script>
