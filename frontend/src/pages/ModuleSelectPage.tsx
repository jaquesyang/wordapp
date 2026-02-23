/**
 * 功能模块选择页面
 */
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Eye,
  PenTool,
  Ear,
} from "lucide-react";

const modules = [
  {
    id: "learn" as const,
    title: "学单词",
    description: "查看单词列表，点击发音学习",
    icon: BookOpen,
    color: "bg-green-500",
  },
  {
    id: "read" as const,
    title: "读单词",
    description: "随机展示单词卡片，练习认读",
    icon: Eye,
    color: "bg-blue-500",
  },
  {
    id: "write" as const,
    title: "写单词",
    description: "看中文写英文，检测学习效果",
    icon: PenTool,
    color: "bg-orange-500",
  },
  {
    id: "dictation" as const,
    title: "听写单词",
    description: "听音频写单词，模拟听写测试",
    icon: Ear,
    color: "bg-purple-500",
  },
];

interface ModuleSelectPageProps {
  onSelectModule: (moduleId: "learn" | "read" | "write" | "dictation") => void;
}

export function ModuleSelectPage({ onSelectModule }: ModuleSelectPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-foreground">选择学习方式</h2>
        </div>

        {/* 模块卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary group"
                onClick={() => onSelectModule(module.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* 图标 */}
                    <div className={`w-20 h-20 rounded-full ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>

                    {/* 标题和描述 */}
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-card-foreground">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
