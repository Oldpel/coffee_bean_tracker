import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { username, password, name: name || username }
        : { username, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "操作失败");
        return;
      }

      setLocation("/");
      window.location.reload();
    } catch {
      setError("网络错误，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">咖啡豆养豆记录</h1>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Coffee className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              {isRegister ? "创建账户" : "欢迎回来"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isRegister ? "注册后开始记录你的咖啡豆" : "登录你的账户继续使用"}
            </p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">用户名</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="输入用户名"
                    required
                    minLength={3}
                    maxLength={32}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="输入密码"
                      required
                      minLength={6}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">昵称 <span className="text-muted-foreground font-normal">（可选）</span></Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="你的昵称"
                      className="h-11"
                    />
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? "处理中..." : isRegister ? "注册" : "登录"}
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline underline-offset-4"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setError("");
                    }}
                  >
                    {isRegister ? "已有账户？去登录" : "没有账户？去注册"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            为咖啡爱好者打造的养豆管理助手
          </p>
        </div>
      </main>
    </div>
  );
}
