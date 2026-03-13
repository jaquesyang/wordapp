import { getGrades } from '@/lib/db';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  const grades = getGrades();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-foreground">选择年级</h2>
        <p className="text-muted-foreground">请选择要学习的年级教材</p>
      </div>

      {/* 年级卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <Link key={grade.id} href={`/grade/${encodeURIComponent(grade.id)}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary group">
              <div className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* 封面图片 - 3:4 比例 */}
                  {grade.cover ? (
                    <img
                      src={grade.cover}
                      alt={grade.name || ''}
                      className="w-36 h-48 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-36 h-48 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="h-16 w-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
                      </svg>
                    </div>
                  )}

                  {/* 年级名称 */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{grade.name}</h3>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {grades.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">暂无年级数据</p>
        </Card>
      )}
    </div>
  );
}
