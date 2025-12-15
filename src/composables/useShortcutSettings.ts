import { ref } from "vue";
import { register, unregister, isRegistered } from "@tauri-apps/plugin-global-shortcut";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsDatabase } from "./useSettingsDatabase";

const globalShortcut = ref<string>("");
const localSearchShortcut = ref<string>("");
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

    const saveLocalShortcut = async (key: string, shortcut: string): Promise<boolean> => {
        loading.value = true;
        try {
            await saveSetting(key, shortcut);
            if (key === "local_shortcut_search") {
                localSearchShortcut.value = shortcut;
            }
            loading.value = false;
            return true;
        } catch (err) {
            console.error(`Failed to save local shortcut ${key}:`, err);
            loading.value = false;
            return false;
        }
    };

    // 检查按键事件是否匹配快捷键字符串
    // shortcut 格式: "Control+Shift+F" 或 "Command+K"
    const matchShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
        if (!shortcut) return false;

        const parts = shortcut.split("+");
        const key = parts[parts.length - 1].toUpperCase();
        const modifiers = parts.slice(0, -1);

        const eventKey = event.key.toUpperCase();
        // 映射特殊键名
        const keyMap: Record<string, string> = {
            " ": "SPACE",
            "ESCAPE": "ESC"
        };
        const normalizedEventKey = keyMap[eventKey] || eventKey;

        if (normalizedEventKey !== key) return false;

        // 检查修饰键
        const hasMeta = event.metaKey;
        const hasCtrl = event.ctrlKey;
        const hasAlt = event.altKey;
        const hasShift = event.shiftKey;

        // 检查 CommandOrControl
        // 在 Mac 上，CommandOrControl = Meta (Command)
        // 在 Win/Linux 上，CommandOrControl = Control
        const isMac = navigator.userAgent.includes("Mac");

        const reqCtrl = modifiers.includes("Control");
        const reqAlt = modifiers.includes("Alt");
        const reqShift = modifiers.includes("Shift");
        const reqMeta = modifiers.includes("Command") || modifiers.includes("Super"); // Tauri 可能用 Super
        const reqCmdOrCtrl = modifiers.includes("CommandOrControl");

        // 验证 Shift/Alt
        if (hasShift !== reqShift) return false;
        if (hasAlt !== reqAlt) return false;

        if (isMac) {
            // Mac: CommandOrControl -> Meta
            // 如果要求 CommandOrControl，则必须有 Meta
            // 如果要求 Control，则必须有 Ctrl
            const needMeta = reqMeta || reqCmdOrCtrl;
            if (hasMeta !== needMeta) return false;
            if (hasCtrl !== reqCtrl) return false;
        } else {
            // Win: CommandOrControl -> Ctrl
            // 如果要求 CommandOrControl，则必须有 Ctrl
            // 如果要求 Command (Super/Win)，则必须有 Meta
            const needCtrl = reqCtrl || reqCmdOrCtrl;
            if (hasCtrl !== needCtrl) return false;
            if (hasMeta !== reqMeta) return false;
        }

        return true;
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

            // 加载应用内快捷键
            const savedSearchShortcut = await getSetting("local_shortcut_search");
            localSearchShortcut.value = savedSearchShortcut || "CommandOrControl+K"; // 默认 Ctrl/Cmd + K

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
        saveLocalShortcut,
        matchShortcut,
        localSearchShortcut,
        initializeShortcutSettings,
        clearError,
    };
}
