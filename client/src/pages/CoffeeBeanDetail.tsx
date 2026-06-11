import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CoffeeBeanDetail() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const beanId = parseInt(params.id as string);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    brewDate: new Date().toISOString().split("T")[0],
    brewMethod: "",
    waterTemperature: "",
    grindSize: "",
    coffeeAmount: "",
    waterAmount: "",
    brewTime: "",
    tasteRating: "",
    notes: "",
  });

  const utils = trpc.useUtils();

  const { data: bean, isLoading: beanLoading } = trpc.coffeeBeans.getById.useQuery(
    { id: beanId },
    { enabled: isAuthenticated && !isNaN(beanId) }
  );

  const { data: records, isLoading: recordsLoading } = trpc.brewingRecords.listByBean.useQuery(
    { beanId },
    { enabled: isAuthenticated && !isNaN(beanId) }
  );

  const createRecordMutation = trpc.brewingRecords.create.useMutation({
    onSuccess: () => {
      utils.brewingRecords.listByBean.invalidate({ beanId });
      setIsDialogOpen(false);
      setFormData({
        brewDate: new Date().toISOString().split("T")[0],
        brewMethod: "",
        waterTemperature: "",
        grindSize: "",
        coffeeAmount: "",
        waterAmount: "",
        brewTime: "",
        tasteRating: "",
        notes: "",
      });
      toast.success("冲煮记录添加成功");
    },
    onError: (error) => {
      toast.error(error.message || "添加失败");
    },
  });

  const deleteRecordMutation = trpc.brewingRecords.delete.useMutation({
    onSuccess: () => {
      utils.brewingRecords.listByBean.invalidate({ beanId });
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

  if (beanLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/beans")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </nav>
        <main className="container py-8">
          <Skeleton className="h-48 w-full" />
        </main>
      </div>
    );
  }

  if (!bean) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/beans")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </nav>
        <main className="container py-8">
          <div className="empty-state">
            <p className="empty-state-title">咖啡豆不存在</p>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRecordMutation.mutate({
      beanId,
      brewDate: new Date(formData.brewDate),
      brewMethod: formData.brewMethod || undefined,
      waterTemperature: formData.waterTemperature ? parseInt(formData.waterTemperature) : undefined,
      grindSize: formData.grindSize || undefined,
      coffeeAmount: formData.coffeeAmount ? parseFloat(formData.coffeeAmount) : undefined,
      waterAmount: formData.waterAmount ? parseFloat(formData.waterAmount) : undefined,
      brewTime: formData.brewTime ? parseInt(formData.brewTime) : undefined,
      tasteRating: formData.tasteRating ? parseInt(formData.tasteRating) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleDeleteRecord = (recordId: number) => {
    if (confirm("确定要删除这条冲煮记录吗？")) {
      deleteRecordMutation.mutate({ id: recordId });
    }
  };

  // 计算养豆天数
  const purchaseDate = new Date(bean.purchaseDate);
  const today = new Date();
  const daysAged = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 确定养豆状态（假设最佳赏味期为 7-30 天）
  let status = "养豆中";
  let statusColor = "text-primary";
  if (daysAged >= 7 && daysAged <= 30) {
    status = "最佳赏味期";
    statusColor = "text-secondary";
  } else if (daysAged > 30) {
    status = "已过期";
    statusColor = "text-destructive";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/beans")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">{bean.name}</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="container py-8">
        {/* 豆子信息卡片 */}
        <div className="card-minimal mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{bean.name}</h2>
              <div className="space-y-3">
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

            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">入手日期</p>
                  <p className="text-foreground">{new Date(bean.purchaseDate).toLocaleDateString("zh-CN")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">养豆天数</p>
                  <p className="text-2xl font-semibold text-foreground">{daysAged} 天</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">养豆状态</p>
                  <p className={`text-lg font-semibold ${statusColor}`}>{status}</p>
                </div>
              </div>
            </div>
          </div>

          {bean.notes && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">备注</p>
              <p className="text-foreground">{bean.notes}</p>
            </div>
          )}
        </div>

        {/* 冲煮记录 */}
        <div className="card-minimal">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">冲煮记录</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setLocation(`/beans/${bean.id}/suggestions`)}
                className="btn-minimal-secondary"
              >
                ✨ 获取 AI 建议
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-minimal-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    添加记录
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>添加冲煮记录</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="brewDate">冲煮日期</Label>
                    <Input
                      id="brewDate"
                      type="date"
                      value={formData.brewDate}
                      onChange={(e) => setFormData({ ...formData, brewDate: e.target.value })}
                      className="input-minimal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brewMethod">冲煮方式</Label>
                    <Input
                      id="brewMethod"
                      value={formData.brewMethod}
                      onChange={(e) => setFormData({ ...formData, brewMethod: e.target.value })}
                      placeholder="例：手冲、摩卡壶、意式机"
                      className="input-minimal"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="waterTemperature">水温 (℃)</Label>
                      <Input
                        id="waterTemperature"
                        type="number"
                        value={formData.waterTemperature}
                        onChange={(e) => setFormData({ ...formData, waterTemperature: e.target.value })}
                        placeholder="92"
                        className="input-minimal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grindSize">研磨度</Label>
                      <Input
                        id="grindSize"
                        value={formData.grindSize}
                        onChange={(e) => setFormData({ ...formData, grindSize: e.target.value })}
                        placeholder="中细"
                        className="input-minimal"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coffeeAmount">咖啡粉 (g)</Label>
                      <Input
                        id="coffeeAmount"
                        type="number"
                        step="0.1"
                        value={formData.coffeeAmount}
                        onChange={(e) => setFormData({ ...formData, coffeeAmount: e.target.value })}
                        placeholder="15"
                        className="input-minimal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="waterAmount">水量 (ml)</Label>
                      <Input
                        id="waterAmount"
                        type="number"
                        step="0.1"
                        value={formData.waterAmount}
                        onChange={(e) => setFormData({ ...formData, waterAmount: e.target.value })}
                        placeholder="250"
                        className="input-minimal"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brewTime">冲煮时间 (秒)</Label>
                      <Input
                        id="brewTime"
                        type="number"
                        value={formData.brewTime}
                        onChange={(e) => setFormData({ ...formData, brewTime: e.target.value })}
                        placeholder="180"
                        className="input-minimal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tasteRating">口感评分 (1-10)</Label>
                      <Input
                        id="tasteRating"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.tasteRating}
                        onChange={(e) => setFormData({ ...formData, tasteRating: e.target.value })}
                        placeholder="8"
                        className="input-minimal"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">备注</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="记录冲煮过程中的观察"
                      className="input-minimal resize-none h-20"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      className="btn-minimal-primary flex-1"
                      disabled={createRecordMutation.isPending}
                    >
                      添加
                    </Button>
                  </div>
                </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {recordsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : records && records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">{record.brewMethod || "未记录"}</p>
                      {record.tasteRating && (
                        <span className="badge-primary">{record.tasteRating}/10</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(record.brewDate).toLocaleDateString("zh-CN")}
                    </p>
                    {(record.waterTemperature || record.grindSize || record.coffeeAmount || record.waterAmount) && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {record.waterTemperature && <p>水温: {record.waterTemperature}℃</p>}
                        {record.grindSize && <p>研磨度: {record.grindSize}</p>}
                        {record.coffeeAmount && record.waterAmount && (
                          <p>粉水比: {record.coffeeAmount}g : {record.waterAmount}ml</p>
                        )}
                        {record.brewTime && <p>冲煮时间: {record.brewTime}秒</p>}
                      </div>
                    )}
                    {record.notes && (
                      <p className="text-sm text-foreground mt-2">{record.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRecord(record.id)}
                    className="text-destructive hover:text-destructive/80 ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state-description">暂无冲煮记录</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
