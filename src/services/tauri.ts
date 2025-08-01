import Database from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";
import type { CodeSnippet, ClipboardItem } from "../types";

// 数据库实例
let db: Database | null = null;

// 初始化数据库连接
export async function initDatabase(): Promise<void> {
  try {
    if (!db) {
      db = await Database.load("sqlite:seekcode.db");
      console.log("Database initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// 获取数据库实例
export async function getDatabase(): Promise<Database> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

// ==================== 辅助函数 ====================

// 获取当前时间戳
export async function getCurrentTimestamp(): Promise<string> {
  try {
    return await invoke("get_current_timestamp");
  } catch (error) {
    console.error("Failed to get current timestamp:", error);
    // 回退到前端本地时间
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

// 解析 JSON 字符串
function parseJsonSafely<T>(jsonStr: string, fallback: T): T {
  try {
    return JSON.parse(jsonStr);
  } catch {
    return fallback;
  }
}

// ==================== 代码片段相关 API ====================

export interface CreateSnippetRequest {
  title: string;
  language: string;
  code: string;
  tags: readonly string[];
}

export interface UpdateSnippetRequest {
  title?: string;
  language?: string;
  code?: string;
  tags?: readonly string[];
}

// 代码片段 API
export const snippetApi = {
  // 创建代码片段
  async create(request: CreateSnippetRequest): Promise<CodeSnippet> {
    try {
      const database = await getDatabase();
      const timestamp = await getCurrentTimestamp();
      const tagsJson = JSON.stringify(request.tags);

      const result = await database.execute(
        "INSERT INTO code_snippets (title, language, code, tags, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          request.title,
          request.language,
          request.code,
          tagsJson,
          timestamp,
          timestamp,
        ]
      );

      return {
        id: result.lastInsertId!,
        title: request.title,
        language: request.language,
        code: request.code,
        tags: request.tags,
        created_at: timestamp,
        updated_at: timestamp,
      };
    } catch (error) {
      console.error("Failed to create snippet:", error);
      throw error;
    }
  },

  // 获取所有代码片段
  async getAll(): Promise<CodeSnippet[]> {
    try {
      const database = await getDatabase();
      const rows = await database.select<
        Array<{
          id: number;
          title: string;
          language: string;
          code: string;
          tags: string;
          created_at: string;
          updated_at: string;
        }>
      >("SELECT * FROM code_snippets ORDER BY created_at DESC");

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        language: row.language,
        code: row.code,
        tags: parseJsonSafely<string[]>(row.tags, []),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      console.error("Failed to get all snippets:", error);
      throw error;
    }
  },

  // 根据 ID 获取代码片段
  async getById(id: number): Promise<CodeSnippet | null> {
    try {
      const database = await getDatabase();
      const rows = await database.select<
        Array<{
          id: number;
          title: string;
          language: string;
          code: string;
          tags: string;
          created_at: string;
          updated_at: string;
        }>
      >("SELECT * FROM code_snippets WHERE id = $1", [id]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        language: row.language,
        code: row.code,
        tags: parseJsonSafely(row.tags, []),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    } catch (error) {
      console.error("Failed to get snippet by id:", error);
      throw error;
    }
  },

  // 更新代码片段
  async update(id: number, request: UpdateSnippetRequest): Promise<void> {
    try {
      const database = await getDatabase();
      const current = await this.getById(id);

      if (!current) {
        throw new Error("Snippet not found");
      }

      const title = request.title ?? current.title;
      const language = request.language ?? current.language;
      const code = request.code ?? current.code;
      const tags = request.tags ?? current.tags;
      const tagsJson = JSON.stringify(tags);
      const timestamp = await getCurrentTimestamp();

      await database.execute(
        "UPDATE code_snippets SET title = $1, language = $2, code = $3, tags = $4, updated_at = $5 WHERE id = $6",
        [title, language, code, tagsJson, timestamp, id]
      );
    } catch (error) {
      console.error("Failed to update snippet:", error);
      throw error;
    }
  },

  // 删除代码片段
  async delete(id: number): Promise<void> {
    try {
      const database = await getDatabase();
      await database.execute("DELETE FROM code_snippets WHERE id = $1", [id]);
    } catch (error) {
      console.error("Failed to delete snippet:", error);
      throw error;
    }
  },

  // 搜索代码片段
  async search(query: string): Promise<CodeSnippet[]> {
    try {
      const database = await getDatabase();
      const searchTerm = `%${query.toLowerCase()}%`;

      const rows = await database.select<
        Array<{
          id: number;
          title: string;
          language: string;
          code: string;
          tags: string;
          created_at: string;
          updated_at: string;
        }>
      >(
        `SELECT * FROM code_snippets 
         WHERE LOWER(title) LIKE $1 
            OR LOWER(code) LIKE $2 
            OR LOWER(tags) LIKE $3 
         ORDER BY created_at DESC`,
        [searchTerm, searchTerm, searchTerm]
      );

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        language: row.language,
        code: row.code,
        tags: parseJsonSafely(row.tags, []),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      console.error("Failed to search snippets:", error);
      throw error;
    }
  },

  // 根据语言获取代码片段
  async getByLanguage(language: string): Promise<CodeSnippet[]> {
    try {
      const database = await getDatabase();
      const rows = await database.select<
        Array<{
          id: number;
          title: string;
          language: string;
          code: string;
          tags: string;
          created_at: string;
          updated_at: string;
        }>
      >(
        "SELECT * FROM code_snippets WHERE language = $1 ORDER BY created_at DESC",
        [language]
      );

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        language: row.language,
        code: row.code,
        tags: parseJsonSafely(row.tags, []),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      console.error("Failed to get snippets by language:", error);
      throw error;
    }
  },

  // 获取所有唯一的标签
  async getAllTags(): Promise<string[]> {
    try {
      const database = await getDatabase();
      const rows = await database.select<
        Array<{
          tags: string;
        }>
      >("SELECT tags FROM code_snippets WHERE tags != '[]' AND tags != ''");

      const allTags = new Set<string>();
      rows.forEach((row) => {
        const tags = parseJsonSafely<string[]>(row.tags, []);
        tags.forEach((tag) => {
          if (tag.trim()) {
            allTags.add(tag.trim());
          }
        });
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error("Failed to get all tags:", error);
      throw error;
    }
  },

  // 根据标签获取代码片段
  async getByTags(tags: string[]): Promise<CodeSnippet[]> {
    try {
      const database = await getDatabase();

      // 构建查询条件，要求包含所有指定的标签
      const conditions = tags.map(() => "LOWER(tags) LIKE ?").join(" AND ");
      const searchTerms = tags.map((tag) => `%"${tag.toLowerCase()}"%`);

      const rows = await database.select<
        Array<{
          id: number;
          title: string;
          language: string;
          code: string;
          tags: string;
          created_at: string;
          updated_at: string;
        }>
      >(
        `SELECT * FROM code_snippets WHERE ${conditions} ORDER BY created_at DESC`,
        searchTerms
      );

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        language: row.language,
        code: row.code,
        tags: parseJsonSafely(row.tags, []),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      console.error("Failed to get snippets by tags:", error);
      throw error;
    }
  },
};

// ==================== 剪贴板相关 API ====================

// 剪贴板 API
export const clipboardApi = {
  // 添加剪贴板项
  async add(content: string): Promise<ClipboardItem> {
    try {
      const database = await getDatabase();
      const timestamp = await getCurrentTimestamp();

      const result = await database.execute(
        "INSERT INTO clipboard_items (content, created_at, updated_at) VALUES ($1, $2, $3)",
        [content, timestamp, timestamp]
      );

      // 限制剪贴板历史记录数量
      await database.execute(
        "DELETE FROM clipboard_items WHERE id NOT IN (SELECT id FROM clipboard_items ORDER BY created_at DESC LIMIT 100)"
      );

      return {
        id: result.lastInsertId!,
        content,
        created_at: timestamp,
        updated_at: timestamp,
      };
    } catch (error) {
      console.error("Failed to add clipboard item:", error);
      throw error;
    }
  },

  // 获取剪贴板历史
  async getHistory(limit: number = 100): Promise<ClipboardItem[]> {
    try {
      const database = await getDatabase();
      const rows = await database.select<
        Array<{
          id: number;
          content: string;
          created_at: string;
          updated_at: string;
        }>
      >("SELECT * FROM clipboard_items ORDER BY created_at DESC LIMIT $1", [
        limit,
      ]);

      return rows.map((row) => ({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      console.error("Failed to get clipboard history:", error);
      throw error;
    }
  },

  // 根据 ID 获取剪贴板项
  async getById(id: number): Promise<ClipboardItem | null> {
    try {
      const database = await getDatabase();
      const rows = await database.select<
        Array<{
          id: number;
          content: string;
          created_at: string;
          updated_at: string;
        }>
      >("SELECT * FROM clipboard_items WHERE id = $1", [id]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    } catch (error) {
      console.error("Failed to get clipboard item by id:", error);
      throw error;
    }
  },

  // 删除剪贴板项
  async delete(id: number): Promise<void> {
    try {
      const database = await getDatabase();
      await database.execute("DELETE FROM clipboard_items WHERE id = $1", [id]);
    } catch (error) {
      console.error("Failed to delete clipboard item:", error);
      throw error;
    }
  },

  // 清空剪贴板历史
  async clear(): Promise<void> {
    try {
      const database = await getDatabase();
      await database.execute("DELETE FROM clipboard_items");
    } catch (error) {
      console.error("Failed to clear clipboard history:", error);
      throw error;
    }
  },
};

// ==================== 直接数据库操作（高级用法） ====================

// 如果需要直接操作数据库，可以使用以下函数
export const directDbApi = {
  // 执行 SQL 语句
  async execute(sql: string, params?: any[]): Promise<any> {
    try {
      const database = await getDatabase();
      return await database.execute(sql, params);
    } catch (error) {
      console.error("Failed to execute SQL:", error);
      throw error;
    }
  },

  // 执行查询
  async select<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const database = await getDatabase();
      return await database.select<T[]>(sql, params);
    } catch (error) {
      console.error("Failed to select from database:", error);
      throw error;
    }
  },
};

// ==================== Tauri Clipboard Manager API ====================

// 使用 Tauri clipboard-manager 插件的 API
export const clipboardManagerApi = {
  // 读取系统剪贴板内容
  async readText(): Promise<string> {
    try {
      return await invoke("get_clipboard_content");
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      throw error;
    }
  },

  // 写入系统剪贴板内容
  async writeText(content: string): Promise<void> {
    try {
      await invoke("set_clipboard_content", { content });
    } catch (error) {
      console.error("Failed to write clipboard:", error);
      throw error;
    }
  },
};

// 导出主要 API
export default {
  snippet: snippetApi,
  clipboard: clipboardApi,
  direct: directDbApi,
  clipboardManager: clipboardManagerApi,
};
