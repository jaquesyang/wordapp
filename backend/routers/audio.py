"""
音频相关 API 路由
提供有道词典音频代理，解决跨域问题
"""
from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse
import httpx
from typing import Optional
import config

router = APIRouter()


@router.get("/audio/proxy")
async def proxy_audio(
    word: str,
    type: str = "0"  # 0=英音, 1=美音
):
    """
    音频代理接口
    转发请求到有道词典 API，解决跨域问题
    """
    url = f"{config.YOUDAO_AUDIO_API}?type={type}&audio={word}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            return StreamingResponse(
                response.aiter_bytes(),
                media_type=response.headers.get("content-type", "audio/mpeg"),
                headers={
                    "Cache-Control": "public, max-age=86400",  # 缓存24小时
                }
            )
        except Exception as e:
            return Response(
                content=f"音频获取失败: {str(e)}",
                status_code=500,
                media_type="text/plain"
            )
