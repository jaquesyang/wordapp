import { NextRequest, NextResponse } from 'next/server';
import { getWordById } from '@/lib/db';

/**
 * GET /api/words/{id}
 * 根据ID获取单词详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wordId = parseInt(id, 10);

    if (isNaN(wordId)) {
      return NextResponse.json(
        { error: 'Invalid word ID' },
        { status: 400 }
      );
    }

    const word = getWordById(wordId);

    if (!word) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error('Error fetching word:', error);
    return NextResponse.json(
      { error: 'Failed to fetch word' },
      { status: 500 }
    );
  }
}
