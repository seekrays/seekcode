use crate::models::{CodeSnippet, McpServerConfig};
use crate::snippet_service::SnippetService;
use tauri::{AppHandle, Manager};
use sqlx::SqlitePool;
use std::sync::{Arc, Mutex, OnceLock};
use std::future::Future;
use tokio::sync::broadcast;
use rmcp::{
    ErrorData as McpError, 
    model::*, 
    tool, 
    tool_router, 
    handler::server::{ServerHandler, tool::ToolRouter, RequestContext},
    service::RoleServer,
    transport::SseServer,
};
use axum::{
    routing::get,
    Router,
};
use tower_http::cors::CorsLayer;

// 全局服务器状态管理
static MCP_SERVER_STATE: OnceLock<Arc<Mutex<McpServerState>>> = OnceLock::new();

#[derive(Debug, Clone)]
struct McpServerState {
    pub is_running: bool,
    pub config: Option<McpServerConfig>,
    pub shutdown_sender: Option<broadcast::Sender<()>>,
}

impl Default for McpServerState {
    fn default() -> Self {
        Self {
            is_running: false,
            config: None,
            shutdown_sender: None,
        }
    }
}

fn get_server_state() -> &'static Arc<Mutex<McpServerState>> {
    MCP_SERVER_STATE.get_or_init(|| Arc::new(Mutex::new(McpServerState::default())))
}

// MCP 服务器实现
#[derive(Clone)]
pub struct SeekCodeServer {
    pub snippet_service: SnippetService,
    tool_router: ToolRouter<Self>,
}

#[tool_router]
impl SeekCodeServer {
    pub fn new(snippet_service: SnippetService) -> Self {
        Self {
            snippet_service,
            tool_router: Self::tool_router(),
        }
    }

    #[tool(description = "List all code snippets")]
    async fn list_snippets(&self) -> Result<CallToolResult, McpError> {
        let snippets = self.snippet_service.get_snippets().await
            .map_err(|e| McpError::internal_error(format!("Failed to get snippets: {}", e), None))?;
        
        let content = serde_json::to_string_pretty(&snippets)
            .map_err(|e| McpError::internal_error(format!("Failed to serialize snippets: {}", e), None))?;
        
        Ok(CallToolResult::success(vec![Content::text(content)]))
    }

    #[tool(description = "Get a specific code snippet by ID")]
    async fn get_snippet(&self, id: i64) -> Result<CallToolResult, McpError> {
        let snippet = self.snippet_service.get_snippet_by_id(id).await
            .map_err(|e| McpError::internal_error(format!("Failed to get snippet: {}", e), None))?;
        
        let content = serde_json::to_string_pretty(&snippet)
            .map_err(|e| McpError::internal_error(format!("Failed to serialize snippet: {}", e), None))?;
        
        Ok(CallToolResult::success(vec![Content::text(content)]))
    }

    #[tool(description = "Create a new code snippet")]
    async fn create_snippet(
        &self,
        title: String,
        language: String,
        code: String,
        tags: Option<String>,
    ) -> Result<CallToolResult, McpError> {
        let snippet = CodeSnippet {
            id: None,
            title,
            language,
            code,
            tags: tags.unwrap_or_default(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        let id = self.snippet_service.create_snippet(snippet).await
            .map_err(|e| McpError::internal_error(format!("Failed to create snippet: {}", e), None))?;
        
        Ok(CallToolResult::success(vec![Content::text(
            format!("Created snippet with ID: {}", id)
        )]))
    }

    #[tool(description = "Update an existing code snippet")]
    async fn update_snippet(
        &self,
        id: i64,
        title: Option<String>,
        language: Option<String>,
        code: Option<String>,
        tags: Option<String>,
    ) -> Result<CallToolResult, McpError> {
        // 先获取现有snippet
        let mut snippet = self.snippet_service.get_snippet_by_id(id).await
            .map_err(|e| McpError::internal_error(format!("Failed to get snippet: {}", e), None))?;

        // 更新字段
        if let Some(title) = title {
            snippet.title = title;
        }
        if let Some(language) = language {
            snippet.language = language;
        }
        if let Some(code) = code {
            snippet.code = code;
        }
        if let Some(tags) = tags {
            snippet.tags = tags;
        }
        snippet.updated_at = chrono::Utc::now();

        self.snippet_service.update_snippet(id, snippet).await
            .map_err(|e| McpError::internal_error(format!("Failed to update snippet: {}", e), None))?;

        Ok(CallToolResult::success(vec![Content::text(
            format!("Updated snippet with ID: {}", id)
        )]))
    }

    #[tool(description = "Delete a code snippet")]
    async fn delete_snippet(&self, id: i64) -> Result<CallToolResult, McpError> {
        self.snippet_service.delete_snippet(id).await
            .map_err(|e| McpError::internal_error(format!("Failed to delete snippet: {}", e), None))?;

        Ok(CallToolResult::success(vec![Content::text(
            format!("Deleted snippet with ID: {}", id)
        )]))
    }

    #[tool(description = "Search code snippets by title, code, or tags")]
    async fn search_snippets(&self, query: String) -> Result<CallToolResult, McpError> {
        let snippets = self.snippet_service.search_snippets(&query).await
            .map_err(|e| McpError::internal_error(format!("Failed to search snippets: {}", e), None))?;
        
        let content = serde_json::to_string_pretty(&snippets)
            .map_err(|e| McpError::internal_error(format!("Failed to serialize snippets: {}", e), None))?;
        
        Ok(CallToolResult::success(vec![Content::text(content)]))
    }

    #[tool(description = "Get code snippets filtered by programming language")]
    async fn get_snippets_by_language(&self, language: String) -> Result<CallToolResult, McpError> {
        let snippets = self.snippet_service.get_snippets_by_language(&language).await
            .map_err(|e| McpError::internal_error(format!("Failed to get snippets by language: {}", e), None))?;
        
        let content = serde_json::to_string_pretty(&snippets)
            .map_err(|e| McpError::internal_error(format!("Failed to serialize snippets: {}", e), None))?;
        
        Ok(CallToolResult::success(vec![Content::text(content)]))
    }

    #[tool(description = "Get statistics about code snippets")]
    async fn get_snippet_stats(&self) -> Result<CallToolResult, McpError> {
        let stats = self.snippet_service.get_snippet_stats().await
            .map_err(|e| McpError::internal_error(format!("Failed to get snippet stats: {}", e), None))?;
        
        let content = serde_json::to_string_pretty(&stats)
            .map_err(|e| McpError::internal_error(format!("Failed to serialize stats: {}", e), None))?;
        
        Ok(CallToolResult::success(vec![Content::text(content)]))
    }
}

// 实现 ServerHandler trait
impl ServerHandler for SeekCodeServer {
    async fn list_tools(&self) -> Result<Vec<Tool>, McpError> {
        Ok(self.tool_router.list_tools())
    }

    async fn call_tool(&self, request: CallToolRequest) -> Result<CallToolResult, McpError> {
        self.tool_router.call_tool(self, request).await
    }
}

pub async fn start_mcp_server(app: AppHandle, config: McpServerConfig) -> anyhow::Result<()> {
    if !config.enabled {
        return Ok(());
    }

    // 检查是否已经在运行
    {
        let state = get_server_state().lock().unwrap();
        if state.is_running {
            return Err(anyhow::anyhow!("MCP Server is already running"));
        }
    }

    let addr = format!("{}:{}", config.host, config.port);
    println!("Starting MCP Server with SSE on {}", addr);

    // 创建数据库连接池
    let app_data_dir = app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
    let db_path = app_data_dir.join("seekcode.db");
    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    
    let db_pool = SqlitePool::connect(&db_url).await?;

    // 创建 SnippetService
    let snippet_service = SnippetService::new(app.clone(), config.clone(), db_pool);

    // 创建服务器实例
    let server = SeekCodeServer::new(snippet_service);

    // 创建 SSE 服务器
    let sse_server = SseServer::new(server);

    // 创建 Axum 路由
    let app_router = Router::new()
        .route("/sse", get(move |req| sse_server.handle(req)))
        .layer(CorsLayer::permissive());

    // 创建关闭信号通道
    let (shutdown_tx, _shutdown_rx) = broadcast::channel(1);

    // 更新服务器状态
    {
        let mut state = get_server_state().lock().unwrap();
        state.is_running = true;
        state.config = Some(config);
        state.shutdown_sender = Some(shutdown_tx.clone());
    }

    // 启动 Axum 服务器
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    let mut shutdown_rx = shutdown_tx.subscribe();
    
    tokio::spawn(async move {
        let server = axum::serve(listener, app_router);
        
        tokio::select! {
            result = server => {
                if let Err(e) = result {
                    eprintln!("Server error: {}", e);
                }
            }
            _ = shutdown_rx.recv() => {
                println!("Shutting down MCP Server");
            }
        }

        // 清理状态
        {
            let mut state = get_server_state().lock().unwrap();
            state.is_running = false;
            state.config = None;
            state.shutdown_sender = None;
        }
        println!("MCP Server stopped");
    });

    println!("MCP Server started successfully on {}", addr);
    Ok(())
}

/// 停止 MCP 服务器
pub async fn stop_mcp_server() -> anyhow::Result<()> {
    let shutdown_sender = {
        let mut state = get_server_state().lock().unwrap();
        if !state.is_running {
            return Err(anyhow::anyhow!("MCP Server is not running"));
        }
        state.shutdown_sender.clone()
    };

    if let Some(sender) = shutdown_sender {
        if let Err(_) = sender.send(()) {
            println!("Failed to send shutdown signal, server may have already stopped");
        }
        println!("MCP Server stop signal sent");
    }

    Ok(())
}

/// 检查 MCP 服务器状态
pub fn is_mcp_server_running() -> bool {
    let state = get_server_state().lock().unwrap();
    state.is_running
}

/// 获取 MCP 服务器信息
pub fn get_mcp_server_info(config: &McpServerConfig) -> serde_json::Value {
    serde_json::json!({
        "enabled": config.enabled,
        "host": config.host,
        "port": config.port,
        "permissions": {
            "allow_query": config.allow_query,
            "allow_create": config.allow_create,
            "allow_update": config.allow_update,
            "allow_delete": config.allow_delete
        },
        "status": if is_mcp_server_running() { "running" } else { "stopped" }
    })
}
