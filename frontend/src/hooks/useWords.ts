/**
 * 获取单词列表的 Hook
 */
import { useQuery } from "@tanstack/react-query";
import { wordsApi } from "@/api/modules";
import type { Word } from "@/types";

export function useWords(grade: string | null, unit?: number) {
  return useQuery<Word[]>({
    queryKey: ["words", grade, unit],
    queryFn: () => wordsApi.getWords(grade!, unit),
    enabled: !!grade,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 随机获取单词的 Hook
 */
export function useRandomWords(grade: string | null, units: number[], count: number = 10) {
  return useQuery<Word[]>({
    queryKey: ["words", "random", grade, units, count],
    queryFn: () => wordsApi.getRandom(grade!, units.join(","), count),
    enabled: !!grade && units.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
