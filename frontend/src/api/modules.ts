/**
 * 各模块 API 接口
 */
import api, { defaults } from "./index";
import type { Grade, Unit, Word } from "../types";

/** 年级相关 API */
export const gradesApi = {
  /** 获取所有年级列表 */
  getAll: () => api.get<Grade[]>("/grades"),
};

/** 单元相关 API */
export const unitsApi = {
  /** 获取指定年级的单元列表 */
  getByGrade: (grade: string) => api.get<Unit[]>("/units", { params: { grade } }),
};

/** 单词相关 API */
export const wordsApi = {
  /** 获取单词列表 */
  getWords: (grade: string, unit?: number) =>
    api.get<Word[]>("/words", { params: { grade, unit } }),

  /** 随机获取单词 */
  getRandom: (grade: string, units: string, count: number = 10) =>
    api.get<Word[]>("/words/random", { params: { grade, units, count } }),

  /** 获取单个单词详情 */
  getById: (wordId: number) => api.get<Word>(`/words/${wordId}`),
};

/** 音频相关 API */
export const audioApi = {
  /** 获取音频 URL（通过代理） - 有道API: 英音type=1, 美音type=2 */
  getAudioUrl: (word: string, type: "uk" | "us" = "uk") => {
    // 有道API: 英音type=1, 美音type=2
    const typeNum = type === "uk" ? "1" : "2";
    return `${defaults.baseURL}/audio/proxy?word=${encodeURIComponent(word)}&type=${typeNum}`;
  },
};
