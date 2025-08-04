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

/// MCP 服务器配置
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpServerConfig {
    pub enabled: bool,
    pub host: String,
    pub port: u16,
    pub allow_query: bool,
    pub allow_create: bool,
    pub allow_update: bool,
    pub allow_delete: bool,
}

impl Default for McpServerConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            host: "127.0.0.1".to_string(),
            port: 8080,
            allow_query: true,
            allow_create: true,
            allow_update: true,
            allow_delete: true,
        }
    }
}

/// MCP 请求体
#[derive(Debug, Serialize, Deserialize)]
pub struct McpRequest {
    pub method: String,
    pub params: serde_json::Value,
    pub id: Option<String>,
}

/// MCP 响应体
#[derive(Debug, Serialize, Deserialize)]
pub struct McpResponse {
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
    pub id: Option<String>,
}
