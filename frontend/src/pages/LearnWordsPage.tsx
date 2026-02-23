/**
 * 学单词页面 - 按单元分组显示单词，点击单词和音标播放发音
 */
import { useState, useEffect, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useUnits } from "@/hooks/useUnits";
import { useGrades } from "@/hooks/useGrades";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Volume2 } from "lucide-react";
import { audioApi } from "@/api/modules";
import type { Word } from "@/types";

// 将单词按单元分组
function groupWordsByUnit(words: Word[]): Record<number, Word[]> {
  const grouped: Record<number, Word[]> = {};
  words.forEach((word) => {
    if (!grouped[word.unit]) {
      grouped[word.unit] = [];
    }
    grouped[word.unit].push(word);
  });
  return grouped;
}

// 根据mark字段获取单词显示样式
function getWordDisplay(word: Word): { display: string; className: string } {
  const hasB = word.mark === "B" || word.mark === "BS";
  const hasS = word.mark === "S" || word.mark === "BS";

  let display = word.word;
  let className = "";

  if (hasB) {
    className += " font-bold";
  }
  if (hasS) {
    display = `* ${display}`;
  }

  return { display, className: className.trim() };
}

// 表格列宽配置（百分比）
const columnWidths = {
  word: "30%",
  phonetic: "30%",
  chinese: "40%",
};

export function LearnWordsPage() {
  const { settings, setAudioType, setNavigationConfirmationDisabled } = useAppStore();
  const { data: grades } = useGrades();

  // 学单词页面不需要导航确认
  useEffect(() => {
    setNavigationConfirmationDisabled(true);
    return () => setNavigationConfirmationDisabled(false);
  }, []);

  // 获取当前年级的 mark_note
  const currentGrade = useMemo(() => {
    if (!grades || !settings.currentGrade) return null;
    return grades.find((g) => g.id === settings.currentGrade);
  }, [grades, settings.currentGrade]);

  const markNote = currentGrade?.mark_note || null;

  const { data: words, isLoading } = useWords(settings.currentGrade);
  const { data: units } = useUnits(settings.currentGrade);
  const [playingWord, setPlayingWord] = useState<number | null>(null);

  // 播放单词发音
  const playWord = async (word: Word) => {
    setPlayingWord(word.id);
    try {
      const audioUrl = audioApi.getAudioUrl(word.word, settings.audioType);
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingWord(null);
      audio.onerror = () => setPlayingWord(null);
      await audio.play();
    } catch (error) {
      console.error("音频播放失败:", error);
      setPlayingWord(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupedWords = words ? groupWordsByUnit(words) : {};
  const sortedUnits = Object.keys(groupedWords).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          共 {words?.length || 0} 个单词，点击单词和音标播放发音
        </p>
        <Select value={settings.audioType} onValueChange={(v: any) => setAudioType(v)}>
          <SelectTrigger className="w-[80px] h-8 text-sm border-border hover:border-primary hover:bg-primary/5 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uk">英音</SelectItem>
            <SelectItem value="us">美音</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 图例说明 */}
      {markNote && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>标记说明：{markNote}</span>
        </div>
      )}

      {sortedUnits.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            暂无单词数据
          </CardContent>
        </Card>
      ) : (
        sortedUnits.map((unitNum) => {
          const unitWords = groupedWords[unitNum];
          const unitName = units?.find((u: { unit: number; name: string }) => u.unit === unitNum)?.name || `单元 ${unitNum}`;

          return (
            <Card key={unitNum}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-card-foreground">
                  Unit {unitNum} - {unitName}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({unitWords.length} 个单词)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed" style={{ minWidth: "600px" }}>
                    <colgroup>
                      <col style={{ width: columnWidths.word }} />
                      <col style={{ width: columnWidths.phonetic }} />
                      <col style={{ width: columnWidths.chinese }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-sm text-muted-foreground">
                          单词
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-sm text-muted-foreground">
                          音标
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-sm text-muted-foreground">
                          中文
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {unitWords.map((word, index) => {
                        const { display, className } = getWordDisplay(word);
                        return (
                          <tr
                            key={word.id}
                            className={index < unitWords.length - 1 ? "border-b border-border/50" : ""}
                          >
                            <td
                              className={`py-3 px-3 text-card-foreground cursor-pointer hover:bg-accent/50 rounded ${className}`}
                              onClick={() => playWord(word)}
                            >
                              {display}
                              {playingWord === word.id && (
                                <Volume2 className="h-3 w-3 inline ml-1 text-primary animate-pulse" />
                              )}
                            </td>
                            <td
                              className="py-3 px-3 text-muted-foreground text-sm cursor-pointer hover:bg-accent/50 rounded"
                              onClick={() => playWord(word)}
                            >
                              {word.phonetic}
                            </td>
                            <td className="py-3 px-3 text-sm text-card-foreground">{word.chinese_definition}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
