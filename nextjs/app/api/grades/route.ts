import { NextResponse } from 'next/server';
import { getGrades } from '@/lib/db';

/**
 * GET /api/grades
 * 获取所有年级列表
 */
export async function GET() {
  try {
    const grades = getGrades();
    return NextResponse.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}
