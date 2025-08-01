import { ref } from "vue";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

// 全局单例状态
const updateDialogVisible = ref(false);
const updateLoading = ref(false);
const updateProgress = ref(0);
const isChecking = ref(false);
let updateObj: any = null;

// 检查更新，若有新版本则弹窗
async function checkForUpdates() {
  if (isChecking.value) return;
  isChecking.value = true;
  try {
    const update = await check();
    if (update) {
      updateObj = update;
      updateDialogVisible.value = true;
    } else {
      console.log("当前已是最新版本");
    }
  } catch (e) {
    console.log("检查更新失败");
  } finally {
    isChecking.value = false;
  }
}

// 用户点击"立即更新"时调用
async function handleUpdate() {
  if (!updateObj) return;
  updateLoading.value = true;
  let downloaded = 0;
  let contentLength = 0;
  try {
    await updateObj.downloadAndInstall((event: any) => {
      switch (event.event) {
        case "Started":
          contentLength = event.data.contentLength || 0;
          break;
        case "Progress":
          downloaded += event.data.chunkLength || 0;
          updateProgress.value =
            contentLength > 0 ? (downloaded / contentLength) * 100 : 0;
          break;
        case "Finished":
          updateProgress.value = 100;
          // 下载完成后等待一小段时间再重启，确保安装完成
          setTimeout(async () => {
            try {
              // 重启应用（会自动退出当前实例）
              await relaunch();
            } catch (e) {
              console.error("重启失败:", e);
            }
          }, 1000);
          break;
      }
    });
  } catch (e) {
    console.log("更新失败，请稍后重试");
    updateLoading.value = false;
  }
}

function closeUpdateDialog() {
  updateDialogVisible.value = false;
  updateLoading.value = false;
  updateProgress.value = 0;
  updateObj = null;
}

export function useAppUpdater() {
  return {
    updateDialogVisible,
    updateLoading,
    updateProgress,
    updateObj,
    isChecking,
    checkForUpdates,
    handleUpdate,
    closeUpdateDialog,
  };
}
