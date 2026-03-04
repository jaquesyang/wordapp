'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '@/stores/use-app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import type { Word, Unit } from '@/types';

interface DictationClientProps {
  grade: string;
  units: Unit[];
}

export function DictationClient({ grade, units }: DictationClientProps) {
  const { settings, updateSettings, setNavigationConfirmationDisabled } = useAppStore();

  // 设置状态
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [isSetup, setIsSetup] = useState(true);
  const [wordCount, setWordCount] = useState<string>('all');

  // 计算选中单元的总单词数
  const totalWordCount = useMemo(() => {
    return units
      .filter((u) => selectedUnits.includes(u.unit))
      .reduce((sum, u) => sum + u.word_count, 0);
  }, [units, selectedUnits]);

  // 计算按钮显示的单词数量（不超过选择的数量）
  const displayWordCount = useMemo(() => {
    if (wordCount === 'all') return totalWordCount;
    return Math.min(totalWordCount, parseInt(wordCount));
  }, [totalWordCount, wordCount]);

  // 播放状态
  const [wordList, setWordList] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackComplete, setPlaybackComplete] = useState(false);
  const [checkingMode, setCheckingMode] = useState(false);
  const [checkIndex, setCheckIndex] = useState(0);

  // 计时器和音频引用
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const shouldStopRef = useRef<boolean>(false);

  // 控制导航确认：设置阶段或校对模式时不需要确认，听写过程中需要确认
  useEffect(() => {
    setNavigationConfirmationDisabled(isSetup || checkingMode);
    return () => setNavigationConfirmationDisabled(false);
  }, [isSetup, checkingMode, setNavigationConfirmationDisabled]);

  // 获取单词列表
  const getWordList = async () => {
    if (selectedUnits.length === 0) return;

    const unitsParam = selectedUnits.join(',');
    let url = `/api/words/random?grade=${grade}&units=${unitsParam}`;
    if (wordCount !== 'all') {
      url += `&count=${wordCount}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    setWordList(data);
    setCurrentWordIndex(0);
    setIsSetup(false);
  };

  // 处理单元选择
  const handleUnitToggle = (unitNum: number) => {
    setSelectedUnits((prev) =>
      prev.includes(unitNum) ? prev.filter((u) => u !== unitNum) : [...prev, unitNum]
    );
  };

  // 全选/取消全选
  const handleToggleAll = () => {
    if (selectedUnits.length === units.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(units.map((u) => u.unit));
    }
  };

  // 播放单个单词
  const playWord = async (word: Word): Promise<void> => {
    const audioUrl = `/api/audio/proxy?word=${encodeURIComponent(word.word)}&type=${settings.audioType === 'uk' ? '1' : '2'}`;

    return new Promise((resolve, reject) => {
      // 停止之前的音频
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      const onEnded = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('音频播放失败'));
      };

      const cleanup = () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
        }
      };

      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);

      // 检查是否应该停止
      if (shouldStopRef.current || isPaused) {
        cleanup();
        resolve();
        return;
      }

      audio.play().catch((err) => {
        cleanup();
        reject(err);
      });
    });
  };

  // 等待函数（可被暂停中断）
  const waitWithPauseCheck = async (ms: number): Promise<void> => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (isPaused) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - startTime >= ms) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
      intervalRef.current = checkInterval;
    });
  };

  // 开始播放听写
  const startPlayback = async () => {
    // 重置停止标志
    shouldStopRef.current = false;
    setIsPlaying(true);
    setPlaybackComplete(false);
    setCheckingMode(false);

    // 从当前位置开始播放
    const startIndex = currentWordIndex;
    for (let i = startIndex; i < wordList.length; i++) {
      // 检查是否应该停止
      if (shouldStopRef.current || isPaused) {
        setIsPlaying(false);
        return;
      }

      setCurrentWordIndex(i);

      // 播放单词第一次
      try {
        await playWord(wordList[i]);

        // 检查是否暂停
        if (isPaused) break;

        // 等待1秒
        await waitWithPauseCheck(1000);
        if (isPaused) break;

        // 播放单词第二次
        await playWord(wordList[i]);

        // 检查是否暂停
        if (isPaused) break;

        // 单词之间等待
        if (i < wordList.length - 1) {
          const waitTime = settings.dictationWaitTime * 1000;
          await waitWithPauseCheck(waitTime);
        }
      } catch (error) {
        console.error('播放失败:', error);
      }
    }

    setPlaybackComplete(true);
    setIsPlaying(false);
  };

  // 暂停/继续
  const handlePauseResume = () => {
    if (isPaused) {
      // 继续
      setIsPaused(false);
      setIsPlaying(true);
      shouldStopRef.current = false;
      // 从当前位置继续播放
      startPlayback();
    } else {
      // 暂停
      shouldStopRef.current = true;
      setIsPaused(true);
      setIsPlaying(false);
      // 停止当前正在播放的音频
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
      // 清除所有定时器
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
        playTimeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  // 重置
  const handleReset = () => {
    shouldStopRef.current = true;
    setIsPlaying(false);
    setIsPaused(false);
    setPlaybackComplete(false);
    setCurrentWordIndex(0);
    setCheckingMode(false);
    setCheckIndex(0);
    // 停止当前音频
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    // 清除所有定时器
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 重新开始（返回设置页面）
  const handleRestart = () => {
    setIsSetup(true);
    handleReset();
  };

  // 播放单个字母（Web Speech API）
  const playLetter = (letter: string): Promise<void> => {
    return new Promise((resolve) => {
      if (shouldStopRef.current || isPaused) {
        resolve();
        return;
      }

      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.volume = 1.0;
      utterance.pitch = 1.2;

      // 尝试获取更好的女声
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = [
        'Google US English',
        'Microsoft Zira',
        'Microsoft Aria',
        'Samantha',
        'Victoria',
        'Fiona',
      ];

      for (const preferred of preferredVoices) {
        const voice = voices.find((v) => v.name.includes(preferred));
        if (voice) {
          utterance.voice = voice;
          break;
        }
      }

      if (!utterance.voice) {
        const femaleVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Female') || v.name.includes('female') || v.name.includes('Zira') || v.name.includes('Aria'))
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);

      // 超时处理
      setTimeout(() => {
        window.speechSynthesis.cancel();
        resolve();
      }, 3000);
    });
  };

  // 播放当前单词（先朗读单词，再逐字母朗读）
  const playCurrentWordSpelling = async (word: Word): Promise<void> => {
    // 先朗读完整单词
    await playWord(word);
    await waitWithPauseCheck(1000);

    if (isPaused) return;

    // 再逐字母朗读
    const letters = word.word.split('');
    for (const letter of letters) {
      if (shouldStopRef.current || isPaused) return;
      await playLetter(letter);
      // 字母间隔
      await waitWithPauseCheck(Math.round(settings.letterInterval * 1000));
    }
  };

  // 开始校对播放
  const startChecking = async () => {
    shouldStopRef.current = false;
    setIsPlaying(true);
    setPlaybackComplete(false);
    setCheckingMode(true);

    // 从当前位置开始播放
    const startIndex = checkIndex;
    for (let i = startIndex; i < wordList.length; i++) {
      if (shouldStopRef.current || isPaused) {
        setIsPlaying(false);
        return;
      }

      setCheckIndex(i);

      try {
        // 播放单词和字母
        await playCurrentWordSpelling(wordList[i]);

        if (isPaused) break;

        // 单词之间等待
        if (i < wordList.length - 1) {
          const waitTime = settings.dictationWaitTime * 1000;
          await waitWithPauseCheck(waitTime);
        }
      } catch (error) {
        console.error('校对播放失败:', error);
      }
    }

    setPlaybackComplete(true);
    setIsPlaying(false);
  };

  // 清理定时器和音频
  useEffect(() => {
    return () => {
      shouldStopRef.current = true;
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  if (checkingMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCheckingMode(false);
              shouldStopRef.current = true;
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          {isPaused && <div className="text-center text-muted-foreground">已暂停</div>}
          <div></div>
        </div>

        {/* 进度 */}
        <div>
          <div className="h-4 bg-muted rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((checkIndex + 1) / wordList.length) * 100}%` }}
            />
          </div>
          <div className="text-center text-2xl font-semibold text-foreground">
            {checkIndex + 1} / {wordList.length}
          </div>
        </div>

        {/* 播放动画 */}
        <div className="flex justify-center items-center py-16">
          <div className="relative">
            <div
              className="absolute inset-0 bg-primary/20 rounded-full animate-ping"
              style={{ animationDuration: '1.5s' }}
            />
            <div
              className="absolute inset-0 bg-primary/30 rounded-full animate-ping"
              style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}
            />
            <div className="relative w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
              <Volume2 className="h-16 w-16 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4">
          {!isPlaying && !playbackComplete && (
            <Button size="lg" onClick={startChecking}>
              <Play className="h-5 w-5 mr-2" />
              开始校对
            </Button>
          )}
          {isPlaying && !isPaused && (
            <Button size="lg" onClick={handlePauseResume}>
              <Pause className="h-5 w-5 mr-2" />
              暂停
            </Button>
          )}
          {isPaused && (
            <Button size="lg" onClick={handlePauseResume}>
              <Play className="h-5 w-5 mr-2" />
              继续
            </Button>
          )}
          {playbackComplete && !isPaused && (
            <>
              <Button size="lg" onClick={handleRestart} variant="outline">
                <RotateCcw className="h-5 w-5 mr-2" />
                重新听写
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setIsSetup(true);
                  handleReset();
                }}
              >
                退出
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isSetup) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">听音频写单词，模拟听写测试</p>
        </div>

        {/* 单元选择 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">选择单元</h3>
              <Button variant="outline" size="sm" onClick={handleToggleAll}>
                {selectedUnits.length === units.length ? '取消全选' : '全选'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {units.map((unit) => (
                <div key={unit.unit} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dictation-unit-${unit.unit}`}
                    checked={selectedUnits.includes(unit.unit)}
                    onChange={() => handleUnitToggle(unit.unit)}
                  />
                  <Label
                    htmlFor={`dictation-unit-${unit.unit}`}
                    className="cursor-pointer text-card-foreground"
                  >
                    {unit.name} ({unit.word_count} 个单词)
                  </Label>
                </div>
              ))}
            </div>

            {/* 单词数量选择 */}
            <div>
              <Label htmlFor="dictation-word-count-select" className="text-sm font-medium text-foreground mb-2 block">
                单词数量
              </Label>
              <Select value={wordCount} onValueChange={setWordCount}>
                <SelectTrigger id="dictation-word-count-select" className="w-full">
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
          </CardContent>
        </Card>

        {/* 播放设置 */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">播放设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-card-foreground">单词间隔时间</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      settings.dictationWordInterval > 1 &&
                      updateSettings({ dictationWordInterval: settings.dictationWordInterval - 1 })
                    }
                  >
                    -
                  </Button>
                  <span className="w-16 text-center text-card-foreground">{settings.dictationWordInterval} 秒</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSettings({ dictationWordInterval: settings.dictationWordInterval + 1 })}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-card-foreground">等待时间</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      settings.dictationWaitTime > 1 &&
                      updateSettings({ dictationWaitTime: settings.dictationWaitTime - 1 })
                    }
                  >
                    -
                  </Button>
                  <span className="w-16 text-center text-card-foreground">{settings.dictationWaitTime} 秒</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSettings({ dictationWaitTime: settings.dictationWaitTime + 1 })}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-card-foreground">字母朗读间隔</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      settings.letterInterval > 0.1 &&
                      updateSettings({ letterInterval: Math.round((settings.letterInterval - 0.1) * 10) / 10 })
                    }
                  >
                    -
                  </Button>
                  <span className="w-16 text-center text-card-foreground">{settings.letterInterval} 秒</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSettings({ letterInterval: Math.round((settings.letterInterval + 0.1) * 10) / 10 })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={getWordList}
          disabled={selectedUnits.length === 0}
        >
          开始听写 {selectedUnits.length > 0 ? `(${displayWordCount} 个单词)` : ''}
        </Button>
      </div>
    );
  }

  // 播放中状态
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          重置
        </Button>
        {isPaused && <div className="text-center text-muted-foreground">已暂停</div>}
        <div></div>
      </div>

      {/* 进度 */}
      <div>
        <div className="h-4 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / wordList.length) * 100}%` }}
          />
        </div>
        <div className="text-center text-2xl font-semibold text-foreground">
          {currentWordIndex + 1} / {wordList.length}
        </div>
      </div>

      {/* 播放动画 */}
      <div className="flex justify-center items-center py-16">
        <div className="relative">
          {/* 外圈波纹 */}
          <div
            className="absolute inset-0 bg-primary/20 rounded-full animate-ping"
            style={{ animationDuration: '1.5s' }}
          />
          <div
            className="absolute inset-0 bg-primary/30 rounded-full animate-ping"
            style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}
          />
          {/* 中心图标 */}
          <div className="relative w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
            <Volume2 className="h-16 w-16 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-4">
        {/* 未开始播放 - 显示开始按钮 */}
        {!isPlaying && !isPaused && !playbackComplete && (
          <Button size="lg" onClick={startPlayback}>
            <Play className="h-5 w-5 mr-2" />
            开始听写
          </Button>
        )}
        {/* 正在播放 - 显示暂停按钮 */}
        {isPlaying && !isPaused && (
          <Button size="lg" onClick={handlePauseResume}>
            <Pause className="h-5 w-5 mr-2" />
            暂停
          </Button>
        )}
        {/* 已暂停 - 显示继续按钮 */}
        {isPaused && (
          <Button size="lg" onClick={handlePauseResume}>
            <Play className="h-5 w-5 mr-2" />
            继续
          </Button>
        )}
        {/* 播放完成 - 显示进入校对模式按钮 */}
        {playbackComplete && !isPaused && (
          <Button
            size="lg"
            onClick={() => {
              setCheckingMode(true);
              setCheckIndex(0);
              startChecking();
            }}
          >
            开始校对
          </Button>
        )}
      </div>
    </div>
  );
}
