/**
 * 本地存储工具
 */

const STORAGE_KEY = "wordapp_";

/**
 * 获取存储值
 */
export function getStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(STORAGE_KEY + key);
    return item ? JSON.parse(item) : defaultValue ?? null;
  } catch (error) {
    console.error(`读取本地存储失败: ${key}`, error);
    return defaultValue ?? null;
  }
}

/**
 * 设置存储值
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY + key, JSON.stringify(value));
  } catch (error) {
    console.error(`写入本地存储失败: ${key}`, error);
  }
}

/**
 * 删除存储值
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_KEY + key);
  } catch (error) {
    console.error(`删除本地存储失败: ${key}`, error);
  }
}
