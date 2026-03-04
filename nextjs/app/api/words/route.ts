import { NextRequest, NextResponse } from 'next/server';
import { getWords, getRandomWords } from '@/lib/db';

/**
 * GET /api/words?grade=xxx&unit=yyy
 * GET /api/words?grade=xxx&units=1,2,3&count=20&random=true
 * 获取单词列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const grade = searchParams.get('grade');
    const unit = searchParams.get('unit');
    const unitsParam = searchParams.get('units');
    const countParam = searchParams.get('count');
    const random = searchParams.get('random') === 'true';

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade parameter is required' },
        { status: 400 }
      );
    }

    // 随机获取单词
    if (random && unitsParam) {
      const units = unitsParam.split(',').map(Number).filter(n => !isNaN(n));
      const count = countParam ? parseInt(countParam, 10) : 20;
      const words = getRandomWords(grade, units, count);
      return NextResponse.json(words);
    }

    // 获取指定单元的单词
    const unitNum = unit ? parseInt(unit, 10) : undefined;
    const words = getWords(grade, unitNum);

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch words' },
      { status: 500 }
    );
  }
}
