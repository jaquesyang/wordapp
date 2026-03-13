/**
 * 应用全局状态管理
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserSettings, AudioType, ThemeType, FeatureModule, Grade } from "@/types";

/** 默认用户设置 */
const defaultSettings: UserSettings = {
  currentGrade: null,
  selectedUnits: [],
  theme: "green",
  audioType: "uk",
  dictationWordInterval: 2,
  dictationWaitTime: 5,
  checkingWordInterval: 2,
  letterInterval: 0.5,
  showPhonetic: true,
  showChinese: true,
};

interface AppState {
  // 用户设置
  settings: UserSettings;

  // 当前激活的功能模块
  currentModule: FeatureModule | null;

  // 导航确认控制（true = 不需要确认，false = 需要确认）
  navigationConfirmationDisabled: boolean;

  // 设置相关方法
  setCurrentGrade: (grade: string | null) => void;
  setSelectedUnits: (units: number[]) => void;
  setTheme: (theme: ThemeType) => void;
  setAudioType: (type: AudioType) => void;
  setDictationWordInterval: (interval: number) => void;
  setDictationWaitTime: (time: number) => void;
  setCheckingWordInterval: (interval: number) => void;
  setLetterInterval: (interval: number) => void;
  setShowPhonetic: (show: boolean) => void;
  setShowChinese: (show: boolean) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // 模块导航
  setCurrentModule: (module: FeatureModule | null) => void;

  // 导航确认控制
  setNavigationConfirmationDisabled: (disabled: boolean) => void;

  // 重置设置
  resetSettings: () => void;

  // 获取年级数据
  fetchGrades: () => Promise<Grade[]>;
}

/**
 * 应用主题到 DOM
 */
function applyTheme(theme: ThemeType) {
  const root = document.documentElement;

  // 移除所有主题类
  root.classList.remove("theme-green", "theme-blue", "theme-orange", "dark");

  // 添加新主题类
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.add(`theme-${theme}`);
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始状态
      settings: defaultSettings,
      currentModule: null,
      navigationConfirmationDisabled: false,

      // 设置方法
      setCurrentGrade: (grade) =>
        set((state) => ({
          settings: { ...state.settings, currentGrade: grade },
        })),

      setSelectedUnits: (units) =>
        set((state) => ({
          settings: { ...state.settings, selectedUnits: units },
        })),

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
        // 同步更新 DOM 类名
        applyTheme(theme);
      },

      setAudioType: (type) =>
        set((state) => ({
          settings: { ...state.settings, audioType: type },
        })),

      setDictationWordInterval: (interval) =>
        set((state) => ({
          settings: { ...state.settings, dictationWordInterval: interval },
        })),

      setDictationWaitTime: (time) =>
        set((state) => ({
          settings: { ...state.settings, dictationWaitTime: time },
        })),

      setCheckingWordInterval: (interval) =>
        set((state) => ({
          settings: { ...state.settings, checkingWordInterval: interval },
        })),

      setLetterInterval: (interval) =>
        set((state) => ({
          settings: { ...state.settings, letterInterval: interval },
        })),

      setShowPhonetic: (show) =>
        set((state) => ({
          settings: { ...state.settings, showPhonetic: show },
        })),

      setShowChinese: (show) =>
        set((state) => ({
          settings: { ...state.settings, showChinese: show },
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      // 模块导航
      setCurrentModule: (module) => set({ currentModule: module }),

      // 导航确认控制
      setNavigationConfirmationDisabled: (disabled) => set({ navigationConfirmationDisabled: disabled }),

      // 重置设置
      resetSettings: () => set({ settings: defaultSettings }),

      // 获取年级数据
      fetchGrades: async () => {
        const res = await fetch('/api/grades');
        if (!res.ok) throw new Error('Failed to fetch grades');
        return res.json();
      },
    }),
    {
      name: "wordapp-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
      }),
      // 在存储恢复后应用主题
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          applyTheme(state.settings.theme);
        }
      },
    }
  )
);

/**
 * 初始化主题（在应用启动时调用）
 */
export function initTheme() {
  const storedState = localStorage.getItem("wordapp-storage");
  if (storedState) {
    try {
      const parsed = JSON.parse(storedState);
      if (parsed.state?.settings?.theme) {
        applyTheme(parsed.state.settings.theme);
      }
    } catch (e) {
      // 使用默认主题
      applyTheme("green");
    }
  } else {
    applyTheme("green");
  }
}
