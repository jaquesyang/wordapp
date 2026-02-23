/**
 * 读单词页面 - 随机展示单词卡片练习认读
 */
import { useState, useMemo, useEffect } from "react";
import { useUnits } from "@/hooks/useUnits";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Volume2, Eye, EyeOff } from "lucide-react";
import { audioApi } from "@/api/modules";
import type { Word } from "@/types";

export function ReadWordsPage() {
  const { settings, setNavigationConfirmationDisabled } = useAppStore();
  const { data: units } = useUnits(settings.currentGrade);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [isSetup, setIsSetup] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordList, setWordList] = useState<Word[]>([]);
  const [showPhonetic, setShowPhoneticLocal] = useState(settings.showPhonetic);
  const [showChinese, setShowChineseLocal] = useState(settings.showChinese);

  // 计算选中单元的总单词数
  const totalWordCount = useMemo(() => {
    if (!units) return 0;
    return units
      .filter((u) => selectedUnits.includes(u.unit))
      .reduce((sum, u) => sum + u.word_count, 0);
  }, [units, selectedUnits]);

  // 控制导航确认：设置阶段不需要确认，练习过程中需要确认
  useEffect(() => {
    setNavigationConfirmationDisabled(isSetup);
    return () => setNavigationConfirmationDisabled(false);
  }, [isSetup]);

  // 生成随机单词列表
  const handleStart = async () => {
    if (selectedUnits.length === 0) return;

    // 使用 Random Words API 获取所有单词（不传 count 参数）
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/words/random?grade=${settings.currentGrade}&units=${selectedUnits.join(",")}`
    );
    const data = await response.json();
    setWordList(data);
    setCurrentIndex(0);
    setIsSetup(false);
  };

  // 处理单元选择变化
  const handleUnitToggle = (unitNum: number) => {
    setSelectedUnits((prev) =>
      prev.includes(unitNum) ? prev.filter((u) => u !== unitNum) : [...prev, unitNum]
    );
  };

  // 全选/取消全选
  const handleToggleAll = () => {
    if (units && selectedUnits.length === units.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(units?.map((u) => u.unit) || []);
    }
  };

  // 播放单词发音
  const playWord = async (word: Word) => {
    try {
      const audioUrl = audioApi.getAudioUrl(word.word, settings.audioType);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error("音频播放失败:", error);
    }
  };

  // 上一个
  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // 下一个
  const handleNext = () => {
    if (currentIndex < wordList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  // 返回设置
  const handleBackToSetup = () => {
    setIsSetup(true);
    setCurrentIndex(0);
  };

  if (isSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-8">
          <div className="mb-8">
            <p className="text-muted-foreground">选择要练习的单元</p>
          </div>

          {/* 单元选择 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">选择单元</h3>
                <Button variant="outline" size="sm" onClick={handleToggleAll}>
                  {units && selectedUnits.length === units.length ? "取消全选" : "全选"}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {units?.map((unit) => (
                  <div key={unit.unit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unit-${unit.unit}`}
                      checked={selectedUnits.includes(unit.unit)}
                      onCheckedChange={() => handleUnitToggle(unit.unit)}
                    />
                    <Label
                      htmlFor={`unit-${unit.unit}`}
                      className="cursor-pointer text-card-foreground"
                    >
                      Unit {unit.unit} - {unit.name} ({unit.word_count} 个单词)
                    </Label>
                  </div>
                ))}
              </div>

              {/* 显示选项 */}
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground">显示选项</h4>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-phonetic"
                      checked={showPhonetic}
                      onCheckedChange={(checked) => {
                        if (typeof checked === "boolean") setShowPhoneticLocal(checked);
                      }}
                    />
                    <Label htmlFor="show-phonetic" className="cursor-pointer text-card-foreground">
                      显示音标
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-chinese"
                      checked={showChinese}
                      onCheckedChange={(checked) => {
                        if (typeof checked === "boolean") setShowChineseLocal(checked);
                      }}
                    />
                    <Label htmlFor="show-chinese" className="cursor-pointer text-card-foreground">
                      显示中文
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleStart}
                disabled={selectedUnits.length === 0}
              >
                开始练习 {selectedUnits.length > 0 ? `(${totalWordCount} 个单词)` : ""}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentWord = wordList[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8">
        {/* 顶部进度栏 */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBackToSetup}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {wordList.length}
          </div>
          <div className="text-sm text-muted-foreground">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPhoneticLocal(!showPhonetic)} title={showPhonetic ? "隐藏音标" : "显示音标"}>
              {showPhonetic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowChineseLocal(!showChinese)} title={showChinese ? "隐藏中文" : "显示中文"}>
              {showChinese ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / wordList.length) * 100}%` }}
          />
        </div>

        {/* 单词卡片 */}
        <Card className="mb-6">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              {/* 单词 */}
              <h2 className="text-4xl font-bold text-card-foreground break-words">
                {currentWord.word}
              </h2>

              {/* 音标 */}
              {showPhonetic && currentWord.phonetic && (
                <p className="text-xl text-muted-foreground">
                  {currentWord.phonetic}
                </p>
              )}

              {/* 中文 */}
              {showChinese && currentWord.chinese_definition && (
                <p className="text-lg text-card-foreground">
                  {currentWord.chinese_definition}
                </p>
              )}

              {/* 单词信息 */}
              <div className="text-sm text-muted-foreground">
                Unit {currentWord.unit} - 第 {currentWord.page} 页
                {currentWord.mark && ` - 标记: ${currentWord.mark}`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            上一个
          </Button>

          <Button
            variant="default"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={() => playWord(currentWord)}
          >
            <Volume2 className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === wordList.length - 1}
          >
            下一个
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
