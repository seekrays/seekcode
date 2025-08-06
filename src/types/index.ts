export interface CodeSnippet {
  id?: number;
  title: string;
  language: string;
  tags: readonly string[];
  code: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClipboardItem {
  id?: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  snippet: CodeSnippet | null;
}

export type TabType = "snippets" | "clipboard";

// 新增：主题相关类型定义
export type ThemeMode = "system" | "light" | "dark";

export interface AppSettings {
  theme: ThemeMode;
}

export interface SettingsState {
  isOpen: boolean;
  activeTab: "general" | "appearance" | "mcpServer" | "data" | "about";
}

// 用户设置相关类型
export interface UserSetting {
  id?: number;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

export interface GeneralSettings {
  autostart_enabled: boolean;
  theme: string;
}
