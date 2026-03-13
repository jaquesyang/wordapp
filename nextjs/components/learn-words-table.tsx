'use client';

import { Volume2 } from 'lucide-react';
import type { Word, Unit } from '@/types';
import { useLearnWords } from './learn-words-client';

const columnWidths = {
  word: '30%',
  phonetic: '30%',
  chinese: '40%',
};

// 根据mark字段获取单词显示样式
function getWordDisplay(word: Word): { display: string; className: string } {
  const hasB = word.mark === 'B' || word.mark === 'BS';
  const hasS = word.mark === 'S' || word.mark === 'BS';

  let display = word.word;
  let className = '';

  if (hasB) {
    className += ' font-bold';
  }
  if (hasS) {
    display = `* ${display}`;
  }

  return { display, className: className.trim() };
}

interface LearnWordsTableProps {
  groupedWords: Record<number, Word[]>;
  sortedUnits: number[];
  units: Unit[];
}

export function LearnWordsTable({ groupedWords, sortedUnits, units }: LearnWordsTableProps) {
  const { playWord, playingWord } = useLearnWords();

  return (
    <div className="space-y-6">
      {sortedUnits.map((unitNum) => {
        const unitWords = groupedWords[unitNum];
        const unitName = units.find((u) => u.unit === unitNum)?.name || `单元 ${unitNum}`;

        return (
          <div key={unitNum} className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight text-card-foreground">
                {unitName}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({unitWords.length} 个单词)
                </span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed" style={{ minWidth: '600px' }}>
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
                          className={index < unitWords.length - 1 ? 'border-b border-border/50' : ''}
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
