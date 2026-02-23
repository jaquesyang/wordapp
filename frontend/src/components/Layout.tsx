/**
 * 应用主布局组件
 */
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { useGrades } from "@/hooks/useGrades";
import { BookOpen, Settings, ChevronLeft, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface LayoutProps {
  children: ReactNode;
  onBackToHome?: () => void;
  onBackToModules?: () => void;
}

const moduleNames: Record<string, string> = {
  learn: "学单词",
  read: "读单词",
  write: "写单词",
  dictation: "听写单词",
};

export function Layout({ children, onBackToHome, onBackToModules }: LayoutProps) {
  const { settings, currentModule, setTheme, navigationConfirmationDisabled } = useAppStore();
  const navigate = useNavigate();
  const { data: grades } = useGrades();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 获取当前年级的名称
  const currentGradeName = useMemo(() => {
    if (!settings.currentGrade || !grades) return null;
    const grade = grades.find((g) => g.id === settings.currentGrade);
    return grade?.name || null;
  }, [settings.currentGrade, grades]);

  // 获取当前页面标题
  const currentPageTitle = useMemo(() => {
    if (currentModule) return moduleNames[currentModule];
    if (settings.currentGrade) return "选择学习方式";
    return "选择年级";
  }, [currentModule, settings.currentGrade]);

  // 处理年级按钮点击
  const handleGradeClick = () => {
    // 如果禁用了确认对话框，或不在功能页面，直接跳转
    if (navigationConfirmationDisabled || !currentModule) {
      if (onBackToHome) {
        onBackToHome();
      } else {
        navigate("/");
      }
    } else {
      // 在功能页面且需要确认，显示确认对话框
      setPendingNavigation("grade");
      setShowConfirmDialog(true);
    }
  };

  // 确认返回（需要记录是返回年级还是返回模块）
  const [pendingNavigation, setPendingNavigation] = useState<"grade" | "module" | null>(null);

  // 确认返回
  const confirmNavigation = () => {
    setShowConfirmDialog(false);
    if (pendingNavigation === "grade") {
      if (onBackToHome) {
        onBackToHome();
      } else {
        navigate("/");
      }
    } else if (pendingNavigation === "module") {
      if (onBackToModules) {
        onBackToModules();
      } else if (settings.currentGrade) {
        navigate(`/grade/${settings.currentGrade}`);
      }
    }
    setPendingNavigation(null);
  };

  // 确认返回年级选择（保留用于向后兼容）
  const confirmBackToGrade = () => {
    setShowConfirmDialog(false);
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate("/");
    }
  };

  // 返回模块选择
  const handleModuleClick = () => {
    // 如果禁用了确认对话框，直接返回
    if (navigationConfirmationDisabled) {
      if (onBackToModules) {
        onBackToModules();
      } else if (settings.currentGrade) {
        navigate(`/grade/${settings.currentGrade}`);
      }
    } else {
      // 在练习过程中，显示确认对话框
      setPendingNavigation("module");
      setShowConfirmDialog(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* 左侧 - 图标 + 切换年级按钮 */}
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                {currentGradeName && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGradeClick}
                    className="text-sm font-medium hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                  >
                    {currentGradeName}
                  </Button>
                )}
                {currentModule && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleModuleClick}
                    className="h-8 w-8 hover:bg-accent text-foreground"
                    title="返回模块选择"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
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
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>

      {/* 确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">确认返回</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              返回后将丢失当前的学习进度，确定要返回吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmNavigation}>
              确认返回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
