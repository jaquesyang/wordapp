import { NextRequest, NextResponse } from 'next/server';
import { getRandomWords } from '@/lib/db';

/**
 * GET /api/words/random?grade=xxx&units=1,2,3&count=20
 * 获取随机单词列表（用于练习模式）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const grade = searchParams.get('grade');
    const unitsParam = searchParams.get('units');
    const countParam = searchParams.get('count');

    console.log('API /api/words/random - params:', { grade, unitsParam, countParam });

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade parameter is required' },
        { status: 400 }
      );
    }

    if (!unitsParam) {
      return NextResponse.json(
        { error: 'Units parameter is required' },
        { status: 400 }
      );
    }

    const units = unitsParam.split(',').map(Number).filter(n => !isNaN(n));
    const count = countParam ? parseInt(countParam, 10) : 20;

    console.log('Parsed params:', { units, count });

    if (units.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid unit is required' },
        { status: 400 }
      );
    }

    const words = getRandomWords(grade, units, count);
    console.log('Returning words:', words.length);
    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching random words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random words', details: String(error) },
      { status: 500 }
    );
  }
}
