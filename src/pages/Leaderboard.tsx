import { useState, useEffect } from "react";
import { 
  Trophy, 
  Medal, 
  Crown,
  User,
  Timer,
  Target,
  TrendingUp,
  Loader2,
  Gamepad2,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  score: number;
  time?: string;
  accuracy?: number;
  gamesPlayed?: number;
  isCurrentUser?: boolean;
}

interface QuizLeaderboardEntry {
  rank: number;
  id: string;
  nickname: string;
  score: number;
  quizTitle: string;
  sessionDate: string;
  isCurrentUser?: boolean;
}

interface GlobalStats {
  totalPlayers: number;
  maxScore: number;
  totalGames: number;
  avgAccuracy: number;
}

interface QuizStats {
  totalParticipants: number;
  totalSessions: number;
  highestScore: number;
  totalQuizzes: number;
}

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("hardware");
  const [hardwareLeaderboard, setHardwareLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState<QuizLeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalPlayers: 0,
    maxScore: 0,
    totalGames: 0,
    avgAccuracy: 0,
  });
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalParticipants: 0,
    totalSessions: 0,
    highestScore: 0,
    totalQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === "hardware") {
      fetchHardwareLeaderboard();
      fetchGlobalStats();
    } else {
      fetchQuizLeaderboard();
      fetchQuizStats();
    }
  }, [activeTab, user]);

  const fetchHardwareLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select(`
          user_id,
          best_score,
          best_time_seconds,
          total_games,
          total_accuracy,
          profiles!inner(display_name)
        `)
        .gt("best_score", 0)
        .order("best_score", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
        return;
      }

      const entries: LeaderboardEntry[] = (data || []).map((item, index) => {
        const avgAccuracy = item.total_games > 0 
          ? Math.round(item.total_accuracy / item.total_games) 
          : 0;
        
        const time = item.best_time_seconds 
          ? `${Math.floor(item.best_time_seconds / 60)}:${(item.best_time_seconds % 60).toString().padStart(2, "0")}`
          : "--:--";

        return {
          rank: index + 1,
          id: item.user_id,
          username: (item.profiles as any)?.display_name || "Anonim",
          score: item.best_score,
          time,
          accuracy: avgAccuracy,
          gamesPlayed: item.total_games,
          isCurrentUser: user?.id === item.user_id,
        };
      });

      setHardwareLeaderboard(entries);

      const userEntry = entries.find(e => e.isCurrentUser);
      
      if (user && !userEntry) {
        const { data: userStats } = await supabase
          .from("user_stats")
          .select(`
            user_id,
            best_score,
            best_time_seconds,
            total_games,
            total_accuracy
          `)
          .eq("user_id", user.id)
          .maybeSingle();

        if (userStats && userStats.best_score > 0) {
          const { count } = await supabase
            .from("user_stats")
            .select("*", { count: "exact", head: true })
            .gt("best_score", userStats.best_score);

          const avgAccuracy = userStats.total_games > 0 
            ? Math.round(userStats.total_accuracy / userStats.total_games) 
            : 0;
          
          const time = userStats.best_time_seconds 
            ? `${Math.floor(userStats.best_time_seconds / 60)}:${(userStats.best_time_seconds % 60).toString().padStart(2, "0")}`
            : "--:--";

          setCurrentUserEntry({
            rank: (count || 0) + 1,
            id: userStats.user_id,
            username: user.user_metadata?.display_name || user.email?.split("@")[0] || "Tu",
            score: userStats.best_score,
            time,
            accuracy: avgAccuracy,
            gamesPlayed: userStats.total_games,
            isCurrentUser: true,
          });
        } else {
          setCurrentUserEntry(null);
        }
      } else {
        setCurrentUserEntry(userEntry || null);
      }
    } catch (err) {
      console.error("Error in fetchHardwareLeaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch top participants from finished quiz sessions
      const { data, error } = await supabase
        .from("participants")
        .select(`
          id,
          nickname,
          total_score,
          user_id,
          session_id,
          game_sessions!inner(
            id,
            status,
            ended_at,
            quiz_id,
            quizzes!inner(title)
          )
        `)
        .eq("game_sessions.status", "finished")
        .eq("is_active", true)
        .gt("total_score", 0)
        .order("total_score", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching quiz leaderboard:", error);
        setLoading(false);
        return;
      }

      const entries: QuizLeaderboardEntry[] = (data || []).map((item, index) => {
        const session = item.game_sessions as any;
        const endedAt = session?.ended_at ? new Date(session.ended_at).toLocaleDateString("ro-RO") : "-";
        
        return {
          rank: index + 1,
          id: item.id,
          nickname: item.nickname,
          score: item.total_score,
          quizTitle: session?.quizzes?.title || "Quiz",
          sessionDate: endedAt,
          isCurrentUser: user?.id === item.user_id,
        };
      });

      setQuizLeaderboard(entries);
    } catch (err) {
      console.error("Error in fetchQuizLeaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const { count: totalPlayers } = await supabase
        .from("user_stats")
        .select("*", { count: "exact", head: true })
        .gt("best_score", 0);

      const { data: maxScoreData } = await supabase
        .from("user_stats")
        .select("best_score")
        .order("best_score", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: statsData } = await supabase
        .from("user_stats")
        .select("total_games, total_accuracy")
        .gt("total_games", 0);

      const totalGames = statsData?.reduce((sum, s) => sum + s.total_games, 0) || 0;
      const totalAccuracy = statsData?.reduce((sum, s) => sum + s.total_accuracy, 0) || 0;
      const avgAccuracy = totalGames > 0 ? Math.round(totalAccuracy / totalGames) : 0;

      setGlobalStats({
        totalPlayers: totalPlayers || 0,
        maxScore: maxScoreData?.best_score || 0,
        totalGames,
        avgAccuracy,
      });
    } catch (err) {
      console.error("Error fetching global stats:", err);
    }
  };

  const fetchQuizStats = async () => {
    try {
      // Count unique participants in finished sessions
      const { count: totalParticipants } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Count finished sessions
      const { count: totalSessions } = await supabase
        .from("game_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "finished");

      // Get highest score
      const { data: topScore } = await supabase
        .from("participants")
        .select("total_score")
        .order("total_score", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Count published quizzes
      const { count: totalQuizzes } = await supabase
        .from("quizzes")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      setQuizStats({
        totalParticipants: totalParticipants || 0,
        totalSessions: totalSessions || 0,
        highestScore: topScore?.total_score || 0,
        totalQuizzes: totalQuizzes || 0,
      });
    } catch (err) {
      console.error("Error fetching quiz stats:", err);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-mono text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number, isCurrentUser?: boolean) => {
    if (isCurrentUser) return "bg-primary/20 border-primary";
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30";
      case 2:
        return "bg-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-amber-600/10 border-amber-600/30";
      default:
        return "";
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-medium">Clasament</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Vezi cei mai buni jucători și compară-te cu colegii tăi!
            </p>
          </div>
        </div>
      </section>

      {/* Tabs for different leaderboards */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="hardware" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Joc Hardware
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Quiz-uri Live
              </TabsTrigger>
            </TabsList>

            {/* Hardware Game Leaderboard */}
            <TabsContent value="hardware">
              {/* Current User Position */}
              {currentUserEntry && (
                <Card className="tech-card border-primary mb-6">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-primary">#{currentUserEntry.rank}</div>
                        <div>
                          <p className="font-semibold">Poziția Ta</p>
                          <p className="text-sm text-muted-foreground">
                            {currentUserEntry.score.toLocaleString()} puncte
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{currentUserEntry.accuracy}%</p>
                          <p className="text-muted-foreground">Acuratețe</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{currentUserEntry.gamesPlayed}</p>
                          <p className="text-muted-foreground">Jocuri</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="tech-card overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Top 20 - Joc Asamblare Hardware
                  </CardTitle>
                  <CardDescription>
                    Clasament bazat pe cel mai bun scor în jocul de asamblare
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
                    <div className="col-span-1">Loc</div>
                    <div className="col-span-4">Jucător</div>
                    <div className="col-span-2 text-right">Scor</div>
                    <div className="col-span-2 text-right hidden md:block">Timp</div>
                    <div className="col-span-2 text-right hidden md:block">Acuratețe</div>
                    <div className="col-span-1 text-right hidden lg:block">Jocuri</div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : hardwareLeaderboard.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Niciun jucător în clasament încă</p>
                      <p className="text-sm text-muted-foreground">Fii primul care joacă!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {hardwareLeaderboard.map((entry) => (
                        <div 
                          key={entry.id}
                          className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-muted/20 ${getRankStyle(entry.rank, entry.isCurrentUser)}`}
                        >
                          <div className="col-span-1 flex items-center">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div className="col-span-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className={`font-medium ${entry.isCurrentUser ? "text-primary" : ""}`}>
                              {entry.username}
                            </span>
                            {entry.isCurrentUser && (
                              <Badge variant="outline" className="text-primary border-primary text-xs">
                                Tu
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-2 text-right font-mono font-semibold">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="col-span-2 text-right hidden md:block text-muted-foreground">
                            <Timer className="h-3 w-3 inline mr-1" />
                            {entry.time}
                          </div>
                          <div className="col-span-2 text-right hidden md:block text-muted-foreground">
                            {entry.accuracy}%
                          </div>
                          <div className="col-span-1 text-right hidden lg:block text-muted-foreground">
                            {entry.gamesPlayed}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Cards for Hardware */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card className="tech-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {globalStats.totalPlayers.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Jucători Activi</p>
                  </CardContent>
                </Card>

                <Card className="tech-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                      {globalStats.maxScore.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Record Maxim</p>
                  </CardContent>
                </Card>

                <Card className="tech-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {globalStats.totalGames.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Jocuri Totale</p>
                  </CardContent>
                </Card>

                <Card className="tech-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-green-500 mb-1">
                      {globalStats.avgAccuracy}%
                    </div>
                    <p className="text-sm text-muted-foreground">Acuratețe Medie</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Quiz Leaderboard */}
            <TabsContent value="quiz">
              <Card className="tech-card overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Top 20 - Quiz-uri Live
                  </CardTitle>
                  <CardDescription>
                    Cele mai mari scoruri obținute în sesiunile de quiz
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
                    <div className="col-span-1">Loc</div>
                    <div className="col-span-3">Participant</div>
                    <div className="col-span-2 text-right">Scor</div>
                    <div className="col-span-4 hidden md:block">Quiz</div>
                    <div className="col-span-2 text-right hidden sm:block">Data</div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : quizLeaderboard.length === 0 ? (
                    <div className="text-center py-12">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nicio sesiune de quiz finalizată încă</p>
                      <p className="text-sm text-muted-foreground">Participă la un quiz pentru a apărea aici!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {quizLeaderboard.map((entry) => (
                        <div 
                          key={entry.id}
                          className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-muted/20 ${getRankStyle(entry.rank, entry.isCurrentUser)}`}
                        >
                          <div className="col-span-1 flex items-center">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className={`font-medium truncate ${entry.isCurrentUser ? "text-primary" : ""}`}>
                              {entry.nickname}
                            </span>
                            {entry.isCurrentUser && (
                              <Badge variant="outline" className="text-primary border-primary text-xs">
                                Tu
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-2 text-right font-mono font-semibold text-primary">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="col-span-4 hidden md:block text-muted-foreground truncate">
                            {entry.quizTitle}
                          </div>
                          <div className="col-span-2 text-right hidden sm:block text-muted-foreground text-sm">
                            {entry.sessionDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Cards for Quiz */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card className="tech-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {quizStats.totalParticipants.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Participanți</p>
                  </CardContent>
                </Card>

                <Card className="tech-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                      {quizStats.highestScore.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Cel Mai Mare Scor</p>
                  </CardContent>
                </Card>

                <Card className="tech-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {quizStats.totalSessions.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Sesiuni Finalizate</p>
                  </CardContent>
                </Card>

                <Card className="tech-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-green-500 mb-1">
                      {quizStats.totalQuizzes.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Quiz-uri Publicate</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </MainLayout>
  );
};

export default Leaderboard;
