import { NextRequest, NextResponse } from 'next/server';
import { getUnits } from '@/lib/db';

/**
 * GET /api/units?grade=xxx
 * 获取指定年级的单元列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const grade = searchParams.get('grade');

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade parameter is required' },
        { status: 400 }
      );
    }

    const units = getUnits(grade);
    return NextResponse.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
}
