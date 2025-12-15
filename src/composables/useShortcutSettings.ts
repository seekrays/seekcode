import { ref } from "vue";
import { register, unregister, isRegistered } from "@tauri-apps/plugin-global-shortcut";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsDatabase } from "./useSettingsDatabase";

const globalShortcut = ref<string>("");
const loading = ref(false);
const error = ref("");

export function useShortcutSettings() {
    const { saveSetting, getSetting } = useSettingsDatabase();

    const registerShortcut = async (shortcut: string): Promise<boolean> => {
        try {
            // 如果已经有注册的快捷键，先注销
            if (globalShortcut.value) {
                // 检查旧快捷键是否被注册，如果是才注销
                const isOldRegistered = await isRegistered(globalShortcut.value);
                if (isOldRegistered) {
                    await unregister(globalShortcut.value);
                }
            }

            if (!shortcut) {
                globalShortcut.value = "";
                return true;
            }

            // 注册新快捷键
            await register(shortcut, async (event) => {
                if (event.state === "Pressed") {
                    // 调用 Tauri 命令来显示/隐藏窗口
                    const isVisible = await invoke("is_window_visible");
                    if (isVisible) {
                        await invoke("hide_window");
                    } else {
                        await invoke("show_window");
                    }
                }
            });

            globalShortcut.value = shortcut;
            return true;
        } catch (err: any) {
            console.error("Failed to register shortcut:", err);
            // 处理冲突错误
            if (err?.toString().includes("HotKeyAlreadyRegistered") || err?.toString().includes("conflict")) {
                error.value = `快捷键 "${shortcut}" 已被其他程序占用，请尝试其他组合`;
            } else {
                error.value = `注册快捷键失败: ${err?.message || err}`;
            }
            return false;
        }
    };

    const saveShortcutSetting = async (shortcut: string): Promise<boolean> => {
        loading.value = true;
        error.value = "";

        try {
            // 1. 尝试注册（验证是否冲突）
            const success = await registerShortcut(shortcut);
            if (!success) {
                loading.value = false;
                return false;
            }

            // 2. 保存到数据库
            await saveSetting("global_shortcut", shortcut);

            loading.value = false;
            return true;
        } catch (err: any) {
            console.error("Failed to save shortcut setting:", err);
            error.value = "保存设置失败";
            loading.value = false;
            return false;
        }
    };

    const initializeShortcutSettings = async () => {
        loading.value = true;
        try {
            const savedShortcut = await getSetting("global_shortcut");
            if (savedShortcut) {
                // 尝试恢复注册
                await registerShortcut(savedShortcut);
            }
        } catch (err) {
            console.error("Failed to initialize shortcut settings:", err);
        } finally {
            loading.value = false;
        }
    };

    const clearError = () => {
        error.value = "";
    };

    return {
        globalShortcut,
        loading,
        error,
        saveShortcutSetting,
        initializeShortcutSettings,
        clearError,
    };
}
