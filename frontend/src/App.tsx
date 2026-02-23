/**
 * 单词学习应用主组件 - 使用 React Router
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "./stores/useAppStore";
import { Layout } from "./components/Layout";
import { GradeSelectionPage } from "./pages/GradeSelectionPage";
import { ModuleSelectPage } from "./pages/ModuleSelectPage";
import { LearnWordsPage } from "./pages/LearnWordsPage";
import { ReadWordsPage } from "./pages/ReadWordsPage";
import { WriteWordsPage } from "./pages/WriteWordsPage";
import { DictationPage } from "./pages/DictationPage";

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 路由同步组件 - 同步 URL 路径和 Zustand 状态
function RouteSync() {
  const location = useLocation();
  const { settings, currentModule, setCurrentGrade, setCurrentModule } = useAppStore();

  useEffect(() => {
    const path = location.pathname;

    // 根据路径更新状态
    if (path === "/" || path === "/grade") {
      if (settings.currentGrade !== null) {
        setCurrentGrade(null);
      }
      if (currentModule !== null) {
        setCurrentModule(null);
      }
    } else if (path.startsWith("/grade/")) {
      const matches = path.match(/^\/grade\/([^/]+)$/);
      if (matches) {
        const grade = matches[1];
        if (settings.currentGrade !== grade) {
          setCurrentGrade(grade);
        }
        if (currentModule !== null) {
          setCurrentModule(null);
        }
      }
    } else if (path.startsWith("/module/")) {
      const matches = path.match(/^\/module\/([^/]+)$/);
      if (matches) {
        const module = matches[1] as any;
        if (currentModule !== module) {
          setCurrentModule(module);
        }
      }
    }
  }, [location.pathname]);

  return null;
}

// 主应用内容
function AppContent() {
  const navigate = useNavigate();
  const { settings, currentModule, setCurrentGrade, setCurrentModule } = useAppStore();

  // 处理年级选择 - 使用 navigate 而不是 pushState
  const handleSelectGrade = (gradeId: string) => {
    setCurrentGrade(gradeId);
    navigate(`/grade/${gradeId}`);
  };

  // 处理模块选择
  const handleSelectModule = (moduleId: string) => {
    setCurrentModule(moduleId as any);
    navigate(`/module/${moduleId}`);
  };

  // 返回模块选择
  const handleBackToModules = () => {
    setCurrentModule(null);
    navigate(`/grade/${settings.currentGrade}`);
  };

  // 返回首页
  const handleBackToHome = () => {
    setCurrentGrade(null);
    setCurrentModule(null);
    navigate("/");
  };

  return (
    <Routes>
      {/* 首页 / 年级选择 */}
      <Route path="/" element={<GradeSelectionPage onSelectGrade={handleSelectGrade} />} />
      <Route path="/grade" element={<Navigate to="/" replace />} />

      {/* 年级已选择，显示模块选择 */}
      <Route
        path="/grade/:gradeId"
        element={
          <Layout onBackToHome={handleBackToHome}>
            <ModuleSelectPage onSelectModule={handleSelectModule} />
          </Layout>
        }
      />

      {/* 学习模块页面 */}
      <Route
        path="/module/learn"
        element={
          <Layout onBackToHome={handleBackToHome} onBackToModules={handleBackToModules}>
            <LearnWordsPage />
          </Layout>
        }
      />

      <Route
        path="/module/read"
        element={
          <Layout onBackToHome={handleBackToHome} onBackToModules={handleBackToModules}>
            <ReadWordsPage />
          </Layout>
        }
      />

      <Route
        path="/module/write"
        element={
          <Layout onBackToHome={handleBackToHome} onBackToModules={handleBackToModules}>
            <WriteWordsPage />
          </Layout>
        }
      />

      <Route
        path="/module/dictation"
        element={
          <Layout onBackToHome={handleBackToHome} onBackToModules={handleBackToModules}>
            <DictationPage />
          </Layout>
        }
      />

      {/* 404 重定向 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteSync />
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
