import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: beans, isLoading: beansLoading } = trpc.coffeeBeans.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: recentRecords, isLoading: recordsLoading } = trpc.brewingRecords.getRecent.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">请先登陆</p>
      </div>
    );
  }

  const totalBeans = beans?.length || 0;
  const totalRecords = recentRecords?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">仪表盘</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="container py-8">
        {/* 最佳赏味期豆子 */}
        <div className="card-minimal mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">🌟 最佳赏味期豆子</h2>
          {beansLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : beans ? (
            (() => {
              const bestBeans = beans.filter((bean: any) => {
                const purchaseDate = new Date(bean.purchaseDate);
                const today = new Date();
                const daysAged = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysAged >= 7 && daysAged <= 30;
              });

              return bestBeans.length > 0 ? (
                <div className="space-y-2">
                  {bestBeans.map((bean: any) => (
                    <div
                      key={bean.id}
                      onClick={() => setLocation(`/beans/${bean.id}`)}
                      className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors"
                    >
                      <p className="font-semibold text-foreground">{bean.name}</p>
                      <p className="text-xs text-muted-foreground">{bean.origin || "未指定"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">暂无最佳赏味期豆子</p>
              );
            })()
          ) : null}
        </div>

        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 咖啡豆总数 */}
          <div className="card-minimal">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">咖啡豆总数</p>
                {beansLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-semibold text-foreground">{totalBeans}</p>
                )}
              </div>
              <Coffee className="w-8 h-8 text-primary/20" />
            </div>
          </div>

          {/* 冲煮记录总数 */}
          <div className="card-minimal">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">冲煮记录</p>
                {recordsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-semibold text-foreground">{totalRecords}</p>
                )}
              </div>
              <Coffee className="w-8 h-8 text-secondary/20" />
            </div>
          </div>
        </div>

        {/* 最近冲煮记录 */}
        <div className="card-minimal mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">最近冲煮记录</h2>
          {recordsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentRecords && recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{record.brewMethod || "未记录"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.brewDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  {record.tasteRating && (
                    <div className="text-right">
                      <p className="font-semibold text-primary">{record.tasteRating}/10</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state-description">暂无冲煮记录</p>
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div className="flex gap-4">
          <Button
            onClick={() => setLocation("/beans")}
            className="btn-minimal-primary flex-1"
          >
            管理咖啡豆
          </Button>
          <Button
            onClick={() => setLocation("/records")}
            className="btn-minimal-secondary flex-1"
          >
            查看冲煮记录
          </Button>
        </div>
      </main>
    </div>
  );
}
