import { getUnits } from '@/lib/db';
import { ReadWordsClient } from '@/components/read-words-client';

interface PageProps {
  searchParams: Promise<{ grade?: string }>;
}

export default async function ReadWordsPage({ searchParams }: PageProps) {
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

  return <ReadWordsClient grade={grade} units={units} />;
}
