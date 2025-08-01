/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 添加 navigator 类型声明
declare global {
  interface Navigator {
    clipboard: {
      writeText(text: string): Promise<void>;
    };
  }
}
