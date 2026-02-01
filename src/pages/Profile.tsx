import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Trophy, 
  BookOpen, 
  Gamepad2,
  Target,
  Timer,
  Award,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Zap,
  Cable,
  Cpu,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Deconectat cu succes!");
    navigate("/");
  };
  // User data - uses real data if logged in, otherwise mock data
  const userData = {
    username: user?.user_metadata?.display_name || user?.email?.split("@")[0] || "ElevCurios",
    email: user?.email || "elev@scoala.ro",
    joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString("ro-RO", { month: "long", year: "numeric" }) : "Ianuarie 2025",
    avatar: user?.user_metadata?.avatar_url || null,
  };

  const stats = {
    bestScore: 8750,
    bestTime: "4:12",
    totalGames: 15,
    accuracy: 87,
    lessonsCompleted: 2,
    totalLessons: 6,
    quizzesPassed: 2,
    totalQuizzes: 6,
    rank: 15,
  };

  const achievements = [
    { id: 1, name: "Primul Pas", description: "Completează prima lecție", icon: BookOpen, unlocked: true },
    { id: 2, name: "RAM Whisperer", description: "Plasează RAM-ul corect de 10 ori", icon: Cpu, unlocked: true },
    { id: 3, name: "Cable Master", description: "Conectează toate cablurile fără greșeli", icon: Cable, unlocked: false },
    { id: 4, name: "Speed Demon", description: "Finalizează jocul în sub 3 minute", icon: Timer, unlocked: false },
    { id: 5, name: "Perfect Run", description: "0 greșeli într-un joc Challenge", icon: Star, unlocked: false },
    { id: 6, name: "Top 10", description: "Ajunge în Top 10 pe leaderboard", icon: Trophy, unlocked: false },
  ];

  const recentGames = [
    { id: 1, mode: "Challenge", score: 8750, time: "4:12", accuracy: 87, date: "Azi" },
    { id: 2, mode: "Training", score: 7200, time: "5:45", accuracy: 92, date: "Ieri" },
    { id: 3, mode: "Challenge", score: 6800, time: "4:55", accuracy: 78, date: "Ieri" },
    { id: 4, mode: "Ranked", score: 5400, time: "5:20", accuracy: 72, date: "Acum 2 zile" },
    { id: 5, mode: "Training", score: 8100, time: "6:10", accuracy: 95, date: "Acum 3 zile" },
  ];

  const lessonsProgress = [
    { id: 1, title: "Placa de Bază", completed: true, quizScore: "5/5" },
    { id: 2, title: "Sursa de Alimentare", completed: true, quizScore: "4/5" },
    { id: 3, title: "Procesorul (CPU)", completed: false, quizScore: null },
    { id: 4, title: "Tipuri de Socket", completed: false, quizScore: null },
    { id: 5, title: "Modul de Funcționare", completed: false, quizScore: null },
    { id: 6, title: "Sisteme de Răcire", completed: false, quizScore: null },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <MainLayout>
      {/* Header */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{userData.username}</h1>
              <p className="text-muted-foreground mb-2">{userData.email}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-primary border-primary">
                  <Trophy className="h-3 w-3 mr-1" />
                  Rank #{stats.rank}
                </Badge>
                <Badge variant="outline">
                  Membru din {userData.joinedDate}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Setările vor fi disponibile în curând!")}>
                <Settings className="h-4 w-4 mr-2" />
                Setări
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Ieșire
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="tech-card">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.bestScore.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Cel Mai Bun Scor</p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6 text-center">
                <Timer className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.bestTime}</div>
                <p className="text-xs text-muted-foreground">Cel Mai Bun Timp</p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6 text-center">
                <Target className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.accuracy}%</div>
                <p className="text-xs text-muted-foreground">Acuratețe Medie</p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6 text-center">
                <Gamepad2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.totalGames}</div>
                <p className="text-xs text-muted-foreground">Jocuri Jucate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tabs Content */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="achievements" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="h-4 w-4 mr-2" />
                Progres Lecții
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Istoric Jocuri
              </TabsTrigger>
            </TabsList>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card className="tech-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Badge-uri ({unlockedCount}/{achievements.length})
                  </CardTitle>
                  <CardDescription>
                    Colectează toate badge-urile completând provocări
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`p-4 rounded-lg border ${
                          achievement.unlocked 
                            ? "bg-accent/10 border-accent/30" 
                            : "bg-muted/20 border-border opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            achievement.unlocked ? "bg-accent/20" : "bg-muted"
                          }`}>
                            <achievement.icon className={`h-5 w-5 ${
                              achievement.unlocked ? "text-accent" : "text-muted-foreground"
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {achievement.name}
                              {achievement.unlocked && (
                                <CheckCircle2 className="h-4 w-4 text-accent" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <Card className="tech-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Progres Lecții ({stats.lessonsCompleted}/{stats.totalLessons})
                  </CardTitle>
                  <CardDescription>
                    Urmărește progresul tău în lecții și quiz-uri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Progress value={(stats.lessonsCompleted / stats.totalLessons) * 100} className="h-3" />
                  </div>
                  <div className="space-y-3">
                    {lessonsProgress.map((lesson) => (
                      <div 
                        key={lesson.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            lesson.completed ? "bg-accent/20" : "bg-muted"
                          }`}>
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-accent" />
                            ) : (
                              <span className="text-sm text-muted-foreground">{lesson.id}</span>
                            )}
                          </div>
                          <span className={lesson.completed ? "text-foreground" : "text-muted-foreground"}>
                            {lesson.title}
                          </span>
                        </div>
                        {lesson.completed ? (
                          <Badge variant="outline" className="text-accent border-accent">
                            Quiz: {lesson.quizScore}
                          </Badge>
                        ) : (
                          <Button asChild variant="ghost" size="sm">
                            <Link to="/lectii">
                              Începe
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card className="tech-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    Istoric Jocuri
                  </CardTitle>
                  <CardDescription>
                    Ultimele tale jocuri și performanțe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGames.map((game) => (
                      <div 
                        key={game.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{game.score.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">puncte</p>
                          </div>
                          <div className="h-10 w-px bg-border" />
                          <div>
                            <Badge variant={game.mode === "Ranked" ? "default" : "outline"} className="mb-1">
                              {game.mode}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{game.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{game.time}</p>
                            <p className="text-xs text-muted-foreground">Timp</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{game.accuracy}%</p>
                            <p className="text-xs text-muted-foreground">Acuratețe</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link to="/joc">
                      <Zap className="h-4 w-4 mr-2" />
                      Joacă din Nou
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </MainLayout>
  );
};

export default Profile;
