<template>
  <div class="space-y-6">
    <!-- MCP Server 配置 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-4">
        <h3
          class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"
        >
          <i class="fas fa-plug text-blue-500"></i>
          MCP Server 配置
        </h3>
        <div class="flex items-center gap-2">
          <button
            v-if="!isServerRunning"
            @click="startMcpServer"
            :disabled="!mcpConfig.enabled || isStarting"
            class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isStarting ? "启动中..." : "启动服务" }}
          </button>
          <button
            v-if="isServerRunning"
            @click="stopMcpServer"
            :disabled="isStopping"
            class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isStopping ? "停止中..." : "停止服务" }}
          </button>
          <span 
            :class="[
              'px-2 py-1 text-xs rounded-full',
              isServerRunning 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            ]"
          >
            {{ isServerRunning ? "运行中" : "已停止" }}
          </span>
        </div>
      </div>

      <!-- 配置表单 -->
      <div class="space-y-4">
        <!-- 启用开关 -->
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            启用 MCP Server
          </label>
          <input
            v-model="mcpConfig.enabled"
            type="checkbox"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <!-- 监听地址 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            监听地址
          </label>
          <input
            v-model="mcpConfig.host"
            type="text"
            placeholder="127.0.0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <!-- 监听端口 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            监听端口
          </label>
          <input
            v-model.number="mcpConfig.port"
            type="number"
            placeholder="8080"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <!-- 权限控制 -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            功能权限控制
          </h4>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm text-gray-600 dark:text-gray-400">
                允许查询代码片段
              </label>
              <input
                v-model="mcpConfig.allow_query"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm text-gray-600 dark:text-gray-400">
                允许新增代码片段
              </label>
              <input
                v-model="mcpConfig.allow_create"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm text-gray-600 dark:text-gray-400">
                允许更新代码片段
              </label>
              <input
                v-model="mcpConfig.allow_update"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-sm text-gray-600 dark:text-gray-400">
                允许删除代码片段
              </label>
              <input
                v-model="mcpConfig.allow_delete"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end">
          <button
            @click="saveMcpConfig"
            :disabled="isSaving"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? "保存中..." : "保存配置" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 状态信息 -->
    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        服务状态
      </h4>
      <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>配置状态: {{ mcpConfig.enabled ? "已启用" : "已禁用" }}</p>
        <p>运行状态: {{ isServerRunning ? "运行中" : "已停止" }}</p>
        <p>地址: {{ mcpConfig.host }}:{{ mcpConfig.port }}</p>
        <p>权限: {{ getPermissionText() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsDatabase } from "../composables/useSettingsDatabase";

interface McpServerConfig {
  enabled: boolean;
  host: string;
  port: number;
  allow_query: boolean;
  allow_create: boolean;
  allow_update: boolean;
  allow_delete: boolean;
}

const { saveSetting, getSetting } = useSettingsDatabase();

// 响应式数据
const mcpConfig = ref<McpServerConfig>({
  enabled: false,
  host: "127.0.0.1",
  port: 8080,
  allow_query: true,
  allow_create: true,
  allow_update: false,
  allow_delete: false,
});

const isSaving = ref(false);
const isStarting = ref(false);
const isStopping = ref(false);
const isServerRunning = ref(false);

// 加载配置
const loadConfig = async () => {
  try {
    const configStr = await getSetting("mcp_server");
    if (configStr) {
      const config = JSON.parse(configStr);
      mcpConfig.value = { ...mcpConfig.value, ...config };
    }
  } catch (error) {
    console.error("Failed to load MCP config:", error);
  }
};

// 保存配置
const saveMcpConfig = async () => {
  isSaving.value = true;
  try {
    const configStr = JSON.stringify(mcpConfig.value);
    await saveSetting("mcp_server", configStr);
    console.log("MCP config saved successfully");
  } catch (error) {
    console.error("Failed to save MCP config:", error);
  } finally {
    isSaving.value = false;
  }
};

// 检查服务器状态
const checkServerStatus = async () => {
  try {
    isServerRunning.value = await invoke("get_mcp_server_status");
  } catch (error) {
    console.error("Failed to check server status:", error);
    isServerRunning.value = false;
  }
};

// 启动 MCP Server
const startMcpServer = async () => {
  isStarting.value = true;
  try {
    const result = await invoke("start_mcp_server_command", { 
      host: mcpConfig.value.host,
      port: mcpConfig.value.port 
    });
    console.log("MCP Server started successfully:", result);
    await checkServerStatus(); // 更新状态
  } catch (error) {
    console.error("Failed to start MCP Server:", error);
  } finally {
    isStarting.value = false;
  }
};

// 停止 MCP Server
const stopMcpServer = async () => {
  isStopping.value = true;
  try {
    const result = await invoke("stop_mcp_server_command");
    console.log("MCP Server stopped successfully:", result);
    await checkServerStatus(); // 更新状态
  } catch (error) {
    console.error("Failed to stop MCP Server:", error);
  } finally {
    isStopping.value = false;
  }
};

// 获取权限文本
const getPermissionText = () => {
  const permissions = [];
  if (mcpConfig.value.allow_query) permissions.push("查询");
  if (mcpConfig.value.allow_create) permissions.push("新增");
  if (mcpConfig.value.allow_update) permissions.push("更新");
  if (mcpConfig.value.allow_delete) permissions.push("删除");
  return permissions.length > 0 ? permissions.join(", ") : "无权限";
};

// 组件挂载时加载配置
onMounted(() => {
  loadConfig();
  checkServerStatus();
});
</script>
