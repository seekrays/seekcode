import { ref, computed, readonly } from "vue";
import type { CodeSnippet } from "../types";
import { snippetApi, initDatabase } from "../services/tauri";

const snippets = ref<CodeSnippet[]>([]);
const selectedSnippet = ref<CodeSnippet | null>(null);
const error = ref<string | null>(null);

// 计算属性
const totalSnippets = computed(() => snippets.value.length);
const languages = computed(() => {
  const languageSet = new Set(snippets.value.map((s) => s.language));
  return Array.from(languageSet).sort();
});

// 新增：可用标签计算属性
const availableTags = computed(() => {
  const tagSet = new Set<string>();
  snippets.value.forEach((snippet) => {
    snippet.tags.forEach((tag) => {
      if (tag.trim()) {
        tagSet.add(tag.trim());
      }
    });
  });
  return Array.from(tagSet).sort();
});

export function useSnippets() {
  // 初始化数据库和代码片段
  const initializeSnippets = async () => {
    error.value = null;

    try {
      // 确保数据库已初始化
      await initDatabase();

      // 获取所有代码片段
      snippets.value = await snippetApi.getAll();
    } catch (err) {
      console.error("Failed to initialize snippets:", err);
      error.value = err instanceof Error ? err.message : "初始化代码片段失败";
    }
  };

  // 创建代码片段
  const createSnippet = async (
    snippet: Omit<CodeSnippet, "id" | "created_at" | "updated_at">
  ) => {
    error.value = null;

    try {
      const newSnippet = await snippetApi.create({
        title: snippet.title,
        language: snippet.language,
        code: snippet.code,
        tags: snippet.tags,
      });

      // 将新代码片段添加到列表开头
      snippets.value.unshift(newSnippet);

      return newSnippet;
    } catch (err) {
      console.error("Failed to create snippet:", err);
      error.value = err instanceof Error ? err.message : "创建代码片段失败";
      throw err;
    }
  };

  // 更新代码片段
  const updateSnippet = async (id: number, updates: Partial<CodeSnippet>) => {
    // 不设置loading状态，避免输入时的loading提示
    error.value = null;

    try {
      await snippetApi.update(id, {
        title: updates.title,
        language: updates.language,
        code: updates.code,
        tags: updates.tags,
      });

      // 更新本地列表
      const index = snippets.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        // 重新获取更新后的片段
        const updatedSnippet = await snippetApi.getById(id);
        if (updatedSnippet) {
          snippets.value[index] = updatedSnippet;

          // 如果当前选中的是被更新的片段，也更新选中状态
          if (selectedSnippet.value?.id === id) {
            selectedSnippet.value = updatedSnippet;
          }
        }
      }
    } catch (err) {
      console.error("Failed to update snippet:", err);
      error.value = err instanceof Error ? err.message : "更新代码片段失败";
      throw err;
    }
    // 不设置loading为false，因为没有设置为true
  };

  // 删除代码片段
  const deleteSnippet = async (id: number) => {
    error.value = null;

    try {
      await snippetApi.delete(id);

      // 从本地列表中移除
      snippets.value = snippets.value.filter((s) => s.id !== id);

      // 如果删除的是当前选中的片段，清除选中状态
      if (selectedSnippet.value?.id === id) {
        selectedSnippet.value = null;
      }
    } catch (err) {
      console.error("Failed to delete snippet:", err);
      error.value = err instanceof Error ? err.message : "删除代码片段失败";
      throw err;
    }
  };

  // 搜索代码片段
  const searchSnippets = async (query: string) => {
    if (!query.trim()) {
      await initializeSnippets();
      return;
    }

    // 不设置loading状态，避免搜索时的loading提示
    error.value = null;

    try {
      snippets.value = await snippetApi.search(query);
    } catch (err) {
      console.error("Failed to search snippets:", err);
      error.value = err instanceof Error ? err.message : "搜索代码片段失败";
    }
    // 搜索操作不需要loading提示
  };

  // 根据语言过滤
  const filterByLanguage = async (language: string) => {
    if (!language) {
      await initializeSnippets();
      return;
    }

    // 不设置loading状态，避免过滤时的loading提示
    error.value = null;

    try {
      snippets.value = await snippetApi.getByLanguage(language);
    } catch (err) {
      console.error("Failed to filter snippets by language:", err);
      error.value = err instanceof Error ? err.message : "按语言过滤失败";
    }
    // 过滤操作不需要loading提示
  };

  // 新增：根据标签过滤
  const filterByTags = async (tags: string[]) => {
    if (!tags.length) {
      await initializeSnippets();
      return;
    }

    error.value = null;

    try {
      snippets.value = await snippetApi.getByTags(tags);
    } catch (err) {
      console.error("Failed to filter snippets by tags:", err);
      error.value = err instanceof Error ? err.message : "按标签过滤失败";
    }
  };

  // 新增：获取所有标签
  const getAllTags = async (): Promise<string[]> => {
    try {
      return await snippetApi.getAllTags();
    } catch (err) {
      console.error("Failed to get all tags:", err);
      error.value = err instanceof Error ? err.message : "获取标签列表失败";
      return [];
    }
  };

  // 选择代码片段
  const selectSnippet = (snippet: CodeSnippet | null) => {
    selectedSnippet.value = snippet;
  };

  // 获取单个代码片段
  const getSnippetById = async (id: number): Promise<CodeSnippet | null> => {
    try {
      return await snippetApi.getById(id);
    } catch (err) {
      console.error("Failed to get snippet by id:", err);
      error.value = err instanceof Error ? err.message : "获取代码片段失败";
      return null;
    }
  };

  // 复制代码到剪贴板
  const copySnippetCode = async (snippet: CodeSnippet) => {
    const { copyText } = await import("../utils/clipboard");
    return await copyText(snippet.code);
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  // 刷新数据
  const refresh = async () => {
    await initializeSnippets();
  };

  return {
    // 状态
    snippets: readonly(snippets),
    selectedSnippet: readonly(selectedSnippet),
    error: readonly(error),

    // 计算属性
    totalSnippets,
    languages,
    availableTags,

    // 方法
    initializeSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    searchSnippets,
    filterByLanguage,
    filterByTags,
    getAllTags,
    selectSnippet,
    getSnippetById,
    copySnippetCode,
    clearError,
    refresh,
  };
}
