import { useState } from "react";
import { 
  Trophy, 
  Medal, 
  Crown,
  ChevronDown,
  User,
  Timer,
  Target,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/components/layout/MainLayout";

type Period = "all" | "weekly" | "daily";
type GameMode = "all" | "challenge" | "ranked";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  time: string;
  accuracy: number;
  gamesPlayed: number;
  isCurrentUser?: boolean;
}

const Leaderboard = () => {
  const [period, setPeriod] = useState<Period>("all");
  const [gameMode, setGameMode] = useState<GameMode>("all");

  // Mock leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, username: "TechMaster99", score: 15850, time: "2:34", accuracy: 98, gamesPlayed: 47 },
    { rank: 2, username: "PCBuilder_Pro", score: 14720, time: "2:45", accuracy: 95, gamesPlayed: 52 },
    { rank: 3, username: "HardwareHero", score: 14200, time: "2:52", accuracy: 94, gamesPlayed: 38 },
    { rank: 4, username: "CircuitQueen", score: 13890, time: "3:01", accuracy: 92, gamesPlayed: 41 },
    { rank: 5, username: "ByteRunner", score: 13500, time: "3:05", accuracy: 91, gamesPlayed: 35 },
    { rank: 6, username: "ChipChamp", score: 12980, time: "3:12", accuracy: 89, gamesPlayed: 44 },
    { rank: 7, username: "MotherboardMaven", score: 12650, time: "3:18", accuracy: 88, gamesPlayed: 39 },
    { rank: 8, username: "CPUNinja", score: 12400, time: "3:22", accuracy: 87, gamesPlayed: 31 },
    { rank: 9, username: "RAMRaider", score: 12100, time: "3:28", accuracy: 86, gamesPlayed: 28 },
    { rank: 10, username: "GPUGuru", score: 11800, time: "3:35", accuracy: 85, gamesPlayed: 33 },
    { rank: 15, username: "Tu", score: 8750, time: "4:12", accuracy: 87, gamesPlayed: 15, isCurrentUser: true },
  ];

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

  const currentUserEntry = leaderboardData.find(e => e.isCurrentUser);

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

              {/* Entries */}
              <div className="divide-y divide-border">
                {leaderboardData.map((entry) => (
                  <div 
                    key={entry.rank}
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
                <div className="text-3xl font-bold text-primary mb-1">2,847</div>
                <p className="text-sm text-muted-foreground">Jucători Activi</p>
              </CardContent>
            </Card>

            <Card className="tech-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-accent mb-1">15,850</div>
                <p className="text-sm text-muted-foreground">Record Maxim</p>
              </CardContent>
            </Card>

            <Card className="tech-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-1">12,456</div>
                <p className="text-sm text-muted-foreground">Jocuri Totale</p>
              </CardContent>
            </Card>

            <Card className="tech-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-accent mb-1">87%</div>
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
