import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/audio/proxy?word=xxx&type=uk|us
 * 音频代理路由 - 解决有道词典 API 的 CORS 问题
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get('word');
    const type = searchParams.get('type') || 'uk';

    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // 有道词典音频 URL
    const audioUrl = `https://dict.youdao.com/dictvoice?type=${type}&audio=${encodeURIComponent(word)}`;

    // 代理请求
    const response = await fetch(audioUrl, {
      next: { revalidate: 86400 }, // 缓存 24 小时
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch audio' },
        { status: 500 }
      );
    }

    // 返回音频数据
    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error proxying audio:', error);
    return NextResponse.json(
      { error: 'Failed to proxy audio' },
      { status: 500 }
    );
  }
}
