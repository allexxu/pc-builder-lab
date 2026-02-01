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
  Zap,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useGameHistory } from "@/hooks/useGameHistory";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserStats } from "@/hooks/useUserStats";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "@/components/layout/MainLayout";
import { useEffect } from "react";

const TOTAL_LESSONS = 6;

const LESSON_TITLES: Record<string, string> = {
  "placa-de-baza": "Placa de Bază",
  "sursa-alimentare": "Sursa de Alimentare",
  "procesorul": "Procesorul (CPU)",
  "tipuri-socket": "Tipuri de Socket",
  "modul-functionare": "Modul de Funcționare",
  "sisteme-racire": "Sisteme de Răcire",
};

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { progress, loading: progressLoading, getCompletedCount } = useLessonProgress();
  const { games, loading: gamesLoading, formatTime, getRelativeDate } = useGameHistory();
  const { achievements, loading: achievementsLoading, getUnlockedCount, getTotalCount } = useAchievements();
  const { stats, loading: statsLoading, getAverageAccuracy, formatBestTime } = useUserStats();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Deconectat cu succes!");
    navigate("/");
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Don't render if not logged in (redirect will happen)
  if (!user) {
    return null;
  }

  const isLoading = progressLoading || gamesLoading || achievementsLoading || statsLoading;

  // User data from auth
  const userData = {
    username: user.user_metadata?.display_name || user.email?.split("@")[0] || "Utilizator",
    email: user.email || "",
    joinedDate: new Date(user.created_at).toLocaleDateString("ro-RO", { month: "long", year: "numeric" }),
    avatar: user.user_metadata?.avatar_url || null,
  };

  const completedLessonsCount = getCompletedCount();

  // Build lessons progress list
  const lessonsProgress = [
    "placa-de-baza",
    "sursa-alimentare", 
    "procesorul",
    "tipuri-socket",
    "modul-functionare",
    "sisteme-racire",
  ].map((slug, index) => {
    const lessonProgress = progress.find(p => p.lesson_slug === slug);
    return {
      id: index + 1,
      slug,
      title: LESSON_TITLES[slug],
      completed: lessonProgress?.completed || false,
      quizScore: lessonProgress?.quiz_score 
        ? `${lessonProgress.quiz_score}/${lessonProgress.quiz_total}`
        : null,
    };
  });

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
                {stats.rank && (
                  <Badge variant="outline" className="text-primary border-primary">
                    <Trophy className="h-3 w-3 mr-1" />
                    Rank #{stats.rank}
                  </Badge>
                )}
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
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mx-auto mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stats.best_score.toLocaleString()}</div>
                )}
                <p className="text-xs text-muted-foreground">Cel Mai Bun Scor</p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6 text-center">
                <Timer className="h-8 w-8 text-primary mx-auto mb-2" />
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{formatBestTime()}</div>
                )}
                <p className="text-xs text-muted-foreground">Cel Mai Bun Timp</p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6 text-center">
                <Target className="h-8 w-8 text-accent mx-auto mb-2" />
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{getAverageAccuracy()}%</div>
                )}
                <p className="text-xs text-muted-foreground">Acuratețe Medie</p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6 text-center">
                <Gamepad2 className="h-8 w-8 text-primary mx-auto mb-2" />
                {isLoading ? (
                  <Skeleton className="h-8 w-10 mx-auto mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stats.total_games}</div>
                )}
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
                    Badge-uri ({getUnlockedCount()}/{getTotalCount()})
                  </CardTitle>
                  <CardDescription>
                    Colectează toate badge-urile completând provocări
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {achievementsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <Card className="tech-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Progres Lecții ({completedLessonsCount}/{TOTAL_LESSONS})
                  </CardTitle>
                  <CardDescription>
                    Urmărește progresul tău în lecții și quiz-uri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Progress value={(completedLessonsCount / TOTAL_LESSONS) * 100} className="h-3" />
                  </div>
                  {progressLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : (
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
                              <Link to={`/lectii/${lesson.slug}`}>
                                Începe
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                  {gamesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : games.length === 0 ? (
                    <div className="text-center py-8">
                      <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Nu ai jucat încă niciun joc</p>
                      <Button asChild className="neon-glow">
                        <Link to="/joc">
                          <Zap className="h-4 w-4 mr-2" />
                          Joacă Acum
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {games.map((game) => (
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
                              <Badge variant={game.mode === "ranked" ? "default" : "outline"} className="mb-1 capitalize">
                                {game.mode}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{getRelativeDate(game.played_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-medium">{formatTime(game.time_seconds)}</p>
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
                  )}
                  {games.length > 0 && (
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link to="/joc">
                        <Zap className="h-4 w-4 mr-2" />
                        Joacă din Nou
                      </Link>
                    </Button>
                  )}
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
