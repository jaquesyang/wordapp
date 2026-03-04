'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/stores/use-app-store';
import type { Grade } from '@/types';

interface GradeCardProps {
  grade: Grade;
}

export function GradeCard({ grade }: GradeCardProps) {
  const { setCurrentGrade } = useAppStore();

  const handleClick = () => {
    setCurrentGrade(grade.id);
  };

  return (
    <Link href={`/grade/${encodeURIComponent(grade.id)}`} onClick={handleClick}>
      <Card className="p-6 hover:shadow-md transition-all cursor-pointer hover:border-primary">
        <div className="text-center">
          {grade.cover ? (
            <img
              src={grade.cover}
              alt={grade.name || grade.id}
              className="w-16 h-16 mx-auto mb-3 object-contain"
            />
          ) : (
            <div className="text-4xl mb-3">📚</div>
          )}
          <div className="font-medium text-sm">{grade.name || grade.id}</div>
          <div className="text-xs text-muted-foreground mt-1">{grade.id}</div>
        </div>
      </Card>
    </Link>
  );
}
