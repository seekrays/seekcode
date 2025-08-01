/**
 * 统一的剪贴板工具
 * 提供跨平台的复制功能，优先使用 Tauri API，提供浏览器回退方案
 */

import { clipboardManagerApi } from "../services/tauri";

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 复制是否成功
 */
export async function copyText(text: string): Promise<boolean> {
  if (!text.trim()) {
    console.warn("Cannot copy empty text");
    return false;
  }

  try {
    // 优先使用 Tauri 剪贴板 API
    await clipboardManagerApi.writeText(text);
    return true;
  } catch (tauriError) {
    console.warn("Tauri clipboard failed, trying browser API:", tauriError);

    try {
      // 回退方案：使用浏览器剪贴板 API
      await navigator.clipboard.writeText(text);
      return true;
    } catch (browserError) {
      console.warn(
        "Browser clipboard failed, trying legacy method:",
        browserError
      );

      try {
        // 最后的回退方案：使用传统的复制方法
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!success) {
          throw new Error("execCommand failed");
        }

        return true;
      } catch (legacyError) {
        console.error("All copy methods failed:", legacyError);
        return false;
      }
    }
  }
}

/**
 * 读取剪贴板内容
 * @returns Promise<string> 剪贴板内容，失败时返回空字符串
 */
export async function readText(): Promise<string> {
  try {
    // 优先使用 Tauri 剪贴板 API
    return await clipboardManagerApi.readText();
  } catch (tauriError) {
    console.warn(
      "Tauri clipboard read failed, trying browser API:",
      tauriError
    );

    try {
      // 回退方案：使用浏览器剪贴板 API
      return await navigator.clipboard.readText();
    } catch (browserError) {
      console.error("Browser clipboard read also failed:", browserError);
      return "";
    }
  }
}

/**
 * 检查是否支持剪贴板API
 * @returns boolean 是否支持
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}
