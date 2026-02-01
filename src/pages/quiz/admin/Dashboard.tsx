import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Play, Pencil, Trash2, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import QuizLayout from "@/components/quiz/QuizLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateGamePin } from "@/lib/quiz-utils";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  question_count: number;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingQuiz, setStartingQuiz] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/quiz/admin/login");
      return;
    }

    if (user) {
      fetchQuizzes();
    }
  }, [user, authLoading, navigate]);

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        is_published,
        created_at,
        questions(count)
      `)
      .eq("created_by", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching quizzes:", error);
      return;
    }

    const quizzesWithCount = data?.map((quiz) => ({
      ...quiz,
      question_count: quiz.questions?.[0]?.count || 0,
    })) || [];

    setQuizzes(quizzesWithCount);
    setLoading(false);
  };

  const handleStartGame = async (quizId: string) => {
    setStartingQuiz(quizId);

    try {
      // Generate unique PIN
      let pin = generateGamePin();
      let attempts = 0;

      // Check if PIN is unique
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from("game_sessions")
          .select("id")
          .eq("game_pin", pin)
          .eq("status", "waiting")
          .maybeSingle();

        if (!existing) break;
        pin = generateGamePin();
        attempts++;
      }

      // Create game session
      const { data: session, error } = await supabase
        .from("game_sessions")
        .insert({
          quiz_id: quizId,
          game_pin: pin,
          created_by: user?.id,
          status: "waiting",
        })
        .select("game_pin")
        .single();

      if (error) throw error;

      navigate(`/quiz/admin/control/${session.game_pin}`);
    } catch (error) {
      console.error("Error starting game:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut porni jocul. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setStartingQuiz(null);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);

      if (error) throw error;

      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      toast({
        title: "Quiz șters",
        description: "Quiz-ul a fost șters cu succes.",
      });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge quiz-ul.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/quiz");
  };

  if (authLoading || loading) {
    return (
      <QuizLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Profesor</h1>
            <p className="text-muted-foreground">
              Gestionează quiz-urile și sesiunile de joc
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link to="/quiz/admin/edit/new">
                <Plus className="w-5 h-5 mr-2" />
                Quiz Nou
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nu ai creat niciun quiz încă.
              </p>
              <Button asChild>
                <Link to="/quiz/admin/edit/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Creează primul quiz
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{quiz.title}</CardTitle>
                      <CardDescription>
                        {quiz.description || "Fără descriere"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {quiz.question_count} întrebări
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleStartGame(quiz.id)}
                      disabled={
                        quiz.question_count === 0 || startingQuiz === quiz.id
                      }
                      className="gap-2"
                    >
                      {startingQuiz === quiz.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Începe Joc
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/quiz/admin/edit/${quiz.id}`}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editează
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Șterge quiz-ul?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Această acțiune nu poate fi anulată. Quiz-ul și
                            toate întrebările vor fi șterse permanent.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anulează</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Șterge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </QuizLayout>
  );
};

export default Dashboard;
