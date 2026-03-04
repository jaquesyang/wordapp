'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/use-app-store';

interface SetGradeClientProps {
  gradeId: string;
}

export function SetGradeClient({ gradeId }: SetGradeClientProps) {
  const { setCurrentGrade } = useAppStore();

  useEffect(() => {
    setCurrentGrade(gradeId);
  }, [gradeId, setCurrentGrade]);

  return null;
}
