import { getUnits } from '@/lib/db';
import { DictationClient } from '@/components/dictation-client';
import type { Unit } from '@/types';

interface PageProps {
  searchParams: Promise<{ grade?: string }>;
}

export default async function DictationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const grade = params.grade;

  if (!grade) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">请先选择年级</p>
      </div>
    );
  }

  const units = getUnits(grade);

  return <DictationClient grade={grade} units={units} />;
}
