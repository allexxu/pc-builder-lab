import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import QuizLayout from "@/components/quiz/QuizLayout";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isTeacher, loading, signIn } = useAuth();

  // Redirect if already authenticated as teacher
  useEffect(() => {
    if (!loading && user && isTeacher) {
      navigate("/quiz/admin", { replace: true });
    }
  }, [user, isTeacher, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Eroare la autentificare",
          description: error.message || "Email sau parolă incorectă",
          variant: "destructive",
        });
        setLoginLoading(false);
        return;
      }

      toast({
        title: "Autentificare reușită",
        description: "Bine ai revenit!",
      });

      // Navigation will be handled by useEffect when isTeacher updates
    } catch (err) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut realiza autentificarea",
        variant: "destructive",
      });
      setLoginLoading(false);
    }
  };

  // Show loading while checking auth state OR if already authenticated as teacher
  if (loading || (user && isTeacher)) {
    return (
      <QuizLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Mod Profesor</CardTitle>
            <CardDescription>
              Autentifică-te pentru a crea și gestiona quiz-uri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="profesor@scoala.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Parolă</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                Intră în cont
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/quiz"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Înapoi la pagina principală
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </QuizLayout>
  );
};

export default AdminLogin;
