<template>
  <div class="code-editor-wrapper" :data-theme="props.theme">
    <div ref="editorContainer" class="code-editor"></div>
    <!-- 状态栏：显示行列信息 -->
    <div class="status-bar">
      <div class="status-info">
        {{ $t("ui.line") }} {{ cursorLine }}，{{ $t("ui.column") }}
        {{ cursorColumn }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from "vue";
import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { lineNumbers, keymap } from "@codemirror/view";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";

// 语言支持
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { vue } from "@codemirror/lang-vue";
import { php } from "@codemirror/lang-php";
import { java } from "@codemirror/lang-java";
import { go } from "@codemirror/lang-go";
import { sql } from "@codemirror/lang-sql";
import { markdown } from "@codemirror/lang-markdown";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { cpp } from "@codemirror/lang-cpp";

// Legacy modes for additional languages
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { kotlin } from "@codemirror/legacy-modes/mode/clike";
import { csharp } from "@codemirror/legacy-modes/mode/clike";

interface Props {
  modelValue: string;
  language?: string;
  placeholder?: string;
  readonly?: boolean;
  theme?: "light" | "dark";
  enableAutocompletion?: boolean;
  enableBracketMatching?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  language: "javascript",
  placeholder: "",
  readonly: false,
  theme: "dark", // 默认使用暗色主题
  enableAutocompletion: true,
  enableBracketMatching: true,
});

const emit = defineEmits<Emits>();

const editorContainer = ref<HTMLElement>();
let editorView: EditorView | null = null;
let languageCompartment = new Compartment();
let themeCompartment = new Compartment();

// 光标位置状态
const cursorLine = ref(1);
const cursorColumn = ref(1);

// 语言映射
const languageMap: Record<string, any> = {
  // Web 技术
  javascript: javascript({ jsx: true }),
  typescript: javascript({ typescript: true, jsx: true }),
  html: html(),
  css: css(),
  vue: vue(),
  json: json(),
  xml: xml(),
  yaml: yaml(),

  // 后端语言
  python: python(),
  java: java(),
  go: go(),
  rust: rust(),
  php: php(),
  cpp: cpp(),
  c: cpp(), // C 语言使用 C++ 的语法高亮
  csharp: StreamLanguage.define(csharp),

  // 数据库
  sql: sql(),

  // 移动开发
  swift: StreamLanguage.define(swift),
  kotlin: StreamLanguage.define(kotlin),

  // 脚本和配置
  shell: StreamLanguage.define(shell),
  bash: StreamLanguage.define(shell),

  // 文档
  markdown: markdown(),

  // 默认语言
  text: [],
  plain: [],
};

// 获取语言扩展
const getLanguageExtension = (lang: string) => {
  const normalizedLang = lang.toLowerCase();
  return languageMap[normalizedLang] || languageMap.text;
};

// 创建编辑器
const createEditor = () => {
  if (!editorContainer.value) return;

  const extensions = [
    basicSetup,
    lineNumbers(), // 显示行号
    languageCompartment.of(getLanguageExtension(props.language)),
    themeCompartment.of(props.theme === "dark" ? oneDark : []),

    // 键盘快捷键
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      indentWithTab,
    ]),

    // 编辑器功能
    EditorView.lineWrapping, // 自动换行
    highlightSelectionMatches(), // 高亮选中的匹配项

    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString();
        if (newValue !== props.modelValue) {
          emit("update:modelValue", newValue);
        }
      }

      // 更新光标位置
      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        cursorLine.value = line.number;
        cursorColumn.value = pos - line.from + 1;
      }
    }),

    // 自定义主题样式
    EditorView.theme({
      "&": {
        fontSize: "14px",
        fontFamily:
          "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, 'Ubuntu Mono', monospace",
        height: "100%",
        fontWeight: "400",
      },
      ".cm-content": {
        padding: "16px 8px 16px 4px",
        minHeight: "320px",
        lineHeight: "1.6",
        caretColor: props.theme === "dark" ? "#3b82f6" : "#3b82f6",
      },
      ".cm-editor": {
        borderRadius: "0",
        border:
          props.theme === "dark" ? "1px solid #374151" : "1px solid #e2e8f0",
        overflow: "hidden",
        backgroundColor: props.theme === "dark" ? "#0f172a" : "#ffffff",
        fontFeatureSettings: '"liga" 1, "calt" 1',
      },
      ".cm-editor.cm-focused": {
        outline: "none",
        borderColor: "#3b82f6",
        boxShadow:
          props.theme === "dark"
            ? "0 0 0 1px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)"
            : "0 0 0 1px rgba(59, 130, 246, 0.2)",
      },
      ".cm-scroller": {
        fontFamily: "inherit",
      },
      ".cm-placeholder": {
        color: props.theme === "dark" ? "#64748b" : "#94a3b8",
        fontStyle: "italic",
      },

      // 行号样式
      ".cm-lineNumbers": {
        fontSize: "13px",
        color: props.theme === "dark" ? "#64748b" : "#94a3b8",
        backgroundColor: props.theme === "dark" ? "#020617" : "#f8fafc",
        borderRight:
          props.theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
        paddingRight: "6px",
        paddingLeft: "8px",
        minWidth: "36px",
      },
      ".cm-lineNumbers .cm-lineNumber": {
        padding: "0 1px 0 0",
        minWidth: "24px",
        textAlign: "right",
      },
      ".cm-gutters": {
        backgroundColor: props.theme === "dark" ? "#020617" : "#f8fafc",
        border: "none",
      },

      // 活动行样式
      ".cm-activeLine": {
        backgroundColor:
          props.theme === "dark"
            ? "rgba(59, 130, 246, 0.08)"
            : "rgba(59, 130, 246, 0.05)",
      },
      ".cm-activeLineGutter": {
        backgroundColor:
          props.theme === "dark"
            ? "rgba(59, 130, 246, 0.12)"
            : "rgba(59, 130, 246, 0.08)",
        color: props.theme === "dark" ? "#3b82f6" : "#3b82f6",
        fontWeight: "500",
      },

      // 选择样式
      ".cm-selectionBackground": {
        backgroundColor:
          props.theme === "dark"
            ? "rgba(59, 130, 246, 0.25)"
            : "rgba(59, 130, 246, 0.15)",
      },
      ".cm-cursor": {
        borderLeftColor: "#3b82f6",
        borderLeftWidth: "2px",
      },

      // 括号匹配
      ".cm-matchingBracket": {
        backgroundColor:
          props.theme === "dark"
            ? "rgba(34, 197, 94, 0.2)"
            : "rgba(34, 197, 94, 0.1)",
        outline:
          props.theme === "dark"
            ? "1px solid rgba(34, 197, 94, 0.4)"
            : "1px solid rgba(34, 197, 94, 0.3)",
      },
      ".cm-nonmatchingBracket": {
        backgroundColor:
          props.theme === "dark"
            ? "rgba(239, 68, 68, 0.2)"
            : "rgba(239, 68, 68, 0.1)",
        outline:
          props.theme === "dark"
            ? "1px solid rgba(239, 68, 68, 0.4)"
            : "1px solid rgba(239, 68, 68, 0.3)",
      },

      // 搜索高亮
      ".cm-searchMatch": {
        backgroundColor:
          props.theme === "dark"
            ? "rgba(251, 191, 36, 0.3)"
            : "rgba(251, 191, 36, 0.2)",
        outline: "1px solid rgba(251, 191, 36, 0.6)",
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor:
          props.theme === "dark"
            ? "rgba(251, 191, 36, 0.5)"
            : "rgba(251, 191, 36, 0.3)",
      },

      // 自动补全样式
      ".cm-completionLabel": {
        fontSize: "13px",
      },
      ".cm-completionDetail": {
        fontSize: "12px",
        color: props.theme === "dark" ? "#64748b" : "#6b7280",
      },
    }),
  ];

  // 可选功能
  if (props.enableAutocompletion) {
    extensions.push(autocompletion());
  }

  if (props.enableBracketMatching) {
    extensions.push(bracketMatching());
    extensions.push(closeBrackets());
  }

  // 只读模式
  if (props.readonly) {
    extensions.push(EditorState.readOnly.of(true));
  }

  const startState = EditorState.create({
    doc: props.modelValue,
    extensions,
  });

  editorView = new EditorView({
    state: startState,
    parent: editorContainer.value,
  });
};

// 更新编辑器内容
const updateContent = (newValue: string) => {
  if (editorView && editorView.state.doc.toString() !== newValue) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newValue,
      },
    });
  }
};

// 更新语言
const updateLanguage = (newLanguage: string) => {
  if (!editorView) return;

  const languageExtension = getLanguageExtension(newLanguage);

  editorView.dispatch({
    effects: languageCompartment.reconfigure(languageExtension),
  });
};

// 更新主题
const updateTheme = (newTheme: "light" | "dark") => {
  if (!editorView) return;

  editorView.dispatch({
    effects: themeCompartment.reconfigure(newTheme === "dark" ? oneDark : []),
  });
};

// 监听属性变化
watch(() => props.modelValue, updateContent);
watch(() => props.language, updateLanguage);
watch(() => props.theme, updateTheme);

// 组件挂载
onMounted(() => {
  createEditor();
});

// 组件卸载
onUnmounted(() => {
  if (editorView) {
    editorView.destroy();
  }
});

// 暴露编辑器实例（如果需要的话）
defineExpose({
  editorView,
  focus: () => editorView?.focus(),
  getSelection: () => editorView?.state.selection,
  insertText: (text: string) => {
    if (editorView) {
      const { from } = editorView.state.selection.main;
      editorView.dispatch({
        changes: { from, insert: text },
        selection: { anchor: from + text.length },
      });
      editorView.focus();
    }
  },
  getLineCount: () => editorView?.state.doc.lines || 0,
});
</script>

<style scoped>
.code-editor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.code-editor {
  width: 100%;
  flex: 1;
  border-radius: 0;
  overflow: hidden;
  background: #0f172a;
  position: relative;
}

.status-bar {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  font-size: 11px;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas,
    "Ubuntu Mono", monospace;
  backdrop-filter: blur(4px);
  user-select: none;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* 暗色主题状态栏 */
.code-editor-wrapper[data-theme="dark"] .status-bar {
  background: rgba(30, 41, 59, 0.95);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  color: #64748b;
}

/* 浅色主题状态栏 */
.code-editor-wrapper[data-theme="light"] .status-bar {
  background: rgba(248, 250, 252, 0.95);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  color: #64748b;
}

.status-info {
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* 确保编辑器字体渲染清晰 */
.code-editor :deep(.cm-editor) {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 滚动条样式 */
.code-editor :deep(.cm-scroller::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

.code-editor :deep(.cm-scroller::-webkit-scrollbar-track) {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0;
}

.code-editor :deep(.cm-scroller::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0;
  transition: background 0.2s ease;
}

.code-editor :deep(.cm-scroller::-webkit-scrollbar-thumb:hover) {
  background: rgba(255, 255, 255, 0.3);
}

/* 自动补全面板样式 */
.code-editor :deep(.cm-completionListIncompleteTop:before),
.code-editor :deep(.cm-completionListIncompleteBottom:after) {
  content: "⋯";
  opacity: 0.5;
  display: block;
  text-align: center;
}

/* 错误和警告样式 */
.code-editor :deep(.cm-diagnostic-error) {
  border-left: 3px solid #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.code-editor :deep(.cm-diagnostic-warning) {
  border-left: 3px solid #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}
</style>
