use anyhow::{anyhow, Result};
use chrono::Local;
use futures::Future;
use rmcp::{
    handler::server::{router::tool::ToolRouter, tool::Parameters},
    model::*,
    schemars,
    service::RequestContext,
    tool, tool_handler, tool_router,
    transport::sse_server::{SseServer, SseServerConfig},
    ErrorData as McpError, RoleServer, ServerHandler,
};
use serde_json::json;
use sqlx::{Row, SqlitePool};
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{oneshot, RwLock};
use tokio_util::sync::CancellationToken;
use tracing;

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct CreateSnippetRequest {
    pub title: String,
    pub code: String,
    pub language: String,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct UpdateSnippetRequest {
    pub id: i64,
    pub title: Option<String>,
    pub code: Option<String>,
    pub language: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct SearchSnippetRequest {
    pub query: String,
    pub language: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct IdRequest {
    pub id: i64,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct ListRequest {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Clone)]
pub struct SnippetService {
    db_pool: SqlitePool,
    permissions: ServerPermissions,
    tool_router: ToolRouter<SnippetService>,
}

#[derive(Clone)]
pub struct ServerPermissions {
    pub allow_query: bool,
    pub allow_create: bool,
    pub allow_update: bool,
    pub allow_delete: bool,
}

#[tool_router]
impl SnippetService {
    pub fn new(db_pool: SqlitePool, permissions: ServerPermissions) -> Self {
        Self {
            db_pool,
            permissions,
            tool_router: Self::tool_router(),
        }
    }

    #[tool(description = "Create a new code snippet")]
    async fn create_snippet(
        &self,
        Parameters(request): Parameters<CreateSnippetRequest>,
    ) -> Result<CallToolResult, McpError> {
        let tags_json = request
            .tags
            .as_ref()
            .map(|tags| serde_json::to_string(tags).unwrap_or_default())
            .unwrap_or_default();

        let now = Local::now().format("%Y-%m-%dT%H:%M:%S").to_string();

        let result: std::result::Result<sqlx::sqlite::SqliteQueryResult, sqlx::Error> =
            sqlx::query(
                "INSERT INTO code_snippets (title, code, language, tags, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?)",
            )
            .bind(&request.title)
            .bind(&request.code)
            .bind(&request.language)
            .bind(&tags_json)
            .bind(&now)
            .bind(&now)
            .execute(&self.db_pool)
            .await;

        match result {
            Ok(query_result) => {
                let id = query_result.last_insert_rowid();
                Ok(CallToolResult::success(vec![Content::text(
                    json!({
                        "success": true,
                        "id": id,
                        "message": "Snippet created successfully"
                    })
                    .to_string(),
                )]))
            }
            Err(e) => Err(McpError::internal_error(
                format!("Failed to create snippet: {}", e),
                None,
            )),
        }
    }

    #[tool(description = "Get a code snippet by ID")]
    async fn get_snippet(
        &self,
        Parameters(request): Parameters<IdRequest>,
    ) -> Result<CallToolResult, McpError> {
        if !self.permissions.allow_query {
            return Err(McpError::invalid_params("Query not allowed", None));
        }

        let result = sqlx::query(
            "SELECT id, title, code, language, tags, created_at, updated_at 
             FROM code_snippets WHERE id = ?",
        )
        .bind(request.id)
        .fetch_optional(&self.db_pool)
        .await;

        match result {
            Ok(Some(row)) => {
                let tags_str: String = row.get("tags");
                let tags: Vec<String> = if tags_str.is_empty() {
                    Vec::new()
                } else {
                    serde_json::from_str(&tags_str).unwrap_or_default()
                };

                let snippet = json!({
                    "id": row.get::<i64, _>("id"),
                    "title": row.get::<String, _>("title"),
                    "code": row.get::<String, _>("code"),
                    "language": row.get::<String, _>("language"),
                    "tags": tags,
                    "created_at": row.get::<String, _>("created_at"),
                    "updated_at": row.get::<String, _>("updated_at"),
                });

                Ok(CallToolResult::success(vec![Content::text(
                    snippet.to_string(),
                )]))
            }
            Ok(None) => Err(McpError::invalid_params("Snippet not found", None)),
            Err(e) => Err(McpError::internal_error(
                format!("Failed to get snippet: {}", e),
                None,
            )),
        }
    }

    #[tool(description = "Search code snippets")]
    async fn search_snippets(
        &self,
        Parameters(request): Parameters<SearchSnippetRequest>,
    ) -> Result<CallToolResult, McpError> {
        if !self.permissions.allow_query {
            return Err(McpError::invalid_params("Query not allowed", None));
        }
        let mut query_str = String::from(
            "SELECT id, title, code, language, tags, created_at, updated_at 
             FROM code_snippets WHERE 1=1",
        );
        let mut params = Vec::new();

        if !request.query.is_empty() {
            query_str.push_str(" AND (title LIKE ? OR code LIKE ?)");
            let search_pattern = format!("%{}%", request.query);
            params.push(search_pattern.clone());
            params.push(search_pattern);
        }

        if let Some(language) = &request.language {
            query_str.push_str(" AND language = ?");
            params.push(language.clone());
        }

        query_str.push_str(" ORDER BY updated_at DESC LIMIT 50");

        let mut query = sqlx::query(&query_str);
        for param in params {
            query = query.bind(param);
        }

        let result = query.fetch_all(&self.db_pool).await;

        match result {
            Ok(rows) => {
                let snippets: Vec<serde_json::Value> = rows
                    .iter()
                    .map(|row| {
                        let tags_str: String = row.get("tags");
                        let tags: Vec<String> = if tags_str.is_empty() {
                            Vec::new()
                        } else {
                            serde_json::from_str(&tags_str).unwrap_or_default()
                        };

                        json!({
                            "id": row.get::<i64, _>("id"),
                            "title": row.get::<String, _>("title"),
                            "code": row.get::<String, _>("code"),
                            "language": row.get::<String, _>("language"),
                            "tags": tags,
                            "created_at": row.get::<String, _>("created_at"),
                            "updated_at": row.get::<String, _>("updated_at"),
                        })
                    })
                    .collect();

                Ok(CallToolResult::success(vec![Content::text(
                    json!({
                        "snippets": snippets,
                        "count": snippets.len()
                    })
                    .to_string(),
                )]))
            }
            Err(e) => Err(McpError::internal_error(
                format!("Failed to search snippets: {}", e),
                None,
            )),
        }
    }

    // #[tool(description = "Update a code snippet")]
    // async fn update_snippet(
    //     &self,
    //     Parameters(request): Parameters<UpdateSnippetRequest>,
    // ) -> Result<CallToolResult, McpError> {
    //     if !self.permissions.allow_update {
    //         return Err(McpError::invalid_params("Update not allowed", None));
    //     }
    //     let mut updates = Vec::new();
    //     let mut params = Vec::new();

    //     if let Some(title) = &request.title {
    //         updates.push("title = ?");
    //         params.push(title.clone());
    //     }
    //     if let Some(code) = &request.code {
    //         updates.push("code = ?");
    //         params.push(code.clone());
    //     }
    //     if let Some(language) = &request.language {
    //         updates.push("language = ?");
    //         params.push(language.clone());
    //     }
    //     if let Some(tags) = &request.tags {
    //         updates.push("tags = ?");
    //         let tags_json = serde_json::to_string(tags).unwrap_or_default();
    //         params.push(tags_json);
    //     }

    //     if updates.is_empty() {
    //         return Err(McpError::invalid_params("No fields to update", None));
    //     }

    //     let now = Local::now().format("%Y-%m-%dT%H:%M:%S").to_string();
    //     updates.push("updated_at = ?");
    //     let query_str = format!(
    //         "UPDATE code_snippets SET {} WHERE id = ?",
    //         updates.join(", ")
    //     );
    //     params.push(now);
    //     params.push(request.id.to_string());

    //     let mut query = sqlx::query(&query_str);
    //     for param in params {
    //         query = query.bind(param);
    //     }

    //     let result = query.execute(&self.db_pool).await;

    //     match result {
    //         Ok(query_result) => {
    //             if query_result.rows_affected() > 0 {
    //                 Ok(CallToolResult::success(vec![Content::text(
    //                     json!({
    //                         "success": true,
    //                         "message": "Snippet updated successfully"
    //                     })
    //                     .to_string(),
    //                 )]))
    //             } else {
    //                 Err(McpError::invalid_params("Snippet not found", None))
    //             }
    //         }
    //         Err(e) => Err(McpError::internal_error(
    //             format!("Failed to update snippet: {}", e),
    //             None,
    //         )),
    //     }
    // }

    // #[tool(description = "Delete a code snippet")]
    // async fn delete_snippet(
    //     &self,
    //     Parameters(request): Parameters<IdRequest>,
    // ) -> Result<CallToolResult, McpError> {
    //     if !self.permissions.allow_delete {
    //         return Err(McpError::invalid_params("Delete not allowed", None));
    //     }
    //     let result = sqlx::query("DELETE FROM code_snippets WHERE id = ?")
    //         .bind(request.id)
    //         .execute(&self.db_pool)
    //         .await;

    //     match result {
    //         Ok(query_result) => {
    //             if query_result.rows_affected() > 0 {
    //                 Ok(CallToolResult::success(vec![Content::text(
    //                     json!({
    //                         "success": true,
    //                         "message": "Snippet deleted successfully"
    //                     })
    //                     .to_string(),
    //                 )]))
    //             } else {
    //                 Err(McpError::invalid_params("Snippet not found", None))
    //             }
    //         }
    //         Err(e) => Err(McpError::internal_error(
    //             format!("Failed to delete snippet: {}", e),
    //             None,
    //         )),
    //     }
    // }

    #[tool(description = "List all code snippets with pagination")]
    async fn list_snippets(
        &self,
        Parameters(request): Parameters<ListRequest>,
    ) -> Result<CallToolResult, McpError> {
        if !self.permissions.allow_query {
            return Err(McpError::invalid_params("Query not allowed", None));
        }
        let page = request.page.unwrap_or(1);
        let limit = request.limit.unwrap_or(20);
        let offset = (page - 1) * limit;

        let result = sqlx::query(
            "SELECT id, title, code, language, tags, created_at, updated_at 
             FROM code_snippets ORDER BY updated_at DESC LIMIT ? OFFSET ?",
        )
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.db_pool)
        .await;

        match result {
            Ok(rows) => {
                let snippets: Vec<serde_json::Value> = rows
                    .iter()
                    .map(|row| {
                        let tags_str: String = row.get("tags");
                        let tags: Vec<String> = if tags_str.is_empty() {
                            Vec::new()
                        } else {
                            serde_json::from_str(&tags_str).unwrap_or_default()
                        };

                        json!({
                            "id": row.get::<i64, _>("id"),
                            "title": row.get::<String, _>("title"),
                            "code": row.get::<String, _>("code"),
                            "language": row.get::<String, _>("language"),
                            "tags": tags,
                            "created_at": row.get::<String, _>("created_at"),
                            "updated_at": row.get::<String, _>("updated_at"),
                        })
                    })
                    .collect();

                // Get total count
                let count_result = sqlx::query("SELECT COUNT(*) as count FROM code_snippets")
                    .fetch_one(&self.db_pool)
                    .await;

                let total = count_result
                    .map(|row| row.get::<i64, _>("count"))
                    .unwrap_or(0);

                Ok(CallToolResult::success(vec![Content::text(
                    json!({
                        "snippets": snippets,
                        "page": page,
                        "limit": limit,
                        "total": total,
                        "pages": (total as f64 / limit as f64).ceil() as u64
                    })
                    .to_string(),
                )]))
            }
            Err(e) => Err(McpError::internal_error(
                format!("Failed to list snippets: {}", e),
                None,
            )),
        }
    }
}

#[tool_handler]
impl ServerHandler for SnippetService {
    fn get_info(&self) -> ServerInfo {
        ServerInfo {
            protocol_version: ProtocolVersion::V_2024_11_05,
            capabilities: ServerCapabilities::builder()
                .enable_tools()
                .build(),
            server_info: Implementation::from_build_env(),
            instructions: Some("This server provides code snippet management tools. You can create, read, update, delete, search and list code snippets.".to_string()),
        }
    }

    async fn initialize(
        &self,
        _request: InitializeRequestParam,
        context: RequestContext<RoleServer>,
    ) -> Result<InitializeResult, McpError> {
        if let Some(http_request_part) = context.extensions.get::<axum::http::request::Parts>() {
            let initialize_headers = &http_request_part.headers;
            let initialize_uri = &http_request_part.uri;
            tracing::info!(?initialize_headers, %initialize_uri, "initialize from http server");
        }
        Ok(self.get_info())
    }
}

// 全局服务器状态 - 使用 lazy_static 避免在 static 中调用非 const 函数
lazy_static::lazy_static! {
    static ref SERVER_STATUS: Arc<RwLock<Option<ServerHandle>>> = Arc::new(RwLock::new(None));
}

pub struct ServerHandle {
    pub addr: SocketAddr,
    pub shutdown_tx: oneshot::Sender<()>,
}

pub async fn start_server_with_permissions(
    db_pool: SqlitePool,
    port: u16,
    allow_query: bool,
    allow_create: bool,
    allow_update: bool,
    allow_delete: bool,
) -> Result<SocketAddr> {
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let permissions = ServerPermissions {
        allow_query,
        allow_create,
        allow_update,
        allow_delete,
    };
    let snippet_service = SnippetService::new(db_pool, permissions);

    // 创建 SSE 服务器配置
    let config = SseServerConfig {
        bind: addr,
        sse_path: "/sse".to_string(),
        post_path: "/message".to_string(),
        ct: CancellationToken::new(),
        sse_keep_alive: Some(Duration::from_secs(15)),
    };

    let (shutdown_tx, shutdown_rx) = oneshot::channel();

    // 创建 SSE 服务器和路由
    let (sse_server, router) = SseServer::new(config);

    // 将服务注册到服务器
    let ct = sse_server.with_service(move || snippet_service.clone());

    // 启动 HTTP 服务器
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .map_err(|e| anyhow!("无法绑定到地址: {}", e))?;

    let server_ct = ct.child_token();

    // 存储服务器句柄
    let server_handle = ServerHandle { addr, shutdown_tx };

    {
        let mut status = SERVER_STATUS.write().await;
        *status = Some(server_handle);
    }

    // 启动服务器
    tokio::spawn(async move {
        let server = axum::serve(listener, router).with_graceful_shutdown(async move {
            let _ = shutdown_rx.await;
            server_ct.cancel();
        });

        if let Err(e) = server.await {
            eprintln!("服务器错误: {}", e);
        }

        // 清理状态
        let mut status = SERVER_STATUS.write().await;
        *status = None;
    });

    Ok(addr)
}

// 保持向后兼容的原始启动函数
pub async fn start_server(db_pool: SqlitePool, port: u16) -> Result<SocketAddr> {
    start_server_with_permissions(db_pool, port, true, true, false, false).await
}

pub async fn stop_server() -> Result<()> {
    let mut status = SERVER_STATUS.write().await;
    if let Some(handle) = status.take() {
        let _ = handle.shutdown_tx.send(());
        Ok(())
    } else {
        Err(anyhow!("Server is not running"))
    }
}

pub async fn is_server_running() -> bool {
    let status = SERVER_STATUS.read().await;
    status.is_some()
}

pub async fn get_server_address() -> Option<SocketAddr> {
    let status = SERVER_STATUS.read().await;
    status.as_ref().map(|handle| handle.addr)
}
