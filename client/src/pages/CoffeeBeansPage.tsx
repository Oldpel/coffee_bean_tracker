import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee, Plus, ArrowLeft, Trash2, Edit } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CoffeeBeansPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBean, setEditingBean] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    processingMethod: "",
    roastLevel: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: beans, isLoading } = trpc.coffeeBeans.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.coffeeBeans.create.useMutation({
    onSuccess: () => {
      utils.coffeeBeans.list.invalidate();
      setIsDialogOpen(false);
      setFormData({
        name: "",
        origin: "",
        processingMethod: "",
        roastLevel: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setEditingBean(null);
      toast.success("咖啡豆添加成功");
    },
    onError: (error) => {
      toast.error(error.message || "添加失败");
    },
  });

  const updateMutation = trpc.coffeeBeans.update.useMutation({
    onSuccess: () => {
      utils.coffeeBeans.list.invalidate();
      setIsDialogOpen(false);
      setEditingBean(null);
      toast.success("咖啡豆更新成功");
    },
    onError: (error) => {
      toast.error(error.message || "更新失败");
    },
  });

  const deleteMutation = trpc.coffeeBeans.delete.useMutation({
    onSuccess: () => {
      utils.coffeeBeans.list.invalidate();
      toast.success("咖啡豆删除成功");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("请输入豆子名称");
      return;
    }

    const submitData = {
      ...formData,
      purchaseDate: new Date(formData.purchaseDate),
    };

    if (editingBean) {
      updateMutation.mutate({
        id: editingBean.id,
        ...submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (bean: any) => {
    setEditingBean(bean);
    setFormData({
      name: bean.name,
      origin: bean.origin || "",
      processingMethod: bean.processingMethod || "",
      roastLevel: bean.roastLevel || "",
      purchaseDate: new Date(bean.purchaseDate).toISOString().split("T")[0],
      notes: bean.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个咖啡豆吗？")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBean(null);
    setFormData({
      name: "",
      origin: "",
      processingMethod: "",
      roastLevel: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
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
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">咖啡豆管理</h1>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="btn-minimal-primary"
                onClick={() => {
                  setEditingBean(null);
                  setFormData({
                    name: "",
                    origin: "",
                    processingMethod: "",
                    roastLevel: "",
                    purchaseDate: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加豆子
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingBean ? "编辑咖啡豆" : "添加新咖啡豆"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">豆子名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例：埃塞俄比亚 耶加雪菲"
                    className="input-minimal"
                  />
                </div>
                <div>
                  <Label htmlFor="origin">产地</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="例：埃塞俄比亚"
                    className="input-minimal"
                  />
                </div>
                <div>
                  <Label htmlFor="processingMethod">处理法</Label>
                  <Input
                    id="processingMethod"
                    value={formData.processingMethod}
                    onChange={(e) => setFormData({ ...formData, processingMethod: e.target.value })}
                    placeholder="例：水洗、日晒、蜜处理"
                    className="input-minimal"
                  />
                </div>
                <div>
                  <Label htmlFor="roastLevel">烘焙度</Label>
                  <Input
                    id="roastLevel"
                    value={formData.roastLevel}
                    onChange={(e) => setFormData({ ...formData, roastLevel: e.target.value })}
                    placeholder="例：浅、中浅、中、中深、深"
                    className="input-minimal"
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseDate">入手日期</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="input-minimal"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">备注</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="添加任何备注信息"
                    className="input-minimal resize-none h-24"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="btn-minimal-primary flex-1"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingBean ? "更新" : "添加"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : beans && beans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beans.map((bean) => (
              <div
                key={bean.id}
                className="card-minimal cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setLocation(`/beans/${bean.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{bean.name}</h3>
                    {bean.origin && (
                      <p className="text-sm text-muted-foreground">{bean.origin}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(bean);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bean.id);
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {bean.processingMethod && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">处理法：</span>
                      <span className="text-foreground">{bean.processingMethod}</span>
                    </div>
                  )}
                  {bean.roastLevel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">烘焙度：</span>
                      <span className="text-foreground">{bean.roastLevel}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">入手日期：</span>
                    <span className="text-foreground">
                      {new Date(bean.purchaseDate).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Coffee className="empty-state-icon" />
            <p className="empty-state-title">还没有添加咖啡豆</p>
            <p className="empty-state-description">点击上方"添加豆子"按钮开始添加你的第一个咖啡豆</p>
          </div>
        )}
      </main>
    </div>
  );
}
