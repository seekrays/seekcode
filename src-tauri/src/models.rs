use serde::{Deserialize, Serialize};

/// 数据库中的代码片段模型
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CodeSnippet {
    pub id: i64,
    pub title: String,
    pub language: String,
    pub code: String,
    pub tags: String, // JSON 字符串格式存储标签数组
    pub created_at: String,
    pub updated_at: String,
}

/// 数据库统计信息
#[derive(Debug, Serialize)]
pub struct DatabaseStats {
    pub total_snippets: i64,
    pub total_clipboard_items: i64,
    pub languages: Vec<String>,
}
