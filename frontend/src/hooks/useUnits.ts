/**
 * 获取单元列表的 Hook
 */
import { useQuery } from "@tanstack/react-query";
import { unitsApi } from "@/api/modules";
import type { Unit } from "@/types";

export function useUnits(grade: string | null) {
  return useQuery<Unit[]>({
    queryKey: ["units", grade],
    queryFn: () => unitsApi.getByGrade(grade!),
    enabled: !!grade, // 只有当 grade 存在时才执行查询
    staleTime: 1000 * 60 * 5,
  });
}
