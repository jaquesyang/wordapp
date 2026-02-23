/**
 * 获取年级列表的 Hook
 */
import { useQuery } from "@tanstack/react-query";
import { gradesApi } from "@/api/modules";
import type { Grade } from "@/types";

export function useGrades() {
  return useQuery<Grade[]>({
    queryKey: ["grades"],
    queryFn: () => gradesApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5分钟内数据视为新鲜
  });
}
