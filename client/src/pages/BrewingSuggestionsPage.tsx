import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";

export default function BrewingSuggestionsPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const beanId = parseInt(params.id as string);

  const [suggestion, setSuggestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: bean } = trpc.coffeeBeans.getById.useQuery(
    { id: beanId },
    { enabled: isAuthenticated && !isNaN(beanId) }
  );

  const generateMutation = trpc.brewingSuggestions.generate.useMutation({
    onSuccess: (data) => {
      setSuggestion(data.suggestion);
      toast.success("冲煮建议已生成");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "生成建议失败，请重试");
      setIsLoading(false);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">请先登陆</p>
      </div>
    );
  }

  const handleGenerateSuggestion = () => {
    if (!bean) return;
    setIsLoading(true);
    generateMutation.mutate({
      beanId: bean.id,
      roastLevel: bean.roastLevel || undefined,
      processingMethod: bean.processingMethod || undefined,
      origin: bean.origin || undefined,
    });
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
              onClick={() => setLocation(`/beans/${beanId}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">冲煮建议</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="container py-8">
        {!bean ? (
          <div className="card-minimal">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            {/* 豆子信息 */}
            <div className="card-minimal mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{bean.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bean.origin && (
                  <div>
                    <p className="text-sm text-muted-foreground">产地</p>
                    <p className="text-foreground">{bean.origin}</p>
                  </div>
                )}
                {bean.processingMethod && (
                  <div>
                    <p className="text-sm text-muted-foreground">处理法</p>
                    <p className="text-foreground">{bean.processingMethod}</p>
                  </div>
                )}
                {bean.roastLevel && (
                  <div>
                    <p className="text-sm text-muted-foreground">烘焙度</p>
                    <p className="text-foreground">{bean.roastLevel}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 生成建议按钮 */}
            {!suggestion && (
              <div className="card-minimal mb-8 text-center">
                <p className="text-muted-foreground mb-4">
                  点击下方按钮，根据豆子属性生成个性化冲煮建议
                </p>
                <Button
                  onClick={handleGenerateSuggestion}
                  disabled={isLoading}
                  className="btn-minimal-primary"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      生成中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      生成 AI 建议
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* 建议展示 */}
            {suggestion && (
              <div className="space-y-6">
                {/* 基础参数 */}
                <div className="card-minimal">
                  <h3 className="text-xl font-semibold text-foreground mb-6">冲煮参数</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 水温 */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-2">水温</p>
                      <p className="text-3xl font-semibold text-primary">
                        {suggestion.waterTemperature}
                        <span className="text-lg">℃</span>
                      </p>
                    </div>

                    {/* 研磨度 */}
                    <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                      <p className="text-sm text-muted-foreground mb-2">研磨度</p>
                      <p className="text-2xl font-semibold text-secondary">
                        {suggestion.grindSize}
                      </p>
                    </div>

                    {/* 粉水比 */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-2">粉水比</p>
                      <p className="text-2xl font-semibold text-primary">
                        {suggestion.coffeeToWaterRatio}
                      </p>
                    </div>

                    {/* 冲煮时间 */}
                    <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                      <p className="text-sm text-muted-foreground mb-2">冲煮时间</p>
                      <p className="text-3xl font-semibold text-secondary">
                        {suggestion.brewTime}
                        <span className="text-lg">秒</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 冲煮方式 */}
                <div className="card-minimal">
                  <h3 className="text-xl font-semibold text-foreground mb-4">推荐冲煮方式</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.brewMethods && suggestion.brewMethods.length > 0 ? (
                      suggestion.brewMethods.map((method: string, index: number) => (
                        <span key={index} className="badge-primary">
                          {method}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">未指定</p>
                    )}
                  </div>
                </div>

                {/* 冲煮提示 */}
                <div className="card-minimal bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <h3 className="text-xl font-semibold text-foreground mb-4">💡 冲煮提示</h3>
                  <p className="text-lg text-foreground leading-relaxed">
                    {suggestion.tips || "享受冲煮的过程，发现属于你的风味"}
                  </p>
                </div>

                {/* 重新生成按钮 */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleGenerateSuggestion}
                    disabled={isLoading}
                    className="btn-minimal-secondary flex-1"
                  >
                    {isLoading ? "生成中..." : "重新生成建议"}
                  </Button>
                  <Button
                    onClick={() => setLocation(`/beans/${beanId}`)}
                    className="btn-minimal-outline flex-1"
                  >
                    返回豆子详情
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
