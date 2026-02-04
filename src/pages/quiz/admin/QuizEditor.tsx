import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  GripVertical,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QuizLayout from "@/components/quiz/QuizLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Answer {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  order_num: number;
}

interface Question {
  id?: string;
  question: string;
  time_limit: number;
  order_num: number;
  answers: Answer[];
}

const QuizEditor = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const isNew = quizId === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isTeacher, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !isTeacher) {
      navigate("/quiz/admin/login");
      return;
    }

    if (!isNew) {
      fetchQuiz();
    }
  }, [authLoading, user, isTeacher, isNew, quizId, navigate]);

  const fetchQuiz = async () => {
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        is_published,
        questions (
          id,
          question,
          time_limit,
          order_num,
          answers (
            id,
            answer_text,
            is_correct,
            order_num
          )
        )
      `)
      .eq("id", quizId)
      .single();

    if (error || !quiz) {
      toast({
        title: "Eroare",
        description: "Quiz-ul nu a fost găsit.",
        variant: "destructive",
      });
      navigate("/quiz/admin");
      return;
    }

    setTitle(quiz.title);
    setDescription(quiz.description || "");
    setIsPublished(quiz.is_published);
    setQuestions(
      quiz.questions
        .sort((a, b) => a.order_num - b.order_num)
        .map((q) => ({
          ...q,
          answers: q.answers.sort((a, b) => a.order_num - b.order_num),
        }))
    );
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        time_limit: 20,
        order_num: prev.length + 1,
        answers: [
          { answer_text: "", is_correct: true, order_num: 1 },
          { answer_text: "", is_correct: false, order_num: 2 },
          { answer_text: "", is_correct: false, order_num: 3 },
          { answer_text: "", is_correct: false, order_num: 4 },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  };

  const updateAnswer = (
    qIndex: number,
    aIndex: number,
    updates: Partial<Answer>
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === aIndex ? { ...a, ...updates } : a
              ),
            }
          : q
      )
    );
  };

  const setCorrectAnswer = (qIndex: number, aIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              answers: q.answers.map((a, j) => ({
                ...a,
                is_correct: j === aIndex,
              })),
            }
          : q
      )
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Titlu lipsă",
        description: "Adaugă un titlu pentru quiz.",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Întrebări lipsă",
        description: "Adaugă cel puțin o întrebare.",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast({
          title: "Întrebare incompletă",
          description: `Întrebarea ${i + 1} nu are text.`,
          variant: "destructive",
        });
        return;
      }

      const filledAnswers = q.answers.filter((a) => a.answer_text.trim());
      if (filledAnswers.length < 2) {
        toast({
          title: "Răspunsuri insuficiente",
          description: `Întrebarea ${i + 1} are nevoie de cel puțin 2 răspunsuri.`,
          variant: "destructive",
        });
        return;
      }

      const hasCorrect = q.answers.some((a) => a.is_correct && a.answer_text.trim());
      if (!hasCorrect) {
        toast({
          title: "Răspuns corect lipsă",
          description: `Întrebarea ${i + 1} nu are un răspuns corect selectat.`,
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);

    try {
      let savedQuizId = quizId;

      if (isNew) {
        // Create new quiz
        const { data: newQuiz, error } = await supabase
          .from("quizzes")
          .insert({
            title,
            description: description || null,
            is_published: isPublished,
            created_by: user!.id,
          })
          .select("id")
          .single();

        if (error) throw error;
        savedQuizId = newQuiz.id;
      } else {
        // Update existing quiz
        const { error } = await supabase
          .from("quizzes")
          .update({
            title,
            description: description || null,
            is_published: isPublished,
          })
          .eq("id", quizId);

        if (error) throw error;

        // Delete existing questions (cascade will delete answers)
        await supabase.from("questions").delete().eq("quiz_id", quizId);
      }

      // Insert questions and answers
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const { data: newQuestion, error: qError } = await supabase
          .from("questions")
          .insert({
            quiz_id: savedQuizId,
            question: q.question,
            time_limit: q.time_limit,
            order_num: i + 1,
          })
          .select("id")
          .single();

        if (qError) throw qError;

        // Insert answers
        const answersToInsert = q.answers
          .filter((a) => a.answer_text.trim())
          .map((a, j) => ({
            question_id: newQuestion.id,
            answer_text: a.answer_text,
            is_correct: a.is_correct,
            order_num: j + 1,
          }));

        const { error: aError } = await supabase
          .from("answers")
          .insert(answersToInsert);

        if (aError) throw aError;
      }

      toast({
        title: "Salvat cu succes",
        description: isNew ? "Quiz-ul a fost creat." : "Modificările au fost salvate.",
      });

      if (isNew) {
        navigate(`/quiz/admin/edit/${savedQuizId}`);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva quiz-ul.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/quiz/admin">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">
              {isNew ? "Quiz Nou" : "Editare Quiz"}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Salvează
          </Button>
        </div>

        {/* Quiz Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalii Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titlu</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titlul quiz-ului"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descriere (opțional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="O scurtă descriere..."
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="published">Publicat</Label>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Întrebări ({questions.length})
            </h2>
            <Button onClick={addQuestion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adaugă întrebare
            </Button>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">
                      Întrebarea {qIndex + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={String(q.time_limit)}
                      onValueChange={(val) =>
                        updateQuestion(qIndex, { time_limit: parseInt(val) })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 secunde</SelectItem>
                        <SelectItem value="15">15 secunde</SelectItem>
                        <SelectItem value="20">20 secunde</SelectItem>
                        <SelectItem value="30">30 secunde</SelectItem>
                        <SelectItem value="45">45 secunde</SelectItem>
                        <SelectItem value="60">60 secunde</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Întrebare</Label>
                  <Textarea
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(qIndex, { question: e.target.value })
                    }
                    placeholder="Scrie întrebarea aici..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Răspunsuri (selectează răspunsul corect)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.answers.map((a, aIndex) => (
                      <div
                        key={aIndex}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => setCorrectAnswer(qIndex, aIndex)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                            a.is_correct
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-muted-foreground/30 hover:border-green-500"
                          }`}
                        >
                          {a.is_correct && <Check className="w-4 h-4" />}
                        </button>
                        <Input
                          value={a.answer_text}
                          onChange={(e) =>
                            updateAnswer(qIndex, aIndex, {
                              answer_text: e.target.value,
                            })
                          }
                          placeholder={`Răspuns ${aIndex + 1}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Nu ai adăugat nicio întrebare încă.
                </p>
                <Button onClick={addQuestion}>
                  <Plus className="w-5 h-5 mr-2" />
                  Adaugă prima întrebare
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </QuizLayout>
  );
};

export default QuizEditor;
