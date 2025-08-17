import { ref, createApp } from "vue";
import Toast from "../components/Toast.vue";

// 全局状态
const toasts = ref<Array<{ id: string; app: any }>>([]);
let toastCounter = 0;

export interface UseToastOptions {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  closable?: boolean;
}

export function useToast() {
  const showToast = (options: UseToastOptions) => {
    // 生成唯一ID
    const id = `toast-${++toastCounter}`;

    // 创建容器元素
    const container = document.createElement("div");
    container.id = id;
    document.body.appendChild(container);

    // 创建Vue应用实例
    const app = createApp(Toast, {
      ...options,
      onClose: () => {
        // 销毁应用并移除DOM元素
        setTimeout(() => {
          app.unmount();
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
          // 从toasts数组中移除
          const index = toasts.value.findIndex((toast) => toast.id === id);
          if (index > -1) {
            toasts.value.splice(index, 1);
          }
        }, 300); // 等待动画完成
      },
    });

    // 挂载应用
    app.mount(container);

    // 记录toast实例
    toasts.value.push({ id, app });

    return {
      id,
      close: () => {
        const toastInstance = app._instance?.exposed;
        if (toastInstance && typeof toastInstance.close === "function") {
          toastInstance.close();
        }
      },
    };
  };

  // 便捷方法
  const success = (message: string, options?: Partial<UseToastOptions>) => {
    return showToast({ message, type: "success", ...options });
  };

  const error = (message: string, options?: Partial<UseToastOptions>) => {
    return showToast({ message, type: "error", ...options });
  };

  const warning = (message: string, options?: Partial<UseToastOptions>) => {
    return showToast({ message, type: "warning", ...options });
  };

  const info = (message: string, options?: Partial<UseToastOptions>) => {
    return showToast({ message, type: "info", ...options });
  };

  // 关闭所有toast
  const clearAll = () => {
    toasts.value.forEach((toast) => {
      const toastInstance = toast.app._instance?.exposed;
      if (toastInstance && typeof toastInstance.close === "function") {
        toastInstance.close();
      }
    });
    toasts.value = [];
  };

  return {
    showToast,
    success,
    error,
    warning,
    info,
    clearAll,
  };
}

// 创建全局实例，可以在任何地方导入使用
export const toast = useToast();
