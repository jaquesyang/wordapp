'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/use-app-store';
import { BookOpen, Settings, ChevronLeft, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
}

const moduleNames: Record<string, string> = {
  learn: '学单词',
  read: '读单词',
  write: '写单词',
  dictation: '听写单词',
};

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { settings, setTheme } = useAppStore();
  const [grades, setGrades] = useState<any[]>([]);

  // Load grades data on mount
  useEffect(() => {
    async function loadGrades() {
      try {
        const res = await fetch('/api/grades');
        if (res.ok) {
          const gradesData = await res.json();
          setGrades(gradesData);
        }
      } catch (error) {
        console.error('Failed to load grades:', error);
      }
    }
    loadGrades();
  }, []);

  // 获取当前年级的名称
  const currentGradeName = grades.find((g) => g.id === settings.currentGrade)?.name || null;

  // 获取当前页面标题
  const currentPageTitle = pathname?.includes('/module/')
    ? moduleNames[pathname.split('/').pop() || '']
    : settings.currentGrade
    ? '选择学习方式'
    : '选择年级';

  // 是否在首页
  const isHomePage = pathname === '/';

  // 是否在模块页
  const isModulePage = pathname?.includes('/module/');

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* 左侧 - 图标 + 年级按钮 */}
              <div className="flex items-center gap-3">
                <Link href="/">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {!isHomePage && <span className="text-lg font-bold text-foreground">单词学习</span>}
                  </div>
                </Link>
                {currentGradeName && !isHomePage && (
                  <Link href="/">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm font-medium hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                    >
                      {currentGradeName}
                    </Button>
                  </Link>
                )}
                {isModulePage && (
                  <Link href={`/grade/${settings.currentGrade}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-accent text-foreground"
                      title="返回模块选择"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* 中间 - 页面标题 */}
              <h1 className="text-lg font-semibold text-foreground">{currentPageTitle}</h1>

              {/* 右侧 - 设置按钮 */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-accent text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>主题</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTheme('green')} className="cursor-pointer">
                      <span className="flex-1">清新绿</span>
                      {settings.theme === 'green' && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('blue')} className="cursor-pointer">
                      <span className="flex-1">书香蓝</span>
                      {settings.theme === 'blue' && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('orange')} className="cursor-pointer">
                      <span className="flex-1">夕阳橙</span>
                      {settings.theme === 'orange' && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
                      <span className="flex-1">深色模式</span>
                      {settings.theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </>
  );
}
