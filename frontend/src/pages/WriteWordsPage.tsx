/**
 * 写单词页面 - 看中文写英文，检测学习效果
 */
import { useState, useEffect, useMemo } from "react";
import { useUnits } from "@/hooks/useUnits";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check, X, RotateCcw } from "lucide-react";
import type { Word } from "@/types";

interface Result {
  word: Word;
  userInput: string;
  isCorrect?: boolean; // 提交后才检查
}

export function WriteWordsPage() {
  const { settings, setNavigationConfirmationDisabled } = useAppStore();
  const { data: units } = useUnits(settings.currentGrade);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [isSetup, setIsSetup] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordList, setWordList] = useState<Word[]>([]);
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [wordCount, setWordCount] = useState<string>("all");

  // 计算选中单元的总单词数
  const totalWordCount = useMemo(() => {
    if (!units) return 0;
    return units
      .filter((u) => selectedUnits.includes(u.unit))
      .reduce((sum, u) => sum + u.word_count, 0);
  }, [units, selectedUnits]);

  // 计算按钮显示的单词数量（不超过选择的数量）
  const displayWordCount = useMemo(() => {
    if (wordCount === "all") return totalWordCount;
    return Math.min(totalWordCount, parseInt(wordCount));
  }, [totalWordCount, wordCount]);

  // 控制导航确认：设置阶段或显示结果时不需要确认，练习过程中需要确认
  useEffect(() => {
    setNavigationConfirmationDisabled(isSetup || showResults);
    return () => setNavigationConfirmationDisabled(false);
  }, [isSetup, showResults]);

  // 获取单词列表
  const getWordList = async () => {
    if (selectedUnits.length === 0) return;

    const unitsParam = selectedUnits.join(",");
    let url = `${import.meta.env.VITE_API_BASE_URL}/words/random?grade=${settings.currentGrade}&units=${unitsParam}`;
    if (wordCount !== "all") {
      url += `&count=${wordCount}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    setWordList(data);
    setCurrentIndex(0);
    setIsSetup(false);
    setShowResults(false);
    setResults([]);
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

  // 当索引变化时，恢复之前的输入
  useEffect(() => {
    if (wordList.length > 0) {
      const currentWord = wordList[currentIndex];
      const savedResult = results.find(r => r.word.id === currentWord.id);
      setUserInput(savedResult?.userInput || "");
    }
  }, [currentIndex, wordList, results]);

  // 保存答案（不检查正误）
  const saveAnswer = (goToNext: boolean = true) => {
    const currentWord = wordList[currentIndex];

    // 检查是否已经有这个单词的答案
    const existingIndex = results.findIndex(r => r.word.id === currentWord.id);

    const newResult: Result = {
      word: currentWord,
      userInput: userInput.trim(),
      isCorrect: undefined, // 不检查正误
    };

    let newResults: Result[];
    if (existingIndex >= 0) {
      // 更新已存在的答案
      newResults = [...results];
      newResults[existingIndex] = newResult;
    } else {
      // 添加新答案
      newResults = [...results, newResult];
    }

    setResults(newResults);

    // 清空输入框
    setUserInput("");

    // 跳到下一个
    if (goToNext) {
      if (currentIndex < wordList.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  // 提交答案（练习过程中）
  const handleSubmit = () => {
    if (currentIndex === wordList.length - 1) {
      // 最后一题，显示确认对话框
      setShowConfirmDialog(true);
    } else {
      // 保存答案并跳到下一个
      saveAnswer(true);
    }
  };

  // 确认提交
  const confirmSubmit = () => {
    setShowConfirmDialog(false);

    // 先保存当前答案
    saveAnswer(false);

    // 检查所有答案的正误
    const checkedResults = results.map(r => ({
      ...r,
      isCorrect: r.userInput.trim().toLowerCase() === r.word.word.toLowerCase() && r.userInput.trim() !== "",
    }));

    setResults(checkedResults);
    setShowResults(true);
  };

  // 处理键盘 Enter 提交
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // 重新开始
  const handleRestart = () => {
    setIsSetup(true);
    setCurrentIndex(0);
    setUserInput("");
    setResults([]);
    setShowResults(false);
    setReviewMode(false);
  };

  // 复习错题
  const handleReview = () => {
    const wrongWords = results.filter((r) => !r.isCorrect).map((r) => r.word);
    setWordList(wrongWords);
    setCurrentIndex(0);
    setShowResults(false);
    setResults([]);
    setReviewMode(true);
  };

  // 上一个
  const handlePrevious = () => {
    // 先保存当前答案
    const currentWord = wordList[currentIndex];
    const existingIndex = results.findIndex(r => r.word.id === currentWord.id);
    const newResult: Result = {
      word: currentWord,
      userInput: userInput.trim(),
      isCorrect: undefined,
    };

    let newResults = [...results];
    if (existingIndex >= 0) {
      newResults[existingIndex] = newResult;
    } else {
      newResults = [...results, newResult];
    }
    setResults(newResults);

    // 返回上一个
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      // 恢复上一个的输入
      const prevResult = newResults.find(r => r.word.id === wordList[prevIndex].id);
      setUserInput(prevResult?.userInput || "");
    }
  };

  // 计算统计（只在显示结果时检查）
  const calculateStats = () => {
    const checkedResults = results.map(r => ({
      ...r,
      isCorrect: r.userInput.trim().toLowerCase() === r.word.word.toLowerCase() && r.userInput.trim() !== "",
    }));

    const correctCount = checkedResults.filter(r => r.isCorrect).length;
    const unansweredCount = checkedResults.filter(r => !r.userInput.trim()).length;
    const wrongCount = checkedResults.filter(r => r.userInput.trim() && !r.isCorrect).length;

    return { checkedResults, correctCount, unansweredCount, wrongCount };
  };

  if (showResults) {
    const { checkedResults, correctCount, unansweredCount, wrongCount } = calculateStats();

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto py-8">
          <h2 className="text-3xl font-bold mb-4 text-foreground">练习完成</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{correctCount}</div>
                  <div className="text-sm text-muted-foreground">正确</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-destructive">{wrongCount}</div>
                  <div className="text-sm text-muted-foreground">错误</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-muted-foreground">{unansweredCount}</div>
                  <div className="text-sm text-muted-foreground">未答</div>
                </CardContent>
              </Card>
            </div>

          {/* 结果表格 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">详细结果</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-sm text-muted-foreground">
                        单词
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-sm text-muted-foreground">
                        你的答案
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-sm text-muted-foreground">
                        正确答案
                      </th>
                      <th className="text-center py-2 px-3 font-medium text-sm text-muted-foreground">
                        结果
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkedResults.map((result, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 px-3 text-card-foreground">{result.word.word}</td>
                        <td className={`py-3 px-3 ${
                          !result.userInput ? "text-muted-foreground italic" :
                          result.isCorrect ? "text-card-foreground" :
                          "text-destructive line-through"
                        }`}>
                          {result.userInput || "(未答)"}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{result.word.word}</td>
                        <td className="py-3 px-3 text-center">
                          {!result.userInput ? (
                            <span className="text-muted-foreground">-</span>
                          ) : result.isCorrect ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4">
            {wrongCount > 0 && (
              <Button onClick={handleReview} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                复习错题 ({wrongCount} 个)
              </Button>
            )}
            <Button onClick={handleRestart}>重新练习</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-8">
          <div className="mb-8">
            <p className="text-muted-foreground">看中文写英文，检测学习效果</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {units?.map((unit) => (
                  <div key={unit.unit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`write-unit-${unit.unit}`}
                      checked={selectedUnits.includes(unit.unit)}
                      onCheckedChange={() => handleUnitToggle(unit.unit)}
                    />
                    <Label
                      htmlFor={`write-unit-${unit.unit}`}
                      className="cursor-pointer text-card-foreground"
                    >
                      {unit.name} ({unit.word_count} 个单词)
                    </Label>
                  </div>
                ))}
              </div>

              {/* 单词数量选择 */}
              <div className="mb-6">
                <Label htmlFor="word-count-select" className="text-sm font-medium text-foreground mb-2 block">
                  单词数量
                </Label>
                <Select value={wordCount} onValueChange={setWordCount}>
                  <SelectTrigger id="word-count-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="70">70</SelectItem>
                    <SelectItem value="80">80</SelectItem>
                    <SelectItem value="90">90</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={getWordList}
                disabled={selectedUnits.length === 0}
              >
                开始练习 {selectedUnits.length > 0 ? `(${displayWordCount} 个单词)` : ""}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentWord = wordList[currentIndex];
  const progress = ((currentIndex + 1) / wordList.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8">
        {/* 顶部进度栏 */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setIsSetup(true)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {wordList.length}
          </div>
          <div></div>
        </div>

        {/* 进度条 */}
        <div className="mb-6 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 单词卡片 */}
        <Card className="mb-4">
          <CardContent className="p-8 text-center">
            <p className="text-2xl text-card-foreground mb-4">
              {currentWord.chinese_definition}
            </p>
            {currentWord.phonetic && (
              <p className="text-muted-foreground mb-2">
                {currentWord.phonetic}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {units?.find((u) => u.unit === currentWord.unit)?.name || `Unit ${currentWord.unit}`}
              {currentWord.page && ` - 第 ${currentWord.page} 页`}
            </p>
          </CardContent>
        </Card>

        {/* 输入区域和导航按钮 */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="word-input" className="text-card-foreground">
                  输入英文单词
                </Label>
                {reviewMode && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    复习模式
                  </span>
                )}
              </div>
              <Input
                id="word-input"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入英文单词..."
                className="text-lg text-card-foreground"
                autoFocus
                autoComplete="off"
              />
              {/* 导航按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  上一个
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  {currentIndex === wordList.length - 1 ? "提交" : "下一个"}
                  {currentIndex < wordList.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-card-foreground">{results.length}</div>
              <div className="text-sm text-muted-foreground">已答 / 共 {wordList.length} 题</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 提交确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">确认提交</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              已完成 {results.length} / {wordList.length} 题，确定要提交答案吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              继续练习
            </Button>
            <Button onClick={confirmSubmit}>
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
