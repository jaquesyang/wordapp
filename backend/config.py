"""
应用配置文件
"""
from pathlib import Path

# 项目根目录
BASE_DIR = Path(__file__).resolve().parent.parent

# 数据库路径
DATABASE_PATH = BASE_DIR / "wordapp.db"

# 有道词典音频 API 配置
YOUDAO_AUDIO_API = "https://dict.youdao.com/dictvoice"

# 音频类型：0=英音，1=美音
AUDIO_TYPES = {
    "uk": "0",  # 英音
    "us": "1"   # 美音
}
