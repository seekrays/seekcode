import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import i18n from "./i18n";

// 创建 Vue 应用
const app = createApp(App);

// 配置国际化
app.use(i18n);

// 挂载应用
app.mount("#app");

// 监听窗口获得焦点事件，这可以帮助处理dock图标点击
window.addEventListener("focus", async () => {
  try {
    // 当窗口获得焦点时，确保窗口显示
    const isVisible = await invoke("is_window_visible");
    if (!isVisible) {
      await invoke("show_window");
    }
  } catch (error) {
    console.error("Failed to handle window focus:", error);
  }
});

// 监听Tauri应用激活事件（如果有的话）
(async () => {
  try {
    await listen("tauri://focus", () => {
      // 当应用获得焦点时显示窗口
      invoke("show_window").catch(console.error);
    });
  } catch (error) {
    // 如果事件不存在也没关系
    console.log("Focus event listener not available");
  }
})();
