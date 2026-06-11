import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function BrewingRecordsPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: records, isLoading } = trpc.brewingRecords.getRecent.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.brewingRecords.delete.useMutation({
    onSuccess: () => {
      utils.brewingRecords.getRecent.invalidate();
      toast.success("冲煮记录删除成功");
    },
    onError: (error) => {
      toast.error(error.message || "删除失败");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">请先登陆</p>
      </div>
    );
  }

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这条冲煮记录吗？")) {
      deleteMutation.mutate({ id });
    }
  };

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
              <h1 className="text-xl font-semibold text-foreground">冲煮记录</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="container py-8">
        <div className="card-minimal">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : records && records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">{record.brewMethod || "未记录"}</p>
                      {record.tasteRating && (
                        <span className="badge-primary">{record.tasteRating}/10</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(record.brewDate).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* 冲煮参数 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground mb-2">
                      {record.waterTemperature && (
                        <div>
                          <p className="text-xs text-muted-foreground">水温</p>
                          <p className="font-medium text-foreground">{record.waterTemperature}℃</p>
                        </div>
                      )}
                      {record.grindSize && (
                        <div>
                          <p className="text-xs text-muted-foreground">研磨度</p>
                          <p className="font-medium text-foreground">{record.grindSize}</p>
                        </div>
                      )}
                      {record.coffeeAmount && (
                        <div>
                          <p className="text-xs text-muted-foreground">咖啡粉</p>
                          <p className="font-medium text-foreground">{record.coffeeAmount}g</p>
                        </div>
                      )}
                      {record.waterAmount && (
                        <div>
                          <p className="text-xs text-muted-foreground">水量</p>
                          <p className="font-medium text-foreground">{record.waterAmount}ml</p>
                        </div>
                      )}
                      {record.brewTime && (
                        <div>
                          <p className="text-xs text-muted-foreground">冲煮时间</p>
                          <p className="font-medium text-foreground">{record.brewTime}秒</p>
                        </div>
                      )}
                    </div>

                    {/* 备注 */}
                    {record.notes && (
                      <p className="text-sm text-foreground bg-background/50 p-2 rounded mt-2">
                        {record.notes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="text-destructive hover:text-destructive/80 ml-4 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Coffee className="empty-state-icon" />
              <p className="empty-state-title">还没有冲煮记录</p>
              <p className="empty-state-description">
                前往<button
                  onClick={() => setLocation("/beans")}
                  className="text-primary hover:underline"
                >
                  咖啡豆管理
                </button>
                添加豆子并记录冲煮过程
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
