'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useAppStore } from '@/stores/use-app-store';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { Word } from '@/types';

// Context for sharing playWord function and playingWord state
const LearnWordsContext = createContext<{
  playWord: (word: Word) => void;
  playingWord: number | null;
}>({
  playWord: () => {},
  playingWord: null,
});

export function useLearnWords() {
  return useContext(LearnWordsContext);
}

interface LearnWordsClientProps {
  grade: string;
  totalWords: number;
  children: React.ReactNode;
}

export function LearnWordsClient({ grade, totalWords, children }: LearnWordsClientProps) {
  const { settings, setAudioType, setCurrentGrade, setCurrentModule } = useAppStore();
  const [playingWord, setPlayingWord] = useState<number | null>(null);

  useEffect(() => {
    setCurrentGrade(grade);
  }, [grade, setCurrentGrade]);

  useEffect(() => {
    setCurrentModule('learn');
    return () => {
      setCurrentModule(null);
    };
  }, [setCurrentModule]);

  // 播放单词发音
  const playWord = async (word: Word) => {
    setPlayingWord(word.id);
    try {
      const audioUrl = `/api/audio/proxy?word=${encodeURIComponent(word.word)}&type=${settings.audioType === 'uk' ? '1' : '2'}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingWord(null);
      audio.onerror = () => setPlayingWord(null);
      await audio.play();
    } catch (error) {
      console.error('音频播放失败:', error);
      setPlayingWord(null);
    }
  };

  return (
    <LearnWordsContext.Provider value={{ playWord, playingWord }}>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">
          共 {totalWords} 个单词，点击单词和音标播放发音
        </p>
        <Select value={settings.audioType} onValueChange={(v) => setAudioType(v as 'uk' | 'us')}>
          <SelectTrigger className="w-[80px] h-8 text-sm border-border hover:border-primary hover:bg-primary/5 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uk">英音</SelectItem>
            <SelectItem value="us">美音</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {children}
    </LearnWordsContext.Provider>
  );
}
