import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Gamepad2, 
  BookOpen, 
  Timer, 
  Trophy,
  ChevronRight,
  Info,
  AlertCircle,
  Zap,
  Target,
  Heart,
  HelpCircle,
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MainLayout from "@/components/layout/MainLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import GameBoard from "@/components/game/GameBoard";
import { GameMode } from "@/hooks/useGameState";

const Game = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();

  const gameModes = [
    {
      id: "training" as const,
      title: "Training",
      description: "Fără timp, hint-uri nelimitate, explicații pas cu pas",
      icon: BookOpen,
      color: "primary",
      features: [
        "Fără limită de timp",
        "Hint-uri nelimitate",
        "Explicații la fiecare pas",
        "Perfect pentru începători",
      ],
    },
    {
      id: "challenge" as const,
      title: "Challenge",
      description: "Timer activ, 3 vieți, penalizări pentru greșeli",
      icon: Timer,
      color: "accent",
      features: [
        "Timer de 5 minute",
        "3 vieți disponibile",
        "-30 puncte per greșeală",
        "Bonus pentru timp rămas",
      ],
    },
    {
      id: "ranked" as const,
      title: "Ranked",
      description: "Competitiv, contribuie la leaderboard-ul global",
      icon: Trophy,
      color: "destructive",
      features: [
        "Contorizează pentru clasament",
        "Timer strict de 4 minute",
        "Fără hint-uri",
        "Bonus pentru perfecțiune",
      ],
    },
  ];

  const handleStartGame = () => {
    if (!selectedMode) return;
    setIsPlaying(true);
  };

  const handleExitGame = () => {
    setIsPlaying(false);
    setSelectedMode(null);
  };

  // Show game board when playing
  if (isPlaying && selectedMode) {
    return <GameBoard mode={selectedMode} onExit={handleExitGame} />;
  }

  return (
    <MainLayout>
      {/* Header */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-accent mb-4">
              <Gamepad2 className="h-5 w-5" />
              <span className="text-sm font-medium">Joc Interactiv</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Asamblează PC-ul</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Plasează componentele pe placa de bază în ordinea corectă. 
              CPU, RAM, GPU, cabluri de alimentare și multe altele!
            </p>

            {/* Mobile Warning */}
            {isMobile && (
              <Alert className="border-primary/50 bg-primary/10">
                <Smartphone className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  Pentru cea mai bună experiență, te recomandăm să joci pe un ecran mai mare (tablet sau desktop).
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </section>

      {/* Game Mode Selection */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Alege Modul de Joc
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {gameModes.map((mode) => (
              <Card 
                key={mode.id}
                className={`tech-card cursor-pointer transition-all ${
                  selectedMode === mode.id 
                    ? "border-primary ring-2 ring-primary/20 neon-glow" 
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      mode.id === "training" ? "bg-primary/20" :
                      mode.id === "challenge" ? "bg-accent/20" :
                      "bg-destructive/20"
                    }`}>
                      <mode.icon className={`h-6 w-6 ${
                        mode.id === "training" ? "text-primary" :
                        mode.id === "challenge" ? "text-accent" :
                        "text-destructive"
                      }`} />
                    </div>
                    {selectedMode === mode.id && (
                      <Badge className="bg-primary text-primary-foreground">
                        Selectat
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{mode.title}</CardTitle>
                  <CardDescription>{mode.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Start Game Button */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              className="text-lg px-12 neon-glow"
              disabled={!selectedMode}
              onClick={handleStartGame}
            >
              <Zap className="h-5 w-5 mr-2" />
              Începe Jocul
            </Button>
            {!selectedMode && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Info className="h-4 w-4" />
                Selectează un mod de joc pentru a continua
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Game Info */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Cum se Joacă
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="tech-card">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">1</div>
                <h3 className="font-semibold mb-2">Selectează Componenta</h3>
                <p className="text-sm text-muted-foreground">
                  Click pe o componentă din lista de piese disponibile
                </p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">2</div>
                <h3 className="font-semibold mb-2">Plasează pe Placă</h3>
                <p className="text-sm text-muted-foreground">
                  Trage sau click pe zona corectă de pe placa de bază
                </p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">3</div>
                <h3 className="font-semibold mb-2">Respectă Ordinea</h3>
                <p className="text-sm text-muted-foreground">
                  Unele componente trebuie plasate într-o ordine specifică
                </p>
              </CardContent>
            </Card>

            <Card className="tech-card">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">4</div>
                <h3 className="font-semibold mb-2">Finalizează PC-ul</h3>
                <p className="text-sm text-muted-foreground">
                  Completează toate componentele pentru a termina jocul
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scoring Info */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Sistem de Punctaj
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="tech-card text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-accent mb-1">+100</div>
                <p className="text-sm text-muted-foreground">Plasare Corectă</p>
              </CardContent>
            </Card>

            <Card className="tech-card text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive mb-1">-30</div>
                <p className="text-sm text-muted-foreground">Greșeală</p>
              </CardContent>
            </Card>

            <Card className="tech-card text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary mb-1">×1.5</div>
                <p className="text-sm text-muted-foreground">Bonus Timp</p>
              </CardContent>
            </Card>

            <Card className="tech-card text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-accent mb-1">×2</div>
                <p className="text-sm text-muted-foreground">Perfect Run</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Not Ready CTA */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              Nu te simți pregătit?
            </h2>
            <p className="text-muted-foreground mb-6">
              Parcurge lecțiile pentru a învăța despre fiecare componentă înainte de a juca!
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/lectii">
                <BookOpen className="h-5 w-5 mr-2" />
                Vezi Lecțiile
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Game;
