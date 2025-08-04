# SeekCode MCP 服务器

SeekCode 的 Model Context Protocol (MCP) 服务器实现，允许外部应用程序通过网络接口访问和管理代码片段。

## 功能特性

- **代码片段管理**: 增删改查代码片段
- **搜索功能**: 支持全文搜索代码片段
- **语言筛选**: 按编程语言筛选代码片段
- **批量操作**: 支持批量删除代码片段
- **统计信息**: 获取代码片段数量和语言统计
- **权限控制**: 可配置的操作权限（查询、创建、更新、删除）
- **JSON-RPC 协议**: 标准的 JSON-RPC 2.0 协议支持

## 配置

MCP 服务器的配置存储在应用设置中：

```rust
pub struct McpServerConfig {
    pub enabled: bool,        // 是否启用服务器
    pub host: String,         // 绑定地址
    pub port: u16,           // 监听端口
    pub allow_query: bool,    // 允许查询操作
    pub allow_create: bool,   // 允许创建操作
    pub allow_update: bool,   // 允许更新操作
    pub allow_delete: bool,   // 允许删除操作
}
```

默认配置：
- Host: `127.0.0.1`
- Port: `8080`
- 所有操作权限默认开启

## API 接口

### JSON-RPC 方法

#### 1. snippet.list
获取所有代码片段列表

**请求：**
```json
{
    "method": "snippet.list",
    "params": {},
    "id": "1"
}
```

**响应：**
```json
{
    "result": [
        {
            "id": 1,
            "title": "Hello World",
            "language": "python",
            "code": "print('Hello, World!')",
            "tags": "[\"example\"]",
            "created_at": "2025-01-01 00:00:00",
            "updated_at": "2025-01-01 00:00:00"
        }
    ],
    "id": "1"
}
```

#### 2. snippet.get
根据 ID 获取单个代码片段

**请求：**
```json
{
    "method": "snippet.get",
    "params": {
        "id": 1
    },
    "id": "2"
}
```

#### 3. snippet.create
创建新的代码片段

**请求：**
```json
{
    "method": "snippet.create",
    "params": {
        "title": "New Snippet",
        "language": "python",
        "code": "def hello():\n    return 'Hello!'",
        "tags": "[\"function\", \"example\"]"
    },
    "id": "3"
}
```

**响应：**
```json
{
    "result": {
        "id": 123
    },
    "id": "3"
}
```

#### 4. snippet.update
更新现有代码片段

**请求：**
```json
{
    "method": "snippet.update",
    "params": {
        "id": 1,
        "snippet": {
            "title": "Updated Snippet",
            "language": "python",
            "code": "def hello_updated():\n    return 'Hello, Updated!'",
            "tags": "[\"function\", \"updated\"]"
        }
    },
    "id": "4"
}
```

#### 5. snippet.delete
删除代码片段

**请求：**
```json
{
    "method": "snippet.delete",
    "params": {
        "id": 1
    },
    "id": "5"
}
```

#### 6. snippet.search
搜索代码片段

**请求：**
```json
{
    "method": "snippet.search",
    "params": {
        "query": "hello"
    },
    "id": "6"
}
```

#### 7. snippet.by_language
按语言筛选代码片段

**请求：**
```json
{
    "method": "snippet.by_language",
    "params": {
        "language": "python"
    },
    "id": "7"
}
```

#### 8. snippet.batch_delete
批量删除代码片段

**请求：**
```json
{
    "method": "snippet.batch_delete",
    "params": {
        "ids": [1, 2, 3]
    },
    "id": "8"
}
```

#### 9. snippet.stats
获取统计信息

**请求：**
```json
{
    "method": "snippet.stats",
    "params": {},
    "id": "9"
}
```

**响应：**
```json
{
    "result": {
        "total_snippets": 42,
        "languages": ["python", "javascript", "rust"]
    },
    "id": "9"
}
```

### 简单文本命令（向后兼容）

- `list` - 获取所有代码片段（JSON 格式）

## 使用示例

### Python 客户端示例

```python
import json
import socket

# 连接到服务器
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('127.0.0.1', 8080))

# 发送请求
request = {
    "method": "snippet.list",
    "params": {},
    "id": "1"
}
sock.send((json.dumps(request) + "\r\n").encode())

# 接收响应
response = sock.recv(4096).decode()
result = json.loads(response.strip())
print(result)

sock.close()
```

### curl 示例

```bash
# 注意：由于这是 TCP 服务器而不是 HTTP 服务器，curl 无法直接使用
# 可以使用 netcat (nc) 工具测试：

echo '{"method":"snippet.list","params":{},"id":"1"}' | nc 127.0.0.1 8080
```

## 测试

项目根目录包含一个 Python 测试脚本 `test_mcp.py`，可以用来测试 MCP 服务器的各种功能：

```bash
python3 test_mcp.py
```

确保在运行测试之前 MCP 服务器已经启动。

## 错误处理

所有 API 调用都遵循 JSON-RPC 2.0 错误响应格式：

```json
{
    "error": "Error message",
    "id": "request_id"
}
```

常见错误：
- `"Query not allowed"` - 查询权限被禁用
- `"Create not allowed"` - 创建权限被禁用
- `"Update not allowed"` - 更新权限被禁用
- `"Delete not allowed"` - 删除权限被禁用
- `"Missing or invalid 'id' parameter"` - 缺少或无效的 ID 参数
- `"Unknown method: xxx"` - 未知的方法名

## 安全注意事项

1. **网络访问**: 默认只绑定到 `127.0.0.1`，仅允许本地访问
2. **权限控制**: 可以通过配置禁用特定操作
3. **数据验证**: 所有输入数据都会进行验证
4. **错误处理**: 数据库错误不会暴露敏感信息

## 开发者信息

MCP 服务器实现位于 `src-tauri/src/mcp_server.rs`，包含以下主要组件：

- `SnippetService`: 核心服务类，处理数据库操作
- `start_mcp_server()`: 启动 TCP 服务器
- `McpRequest` / `McpResponse`: 请求/响应数据结构

数据库操作使用 `sqlx` crate，支持异步操作和连接池。
