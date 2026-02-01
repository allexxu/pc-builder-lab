import { Link } from "react-router-dom";
import { 
  BookOpen, 
  CircuitBoard, 
  Cpu, 
  Zap, 
  Cable, 
  Fan, 
  Thermometer,
  ChevronRight,
  CheckCircle2,
  Clock,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layout/MainLayout";

const Lessons = () => {
  // Lesson data
  const lessons = [
    {
      id: 1,
      slug: "placa-de-baza",
      title: "Placa de Bază",
      description: "Socket CPU, chipset, sloturi RAM/PCIe, conectori SATA/M.2, BIOS/UEFI, VRM și headers",
      icon: CircuitBoard,
      duration: "25 min",
      status: "completed" as const,
      quizScore: 5,
      quizTotal: 5,
    },
    {
      id: 2,
      slug: "sursa-alimentare",
      title: "Sursa de Alimentare (PSU)",
      description: "Conectori 24-pin ATX, EPS, PCIe, SATA power, putere, eficiență 80 PLUS și protecții",
      icon: Zap,
      duration: "20 min",
      status: "completed" as const,
      quizScore: 4,
      quizTotal: 5,
    },
    {
      id: 3,
      slug: "procesorul",
      title: "Procesorul (CPU)",
      description: "Istorie, frecvență, nuclee/threads, cache, TDP, litografie + descifrare model Intel & AMD",
      icon: Cpu,
      duration: "30 min",
      status: "in_progress" as const,
      quizScore: null,
      quizTotal: 5,
    },
    {
      id: 4,
      slug: "tipuri-socket",
      title: "Tipuri de Socket",
      description: "LGA vs PGA: diferențe, avantaje, dezavantaje și exemple concrete",
      icon: Cable,
      duration: "15 min",
      status: "locked" as const,
      quizScore: null,
      quizTotal: 5,
    },
    {
      id: 5,
      slug: "modul-functionare",
      title: "Modul de Funcționare",
      description: "Fluxul de energie și date: PSU → placă de bază → CPU/RAM → stocare → GPU",
      icon: Thermometer,
      duration: "20 min",
      status: "locked" as const,
      quizScore: null,
      quizTotal: 5,
    },
    {
      id: 6,
      slug: "sisteme-racire",
      title: "Sisteme de Răcire",
      description: "Air vs AIO vs custom, termopastă, airflow, presiune pozitivă/negativă, PWM/DC",
      icon: Fan,
      duration: "25 min",
      status: "locked" as const,
      quizScore: null,
      quizTotal: 5,
    },
  ];

  const completedLessons = lessons.filter(l => l.status === "completed").length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-accent text-accent-foreground">Completat</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30">În Desfășurare</Badge>;
      case "locked":
        return <Badge variant="outline" className="text-muted-foreground">Blocat</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-accent" />;
      case "in_progress":
        return <BookOpen className="h-5 w-5 text-primary animate-pulse" />;
      case "locked":
        return <Lock className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary mb-4">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">Hub de Învățare</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Lecții despre <span className="gradient-text">Componentele PC</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              6 capitole complete cu definiții, diagrame, exemple practice și quiz-uri 
              pentru a verifica ce ai învățat.
            </p>
            
            {/* Progress Overview */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progres Total</span>
                <span className="text-sm font-medium text-foreground">
                  {completedLessons} / {lessons.length} lecții
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Lessons Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => (
              <Card 
                key={lesson.id} 
                className={`tech-card animate-fade-in ${
                  lesson.status === "locked" ? "opacity-60" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      lesson.status === "completed" ? "bg-accent/20" : 
                      lesson.status === "in_progress" ? "bg-primary/20" : 
                      "bg-muted"
                    }`}>
                      <lesson.icon className={`h-6 w-6 ${
                        lesson.status === "completed" ? "text-accent" : 
                        lesson.status === "in_progress" ? "text-primary" : 
                        "text-muted-foreground"
                      }`} />
                    </div>
                    {getStatusIcon(lesson.status)}
                  </div>
                  <CardTitle className="text-lg">
                    <span className="text-muted-foreground text-sm font-normal">Lecția {lesson.id}:</span>
                    <br />
                    {lesson.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {lesson.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {lesson.duration}
                    </div>
                    {getStatusBadge(lesson.status)}
                  </div>

                  {/* Quiz Score */}
                  {lesson.status === "completed" && lesson.quizScore !== null && (
                    <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Scor Quiz</span>
                        <span className="font-medium text-accent">
                          {lesson.quizScore}/{lesson.quizTotal} corecte
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {lesson.status === "locked" ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Completează lecțiile anterioare
                    </Button>
                  ) : lesson.status === "completed" ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/lectii/${lesson.slug}`}>
                        Recapitulează
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full neon-glow">
                      <Link to={`/lectii/${lesson.slug}`}>
                        Continuă Lecția
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Vrei să testezi ce ai învățat?
            </h2>
            <p className="text-muted-foreground mb-6">
              Încearcă jocul de asamblare PC și pune în practică cunoștințele tale!
            </p>
            <Button asChild size="lg" className="neon-glow-green bg-accent hover:bg-accent/90">
              <Link to="/joc">
                Joacă Asamblează PC-ul
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Lessons;
