import { useState, useEffect } from "react";
import { 
  Trophy, 
  Medal, 
  Crown,
  User,
  Timer,
  Target,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Period = "all" | "weekly" | "daily";
type GameMode = "all" | "challenge" | "ranked";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  score: number;
  time: string;
  accuracy: number;
  gamesPlayed: number;
  isCurrentUser?: boolean;
}

interface GlobalStats {
  totalPlayers: number;
  maxScore: number;
  totalGames: number;
  avgAccuracy: number;
}

const Leaderboard = () => {
  const [period, setPeriod] = useState<Period>("all");
  const [gameMode, setGameMode] = useState<GameMode>("all");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalPlayers: 0,
    maxScore: 0,
    totalGames: 0,
    avgAccuracy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
    fetchGlobalStats();
  }, [period, gameMode, user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Query user_stats joined with profiles for leaderboard
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

      // Transform data for display
      const entries: LeaderboardEntry[] = (data || []).map((item, index) => {
        const avgAccuracy = item.total_games > 0 
          ? Math.round(item.total_accuracy / item.total_games) 
          : 0;
        
        const time = item.best_time_seconds 
          ? `${Math.floor(item.best_time_seconds / 60)}:${(item.best_time_seconds % 60).toString().padStart(2, "0")}`
          : "--:--";

        return {
          rank: index + 1,
          user_id: item.user_id,
          username: (item.profiles as any)?.display_name || "Anonim",
          score: item.best_score,
          time,
          accuracy: avgAccuracy,
          gamesPlayed: item.total_games,
          isCurrentUser: user?.id === item.user_id,
        };
      });

      setLeaderboardData(entries);

      // Find current user's entry
      const userEntry = entries.find(e => e.isCurrentUser);
      
      // If user is not in top 20, fetch their position
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
          // Count how many users have higher score
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
            user_id: userStats.user_id,
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
      console.error("Error in fetchLeaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      // Get total players with scores
      const { count: totalPlayers } = await supabase
        .from("user_stats")
        .select("*", { count: "exact", head: true })
        .gt("best_score", 0);

      // Get max score
      const { data: maxScoreData } = await supabase
        .from("user_stats")
        .select("best_score")
        .order("best_score", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get total games and average accuracy
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-accent" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Medal className="h-5 w-5 text-primary" />;
      default:
        return <span className="w-5 text-center font-mono text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number, isCurrentUser?: boolean) => {
    if (isCurrentUser) return "bg-primary/20 border-primary";
    switch (rank) {
      case 1:
        return "bg-accent/10 border-accent/30";
      case 2:
        return "bg-muted/30 border-muted-foreground/30";
      case 3:
        return "bg-accent/5 border-accent/20";
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
            <div className="flex items-center gap-2 text-accent mb-4">
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

      {/* Filters */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Perioadă" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tot Timpul</SelectItem>
                <SelectItem value="weekly">Săptămâna Asta</SelectItem>
                <SelectItem value="daily">Azi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gameMode} onValueChange={(v) => setGameMode(v as GameMode)}>
              <SelectTrigger className="w-[180px]">
                <Target className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Mod de joc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate Modurile</SelectItem>
                <SelectItem value="challenge">Challenge</SelectItem>
                <SelectItem value="ranked">Ranked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Current User Position */}
      {currentUserEntry && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Card className="tech-card border-primary">
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
          </div>
        </section>
      )}

      {/* Leaderboard Table */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Card className="tech-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top 20 Jucători
              </CardTitle>
              <CardDescription>
                Clasament bazat pe cel mai bun scor
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

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Niciun jucător în clasament încă</p>
                  <p className="text-sm text-muted-foreground">Fii primul care joacă!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {leaderboardData.map((entry) => (
                    <div 
                      key={entry.user_id}
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
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="text-3xl font-bold text-accent mb-1">
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
                <div className="text-3xl font-bold text-accent mb-1">
                  {globalStats.avgAccuracy}%
                </div>
                <p className="text-sm text-muted-foreground">Acuratețe Medie</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Leaderboard;
