import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cpu, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login state
  const [loginNickname, setLoginNickname] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup state
  const [signupNickname, setSignupNickname] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/profil");
    }
  }, [user, navigate]);

  // Generate email from nickname
  const nicknameToEmail = (nickname: string) => {
    const sanitized = nickname.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${sanitized}@pcbuilder.local`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginNickname || !loginPassword) {
      toast.error("Te rugăm să completezi toate câmpurile");
      return;
    }

    setIsLoading(true);
    const email = nicknameToEmail(loginNickname);
    const { error } = await signIn(email, loginPassword);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Nickname sau parolă greșită");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Contul nu a fost confirmat încă");
      } else {
        toast.error("Eroare la conectare: " + error.message);
      }
    } else {
      toast.success("Bine ai venit!");
      navigate("/profil");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupNickname || !signupPassword || !signupConfirmPassword) {
      toast.error("Te rugăm să completezi toate câmpurile");
      return;
    }

    // Validate nickname
    if (signupNickname.length < 3) {
      toast.error("Nickname-ul trebuie să aibă cel puțin 3 caractere");
      return;
    }

    if (signupNickname.length > 20) {
      toast.error("Nickname-ul poate avea maximum 20 caractere");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(signupNickname)) {
      toast.error("Nickname-ul poate conține doar litere, cifre și underscore");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Parolele nu coincid");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Parola trebuie să aibă cel puțin 6 caractere");
      return;
    }

    setIsLoading(true);
    const email = nicknameToEmail(signupNickname);
    const { error } = await signUp(email, signupPassword, signupNickname);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Acest nickname este deja folosit");
      } else {
        toast.error("Eroare la înregistrare: " + error.message);
      }
    } else {
      toast.success("Cont creat cu succes! Te poți conecta acum.");
      // Auto-login after signup
      const { error: loginError } = await signIn(email, signupPassword);
      if (!loginError) {
        navigate("/profil");
      }
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative">
            <Cpu className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 blur-lg bg-primary/30" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-primary">PC Builder</span>
            <span className="text-foreground"> Academy</span>
          </span>
        </Link>

        <Card className="tech-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bine ai venit!</CardTitle>
            <CardDescription>
              Conectează-te sau creează un cont pentru a-ți salva progresul
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Conectare</TabsTrigger>
                <TabsTrigger value="signup">Înregistrare</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-nickname">Nickname</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-nickname"
                        type="text"
                        placeholder="Nickname-ul tău"
                        className="pl-10"
                        value={loginNickname}
                        onChange={(e) => setLoginNickname(e.target.value)}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Parolă</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full neon-glow" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Se conectează...
                      </>
                    ) : (
                      "Conectare"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nickname">Nickname *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-nickname"
                        type="text"
                        placeholder="ElevulCurios"
                        className="pl-10"
                        value={signupNickname}
                        onChange={(e) => setSignupNickname(e.target.value)}
                        disabled={isLoading}
                        required
                        autoComplete="username"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      3-20 caractere, doar litere, cifre și underscore
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Parolă *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minim 6 caractere"
                        className="pl-10 pr-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmă parola *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type={showPassword ? "text" : "password"}
                        placeholder="Repetă parola"
                        className="pl-10"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full neon-glow" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Se creează contul...
                      </>
                    ) : (
                      "Creează cont"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Înapoi la pagina principală
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
