import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 根据mark字段获取单词显示样式
 */
export function getWordDisplay(word: { word: string; mark: string | null }): { display: string; className: string } {
  const hasB = word.mark === "B" || word.mark === "BS";
  const hasS = word.mark === "S" || word.mark === "BS";

  let display = word.word;
  let className = "";

  if (hasB) {
    className += " font-bold";
  }
  if (hasS) {
    display = `* ${display}`;
  }

  return { display, className: className.trim() };
}

/**
 * 将单词按单元分组
 */
export function groupWordsByUnit<T extends { unit: number }>(words: T[]): Record<number, T[]> {
  const grouped: Record<number, T[]> = {};
  words.forEach((word) => {
    if (!grouped[word.unit]) {
      grouped[word.unit] = [];
    }
    grouped[word.unit].push(word);
  });
  return grouped;
}
