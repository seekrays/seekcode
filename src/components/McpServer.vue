<template>
  <div class="space-y-6">
    <!-- MCP 管理 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-4">
        <h3
          class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"
        >
          <i class="fas fa-plug text-blue-500"></i>
          MCP 管理
        </h3>
        <div class="flex items-center gap-3">
          <span
            :class="[
              'px-3 py-1 text-sm rounded-full font-medium',
              isServerRunning
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            ]"
          >
            <i
              :class="
                isServerRunning
                  ? 'fas fa-circle text-green-500'
                  : 'fas fa-circle text-gray-400'
              "
              class="mr-1"
            ></i>
            {{ isServerRunning ? "运行中" : "已停止" }}
          </span>
        </div>
      </div>

      <!-- 配置表单 -->
      <div class="space-y-4">
        <!-- 监听地址和端口 -->
        <div class="grid grid-cols-2 gap-4">
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
        </div>

        <!-- 自动启动开关 -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <i class="fas fa-rocket text-blue-500"></i>
            <div>
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                自动启动MCP Server
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                开机时自动启动MCP服务
              </p>
            </div>
          </div>
          <input
            v-model="mcpConfig.autoStart"
            type="checkbox"
            class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <!-- 功能 -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            功能
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <div
              class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <i class="fas fa-search text-blue-500"></i>
              <span class="text-sm text-gray-700 dark:text-gray-300"
                >查询代码片段</span
              >
            </div>
            <div
              class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <i class="fas fa-plus text-green-500"></i>
              <span class="text-sm text-gray-700 dark:text-gray-300"
                >新增代码片段</span
              >
            </div>
          </div>
        </div>

        <!-- 服务控制按钮 -->
        <div class="flex justify-center pt-4">
          <button
            v-if="!isServerRunning"
            @click="startMcpServer"
            :disabled="isStarting"
            class="px-8 py-3 text-base font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <i class="fas fa-play mr-2"></i>
            {{ isStarting ? "启动中..." : "启动服务" }}
          </button>
          <button
            v-if="isServerRunning"
            @click="stopMcpServer"
            :disabled="isStopping"
            class="px-8 py-3 text-base font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <i class="fas fa-stop mr-2"></i>
            {{ isStopping ? "停止中..." : "停止服务" }}
          </button>
        </div>
      </div>
    </div>

    <!-- MCP JSON 配置 -->
    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          MCP JSON 配置
        </h4>
        <button
          @click="copyMcpJson"
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          复制配置
        </button>
      </div>
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <pre class="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">{{
          getMcpJson()
        }}</pre>
      </div>
      <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <p>运行状态: {{ isServerRunning ? "运行中" : "已停止" }}</p>
        <p>
          地址: {{ serverAddress || `${mcpConfig.host}:${mcpConfig.port}/sse` }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsDatabase } from "../composables/useSettingsDatabase";

interface McpServerConfig {
  autoStart: boolean;
  host: string;
  port: number;
}

const { saveSetting, getSetting } = useSettingsDatabase();

// 响应式数据
const mcpConfig = ref<McpServerConfig>({
  autoStart: false,
  host: "127.0.0.1",
  port: 9800,
});

const isSaving = ref(false);
const isStarting = ref(false);
const isStopping = ref(false);
const isServerRunning = ref(false);
const serverAddress = ref<string>("");

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

// 自动保存配置
const autoSaveConfig = async () => {
  isSaving.value = true;
  try {
    const configStr = JSON.stringify(mcpConfig.value);
    await saveSetting("mcp_server", configStr);
    console.log("MCP config auto-saved successfully");
  } catch (error) {
    console.error("Failed to auto-save MCP config:", error);
  } finally {
    isSaving.value = false;
  }
};

// 检查服务器状态
const checkServerStatus = async () => {
  try {
    const status = (await invoke("get_mcp_server_status")) as {
      running: boolean;
      address?: string;
    };
    isServerRunning.value = status.running;
    if (status.address) {
      serverAddress.value = "http://" + status.address + "/sse";
    } else {
      serverAddress.value = `http://${mcpConfig.value.host}:${mcpConfig.value.port}/sse`;
    }
  } catch (error) {
    console.error("Failed to check server status:", error);
    isServerRunning.value = false;
    serverAddress.value = `http://${mcpConfig.value.host}:${mcpConfig.value.port}/sse`;
  }
};

// 启动 MCP Server
const startMcpServer = async () => {
  isStarting.value = true;
  try {
    const result = await invoke("start_mcp_server", {
      host: mcpConfig.value.host,
      port: mcpConfig.value.port,
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
    const result = await invoke("stop_mcp_server");
    console.log("MCP Server stopped successfully:", result);
    await checkServerStatus(); // 更新状态
  } catch (error) {
    console.error("Failed to stop MCP Server:", error);
  } finally {
    isStopping.value = false;
  }
};

// 获取 MCP JSON 配置
const getMcpJson = () => {
  const mcpJsonConfig = {
    mcpServers: {
      "seekcode-mcp-server": {
        url:
          serverAddress.value ||
          `http://${mcpConfig.value.host}:${mcpConfig.value.port}/sse`,
        type: "http",
      },
    },
    inputs: [],
  };
  return JSON.stringify(mcpJsonConfig, null, 2);
};

// 复制 MCP JSON 配置
const copyMcpJson = async () => {
  try {
    await navigator.clipboard.writeText(getMcpJson());
    console.log("MCP JSON config copied to clipboard");
  } catch (error) {
    console.error("Failed to copy MCP JSON config:", error);
  }
};

// 监听配置变化，自动保存
watch(
  mcpConfig,
  async (newConfig) => {
    // 延迟保存，避免频繁保存
    setTimeout(() => {
      autoSaveConfig();
    }, 500);
  },
  { deep: true }
);

// 组件挂载时加载配置
onMounted(() => {
  loadConfig();
  checkServerStatus();
});
</script>
