import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Coffee, TrendingUp, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Coffee className="w-12 h-12 text-primary" />
          </div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">咖啡豆养豆记录</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/dashboard")}
                className="text-foreground hover:bg-muted"
              >
                仪表盘
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation("/beans")}
                className="text-foreground hover:bg-muted"
              >
                咖啡豆
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation("/records")}
                className="text-foreground hover:bg-muted"
              >
                冲煮记录
              </Button>
            </div>
          </div>
        </nav>

        <main className="container py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-foreground mb-4">欢迎回来</h2>
            <p className="text-lg text-muted-foreground">开始管理你的咖啡豆养豆之旅</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card-minimal cursor-pointer hover:shadow-lg transition-all" onClick={() => setLocation("/beans")}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Coffee className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">咖啡豆管理</h3>
                  <p className="text-sm text-muted-foreground">添加、编辑和追踪你的咖啡豆信息</p>
                </div>
              </div>
            </div>

            <div className="card-minimal cursor-pointer hover:shadow-lg transition-all" onClick={() => setLocation("/records")}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">冲煮记录</h3>
                  <p className="text-sm text-muted-foreground">记录每次冲煮的详细数据和评分</p>
                </div>
              </div>
            </div>

            <div className="card-minimal cursor-pointer hover:shadow-lg transition-all" onClick={() => setLocation("/dashboard")}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">AI 冲煮建议</h3>
                  <p className="text-sm text-muted-foreground">获取基于豆子属性的个性化建议</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 border border-border">
            <div className="absolute top-4 right-8 w-24 h-24 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-8 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                <span className="font-semibold text-foreground">开始你的咖啡豆管理之旅</span>
                <br />
                记录每一次冲煮，发现最适合你的风味
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">咖啡豆养豆记录</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/login")}>登录</Button>
            <Button onClick={() => setLocation("/login")}>注册</Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container flex flex-col items-center justify-center py-12">
        <div className="max-w-md w-full text-center space-generous">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Coffee className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl font-semibold text-foreground mb-2">咖啡豆养豆记录</h2>
            <p className="subtitle">为咖啡爱好者打造的养豆管理助手</p>
          </div>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Coffee className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">豆子管理</p>
                <p className="text-sm text-muted-foreground">记录豆子信息、产地、处理法、烘焙度</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">养豆追踪</p>
                <p className="text-sm text-muted-foreground">自动计算养豆天数，展示最佳赏味期</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">AI 建议</p>
                <p className="text-sm text-muted-foreground">获取个性化冲煮参数建议</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setLocation("/login")}
            className="w-full btn-minimal-primary py-3 text-base font-semibold"
          >
            登录 / 注册
          </Button>

          <div className="relative mt-12 h-24">
            <div className="absolute top-0 left-1/4 w-16 h-16 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-1/4 w-20 h-20 bg-secondary/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 咖啡豆养豆记录 · 为咖啡爱好者打造</p>
        </div>
      </footer>
    </div>
  );
}
