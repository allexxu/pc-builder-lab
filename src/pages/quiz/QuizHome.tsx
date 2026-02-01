import { Link } from "react-router-dom";
import { Zap, Users, Play, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuizLayout from "@/components/quiz/QuizLayout";

const QuizHome = () => {
  return (
    <QuizLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              TechQuiz
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Învață și competizionează în timp real cu colegii tăi!
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
          {/* Join Game Card - For Students */}
          <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Intră în Joc</h2>
                <p className="text-muted-foreground">
                  Ai un cod de la profesor? Intră în quiz și competizionează!
                </p>
                <Button asChild size="lg" className="w-full mt-4">
                  <Link to="/quiz/join">
                    <Play className="w-5 h-5 mr-2" />
                    Participă Acum
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Card - For Teachers */}
          <Card className="group relative overflow-hidden border-2 hover:border-cyan-500/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-10 h-10 text-cyan-500" />
                </div>
                <h2 className="text-2xl font-bold">Mod Profesor</h2>
                <p className="text-muted-foreground">
                  Creează quiz-uri și gestionează sesiuni de joc live.
                </p>
                <Button asChild size="lg" variant="outline" className="w-full mt-4">
                  <Link to="/quiz/admin/login">
                    <Shield className="w-5 h-5 mr-2" />
                    Accesează Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">⚡</div>
            <p className="text-sm text-muted-foreground">Răspunsuri în timp real</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">🏆</div>
            <p className="text-sm text-muted-foreground">Clasament live</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">🎯</div>
            <p className="text-sm text-muted-foreground">Puncte pentru viteză</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">📱</div>
            <p className="text-sm text-muted-foreground">Funcționează pe orice dispozitiv</p>
          </div>
        </div>
      </div>
    </QuizLayout>
  );
};

export default QuizHome;
