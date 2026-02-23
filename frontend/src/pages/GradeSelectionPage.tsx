/**
 * 年级选择页面
 */
import { useGrades } from "@/hooks/useGrades";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Settings, Check } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

interface GradeSelectionPageProps {
  onSelectGrade: (gradeId: string) => void;
}

export function GradeSelectionPage({ onSelectGrade }: GradeSelectionPageProps) {
  const { data: grades, isLoading, error } = useGrades();
  const { settings, setTheme } = useAppStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">加载失败，请重试</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">单词学习</h1>
          </div>

          {/* 设置按钮 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent text-foreground">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>主题</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("green")} className="cursor-pointer">
                <span className="flex-1">清新绿</span>
                {settings.theme === "green" && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("blue")} className="cursor-pointer">
                <span className="flex-1">书香蓝</span>
                {settings.theme === "blue" && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("orange")} className="cursor-pointer">
                <span className="flex-1">夕阳橙</span>
                {settings.theme === "orange" && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                <span className="flex-1">深色模式</span>
                {settings.theme === "dark" && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-foreground">选择年级</h2>
            <p className="text-muted-foreground">请选择要学习的年级教材</p>
          </div>

          {/* 年级卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grades?.map((grade) => (
              <Card
                key={grade.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary group"
                onClick={() => {
                  console.log("Clicked grade:", grade.id);
                  onSelectGrade(grade.id);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* 封面图片 - 3:4 比例 */}
                    {grade.cover ? (
                      <img
                        src={grade.cover}
                        alt={grade.name || ""}
                        className="w-36 h-48 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-36 h-48 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary" />
                      </div>
                    )}

                    {/* 年级名称 */}
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{grade.name}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
