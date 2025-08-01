import Database from "@tauri-apps/plugin-sql";

/**
 * 统一的设置数据库操作
 * 消除各个设置模块中的重复代码
 */
export function useSettingsDatabase() {
  // 获取数据库连接
  const getDatabase = async (): Promise<Database> => {
    return await Database.load("sqlite:seekcode.db");
  };

  // 获取当前时间戳
  const getCurrentTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 保存单个设置到数据库
  const saveSetting = async (key: string, value: string): Promise<boolean> => {
    try {
      const db = await getDatabase();
      const now = getCurrentTimestamp();

      // 使用 INSERT OR REPLACE 来处理新增或更新
      await db.execute(
        `INSERT OR REPLACE INTO user_settings (key, value, created_at, updated_at) 
         VALUES ($1, $2, COALESCE(
           (SELECT created_at FROM user_settings WHERE key = $1), 
           $3
         ), $3)`,
        [key, value, now]
      );

      return true;
    } catch (err) {
      console.error("Failed to save setting to database:", err);
      throw err;
    }
  };

  // 从数据库获取单个设置
  const getSetting = async (key: string): Promise<string | null> => {
    try {
      const db = await getDatabase();
      const result = await db.select<Array<{ value: string }>>(
        "SELECT value FROM user_settings WHERE key = $1",
        [key]
      );

      return result.length > 0 ? result[0].value : null;
    } catch (err) {
      console.error("Failed to get setting from database:", err);
      throw err;
    }
  };

  // 批量获取设置
  const getSettings = async (
    keys: string[]
  ): Promise<Record<string, string>> => {
    try {
      const db = await getDatabase();
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(",");
      const result = await db.select<Array<{ key: string; value: string }>>(
        `SELECT key, value FROM user_settings WHERE key IN (${placeholders})`,
        keys
      );

      return result.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);
    } catch (err) {
      console.error("Failed to get settings from database:", err);
      throw err;
    }
  };

  // 批量保存设置
  const saveSettings = async (
    settings: Record<string, string>
  ): Promise<boolean> => {
    try {
      const db = await getDatabase();
      const now = getCurrentTimestamp();

      // 开始事务
      await db.execute("BEGIN TRANSACTION");

      try {
        for (const [key, value] of Object.entries(settings)) {
          await db.execute(
            `INSERT OR REPLACE INTO user_settings (key, value, created_at, updated_at) 
             VALUES ($1, $2, COALESCE(
               (SELECT created_at FROM user_settings WHERE key = $1), 
               $3
             ), $3)`,
            [key, value, now]
          );
        }

        await db.execute("COMMIT");
        return true;
      } catch (err) {
        await db.execute("ROLLBACK");
        throw err;
      }
    } catch (err) {
      console.error("Failed to save settings to database:", err);
      throw err;
    }
  };

  // 删除设置
  const deleteSetting = async (key: string): Promise<boolean> => {
    try {
      const db = await getDatabase();
      await db.execute("DELETE FROM user_settings WHERE key = $1", [key]);
      return true;
    } catch (err) {
      console.error("Failed to delete setting from database:", err);
      throw err;
    }
  };

  // 获取所有设置
  const getAllSettings = async (): Promise<Record<string, string>> => {
    try {
      const db = await getDatabase();
      const result = await db.select<Array<{ key: string; value: string }>>(
        "SELECT key, value FROM user_settings"
      );

      return result.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);
    } catch (err) {
      console.error("Failed to get all settings from database:", err);
      throw err;
    }
  };

  return {
    saveSetting,
    getSetting,
    getSettings,
    saveSettings,
    deleteSetting,
    getAllSettings,
  };
}
