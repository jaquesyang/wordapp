'use client';

import { useAppStore } from '@/stores/use-app-store';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Settings, Volume2, Palette } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function Header() {
  const { settings, setTheme, setAudioType } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="border-b border-border mb-6">
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-xl font-bold">单词学习应用</h1>
          {settings.currentGrade && (
            <p className="text-sm text-muted-foreground">
              {settings.currentGrade}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 音频类型选择 */}
          <NativeSelect
            value={settings.audioType}
            onChange={(e) => setAudioType(e.target.value as 'uk' | 'us')}
            className="w-[90px] h-9 text-sm"
          >
            <option value="uk">英音</option>
            <option value="us">美音</option>
          </NativeSelect>

          {/* 设置按钮 */}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>设置</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* 主题选择 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    主题
                  </label>
                  <NativeSelect
                    value={settings.theme}
                    onChange={(e) => setTheme(e.target.value as 'green' | 'blue' | 'orange' | 'dark')}
                    className="w-full"
                  >
                    <option value="green">绿色</option>
                    <option value="blue">蓝色</option>
                    <option value="orange">橙色</option>
                    <option value="dark">深色</option>
                  </NativeSelect>
                </div>

                {/* 音频类型 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    发音类型
                  </label>
                  <NativeSelect
                    value={settings.audioType}
                    onChange={(e) => setAudioType(e.target.value as 'uk' | 'us')}
                    className="w-full"
                  >
                    <option value="uk">英音</option>
                    <option value="us">美音</option>
                  </NativeSelect>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
