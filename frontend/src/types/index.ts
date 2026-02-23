/**
 * 数据类型定义
 */

/** 年级 */
export interface Grade {
  id: string;
  name: string | null;
  cover: string | null;
  mark_note: string | null;
}

/** 单元 */
export interface Unit {
  grade: string;
  unit: number;
  name: string;
  word_count: number;
}

/** 单词 */
export interface Word {
  id: number;
  word: string;
  grade: string;
  unit: number;
  phonetic: string | null;
  chinese_definition: string | null;
  mark: string | null;
  page: number | null;
}

/** 音频类型 */
export type AudioType = "uk" | "us";

/** 主题类型 */
export type ThemeType = "green" | "blue" | "orange" | "dark";

/** 功能模块 */
export type FeatureModule = "learn" | "read" | "write" | "dictation";

/** 用户设置 */
export interface UserSettings {
  // 当前选择的年级
  currentGrade: string | null;
  // 当前选择的单元列表
  selectedUnits: number[];
  // 主题偏好
  theme: ThemeType;
  // 音频类型（英音/美音）
  audioType: AudioType;
  // 听写单词间隔时间（秒）
  dictationWordInterval: number;
  // 听写等待时间（秒）
  dictationWaitTime: number;
  // 字母朗读间隔时间（秒）
  letterInterval: number;
  // 读单词时是否显示音标
  showPhonetic: boolean;
  // 读单词时是否显示中文
  showChinese: boolean;
}

/** 学习历史记录 */
export interface LearningHistory {
  date: string;
  module: FeatureModule;
  grade: string;
  units: number[];
  wordCount: number;
  correct?: number;
  duration?: number;
}

/** 已掌握的单词 */
export interface MasteredWord {
  wordId: number;
  grade: string;
  masteredAt: string;
}
