import { getWords, getUnits, getGrades } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { LearnWordsClient } from '@/components/learn-words-client';
import { LearnWordsTable } from '@/components/learn-words-table';
import type { Word, Unit, Grade } from '@/types';

// 将单词按单元分组
function groupWordsByUnit(words: Word[]): Record<number, Word[]> {
  const grouped: Record<number, Word[]> = {};
  words.forEach((word) => {
    if (!grouped[word.unit]) {
      grouped[word.unit] = [];
    }
    grouped[word.unit].push(word);
  });
  return grouped;
}

interface PageProps {
  searchParams: Promise<{ grade?: string; unit?: string }>;
}

export default async function LearnWordsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const grade = params.grade;
  const unitParam = params.unit;

  if (!grade) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          请先选择年级
        </CardContent>
      </Card>
    );
  }

  const unitNum = unitParam ? parseInt(unitParam, 10) : undefined;
  const words = getWords(grade, unitNum);
  const units = getUnits(grade);
  const grades = getGrades();
  const gradeInfo = grades.find((g) => g.id === grade);
  const markNote = gradeInfo?.mark_note || null;

  const groupedWords = groupWordsByUnit(words);
  const sortedUnits = Object.keys(groupedWords).map(Number).sort((a, b) => a - b);

  return (
    <LearnWordsClient grade={grade} totalWords={words.length}>
      <div className="space-y-6">
        {/* 图例说明 */}
        {markNote && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>标记说明：{markNote}</span>
          </div>
        )}

        {sortedUnits.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              暂无单词数据
            </CardContent>
          </Card>
        ) : (
          <LearnWordsTable
            groupedWords={groupedWords}
            sortedUnits={sortedUnits}
            units={units}
          />
        )}
      </div>
    </LearnWordsClient>
  );
}
