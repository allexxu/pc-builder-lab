import { Link } from "react-router-dom";
import { 
  Cpu, 
  Gamepad2, 
  BookOpen, 
  Trophy, 
  ChevronRight, 
  Zap, 
  Monitor,
  HardDrive,
  Fan,
  Cable,
  CircuitBoard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { useLessonProgress } from "@/hooks/useLessonProgress";

const TOTAL_LESSONS = 6;

const Index = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading, getAverageAccuracy } = useUserStats();
  const { getCompletedCount, loading: progressLoading } = useLessonProgress();

  const isLoading = statsLoading || progressLoading;

  // Use real data for logged-in users, defaults for guests
  const userProgress = {
    lessonsCompleted: user ? getCompletedCount() : 0,
    totalLessons: TOTAL_LESSONS,
    bestScore: user ? stats.best_score : 0,
    gamesPlayed: user ? stats.total_games : 0,
    accuracy: user ? getAverageAccuracy() : 0,
  };

  const progressPercentage = (userProgress.lessonsCompleted / userProgress.totalLessons) * 100;

  const features = [
    {
      icon: BookOpen,
      title: "6 Lecții Complete",
      description: "Placa de bază, CPU, PSU, socket-uri, răcire și modul de funcționare",
    },
    {
      icon: Gamepad2,
      title: "Joc Interactiv",
      description: "Asamblează PC-ul prin drag & drop cu feedback în timp real",
    },
    {
      icon: Trophy,
      title: "Competiție",
      description: "Clasamente, achievements și badge-uri pentru motivație",
    },
  ];

  const components = [
    { icon: Cpu, label: "CPU" },
    { icon: CircuitBoard, label: "Placă de Bază" },
    { icon: HardDrive, label: "SSD" },
    { icon: Monitor, label: "GPU" },
    { icon: Fan, label: "Cooler" },
    { icon: Cable, label: "Cabluri" },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 circuit-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        {/* Floating Components Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {components.map((comp, i) => (
            <div
              key={comp.label}
              className="absolute text-primary/20 animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <comp.icon className="h-12 w-12 md:h-16 md:w-16" />
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center py-20 md:py-32">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-8 animate-fade-in">
              <Zap className="h-4 w-4" />
              <span>Platformă educațională pentru elevi</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="gradient-text">Învață să asamblezi</span>
              <br />
              <span className="text-foreground">un PC de la zero</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Descoperă componentele calculatorului într-un mod interactiv și distractiv. 
              Lecții structurate, joc de asamblare, și competiție cu colegii!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button asChild size="lg" className="text-lg px-8 neon-glow group">
                <Link to="/lectii">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Începe Lecția
                  <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-accent text-accent hover:bg-accent hover:text-accent-foreground group">
                <Link to="/joc">
                  <Gamepad2 className="h-5 w-5 mr-2" />
                  Joacă Acum
                  <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Card */}
            <Card className="tech-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {user ? "Progresul Tău" : "Progres Lecții"}
                </CardTitle>
                <CardDescription>
                  {user ? "Continuă de unde ai rămas" : "Autentifică-te pentru a-ți salva progresul"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lecții completate</span>
                    <span className="font-medium text-foreground">
                      {isLoading ? "..." : `${userProgress.lessonsCompleted} / ${userProgress.totalLessons}`}
                    </span>
                  </div>
                  <Progress value={isLoading ? 0 : progressPercentage} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {user 
                      ? `Mai ai ${userProgress.totalLessons - userProgress.lessonsCompleted} lecții de parcurs`
                      : "Conectează-te pentru a urmări progresul"
                    }
                  </p>
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link to="/lectii">
                      {user ? "Continuă Învățarea" : "Începe Învățarea"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Best Score Card */}
            <Card className="tech-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  {user ? "Cel Mai Bun Scor" : "Statistici Joc"}
                </CardTitle>
                <CardDescription>
                  {user ? "Statisticile tale în joc" : "Joacă pentru a-ți vedea scorul"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <span className="text-5xl font-bold gradient-text">
                      {isLoading ? "..." : userProgress.bestScore.toLocaleString()}
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">puncte</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">
                        {isLoading ? "..." : userProgress.gamesPlayed}
                      </p>
                      <p className="text-xs text-muted-foreground">Jocuri</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">
                        {isLoading ? "..." : `${userProgress.accuracy}%`}
                      </p>
                      <p className="text-xs text-muted-foreground">Acuratețe</p>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4 neon-glow-green bg-accent hover:bg-accent/90">
                    <Link to="/joc">
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      {user ? "Joacă din Nou" : "Începe Jocul"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              De ce <span className="gradient-text">PC Builder Academy</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O platformă completă pentru a înțelege cum funcționează un calculator
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="tech-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Components Preview Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ce vei <span className="gradient-text">învăța</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Toate componentele esențiale ale unui calculator personal
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {components.map((comp, index) => (
              <div 
                key={comp.label}
                className="flex flex-col items-center p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:neon-glow transition-all cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <comp.icon className="h-10 w-10 text-primary mb-3 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium text-foreground">{comp.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="tech-card overflow-hidden">
            <div className="relative p-8 md:p-12 text-center">
              {/* Background decoration */}
              <div className="absolute inset-0 circuit-pattern opacity-10" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Gata să <span className="gradient-text">începi</span>?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Alege modul care ți se potrivește: învățare pas cu pas sau direct la acțiune!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="neon-glow">
                    <Link to="/lectii">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Vreau să Învăț
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <Link to="/joc">
                      <Gamepad2 className="h-5 w-5 mr-2" />
                      Vreau să Joc
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
