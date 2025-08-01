use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

// ============================================================================
// 数据库迁移定义
// ============================================================================

/// 获取数据库迁移
/// 这些迁移会在应用启动时自动执行
pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
                CREATE TABLE IF NOT EXISTS code_snippets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    language TEXT NOT NULL,
                    code TEXT NOT NULL,
                    tags TEXT NOT NULL DEFAULT '[]',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS clipboard_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                
                CREATE INDEX IF NOT EXISTS idx_snippets_language ON code_snippets(language);
                CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON code_snippets(created_at);
                CREATE INDEX IF NOT EXISTS idx_clipboard_created_at ON clipboard_items(created_at);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_sample_data",
            sql: r#"
                INSERT OR IGNORE INTO code_snippets (id, title, language, code, tags, created_at, updated_at) VALUES
                (1, 'Common Git Commands', 'shell', 
                '# Initialize and Setup
git init                    # Initialize new repo
git clone <repo-url>        # Clone existing repo
git remote add origin <url> # Add remote repository

# Daily Workflow
git status                  # Check status
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push origin main       # Push to remote

# Branching
git branch                  # List branches
git checkout -b feature    # Create & switch to new branch
git merge feature          # Merge branch to current
git branch -d feature      # Delete branch

# Advanced
git stash                  # Stash changes
git stash pop              # Apply stashed changes
git log --oneline         # Compact log view
git reset --hard HEAD~1   # Undo last commit', 
                '["git", "shell", "commands"]', 
                '2025-06-15 10:30:00', '2025-06-15 10:30:00'),
                
                (2, 'Vue 3 Task Manager', 'vue',
                '<script setup lang="ts">
import { ref, computed } from ''vue''

interface Task {
  id: number
  title: string
  completed: boolean
}

// Reactive state
const tasks = ref<Task[]>([])
const newTaskTitle = ref('''')

// Computed properties
const completedTasks = computed(() => 
  tasks.value.filter(task => task.completed)
)
const incompleteTasks = computed(() => 
  tasks.value.filter(task => !task.completed)
)

// Methods
const addTask = () => {
  if (!newTaskTitle.value.trim()) return
  
  tasks.value.push({
    id: Date.now(),
    title: newTaskTitle.value,
    completed: false
  })
  newTaskTitle.value = ''''
}

const toggleTask = (task: Task) => {
  task.completed = !task.completed
}

const removeTask = (taskId: number) => {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
}
</script>

<template>
  <div class="task-manager">
    <input
      v-model="newTaskTitle"
      @keyup.enter="addTask"
      placeholder="Add new task..."
    />
    
    <ul class="task-list">
      <li v-for="task in tasks" :key="task.id">
        <input
          type="checkbox"
          :checked="task.completed"
          @change="toggleTask(task)"
        />
        <span :class="{ completed: task.completed }">
          {{ task.title }}
        </span>
        <button @click="removeTask(task.id)">Delete</button>
      </li>
    </ul>
    
    <div class="stats">
      <p>Complete: {{ completedTasks.length }}</p>
      <p>Incomplete: {{ incompleteTasks.length }}</p>
    </div>
  </div>
</template>', 
                '["vue", "composition-api", "typescript"]',
                '2025-06-14 15:45:00', '2025-06-14 15:45:00'),
                
                (3, 'Go HTTP Server with Middleware', 'go',
                'package main

import (
    "encoding/json"
    "log"
    "net/http"
    "time"
)

// Response represents API response structure
type Response struct {
    Status  string      `json:"status"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

// LoggingMiddleware adds request logging
func LoggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        log.Printf("Started %s %s", r.Method, r.URL.Path)
        
        next(w, r)
        
        log.Printf("Completed in %v", time.Since(start))
    }
}

// HelloHandler handles the /hello endpoint
func HelloHandler(w http.ResponseWriter, r *http.Request) {
    response := Response{
        Status:  "success",
        Message: "Welcome to Go API",
        Data: map[string]string{
            "version": "1.0.0",
            "env":     "production",
        },
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func main() {
    // Routes
    http.HandleFunc("/hello", LoggingMiddleware(HelloHandler))
    
    // Start server
    port := ":8080"
    log.Printf("Server starting on port %s", port)
    if err := http.ListenAndServe(port, nil); err != nil {
        log.Fatalf("Server failed to start: %v", err)
    }
}',
                '["golang", "http", "api"]',
                '2025-06-13 09:20:00', '2025-06-13 09:20:00');
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_user_settings_table",
            sql: r#"
                CREATE TABLE IF NOT EXISTS user_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT NOT NULL UNIQUE,
                    value TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                
                CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(key);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_default_user_settings",
            sql: r#"
                INSERT OR IGNORE INTO user_settings (key, value, created_at, updated_at) VALUES
                ('autostart_enabled', 'false', datetime('now'), datetime('now')),
                ('theme', 'system', datetime('now'), datetime('now'));
            "#,
            kind: MigrationKind::Up,
        },
    ]
}

// ============================================================================
// 辅助命令
// ============================================================================

/// 获取当前时间戳（本地时间格式）
#[tauri::command]
pub fn get_current_timestamp() -> String {
    chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

/// 获取支持的编程语言列表
#[tauri::command]
pub fn get_supported_languages() -> Vec<String> {
    vec![
        "javascript".to_string(),
        "typescript".to_string(),
        "vue".to_string(),
        "rust".to_string(),
        "python".to_string(),
        "css".to_string(),
        "html".to_string(),
        "go".to_string(),
        "java".to_string(),
        "php".to_string(),
        "sql".to_string(),
        "shell".to_string(),
        "json".to_string(),
        "markdown".to_string(),
        "yaml".to_string(),
        "xml".to_string(),
        "text".to_string(),
    ]
}

// ============================================================================
// 剪贴板相关
// ============================================================================

/// 获取系统剪贴板内容
#[tauri::command]
pub async fn get_clipboard_content(app: tauri::AppHandle) -> Result<String, String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    let clipboard = app.clipboard();
    clipboard
        .read_text()
        .map_err(|e| format!("Failed to read clipboard: {}", e))
}

/// 设置系统剪贴板内容
#[tauri::command]
pub async fn set_clipboard_content(app: tauri::AppHandle, content: String) -> Result<(), String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    let clipboard = app.clipboard();
    clipboard
        .write_text(content)
        .map_err(|e| format!("Failed to write clipboard: {}", e))
}

// ============================================================================
// 窗口控制
// ============================================================================

/// 显示主窗口
#[tauri::command]
pub fn show_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window
            .show()
            .map_err(|e| format!("Failed to show window: {}", e))?;
        window
            .set_focus()
            .map_err(|e| format!("Failed to focus window: {}", e))?;
    }
    Ok(())
}

/// 隐藏主窗口
#[tauri::command]
pub fn hide_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window
            .hide()
            .map_err(|e| format!("Failed to hide window: {}", e))?;
    }
    Ok(())
}

/// 检查窗口是否可见
#[tauri::command]
pub fn is_window_visible(app: tauri::AppHandle) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("main") {
        window
            .is_visible()
            .map_err(|e| format!("Failed to check window visibility: {}", e))
    } else {
        Ok(false)
    }
}
