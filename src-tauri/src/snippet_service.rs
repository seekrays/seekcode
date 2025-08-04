use crate::models::{CodeSnippet, McpServerConfig};
use tauri::AppHandle;
use serde_json::{json, Value};
use sqlx::{SqlitePool, Row};

#[derive(Clone)]
pub struct SnippetService {
    pub app: AppHandle,
    pub config: McpServerConfig,
    pub db_pool: SqlitePool,
}

impl SnippetService {
    pub fn new(app: AppHandle, config: McpServerConfig, db_pool: SqlitePool) -> Self {
        Self {
            app,
            config,
            db_pool,
        }
    }

    // 获取代码片段列表
    pub async fn get_snippets(&self) -> Result<Vec<CodeSnippet>, String> {
        let rows = sqlx::query(
            "SELECT id, title, language, code, tags, created_at, updated_at FROM code_snippets ORDER BY updated_at DESC"
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| e.to_string())?;

        let mut snippets = Vec::new();
        for row in rows {
            let snippet = CodeSnippet {
                id: row.get::<i64, _>("id"),
                title: row.get::<String, _>("title"),
                language: row.get::<String, _>("language"),
                code: row.get::<String, _>("code"),
                tags: row.get::<String, _>("tags"),
                created_at: row.get::<String, _>("created_at"),
                updated_at: row.get::<String, _>("updated_at"),
            };
            snippets.push(snippet);
        }
        Ok(snippets)
    }

    // 创建代码片段
    pub async fn create_snippet(&self, snippet: CodeSnippet) -> Result<i64, String> {
        let result = sqlx::query(
            "INSERT INTO code_snippets (title, language, code, tags, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))"
        )
        .bind(&snippet.title)
        .bind(&snippet.language)
        .bind(&snippet.code)
        .bind(&snippet.tags)
        .execute(&self.db_pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(result.last_insert_rowid())
    }

    // 更新代码片段
    pub async fn update_snippet(&self, id: i64, snippet: CodeSnippet) -> Result<(), String> {
        sqlx::query(
            "UPDATE code_snippets SET title = ?, language = ?, code = ?, tags = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(&snippet.title)
        .bind(&snippet.language)
        .bind(&snippet.code)
        .bind(&snippet.tags)
        .bind(id)
        .execute(&self.db_pool)
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    // 删除代码片段
    pub async fn delete_snippet(&self, id: i64) -> Result<(), String> {
        sqlx::query("DELETE FROM code_snippets WHERE id = ?")
            .bind(id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    // 根据 ID 获取单个代码片段
    pub async fn get_snippet_by_id(&self, id: i64) -> Result<Option<CodeSnippet>, String> {
        let row = sqlx::query(
            "SELECT id, title, language, code, tags, created_at, updated_at FROM code_snippets WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| e.to_string())?;

        if let Some(row) = row {
            let snippet = CodeSnippet {
                id: row.get::<i64, _>("id"),
                title: row.get::<String, _>("title"),
                language: row.get::<String, _>("language"),
                code: row.get::<String, _>("code"),
                tags: row.get::<String, _>("tags"),
                created_at: row.get::<String, _>("created_at"),
                updated_at: row.get::<String, _>("updated_at"),
            };
            Ok(Some(snippet))
        } else {
            Ok(None)
        }
    }

    // 根据语言筛选代码片段
    pub async fn get_snippets_by_language(&self, language: &str) -> Result<Vec<CodeSnippet>, String> {
        let rows = sqlx::query(
            "SELECT id, title, language, code, tags, created_at, updated_at FROM code_snippets WHERE language = ? ORDER BY updated_at DESC"
        )
        .bind(language)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| e.to_string())?;

        let mut snippets = Vec::new();
        for row in rows {
            let snippet = CodeSnippet {
                id: row.get::<i64, _>("id"),
                title: row.get::<String, _>("title"),
                language: row.get::<String, _>("language"),
                code: row.get::<String, _>("code"),
                tags: row.get::<String, _>("tags"),
                created_at: row.get::<String, _>("created_at"),
                updated_at: row.get::<String, _>("updated_at"),
            };
            snippets.push(snippet);
        }
        Ok(snippets)
    }

    // 搜索代码片段
    pub async fn search_snippets(&self, query: &str) -> Result<Vec<CodeSnippet>, String> {
        let search_pattern = format!("%{}%", query);
        let rows = sqlx::query(
            "SELECT id, title, language, code, tags, created_at, updated_at FROM code_snippets WHERE title LIKE ? OR code LIKE ? OR tags LIKE ? ORDER BY updated_at DESC"
        )
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| e.to_string())?;

        let mut snippets = Vec::new();
        for row in rows {
            let snippet = CodeSnippet {
                id: row.get::<i64, _>("id"),
                title: row.get::<String, _>("title"),
                language: row.get::<String, _>("language"),
                code: row.get::<String, _>("code"),
                tags: row.get::<String, _>("tags"),
                created_at: row.get::<String, _>("created_at"),
                updated_at: row.get::<String, _>("updated_at"),
            };
            snippets.push(snippet);
        }
        Ok(snippets)
    }

    // 批量删除代码片段
    pub async fn batch_delete_snippets(&self, ids: Vec<i64>) -> Result<u64, String> {
        if ids.is_empty() {
            return Ok(0);
        }
        
        let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let query = format!("DELETE FROM code_snippets WHERE id IN ({})", placeholders);
        
        let mut query_builder = sqlx::query(&query);
        for id in ids {
            query_builder = query_builder.bind(id);
        }
        
        let result = query_builder
            .execute(&self.db_pool)
            .await
            .map_err(|e| e.to_string())?;
            
        Ok(result.rows_affected())
    }

    // 获取代码片段统计信息
    pub async fn get_snippet_stats(&self) -> Result<serde_json::Value, String> {
        // 获取总数
        let count_row = sqlx::query("SELECT COUNT(*) as count FROM code_snippets")
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| e.to_string())?;
        let total_count: i64 = count_row.get("count");

        // 获取语言列表
        let lang_rows = sqlx::query("SELECT DISTINCT language FROM code_snippets ORDER BY language")
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| e.to_string())?;

        let languages: Vec<String> = lang_rows.iter()
            .map(|row| row.get::<String, _>("language"))
            .collect();

        Ok(serde_json::json!({
            "total_snippets": total_count,
            "languages": languages
        }))
    }
}
